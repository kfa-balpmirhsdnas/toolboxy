'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'

const tool = getToolBySlug('qr-generator')!

type TitlePos = 'none' | 'top' | 'center'
// 프리셋 QR 도구 4종(wifi/email/phone/vcard) 통합 — 유형 탭으로 데이터 문자열만 다르게 조립
type QrType = 'text' | 'wifi' | 'email' | 'phone' | 'vcard'

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

const inputCls = 'w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400'

export default function QrGeneratorPage({ params }: { params: { lang: string } }) {
  const t = useTranslations('toolui')
  const [qrType, setQrType] = useState<QrType>('text')
  const [input, setInput] = useState('')
  // wifi
  const [ssid, setSsid] = useState(''); const [wifiPw, setWifiPw] = useState('')
  const [enc, setEnc] = useState<'WPA' | 'WEP' | 'nopass'>('WPA'); const [hidden, setHidden] = useState(false)
  // email
  const [to, setTo] = useState(''); const [subject, setSubject] = useState(''); const [body, setBody] = useState('')
  // phone
  const [phoneMode, setPhoneMode] = useState<'call' | 'sms'>('call')
  const [number, setNumber] = useState(''); const [message, setMessage] = useState('')
  // vcard
  const [vName, setVName] = useState(''); const [vOrg, setVOrg] = useState('')
  const [vPhone, setVPhone] = useState(''); const [vEmail, setVEmail] = useState(''); const [vUrl, setVUrl] = useState('')

  const [size, setSize] = useState(1024)
  const [title, setTitle] = useState('')
  const [titlePos, setTitlePos] = useState<TitlePos>('none')
  const [generated, setGenerated] = useState('')
  const [preview, setPreview] = useState('')
  const [error, setError] = useState(false)
  const [downloaded, setDownloaded] = useState(false)

  // 유형별 QR 데이터 문자열 조립 (기존 프리셋 도구들과 동일 포맷)
  function payload(): string {
    const esc = (s: string) => s.replace(/([\\;,:"])/g, '\\$1')
    switch (qrType) {
      case 'wifi':
        return ssid.trim()
          ? `WIFI:T:${enc};S:${esc(ssid.trim())};${enc === 'nopass' ? '' : `P:${esc(wifiPw)};`}${hidden ? 'H:true;' : ''};`
          : ''
      case 'email': {
        const qs = [subject && 'subject=' + encodeURIComponent(subject), body && 'body=' + encodeURIComponent(body)].filter(Boolean).join('&')
        return to.trim() ? `mailto:${to.trim()}${qs ? '?' + qs : ''}` : ''
      }
      case 'phone': {
        const clean = number.replace(/[^\d+]/g, '')
        if (!clean) return ''
        return phoneMode === 'call' ? `tel:${clean}` : `SMSTO:${clean}${message ? ':' + message : ''}`
      }
      case 'vcard':
        return (vName.trim() || vPhone.trim())
          ? ['BEGIN:VCARD', 'VERSION:3.0',
             vName.trim() && `FN:${vName.trim()}`,
             vOrg.trim() && `ORG:${vOrg.trim()}`,
             vPhone.trim() && `TEL;TYPE=CELL:${vPhone.trim()}`,
             vEmail.trim() && `EMAIL:${vEmail.trim()}`,
             vUrl.trim() && `URL:${vUrl.trim()}`,
             'END:VCARD'].filter(Boolean).join('\n')
          : ''
      default:
        return input.trim()
    }
  }
  const data = payload()

  function generate() { if (!data) return; setGenerated(data); setDownloaded(false) }

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
        {/* 유형 탭 — URL·텍스트 / WiFi / 이메일 / 전화 / 연락처 */}
        <div className="flex flex-wrap gap-1.5">
          {(['text', 'wifi', 'email', 'phone', 'vcard'] as QrType[]).map((tp) => (
            <button key={tp} onClick={() => setQrType(tp)} className={chip(qrType === tp)}>{t('qg_type_' + tp)}</button>
          ))}
        </div>

        {qrType === 'text' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('qg_label')}</label>
            <textarea value={input} onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); generate() } }}
              placeholder={t('qg_ph')} rows={3}
              className="w-full p-4 border border-gray-200 rounded-xl resize-none text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-400" />
          </div>
        )}
        {qrType === 'wifi' && (
          <div className="space-y-2.5">
            <input value={ssid} onChange={(e) => setSsid(e.target.value)} placeholder={t('wqr_ssid')} className={inputCls} />
            <div className="flex gap-2">
              <select value={enc} onChange={(e) => setEnc(e.target.value as typeof enc)} className="text-sm border border-gray-200 rounded-xl px-2 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-400">
                <option value="WPA">WPA/WPA2</option><option value="WEP">WEP</option><option value="nopass">{t('wqr_none')}</option>
              </select>
              {enc !== 'nopass' && <input value={wifiPw} onChange={(e) => setWifiPw(e.target.value)} placeholder={t('wqr_password')} className={inputCls + ' flex-1'} />}
            </div>
            <label className="inline-flex items-center gap-1.5 text-sm text-gray-600">
              <input type="checkbox" checked={hidden} onChange={(e) => setHidden(e.target.checked)} className="accent-brand-600" />{t('wqr_hidden')}
            </label>
            <p className="text-[11px] text-gray-400">{t('wqr_hint')}</p>
          </div>
        )}
        {qrType === 'email' && (
          <div className="space-y-2.5">
            <input value={to} onChange={(e) => setTo(e.target.value)} placeholder={t('eqr_to')} className={inputCls} />
            <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder={t('eqr_subject')} className={inputCls} />
            <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder={t('eqr_body')} rows={2} className={inputCls + ' resize-none'} />
            <p className="text-[11px] text-gray-400">{t('eqr_hint')}</p>
          </div>
        )}
        {qrType === 'phone' && (
          <div className="space-y-2.5">
            <div className="flex gap-1.5">
              {(['call', 'sms'] as const).map((m) => (
                <button key={m} onClick={() => setPhoneMode(m)} className={chip(phoneMode === m)}>{t('pqr_' + m)}</button>
              ))}
            </div>
            <input value={number} onChange={(e) => setNumber(e.target.value)} placeholder={t('pqr_number')} inputMode="tel" className={inputCls} />
            {phoneMode === 'sms' && <input value={message} onChange={(e) => setMessage(e.target.value)} placeholder={t('pqr_message')} className={inputCls} />}
            <p className="text-[11px] text-gray-400">{t('pqr_hint')}</p>
          </div>
        )}
        {qrType === 'vcard' && (
          <div className="space-y-2.5">
            <div className="grid grid-cols-2 gap-2">
              <input value={vName} onChange={(e) => setVName(e.target.value)} placeholder={t('vqr_name')} className={inputCls} />
              <input value={vOrg} onChange={(e) => setVOrg(e.target.value)} placeholder={t('vqr_org')} className={inputCls} />
              <input value={vPhone} onChange={(e) => setVPhone(e.target.value)} placeholder={t('vqr_phone')} inputMode="tel" className={inputCls} />
              <input value={vEmail} onChange={(e) => setVEmail(e.target.value)} placeholder={t('vqr_email')} className={inputCls} />
            </div>
            <input value={vUrl} onChange={(e) => setVUrl(e.target.value)} placeholder={t('vqr_website')} className={inputCls} />
            <p className="text-[11px] text-gray-400">{t('vqr_hint')}</p>
          </div>
        )}

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
                placeholder={t('qg_title_ph')} className={inputCls} />
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
          <button onClick={generate} disabled={!data} className="bg-brand-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-brand-700 transition-colors disabled:opacity-40">{t('qg_generate')}</button>
        </div>

        {generated && (
          <div className="flex flex-col items-center gap-4 pt-2">
            {error ? (
              <p className="text-sm rounded-xl bg-rose-50 border border-rose-200 text-rose-600 px-4 py-3">{t('qg_error')}</p>
            ) : preview ? (
              /* 미리보기는 화면용으로 축소 표시 — 다운로드는 선택한 원본 해상도 */
              /* eslint-disable-next-line @next/next/no-img-element */
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
