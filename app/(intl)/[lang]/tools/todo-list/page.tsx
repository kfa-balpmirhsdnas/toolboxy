'use client'
import { useState, useEffect, useRef } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
import { trackToolUsed } from '@/lib/gtag'

const tool = getToolBySlug('todo-list')!
const KEY = 'todo-list-v1'

interface Todo { id: string; text: string; done: boolean }
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7)

export default function TodoListPage({ params }: { params: { lang: string } }) {
  const t = useTranslations('toolui')
  const [items, setItems] = useState<Todo[]>([])
  const [loaded, setLoaded] = useState(false)
  const [input, setInput] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editText, setEditText] = useState('')
  const tracked = useRef(false)

  // Load once from this browser's localStorage…
  useEffect(() => {
    try { const raw = localStorage.getItem(KEY); if (raw) { const a = JSON.parse(raw); if (Array.isArray(a)) setItems(a) } } catch { /* */ }
    setLoaded(true)
  }, [])
  // …and write back on every change (so it survives a browser restart).
  useEffect(() => {
    if (!loaded) return
    try { localStorage.setItem(KEY, JSON.stringify(items)) } catch { /* */ }
  }, [items, loaded])

  const total = items.length
  const done = items.filter((i) => i.done).length

  const add = () => {
    const v = input.trim(); if (!v) return
    setItems((a) => [...a, { id: uid(), text: v, done: false }])
    setInput('')
    if (!tracked.current) { trackToolUsed(tool.slug); tracked.current = true }
  }
  const toggle = (id: string) => setItems((a) => a.map((i) => (i.id === id ? { ...i, done: !i.done } : i)))
  const remove = (id: string) => setItems((a) => a.filter((i) => i.id !== id))
  const clearDone = () => setItems((a) => a.filter((i) => !i.done))
  const startEdit = (i: Todo) => { setEditingId(i.id); setEditText(i.text) }
  const saveEdit = () => {
    const v = editText.trim()
    if (v) setItems((a) => a.map((i) => (i.id === editingId ? { ...i, text: v } : i)))
    setEditingId(null); setEditText('')
  }

  // Pointer-based drag reorder — works with both mouse and touch (no library).
  const listRef = useRef<HTMLUListElement>(null)
  const dragFrom = useRef<number | null>(null)
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const onHandleDown = (e: React.PointerEvent, index: number) => {
    dragFrom.current = index; setDraggingId(items[index].id)
    try { (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId) } catch { /* */ }
  }
  const onHandleMove = (e: React.PointerEvent) => {
    if (dragFrom.current === null || !listRef.current) return
    const rows = Array.from(listRef.current.querySelectorAll('[data-row]')) as HTMLElement[]
    let target = rows.findIndex((r) => { const b = r.getBoundingClientRect(); return e.clientY < b.top + b.height / 2 })
    if (target === -1) target = rows.length - 1
    const from = dragFrom.current
    if (target !== from && target >= 0) {
      setItems((a) => { const n = [...a]; const [m] = n.splice(from, 1); n.splice(target, 0, m); return n })
      dragFrom.current = target
    }
  }
  const onHandleUp = () => { dragFrom.current = null; setDraggingId(null) }

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="max-w-xl mx-auto space-y-4">
        {/* add a task */}
        <div className="flex gap-2">
          <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && add()}
            placeholder={t('td_add_ph')} aria-label={t('td_add_ph')} enterKeyHint="done"
            className="flex-1 min-w-0 rounded-xl border border-gray-300 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-brand-400" />
          <button onClick={add} disabled={!input.trim()}
            className="shrink-0 px-5 py-3 rounded-xl bg-brand-600 text-white font-semibold hover:bg-brand-700 active:scale-95 disabled:opacity-40 transition">{t('td_add')}</button>
        </div>

        {/* counts + clear completed */}
        {total > 0 && (
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span><b className="text-brand-600">{done}</b>/{total} {t('td_completed')}</span>
            {done > 0 && <button onClick={clearDone} className="text-gray-400 hover:text-rose-500 transition">{t('td_clear_done')}</button>}
          </div>
        )}
        {total > 0 && <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden"><div className="h-full bg-brand-500 transition-all" style={{ width: `${Math.round((done / total) * 100)}%` }} /></div>}

        {/* list */}
        {total === 0 ? (
          <p className="text-center text-gray-400 py-12">{t('td_empty')}</p>
        ) : (
          <ul ref={listRef} className="space-y-1.5">
            {items.map((it, idx) => (
              <li key={it.id} data-row
                className={`flex items-center gap-1.5 rounded-xl border px-2 py-2 transition ${draggingId === it.id ? 'border-brand-400 bg-brand-50 shadow' : 'border-gray-200 bg-white'}`}>
                <button type="button" aria-label={t('td_reorder')} title={t('td_reorder')}
                  onPointerDown={(e) => onHandleDown(e, idx)} onPointerMove={onHandleMove} onPointerUp={onHandleUp} onPointerCancel={onHandleUp}
                  style={{ touchAction: 'none' }}
                  className="shrink-0 cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-500 px-1">
                  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor"><circle cx="9" cy="6" r="1.6" /><circle cx="15" cy="6" r="1.6" /><circle cx="9" cy="12" r="1.6" /><circle cx="15" cy="12" r="1.6" /><circle cx="9" cy="18" r="1.6" /><circle cx="15" cy="18" r="1.6" /></svg>
                </button>

                <button type="button" onClick={() => toggle(it.id)} role="checkbox" aria-checked={it.done} aria-label={it.text}
                  className={`shrink-0 w-6 h-6 rounded-md border-2 flex items-center justify-center transition ${it.done ? 'bg-brand-500 border-brand-500 text-white' : 'border-gray-300 hover:border-brand-400'}`}>
                  {it.done && <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>}
                </button>

                {editingId === it.id ? (
                  <input autoFocus value={editText} onChange={(e) => setEditText(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') saveEdit() }} onBlur={saveEdit}
                    className="flex-1 min-w-0 rounded-lg border border-brand-300 px-2 py-1 text-base focus:outline-none focus:ring-2 focus:ring-brand-400" />
                ) : (
                  <span onDoubleClick={() => startEdit(it)}
                    className={`flex-1 min-w-0 break-words text-[15px] leading-snug ${it.done ? 'line-through text-gray-400' : 'text-gray-800'}`}>{it.text}</span>
                )}

                {editingId === it.id ? (
                  <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={saveEdit} aria-label={t('td_save')}
                    className="shrink-0 px-1.5 text-sm font-semibold text-brand-600 hover:text-brand-700">{t('td_save')}</button>
                ) : (
                  <>
                    <button type="button" onClick={() => startEdit(it)} aria-label={t('td_edit')} title={t('td_edit')} className="shrink-0 text-gray-300 hover:text-gray-600 px-1">
                      <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" /></svg>
                    </button>
                    <button type="button" onClick={() => remove(it.id)} aria-label={t('td_delete')} title={t('td_delete')} className="shrink-0 text-gray-300 hover:text-rose-500 px-1">
                      <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" /></svg>
                    </button>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}

        {/* privacy note — everything stays in this browser */}
        <p className="flex items-center gap-1.5 text-xs text-gray-400 pt-1">
          <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
          {t('td_privacy')}
        </p>
      </div>
    </ToolLayout>
  )
}
