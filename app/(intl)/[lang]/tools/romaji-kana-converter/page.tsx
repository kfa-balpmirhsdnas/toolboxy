'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
import { trackToolUsed, trackToolCopy } from '@/lib/gtag'

const tool = getToolBySlug('romaji-kana-converter')!

// Romaji -> hiragana map (Hepburn + common variants). Longest keys matched first.
const HIRA: Record<string, string> = {
  a:'あ',i:'い',u:'う',e:'え',o:'お',
  ka:'か',ki:'き',ku:'く',ke:'け',ko:'こ',ga:'が',gi:'ぎ',gu:'ぐ',ge:'げ',go:'ご',
  sa:'さ',shi:'し',si:'し',su:'す',se:'せ',so:'そ',za:'ざ',ji:'じ',zi:'じ',zu:'ず',ze:'ぜ',zo:'ぞ',
  ta:'た',chi:'ち',ti:'ち',tsu:'つ',tu:'つ',te:'て',to:'と',da:'だ',di:'ぢ',du:'づ',de:'で',do:'ど',
  na:'な',ni:'に',nu:'ぬ',ne:'ね',no:'の',
  ha:'は',hi:'ひ',fu:'ふ',hu:'ふ',he:'へ',ho:'ほ',ba:'ば',bi:'び',bu:'ぶ',be:'べ',bo:'ぼ',
  pa:'ぱ',pi:'ぴ',pu:'ぷ',pe:'ぺ',po:'ぽ',
  ma:'ま',mi:'み',mu:'む',me:'め',mo:'も',ya:'や',yu:'ゆ',yo:'よ',
  ra:'ら',ri:'り',ru:'る',re:'れ',ro:'ろ',wa:'わ',wo:'を',n:'ん',
  kya:'きゃ',kyu:'きゅ',kyo:'きょ',gya:'ぎゃ',gyu:'ぎゅ',gyo:'ぎょ',
  sha:'しゃ',shu:'しゅ',sho:'しょ',sya:'しゃ',syu:'しゅ',syo:'しょ',
  ja:'じゃ',ju:'じゅ',jo:'じょ',jya:'じゃ',jyu:'じゅ',jyo:'じょ',
  cha:'ちゃ',chu:'ちゅ',cho:'ちょ',cya:'ちゃ',cyu:'ちゅ',cyo:'ちょ',
  nya:'にゃ',nyu:'にゅ',nyo:'にょ',hya:'ひゃ',hyu:'ひゅ',hyo:'ひょ',
  bya:'びゃ',byu:'びゅ',byo:'びょ',pya:'ぴゃ',pyu:'ぴゅ',pyo:'ぴょ',
  mya:'みゃ',myu:'みゅ',myo:'みょ',rya:'りゃ',ryu:'りゅ',ryo:'りょ',
  fa:'ふぁ',fi:'ふぃ',fe:'ふぇ',fo:'ふぉ',vu:'ゔ',
}
const VOWELS = new Set(['a', 'i', 'u', 'e', 'o'])

function hiraToKata(s: string): string {
  return s.replace(/[ぁ-ゖ]/g, (c) => String.fromCharCode(c.charCodeAt(0) + 0x60))
}

function romajiToKana(input: string, kata: boolean): string {
  const s = input.toLowerCase()
  let out = ''
  let i = 0
  while (i < s.length) {
    const c = s[i]
    // sokuon: doubled consonant -> small tsu
    if (c === s[i + 1] && !VOWELS.has(c) && c !== 'n' && /[a-z]/.test(c)) {
      out += 'っ'
      i += 1
      continue
    }
    let matched = false
    for (let len = 3; len >= 1; len--) {
      const chunk = s.slice(i, i + len)
      if (HIRA[chunk]) {
        out += HIRA[chunk]
        i += len
        matched = true
        break
      }
    }
    if (!matched) {
      out += s[i]
      i += 1
    }
  }
  return kata ? hiraToKata(out) : out
}

// kana -> romaji
const REV: Record<string, string> = {}
for (const [r, k] of Object.entries(HIRA)) if (!(k in REV)) REV[k] = r
function kanaToRomaji(input: string): string {
  // normalize katakana to hiragana, drop prolonged sound mark handling
  const s = input.replace(/[ァ-ヶ]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0x60))
  let out = ''
  let i = 0
  while (i < s.length) {
    if (s[i] === 'っ') {
      // sokuon: double next romaji's first consonant
      const next2 = REV[s.slice(i + 1, i + 3)] || REV[s[i + 1]] || ''
      if (next2 && /[a-z]/.test(next2[0])) out += next2[0]
      i += 1
      continue
    }
    const two = s.slice(i, i + 2)
    if (REV[two]) { out += REV[two]; i += 2; continue }
    if (REV[s[i]]) { out += REV[s[i]]; i += 1; continue }
    out += s[i]
    i += 1
  }
  return out
}

type Mode = 'romaji-hira' | 'romaji-kata' | 'kana-romaji'

export default function RomajiKanaPage({ params }: { params: { lang: string } }) {
  const t = useTranslations('toolui')
  const [input, setInput] = useState('')
  const [mode, setMode] = useState<Mode>('romaji-hira')
  const [copied, setCopied] = useState(false)

  const output = (() => {
    if (!input.trim()) return ''
    if (mode === 'kana-romaji') return kanaToRomaji(input)
    return romajiToKana(input, mode === 'romaji-kata')
  })()

  async function copy() {
    await navigator.clipboard.writeText(output)
    setCopied(true)
    trackToolCopy('romaji-kana-converter')
    setTimeout(() => setCopied(false), 1500)
  }

  const modes: { id: Mode; label: string }[] = [
    { id: 'romaji-hira', label: 'rk_r2h' },
    { id: 'romaji-kata', label: 'rk_r2k' },
    { id: 'kana-romaji', label: 'rk_k2r' },
  ]

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {modes.map((m) => (
            <button
              key={m.id}
              onClick={() => { setMode(m.id); trackToolUsed('romaji-kana-converter', m.id) }}
              className={`text-sm font-medium px-3 py-1.5 rounded-lg border transition-colors ${
                mode === m.id ? 'bg-brand-600 text-white border-brand-600' : 'bg-white text-gray-600 border-gray-200 hover:border-brand-400'
              }`}
            >
              {t(m.label)}
            </button>
          ))}
        </div>

        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={mode === 'kana-romaji' ? 'こんにちは / コンニチハ' : 'konnichiwa, arigatou, tokyo'}
          className="w-full h-32 p-4 border border-gray-200 rounded-xl resize-none text-base focus:outline-none focus:ring-2 focus:ring-brand-400"
        />

        <div className="relative">
          <textarea
            value={output}
            readOnly
            placeholder="…"
            className="w-full h-32 p-4 border border-gray-200 rounded-xl resize-none text-base bg-gray-50 text-gray-800 focus:outline-none"
          />
          {output && (
            <button onClick={copy} className="absolute top-2 right-2 text-xs bg-white border border-gray-200 px-2 py-1 rounded-lg hover:bg-gray-50 transition-colors">
              {copied ? '✓ '+t('ui_copied') : t('ui_copy')}
            </button>
          )}
        </div>

        <p className="text-xs text-gray-400">
          {t('rk_stats',{i:input.length,o:output.length})}
        </p>
      </div>

    </ToolLayout>
  )
}
