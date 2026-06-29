import type { ReactNode } from 'react'

// Shared SVG icon set for tool toolbars. Single colour, uniform stroke — replaces the
// emoji/glyph icons so every tool's toolbar looks consistent in light + dark. Lucide-style
// (viewBox 0 0 24 24, stroke=currentColor). Add new icons here; never inline emoji in a bar.
const P: Record<string, ReactNode> = {
  'zoom-out': <><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /><path d="M8 11h6" /></>,
  'zoom-in': <><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /><path d="M11 8v6" /><path d="M8 11h6" /></>,
  fit: <><path d="M15 3h6v6" /><path d="M9 21H3v-6" /><path d="M21 3l-7 7" /><path d="M3 21l7-7" /></>,
  maximize: <><path d="M8 3H5a2 2 0 0 0-2 2v3" /><path d="M21 8V5a2 2 0 0 0-2-2h-3" /><path d="M3 16v3a2 2 0 0 0 2 2h3" /><path d="M16 21h3a2 2 0 0 0 2-2v-3" /></>,
  minimize: <><path d="M8 3v3a2 2 0 0 1-2 2H3" /><path d="M21 8h-3a2 2 0 0 1-2-2V3" /><path d="M3 16h3a2 2 0 0 1 2 2v3" /><path d="M16 21v-3a2 2 0 0 1 2-2h3" /></>,
  save: <><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><path d="M17 21v-8H7v8" /><path d="M7 3v5h8" /></>,
  folder: <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z" />,
  search: <><rect x="3" y="9" width="7" height="11" rx="3.5" /><rect x="14" y="9" width="7" height="11" rx="3.5" /><path d="M10 12.5h4" /><path d="M6.5 9 7 5.4a1 1 0 0 1 2 0L9.5 9" /><path d="M17.5 9 17 5.4a1 1 0 0 0-2 0L14.5 9" /></>,
  'rotate-ccw': <><path d="M3 12a9 9 0 1 0 3-6.7L3 8" /><path d="M3 3v5h5" /></>,
  'rotate-cw': <><path d="M21 12a9 9 0 1 1-3-6.7L21 8" /><path d="M21 3v5h-5" /></>,
  flip: <><path d="M12 3v18" /><path d="M3 8l4 4-4 4" /><path d="M21 8l-4 4 4 4" /></>,
  crop: <><path d="M6 2v14a2 2 0 0 0 2 2h14" /><path d="M18 22V8a2 2 0 0 0-2-2H2" /></>,
  film: <><rect x="2" y="3" width="20" height="18" rx="2" /><path d="M7 3v18" /><path d="M17 3v18" /><path d="M2 9h5" /><path d="M2 15h5" /><path d="M17 9h5" /><path d="M17 15h5" /></>,
  grid: <><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></>,
  play: <polygon points="6 3 20 12 6 21 6 3" />,
  pause: <><rect x="6" y="4" width="4" height="16" rx="1" /><rect x="14" y="4" width="4" height="16" rx="1" /></>,
  info: <><circle cx="12" cy="12" r="9" /><path d="M12 16v-4" /><path d="M12 8h.01" /></>,
  thumbnails: <><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M9 3v18" /></>,
  pen: <><path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" /></>,
  highlighter: <><path d="m9 11-6 6v3h9l3-3" /><path d="m22 12-4.6 4.6a2 2 0 0 1-2.8 0l-5.2-5.2a2 2 0 0 1 0-2.8L14 4" /></>,
  text: <><path d="M4 7V5h16v2" /><path d="M9 19h6" /><path d="M12 5v14" /></>,
  underline: <><path d="M6 4v6a6 6 0 0 0 12 0V4" /><path d="M5 20h14" /></>,
  strike: <><path d="M16 4H9a3 3 0 0 0-2.83 4" /><path d="M14 12a4 4 0 0 1 0 8H6" /><path d="M4 12h16" /></>,
  rect: <rect x="4" y="6" width="16" height="12" rx="1" />,
  arrow: <><path d="M7 17 17 7" /><path d="M8 7h9v9" /></>,
  camera: <><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" /><circle cx="12" cy="13" r="3" /></>,
  hand: <><path d="M5 9l-3 3 3 3" /><path d="M9 5l3-3 3 3" /><path d="M15 19l-3 3-3-3" /><path d="M19 9l3 3-3 3" /><path d="M2 12h20" /><path d="M12 2v20" /></>,
  undo: <><path d="M9 14 4 9l5-5" /><path d="M4 9h11a4 4 0 0 1 0 8h-1" /></>,
  redo: <><path d="m15 14 5-5-5-5" /><path d="M20 9H9a4 4 0 0 0 0 8h1" /></>,
  eraser: <><path d="m7 21-4.3-4.3a1 1 0 0 1 0-1.4L13 5a2 2 0 0 1 2.8 0l4.2 4.2a2 2 0 0 1 0 2.8L11 21Z" /><path d="M22 21H8" /><path d="m5 11 9 9" /></>,
  sliders: <><line x1="21" x2="14" y1="6" y2="6" /><line x1="10" x2="3" y1="6" y2="6" /><line x1="21" x2="12" y1="12" y2="12" /><line x1="8" x2="3" y1="12" y2="12" /><line x1="21" x2="16" y1="18" y2="18" /><line x1="12" x2="3" y1="18" y2="18" /><circle cx="12" cy="6" r="2" /><circle cx="10" cy="12" r="2" /><circle cx="14" cy="18" r="2" /></>,
  loader: <path d="M21 12a9 9 0 1 1-6.2-8.5" />,
  'chevron-left': <path d="m15 18-6-6 6-6" />,
  'chevron-right': <path d="m9 18 6-6-6-6" />,
  'chevron-down': <path d="m6 9 6 6 6-6" />,
  'flip-v': <><path d="M3 12h18" /><path d="M8 8l4-4 4 4" /><path d="M8 16l4 4 4-4" /></>,
  download: <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><path d="M7 10l5 5 5-5" /><path d="M12 15V3" /></>,
}

export default function ToolIcon({ name, className }: { name: keyof typeof P | string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" className={className || 'w-[18px] h-[18px]'} aria-hidden="true">
      {P[name] ?? null}
    </svg>
  )
}
