import { FFmpeg } from '@ffmpeg/ffmpeg'
import { toBlobURL } from '@ffmpeg/util'

// Single-thread core (no SharedArrayBuffer / cross-origin isolation needed).
const BASE = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm'

let instance: FFmpeg | null = null
let loadPromise: Promise<FFmpeg> | null = null

/**
 * Lazily load a single shared ffmpeg.wasm instance (~30MB, fetched from CDN on
 * first use, then cached). Used by the video/audio tools.
 */
export async function getFFmpeg(): Promise<FFmpeg> {
  if (instance) return instance
  if (!loadPromise) {
    loadPromise = (async () => {
      const ff = new FFmpeg()
      await ff.load({
        coreURL: await toBlobURL(`${BASE}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${BASE}/ffmpeg-core.wasm`, 'application/wasm'),
      })
      instance = ff
      return ff
    })()
  }
  return loadPromise
}

/** mm:ss(.ms) formatter for ffmpeg -ss / -to args. */
export function toClock(seconds: number): string {
  const s = Math.max(0, seconds)
  const hh = Math.floor(s / 3600)
  const mm = Math.floor((s % 3600) / 60)
  const ss = (s % 60).toFixed(2)
  return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}:${ss.padStart(5, '0')}`
}
