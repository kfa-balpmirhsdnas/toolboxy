// 삼국지풍 이름 생성기 — 글자 풀 + 결정론 로직 (같은 입력 = 같은 결과).
// 글자 풀은 실제 삼국지 인명에 쓰인 한자 위주, 부정적 의미 글자 제외 (t3 ⑥ 규칙).
import type { TKL } from './tkCommon'

export interface NameGlyph { hanja: string; ko: string; ja: string; pinyin: string; mean: TKL }
export interface GivenGlyph extends NameGlyph { tags: TKTrait[]; pair: string } // pair: 자(字)에서 호응하는 글자
export type TKTrait = 'brave' | 'wise' | 'loyal' | 'calm' | 'free' | 'ambitious' | 'kind' | 'bold'

export const TRAITS: { id: TKTrait; label: TKL }[] = [
  { id: 'brave', label: { ko: '용감', ja: '勇敢', en: 'Brave' } },
  { id: 'wise', label: { ko: '지혜', ja: '知恵', en: 'Wise' } },
  { id: 'loyal', label: { ko: '의리', ja: '義理', en: 'Loyal' } },
  { id: 'calm', label: { ko: '신중', ja: '慎重', en: 'Careful' } },
  { id: 'free', label: { ko: '자유', ja: '自由', en: 'Free-spirited' } },
  { id: 'ambitious', label: { ko: '야망', ja: '野望', en: 'Ambitious' } },
  { id: 'kind', label: { ko: '온화', ja: '温和', en: 'Gentle' } },
  { id: 'bold', label: { ko: '과감', ja: '果敢', en: 'Bold' } },
]

// 삼국지 등장 성씨 풀 (20)
export const SURNAMES: NameGlyph[] = [
  { hanja: '曹', ko: '조', ja: 'そう', pinyin: 'Cáo', mean: { ko: '무리·조정', ja: '一族・朝廷', en: 'company; court' } },
  { hanja: '劉', ko: '유', ja: 'りゅう', pinyin: 'Liú', mean: { ko: '한 황실의 성', ja: '漢皇室の姓', en: 'the imperial Han surname' } },
  { hanja: '孫', ko: '손', ja: 'そん', pinyin: 'Sūn', mean: { ko: '자손·이어짐', ja: '子孫・継承', en: 'descendants; lineage' } },
  { hanja: '諸葛', ko: '제갈', ja: 'しょかつ', pinyin: 'Zhūgě', mean: { ko: '와룡의 복성', ja: '臥龍の複姓', en: 'the Sleeping Dragon’s surname' } },
  { hanja: '司馬', ko: '사마', ja: 'しば', pinyin: 'Sīmǎ', mean: { ko: '군마를 관장하는 벼슬', ja: '軍馬を司る官', en: 'master of horse (an office)' } },
  { hanja: '夏侯', ko: '하후', ja: 'かこう', pinyin: 'Xiàhóu', mean: { ko: '하나라 제후의 후예', ja: '夏の諸侯の後裔', en: 'heirs of the Xia lords' } },
  { hanja: '周', ko: '주', ja: 'しゅう', pinyin: 'Zhōu', mean: { ko: '두루 미침', ja: 'あまねく', en: 'all-encompassing' } },
  { hanja: '陸', ko: '육', ja: 'りく', pinyin: 'Lù', mean: { ko: '너른 땅', ja: '広い大地', en: 'broad land' } },
  { hanja: '趙', ko: '조', ja: 'ちょう', pinyin: 'Zhào', mean: { ko: '옛 조나라', ja: '古の趙国', en: 'the old state of Zhao' } },
  { hanja: '馬', ko: '마', ja: 'ば', pinyin: 'Mǎ', mean: { ko: '말·기마', ja: '馬・騎馬', en: 'horse; cavalry' } },
  { hanja: '黃', ko: '황', ja: 'こう', pinyin: 'Huáng', mean: { ko: '누런 빛·대지', ja: '黄色・大地', en: 'gold-yellow; the earth' } },
  { hanja: '關', ko: '관', ja: 'かん', pinyin: 'Guān', mean: { ko: '관문', ja: '関所', en: 'the gate-pass' } },
  { hanja: '張', ko: '장', ja: 'ちょう', pinyin: 'Zhāng', mean: { ko: '활을 당김·펼침', ja: '弓を張る・広げる', en: 'to draw a bow; to unfurl' } },
  { hanja: '荀', ko: '순', ja: 'じゅん', pinyin: 'Xún', mean: { ko: '향초의 이름', ja: '香草の名', en: 'a fragrant herb' } },
  { hanja: '郭', ko: '곽', ja: 'かく', pinyin: 'Guō', mean: { ko: '성곽', ja: '城郭', en: 'city walls' } },
  { hanja: '呂', ko: '여', ja: 'りょ', pinyin: 'Lǚ', mean: { ko: '등뼈·음률', ja: '背骨・音律', en: 'backbone; pitch-pipe' } },
  { hanja: '姜', ko: '강', ja: 'きょう', pinyin: 'Jiāng', mean: { ko: '강족·옛 성', ja: '羌族・古姓', en: 'an ancient clan name' } },
  { hanja: '魯', ko: '노', ja: 'ろ', pinyin: 'Lǔ', mean: { ko: '공자의 나라', ja: '孔子の国', en: 'Confucius’ home state' } },
  { hanja: '龐', ko: '방', ja: 'ほう', pinyin: 'Páng', mean: { ko: '크고 높음', ja: '大きく高い', en: 'great and lofty' } },
  { hanja: '甘', ko: '감', ja: 'かん', pinyin: 'Gān', mean: { ko: '달콤함·기꺼움', ja: '甘美・快く', en: 'sweetness; willingness' } },
]

// 외자 이름 풀 (24) — tags: 성향·키워드 가중, pair: 자(字)에서 뜻이 호응하는 글자 (작명 관례 반영)
export const GIVENS: GivenGlyph[] = [
  { hanja: '亮', ko: '량', ja: 'りょう', pinyin: 'liàng', mean: { ko: '밝게 빛남', ja: '明るく輝く', en: 'bright, luminous' }, tags: ['wise'], pair: '明' },
  { hanja: '雲', ko: '운', ja: 'うん', pinyin: 'yún', mean: { ko: '높이 떠가는 구름', ja: '高く流れる雲', en: 'soaring cloud' }, tags: ['free', 'loyal'], pair: '龍' },
  { hanja: '策', ko: '책', ja: 'さく', pinyin: 'cè', mean: { ko: '계책·채찍', ja: '策・鞭', en: 'stratagem; the spur' }, tags: ['ambitious', 'bold'], pair: '符' },
  { hanja: '權', ko: '권', ja: 'けん', pinyin: 'quán', mean: { ko: '저울추·권도', ja: '秤・権道', en: 'the balance; adaptive judgment' }, tags: ['calm', 'ambitious'], pair: '謀' },
  { hanja: '瑜', ko: '유', ja: 'ゆ', pinyin: 'yú', mean: { ko: '아름다운 옥', ja: '美しい玉', en: 'fine jade' }, tags: ['wise', 'free'], pair: '瑾' },
  { hanja: '遜', ko: '손', ja: 'そん', pinyin: 'xùn', mean: { ko: '겸손함', ja: '謙遜', en: 'modesty' }, tags: ['calm', 'wise'], pair: '言' },
  { hanja: '忠', ko: '충', ja: 'ちゅう', pinyin: 'zhōng', mean: { ko: '곧은 충심', ja: 'まっすぐな忠心', en: 'steadfast loyalty' }, tags: ['loyal'], pair: '義' },
  { hanja: '義', ko: '의', ja: 'ぎ', pinyin: 'yì', mean: { ko: '올바름·의리', ja: '正しさ・義理', en: 'righteousness' }, tags: ['loyal', 'brave'], pair: '信' },
  { hanja: '勇', ko: '용', ja: 'ゆう', pinyin: 'yǒng', mean: { ko: '용맹', ja: '勇猛', en: 'valor' }, tags: ['brave', 'bold'], pair: '烈' },
  { hanja: '飛', ko: '비', ja: 'ひ', pinyin: 'fēi', mean: { ko: '날아오름', ja: '飛翔', en: 'flight' }, tags: ['brave', 'free'], pair: '翼' },
  { hanja: '虎', ko: '호', ja: 'こ', pinyin: 'hǔ', mean: { ko: '범의 위엄', ja: '虎の威厳', en: 'the tiger’s majesty' }, tags: ['brave', 'bold'], pair: '威' },
  { hanja: '龍', ko: '룡', ja: 'りゅう', pinyin: 'lóng', mean: { ko: '용의 기상', ja: '龍の気性', en: 'the dragon’s spirit' }, tags: ['ambitious', 'brave'], pair: '雲' },
  { hanja: '謙', ko: '겸', ja: 'けん', pinyin: 'qiān', mean: { ko: '낮추는 덕', ja: 'へりくだる徳', en: 'humility' }, tags: ['kind', 'calm'], pair: '和' },
  { hanja: '寧', ko: '녕', ja: 'ねい', pinyin: 'níng', mean: { ko: '평안함', ja: '安寧', en: 'tranquility' }, tags: ['calm', 'kind'], pair: '靜' },
  { hanja: '徽', ko: '휘', ja: 'き', pinyin: 'huī', mean: { ko: '아름다운 표지', ja: '美しい旗印', en: 'a beautiful emblem' }, tags: ['wise', 'kind'], pair: '文' },
  { hanja: '毅', ko: '의', ja: 'き', pinyin: 'yì', mean: { ko: '굳센 의지', ja: '強い意志', en: 'resolute will' }, tags: ['bold', 'loyal'], pair: '剛' },
  { hanja: '恂', ko: '순', ja: 'じゅん', pinyin: 'xún', mean: { ko: '미쁘고 정성스러움', ja: '誠実', en: 'sincerity' }, tags: ['kind', 'loyal'], pair: '誠' },
  { hanja: '曄', ko: '엽', ja: 'よう', pinyin: 'yè', mean: { ko: '환하게 빛남', ja: '光り輝く', en: 'radiance' }, tags: ['ambitious', 'wise'], pair: '光' },
  { hanja: '衡', ko: '형', ja: 'こう', pinyin: 'héng', mean: { ko: '치우침 없는 저울', ja: '偏りなき秤', en: 'the even balance' }, tags: ['calm', 'wise'], pair: '平' },
  { hanja: '嵩', ko: '숭', ja: 'すう', pinyin: 'sōng', mean: { ko: '높은 산', ja: '高い山', en: 'a lofty mountain' }, tags: ['calm', 'brave'], pair: '岳' },
  { hanja: '朗', ko: '랑', ja: 'ろう', pinyin: 'lǎng', mean: { ko: '맑고 명랑함', ja: '朗らか', en: 'clear and cheerful' }, tags: ['free', 'kind'], pair: '晴' },
  { hanja: '翔', ko: '상', ja: 'しょう', pinyin: 'xiáng', mean: { ko: '높이 날아 돎', ja: '高く舞う', en: 'to soar' }, tags: ['free', 'ambitious'], pair: '風' },
  { hanja: '睿', ko: '예', ja: 'えい', pinyin: 'ruì', mean: { ko: '깊고 밝은 슬기', ja: '深く明るい叡智', en: 'profound wisdom' }, tags: ['wise', 'ambitious'], pair: '哲' },
  { hanja: '烈', ko: '렬', ja: 'れつ', pinyin: 'liè', mean: { ko: '맹렬한 기세', ja: '猛烈な気勢', en: 'fierce ardor' }, tags: ['bold', 'brave'], pair: '炎' },
]

// 자(字) 앞글자 풀 (10) — 실제 자 관례에서 흔한 미칭·서열자
export const COURTESY_PREFIX: NameGlyph[] = [
  { hanja: '子', ko: '자', ja: 'し', pinyin: 'zǐ', mean: { ko: '어른에 대한 미칭', ja: '敬称', en: 'honorific "master"' } },
  { hanja: '文', ko: '문', ja: 'ぶん', pinyin: 'wén', mean: { ko: '글·문덕', ja: '文の徳', en: 'letters; civil virtue' } },
  { hanja: '公', ko: '공', ja: 'こう', pinyin: 'gōng', mean: { ko: '공변됨·존칭', ja: '公正・尊称', en: 'impartial; lordly' } },
  { hanja: '伯', ko: '백', ja: 'はく', pinyin: 'bó', mean: { ko: '맏이', ja: '長子', en: 'the eldest' } },
  { hanja: '仲', ko: '중', ja: 'ちゅう', pinyin: 'zhòng', mean: { ko: '둘째', ja: '次子', en: 'the second-born' } },
  { hanja: '孟', ko: '맹', ja: 'もう', pinyin: 'mèng', mean: { ko: '첫째·으뜸', ja: '長・首位', en: 'first; foremost' } },
  { hanja: '德', ko: '덕', ja: 'とく', pinyin: 'dé', mean: { ko: '덕성', ja: '徳', en: 'virtue' } },
  { hanja: '元', ko: '원', ja: 'げん', pinyin: 'yuán', mean: { ko: '으뜸·근원', ja: '元・根源', en: 'origin; prime' } },
  { hanja: '士', ko: '사', ja: 'し', pinyin: 'shì', mean: { ko: '선비', ja: '士人', en: 'the scholar-knight' } },
  { hanja: '幼', ko: '유', ja: 'よう', pinyin: 'yòu', mean: { ko: '막내·젊음', ja: '末子・若さ', en: 'the youngest' } },
]

// 자(字) 뒷글자(호응자) 독음 사전 — GIVENS.pair에 등장하는 글자들
export const PAIR_GLYPHS: Record<string, NameGlyph> = Object.fromEntries(([
  { hanja: '明', ko: '명', ja: 'めい', pinyin: 'míng', mean: { ko: '밝음', ja: '明るさ', en: 'brightness' } },
  { hanja: '龍', ko: '룡', ja: 'りゅう', pinyin: 'lóng', mean: { ko: '용', ja: '龍', en: 'dragon' } },
  { hanja: '符', ko: '부', ja: 'ふ', pinyin: 'fú', mean: { ko: '부절·징표', ja: '割符・証', en: 'the tally; a sign' } },
  { hanja: '謀', ko: '모', ja: 'ぼう', pinyin: 'móu', mean: { ko: '꾀', ja: '謀', en: 'strategy' } },
  { hanja: '瑾', ko: '근', ja: 'きん', pinyin: 'jǐn', mean: { ko: '아름다운 옥', ja: '美玉', en: 'fine jade' } },
  { hanja: '言', ko: '언', ja: 'げん', pinyin: 'yán', mean: { ko: '말·언약', ja: '言葉・約束', en: 'words; a pledge' } },
  { hanja: '義', ko: '의', ja: 'ぎ', pinyin: 'yì', mean: { ko: '의로움', ja: '義', en: 'righteousness' } },
  { hanja: '信', ko: '신', ja: 'しん', pinyin: 'xìn', mean: { ko: '믿음', ja: '信', en: 'trust' } },
  { hanja: '烈', ko: '렬', ja: 'れつ', pinyin: 'liè', mean: { ko: '맹렬함', ja: '猛烈', en: 'ardor' } },
  { hanja: '翼', ko: '익', ja: 'よく', pinyin: 'yì', mean: { ko: '날개', ja: '翼', en: 'wings' } },
  { hanja: '威', ko: '위', ja: 'い', pinyin: 'wēi', mean: { ko: '위엄', ja: '威厳', en: 'majesty' } },
  { hanja: '雲', ko: '운', ja: 'うん', pinyin: 'yún', mean: { ko: '구름', ja: '雲', en: 'cloud' } },
  { hanja: '和', ko: '화', ja: 'わ', pinyin: 'hé', mean: { ko: '어울림', ja: '和', en: 'harmony' } },
  { hanja: '靜', ko: '정', ja: 'せい', pinyin: 'jìng', mean: { ko: '고요함', ja: '静けさ', en: 'stillness' } },
  { hanja: '文', ko: '문', ja: 'ぶん', pinyin: 'wén', mean: { ko: '글월', ja: '文', en: 'letters' } },
  { hanja: '剛', ko: '강', ja: 'ごう', pinyin: 'gāng', mean: { ko: '굳셈', ja: '剛', en: 'firmness' } },
  { hanja: '誠', ko: '성', ja: 'せい', pinyin: 'chéng', mean: { ko: '정성', ja: '誠', en: 'sincerity' } },
  { hanja: '光', ko: '광', ja: 'こう', pinyin: 'guāng', mean: { ko: '빛', ja: '光', en: 'light' } },
  { hanja: '平', ko: '평', ja: 'へい', pinyin: 'píng', mean: { ko: '평평함·공평', ja: '平ら・公平', en: 'evenness; fairness' } },
  { hanja: '岳', ko: '악', ja: 'がく', pinyin: 'yuè', mean: { ko: '큰 산', ja: '高山', en: 'a great peak' } },
  { hanja: '晴', ko: '청', ja: 'せい', pinyin: 'qíng', mean: { ko: '갬·맑음', ja: '晴れ', en: 'clear skies' } },
  { hanja: '風', ko: '풍', ja: 'ふう', pinyin: 'fēng', mean: { ko: '바람', ja: '風', en: 'wind' } },
  { hanja: '哲', ko: '철', ja: 'てつ', pinyin: 'zhé', mean: { ko: '밝은 지혜', ja: '哲', en: 'sagacity' } },
  { hanja: '炎', ko: '염', ja: 'えん', pinyin: 'yán', mean: { ko: '불꽃', ja: '炎', en: 'flame' } },
] as NameGlyph[]).map((g) => [g.hanja, g]))

// 성향·키워드 → 어울리는 인물 후보 (허브 ID)
export const TRAIT_CHARS: Record<TKTrait, string[]> = {
  brave: ['guan-yu', 'zhang-fei', 'zhao-yun', 'ma-chao', 'taishi-ci'],
  wise: ['zhuge-liang', 'guo-jia', 'lu-xun', 'xun-yu', 'pang-tong'],
  loyal: ['guan-yu', 'zhao-yun', 'zhuge-liang', 'zhou-tai', 'chen-gong'],
  calm: ['sima-yi', 'sun-quan', 'lu-xun', 'jia-xu', 'wang-ping'],
  free: ['gan-ning', 'cao-zhi', 'lv-bu', 'pang-tong', 'hua-tuo'],
  ambitious: ['cao-cao', 'sun-ce', 'liu-bei', 'yuan-shao', 'jiang-wei'],
  kind: ['liu-bei', 'lu-su', 'ma-liang', 'cheng-pu', 'zhuge-jin'],
  bold: ['zhang-fei', 'sun-ce', 'dian-wei', 'huang-gai', 'wei-yan'],
}

// 문자열 해시 시드 (djb2) — 같은 입력이면 항상 같은 결과.
export function nameSeed(input: string): number {
  let h = 5381
  for (let i = 0; i < input.length; i++) h = ((h << 5) + h + input.charCodeAt(i)) >>> 0
  return h
}

export interface GeneratedName {
  surname: NameGlyph
  given: GivenGlyph
  prefix: NameGlyph
  pair: NameGlyph
  matchChar: string // 허브 인물 ID
}

export function generateName(input: string, traits: TKTrait[], tendency: 'civil' | 'military'): GeneratedName {
  const seed = nameSeed(input.trim() + '|' + [...traits].sort().join(',') + '|' + tendency)
  const surname = SURNAMES[seed % SURNAMES.length]
  // 이름 글자: 선택 키워드 태그가 겹치는 후보 우선, 문/무 성향 보정
  const tagged = GIVENS.filter((g) => g.tags.some((tg) => traits.includes(tg)))
  const pool = tagged.length > 0 ? tagged : GIVENS
  const given = pool[Math.floor(seed / 7) % pool.length]
  // 자: 문성향이면 文·士·德 계열, 무성향이면 伯·孟·公 계열이 상대적으로 잘 어울리게 오프셋
  const prefOffset = tendency === 'civil' ? 1 : 3
  const prefix = COURTESY_PREFIX[(Math.floor(seed / 13) + prefOffset) % COURTESY_PREFIX.length]
  const pair = PAIR_GLYPHS[given.pair]
  const charPool = TRAIT_CHARS[traits[0]] ?? TRAIT_CHARS.brave
  const matchChar = charPool[Math.floor(seed / 31) % charPool.length]
  return { surname, given, prefix, pair, matchChar }
}
