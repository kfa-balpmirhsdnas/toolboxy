'use client'
import { useState, useEffect, useRef } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import Modal from '@/components/Modal'
import { getToolBySlug } from '@/lib/tools/registry'
import { trackToolUsed } from '@/lib/gtag'

const tool = getToolBySlug('todo-list')!
const KEY = 'todo-list-v1'
const STARRED = '__starred__'
const COMPLETED = '__completed__'
const DEFAULT = 'default'

interface List { id: string; name: string }
interface Todo { id: string; text: string; done: boolean; starred: boolean; details: string; due: string; listId: string }
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7)
const todayStr = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}` }

export default function TodoListPage({ params }: { params: { lang: string } }) {
  const t = useTranslations('toolui')
  const [lists, setLists] = useState<List[]>([{ id: DEFAULT, name: '' }])
  const [items, setItems] = useState<Todo[]>([])
  const [active, setActive] = useState<string>(DEFAULT)
  const [loaded, setLoaded] = useState(false)
  const [input, setInput] = useState('')
  const [editing, setEditing] = useState<Todo | null>(null)
  const [draft, setDraft] = useState({ text: '', details: '', due: '', listId: DEFAULT })
  const [addingList, setAddingList] = useState(false)
  const [newListName, setNewListName] = useState('')
  const tracked = useRef(false)

  // Load once from this browser, migrating the old flat-array format if present.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY)
      if (raw) {
        const p = JSON.parse(raw)
        if (Array.isArray(p)) {
          setItems(p.map((i) => ({ id: i.id ?? uid(), text: i.text ?? '', done: !!i.done, starred: false, details: '', due: '', listId: DEFAULT })))
        } else if (p && typeof p === 'object') {
          if (Array.isArray(p.lists) && p.lists.length) setLists(p.lists)
          if (Array.isArray(p.items)) setItems(p.items.map((i: Partial<Todo>) => ({ starred: false, details: '', due: '', listId: DEFAULT, done: false, text: '', id: uid(), ...i })))
          if (typeof p.active === 'string') setActive(p.active)
        }
      }
    } catch { /* */ }
    setLoaded(true)
  }, [])
  // Persist on every change so the list survives a browser restart.
  useEffect(() => { if (loaded) try { localStorage.setItem(KEY, JSON.stringify({ lists, items, active })) } catch { /* */ } }, [lists, items, active, loaded])
  // Keep the active tab valid if its list was removed.
  useEffect(() => { if (active !== STARRED && active !== COMPLETED && !lists.some((l) => l.id === active)) setActive(DEFAULT) }, [lists, active])
  // Scroll the active tab fully into view in the horizontally-scrolling tab bar.
  const tabBarRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const bar = tabBarRef.current; if (!bar) return
    const el = bar.querySelector(`[data-tab="${active}"]`) as HTMLElement | null; if (!el) return
    const er = el.getBoundingClientRect(), br = bar.getBoundingClientRect()
    let delta = 0
    if (er.left < br.left + 8) delta = er.left - br.left - 8
    else if (er.right > br.right - 8) delta = er.right - br.right + 8
    if (delta) bar.scrollTo({ left: bar.scrollLeft + delta, behavior: 'smooth' })
  }, [active])

  const listName = (l: List) => (l.id === DEFAULT ? t('td_tab_general') : l.name)
  // A task belongs to a tab's scope; once completed it leaves its list/starred view
  // and shows only in the Completed tab. Counts still reflect the whole scope.
  const inScope = (it: Todo) => (active === STARRED ? it.starred : active === COMPLETED ? it.done : it.listId === active)
  const inView = (it: Todo) => inScope(it) && (active === COMPLETED || !it.done)
  const scope = items.filter(inScope)
  const shown = items.filter(inView)
  const total = scope.length
  const done = scope.filter((i) => i.done).length

  const add = () => {
    const v = input.trim(); if (!v) return
    const onStar = active === STARRED
    setItems((a) => [...a, { id: uid(), text: v, done: false, starred: onStar, details: '', due: '', listId: onStar ? DEFAULT : active }])
    setInput('')
    if (!tracked.current) { trackToolUsed(tool.slug); tracked.current = true }
  }
  const toggle = (id: string) => setItems((a) => a.map((i) => (i.id === id ? { ...i, done: !i.done } : i)))
  const toggleStar = (id: string) => setItems((a) => a.map((i) => (i.id === id ? { ...i, starred: !i.starred } : i)))
  const clearDone = () => setItems((a) => a.filter((i) => !i.done))

  const openEdit = (it: Todo) => { setEditing(it); setDraft({ text: it.text, details: it.details || '', due: it.due || '', listId: it.listId }) }
  const saveEdit = () => {
    if (editing) { const v = draft.text.trim(); if (v) setItems((a) => a.map((i) => (i.id === editing.id ? { ...i, text: v, details: draft.details, due: draft.due, listId: draft.listId } : i))) }
    setEditing(null)
  }
  const deleteEditing = () => { if (editing) setItems((a) => a.filter((i) => i.id !== editing.id)); setEditing(null) }

  const createList = () => {
    const name = newListName.trim()
    if (name) { const id = uid(); setLists((l) => [...l, { id, name }]); setActive(id) }
    setAddingList(false); setNewListName('')
  }
  const deleteList = (id: string) => {
    if (id === DEFAULT || !window.confirm(t('td_delete_list_confirm'))) return
    setItems((a) => a.filter((i) => i.listId !== id)); setLists((l) => l.filter((x) => x.id !== id)); setActive(DEFAULT)
  }

  // Drag reorder within the current view (works with mouse + touch, no library).
  const listRef = useRef<HTMLUListElement>(null)
  const dragFrom = useRef<number | null>(null)
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const reorder = (from: number, to: number) => setItems((global) => {
    const ids = global.filter(inView).map((s) => s.id)
    const [m] = ids.splice(from, 1); ids.splice(to, 0, m)
    const byId = Object.fromEntries(global.map((g) => [g.id, g]))
    let k = 0
    return global.map((it) => (inView(it) ? byId[ids[k++]] : it))
  })
  const onHandleDown = (e: React.PointerEvent, index: number) => { dragFrom.current = index; setDraggingId(shown[index].id); try { (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId) } catch { /* */ } }
  const onHandleMove = (e: React.PointerEvent) => {
    if (dragFrom.current === null || !listRef.current) return
    const rows = Array.from(listRef.current.querySelectorAll('[data-row]')) as HTMLElement[]
    let target = rows.findIndex((r) => { const b = r.getBoundingClientRect(); return e.clientY < b.top + b.height / 2 })
    if (target === -1) target = rows.length - 1
    const from = dragFrom.current
    if (target !== from && target >= 0) { reorder(from, target); dragFrom.current = target }
  }
  const onHandleUp = () => { dragFrom.current = null; setDraggingId(null) }

  const tabCls = (on: boolean) => `shrink-0 inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium border transition whitespace-nowrap ${on ? 'border-brand-400 bg-brand-50 text-brand-700' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`
  const star = (filled: boolean, cls: string) => <svg viewBox="0 0 24 24" className={cls} fill={filled ? '#facc15' : 'none'} stroke={filled ? '#eab308' : 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="max-w-xl mx-auto space-y-4">
        {/* tabs: starred · lists · + new list */}
        <div ref={tabBarRef} className="flex items-center gap-1.5 overflow-x-auto pb-1 -mx-1 px-1">
          <button data-tab={STARRED} onClick={() => setActive(STARRED)} className={tabCls(active === STARRED)}>{star(active === STARRED, 'w-3.5 h-3.5')}{t('td_tab_starred')}</button>
          {lists.map((l) => (
            <span key={l.id} className="relative shrink-0">
              <button data-tab={l.id} onClick={() => setActive(l.id)} className={tabCls(active === l.id) + (l.id !== DEFAULT && active === l.id ? ' pr-7' : '')}>{listName(l)}</button>
              {l.id !== DEFAULT && active === l.id && (
                <button onClick={() => deleteList(l.id)} aria-label={t('td_delete_list')} title={t('td_delete_list')}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full text-brand-500 hover:bg-brand-100 flex items-center justify-center text-base leading-none">×</button>
              )}
            </span>
          ))}
          {addingList ? (
            <input autoFocus value={newListName} onChange={(e) => setNewListName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') createList(); if (e.key === 'Escape') { setAddingList(false); setNewListName('') } }} onBlur={createList}
              placeholder={t('td_new_list_ph')} className="shrink-0 w-28 rounded-full border border-brand-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
          ) : (
            <button onClick={() => setAddingList(true)} className="shrink-0 px-3 py-1.5 rounded-full text-sm font-medium border border-dashed border-gray-300 text-gray-500 hover:bg-gray-50 whitespace-nowrap">+ {t('td_new_list')}</button>
          )}
          {/* completed view — always the last tab */}
          <button data-tab={COMPLETED} onClick={() => setActive(COMPLETED)} className={tabCls(active === COMPLETED)}>
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
            {t('td_tab_done')}
          </button>
        </div>

        {/* add a task (not on the read-only Completed view) */}
        {active !== COMPLETED && (
          <div className="flex gap-2">
            <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && add()}
              placeholder={t('td_add_ph')} aria-label={t('td_add_ph')} enterKeyHint="done"
              className="flex-1 min-w-0 rounded-xl border border-gray-300 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-brand-400" />
            <button onClick={add} disabled={!input.trim()} className="shrink-0 px-5 py-3 rounded-xl bg-brand-600 text-white font-semibold hover:bg-brand-700 active:scale-95 disabled:opacity-40 transition">{t('td_add')}</button>
          </div>
        )}

        {/* counts */}
        {total > 0 && (
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span><b className="text-brand-600">{done}</b>/{total} {t('td_completed')}</span>
            {active === COMPLETED && done > 0 && <button onClick={clearDone} className="text-gray-400 hover:text-rose-500 transition">{t('td_clear_done')}</button>}
          </div>
        )}
        {total > 0 && <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden"><div className="h-full bg-brand-500 transition-all" style={{ width: `${Math.round((done / total) * 100)}%` }} /></div>}

        {/* list */}
        {shown.length === 0 ? (
          <p className="text-center text-gray-400 py-12">{active === COMPLETED ? t('td_empty_done') : scope.length > 0 ? t('td_all_done') : active === STARRED ? t('td_empty_starred') : t('td_empty')}</p>
        ) : (
          <ul ref={listRef} className="space-y-1.5">
            {shown.map((it, idx) => (
              <li key={it.id} data-row className={`flex items-center gap-1.5 rounded-xl border px-2 py-2 transition ${draggingId === it.id ? 'border-brand-400 bg-brand-50 shadow' : 'border-gray-200 bg-white'}`}>
                <button type="button" aria-label={t('td_reorder')} title={t('td_reorder')} style={{ touchAction: 'none' }}
                  onPointerDown={(e) => onHandleDown(e, idx)} onPointerMove={onHandleMove} onPointerUp={onHandleUp} onPointerCancel={onHandleUp}
                  className="shrink-0 cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-500 px-1">
                  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor"><circle cx="9" cy="6" r="1.6" /><circle cx="15" cy="6" r="1.6" /><circle cx="9" cy="12" r="1.6" /><circle cx="15" cy="12" r="1.6" /><circle cx="9" cy="18" r="1.6" /><circle cx="15" cy="18" r="1.6" /></svg>
                </button>

                <button type="button" onClick={() => toggle(it.id)} role="checkbox" aria-checked={it.done} aria-label={it.text}
                  className={`shrink-0 w-6 h-6 rounded-md border-2 flex items-center justify-center transition ${it.done ? 'bg-brand-500 border-brand-500 text-white' : 'border-gray-300 hover:border-brand-400'}`}>
                  {it.done && <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>}
                </button>

                {/* title opens the edit modal; due date sits on the far right, one line */}
                <button type="button" onClick={() => openEdit(it)} className={`flex-1 min-w-0 text-left truncate text-[15px] leading-snug ${it.done ? 'line-through text-gray-400' : 'text-gray-800'}`}>{it.text}</button>
                {it.due && <span className={`shrink-0 whitespace-nowrap text-[11px] ${!it.done && it.due < todayStr() ? 'text-rose-500' : 'text-gray-400'}`}>📅 {it.due.slice(5)}</span>}

                <button type="button" onClick={() => toggleStar(it.id)} aria-label={t('td_starred')} aria-pressed={it.starred} title={t('td_starred')} className="shrink-0 px-1 text-gray-300 hover:text-yellow-500">
                  {star(it.starred, 'w-5 h-5')}
                </button>
              </li>
            ))}
          </ul>
        )}

        <p className="flex items-center gap-1.5 text-xs text-gray-400 pt-1">
          <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
          {t('td_privacy')}
        </p>
      </div>

      {/* edit modal: title · details · due date · delete */}
      <Modal open={!!editing} onClose={() => setEditing(null)}>
        <div onClick={(e) => e.stopPropagation()} className="w-full max-w-xs rounded-2xl bg-white p-4 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-gray-900">{t('td_edit_title')}</h2>
            <button onClick={() => setEditing(null)} aria-label={t('td_close')} className="w-7 h-7 rounded-full hover:bg-gray-100 text-gray-400 text-lg leading-none">×</button>
          </div>
          <div>
            <span className="text-[11px] font-semibold text-gray-500">{t('td_field_list')}</span>
            <div className="mt-1 flex flex-wrap gap-1">
              {lists.map((l) => (
                <button key={l.id} type="button" onClick={() => setDraft((d) => ({ ...d, listId: l.id }))}
                  className={`px-2.5 py-0.5 rounded-full text-[13px] border transition ${draft.listId === l.id ? 'border-brand-400 bg-brand-50 text-brand-700' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}>{listName(l)}</button>
              ))}
            </div>
          </div>
          <label className="block">
            <span className="text-[11px] font-semibold text-gray-500">{t('td_field_title')}</span>
            <input value={draft.text} onChange={(e) => setDraft((d) => ({ ...d, text: e.target.value }))} onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-brand-400" />
          </label>
          <label className="block">
            <span className="text-[11px] font-semibold text-gray-500">{t('td_details')}</span>
            <textarea value={draft.details} onChange={(e) => setDraft((d) => ({ ...d, details: e.target.value }))} rows={2} placeholder={t('td_details_ph')}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-brand-400" />
          </label>
          <label className="block">
            <span className="text-[11px] font-semibold text-gray-500">{t('td_due')}</span>
            <input type="date" value={draft.due} onChange={(e) => setDraft((d) => ({ ...d, due: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-brand-400" />
          </label>
          <div className="flex items-center justify-between pt-0.5">
            <button onClick={deleteEditing} className="px-2.5 py-1.5 text-sm font-medium text-rose-500 rounded-lg hover:bg-rose-50">{t('td_delete')}</button>
            <div className="flex items-center gap-1.5">
              <button onClick={saveEdit} className="px-4 py-1.5 text-sm font-semibold text-white bg-brand-600 rounded-lg hover:bg-brand-700 active:scale-95 transition">{t('td_save')}</button>
              <button onClick={() => setEditing(null)} className="px-3 py-1.5 text-sm font-medium text-gray-500 rounded-lg border border-gray-200 hover:bg-gray-50">{t('td_cancel')}</button>
            </div>
          </div>
        </div>
      </Modal>
    </ToolLayout>
  )
}
