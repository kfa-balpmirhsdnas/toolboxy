'use client'

// TEMP comparison page (/icon-compare) — emoji vs SVG icons for the PDF viewer and
// Image viewer toolbars. Throwaway: not in the registry, sitemap, or nav. Delete when done.

import type { ReactNode } from 'react'

function Svg({ children }: { children: ReactNode }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" className="w-[20px] h-[20px]" aria-hidden="true">
      {children}
    </svg>
  )
}

// shared
const ZoomOut = <Svg><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /><path d="M8 11h6" /></Svg>
const ZoomIn = <Svg><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /><path d="M11 8v6" /><path d="M8 11h6" /></Svg>
const Save = <Svg><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><path d="M17 21v-8H7v8" /><path d="M7 3v5h8" /></Svg>
const Folder = <Svg><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z" /></Svg>
const Maximize = <Svg><path d="M8 3H5a2 2 0 0 0-2 2v3" /><path d="M21 8V5a2 2 0 0 0-2-2h-3" /><path d="M3 16v3a2 2 0 0 0 2 2h3" /><path d="M16 21h3a2 2 0 0 0 2-2v-3" /></Svg>

// pdf
const Thumbs = <Svg><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M9 3v18" /></Svg>
const Highlighter = <Svg><path d="m9 11-6 6v3h9l3-3" /><path d="m22 12-4.6 4.6a2 2 0 0 1-2.8 0l-5.2-5.2a2 2 0 0 1 0-2.8L14 4" /></Svg>
const Pen = <Svg><path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" /></Svg>
const TypeIcon = <Svg><path d="M4 7V5h16v2" /><path d="M9 19h6" /><path d="M12 5v14" /></Svg>
const Camera = <Svg><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" /><circle cx="12" cy="13" r="3" /></Svg>
const Hand = <Svg><path d="M5 9l-3 3 3 3" /><path d="M9 5l3-3 3 3" /><path d="M15 19l-3 3-3-3" /><path d="M19 9l3 3-3 3" /><path d="M2 12h20" /><path d="M12 2v20" /></Svg>
const Binoculars = <Svg><rect x="3" y="9" width="7" height="11" rx="3.5" /><rect x="14" y="9" width="7" height="11" rx="3.5" /><path d="M10 12.5h4" /><path d="M6.5 9 7 5.4a1 1 0 0 1 2 0L9.5 9" /><path d="M17.5 9 17 5.4a1 1 0 0 0-2 0L14.5 9" /></Svg>

// image
const Fit = <Svg><path d="M15 3h6v6" /><path d="M9 21H3v-6" /><path d="M21 3l-7 7" /><path d="M3 21l7-7" /></Svg>
const Film = <Svg><rect x="2" y="3" width="20" height="18" rx="2" /><path d="M7 3v18" /><path d="M17 3v18" /><path d="M2 9h5" /><path d="M2 15h5" /><path d="M17 9h5" /><path d="M17 15h5" /></Svg>
const Grid = <Svg><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></Svg>
const RotL = <Svg><path d="M3 12a9 9 0 1 0 3-6.7L3 8" /><path d="M3 3v5h5" /></Svg>
const RotR = <Svg><path d="M21 12a9 9 0 1 1-3-6.7L21 8" /><path d="M21 3v5h-5" /></Svg>
const Flip = <Svg><path d="M12 3v18" /><path d="M3 8l4 4-4 4" /><path d="M21 8l-4 4 4 4" /></Svg>
const Crop = <Svg><path d="M6 2v14a2 2 0 0 0 2 2h14" /><path d="M18 22V8a2 2 0 0 0-2-2H2" /></Svg>
const Play = <Svg><polygon points="6 3 20 12 6 21 6 3" /></Svg>
const Info = <Svg><circle cx="12" cy="12" r="9" /><path d="M12 16v-4" /><path d="M12 8h.01" /></Svg>

type Item = { emoji: string; svg: ReactNode; label: string }

const PDF: Item[] = [
  { emoji: '◧', svg: Thumbs, label: '썸네일' },
  { emoji: '🖍️', svg: Highlighter, label: '형광펜' },
  { emoji: '✏️', svg: Pen, label: '펜' },
  { emoji: '🅰', svg: TypeIcon, label: '텍스트' },
  { emoji: '📷', svg: Camera, label: '캡쳐' },
  { emoji: '✋', svg: Hand, label: '이동' },
  { emoji: '➖', svg: ZoomOut, label: '축소' },
  { emoji: '➕', svg: ZoomIn, label: '확대' },
  { emoji: '⛶', svg: Maximize, label: '전체화면' },
  { emoji: '🔍', svg: Binoculars, label: '찾기' },
  { emoji: '💾', svg: Save, label: '저장' },
  { emoji: '📂', svg: Folder, label: '새파일' },
]

const IMG: Item[] = [
  { emoji: '➖', svg: ZoomOut, label: '축소' },
  { emoji: '➕', svg: ZoomIn, label: '확대' },
  { emoji: '⤢', svg: Fit, label: '맞춤' },
  { emoji: '🎞', svg: Film, label: '필름' },
  { emoji: '▦', svg: Grid, label: '썸네일' },
  { emoji: '↺', svg: RotL, label: '왼쪽회전' },
  { emoji: '↻', svg: RotR, label: '오른쪽회전' },
  { emoji: '↔', svg: Flip, label: '좌우반전' },
  { emoji: '✂️', svg: Crop, label: '자르기' },
  { emoji: '▶', svg: Play, label: '슬라이드' },
  { emoji: 'ℹ️', svg: Info, label: '정보' },
  { emoji: '⛶', svg: Maximize, label: '전체화면' },
  { emoji: '💾', svg: Save, label: '저장' },
  { emoji: '📂', svg: Folder, label: '새파일' },
]

function Bar({ items, dark, mode }: { items: Item[]; dark: boolean; mode: 'emoji' | 'svg' }) {
  const barCls = dark
    ? 'flex items-center gap-1 flex-wrap rounded-xl bg-gray-800 px-2 py-1.5'
    : 'flex items-center gap-1 flex-wrap rounded-xl bg-gray-100 px-2 py-1.5'
  const btnCls = dark
    ? 'w-9 h-9 rounded-lg flex items-center justify-center text-gray-200 hover:bg-white/15 text-lg leading-none'
    : 'w-9 h-9 rounded-lg flex items-center justify-center bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 text-lg leading-none'
  return (
    <div className={barCls}>
      {items.map((it, i) => (
        <button key={i} className={btnCls} title={it.label} aria-label={it.label}>
          {mode === 'emoji' ? it.emoji : it.svg}
        </button>
      ))}
    </div>
  )
}

function Section({ title, items, dark }: { title: string; items: Item[]; dark: boolean }) {
  return (
    <div className="space-y-3">
      <h2 className="text-lg font-bold text-gray-900">{title}</h2>
      <div className="space-y-2">
        <div>
          <p className="text-xs font-medium text-gray-500 mb-1">1줄 · 이모지 (현재)</p>
          <Bar items={items} dark={dark} mode="emoji" />
        </div>
        <div>
          <p className="text-xs font-medium text-gray-500 mb-1">2줄 · SVG</p>
          <Bar items={items} dark={dark} mode="svg" />
        </div>
      </div>
    </div>
  )
}

export default function IconComparePage() {
  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">아이콘 비교 (임시)</h1>
          <p className="text-sm text-gray-500 mt-1">각 도구 툴바를 1줄(이모지) / 2줄(SVG)로 비교 — 결정 후 이 페이지는 삭제합니다.</p>
        </div>
        <Section title="PDF 뷰어" items={PDF} dark={false} />
        <Section title="이미지 뷰어 (어두운 툴바)" items={IMG} dark />
        <div className="rounded-xl border border-gray-200 bg-white p-4 text-sm text-gray-600 space-y-1">
          <p className="font-semibold text-gray-800">참고</p>
          <p>· 이모지는 OS/브라우저마다 색·모양이 달라 보입니다(특히 어두운 툴바에서 컬러 이모지가 튐).</p>
          <p>· SVG는 단색·동일 굵기·동일 크기로 통일되고 글자색을 따릅니다.</p>
        </div>
      </div>
    </div>
  )
}
