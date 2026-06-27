'use client'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'

const tool = getToolBySlug('flip-text')!

const FLIP: Record<string, string> = {
  a:'ɐ',b:'q',c:'ɔ',d:'p',e:'ǝ',f:'ɟ',g:'ƃ',
  h:'ɥ',i:'ı',j:'ɾ',k:'ʞ',l:'l',m:'w',n:'u',o:'o',
  p:'d',q:'b',r:'ɹ',s:'s',t:'ʇ',u:'n',v:'ʌ',w:'m',x:'x',
  y:'ʎ',z:'z',
  A:'∀',B:'ᗺ',C:'Ɔ',D:'ᗡ',E:'Ǝ',F:'Ⅎ',
  G:'⅁',H:'H',I:'I',J:'r',K:'⋊',L:'J',M:'W',N:'N',O:'O',
  P:'Ԁ',Q:'Ԁ',R:'ᴚ',S:'S',T:'⊥',U:'∩',
  V:'∧',W:'M',X:'X',Y:'ʎ',Z:'Z',
  '0':'0','1':'Ɩ','2':'ƻ','3':'Ɛ','4':'ូ',
  '5':'5','6':'9','7':'⅂','8':'8','9':'6',
  '.':'˙',',':'‘','?':'¿','!':'¡',
  '(':')',')':'(','[':']',']':'[','{':'}','}':'{',' ':' '
}

export default function FlipTextPage() {
  const t = useTranslations('toolui')
  const [input, setInput] = useState('')
  const flipped = input.split('').map(c => FLIP[c] ?? c).reverse().join('')

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">{t('ui_input')}</label>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={t('ft_ph')}
            rows={4}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">{t('ft_output')}</label>
          <div className="w-full border border-gray-200 bg-gray-50 rounded-lg px-4 py-3 font-mono text-gray-800 min-h-[80px] break-all">
            {flipped || <span className="text-gray-400">{t('ui_output_ph')}</span>}
          </div>
        </div>
        {flipped && (
          <button
            onClick={() => navigator.clipboard.writeText(flipped)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
          >
            {t('ui_copy')}
          </button>
        )}
      </div>
    </ToolLayout>
  )
}