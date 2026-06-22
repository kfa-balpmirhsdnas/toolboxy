'use client'
import { useState, useRef, useEffect } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
import { trackToolUsed } from '@/lib/gtag'

const tool = getToolBySlug('keyboard-shortcut-tester')!

interface KeyEvent { key: string; code: string; ctrl: boolean; alt: boolean; shift: boolean; meta: boolean; time: string }

const KEY_DISPLAY: Record<string,string> = {
  'Control':'Ctrl','Alt':'Alt','Shift':'Shift','Meta':'⌘','ArrowUp':'↑','ArrowDown':'↓','ArrowLeft':'←','ArrowRight':'→',
  'Enter':'↵','Escape':'Esc','Backspace':'⌫','Delete':'Del','Tab':'Tab',' ':'Space',
}

export default function KeyboardShortcutTesterPage({ params }: { params: { lang: string } }) {
  const [events, setEvents] = useState<KeyEvent[]>([])
  const [listening, setListening] = useState(false)
  const tracked = useRef(false)
  const boxRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = boxRef.current
    if (!el) return
    const handler = (e: KeyboardEvent) => {
      e.preventDefault()
      if (!tracked.current) { trackToolUsed('keyboard-shortcut-tester'); tracked.current = true }
      const now = new Date()
      const time = now.getHours().toString().padStart(2,'0')+':'+now.getMinutes().toString().padStart(2,'0')+':'+now.getSeconds().toString().padStart(2,'0')
      setEvents(prev=>[{ key:e.key, code:e.code, ctrl:e.ctrlKey, alt:e.altKey, shift:e.shiftKey, meta:e.metaKey, time },...prev].slice(0,20))
    }
    if (listening) { el.addEventListener('keydown',handler); return ()=>el.removeEventListener('keydown',handler) }
  },[listening])

  function formatShortcut(ev: KeyEvent): string {
    const parts = []
    if (ev.ctrl) parts.push('Ctrl')
    if (ev.alt) parts.push('Alt')
    if (ev.shift) parts.push('Shift')
    if (ev.meta) parts.push('⌘')
    const key = KEY_DISPLAY[ev.key] || ev.key
    if (!['Control','Alt','Shift','Meta'].includes(ev.key)) parts.push(key)
    return parts.join(' + ')
  }

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="space-y-4">
        <div
          ref={boxRef}
          tabIndex={0}
          onClick={()=>setListening(true)}
          onBlur={()=>setListening(false)}
          className={'flex items-center justify-center rounded-2xl border-2 transition-colors cursor-pointer min-h-28 focus:outline-none ' + (listening?'border-brand-400 bg-brand-50':'border-dashed border-gray-300 hover:border-gray-400')}>
          {listening ? (
            <div className="text-center">
              <p className="text-brand-600 font-semibold">🎹 Listening for keyboard input...</p>
              <p className="text-xs text-gray-500 mt-1">Press any key or shortcut</p>
            </div>
          ) : (
            <p className="text-gray-400 text-sm">Click here to start capturing keyboard shortcuts</p>
          )}
        </div>
        {events.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-gray-600">Captured events</p>
              <button onClick={()=>setEvents([])} className="text-xs text-gray-400 hover:text-gray-600">Clear</button>
            </div>
            {events.map((ev,i)=>(
              <div key={i} className={'p-3 rounded-xl border ' + (i===0?'border-brand-200 bg-brand-50':'border-gray-100 bg-gray-50')}>
                <div className="flex items-center justify-between">
                  <div className="flex gap-1.5 flex-wrap">
                    {formatShortcut(ev).split(' + ').map((k,j)=>(
                      <kbd key={j} className="px-2 py-1 bg-white border border-gray-300 rounded-md text-xs font-mono shadow-sm">{k}</kbd>
                    ))}
                  </div>
                  <span className="text-xs text-gray-400">{ev.time}</span>
                </div>
                <p className="text-xs text-gray-400 mt-1 font-mono">code: {ev.code}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
