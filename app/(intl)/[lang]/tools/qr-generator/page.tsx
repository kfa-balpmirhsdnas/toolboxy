'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'

const tool = getToolBySlug('qr-generator')!

type TitlePos = 'none' | 'top' | 'center'

// 중앙 글자 모드는 QR 일부가 가려지므로 오류 정정을 H(30%)로 올려 스캔 가능성을 지킨다.
function qrUrl(text: string, size: number, eccH: boolean) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(text)}&format=png&margin=1${eccH ? '&ecc=H' : ''}`
}

// 주어진 폭에 맞는 최대 폰트 크기 탐색
function fitFont(ctx: CanvasRenderingContext2D, text: string, maxW: number, start: number, min: number) {
  let fs = start
  while (fs > min) {
    ctx.font = `bold ${fs}px Pretendard, -apple-system, sans-serif`
    if (ctx.measureText(text).width <= maxW) break
    fs -= 2
  }
  return fs
}

// QR PNG + 타이틀 합성 → dataURL (미리보기·다운로드 공용)
async function compose(text: string, size: number, title: string, pos: TitlePos): Promise<string> {
  const img = new Image()
  img.crossOrigin = 'anonymous'
  img.src = qrUrl(text, size, pos === 'center' && !!title.trim())
  await new Promise((res, rej) => { img.onload = res; img.onerror = rej })
  const tt = title.trim()
  const cv = document.createElement('canvas')
  const band = pos === 'top' && tt ? Math.max(44, Math.round(size * 0.16)) : 0
  cv.width = size
  cv.height = size + band
  const ctx = cv.getContext('2d')!
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, cv.width, cv.height)
  ctx.drawImage(img, 0, band, size, size)
  if (tt && pos === 'top') {
    ctx.fillStyle = '#dc2626' // 타이틀은 빨간색
    const fs = fitFont(ctx, tt, size * 0.9, Math.round(band * 0.52), 12)
    ctx.font = `bold ${fs}px Pretendard, -apple-system, sans-serif`
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    ctx.fillText(tt, size / 2, band / 2 + 2)
  } else if (tt && pos === 'center') {
    // 중앙: 흰 알약 배경 + 큰 글자 (ECC H 기준 안전 면적 ~25% 이내)
    const fs = fitFont(ctx, tt, size * 0.5, Math.round(size * 0.14), 12)
    ctx.font = `bold ${fs}px Pretendard, -apple-system, sans-serif`
    const w = ctx.measureText(tt).width
    const padX = fs * 0.5, padY = fs * 0.34
    const bw = w + padX * 2, bh = fs + padY * 2
    const x = (size - bw) / 2, y = band + (size - bh) / 2
    ctx.fillStyle = '#ffffff'
    ctx.beginPath()
    ctx.roundRect(x, y, bw, bh, bh / 2)
    ctx.fill()
    ctx.strokeStyle = '#e5e7eb'; ctx.lineWidth = Math.max(1, size / 256); ctx.stroke()
    ctx.fillStyle = '#dc2626' // 타이틀은 빨간색
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    ctx.fillText(tt, size / 2, band + size / 2 + 1)
  }
  return cv.toDataURL('image/png')
}

export default function QrGeneratorPage({ params }: { params: { lang: string } }) {
  const t = useTranslations('toolui')
  const [input, setInput] = useState('')
  const [size, setSize] = useState(1024)
  const [title, setTitle] = useState('')
  const [titlePos, setTitlePos] = useState<TitlePos>('none')
  const [generated, setGenerated] = useState('')
  const [preview, setPreview] = useState('')
  const [error, setError] = useState(false)
  const [downloaded, setDownloaded] = useState(false)

  function generate() { if (!input.trim()) return; setGenerated(input.trim()); setDownloaded(false) }

  // 합성 미리보기 — 입력·타이틀·크기 변경에 반응
  useEffect(() => {
    if (!generated) return
    let live = true
    setError(false)
    compose(generated, size, title, titlePos)
      .then((u) => { if (live) setPreview(u) })
      .catch(() => { if (live) setError(true) })
    return () => { live = false }
  }, [generated, size, title, titlePos])

  function download() {
    if (!preview) return
    const a = document.createElement('a')
    a.href = preview; a.download = 'qr-code.png'; a.click()
    setDownloaded(true); setTimeout(() => setDownloaded(false), 2000)
  }

  const chip = (on: boolean) =>
    'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ' +
    (on ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200')

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">{t('qg_label')}</label>
          <textarea value={input} onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); generate() } }}
            placeholder={t('qg_ph')} rows={3}
            className="w-full p-4 border border-gray-200 rounded-xl resize-none text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-400" />
        </div>

        {/* 타이틀 옵션 — 상단 밴드 or 정중앙 큰 글자 */}
        <div className="rounded-xl border border-gray-200 p-3 space-y-2.5">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-sm text-gray-600 mr-1">{t('qg_title_pos')}</span>
            {(['none', 'top', 'center'] as TitlePos[]).map((p) => (
              <button key={p} onClick={() => setTitlePos(p)} className={chip(titlePos === p)}>{t('qg_pos_' + p)}</button>
            ))}
          </div>
          {titlePos !== 'none' && (
            <>
              <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={30}
                placeholder={t('qg_title_ph')}
                className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
              {titlePos === 'center' && <p className="text-[11px] text-gray-400">{t('qg_center_note')}</p>}
            </>
          )}
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600 shrink-0">{t('qg_size')}</label>
            <select value={size} onChange={(e) => setSize(Number(e.target.value))} className="text-sm border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-400">
              {[128, 256, 512, 1024].map(s => <option key={s} value={s}>{s}×{s}px</option>)}
            </select>
          </div>
          <button onClick={generate} disabled={!input.trim()} className="bg-brand-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-brand-700 transition-colors disabled:opacity-40">{t('qg_generate')}</button>
        </div>

        {generated && (
          <div className="flex flex-col items-center gap-4 pt-2">
            {error ? (
              <p className="text-sm rounded-xl bg-rose-50 border border-rose-200 text-rose-600 px-4 py-3">{t('qg_error')}</p>
            ) : preview ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              /* 미리보기는 화면용으로 축소 표시 — 다운로드는 선택한 원본 해상도 */
              <img src={preview} alt="QR Code" className="rounded-xl border border-gray-200 shadow-sm w-64 sm:w-80 max-w-full h-auto" />
            ) : null}
            <button onClick={download} disabled={!preview} className="flex items-center gap-2 bg-gray-900 text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-gray-800 transition-colors disabled:opacity-40">
              {downloaded ? t('qg_downloaded') : t('qg_download')}
            </button>
            <p className="text-xs text-gray-400 text-center max-w-xs break-all">{generated}</p>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
