import { KR_JA } from './kr-ja-dict'
import { KR_EN } from './kr-en-dict'

export type Lang = 'ko' | 'ja' | 'en'

// Korean antonym pairs (bidirectional). Japanese/English versions are derived
// from the shared trilingual dictionaries, so adding a pair here can power all
// three antonym tools at once. Pairs are chosen so both words exist in the
// dictionaries wherever possible (a pair missing a translation simply won't
// appear in that language's tool, but always works in Korean).
export const PAIRS: [string, string][] = [
  // 형용사
  ['크다', '작다'], ['높다', '낮다'], ['많다', '적다'], ['빠르다', '느리다'], ['길다', '짧다'],
  ['넓다', '좁다'], ['두껍다', '얇다'], ['깊다', '얕다'], ['굵다', '가늘다'], ['무겁다', '가볍다'],
  ['강하다', '약하다'], ['단단하다', '부드럽다'], ['덥다', '춥다'], ['뜨겁다', '차갑다'], ['밝다', '어둡다'],
  ['좋다', '나쁘다'], ['새롭다', '낡다'], ['쉽다', '어렵다'], ['깨끗하다', '더럽다'], ['예쁘다', '못생기다'],
  ['재미있다', '재미없다'], ['맛있다', '맛없다'], ['부지런하다', '게으르다'], ['건강하다', '아프다'],
  ['안전하다', '위험하다'], ['편하다', '불편하다'], ['가깝다', '멀다'], ['같다', '다르다'], ['시끄럽다', '조용하다'],
  ['바쁘다', '한가하다'], ['젊다', '늙다'], ['단순하다', '복잡하다'], ['풍부하다', '부족하다'],
  ['충분하다', '부족하다'], ['특별하다', '평범하다'], ['똑똑하다', '둔하다'], ['친절하다', '엄격하다'],
  // 동사
  ['가다', '오다'], ['사다', '팔다'], ['열다', '닫다'], ['웃다', '울다'], ['시작하다', '끝나다'],
  ['이기다', '지다'], ['주다', '받다'], ['앉다', '서다'], ['자다', '일어나다'], ['들어가다', '나오다'],
  ['올라가다', '내려가다'], ['늘다', '줄다'], ['더하다', '빼다'], ['살다', '죽다'], ['사랑하다', '미워하다'],
  ['기억하다', '잊다'], ['만나다', '헤어지다'], ['입다', '벗다'], ['켜다', '끄다'], ['알다', '모르다'],
  ['성공하다', '실패하다'], ['가르치다', '배우다'], ['밀다', '당기다'], ['넣다', '꺼내다'], ['빌리다', '갚다'],
  ['채우다', '비우다'], ['붙이다', '떼다'], ['늘리다', '줄이다'], ['보내다', '받다'], ['나타나다', '사라지다'],
  // 명사
  ['남자', '여자'], ['낮', '밤'], ['아침', '저녁'], ['시작', '끝'], ['처음', '마지막'], ['앞', '뒤'],
  ['왼쪽', '오른쪽'], ['안', '밖'], ['동쪽', '서쪽'], ['남쪽', '북쪽'], ['하늘', '땅'], ['어른', '아이'],
  ['선생님', '학생'], ['질문', '대답'], ['천국', '지옥'], ['과거', '미래'], ['입구', '출구'],
  ['장점', '단점'], ['부분', '전체'], ['수입', '수출'], ['홀수', '짝수'], ['양수', '음수'],
]

// Strip disambiguating parentheticals, e.g. '가지(나무)' -> '가지'.
function cleanKo(s: string): string {
  return s.replace(/\(.*?\)/g, '').trim()
}

/** Value of a Korean key in the requested display language. */
function val(ko: string, lang: Lang): string | undefined {
  return lang === 'ko' ? cleanKo(ko) : lang === 'ja' ? KR_JA[ko] : KR_EN[ko]
}

/**
 * Build a word -> opposite lookup for the requested language. Korean covers
 * every pair; Japanese/English cover pairs whose both words are translated.
 */
export function buildAntonymDict(lang: Lang): Record<string, string> {
  const map: Record<string, string> = {}
  const add = (from: string, to: string) => {
    const keys = lang === 'ja' ? from.split('・').map((x) => x.trim()) : lang === 'en' ? [from.toLowerCase()] : [from]
    for (const k of keys) if (k && !(k in map)) map[k] = to
  }
  for (const [a, b] of PAIRS) {
    const va = val(a, lang)
    const vb = val(b, lang)
    if (!va || !vb) continue
    add(va, vb)
    add(vb, va)
  }
  return map
}
