'use client'

import { useEffect, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import ToolIcon from '@/components/tools/ToolIcon'
import { getToolBySlug } from '@/lib/tools/registry'
import { getFFmpeg, toClock } from '@/lib/ffmpeg'
import { trackToolUsed, trackToolDownload } from '@/lib/gtag'

const tool = getToolBySlug('mp4-to-mp3')!

const ACCEPT = '.mp4,.mov,.webm,.mkv,.avi,.m4v,video/*'
const EXT_RE = /\.(mp4|mov|webm|mkv|avi|m4v)$/i
const BITRATES = [128, 192, 256, 320]
// Recommended per-file size (soft warning only — never a hard block).
const WARN_MB_DESKTOP = 500
const WARN_MB_MOBILE = 150

const fmtBytes = (b: number) => (b < 1024 ? b + ' B' : b < 1048576 ? (b / 1024).toFixed(0) + ' KB' : (b / 1048576).toFixed(1) + ' MB')

// "mm:ss" / "hh:mm:ss" / "90" → seconds (NaN when malformed).
function parseClock(v: string): number {
  const s = v.trim()
  if (!s) return NaN
  if (!/^\d{1,3}(:\d{1,2}){0,2}(\.\d+)?$/.test(s)) return NaN
  return s.split(':').reduce((acc, p) => acc * 60 + parseFloat(p), 0)
}

// Read a video's duration from its metadata (no decode). 0 when unreadable.
function readDuration(f: File): Promise<number> {
  return new Promise((res) => {
    const v = document.createElement('video')
    const url = URL.createObjectURL(f)
    const done = (d: number) => { URL.revokeObjectURL(url); res(Number.isFinite(d) && d > 0 ? d : 0) }
    v.preload = 'metadata'
    v.onloadedmetadata = () => done(v.duration)
    v.onerror = () => done(0)
    v.src = url
  })
}

type QStatus = 'wait' | 'run' | 'done' | 'error'
type QItem = { id: string; file: File; dur: number; status: QStatus; pct: number; outUrl: string; outSize: number; err: string }

export default function Mp4ToMp3Page({ params }: { params: { lang: string } }) {
  const t = useTranslations('toolui')
  const [items, setItems] = useState<QItem[]>([])
  const [br, setBr] = useState(192)
  const [sr, setSr] = useState('44100')
  const [ch, setCh] = useState('2')
  const [norm, setNorm] = useState(false)
  const [trimA, setTrimA] = useState('')
  const [trimB, setTrimB] = useState('')
  const [advOpen, setAdvOpen] = useState(false)
  const [fadeIn, setFadeIn] = useState('')
  const [fadeOut, setFadeOut] = useState('')
  const [id3Title, setId3Title] = useState('')
  const [id3Artist, setId3Artist] = useState('')
  const [id3Album, setId3Album] = useState('')
  const [nameRule, setNameRule] = useState('')
  const [engine, setEngine] = useState<'' | 'loading'>('')
  const [busy, setBusy] = useState(false)
  const [optErr, setOptErr] = useState('')
  const [isMobile, setIsMobile] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const listenersOn = useRef(false)
  const pctTarget = useRef('')           // id of the item the ffmpeg progress event belongs to
  const logTail = useRef<string[]>([])   // last log lines, to tell "no audio stream" from other failures
  const itemsRef = useRef(items); itemsRef.current = items

  useEffect(() => { setIsMobile(/Android|iPhone|iPad|Mobile/i.test(navigator.userAgent)) }, [])
  // Object URLs live for the page's lifetime (kept for re-download); release on unmount.
  useEffect(() => () => { itemsRef.current.forEach((it) => it.outUrl && URL.revokeObjectURL(it.outUrl)) }, [])

  const warnMB = isMobile ? WARN_MB_MOBILE : WARN_MB_DESKTOP
  const hasBig = items.some((it) => it.file.size > warnMB * 1048576)
  const doneItems = items.filter((it) => it.status === 'done')

  function patch(id: string, p: Partial<QItem>) { setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...p } : it))) }

  function addFiles(list: FileList | File[]) {
    const vids = Array.from(list).filter((f) => EXT_RE.test(f.name) || f.type.startsWith('video/'))
    if (!vids.length) return
    trackToolUsed('mp4-to-mp3')
    const fresh: QItem[] = vids.map((f) => ({ id: f.name + '|' + f.size + '|' + Math.random().toString(36).slice(2, 8), file: f, dur: 0, status: 'wait', pct: 0, outUrl: '', outSize: 0, err: '' }))
    setItems((prev) => [...prev, ...fresh])
    fresh.forEach(async (it) => { const d = await readDuration(it.file); if (d) patch(it.id, { dur: d }) })
  }

  function removeItem(id: string) {
    setItems((prev) => { const it = prev.find((x) => x.id === id); if (it?.outUrl) URL.revokeObjectURL(it.outUrl); return prev.filter((x) => x.id !== id) })
  }

  function outName(f: File): string {
    const base = f.name.replace(/\.[^.]+$/, '')
    const rule = nameRule.trim()
    if (!rule) return base + '.mp3'
    const n = rule.includes('*') ? rule.replace(/\*/g, base) : rule
    return /\.mp3$/i.test(n) ? n : n + '.mp3'
  }

  // Assemble the ffmpeg args for one file from the current options.
  function buildArgs(inName: string, dur: number): string[] | { err: string } {
    const a = parseClock(trimA); const b = parseClock(trimB)
    if ((trimA.trim() && isNaN(a)) || (trimB.trim() && isNaN(b)) || (!isNaN(a) && !isNaN(b) && b <= a)) return { err: t('vtm_trim_bad') }
    const args = ['-i', inName]
    if (!isNaN(a)) args.push('-ss', toClock(a))
    if (!isNaN(b)) args.push('-to', toClock(b))
    args.push('-vn', '-ar', sr, '-ac', ch)
    const filters: string[] = []
    if (norm) filters.push('loudnorm')
    const fi = parseFloat(fadeIn); const fo = parseFloat(fadeOut)
    if (fi > 0) filters.push(`afade=t=in:st=0:d=${fi}`)
    if (fo > 0) {
      // Fade-out needs the OUTPUT length: source duration bounded by the trim window.
      const end = !isNaN(b) ? b : dur
      const start = !isNaN(a) ? a : 0
      const outDur = end - start
      if (outDur > 0) filters.push(`afade=t=out:st=${Math.max(0, outDur - fo).toFixed(2)}:d=${fo}`)
    }
    if (filters.length) args.push('-af', filters.join(','))
    args.push('-b:a', br + 'k')
    if (id3Title.trim()) args.push('-metadata', 'title=' + id3Title.trim())
    if (id3Artist.trim()) args.push('-metadata', 'artist=' + id3Artist.trim())
    if (id3Album.trim()) args.push('-metadata', 'album=' + id3Album.trim())
    if (id3Title.trim() || id3Artist.trim() || id3Album.trim()) args.push('-id3v2_version', '3')
    args.push('out.mp3')
    return args
  }

  // Convert the whole queue sequentially (single-thread core → no parallelism).
  async function convertAll() {
    if (busy || !items.length) return
    setOptErr('')
    // Validate the trim window once before touching the engine.
    const probe = buildArgs('probe', 60)
    if ('err' in probe) { setOptErr(probe.err); return }
    setBusy(true)
    // Reset every item so changed options re-convert previous results too.
    setItems((prev) => prev.map((it) => ({ ...it, status: 'wait', pct: 0, err: '', outUrl: (it.outUrl && URL.revokeObjectURL(it.outUrl), ''), outSize: 0 })))
    try {
      setEngine('loading')
      const { fetchFile } = await import('@ffmpeg/util')
      const ff = await getFFmpeg()
      setEngine('')
      if (!listenersOn.current) {
        ff.on('progress', ({ progress }) => { const id = pctTarget.current; if (id) patch(id, { pct: Math.min(99, Math.max(0, Math.round(progress * 100))) }) })
        ff.on('log', ({ message }) => { logTail.current.push(message); if (logTail.current.length > 40) logTail.current.shift() })
        listenersOn.current = true
      }
      for (const it of itemsRef.current) {
        patch(it.id, { status: 'run', pct: 0 }); pctTarget.current = it.id; logTail.current = []
        const ext = (it.file.name.split('.').pop() || 'mp4').toLowerCase()
        const inName = 'in.' + ext
        try {
          const args = buildArgs(inName, it.dur)
          if ('err' in args) throw new Error(args.err)
          await ff.writeFile(inName, await fetchFile(it.file))
          const rc = await ff.exec(args)
          if (rc !== 0) throw new Error('exec:' + rc)
          const data = await ff.readFile('out.mp3')
          const blob = new Blob([data as unknown as BlobPart], { type: 'audio/mpeg' })
          patch(it.id, { status: 'done', pct: 100, outUrl: URL.createObjectURL(blob), outSize: blob.size })
        } catch (e) {
          console.error(e)
          const noAudio = logTail.current.some((l) => /does not contain any stream|matches no streams|Stream map .* matches no/i.test(l))
          patch(it.id, { status: 'error', err: noAudio ? t('vtm_no_audio') : t('md_error') })
        } finally {
          pctTarget.current = ''
          try { await ff.deleteFile(inName) } catch { /* ignore */ }
          try { await ff.deleteFile('out.mp3') } catch { /* ignore */ }
        }
      }
      trackToolDownload('mp4-to-mp3', 'mp3')
    } catch (e) {
      console.error(e); setEngine(''); setOptErr(t('md_error'))
    } finally {
      setBusy(false)
    }
  }

  function download(it: QItem) {
    if (!it.outUrl) return
    const a = document.createElement('a')
    a.href = it.outUrl; a.download = outName(it.file); a.click()
  }

  async function downloadZip() {
    const done = itemsRef.current.filter((it) => it.status === 'done' && it.outUrl)
    if (done.length < 2) return
    const { zipSync } = await import('fflate')
    const entries: Record<string, Uint8Array> = {}
    for (const it of done) {
      let n = outName(it.file); let k = 1
      while (entries[n]) n = outName(it.file).replace(/\.mp3$/i, '') + ' (' + k++ + ').mp3'
      entries[n] = new Uint8Array(await (await fetch(it.outUrl)).arrayBuffer())
    }
    const zipped = zipSync(entries)
    const blob = new Blob([zipped as unknown as BlobPart], { type: 'application/zip' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob); a.download = 'mp3.zip'; a.click()
    setTimeout(() => URL.revokeObjectURL(a.href), 30000)
    trackToolDownload('mp4-to-mp3', 'zip')
  }

  const chip = (on: boolean) => 'py-2 rounded-xl text-sm font-bold transition ' + (on ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200')
  const inputCls = 'w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-brand-400'
  const statusIcon = (s: QStatus) => (s === 'done' ? '✅' : s === 'error' ? '⚠️' : s === 'run' ? '🔄' : '⏳')

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="space-y-4">
        {/* Drop zone — stays visible so more files can be queued anytime */}
        <div onClick={() => inputRef.current?.click()}
          onDrop={(e) => { e.preventDefault(); addFiles(e.dataTransfer.files) }} onDragOver={(e) => e.preventDefault()}
          className={'border-2 border-dashed border-gray-300 rounded-xl text-center cursor-pointer hover:border-brand-400 hover:bg-brand-50 transition-colors ' + (items.length ? 'p-4' : 'p-8')}>
          <input ref={inputRef} type="file" accept={ACCEPT} multiple className="hidden"
            onChange={(e) => { if (e.target.files) addFiles(e.target.files); e.currentTarget.value = '' }} onClick={(e) => e.stopPropagation()} />
          {!items.length && <p className="text-4xl mb-2">🎬→🎵</p>}
          <p className="text-sm font-medium text-gray-600">{t('vtm_drop')}</p>
          <p className="text-xs text-gray-400 mt-1">MP4 · MOV · WEBM · MKV · AVI · M4V</p>
          {!items.length && (
            <div className="flex justify-center mt-4">
              <button type="button" onClick={(e) => { e.stopPropagation(); inputRef.current?.click() }} className="px-4 py-2 bg-brand-600 text-white text-sm font-semibold rounded-xl hover:bg-brand-700">{t('ui_pick_files')}</button>
            </div>
          )}
        </div>

        {/* Options — dimmed until a file is queued (file-tool toolbar convention) */}
        <div className={'space-y-3 rounded-xl border border-gray-200 p-3 ' + (!items.length ? 'opacity-50 pointer-events-none select-none' : '')}>
          <div>
            <label className="block text-xs text-gray-500 mb-1">{t('vtm_bitrate')}</label>
            <div className="grid grid-cols-4 gap-2">
              {BITRATES.map((k) => (
                <button key={k} onClick={() => setBr(k)} disabled={busy} className={chip(br === k)}>{k}k</button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">{t('vtm_sr')}</label>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => setSr('44100')} disabled={busy} className={chip(sr === '44100')}>44.1k</button>
                <button onClick={() => setSr('48000')} disabled={busy} className={chip(sr === '48000')}>48k</button>
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">{t('vtm_ch')}</label>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => setCh('2')} disabled={busy} className={chip(ch === '2')}>{t('vtm_stereo')}</button>
                <button onClick={() => setCh('1')} disabled={busy} className={chip(ch === '1')}>{t('vtm_mono')}</button>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 items-end">
            <div>
              <label className="block text-xs text-gray-500 mb-1">{t('vtm_trim')}</label>
              <div className="flex items-center gap-1.5">
                <input value={trimA} onChange={(e) => setTrimA(e.target.value)} placeholder="00:00" inputMode="numeric" disabled={busy} className={inputCls + ' text-center'} aria-label={t('vtm_trim_start')} />
                <span className="text-gray-400 text-sm">–</span>
                <input value={trimB} onChange={(e) => setTrimB(e.target.value)} placeholder={items[0]?.dur ? toClock(items[0].dur).slice(3, 8) : 'mm:ss'} inputMode="numeric" disabled={busy} className={inputCls + ' text-center'} aria-label={t('vtm_trim_end')} />
              </div>
            </div>
            <button onClick={() => setNorm((v) => !v)} disabled={busy} className={chip(norm)}>{t('vtm_norm')} {norm ? 'ON' : 'OFF'}</button>
          </div>

          {/* Advanced (fades, ID3, output name) — collapsed by default */}
          <div className="border-t border-gray-100 pt-2">
            <button onClick={() => setAdvOpen((v) => !v)} className="w-full flex items-center justify-between text-sm text-gray-500 hover:text-gray-700 py-1">
              <span>{t('vtm_adv')}</span><span className={'transition-transform ' + (advOpen ? 'rotate-180' : '')}>▾</span>
            </button>
            {advOpen && (
              <div className="space-y-3 pt-2">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">{t('vtm_fade_in')}</label>
                    <input value={fadeIn} onChange={(e) => setFadeIn(e.target.value)} placeholder="0" inputMode="decimal" disabled={busy} className={inputCls} />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">{t('vtm_fade_out')}</label>
                    <input value={fadeOut} onChange={(e) => setFadeOut(e.target.value)} placeholder="0" inputMode="decimal" disabled={busy} className={inputCls} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">{t('vtm_id3')}</label>
                  <div className="grid grid-cols-3 gap-2">
                    <input value={id3Title} onChange={(e) => setId3Title(e.target.value)} placeholder={t('vtm_id3_title')} disabled={busy} className={inputCls} />
                    <input value={id3Artist} onChange={(e) => setId3Artist(e.target.value)} placeholder={t('vtm_id3_artist')} disabled={busy} className={inputCls} />
                    <input value={id3Album} onChange={(e) => setId3Album(e.target.value)} placeholder={t('vtm_id3_album')} disabled={busy} className={inputCls} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">{t('vtm_name_rule')}</label>
                  <input value={nameRule} onChange={(e) => setNameRule(e.target.value)} placeholder="*.mp3" disabled={busy} className={inputCls} />
                </div>
              </div>
            )}
          </div>
        </div>

        {engine === 'loading' && <p className="text-sm text-brand-600 text-center">{t('md_loading')}</p>}
        {optErr && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl p-3">{optErr}</p>}
        {hasBig && <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl p-2.5">{t('vtm_big_warn', { mb: warnMB })}</p>}

        {items.length > 0 && (
          <>
            <div className="flex gap-2">
              <button onClick={convertAll} disabled={busy} className="px-6 py-2.5 bg-brand-600 text-white text-sm font-semibold rounded-xl hover:bg-brand-700 disabled:opacity-40">
                {doneItems.length ? t('vtm_reconvert') : t('vtm_convert')}
              </button>
              {doneItems.length >= 2 && (
                <button onClick={downloadZip} disabled={busy} className="px-4 py-2.5 bg-green-600 text-white text-sm font-semibold rounded-xl hover:bg-green-700 disabled:opacity-40">{t('vtm_zip')}</button>
              )}
              <button onClick={() => { itemsRef.current.forEach((it) => it.outUrl && URL.revokeObjectURL(it.outUrl)); setItems([]) }} disabled={busy}
                className="ml-auto px-4 py-2 text-sm text-gray-500 hover:text-gray-700 inline-flex items-center justify-center disabled:opacity-40" aria-label="reset"><ToolIcon name="refresh" className="w-4 h-4" /></button>
            </div>

            {/* Queue — standard list style (bordered container + header + divided rows) */}
            <div className="rounded-xl border border-gray-200 overflow-hidden">
              <div className="flex items-center justify-between px-3 py-2 bg-gray-50 text-xs text-gray-500">
                <span>{t('vtm_count', { n: items.length })}</span>
                <span>{fmtBytes(items.reduce((s, it) => s + it.file.size, 0))}</span>
              </div>
              <div className="divide-y divide-gray-100">
                {items.map((it) => (
                  <div key={it.id} className={'px-3 py-2.5 ' + (it.status === 'run' ? 'bg-brand-50/60' : '')}>
                    <div className="flex items-center gap-2">
                      <span className="text-base shrink-0">{statusIcon(it.status)}</span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-gray-700 truncate">{it.file.name}</p>
                        <p className="text-xs text-gray-400">
                          {fmtBytes(it.file.size)}
                          {it.dur > 0 && <span> · {toClock(it.dur).slice(3, 8)}</span>}
                          {it.status === 'done' && <span className="text-green-600"> → {fmtBytes(it.outSize)}</span>}
                          {it.file.size > warnMB * 1048576 && <span className="text-amber-600"> ⚠</span>}
                        </p>
                      </div>
                      {it.status === 'done' ? (
                        <button onClick={() => download(it)} className="shrink-0 px-3 py-1.5 bg-green-600 text-white text-xs font-semibold rounded-lg hover:bg-green-700">MP3</button>
                      ) : it.status === 'run' ? (
                        <span className="shrink-0 text-xs font-semibold text-brand-600 tabular-nums">{it.pct}%</span>
                      ) : (
                        <button onClick={() => removeItem(it.id)} disabled={busy} className="shrink-0 p-1.5 text-gray-400 hover:text-red-500 disabled:opacity-40" aria-label="remove">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="w-4 h-4"><path d="M18 6 6 18M6 6l12 12" /></svg>
                        </button>
                      )}
                    </div>
                    {it.status === 'run' && (
                      <div className="mt-1.5 h-1 rounded-full bg-gray-100 overflow-hidden">
                        <div className="h-full bg-brand-500 transition-all" style={{ width: it.pct + '%' }} />
                      </div>
                    )}
                    {it.status === 'error' && <p className="mt-1 text-xs text-red-600">{it.err}</p>}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Privacy banner — files never leave the browser */}
        <div className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm text-emerald-800">
          <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" /><path d="m9 12 2 2 4-4" /></svg>
          <span>{t('md_note_local')}</span>
        </div>

        {/* Related tools */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
          {([['video-to-audio', '🎬', t('vtm_rel_extract')], ['audio-converter', '🎵', t('vtm_rel_convert')], ['video-trimmer', '✂️', t('vtm_rel_trim')]] as const).map(([slug, icon, label]) => (
            <a key={slug} href={`/${params.lang}/tools/${slug}`} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 hover:border-brand-300"><span>{icon}</span><span>{label}</span></a>
          ))}
        </div>
      </div>
    </ToolLayout>
  )
}
