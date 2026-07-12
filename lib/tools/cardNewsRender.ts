// 카드뉴스 생성기 — 텍스트 파싱 · 언어별 줄바꿈 · 글자 크기 자동 맞춤 · canvas 렌더.
// 절대 규칙: 텍스트가 카드 영역을 넘치거나 잘리면 안 된다. 최소 크기에서도 넘치면
// fitAllPages()가 해당 페이지를 문장 경계에서 자동 2분할한다.

import { type CNLang, type CNTheme, familyFor } from './cardNewsThemes'

/* ---------------- 페이지 모델 ---------------- */

export type CNPageKind = 'cover' | 'body' | 'outro'
export interface CNPage { kind: CNPageKind; sub?: string; text: string }

const AUTO_SPLIT_OVER = 180 // 빈 줄 없는 블록이 이보다 길면 문장 단위 자동 분할
const AUTO_CHUNK = 150 // 자동 분할 시 페이지당 목표 글자 수 (문장 중간에서 안 자름)

// 문장 경계 분리 (마침표류 뒤에서 자름, 구분자 유지)
function splitSentences(text: string): string[] {
  const out = text.match(/[^.!?。！？\n]+[.!?。！？]*\s*/g)
  return out ? out.map((s) => s.trim()).filter(Boolean) : [text]
}

// 문장 배열을 목표 글자 수로 그리디 패킹
function packSentences(sentences: string[], budget: number): string[] {
  const pages: string[] = []
  let cur = ''
  for (const s of sentences) {
    if (cur && cur.length + s.length + 1 > budget) { pages.push(cur); cur = s }
    else cur = cur ? cur + ' ' + s : s
  }
  if (cur) pages.push(cur)
  return pages
}

// 본문 → 페이지 배열. 빈 줄 = 페이지 나눔 / 첫 줄 ≤15자 = 소제목 / 긴 블록 자동 분할.
export function parseBody(body: string): CNPage[] {
  const blocks = body.replace(/\r\n/g, '\n').split(/\n\s*\n+/).map((b) => b.trim()).filter(Boolean)
  const pages: CNPage[] = []
  for (const block of blocks) {
    const lines = block.split('\n').map((l) => l.trim()).filter(Boolean)
    let sub: string | undefined
    let rest = lines
    if (lines.length > 1 && stripEm(lines[0]).length <= 15) { sub = lines[0]; rest = lines.slice(1) }
    const text = rest.join('\n')
    if (text.length > AUTO_SPLIT_OVER) {
      const chunks = packSentences(splitSentences(text.replace(/\n/g, ' ')), AUTO_CHUNK)
      chunks.forEach((c, i) => pages.push({ kind: 'body', sub: i === 0 ? sub : undefined, text: c }))
    } else {
      pages.push({ kind: 'body', sub, text })
    }
  }
  return pages
}

/* ---------------- 강조 문법 **텍스트** ---------------- */

export interface CNRun { t: string; em: boolean }

export function parseEm(text: string): CNRun[] {
  const runs: CNRun[] = []
  const re = /\*\*([^*]+)\*\*/g
  let last = 0, m: RegExpExecArray | null
  while ((m = re.exec(text))) {
    if (m.index > last) runs.push({ t: text.slice(last, m.index), em: false })
    runs.push({ t: m[1], em: true })
    last = m.index + m[0].length
  }
  if (last < text.length) runs.push({ t: text.slice(last), em: false })
  return runs.length ? runs : [{ t: '', em: false }]
}

export const stripEm = (s: string) => s.replace(/\*\*([^*]+)\*\*/g, '$1')

/* ---------------- 언어별 토큰화 + 줄바꿈 ---------------- */

// 행 머리 금칙 문자 (JA) — 。、등이 줄 첫머리에 오지 않게 한다
const KINSOKU_HEAD = '、。，．・：；？！ヽヾゝゞ々ー」』）〕｝〉》】’”ぁぃぅぇぉっゃゅょゎァィゥェォッャュョヮ%％'
const KINSOKU_TAIL = '「『（〔｛〈《【‘“' // 행 끝 금칙 (여는 괄호류)

interface Tok { t: string; em: boolean; glue: boolean } // glue=앞 토큰에 붙어야 함(금칙)

// 런 배열 → 언어별 줄바꿈 단위 토큰. KO/EN=어절(공백) 단위, JA=글자 단위+금칙.
function tokenize(runs: CNRun[], lang: CNLang): Tok[] {
  const toks: Tok[] = []
  for (const run of runs) {
    for (const seg of run.t.split('\n')) {
      if (toks.length && seg !== run.t.split('\n')[0]) toks.push({ t: '\n', em: false, glue: false })
      if (lang === 'ja') {
        for (const ch of Array.from(seg)) {
          const glue = KINSOKU_HEAD.includes(ch) || (toks.length > 0 && KINSOKU_TAIL.includes(toks[toks.length - 1].t))
          toks.push({ t: ch, em: run.em, glue })
        }
      } else {
        for (const w of seg.split(/(\s+)/)) {
          if (!w) continue
          if (/^\s+$/.test(w)) { if (toks.length) toks.push({ t: ' ', em: false, glue: false }) }
          else toks.push({ t: w, em: run.em, glue: false })
        }
      }
    }
  }
  return toks
}

export interface CNLineRun { t: string; em: boolean }
export type CNLine = CNLineRun[]

function fontStr(size: number, weight: number, fam: string, em: boolean) {
  return `${em ? Math.min(900, weight + 200) : weight} ${size}px ${fam}`
}

// 토큰을 maxWidth에 맞춰 그리디 줄바꿈. 한 토큰이 줄 폭보다 길면 글자 단위 강제 분해.
function wrapTokens(ctx: CanvasRenderingContext2D, toks: Tok[], size: number, weight: number, fam: string, maxWidth: number): CNLine[] {
  const lines: CNLine[] = []
  let line: CNLineRun[] = []
  let lineW = 0
  const width = (t: string, em: boolean) => { ctx.font = fontStr(size, weight, fam, em); return ctx.measureText(t).width }
  const push = () => { // 공백으로 끝나는 줄 정리 후 확정
    while (line.length && line[line.length - 1].t === ' ') { line.pop() }
    if (line.length) lines.push(line)
    line = []; lineW = 0
  }
  const add = (t: string, em: boolean, w: number) => {
    const last = line[line.length - 1]
    if (last && last.em === em) last.t += t
    else line.push({ t, em })
    lineW += w
  }
  for (const tok of toks) {
    if (tok.t === '\n') { push(); continue }
    if (tok.t === ' ' && line.length === 0) continue
    let w = width(tok.t, tok.em)
    if (lineW + w > maxWidth && line.length && !tok.glue && tok.t !== ' ') {
      // 초장 토큰(URL·초장단어)은 글자 단위로 강제 분해
      if (w > maxWidth) {
        for (const ch of Array.from(tok.t)) {
          const cw = width(ch, tok.em)
          if (lineW + cw > maxWidth && line.length) push()
          add(ch, tok.em, cw)
        }
        continue
      }
      push()
      if (tok.t === ' ') continue
      w = width(tok.t, tok.em)
    }
    add(tok.t, tok.em, w)
  }
  push()
  return lines
}

/* ---------------- 글자 크기 자동 맞춤 ---------------- */

export const RATIOS = { square: { w: 1080, h: 1080 }, portrait: { w: 1080, h: 1350 } } as const
export type CNRatio = keyof typeof RATIOS

const SIZES = [44, 40, 36, 32, 28, 24] // 본문 크기 사다리 (지시서 24~44px)
const LINE_H = 1.62
const PAD = 96 // 카드 안쪽 여백 (1080 기준)

export interface CNFit { size: number; lines: CNLine[]; subLines: CNLine[] | null }

let measureCtx: CanvasRenderingContext2D | null = null
function getMeasureCtx(): CanvasRenderingContext2D {
  if (!measureCtx) measureCtx = document.createElement('canvas').getContext('2d')!
  return measureCtx
}

// 페이지 본문을 텍스트 영역(boxW×boxH)에 맞추는 크기 탐색. 실패 시 null.
export function fitPage(page: CNPage, theme: CNTheme, lang: CNLang, boxW: number, boxH: number): CNFit | null {
  const ctx = getMeasureCtx()
  const fam = familyFor(theme.font.body, lang)
  const toks = tokenize(parseEm(page.text), lang)
  const subToks = page.sub ? tokenize(parseEm(page.sub), lang) : null
  for (const size of SIZES) {
    const lines = wrapTokens(ctx, toks, size, theme.bodyWeight, fam, boxW)
    const subSize = Math.round(size * 0.62)
    const subLines = subToks ? wrapTokens(ctx, subToks, subSize, 700, fam, boxW) : null
    const h = lines.length * size * LINE_H + (subLines ? subLines.length * subSize * LINE_H + size * 0.9 : 0)
    if (h <= boxH) return { size, lines, subLines }
  }
  return null
}

// 넘치는 페이지를 문장 경계(없으면 중간)에서 2분할하며 전부 맞을 때까지 반복.
export function fitAllPages(pages: CNPage[], theme: CNTheme, lang: CNLang, ratio: CNRatio): { page: CNPage; fit: CNFit }[] {
  const { w, h } = RATIOS[ratio]
  const boxW = w - PAD * 2
  const boxH = h - PAD * 2 - 120 // 하단 도트/번호 영역 제외
  const out: { page: CNPage; fit: CNFit }[] = []
  const queue = [...pages]
  let guard = 0
  while (queue.length && guard++ < 200) {
    const page = queue.shift()!
    if (page.kind !== 'body') { out.push({ page, fit: fitPage(page, theme, lang, boxW, boxH)! }); continue }
    const fit = fitPage(page, theme, lang, boxW, boxH)
    if (fit) { out.push({ page, fit }); continue }
    // 최소 크기에서도 넘침 → 문장 경계 중간점 2분할
    const sentences = splitSentences(page.text.replace(/\n/g, ' '))
    let a: string, b: string
    if (sentences.length > 1) {
      const mid = Math.ceil(sentences.length / 2)
      a = sentences.slice(0, mid).join(' '); b = sentences.slice(mid).join(' ')
    } else {
      const chars = Array.from(page.text)
      const mid = Math.ceil(chars.length / 2)
      a = chars.slice(0, mid).join(''); b = chars.slice(mid).join('')
    }
    queue.unshift({ kind: 'body', sub: page.sub, text: a }, { kind: 'body', text: b })
  }
  return out
}

/* ---------------- canvas 렌더 ---------------- */

function paintBg(ctx: CanvasRenderingContext2D, theme: CNTheme, w: number, h: number, pageIdx: number) {
  const bg = theme.bg
  if (bg.kind === 'solid') { ctx.fillStyle = bg.c; ctx.fillRect(0, 0, w, h) }
  else if (bg.kind === 'gradient') {
    const g = ctx.createLinearGradient(0, 0, w, h)
    g.addColorStop(0, bg.from); g.addColorStop(1, bg.to)
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h)
  } else if (bg.kind === 'blocks') {
    ctx.fillStyle = bg.colors[pageIdx % bg.colors.length]; ctx.fillRect(0, 0, w, h)
  } else if (bg.kind === 'notebook') {
    ctx.fillStyle = bg.paper; ctx.fillRect(0, 0, w, h)
    ctx.strokeStyle = bg.line; ctx.lineWidth = 2
    for (let y = 150; y < h - 60; y += 72) { ctx.beginPath(); ctx.moveTo(60, y); ctx.lineTo(w - 60, y); ctx.stroke() }
    ctx.strokeStyle = bg.margin
    ctx.beginPath(); ctx.moveTo(130, 60); ctx.lineTo(130, h - 60); ctx.stroke()
  }
}

function drawRuns(ctx: CanvasRenderingContext2D, line: CNLine, x: number, y: number, size: number, weight: number, fam: string, theme: CNTheme, align: 'left' | 'center', maxW: number) {
  ctx.textBaseline = 'alphabetic'
  ctx.font = fontStr(size, weight, fam, false)
  let total = 0
  const widths = line.map((r) => { ctx.font = fontStr(size, weight, fam, r.em); const w = ctx.measureText(r.t).width; total += w; return w })
  let cx = align === 'center' ? x + (maxW - total) / 2 : x
  line.forEach((r, i) => {
    ctx.font = fontStr(size, weight, fam, r.em)
    if (r.em) {
      const em = theme.em
      if (em.kind === 'highlight') { ctx.fillStyle = em.c; ctx.fillRect(cx - size * 0.06, y - size * 0.82, widths[i] + size * 0.12, size * 1.06) }
      else if (em.kind === 'invert') { ctx.fillStyle = em.c; ctx.fillRect(cx - size * 0.12, y - size * 0.86, widths[i] + size * 0.24, size * 1.16) }
      else if (em.kind === 'underline') { ctx.fillStyle = em.c; ctx.fillRect(cx, y + size * 0.16, widths[i], Math.max(3, size * 0.07)) }
      ctx.fillStyle = em.kind === 'color' ? em.c : em.kind === 'invert' ? em.textC : theme.fg
    } else ctx.fillStyle = theme.fg
    ctx.fillText(r.t, cx, y)
    cx += widths[i]
  })
}

function drawDots(ctx: CanvasRenderingContext2D, theme: CNTheme, w: number, h: number, idx: number, total: number) {
  const n = Math.min(total, 12)
  const gap = 30, size = 12
  const startX = w / 2 - ((n - 1) * gap) / 2
  const y = h - 88
  for (let i = 0; i < n; i++) {
    const active = i === Math.min(idx, n - 1)
    ctx.fillStyle = active ? theme.dots.active : theme.dots.c
    const x = startX + i * gap
    if (theme.dots.shape === 'circle') { ctx.beginPath(); ctx.arc(x, y, size / 2, 0, Math.PI * 2); ctx.fill() }
    else if (theme.dots.shape === 'square') ctx.fillRect(x - size / 2, y - size / 2, size, size)
    else ctx.fillRect(x - 11, y - 2, 22, 4)
  }
  ctx.fillStyle = theme.sub
  ctx.font = `500 26px ${familyFor('sans', 'ko')}`
  ctx.textAlign = 'right'
  ctx.fillText(`${idx + 1} / ${total}`, w - 56, h - 78)
  ctx.textAlign = 'left'
}

export interface CNRenderOpts {
  lang: CNLang
  ratio: CNRatio
  account?: string
  scale?: number // 미리보기 축소 렌더 (내보내기=1)
  brand?: string // 표지 overline 텍스트 (계정명 없을 때 대체)
}

// 페이지 1장 렌더. canvas 크기 설정부터 전부 처리.
export function renderCard(canvas: HTMLCanvasElement, item: { page: CNPage; fit: CNFit }, idx: number, total: number, theme: CNTheme, opts: CNRenderOpts) {
  const { w: W, h: H } = RATIOS[opts.ratio]
  const s = opts.scale ?? 1
  canvas.width = Math.round(W * s); canvas.height = Math.round(H * s)
  const ctx = canvas.getContext('2d')!
  ctx.save()
  ctx.scale(s, s)
  paintBg(ctx, theme, W, H, idx)
  const { page, fit } = item
  const bodyFam = familyFor(theme.font.body, opts.lang)
  const headFam = familyFor(theme.font.head, opts.lang)
  const headC = theme.headC || theme.fg

  if (page.kind === 'cover') {
    const runs = parseEm(page.text)
    const toks = tokenize(runs, opts.lang)
    const mctx = getMeasureCtx()
    // 표지 제목: 88 → 52px 사다리
    let size = 88, lines: CNLine[] = []
    for (const sz of [88, 80, 72, 64, 56, 52]) {
      size = sz
      lines = wrapTokens(mctx, toks, sz, theme.headWeight, headFam, W - PAD * 2)
      if (lines.length * sz * 1.32 <= H * 0.5) break
    }
    const blockH = lines.length * size * 1.32
    let y = H / 2 - blockH / 2 + size * 0.8
    const align = theme.cover.align
    const x = PAD

    if (theme.cover.ghost) { // 흑백 타이포: 유령 숫자
      ctx.fillStyle = '#f0f0f0'
      ctx.font = `400 ${H * 0.62}px ${familyFor('display', opts.lang)}`
      ctx.textAlign = 'right'
      ctx.fillText('01', W - 30, H * 0.56)
      ctx.textAlign = 'left'
    }
    if (theme.cover.rule) {
      ctx.fillStyle = headC
      ctx.fillRect(PAD, 130, W - PAD * 2, theme.cover.rule === 'double' ? 6 : 3)
      if (theme.cover.rule === 'double') ctx.fillRect(PAD, 142, W - PAD * 2, 2)
      ctx.fillRect(PAD, H - 150, W - PAD * 2, 2)
    }
    if (theme.cover.tape) { // 마스킹 테이프
      ctx.save()
      ctx.translate(W / 2, 128); ctx.rotate(-0.05)
      ctx.fillStyle = 'rgba(240,185,185,0.65)'
      ctx.fillRect(-110, -26, 220, 52)
      ctx.restore()
    }
    if (theme.cover.overline) {
      ctx.fillStyle = theme.accent === headC ? theme.sub : theme.accent
      ctx.font = `600 30px ${bodyFam}`
      ctx.textAlign = align === 'center' ? 'center' : 'left'
      const label = opts.account ? '@' + opts.account : (opts.brand || '')
      if (label) ctx.fillText(label, align === 'center' ? W / 2 : x, y - blockH / 2 - 40)
      ctx.textAlign = 'left'
    }
    if (theme.cover.bar) { ctx.fillStyle = theme.accent; ctx.fillRect(x, y - size * 0.8 - 46, 120, 14) }

    // 제목 (커버는 headC 색 — drawRuns의 fg를 임시 치환)
    const coverTheme = { ...theme, fg: headC }
    for (const line of lines) {
      drawRuns(ctx, line, x, y, size, theme.headWeight, headFam, coverTheme, align === 'center' ? 'center' : 'left', W - PAD * 2)
      y += size * 1.32
    }
  } else if (page.kind === 'outro') {
    const mctx = getMeasureCtx()
    const toks = tokenize(parseEm(page.text), opts.lang)
    const lines = wrapTokens(mctx, toks, 60, theme.headWeight, headFam, W - PAD * 2)
    let y = H / 2 - (lines.length * 60 * 1.4) / 2 + 48 - (opts.account ? 30 : 0)
    const outroTheme = { ...theme, fg: headC }
    for (const line of lines) { drawRuns(ctx, line, PAD, y, 60, theme.headWeight, headFam, outroTheme, 'center', W - PAD * 2); y += 60 * 1.4 }
    if (opts.account) {
      ctx.fillStyle = theme.accent === headC ? theme.sub : theme.accent
      ctx.font = `600 38px ${bodyFam}`
      ctx.textAlign = 'center'
      ctx.fillText('@' + opts.account, W / 2, y + 24)
      ctx.textAlign = 'left'
    }
  } else {
    // 본문 페이지
    const { size, lines, subLines } = fit
    const subSize = Math.round(size * 0.62)
    const blockH = lines.length * size * LINE_H + (subLines ? subLines.length * subSize * LINE_H + size * 0.9 : 0)
    let y = (H - 120) / 2 - blockH / 2 + size
    const align = theme.bodyAlign
    if (subLines) {
      ctx.font = `700 ${subSize}px ${bodyFam}`
      for (const sl of subLines) {
        const txt = sl.map((r) => r.t).join('')
        const tw = ctx.measureText(txt).width
        const sx = align === 'center' ? (W - tw) / 2 : PAD
        // 소제목 스타일: accent 색 + (invert 테마는 블록)
        if (theme.em.kind === 'invert') {
          ctx.fillStyle = theme.em.c
          ctx.fillRect(sx - 14, y - subSize * 0.9, tw + 28, subSize * 1.3)
          ctx.fillStyle = theme.em.textC
        } else ctx.fillStyle = theme.accent === theme.fg ? theme.sub : theme.accent
        ctx.font = `700 ${subSize}px ${bodyFam}`
        ctx.fillText(txt, sx, y)
        y += subSize * LINE_H
      }
      y += size * 0.9
    }
    for (const line of lines) {
      drawRuns(ctx, line, PAD, y, size, theme.bodyWeight, bodyFam, theme, align, W - PAD * 2)
      y += size * LINE_H
    }
  }
  drawDots(ctx, theme, W, H, idx, total)
  ctx.restore()
}
