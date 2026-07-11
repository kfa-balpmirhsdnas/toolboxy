import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import {
  CATEGORY_META,
  HIDDEN_CATEGORIES,
  getToolsByCategory,
  TOOLS,
  type ToolCategory,
} from '@/lib/tools/registry'
import ToolCard from '@/components/tools/ToolCard'
import { buildCategoryMetadata } from '@/lib/tools/metadata'

const CATEGORIES = Object.keys(CATEGORY_META) as ToolCategory[]

function isCategory(value: string): value is ToolCategory {
  return (CATEGORIES as string[]).includes(value)
}

export function generateStaticParams() {
  return CATEGORIES.map((category) => ({ category }))
}

export function generateMetadata({ params }: { params: { lang: string; category: string } }) {
  return buildCategoryMetadata(params.category, params.lang)
}

// 주제형 카테고리의 SEO 소개 텍스트 (t3 규칙: 카테고리 페이지 자체가 랜딩).
const CATEGORY_INTRO: Partial<Record<ToolCategory, Record<string, string>>> = {
  'three-kingdoms': {
    ko: '삼국지 카테고리는 인물 사전·고사성어·명언·전투·연표·퀴즈·성격 테스트·이름 생성기까지, 삼국지를 즐기는 8가지 도구를 모은 공간이에요. 조조·유비·제갈량 등 인물 60명과 성어 30개, 명언 40개, 15대 전투가 서로 링크로 연결되어 있어 어디서 시작해도 깊이 파고들 수 있습니다. 모든 콘텐츠는 정사(정사 주석)와 연의(소설)의 출처 배지로 구분해, 어디까지가 역사이고 어디부터가 소설인지 한눈에 알 수 있어요. 회원가입 없이 전부 무료입니다.',
    ja: '三国志カテゴリーは、人物事典・故事成語・名言・戦い・年表・クイズ・性格診断・名前メーカーまで、三国志を楽しむ8つのツールを集めた空間です。曹操・劉備・諸葛亮など人物60人と成語30、名言40、15大戦役が相互リンクでつながっており、どこから始めても深掘りできます。すべてのコンテンツは正史（正史注釈）と演義（小説）の出典バッジで区別され、どこまでが歴史でどこからが小説なのか一目でわかります。登録不要ですべて無料です。',
    en: 'The Three Kingdoms category gathers eight tools for enjoying the saga: a character dictionary, idioms, quotes, battles, a timeline, a quiz, a personality test and a name generator. Sixty figures, thirty idioms, forty quotes and fifteen battles are fully interlinked, so any page is a doorway to the rest. Every piece of content carries a source badge separating the official histories (and their annotations) from the novel — you always know where history ends and fiction begins. All free, no sign-up.',
  },
}

export default async function CategoryPage({
  params,
}: {
  params: { lang: string; category: string }
}) {
  const { lang, category } = params

  // Only real categories reach here; tool slugs match their own static
  // folders (static routes win over this dynamic segment), anything else 404s.
  if (!isCategory(category)) notFound()
  // Unlaunched categories 404 until they open (t3 rule).
  if (HIDDEN_CATEGORIES.has(category)) notFound()

  const meta = CATEGORY_META[category]
  const tools = getToolsByCategory(category)
  const t = await getTranslations({ locale: lang, namespace: 'categories' })
  const tn = await getTranslations({ locale: lang, namespace: 'nav' })
  const intro = CATEGORY_INTRO[category]?.[lang] ?? CATEGORY_INTRO[category]?.en

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href={`/${lang}/tools`} className="hover:text-brand-600 transition-colors">
          {tn('tools')}<span className="text-gray-400">({TOOLS.length})</span>
        </Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">{t(category)}<span className="text-gray-400 font-normal">({tools.length})</span></span>
      </nav>

      {/* Title */}
      <div className="flex items-center gap-3 mb-8">
        <span className="text-3xl">{meta.icon}</span>
        <h1 className="text-3xl font-bold text-gray-900">{t(category)}</h1>
        <span className="text-sm text-gray-400">({tools.length})</span>
      </div>

      {intro && <p className="text-sm text-gray-600 leading-relaxed mb-8 -mt-4 max-w-3xl">{intro}</p>}

      {tools.length === 0 ? (
        <div className="text-center text-gray-500 py-16">
          <div className="text-4xl mb-3">🚧</div>
          <Link href={`/${lang}/tools`} className="text-brand-600 hover:text-brand-700 font-medium">
            {tn('tools')} →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {tools.map((tool) => (
            <ToolCard key={tool.slug} tool={tool} lang={lang} />
          ))}
        </div>
      )}
    </div>
  )
}
