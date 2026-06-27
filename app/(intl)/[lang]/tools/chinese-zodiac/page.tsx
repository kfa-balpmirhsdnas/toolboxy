'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'

const tool = getToolBySlug('chinese-zodiac')!

// index = year % 12
const ANIMALS = [
  { emoji: '🐵', ko: '원숭이', ja: '猿', en: 'Monkey' }, { emoji: '🐔', ko: '닭', ja: '鶏', en: 'Rooster' },
  { emoji: '🐶', ko: '개', ja: '犬', en: 'Dog' }, { emoji: '🐷', ko: '돼지', ja: '猪', en: 'Pig' },
  { emoji: '🐭', ko: '쥐', ja: '鼠', en: 'Rat' }, { emoji: '🐮', ko: '소', ja: '牛', en: 'Ox' },
  { emoji: '🐯', ko: '호랑이', ja: '虎', en: 'Tiger' }, { emoji: '🐰', ko: '토끼', ja: '兎', en: 'Rabbit' },
  { emoji: '🐲', ko: '용', ja: '竜', en: 'Dragon' }, { emoji: '🐍', ko: '뱀', ja: '蛇', en: 'Snake' },
  { emoji: '🐴', ko: '말', ja: '馬', en: 'Horse' }, { emoji: '🐑', ko: '양', ja: '羊', en: 'Goat' },
]
const STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸']
const STEMS_KO = ['갑', '을', '병', '정', '무', '기', '경', '신', '임', '계']
const BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']
const BRANCHES_KO = ['자', '축', '인', '묘', '진', '사', '오', '미', '신', '유', '술', '해']
const ELEMENTS = { ko: ['목', '화', '토', '금', '수'], ja: ['木', '火', '土', '金', '水'], en: ['Wood', 'Fire', 'Earth', 'Metal', 'Water'] }
const COLORS = { ko: ['청', '적', '황', '백', '흑'], ja: ['青', '赤', '黄', '白', '黒'], en: ['Blue', 'Red', 'Yellow', 'White', 'Black'] }
const HEX = ['#2563eb', '#dc2626', '#d97706', '#6b7280', '#1f2937']
const mod = (n: number, m: number) => ((n % m) + m) % m

export default function ChineseZodiacPage({ params }: { params: { lang: string } }) {
  const t = useTranslations('toolui')
  const lang = (params.lang === 'ja' || params.lang === 'en') ? params.lang : 'ko'
  const [year, setYear] = useState(String(new Date().getFullYear()))
  const y = parseInt(year, 10)
  const ok = !isNaN(y) && y >= 1 && y <= 9999

  const ai = mod(y, 12), si = mod(y - 4, 10), bi = mod(y - 4, 12), ei = Math.floor(si / 2)
  const animal = ANIMALS[ai]
  const ganzi = STEMS[si] + BRANCHES[bi]
  const ganziKo = STEMS_KO[si] + BRANCHES_KO[bi]
  const colorAnimal = lang === 'ko' ? `${COLORS.ko[ei]}색 ${animal.ko}` : lang === 'ja' ? `${COLORS.ja[ei]}い${animal.ja}` : `${COLORS.en[ei]} ${animal.en}`
  const recent = ok ? [-24, -12, 0, 12, 24].map((d) => y + d).filter((yy) => yy > 0) : []

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="max-w-md mx-auto space-y-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('cz_title')}</h1>
          <p className="text-gray-500 text-sm mt-1">{t('cz_subtitle')}</p>
        </div>

        <label className="flex flex-col gap-1 text-sm text-gray-600">{t('cz_birthyear')}
          <input value={year} onChange={(e) => setYear(e.target.value)} type="search" inputMode="numeric" name="tbx-year"
            autoComplete="off" data-1p-ignore data-lpignore="true"
            className="rounded-xl border border-gray-200 px-3 py-2.5 text-lg focus:outline-none focus:ring-2 focus:ring-brand-400" />
        </label>

        {ok && (
          <>
            <div className="rounded-2xl border-2 p-6 text-center" style={{ borderColor: HEX[ei], background: HEX[ei] + '12' }}>
              <div className="text-6xl">{animal.emoji}</div>
              <div className="text-2xl font-bold mt-2" style={{ color: HEX[ei] }}>{colorAnimal}</div>
              <div className="text-sm text-gray-500 mt-1">{lang === 'ko' ? `${animal.ko}띠` : animal[lang]}</div>
            </div>

            <div className="rounded-xl border border-gray-100 divide-y divide-gray-100 text-sm">
              <div className="flex justify-between px-4 py-2.5"><span className="text-gray-500">{t('cz_ganzi')}</span><span className="font-bold text-gray-800">{ganzi} <span className="font-normal text-gray-400">{ganziKo}</span></span></div>
              <div className="flex justify-between px-4 py-2.5"><span className="text-gray-500">{t('cz_element')}</span><span className="font-medium text-gray-800">{ELEMENTS[lang][ei]} · {COLORS[lang][ei]}</span></div>
              <div className="flex justify-between px-4 py-2.5"><span className="text-gray-500">{t('cz_sameyears')}</span><span className="font-medium text-gray-800 tabular-nums">{recent.join(', ')}</span></div>
            </div>
          </>
        )}
        <p className="text-xs text-gray-400">{t('cz_note')}</p>
      </div>
    </ToolLayout>
  )
}
