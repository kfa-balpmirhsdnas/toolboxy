'use client'
import { useState } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'

const CATEGORIES: Record<string, string[]> = {
  'Smileys': ['😀','😃','😄','😁','😆','😅','😂','🤣','😊','😇','🙂','🙃','😉','😌','😍','🥰','😘','😗','😙','😚','😋','😛','😝','😜','🤪','🤨','🧐','🤓','😎','🥸','🤩','🥳'],
  'Gestures': ['👋','🤚','🖐','✋','🖖','👌','🤌','🤏','✌','🤞','🤟','🤘','🤙','👈','👉','👆','🖕','👇','👍','👎','✊','👊','🤛','🤜','👏','🙌','🫶','👐','🤲','🙏'],
  'Animals': ['🐶','🐱','🐭','🐹','🐰','🦊','🐻','🐼','🐻','🐨','🐯','🦁','🐮','🐷','🐸','🐵','🙈','🙉','🙊','🐔','🐧','🐦','🐤','🦆','🦅','🦉','🦇','🐺','🐗','🐴','🦄'],
  'Food': ['🍎','🍊','🍋','🍇','🍓','🫐','🍈','🍒','🍑','🥭','🍍','🥥','🥝','🍅','🫒','🥑','🍆','🥦','🥬','🥒','🌶','🫑','🥕','🧄','🧅','🥔','🍠','🫚','🥜','🌰','🍞','🥐'],
  'Travel': ['🚀','✈','🚂','🚃','🚄','🚅','🚆','🚇','🚈','🚉','🚊','🚝','🚞','🚋','🚌','🚍','🚎','🚐','🚑','🚒','🚓','🚔','🚕','🚖','🚗','🚘','🚙','🛻','🚚','🚛','🚜'],
  'Objects': ['💡','🔦','🕯','🪔','💰','💳','💎','⚖','🪜','🧲','🔧','🪛','🔩','⚙','🗜','🔗','⛓','🪝','🧰','🪤','🧲','🔑','🗝','🔐','🔏','🔓','🔒','🪪','🗂','📁','📂'],
  'Symbols': ['❤','🧡','💛','💚','💙','💜','🖤','🤍','🤎','💔','❤‍🔥','❤‍🩹','💕','💞','💓','💗','💖','💘','💝','💟','❣','💠','🔴','🟠','🟡','🟢','🔵','🟣','⚫','⚪','🟤'],
}


const tool = getToolBySlug('emoji-picker')!

export default function EmojiPickerPage() {
  const [search, setSearch] = useState('')
  const [copied, setCopied] = useState('')
  const [selected, setSelected] = useState<string[]>([])

  const allEmojis = Object.values(CATEGORIES).flat()
  const filtered = search
    ? allEmojis.filter(e => e.includes(search))
    : null

  const pick = (emoji: string) => {
    setSelected(prev => [...prev, emoji])
    setCopied(emoji)
    setTimeout(() => setCopied(''), 1200)
  }

  const copyAll = () => navigator.clipboard.writeText(selected.join(''))
  const clear = () => setSelected([])

  return (
    <ToolLayout tool={tool}>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Emoji Picker</h1>
        <p className="text-gray-500 mb-6">Browse, search, and copy emojis. Click to add to your collection.</p>
        <div className="bg-white rounded-xl shadow p-6 space-y-4">
          <input type="text" placeholder="Search emojis..."
            className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={search} onChange={e => setSearch(e.target.value)} />

          {selected.length > 0 && (
            <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
              <div className="flex-1 text-2xl leading-relaxed break-all">{selected.join('')}</div>
              <button onClick={copyAll} className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700">Copy</button>
              <button onClick={clear} className="text-xs bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-300">Clear</button>
            </div>
          )}

          {copied && (
            <div className="text-center text-sm text-green-600 font-medium">
              {copied} copied!
            </div>
          )}

          {filtered ? (
            <div>
              <p className="text-xs text-gray-500 mb-2">{filtered.length} results</p>
              <div className="flex flex-wrap gap-1">
                {filtered.map((e, i) => (
                  <button key={i} onClick={() => pick(e)}
                    className="text-2xl p-1.5 rounded hover:bg-gray-100 transition-colors" title={e}>{e}</button>
                ))}
              </div>
            </div>
          ) : (
            Object.entries(CATEGORIES).map(([cat, emojis]) => (
              <div key={cat}>
                <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">{cat}</h2>
                <div className="flex flex-wrap gap-1">
                  {emojis.map((e, i) => (
                    <button key={i} onClick={() => pick(e)}
                      className="text-2xl p-1.5 rounded hover:bg-gray-100 transition-colors">{e}</button>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </ToolLayout>
  )
}
