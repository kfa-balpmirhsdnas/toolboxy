// Western zodiac signs (12) + Chinese zodiac animals (띠, 12) with trilingual content for
// the longtail pages. Dates/elements/planets/trines/hours are standard tradition; the
// personality/compatibility texts are OUR OWN plain renderings of what each sign is
// traditionally said to be like (folklore, phrased as such — nothing presented as fact).

type L10n = { ko: string; ja: string; en: string }
type L10nList = { ko: string[]; ja: string[]; en: string[] }

export interface ZodiacSign {
  id: string; emoji: string
  start: [number, number]; end: [number, number] // [month, day]
  element: 'fire' | 'earth' | 'air' | 'water'
  planet: L10n
  name: L10n
  traits: L10nList
  desc: L10n
  goodWith: string[] // ids — traditionally-cited harmonious signs
}

export const ZODIAC_SIGNS: ZodiacSign[] = [
  {
    id: 'aries', emoji: '♈', start: [3, 21], end: [4, 19], element: 'fire',
    planet: { ko: '화성', ja: '火星', en: 'Mars' },
    name: { ko: '양자리', ja: '牡羊座(おひつじ座)', en: 'Aries' },
    traits: { ko: ['대담함', '모험심', '에너지', '솔직함'], ja: ['大胆', '冒険心', 'エネルギッシュ', '率直'], en: ['Bold', 'Adventurous', 'Energetic', 'Direct'] },
    desc: {
      ko: '황도 12궁의 첫 별자리인 양자리는 전통적으로 타고난 리더형으로 알려져 있어요. 생각보다 행동이 앞서는 추진력과 솔직함이 매력이지만, 성급함은 스스로 다스려야 할 과제로 이야기됩니다.',
      ja: '黄道十二宮の最初の星座であるおひつじ座は、伝統的に生まれつきのリーダータイプといわれます。考えるより先に動く推進力と率直さが魅力ですが、せっかちさは自分で抑えるべき課題とされます。',
      en: 'The first sign of the zodiac, Aries is traditionally described as a born leader — action comes before deliberation. Their drive and directness charm people, while impatience is said to be their lifelong homework.',
    },
    goodWith: ['leo', 'sagittarius', 'gemini'],
  },
  {
    id: 'taurus', emoji: '♉', start: [4, 20], end: [5, 20], element: 'earth',
    planet: { ko: '금성', ja: '金星', en: 'Venus' },
    name: { ko: '황소자리', ja: '牡牛座(おうし座)', en: 'Taurus' },
    traits: { ko: ['신뢰', '인내심', '헌신', '고집'], ja: ['信頼', '忍耐', '献身', '頑固'], en: ['Reliable', 'Patient', 'Devoted', 'Stubborn'] },
    desc: {
      ko: '황소자리는 전통적으로 꾸준함과 안정감의 상징으로 여겨져요. 한번 마음먹은 일은 끝까지 해내고 곁을 잘 지키지만, 그만큼 변화 앞에서는 고집스러워질 수 있다고 이야기됩니다.',
      ja: 'おうし座は伝統的に、粘り強さと安定感の象徴とされます。一度決めたことは最後までやり遂げ、そばにいる人を大切にしますが、その分、変化の前では頑固になりがちだといわれます。',
      en: 'Taurus is traditionally seen as the sign of steadiness and comfort. Once committed they see things through and stand by their people — though the same firmness can read as stubbornness when change knocks.',
    },
    goodWith: ['virgo', 'capricorn', 'cancer'],
  },
  {
    id: 'gemini', emoji: '♊', start: [5, 21], end: [6, 20], element: 'air',
    planet: { ko: '수성', ja: '水星', en: 'Mercury' },
    name: { ko: '쌍둥이자리', ja: '双子座(ふたご座)', en: 'Gemini' },
    traits: { ko: ['호기심', '적응력', '재치', '사교성'], ja: ['好奇心', '適応力', '機知', '社交的'], en: ['Curious', 'Adaptable', 'Witty', 'Sociable'] },
    desc: {
      ko: '쌍둥이자리는 전통적으로 호기심 많은 이야기꾼으로 알려져 있어요. 누구와도 어떤 주제로든 대화할 수 있는 재치가 강점이지만, 관심이 빨리 옮겨 다니는 변덕도 함께 이야기됩니다.',
      ja: 'ふたご座は伝統的に、好奇心旺盛なおしゃべり上手といわれます。誰とでもどんな話題でも話せる機知が強みですが、興味が移りやすい気まぐれさも併せて語られます。',
      en: 'Gemini is traditionally the zodiac’s curious conversationalist — able to talk to anyone about anything. The flip side, as the lore goes, is attention that hops to the next shiny topic quickly.',
    },
    goodWith: ['libra', 'aquarius', 'aries'],
  },
  {
    id: 'cancer', emoji: '♋', start: [6, 21], end: [7, 22], element: 'water',
    planet: { ko: '달', ja: '月', en: 'Moon' },
    name: { ko: '게자리', ja: '蟹座(かに座)', en: 'Cancer' },
    traits: { ko: ['직관', '충성심', '감수성', '보호본능'], ja: ['直感', '忠誠心', '感受性', '母性的'], en: ['Intuitive', 'Loyal', 'Sensitive', 'Nurturing'] },
    desc: {
      ko: '게자리는 전통적으로 가족과 가까운 사람을 살뜰히 챙기는 보호자형으로 여겨져요. 직관과 공감이 뛰어나 기댈 수 있는 사람이지만, 상처받으면 껍데기 속으로 숨는 예민함도 함께 이야기됩니다.',
      ja: 'かに座は伝統的に、家族や身近な人を細やかに世話する保護者タイプとされます。直感と共感力に優れ頼れる存在ですが、傷つくと殻にこもる繊細さも併せて語られます。',
      en: 'Cancer is traditionally the zodiac’s caretaker, tending closely to family and friends. Deeply intuitive and empathetic, they are a shoulder to lean on — but retreat into their shell when hurt, so the lore says.',
    },
    goodWith: ['scorpio', 'pisces', 'taurus'],
  },
  {
    id: 'leo', emoji: '♌', start: [7, 23], end: [8, 22], element: 'fire',
    planet: { ko: '태양', ja: '太陽', en: 'Sun' },
    name: { ko: '사자자리', ja: '獅子座(しし座)', en: 'Leo' },
    traits: { ko: ['창의성', '관대함', '따뜻함', '자신감'], ja: ['創造性', '寛大', '温かさ', '自信'], en: ['Creative', 'Generous', 'Warm-hearted', 'Confident'] },
    desc: {
      ko: '사자자리는 전통적으로 무대의 중심에 서는 화려한 별자리로 알려져 있어요. 따뜻하고 통이 크며 주변을 즐겁게 만들지만, 인정받고 싶은 마음이 커서 무관심에 약하다고 이야기됩니다.',
      ja: 'しし座は伝統的に、舞台の中心に立つ華やかな星座といわれます。温かく気前がよく周囲を楽しませますが、認められたい気持ちが強く、無関心に弱いとも語られます。',
      en: 'Leo is traditionally the zodiac’s headliner — warm, generous and fun to be around. The classic caveat: they thrive on appreciation and wilt under indifference.',
    },
    goodWith: ['aries', 'sagittarius', 'libra'],
  },
  {
    id: 'virgo', emoji: '♍', start: [8, 23], end: [9, 22], element: 'earth',
    planet: { ko: '수성', ja: '水星', en: 'Mercury' },
    name: { ko: '처녀자리', ja: '乙女座(おとめ座)', en: 'Virgo' },
    traits: { ko: ['꼼꼼함', '분석력', '성실함', '겸손'], ja: ['几帳面', '分析力', '誠実', '謙虚'], en: ['Meticulous', 'Analytical', 'Diligent', 'Modest'] },
    desc: {
      ko: '처녀자리는 전통적으로 디테일의 장인으로 여겨져요. 무엇이든 체계적으로 다듬어 완성도를 높이는 성실함이 강점이지만, 자신과 남에게 기준이 높아 걱정이 많다고도 이야기됩니다.',
      ja: 'おとめ座は伝統的に、ディテールの職人とされます。何事も体系的に磨き上げる誠実さが強みですが、自分にも他人にも基準が高く、心配性だともいわれます。',
      en: 'Virgo is traditionally the craftsman of details, polishing everything toward perfection. The lore adds a caveat: high standards for themselves and others can turn into worry.',
    },
    goodWith: ['taurus', 'capricorn', 'cancer'],
  },
  {
    id: 'libra', emoji: '♎', start: [9, 23], end: [10, 22], element: 'air',
    planet: { ko: '금성', ja: '金星', en: 'Venus' },
    name: { ko: '천칭자리', ja: '天秤座(てんびん座)', en: 'Libra' },
    traits: { ko: ['균형감', '외교술', '우아함', '사교성'], ja: ['バランス感覚', '外交的', '優雅', '社交的'], en: ['Balanced', 'Diplomatic', 'Gracious', 'Social'] },
    desc: {
      ko: '천칭자리는 전통적으로 조화와 공정함을 사랑하는 중재자로 알려져 있어요. 갈등을 부드럽게 풀어내는 사교성이 매력이지만, 저울질이 길어져 결정을 미루는 우유부단함도 함께 이야기됩니다.',
      ja: 'てんびん座は伝統的に、調和と公正を愛する仲裁者といわれます。対立を柔らかくほどく社交性が魅力ですが、天秤にかけすぎて決断を先送りする優柔不断さも語られます。',
      en: 'Libra is traditionally the zodiac’s mediator, in love with harmony and fairness. Their social grace smooths conflicts — though weighing every option, the lore says, can delay the verdict forever.',
    },
    goodWith: ['gemini', 'aquarius', 'leo'],
  },
  {
    id: 'scorpio', emoji: '♏', start: [10, 23], end: [11, 21], element: 'water',
    planet: { ko: '명왕성', ja: '冥王星', en: 'Pluto' },
    name: { ko: '전갈자리', ja: '蠍座(さそり座)', en: 'Scorpio' },
    traits: { ko: ['열정', '집중력', '통찰력', '신비로움'], ja: ['情熱', '集中力', '洞察力', 'ミステリアス'], en: ['Passionate', 'Focused', 'Insightful', 'Mysterious'] },
    desc: {
      ko: '전갈자리는 전통적으로 깊고 강렬한 별자리로 여겨져요. 한 가지에 몰입하는 집중력과 사람 속을 꿰뚫는 통찰이 강점이지만, 쉽게 속을 보여주지 않아 미스터리하다는 말을 듣습니다.',
      ja: 'さそり座は伝統的に、深く強烈な星座とされます。ひとつのことに没頭する集中力と人の心を見抜く洞察が強みですが、簡単に本心を見せないためミステリアスだといわれます。',
      en: 'Scorpio is traditionally the zodiac’s deep water — intense focus and an uncanny read on people. They rarely show their cards, which is exactly why the lore calls them magnetic and mysterious.',
    },
    goodWith: ['cancer', 'pisces', 'virgo'],
  },
  {
    id: 'sagittarius', emoji: '♐', start: [11, 22], end: [12, 21], element: 'fire',
    planet: { ko: '목성', ja: '木星', en: 'Jupiter' },
    name: { ko: '사수자리', ja: '射手座(いて座)', en: 'Sagittarius' },
    traits: { ko: ['낙천성', '자유로움', '유머', '솔직함'], ja: ['楽天的', '自由', 'ユーモア', '率直'], en: ['Optimistic', 'Free-spirited', 'Humorous', 'Frank'] },
    desc: {
      ko: '사수자리는 전통적으로 자유로운 여행자형으로 알려져 있어요. 낙천적인 에너지와 유머로 어디서든 활력을 만들지만, 얽매이는 것을 싫어해 한곳에 오래 머무르기 어렵다고 이야기됩니다.',
      ja: 'いて座は伝統的に、自由な旅人タイプといわれます。楽天的なエネルギーとユーモアでどこでも活気を生みますが、縛られるのを嫌い、一か所に長くとどまりにくいとも語られます。',
      en: 'Sagittarius is traditionally the zodiac’s free-roaming traveler, bringing optimism and humor wherever they land. The classic caveat: they hate being tied down and rarely stay put.',
    },
    goodWith: ['aries', 'leo', 'aquarius'],
  },
  {
    id: 'capricorn', emoji: '♑', start: [12, 22], end: [1, 19], element: 'earth',
    planet: { ko: '토성', ja: '土星', en: 'Saturn' },
    name: { ko: '염소자리', ja: '山羊座(やぎ座)', en: 'Capricorn' },
    traits: { ko: ['절제력', '책임감', '야망', '끈기'], ja: ['自制心', '責任感', '野心', '粘り強さ'], en: ['Disciplined', 'Responsible', 'Ambitious', 'Persistent'] },
    desc: {
      ko: '염소자리는 전통적으로 산을 오르는 등반가에 비유돼요. 목표를 향해 묵묵히 오래 걷는 끈기와 책임감이 강점이지만, 일에 몰두한 나머지 스스로에게 너무 엄격해진다고 이야기됩니다.',
      ja: 'やぎ座は伝統的に、山を登る登山家にたとえられます。目標へ黙々と歩き続ける粘り強さと責任感が強みですが、仕事に没頭するあまり自分に厳しくなりすぎるともいわれます。',
      en: 'Capricorn is traditionally the mountain climber of the zodiac — patient, responsible, always a step higher. The lore’s warning: they can work themselves hard and forgive themselves little.',
    },
    goodWith: ['taurus', 'virgo', 'scorpio'],
  },
  {
    id: 'aquarius', emoji: '♒', start: [1, 20], end: [2, 18], element: 'air',
    planet: { ko: '천왕성', ja: '天王星', en: 'Uranus' },
    name: { ko: '물병자리', ja: '水瓶座(みずがめ座)', en: 'Aquarius' },
    traits: { ko: ['독창성', '독립심', '인류애', '진보성'], ja: ['独創性', '独立心', '博愛', '進歩的'], en: ['Original', 'Independent', 'Humanitarian', 'Progressive'] },
    desc: {
      ko: '물병자리는 전통적으로 시대를 앞서가는 아이디어형으로 알려져 있어요. 남과 다른 관점과 인류애적 시야가 강점이지만, 독립심이 강해 때로 혼자만의 세계에 머문다는 말을 듣습니다.',
      ja: 'みずがめ座は伝統的に、時代を先取りするアイデアタイプといわれます。人と違う視点と博愛的な視野が強みですが、独立心が強く、時に自分だけの世界にこもるとも語られます。',
      en: 'Aquarius is traditionally the zodiac’s forward thinker — original angles, big-picture humanity. Their independence is legendary, and so, the lore says, is their tendency to drift into their own orbit.',
    },
    goodWith: ['gemini', 'libra', 'sagittarius'],
  },
  {
    id: 'pisces', emoji: '♓', start: [2, 19], end: [3, 20], element: 'water',
    planet: { ko: '해왕성', ja: '海王星', en: 'Neptune' },
    name: { ko: '물고기자리', ja: '魚座(うお座)', en: 'Pisces' },
    traits: { ko: ['공감력', '예술성', '직관', '온화함'], ja: ['共感力', '芸術性', '直感', '穏やか'], en: ['Empathetic', 'Artistic', 'Intuitive', 'Gentle'] },
    desc: {
      ko: '물고기자리는 전통적으로 12별자리 중 가장 감수성이 깊은 몽상가로 여겨져요. 공감과 예술적 감각이 뛰어나 사람 마음을 어루만지지만, 현실보다 꿈에 머무르기 쉽다고 이야기됩니다.',
      ja: 'うお座は伝統的に、十二星座で最も感受性の深い夢想家とされます。共感力と芸術的センスに優れ人の心を癒しますが、現実より夢にとどまりやすいともいわれます。',
      en: 'Pisces is traditionally the zodiac’s deepest-feeling dreamer — empathetic, artistic, soothing to be around. The classic caveat: the dream world can feel more like home than the real one.',
    },
    goodWith: ['cancer', 'scorpio', 'capricorn'],
  },
]

export const SIGN_BY_ID: Record<string, ZodiacSign> = Object.fromEntries(ZODIAC_SIGNS.map((s) => [s.id, s]))

// ---- Chinese zodiac (띠) ----
export interface ZodiacAnimal {
  id: string; emoji: string; order: number // 0 = 쥐 (rat), 1900 was a rat year
  hanja: string          // earthly branch (지지)
  hour: string           // traditional double-hour, e.g. '23:00–01:00'
  element: L10n          // fixed element of the branch
  name: L10n
  traits: L10nList
  desc: L10n
  trine: string[]        // 삼합 partners (ids)
  clash: string          // 충 (opposite) id
}

export const ZODIAC_ANIMALS: ZodiacAnimal[] = [
  {
    id: 'rat', emoji: '🐭', order: 0, hanja: '子', hour: '23:00–01:00',
    element: { ko: '수(水)', ja: '水', en: 'Water' },
    name: { ko: '쥐띠', ja: '子(ね)年', en: 'Rat' },
    traits: { ko: ['영리함', '재치', '적응력', '절약'], ja: ['賢い', '機転', '適応力', '倹約'], en: ['Clever', 'Quick-witted', 'Adaptable', 'Thrifty'] },
    desc: {
      ko: '쥐띠는 전통적으로 십이지의 첫 자리를 차지한 영리한 띠로 알려져 있어요. 눈치가 빠르고 상황 적응이 뛰어나 어디서든 살길을 찾아내지만, 잇속에 밝다는 소리도 함께 듣습니다.',
      ja: '子年は伝統的に、十二支の最初の座を勝ち取った賢い干支といわれます。察しがよく状況適応に優れ、どこでも活路を見いだしますが、抜け目がないとも言われます。',
      en: 'The Rat, first in the zodiac race, is traditionally the clever survivor — quick to read a room and find a way through anything. The lore adds: they never miss a bargain either.',
    },
    trine: ['dragon', 'monkey'], clash: 'horse',
  },
  {
    id: 'ox', emoji: '🐮', order: 1, hanja: '丑', hour: '01:00–03:00',
    element: { ko: '토(土)', ja: '土', en: 'Earth' },
    name: { ko: '소띠', ja: '丑(うし)年', en: 'Ox' },
    traits: { ko: ['근면', '인내심', '신뢰', '우직함'], ja: ['勤勉', '忍耐', '信頼', '実直'], en: ['Diligent', 'Patient', 'Dependable', 'Steadfast'] },
    desc: {
      ko: '소띠는 전통적으로 묵묵히 밭을 가는 성실함의 상징이에요. 서두르지 않지만 반드시 끝을 보는 끈기로 신뢰를 얻는 대신, 한번 정한 길을 잘 바꾸지 않는 고집도 이야기됩니다.',
      ja: '丑年は伝統的に、黙々と畑を耕す誠実さの象徴です。急がないものの必ずやり遂げる粘り強さで信頼を得る一方、一度決めた道を変えない頑固さも語られます。',
      en: 'The Ox is traditionally the emblem of quiet diligence — never rushed, always finished. That earns deep trust, though the lore notes an Ox rarely changes a path once chosen.',
    },
    trine: ['snake', 'rooster'], clash: 'goat',
  },
  {
    id: 'tiger', emoji: '🐯', order: 2, hanja: '寅', hour: '03:00–05:00',
    element: { ko: '목(木)', ja: '木', en: 'Wood' },
    name: { ko: '호랑이띠', ja: '寅(とら)年', en: 'Tiger' },
    traits: { ko: ['용맹', '카리스마', '정의감', '모험심'], ja: ['勇猛', 'カリスマ', '正義感', '冒険心'], en: ['Brave', 'Charismatic', 'Righteous', 'Adventurous'] },
    desc: {
      ko: '호랑이띠는 전통적으로 산군(山君)의 기세를 지닌 용맹한 띠로 여겨져요. 불의를 보면 참지 못하는 정의감과 카리스마가 강점이지만, 저돌적인 성격이 때로 무모함이 된다고 이야기됩니다.',
      ja: '寅年は伝統的に、山の王の気迫を持つ勇猛な干支とされます。不義を見過ごせない正義感とカリスマが強みですが、猪突猛進な性格が時に無謀さになるともいわれます。',
      en: 'The Tiger traditionally carries the aura of the mountain king — brave, charismatic, allergic to injustice. Charging first and planning later, the lore says, is both the gift and the risk.',
    },
    trine: ['horse', 'dog'], clash: 'monkey',
  },
  {
    id: 'rabbit', emoji: '🐰', order: 3, hanja: '卯', hour: '05:00–07:00',
    element: { ko: '목(木)', ja: '木', en: 'Wood' },
    name: { ko: '토끼띠', ja: '卯(う)年', en: 'Rabbit' },
    traits: { ko: ['온화함', '세심함', '평화주의', '민첩함'], ja: ['温和', '細やか', '平和主義', '敏捷'], en: ['Gentle', 'Considerate', 'Peace-loving', 'Agile'] },
    desc: {
      ko: '토끼띠는 전통적으로 온화하고 세심한 평화주의자로 알려져 있어요. 부드러운 태도로 갈등을 피해 가는 지혜가 있지만, 위험 앞에서 지나치게 조심스러워진다는 말도 듣습니다.',
      ja: '卯年は伝統的に、温和で細やかな平和主義者といわれます。柔らかな態度で衝突を避ける知恵がありますが、危険の前では慎重になりすぎるとも言われます。',
      en: 'The Rabbit is traditionally the gentle diplomat of the zodiac, gliding around conflict with soft-footed grace. Caution is their wisdom — and, the lore adds, occasionally their cage.',
    },
    trine: ['goat', 'pig'], clash: 'rooster',
  },
  {
    id: 'dragon', emoji: '🐲', order: 4, hanja: '辰', hour: '07:00–09:00',
    element: { ko: '토(土)', ja: '土', en: 'Earth' },
    name: { ko: '용띠', ja: '辰(たつ)年', en: 'Dragon' },
    traits: { ko: ['기백', '야망', '자신감', '행운'], ja: ['気迫', '野心', '自信', '幸運'], en: ['Spirited', 'Ambitious', 'Confident', 'Fortunate'] },
    desc: {
      ko: '용띠는 십이지 중 유일한 상상의 동물로, 전통적으로 큰 뜻과 기백의 상징이에요. 스케일 크게 꿈꾸고 밀어붙이는 추진력이 강점이지만, 자존심이 세서 굽히기 어렵다고 이야기됩니다.',
      ja: '辰年は十二支で唯一の想像上の動物で、伝統的に大志と気迫の象徴です。スケール大きく夢を描き押し進める推進力が強みですが、プライドが高く曲げにくいともいわれます。',
      en: 'The Dragon, the zodiac’s only mythical beast, traditionally stands for grand ambition and presence. They dream big and push hard — bowing, the lore says, is the one move they never learned.',
    },
    trine: ['rat', 'monkey'], clash: 'dog',
  },
  {
    id: 'snake', emoji: '🐍', order: 5, hanja: '巳', hour: '09:00–11:00',
    element: { ko: '화(火)', ja: '火', en: 'Fire' },
    name: { ko: '뱀띠', ja: '巳(み)年', en: 'Snake' },
    traits: { ko: ['지혜', '직관', '우아함', '신중함'], ja: ['知恵', '直感', '優雅', '慎重'], en: ['Wise', 'Intuitive', 'Elegant', 'Prudent'] },
    desc: {
      ko: '뱀띠는 전통적으로 조용한 지혜의 상징으로 여겨져요. 말수가 적어도 통찰이 깊고 우아하게 목표를 이루지만, 속내를 드러내지 않아 차갑다는 오해를 받기도 한다고 이야기됩니다.',
      ja: '巳年は伝統的に、静かな知恵の象徴とされます。口数が少なくても洞察が深く優雅に目標を遂げますが、本心を見せないため冷たいと誤解されることもあるといわれます。',
      en: 'The Snake is traditionally the zodiac’s quiet sage — few words, deep insight, goals reached with elegance. Keeping their cards close, the lore notes, sometimes reads as cool distance.',
    },
    trine: ['ox', 'rooster'], clash: 'pig',
  },
  {
    id: 'horse', emoji: '🐴', order: 6, hanja: '午', hour: '11:00–13:00',
    element: { ko: '화(火)', ja: '火', en: 'Fire' },
    name: { ko: '말띠', ja: '午(うま)年', en: 'Horse' },
    traits: { ko: ['활력', '자유분방', '열정', '사교성'], ja: ['活力', '自由奔放', '情熱', '社交的'], en: ['Energetic', 'Free-spirited', 'Passionate', 'Sociable'] },
    desc: {
      ko: '말띠는 전통적으로 들판을 내달리는 활력의 상징이에요. 열정과 사교성으로 어디서나 분위기를 이끌지만, 얽매이는 것을 싫어해 진득함이 부족하다는 말도 듣습니다.',
      ja: '午年は伝統的に、野原を駆ける活力の象徴です。情熱と社交性でどこでも場を引っ張りますが、縛られるのを嫌い、腰を据えるのが苦手だとも言われます。',
      en: 'The Horse traditionally embodies galloping vitality — passionate, sociable, first onto any open field. Harnesses, the lore warns, were never their favorite accessory.',
    },
    trine: ['tiger', 'dog'], clash: 'rat',
  },
  {
    id: 'goat', emoji: '🐑', order: 7, hanja: '未', hour: '13:00–15:00',
    element: { ko: '토(土)', ja: '土', en: 'Earth' },
    name: { ko: '양띠', ja: '未(ひつじ)年', en: 'Goat' },
    traits: { ko: ['온순함', '예술성', '배려심', '평화'], ja: ['温順', '芸術性', '思いやり', '平和'], en: ['Mild', 'Artistic', 'Caring', 'Peaceful'] },
    desc: {
      ko: '양띠는 전통적으로 온순하고 정이 많은 예술가형으로 알려져 있어요. 배려심과 미적 감각으로 주변을 편안하게 만들지만, 거절을 잘 못해 속앓이를 한다고 이야기됩니다.',
      ja: '未年は伝統的に、温順で情に厚い芸術家タイプといわれます。思いやりと美的センスで周囲を和ませますが、断るのが苦手で気をもむともいわれます。',
      en: 'The Goat is traditionally the zodiac’s tender-hearted artist, soothing everyone with care and good taste. Saying no, the lore observes, is the hardest word in their vocabulary.',
    },
    trine: ['rabbit', 'pig'], clash: 'ox',
  },
  {
    id: 'monkey', emoji: '🐵', order: 8, hanja: '申', hour: '15:00–17:00',
    element: { ko: '금(金)', ja: '金', en: 'Metal' },
    name: { ko: '원숭이띠', ja: '申(さる)年', en: 'Monkey' },
    traits: { ko: ['재주', '유머', '창의력', '호기심'], ja: ['多才', 'ユーモア', '創造力', '好奇心'], en: ['Talented', 'Humorous', 'Inventive', 'Curious'] },
    desc: {
      ko: '원숭이띠는 전통적으로 십이지 최고의 재주꾼으로 여겨져요. 창의적인 꾀와 유머로 어떤 문제든 풀어내지만, 재주만 믿고 진득함이 부족해질 수 있다고 이야기됩니다.',
      ja: '申年は伝統的に、十二支きっての多才な知恵者とされます。創造的な知恵とユーモアでどんな問題も解きますが、才に頼りすぎて粘りが足りなくなりがちだともいわれます。',
      en: 'The Monkey is traditionally the zodiac’s virtuoso problem-solver, all wit and workaround. Talent carries them far — patience, the lore says, has to be packed separately.',
    },
    trine: ['rat', 'dragon'], clash: 'tiger',
  },
  {
    id: 'rooster', emoji: '🐔', order: 9, hanja: '酉', hour: '17:00–19:00',
    element: { ko: '금(金)', ja: '金', en: 'Metal' },
    name: { ko: '닭띠', ja: '酉(とり)年', en: 'Rooster' },
    traits: { ko: ['부지런함', '정확함', '당당함', '관찰력'], ja: ['勤勉', '正確', '堂々', '観察力'], en: ['Industrious', 'Precise', 'Confident', 'Observant'] },
    desc: {
      ko: '닭띠는 전통적으로 새벽을 여는 부지런함의 상징이에요. 꼼꼼한 관찰력과 똑 부러지는 일처리가 강점이지만, 할 말은 해야 직성이 풀려 직설적이라는 평도 듣습니다.',
      ja: '酉年は伝統的に、夜明けを告げる勤勉さの象徴です。細やかな観察力とてきぱきした仕事ぶりが強みですが、言うべきことは言わないと気が済まず、率直すぎるとも評されます。',
      en: 'The Rooster traditionally opens the dawn — industrious, precise, impeccably put together. They call things as they see them, which the lore counts as both feature and bug.',
    },
    trine: ['ox', 'snake'], clash: 'rabbit',
  },
  {
    id: 'dog', emoji: '🐶', order: 10, hanja: '戌', hour: '19:00–21:00',
    element: { ko: '토(土)', ja: '土', en: 'Earth' },
    name: { ko: '개띠', ja: '戌(いぬ)年', en: 'Dog' },
    traits: { ko: ['충직함', '정직', '정의감', '헌신'], ja: ['忠実', '正直', '正義感', '献身'], en: ['Loyal', 'Honest', 'Just', 'Devoted'] },
    desc: {
      ko: '개띠는 전통적으로 충직함과 의리의 대명사로 알려져 있어요. 한번 믿은 사람은 끝까지 지키는 헌신이 강점이지만, 옳고 그름이 분명해 융통성이 아쉽다는 말도 듣습니다.',
      ja: '戌年は伝統的に、忠実さと義理堅さの代名詞といわれます。一度信じた人を最後まで守る献身が強みですが、善悪がはっきりしすぎて融通が利かないとも言われます。',
      en: 'The Dog is traditionally the zodiac’s byword for loyalty — once they trust you, they guard you for life. Right is right and wrong is wrong, the lore says, with little room in between.',
    },
    trine: ['tiger', 'horse'], clash: 'dragon',
  },
  {
    id: 'pig', emoji: '🐷', order: 11, hanja: '亥', hour: '21:00–23:00',
    element: { ko: '수(水)', ja: '水', en: 'Water' },
    name: { ko: '돼지띠', ja: '亥(い)年', en: 'Pig' },
    traits: { ko: ['복', '너그러움', '솔직함', '성실함'], ja: ['福', '寛大', '素直', '誠実'], en: ['Fortunate', 'Generous', 'Sincere', 'Diligent'] },
    desc: {
      ko: '돼지띠는 전통적으로 복과 너그러움의 상징으로 여겨져요. 꾸밈없이 솔직하고 베풀기를 좋아해 사람이 따르지만, 사람을 잘 믿어 손해를 보기도 한다고 이야기됩니다.',
      ja: '亥年は伝統的に、福と寛大さの象徴とされます。飾らず素直で与えることを好むため人が集まりますが、人を信じやすく損をすることもあるといわれます。',
      en: 'The Pig traditionally symbolizes fortune and open-handed warmth — sincere, generous, easy to love. Trusting everyone, the lore cautions, occasionally comes with a bill.',
    },
    trine: ['rabbit', 'goat'], clash: 'snake',
  },
]

export const ANIMAL_BY_ID: Record<string, ZodiacAnimal> = Object.fromEntries(ZODIAC_ANIMALS.map((a) => [a.id, a]))

/** Years (Gregorian) of this animal in a range — 1900 was a Rat (子) year. */
export function animalYears(order: number, from = 1936, to = 2043): number[] {
  const out: number[] = []
  for (let y = from; y <= to; y++) if ((y - 1900) % 12 === order) out.push(y)
  return out
}

export const zName = (x: { name: L10n }, lang: string) => (lang === 'ko' ? x.name.ko : lang === 'ja' ? x.name.ja : x.name.en)
export const zDesc = (x: { desc: L10n }, lang: string) => (lang === 'ko' ? x.desc.ko : lang === 'ja' ? x.desc.ja : x.desc.en)
export const zTraits = (x: { traits: L10nList }, lang: string) => (lang === 'ko' ? x.traits.ko : lang === 'ja' ? x.traits.ja : x.traits.en)
