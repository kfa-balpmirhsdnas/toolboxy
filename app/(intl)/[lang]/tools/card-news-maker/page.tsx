'use client'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import ToolLayout from '@/components/tools/ToolLayout'
import ToolIcon from '@/components/tools/ToolIcon'
import { getToolBySlug } from '@/lib/tools/registry'
import { trackToolUsed, trackToolDownload } from '@/lib/gtag'
import { CN_THEMES, themeById, ensureThemeFonts, asCNLang, type CNTheme, type CNLang } from '@/lib/tools/cardNewsThemes'
import { parseBody, fitAllPages, renderCard, RATIOS, type CNPage, type CNRatio, type CNFit } from '@/lib/tools/cardNewsRender'

const tool = getToolBySlug('card-news-maker')!

// dev 전용: 글자 맞춤/줄바꿈 로직 테스트 훅 (프로덕션에선 비활성)
if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'production') {
  ;(window as any).__cnTest = { parseBody, fitAllPages, themeById } // eslint-disable-line @typescript-eslint/no-explicit-any
}

type Outro = 'thanks' | 'follow' | 'save' | 'off'
const OUTROS: Outro[] = ['thanks', 'follow', 'save', 'off']
const BACKUP_KEY = 'cnm_backup_v1'
const PREVIEW_SCALE = 300 / 1080 // 미리보기 축소 렌더 (내보내기는 scale 1 오프스크린)

interface SaveData { v: 1; title: string; body: string; account: string; outro: Outro; theme: string; ratio: CNRatio }

// 테마 선택 스와치의 근사 배경 스타일
function swatchStyle(t: CNTheme): React.CSSProperties {
  const bg = t.bg
  if (bg.kind === 'solid') return { background: bg.c }
  if (bg.kind === 'gradient') return { background: `linear-gradient(135deg, ${bg.from}, ${bg.to})` }
  if (bg.kind === 'blocks') return { background: bg.colors[0] }
  return { background: bg.paper, backgroundImage: `repeating-linear-gradient(${bg.paper} 0 9px, ${bg.line} 9px 10px)` }
}

export default function CardNewsMakerPage({ params }: { params: { lang: string } }) {
  const t = useTranslations('toolui')
  const lang: CNLang = asCNLang(params.lang)

  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [account, setAccount] = useState('')
  const [outro, setOutro] = useState<Outro>('thanks')
  const [themeId, setThemeId] = useState('minimal')
  const [ratio, setRatio] = useState<CNRatio>('square')
  const [custom, setCustom] = useState<CNPage[] | null>(null) // 페이지 편집(수정·순서·삭제·복제) 후 상태
  const [editIdx, setEditIdx] = useState<number | null>(null)
  const [fontsReady, setFontsReady] = useState(false)
  const [fitted, setFitted] = useState<{ page: CNPage; fit: CNFit }[]>([])
  const [busy, setBusy] = useState(false)
  const canvasRefs = useRef<(HTMLCanvasElement | null)[]>([])
  const importRef = useRef<HTMLInputElement>(null)
  const restored = useRef(false)

  const theme = themeById(themeId)
  const dirty = title.trim() !== '' || body.trim() !== ''

  // localStorage 백업 — 변경 핸들러에서 직접 저장 (useEffect 저장 금지: StrictMode 파괴)
  function backup(patch: Partial<SaveData>) {
    try {
      const d: SaveData = { v: 1, title, body, account, outro, theme: themeId, ratio, ...patch }
      localStorage.setItem(BACKUP_KEY, JSON.stringify(d))
    } catch { /* quota — 백업 실패는 무시 */ }
  }
  function applyData(d: SaveData) {
    setTitle(d.title || ''); setBody(d.body || ''); setAccount(d.account || '')
    if (OUTROS.includes(d.outro)) setOutro(d.outro)
    if (CN_THEMES.some((th) => th.id === d.theme)) setThemeId(d.theme)
    if (d.ratio === 'square' || d.ratio === 'portrait') setRatio(d.ratio)
  }
  useEffect(() => { // 최근 작업 1건 자동 복원
    if (restored.current) return
    restored.current = true
    try {
      const raw = localStorage.getItem(BACKUP_KEY)
      if (raw) applyData(JSON.parse(raw))
    } catch { /* 손상된 백업 무시 */ }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const h = (e: BeforeUnloadEvent) => { if (dirty) { e.preventDefault(); e.returnValue = '' } }
    window.addEventListener('beforeunload', h)
    return () => window.removeEventListener('beforeunload', h)
  }, [dirty])

  // 원본 텍스트/마무리 설정이 바뀌면 페이지 편집 상태는 초기화 (파생 재계산)
  useEffect(() => { setCustom(null); setEditIdx(null) }, [title, body, outro, lang])

  const basePages = useMemo<CNPage[]>(() => {
    const pages: CNPage[] = []
    if (title.trim()) pages.push({ kind: 'cover', text: title.trim() })
    pages.push(...parseBody(body))
    if (outro !== 'off' && (title.trim() || body.trim())) pages.push({ kind: 'outro', text: t('cnm_outro_' + outro + '_text') })
    return pages
  }, [title, body, outro, t])
  const pages = custom ?? basePages

  // 테마 폰트 지연 로드 (해당 테마가 쓰는 파일만)
  useEffect(() => {
    let live = true
    setFontsReady(false)
    ensureThemeFonts(theme, lang).then(() => { if (live) setFontsReady(true) }).catch(() => { if (live) setFontsReady(true) })
    return () => { live = false }
  }, [themeId, lang]) // eslint-disable-line react-hooks/exhaustive-deps

  // 글자 크기 자동 맞춤 + 넘침 자동 분할 → 최종 페이지 확정
  useEffect(() => {
    if (!fontsReady) return
    setFitted(fitAllPages(pages, theme, lang, ratio))
  }, [pages, themeId, ratio, fontsReady, lang]) // eslint-disable-line react-hooks/exhaustive-deps

  // 미리보기 렌더
  useEffect(() => {
    if (!fontsReady) return
    fitted.forEach((item, i) => {
      const cv = canvasRefs.current[i]
      if (cv) renderCard(cv, item, i, fitted.length, theme, { lang, ratio, account: account.trim() || undefined, scale: PREVIEW_SCALE })
    })
  }, [fitted, account, fontsReady]) // eslint-disable-line react-hooks/exhaustive-deps

  /* ---- 페이지 편집 (오타 수정·순서·삭제·복제만) ---- */
  function withPages(fn: (arr: CNPage[]) => CNPage[]) {
    setCustom(fn(fitted.map((f) => ({ ...f.page }))))
  }
  function movePage(i: number, dir: -1 | 1) {
    const j = i + dir
    if (j < 0 || j >= fitted.length) return
    withPages((arr) => { [arr[i], arr[j]] = [arr[j], arr[i]]; return arr })
    setEditIdx(j)
  }
  function deletePage(i: number) { withPages((arr) => arr.filter((_, k) => k !== i)); setEditIdx(null) }
  function dupPage(i: number) { withPages((arr) => [...arr.slice(0, i + 1), { ...arr[i] }, ...arr.slice(i + 1)]); }
  function editPage(i: number, patch: Partial<CNPage>) { withPages((arr) => { arr[i] = { ...arr[i], ...patch }; return arr }) }

  /* ---- 내보내기 ---- */
  async function renderFull(i: number): Promise<Blob> {
    const cv = document.createElement('canvas')
    renderCard(cv, fitted[i], i, fitted.length, theme, { lang, ratio, account: account.trim() || undefined, scale: 1 })
    return new Promise((res, rej) => cv.toBlob((b) => (b ? res(b) : rej(new Error('toBlob failed'))), 'image/png'))
  }
  function saveBlob(blob: Blob, name: string) {
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob); a.download = name; a.click()
    setTimeout(() => URL.revokeObjectURL(a.href), 5000)
  }
  async function downloadOne(i: number) {
    setBusy(true)
    try {
      saveBlob(await renderFull(i), `card-${String(i + 1).padStart(2, '0')}.png`)
      trackToolDownload('card-news-maker', 'png'); trackToolUsed('card-news-maker')
    } catch (e) { alert(String(e)) } finally { setBusy(false) }
  }
  async function downloadZip() {
    setBusy(true)
    try {
      const { zipSync } = await import('fflate')
      const data: Record<string, Uint8Array> = {}
      for (let i = 0; i < fitted.length; i++) {
        const buf = await (await renderFull(i)).arrayBuffer()
        data[`card-${String(i + 1).padStart(2, '0')}.png`] = new Uint8Array(buf)
      }
      saveBlob(new Blob([zipSync(data, { level: 0 })], { type: 'application/zip' }), 'card-news.zip')
      trackToolDownload('card-news-maker', 'zip'); trackToolUsed('card-news-maker')
    } catch (e) { alert(String(e)) } finally { setBusy(false) }
  }

  /* ---- JSON 저장/불러오기 ---- */
  function exportJson() {
    const d: SaveData = { v: 1, title, body, account, outro, theme: themeId, ratio }
    saveBlob(new Blob([JSON.stringify(d, null, 2)], { type: 'application/json' }), 'card-news.json')
  }
  function importJson(file: File) {
    file.text().then((raw) => {
      try { applyData(JSON.parse(raw)); backup(JSON.parse(raw)) } catch { alert(t('cnm_bad_json')) }
    })
  }

  const chip = (on: boolean) =>
    'px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ' +
    (on ? 'bg-brand-600 border-brand-600 text-white' : 'bg-white border-gray-200 text-gray-600 hover:border-brand-300')
  const actBtn = 'inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:pointer-events-none'
  const previewH = Math.round(300 * (RATIOS[ratio].h / RATIOS[ratio].w))
  const edit = editIdx !== null && editIdx < fitted.length ? fitted[editIdx].page : null

  return (
    <ToolLayout tool={tool} lang={lang}>
      <div className="max-w-3xl mx-auto px-4">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-1">{t('cnm_title')}</h1>
          <p className="text-gray-500 text-sm">{t('cnm_subtitle')}</p>
        </div>

        {/* 1단계: 텍스트 입력 */}
        <section className="bg-white rounded-2xl border border-gray-200 p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-gray-900 text-sm"><span className="text-brand-600 mr-1.5">1</span>{t('cnm_step1')}</h2>
            <span className="text-xs text-gray-400">{t('cnm_total', { n: fitted.length })}</span>
          </div>
          <input value={title} onChange={(e) => { setTitle(e.target.value); backup({ title: e.target.value }) }}
            placeholder={t('cnm_title_ph')} maxLength={60}
            className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-brand-300 mb-2" />
          <textarea value={body} onChange={(e) => { setBody(e.target.value); backup({ body: e.target.value }) }}
            placeholder={t('cnm_body_ph')} rows={7}
            className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-brand-300 resize-y" />
          <p className="text-[11px] text-gray-400 mt-1.5 leading-relaxed">{t('cnm_rule')}</p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <label className="flex items-center gap-1.5 text-xs text-gray-500">
              {t('cnm_outro')}
              {OUTROS.map((o) => (
                <button key={o} onClick={() => { setOutro(o); backup({ outro: o }) }} className={chip(outro === o)}>{t('cnm_outro_' + o)}</button>
              ))}
            </label>
            <input value={account} onChange={(e) => { setAccount(e.target.value.replace(/^@/, '')); backup({ account: e.target.value.replace(/^@/, '') }) }}
              placeholder={t('cnm_account_ph')} maxLength={30}
              className="ml-auto w-40 border border-gray-200 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-brand-300" />
          </div>
        </section>

        {/* 2단계: 테마 */}
        <section className="bg-white rounded-2xl border border-gray-200 p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-gray-900 text-sm"><span className="text-brand-600 mr-1.5">2</span>{t('cnm_step2')}</h2>
            <div className="flex gap-1.5">
              <button onClick={() => { setRatio('square'); backup({ ratio: 'square' }) }} className={chip(ratio === 'square')}>1080×1080</button>
              <button onClick={() => { setRatio('portrait'); backup({ ratio: 'portrait' }) }} className={chip(ratio === 'portrait')}>1080×1350</button>
            </div>
          </div>
          <div className="grid grid-cols-5 gap-2">
            {CN_THEMES.map((th) => (
              <button key={th.id} onClick={() => { setThemeId(th.id); backup({ theme: th.id }) }}
                className={'rounded-xl border-2 p-1 transition-colors ' + (themeId === th.id ? 'border-brand-500' : 'border-gray-100 hover:border-gray-300')}>
                <span className="block aspect-square rounded-lg flex items-center justify-center text-lg font-black" style={swatchStyle(th)}>
                  <span style={{ color: th.onDark ? '#ffffff' : th.headC || th.fg }}>{lang === 'en' ? 'Aa' : '가'}</span>
                </span>
                <span className="block text-[10px] text-gray-500 mt-1 truncate">{t('cnm_t_' + th.id)}</span>
              </button>
            ))}
          </div>
        </section>

        {/* 3단계: 미리보기 & 다운로드 */}
        <section className="bg-white rounded-2xl border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
            <h2 className="font-bold text-gray-900 text-sm"><span className="text-brand-600 mr-1.5">3</span>{t('cnm_step3')}</h2>
            <div className="flex gap-1.5">
              <button onClick={exportJson} disabled={!dirty} className={actBtn + ' !py-1.5 !text-xs'}>{t('cnm_json_save')}</button>
              <button onClick={() => importRef.current?.click()} className={actBtn + ' !py-1.5 !text-xs'}>{t('cnm_json_load')}</button>
              <input ref={importRef} type="file" accept=".json,application/json" className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) importJson(f); e.target.value = '' }} />
            </div>
          </div>

          {fitted.length > 10 && (
            <p className="mb-3 text-xs rounded-xl bg-amber-50 border border-amber-200 text-amber-700 px-3 py-2">⚠️ {t('cnm_over10', { n: fitted.length })}</p>
          )}

          {fitted.length === 0 ? (
            <p className="text-center text-sm text-gray-400 py-14">{t('cnm_empty')}</p>
          ) : (
            <>
              <div className="relative">
                {!fontsReady && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70 rounded-xl">
                    <span className="text-xs text-gray-500 animate-pulse">{t('cnm_loading_font')}</span>
                  </div>
                )}
                <div className="flex gap-3 overflow-x-auto pb-2 snap-x">
                  {fitted.map((_, i) => (
                    <div key={i} className="shrink-0 snap-start">
                      <canvas ref={(el) => { canvasRefs.current[i] = el }} onClick={() => setEditIdx(editIdx === i ? null : i)}
                        className={'rounded-xl border cursor-pointer ' + (editIdx === i ? 'border-brand-500 ring-2 ring-brand-200' : i >= 10 ? 'border-amber-300' : 'border-gray-200')}
                        style={{ width: 220, height: Math.round(previewH * 220 / 300) }} />
                      <div className="flex items-center justify-between mt-1 px-0.5">
                        <span className="text-[10px] text-gray-400">{i + 1}{i >= 10 ? ' ⚠️' : ''}</span>
                        <button onClick={() => downloadOne(i)} disabled={busy || !fontsReady} className="text-[10px] text-gray-400 hover:text-brand-600 disabled:opacity-40">PNG ↓</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <p className="text-[11px] text-gray-400 mt-1">{t('cnm_click_edit')} · {t('cnm_em_hint')}</p>

              {/* 인라인 편집 (오타 수정·순서·삭제·복제) */}
              {edit && editIdx !== null && (
                <div className="mt-3 rounded-xl border border-brand-200 bg-brand-50/50 p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-gray-700">
                      {t('cnm_page_n', { n: editIdx + 1 })} · {t('cnm_kind_' + edit.kind)}
                    </span>
                    <div className="flex gap-1">
                      <button onClick={() => movePage(editIdx, -1)} disabled={editIdx === 0} className={actBtn + ' !px-2 !py-1 !text-xs'}>←</button>
                      <button onClick={() => movePage(editIdx, 1)} disabled={editIdx === fitted.length - 1} className={actBtn + ' !px-2 !py-1 !text-xs'}>→</button>
                      <button onClick={() => dupPage(editIdx)} className={actBtn + ' !px-2 !py-1 !text-xs'}>{t('cnm_dup')}</button>
                      <button onClick={() => deletePage(editIdx)} className={actBtn + ' !px-2 !py-1 !text-xs !text-red-500 !border-red-200'}>{t('cnm_del')}</button>
                      <button onClick={() => setEditIdx(null)} className={actBtn + ' !px-2 !py-1 !text-xs'}>✕</button>
                    </div>
                  </div>
                  {edit.kind === 'body' && (
                    <input value={edit.sub || ''} onChange={(e) => editPage(editIdx, { sub: e.target.value || undefined })}
                      placeholder={t('cnm_sub_ph')} maxLength={30}
                      className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-xs mb-1.5 focus:outline-none focus:ring-2 focus:ring-brand-300" />
                  )}
                  <textarea value={edit.text} onChange={(e) => editPage(editIdx, { text: e.target.value })} rows={3}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-brand-300 resize-y" />
                </div>
              )}

              <button onClick={downloadZip} disabled={busy || !fontsReady}
                className="mt-4 w-full py-3.5 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold disabled:opacity-50 flex items-center justify-center gap-2">
                <ToolIcon name="download" className="w-5 h-5" />
                {busy ? t('cnm_working') : t('cnm_dl_zip', { n: fitted.length })}
              </button>
            </>
          )}
        </section>

        {/* 관련 도구 */}
        <div className="mt-8 grid gap-2 min-[480px]:grid-cols-2">
          <Link href={`/${lang}/tools/youtube-thumbnail`}
            className="block rounded-2xl border-2 border-brand-200 bg-brand-50 p-3.5 text-center text-sm font-bold text-brand-700 hover:bg-brand-100 transition-colors">
            🖼 {t('cnm_rel_thumb')}
          </Link>
          <Link href={`/${lang}/tools/instagram-line-break`}
            className="block rounded-2xl border-2 border-brand-200 bg-brand-50 p-3.5 text-center text-sm font-bold text-brand-700 hover:bg-brand-100 transition-colors">
            📱 {t('cnm_rel_insta')}
          </Link>
        </div>
      </div>
    </ToolLayout>
  )
}
