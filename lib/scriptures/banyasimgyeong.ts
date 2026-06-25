// 반야심경 (Banya-simgyeong / Heart Sutra / 般若心経) — recitation viewer data.
//
// hanja (원문) + readings are public/standard; `translation`/`translationJa`
// (meanings) are ToolBoxy's OWN plain-prose renderings. readingJa is the standard
// Japanese 呉音 reading (般若心経 is widely chanted in Japan). The closing mantra is
// a transliteration and is left untranslated.

import type { SutraLine } from './types'

export const BANYASIMGYEONG: SutraLine[] = [
  { order: 2, section: 1, sectionKo: '마하반야바라밀다심경', sectionHanja: '摩訶般若波羅蜜多心經', type: '본문',
    hanja: '觀自在菩薩 行深般若波羅蜜多時', reading: '관자재보살 행심반야바라밀다시', readingJa: 'かんじざいぼさつ ぎょうじんはんにゃはらみたじ',
    translation: '관자재보살이 깊은 반야바라밀다를 행할 때', translationJa: '観自在菩薩が深い般若波羅蜜多を行じたとき', repeat: 1, note: '' },
  { order: 3, section: 1, sectionKo: '마하반야바라밀다심경', sectionHanja: '摩訶般若波羅蜜多心經', type: '본문',
    hanja: '照見五蘊皆空 度一切苦厄', reading: '조견오온개공 도일체고액', readingJa: 'しょうけんごうんかいくう どいっさいくやく',
    translation: '다섯 쌓임(오온)이 모두 공함을 비추어 보고, 온갖 괴로움과 재앙을 건넜다', translationJa: '五蘊がみな空であると照らし見て、一切の苦しみと災いを度した', repeat: 1, note: '' },

  { order: 4, section: 2, sectionKo: '색즉시공', sectionHanja: '色卽是空', type: '본문',
    hanja: '舍利子 色不異空 空不異色', reading: '사리자 색불이공 공불이색', readingJa: 'しゃりし しきふいくう くうふいしき',
    translation: '사리자여, 색(물질)이 공과 다르지 않고 공이 색과 다르지 않으며', translationJa: '舎利子よ、色は空と異ならず、空は色と異ならず', repeat: 1, note: '' },
  { order: 5, section: 2, sectionKo: '색즉시공', sectionHanja: '色卽是空', type: '본문',
    hanja: '色卽是空 空卽是色 受想行識 亦復如是', reading: '색즉시공 공즉시색 수상행식 역부여시', readingJa: 'しきそくぜくう くうそくぜしき じゅそうぎょうしき やくぶにょぜ',
    translation: '색이 곧 공이요 공이 곧 색이니, 느낌·생각·지음·의식도 또한 이와 같다', translationJa: '色がすなわち空、空がすなわち色であり、受・想・行・識もまたかくのごとし', repeat: 1, note: '' },

  { order: 6, section: 3, sectionKo: '제법공상', sectionHanja: '諸法空相', type: '본문',
    hanja: '舍利子 是諸法空相', reading: '사리자 시제법공상', readingJa: 'しゃりし ぜしょほうくうそう',
    translation: '사리자여, 이 모든 법의 공한 모습은', translationJa: '舎利子よ、この諸法の空なる相は', repeat: 1, note: '' },
  { order: 7, section: 3, sectionKo: '제법공상', sectionHanja: '諸法空相', type: '본문',
    hanja: '不生不滅 不垢不淨 不增不減', reading: '불생불멸 불구부정 부증불감', readingJa: 'ふしょうふめつ ふくふじょう ふぞうふげん',
    translation: '나지도 멸하지도 않고, 더럽지도 깨끗하지도 않으며, 늘지도 줄지도 않는다', translationJa: '生ぜず滅せず、垢つかず浄からず、増えず減らず', repeat: 1, note: '' },

  { order: 8, section: 4, sectionKo: '공중무색', sectionHanja: '空中無色', type: '본문',
    hanja: '是故空中無色 無受想行識', reading: '시고공중무색 무수상행식', readingJa: 'ぜこくうちゅうむしき むじゅそうぎょうしき',
    translation: '그러므로 공 가운데는 색이 없고, 느낌·생각·지음·의식도 없으며', translationJa: 'ゆえに空の中には色なく、受・想・行・識もなく', repeat: 1, note: '' },
  { order: 9, section: 4, sectionKo: '공중무색', sectionHanja: '空中無色', type: '본문',
    hanja: '無眼耳鼻舌身意 無色聲香味觸法', reading: '무안이비설신의 무색성향미촉법', readingJa: 'むげんにびぜっしんに むしきしょうこうみそくほう',
    translation: '눈·귀·코·혀·몸·뜻도 없고, 색·소리·향·맛·촉감·법도 없으며', translationJa: '眼・耳・鼻・舌・身・意もなく、色・声・香・味・触・法もなく', repeat: 1, note: '' },
  { order: 10, section: 4, sectionKo: '공중무색', sectionHanja: '空中無色', type: '본문',
    hanja: '無眼界 乃至無意識界', reading: '무안계 내지무의식계', readingJa: 'むげんかい ないしむいしきかい',
    translation: '눈의 경계도 없고, 나아가 의식의 경계까지도 없다', translationJa: '眼界もなく、ないし意識界もなし', repeat: 1, note: '' },

  { order: 11, section: 5, sectionKo: '무무명', sectionHanja: '無無明', type: '본문',
    hanja: '無無明 亦無無明盡 乃至無老死 亦無老死盡', reading: '무무명 역무무명진 내지무노사 역무노사진', readingJa: 'むむみょう やくむむみょうじん ないしむろうし やくむろうしじん',
    translation: '무명도 없고 무명이 다함도 없으며, 나아가 늙고 죽음도 없고 늙고 죽음이 다함도 없다', translationJa: '無明もなく、無明の尽きることもなく、ないし老死もなく、老死の尽きることもなし', repeat: 1, note: '' },
  { order: 12, section: 5, sectionKo: '무무명', sectionHanja: '無無明', type: '본문',
    hanja: '無苦集滅道 無智亦無得', reading: '무고집멸도 무지역무득', readingJa: 'むくしゅうめつどう むちやくむとく',
    translation: '괴로움·괴로움의 원인·소멸·길도 없고, 지혜도 없고 얻음도 없다', translationJa: '苦・集・滅・道もなく、智もなく、また得もなし', repeat: 1, note: '' },

  { order: 13, section: 6, sectionKo: '보리살타', sectionHanja: '菩提薩埵', type: '본문',
    hanja: '以無所得故 菩提薩埵 依般若波羅蜜多故 心無罣礙', reading: '이무소득고 보리살타 의반야바라밀다고 심무가애', readingJa: 'いむしょとくこ ぼだいさった えはんにゃはらみたこ しんむけいげ',
    translation: '얻을 것이 없는 까닭에, 보살은 반야바라밀다에 의지하므로 마음에 걸림이 없고', translationJa: '得るところなきがゆえに、菩薩は般若波羅蜜多によるがゆえに、心にさわりなく', repeat: 1, note: '' },
  { order: 14, section: 6, sectionKo: '보리살타', sectionHanja: '菩提薩埵', type: '본문',
    hanja: '無罣礙故 無有恐怖 遠離顚倒夢想 究竟涅槃', reading: '무가애고 무유공포 원리전도몽상 구경열반', readingJa: 'むけいげこ むうくふ おんりてんどうむそう くきょうねはん',
    translation: '걸림이 없으므로 두려움이 없으며, 뒤바뀐 헛된 생각을 멀리 떠나 마침내 열반에 이른다', translationJa: 'さわりなきがゆえに恐怖あることなく、顚倒した夢想を遠く離れて、究竟の涅槃にいたる', repeat: 1, note: '' },

  { order: 15, section: 7, sectionKo: '삼세제불', sectionHanja: '三世諸佛', type: '본문',
    hanja: '三世諸佛 依般若波羅蜜多故 得阿耨多羅三藐三菩提', reading: '삼세제불 의반야바라밀다고 득아뇩다라삼먁삼보리', readingJa: 'さんぜしょぶつ えはんにゃはらみたこ とくあのくたらさんみゃくさんぼだい',
    translation: '삼세의 모든 부처님도 반야바라밀다에 의지하므로 위없는 바른 깨달음(아뇩다라삼먁삼보리)을 얻는다', translationJa: '三世の諸仏も般若波羅蜜多によるがゆえに、阿耨多羅三藐三菩提を得たまえり', repeat: 1, note: '' },

  { order: 16, section: 8, sectionKo: '대신주', sectionHanja: '大神呪', type: '본문',
    hanja: '故知般若波羅蜜多 是大神呪 是大明呪', reading: '고지반야바라밀다 시대신주 시대명주', readingJa: 'こちはんにゃはらみた ぜだいじんしゅ ぜだいみょうしゅ',
    translation: '그러므로 알라, 반야바라밀다는 크게 신령한 주문이요 크게 밝은 주문이며', translationJa: 'ゆえに知る、般若波羅蜜多はこれ大神呪、これ大明呪', repeat: 1, note: '' },
  { order: 17, section: 8, sectionKo: '대신주', sectionHanja: '大神呪', type: '본문',
    hanja: '是無上呪 是無等等呪 能除一切苦 眞實不虛', reading: '시무상주 시무등등주 능제일체고 진실불허', readingJa: 'ぜむじょうしゅ ぜむとうどうしゅ のうじょいっさいく しんじつふこ',
    translation: '위없는 주문이요 견줄 데 없는 주문이니, 능히 온갖 괴로움을 없애며 진실하여 헛되지 않다', translationJa: 'これ無上呪、これ無等等呪なり。よく一切の苦を除き、真実にして虚しからず', repeat: 1, note: '' },

  { order: 18, section: 9, sectionKo: '반야심경 진언', sectionHanja: '般若心經 眞言', type: '진언',
    hanja: '故說般若波羅蜜多呪 卽說呪曰', reading: '고설반야바라밀다주 즉설주왈', readingJa: 'こせつはんにゃはらみたしゅ そくせつしゅわつ',
    translation: '그러므로 반야바라밀다의 주문을 말하노니, 곧 주문을 일러 가로되', translationJa: 'ゆえに般若波羅蜜多の呪を説く。すなわち呪を説いて曰く', repeat: 1, note: '' },
  { order: 19, section: 9, sectionKo: '반야심경 진언', sectionHanja: '般若心經 眞言', type: '진언',
    hanja: '揭帝揭帝 波羅揭帝 波羅僧揭帝 菩提 娑婆訶', reading: '아제아제 바라아제 바라승아제 모지 사바하', readingJa: 'ぎゃーてい ぎゃーてい はーらーぎゃーてい はらそうぎゃーてい ぼーじー そわか',
    translation: '', translationJa: '', repeat: 3, note: '음역 진언 — 번역하지 않고 음 그대로 봉독 (세 번)' },
]
