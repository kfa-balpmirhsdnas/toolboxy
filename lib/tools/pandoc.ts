// Pandoc WASM engine (document conversion suite: docx→odt today, more formats later).
// Adapted from pandoc's official wasm/pandoc.js (MIT, © 2025 Tweag I/O + John MacFarlane) —
// the same wrapper that powers https://pandoc.org/app. The 56MB official 3.10 binary is
// self-hosted at /pandoc.wasm (copied out of the pandoc-wasm npm package at build time),
// lazily fetched+instantiated ONCE on first convert. Single-threaded WASI reactor — no
// SharedArrayBuffer / COOP / COEP needed (AdSense-safe).
import { WASI, OpenFile, File as WasiFile, ConsoleStdout, PreopenDirectory } from '@bjorn3/browser_wasi_shim'

type PandocOptions = Record<string, unknown>
export type PandocResult = { stdout: string; stderr: string; warnings: unknown[]; output: Blob | null }

type Engine = {
  instance: WebAssembly.Instance
  fileSystem: Map<string, WasiFile>
}

let enginePromise: Promise<Engine> | null = null

/** Drop a failed load so the UI's retry button can attempt a fresh fetch. */
export function resetPandoc(): void { enginePromise = null }

function loadEngine(): Promise<Engine> {
  if (!enginePromise) {
    enginePromise = (async () => {
      const args = ['pandoc.wasm', '+RTS', '-H64m', '-RTS']
      const fileSystem = new Map<string, WasiFile>()
      const fds = [
        new OpenFile(new WasiFile(new Uint8Array(), { readonly: true })),
        ConsoleStdout.lineBuffered(() => { /* WASI stdout — unused */ }),
        ConsoleStdout.lineBuffered((msg: string) => console.warn('[pandoc]', msg)),
        new PreopenDirectory('/', fileSystem),
      ]
      const wasi = new WASI(args, [], fds, { debug: false })
      let module_: WebAssembly.WebAssemblyInstantiatedSource
      const imports = { wasi_snapshot_preview1: wasi.wasiImport }
      try {
        module_ = await WebAssembly.instantiateStreaming(fetch('/pandoc.wasm'), imports)
      } catch {
        // streaming can fail on odd MIME setups — fall back to a buffered instantiate
        const buf = await (await fetch('/pandoc.wasm')).arrayBuffer()
        module_ = await WebAssembly.instantiate(buf, imports)
      }
      const instance = module_.instance
      const exp = instance.exports as unknown as {
        memory: WebAssembly.Memory
        __wasm_call_ctors: () => void
        malloc: (n: number) => number
        hs_init_with_rtsopts: (argc: number, argv: number) => void
      }
      wasi.initialize(instance as Parameters<WASI['initialize']>[0])
      exp.__wasm_call_ctors()
      // GHC RTS init with argc/argv written into wasm memory (exactly as the official wrapper does)
      const view = () => new DataView(exp.memory.buffer)
      const argcPtr = exp.malloc(4)
      view().setUint32(argcPtr, args.length, true)
      const argv = exp.malloc(4 * (args.length + 1))
      for (let i = 0; i < args.length; i++) {
        const arg = exp.malloc(args[i].length + 1)
        new TextEncoder().encodeInto(args[i], new Uint8Array(exp.memory.buffer, arg, args[i].length))
        view().setUint8(arg + args[i].length, 0)
        view().setUint32(argv + 4 * i, arg, true)
      }
      view().setUint32(argv + 4 * args.length, 0, true)
      const argvPtr = exp.malloc(4)
      view().setUint32(argvPtr, argv, true)
      exp.hs_init_with_rtsopts(argcPtr, argvPtr)
      return { instance, fileSystem }
    })().catch((e) => { enginePromise = null; throw e })
  }
  return enginePromise
}

/**
 * Run a pandoc conversion. `options` follows pandoc's defaults-file format
 * (from/to/output-file/input-files…); `files` maps virtual filenames → contents.
 */
export async function pandocConvert(options: PandocOptions, stdin: string | null, files: Record<string, Blob>): Promise<PandocResult> {
  const { instance, fileSystem } = await loadEngine()
  const exp = instance.exports as unknown as {
    memory: WebAssembly.Memory
    malloc: (n: number) => number
    convert: (ptr: number, len: number) => void
  }
  const optsBytes = new TextEncoder().encode(JSON.stringify(options))
  const optsPtr = exp.malloc(optsBytes.length)
  new Uint8Array(exp.memory.buffer, optsPtr, optsBytes.length).set(optsBytes)

  fileSystem.clear()
  const inFile = new WasiFile(new Uint8Array(), { readonly: true })
  const outFile = new WasiFile(new Uint8Array(), { readonly: false })
  const errFile = new WasiFile(new Uint8Array(), { readonly: false })
  const warnFile = new WasiFile(new Uint8Array(), { readonly: false })
  fileSystem.set('stdin', inFile)
  fileSystem.set('stdout', outFile)
  fileSystem.set('stderr', errFile)
  fileSystem.set('warnings', warnFile)
  for (const name of Object.keys(files)) {
    fileSystem.set(name, new WasiFile(new Uint8Array(await files[name].arrayBuffer()), { readonly: true }))
  }
  const outName = options['output-file'] as string | undefined
  if (outName) fileSystem.set(outName, new WasiFile(new Uint8Array(), { readonly: false }))
  if (stdin) inFile.data = new TextEncoder().encode(stdin)

  exp.convert(optsPtr, optsBytes.length)

  const dec = new TextDecoder('utf-8')
  let warnings: unknown[] = []
  try { const w = dec.decode(warnFile.data); if (w) warnings = JSON.parse(w) } catch { /* ignore */ }
  const outData = outName ? fileSystem.get(outName)?.data : undefined
  return {
    stdout: dec.decode(outFile.data),
    stderr: dec.decode(errFile.data),
    warnings,
    output: outData && outData.length ? new Blob([outData as unknown as BlobPart]) : null,
  }
}

/** Generalized single-file document conversion (the whole future converter suite rides on this). */
export async function convertDoc(input: Blob, from: string, to: string): Promise<Blob> {
  const inName = 'input.' + from
  const outName = 'output.' + to
  const res = await pandocConvert(
    { from, to, 'output-file': outName, 'input-files': [inName] },
    null,
    { [inName]: input },
  )
  if (!res.output) throw new Error(res.stderr || 'pandoc produced no output')
  return res.output
}
