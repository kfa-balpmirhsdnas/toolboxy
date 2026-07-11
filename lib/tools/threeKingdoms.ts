// Three Kingdoms personality test — questions + 16 result characters.
// Copyright rules (data/t1.md): no KOEI stats/art/game terms, no portraits —
// results are text + faction color + a single hanja symbol only. All character
// copy is common-knowledge level (연의/정사) and positively framed.

export type TKLang = 'ko' | 'ja' | 'en'
export type AB = 'A' | 'B'
type L<T = string> = Record<TKLang, T>

// Axis order: 1 문/무 · 2 명분/실리 · 3 주군/참모 · 4 신중/과감 (A = first side)
export const AXES: { a: L; b: L }[] = [
  { a: { ko: '지략', ja: '知略', en: 'Strategy' }, b: { ko: '무용', ja: '武勇', en: 'Action' } },
  { a: { ko: '명분', ja: '大義', en: 'Cause' }, b: { ko: '실리', ja: '実利', en: 'Results' } },
  { a: { ko: '주군', ja: '主君', en: 'Leader' }, b: { ko: '참모', ja: '参謀', en: 'Advisor' } },
  { a: { ko: '신중', ja: '慎重', en: 'Careful' }, b: { ko: '과감', ja: '果敢', en: 'Bold' } },
]

export interface TKQuestion { axis: 0 | 1 | 2 | 3; text: L; a: L; b: L }

export const QUESTIONS: TKQuestion[] = [
  // ---- axis 1: 문(A) / 무(B)
  {
    axis: 0,
    text: { ko: '적이 성 밖까지 쳐들어왔다. 나는…', ja: '敵が城の外まで攻めてきた。私は…', en: 'The enemy is at the city gates. I would…' },
    a: { ko: '지형과 적의 보급을 따져 계책부터 세운다', ja: '地形と敵の補給を分析し、まず策を立てる', en: 'Study the terrain and their supply lines, and plan first' },
    b: { ko: '선봉에 서서 성문을 열고 맞받아친다', ja: '先頭に立って城門を開け、迎え撃つ', en: 'Throw open the gates and lead the counterattack myself' },
  },
  {
    axis: 0,
    text: { ko: '새 영토를 얻었다. 가장 먼저 할 일은?', ja: '新しい領地を手に入れた。最初にすることは？', en: "You've just taken new territory. First move?" },
    a: { ko: '인재를 모으고 내정을 정비한다', ja: '人材を集め、内政を整える', en: 'Recruit talent and set up good governance' },
    b: { ko: '군사를 조련해 다음 싸움에 대비한다', ja: '兵を鍛え、次の戦いに備える', en: 'Drill the troops for the next battle' },
  },
  {
    axis: 0,
    text: { ko: '라이벌 장수가 일대일 대결을 걸어왔다.', ja: 'ライバルの武将が一騎打ちを挑んできた。', en: 'A rival general challenges you to single combat.' },
    a: { ko: '응할 필요 없다 — 싸움은 이기는 판에서만 한다', ja: '応じる必要はない — 戦いは勝てる場でのみ', en: "Decline — only fight battles you've already won" },
    b: { ko: '받아들인다 — 기세에서 밀리면 끝이다', ja: '受けて立つ — 気迫で押されたら終わりだ', en: 'Accept — lose the momentum and you lose everything' },
  },
  // ---- axis 2: 명분(A) / 실리(B)
  {
    axis: 1,
    text: { ko: '동맹이 위기에 빠졌다. 돕자니 우리도 큰 손해다.', ja: '同盟が危機に陥った。助ければこちらも大損害だ。', en: 'An ally is in trouble, but helping costs us dearly.' },
    a: { ko: '약속은 약속 — 손해를 감수하고 돕는다', ja: '約束は約束 — 損を覚悟で助ける', en: 'A promise is a promise — help, whatever the cost' },
    b: { ko: '우리 진영의 이익이 먼저 — 냉정하게 판단한다', ja: '自陣の利益が先 — 冷静に判断する', en: 'Our side comes first — decide with a cool head' },
  },
  {
    axis: 1,
    text: { ko: '이기려면 거짓 항복 같은 속임수가 필요하다.', ja: '勝つには偽りの降伏のような策が必要だ。', en: 'Winning requires a trick — say, a fake surrender.' },
    a: { ko: '정정당당하지 않은 승리는 오래가지 않는다', ja: '正々堂々でない勝利は長続きしない', en: 'A victory won unfairly never lasts' },
    b: { ko: '전쟁에서 속임수는 병법일 뿐이다', ja: '戦において騙し合いは兵法のうちだ', en: 'In war, deception is just strategy' },
  },
  {
    axis: 1,
    text: { ko: '폭군을 몰아낼 기회가 왔다. 그러나 명분이 부족하다.', ja: '暴君を倒す好機が来た。だが大義名分が足りない。', en: 'A chance to topple a tyrant — but you lack a just cause.' },
    a: { ko: '천하가 납득할 명분을 먼저 만든다', ja: '天下が納得する名分をまず作る', en: 'First build a cause the whole realm will accept' },
    b: { ko: '기회는 지금뿐 — 결과가 명분을 만든다', ja: '好機は今だけ — 結果が名分を作る', en: 'The chance is now — results will justify it' },
  },
  // ---- axis 3: 주군(A) / 참모(B)
  {
    axis: 2,
    text: { ko: '천하를 도모한다면 나는…', ja: '天下を目指すなら、私は…', en: "If you set out to win the realm, you'd rather…" },
    a: { ko: '깃발을 세우고 사람을 모으는 자리', ja: '旗を掲げ、人を集める立場', en: 'Raise your own banner and gather followers' },
    b: { ko: '뛰어난 주군을 찾아 그를 승리로 이끄는 자리', ja: '優れた主君を見つけ、勝利に導く立場', en: 'Find a worthy lord and steer them to victory' },
  },
  {
    axis: 2,
    text: { ko: '회의에서 내 의견과 대장의 결정이 다르다.', ja: '軍議で自分の意見と大将の決定が違う。', en: 'In the war council, the commander overrules you.' },
    a: { ko: '결정은 내가 내려야 직성이 풀린다', ja: '決定は自分で下さないと気が済まない', en: 'I need to be the one making the call' },
    b: { ko: '더 나은 판단이라면 기꺼이 따르고 보완한다', ja: 'より良い判断なら喜んで従い、補佐する', en: "If it's the better judgment, I'll back it and make it work" },
  },
  {
    axis: 2,
    text: { ko: '큰 공을 세웠다. 원하는 보상은?', ja: '大きな手柄を立てた。望む褒美は？', en: "You've won a great victory. Your reward of choice?" },
    a: { ko: '땅과 병사 — 내 세력을 키운다', ja: '領地と兵 — 自分の勢力を育てる', en: 'Land and troops — build my own power' },
    b: { ko: '신뢰와 권한 — 곁에서 더 큰 일을 맡는다', ja: '信頼と権限 — 側でより大きな仕事を任される', en: 'Trust and authority — take on bigger work at their side' },
  },
  // ---- axis 4: 신중(A) / 과감(B)
  {
    axis: 3,
    text: { ko: '적진에 빈틈이 보인다. 함정일 수도 있다.', ja: '敵陣に隙が見えた。罠かもしれない。', en: 'You spot an opening in the enemy line. It could be a trap.' },
    a: { ko: '척후를 보내 확인한 뒤 움직인다', ja: '斥候を出して確認してから動く', en: 'Send scouts to confirm before moving' },
    b: { ko: '생각할 시간에 기회는 사라진다 — 돌격', ja: '考えている間に好機は消える — 突撃', en: 'Hesitate and the chance is gone — charge' },
  },
  {
    axis: 3,
    text: { ko: '큰 결정을 앞두고 잠들기 전 나는…', ja: '大きな決断の前夜、私は…', en: 'The night before a big decision, you…' },
    a: { ko: '실패했을 때의 퇴로까지 그려본다', ja: '失敗した時の退路まで思い描く', en: 'Map out every escape route in case it fails' },
    b: { ko: '이미 마음은 정해졌다 — 푹 잔다', ja: 'もう心は決まっている — ぐっすり眠る', en: "Your mind's made up — sleep like a rock" },
  },
  {
    axis: 3,
    text: { ko: '세 갈래 길, 어느 쪽도 정보가 없다.', ja: '三叉路、どの道も情報がない。', en: 'Three roads, no intel on any of them.' },
    a: { ko: '가장 안전한 길로 간다 — 늦어도 확실하게', ja: '一番安全な道を行く — 遅くても確実に', en: 'Take the safest — slow but sure' },
    b: { ko: '가장 빠른 길로 간다 — 속도가 곧 승리다', ja: '一番速い道を行く — 速さこそ勝利だ', en: 'Take the fastest — speed wins wars' },
  },
]

export interface TKChar {
  slug: string
  code: string           // 4 letters, axis order, e.g. 'ABAB' = 조조
  hanja: string          // full name in hanja
  symbol: string         // one representative hanja for the card symbol
  color: string          // faction-ish accent color
  match: string; clash: string // slugs within the 16
  name: L
  catch: L
  desc: L
  strengths: L<[string, string, string]>
  caution: L
}

export const CHARS: TKChar[] = [
  {
    slug: 'liubei', code: 'AAAA', hanja: '劉備 玄德', symbol: '仁', color: '#10b981', match: 'zhugeliang', clash: 'caocao',
    name: { ko: '유비', ja: '劉備', en: 'Liu Bei' },
    catch: { ko: '사람을 얻는 인덕형 리더', ja: '人の心を得る仁徳型リーダー', en: 'The leader who wins hearts' },
    desc: {
      ko: '힘보다 사람의 마음을 얻어 세력을 일구는 유형이에요. 신의와 대의를 앞세우니 주변에 자연스럽게 인재가 모이고, 위기가 와도 함께하는 사람들 덕에 다시 일어섭니다. 서두르지 않고 때를 기다릴 줄 아는 끈기가 최대 무기예요.',
      ja: '力より人の心を得て勢力を築くタイプです。信義と大義を掲げるので自然と人材が集まり、危機が来ても仲間のおかげで立ち直ります。焦らず時を待てる粘り強さが最大の武器です。',
      en: 'You build power by winning hearts, not by force. Leading with trust and principle, talent naturally gathers around you, and your people carry you through every crisis. Your greatest weapon is the patience to wait for your moment.',
    },
    strengths: {
      ko: ['공감과 포용력', '흔들리지 않는 신의', '몇 번이든 다시 일어서는 끈기'],
      ja: ['共感力と包容力', '揺るがない信義', '何度でも立ち上がる粘り強さ'],
      en: ['Empathy and inclusiveness', 'Unshakable loyalty', 'Resilience to rise again and again'],
    },
    caution: { ko: '마음이 약해져 중요한 결단이 늦어질 때가 있어요.', ja: '情に流され、重要な決断が遅れることがあります。', en: 'Your soft heart can delay the hard calls.' },
  },
  {
    slug: 'sunjian', code: 'AAAB', hanja: '孫堅 文台', symbol: '虎', color: '#ef4444', match: 'sunce', clash: 'lvbu',
    name: { ko: '손견', ja: '孫堅', en: 'Sun Jian' },
    catch: { ko: '대의 앞에 몸을 던지는 개척자', ja: '大義の先頭に立つ開拓者', en: 'The pioneer who leads the charge for a cause' },
    desc: {
      ko: '옳다고 믿는 일에는 누구보다 먼저 깃발을 드는 리더예요. 판을 읽고 명분을 세운 뒤에는 망설임 없이 정면 승부를 겁니다. 강동의 호랑이처럼, 그 결단력이 새로운 시대의 문을 열어요.',
      ja: '正しいと信じることには誰よりも先に旗を掲げるリーダーです。状況を読み、名分を立てたら迷わず正面勝負を仕掛けます。江東の虎のように、その決断力が新しい時代の扉を開きます。',
      en: 'When something is right, you raise the banner before anyone else. Once the cause is set, you commit to the head-on fight without hesitation. Like the Tiger of Jiangdong, your decisiveness opens new eras.',
    },
    strengths: {
      ko: ['시대를 여는 결단력', '명분을 세우는 안목', '앞장서는 솔선수범'],
      ja: ['時代を切り開く決断力', '名分を立てる眼力', '先頭に立つ率先垂範'],
      en: ['Era-opening decisiveness', 'An eye for the right cause', 'Leading from the front'],
    },
    caution: { ko: '앞장서다 보니 무리한 강행이 될 때가 있어요.', ja: '先頭に立つあまり、無理を押し通すことがあります。', en: 'Leading the charge can turn into overreach.' },
  },
  {
    slug: 'zhugeliang', code: 'AABA', hanja: '諸葛亮 孔明', symbol: '智', color: '#10b981', match: 'liubei', clash: 'simayi',
    name: { ko: '제갈량', ja: '諸葛亮', en: 'Zhuge Liang' },
    catch: { ko: '완벽을 설계하는 천재 전략가', ja: '完璧を設計する天才軍師', en: 'The genius strategist who engineers perfection' },
    desc: {
      ko: '큰 그림을 그리고 그 안의 모든 변수를 계산하는 유형이에요. 믿는 사람을 위해서라면 자기 재능을 아낌없이 쏟아붓고, 맡은 일은 끝까지 책임집니다. 치밀한 준비와 헌신이 조직의 기둥이 돼요.',
      ja: '大きな絵を描き、その中のあらゆる変数を計算するタイプです。信じる人のためなら才能を惜しみなく注ぎ、任された仕事は最後まで責任を持ちます。緻密な準備と献身が組織の柱になります。',
      en: 'You draw the grand design and account for every variable within it. For those you believe in, you pour out your talent without reserve and see every duty through. Your meticulous preparation and devotion become the pillar of any team.',
    },
    strengths: {
      ko: ['빈틈없는 기획력', '끝까지 해내는 책임감', '사심 없는 헌신'],
      ja: ['隙のない企画力', 'やり遂げる責任感', '私心のない献身'],
      en: ['Flawless planning', 'Responsibility that finishes the job', 'Selfless devotion'],
    },
    caution: { ko: '모든 걸 직접 챙기다 스스로를 소모시키기 쉬워요.', ja: '何もかも自分で抱え込み、消耗しやすいです。', en: 'Handling everything yourself burns you out.' },
  },
  {
    slug: 'pangtong', code: 'AABB', hanja: '龐統 士元', symbol: '鳳', color: '#8b5cf6', match: 'liubei', clash: 'caocao',
    name: { ko: '방통', ja: '龐統', en: 'Pang Tong' },
    catch: { ko: '판을 뒤집는 봉추의 한 수', ja: '盤面を覆す鳳雛の一手', en: 'The Fledgling Phoenix with the game-changing move' },
    desc: {
      ko: '겉치레 없이 본질을 꿰뚫고, 필요한 순간 판을 통째로 뒤집는 한 수를 내놓는 유형이에요. 형식보다 실질, 긴 회의보다 과감한 진언을 택합니다. 알아보는 주군을 만나면 천하를 바꿀 잠재력이 있어요.',
      ja: '飾らず本質を見抜き、必要な瞬間に盤面ごと覆す一手を放つタイプです。形式より実質、長い会議より果敢な進言を選びます。見抜いてくれる主君に出会えば天下を変える潜在力があります。',
      en: 'You cut through appearances to the heart of the matter, then play the one move that flips the whole board. Substance over form, bold counsel over long meetings. With a lord who sees your worth, you can change the world.',
    },
    strengths: {
      ko: ['본질을 꿰뚫는 통찰', '허를 찌르는 발상', '주저 없는 직언'],
      ja: ['本質を見抜く洞察', '虚を突く発想', 'ためらいのない直言'],
      en: ['Insight that cuts to the core', 'Ideas that strike where least expected', 'Fearless honest counsel'],
    },
    caution: { ko: '과감한 한 수가 때로는 큰 리스크가 돼요.', ja: '果敢な一手が時に大きなリスクになります。', en: 'The bold move sometimes carries the biggest risk.' },
  },
  {
    slug: 'sunquan', code: 'ABAA', hanja: '孫權 仲謀', symbol: '守', color: '#ef4444', match: 'luxun', clash: 'guanyu',
    name: { ko: '손권', ja: '孫権', en: 'Sun Quan' },
    catch: { ko: '지키며 이기는 균형의 군주', ja: '守って勝つバランスの君主', en: 'The balanced ruler who wins by holding' },
    desc: {
      ko: '물려받은 것을 더 크게 키우는 수성의 달인이에요. 화려한 승부수보다 인재를 적재적소에 쓰고 실리를 챙기는 운영으로 이깁니다. 필요하면 어제의 적과도 손잡는 유연함이 강점이에요.',
      ja: '受け継いだものをさらに大きく育てる守成の達人です。派手な勝負手より、人材を適材適所に使い実利を取る運営で勝ちます。必要なら昨日の敵とも手を組む柔軟さが強みです。',
      en: 'You are a master of consolidation, growing what you inherit into something greater. You win through smart delegation and pragmatic management rather than flashy gambles. Your flexibility — even allying with yesterday’s enemy — is your edge.',
    },
    strengths: {
      ko: ['사람 보는 눈과 위임', '실리를 챙기는 유연함', '오래 가는 안정 운영'],
      ja: ['人を見る目と委任', '実利を取る柔軟さ', '長続きする安定運営'],
      en: ['Judge of talent and delegation', 'Pragmatic flexibility', 'Stability built to last'],
    },
    caution: { ko: '신중함이 길어지면 결단의 순간을 놓칠 수 있어요.', ja: '慎重さが長引くと決断の瞬間を逃すことがあります。', en: 'Too much caution can miss the moment to strike.' },
  },
  {
    slug: 'caocao', code: 'ABAB', hanja: '曹操 孟德', symbol: '覇', color: '#3b82f6', match: 'guojia', clash: 'liubei',
    name: { ko: '조조', ja: '曹操', en: 'Cao Cao' },
    catch: { ko: '난세를 돌파하는 카리스마 리더', ja: '乱世を切り拓くカリスマリーダー', en: 'The charismatic leader who breaks through chaos' },
    desc: {
      ko: '혼란 속에서 누구보다 빨리 기회를 읽고, 읽은 즉시 움직이는 유형이에요. 출신보다 능력을 보고 사람을 쓰며, 결과로 세상을 설득합니다. 시와 문장을 아는 승부사 — 낭만과 냉철함을 동시에 지녔어요.',
      ja: '混乱の中で誰よりも早く好機を読み、読んだ瞬間に動くタイプです。出自より能力で人を用い、結果で世を納得させます。詩文を解する勝負師 — ロマンと冷徹さを併せ持ちます。',
      en: 'In chaos you read opportunity faster than anyone — and act the instant you see it. You value ability over pedigree and let results do the convincing. A gambler who also writes poetry: romantic and ruthless at once.',
    },
    strengths: {
      ko: ['기회를 읽는 감각', '능력 위주의 용인술', '결단과 실행의 속도'],
      ja: ['好機を読む感覚', '能力主義の人材登用', '決断と実行の速さ'],
      en: ['A nose for opportunity', 'Merit-first talent use', 'Speed of decision and execution'],
    },
    caution: { ko: '목표가 앞서면 주변의 마음을 놓칠 수 있어요.', ja: '目標を優先するあまり、周囲の心を見落とすことがあります。', en: 'Chasing the goal, you can overlook the people beside you.' },
  },
  {
    slug: 'simayi', code: 'ABBA', hanja: '司馬懿 仲達', symbol: '忍', color: '#3b82f6', match: 'caocao', clash: 'zhugeliang',
    name: { ko: '사마의', ja: '司馬懿', en: 'Sima Yi' },
    catch: { ko: '끝까지 기다려 이기는 승부사', ja: '最後まで待って勝つ勝負師', en: 'The player who wins by outlasting everyone' },
    desc: {
      ko: '이기는 순간이 올 때까지 조용히 실력을 쌓는 유형이에요. 도발에 흔들리지 않고, 무리한 싸움은 피하며, 확실한 판에서만 움직입니다. 시간을 내 편으로 만드는 인내가 최강의 무기예요.',
      ja: '勝てる瞬間が来るまで静かに力を蓄えるタイプです。挑発に動じず、無理な戦いは避け、確実な局面でのみ動きます。時間を味方につける忍耐が最強の武器です。',
      en: 'You quietly build strength until the winning moment arrives. Provocations don’t move you, bad fights don’t tempt you — you act only on sure ground. Making time your ally is your ultimate weapon.',
    },
    strengths: {
      ko: ['시간을 이기는 인내심', '냉정한 리스크 관리', '결정적 순간의 집중력'],
      ja: ['時間に勝つ忍耐力', '冷静なリスク管理', '決定的瞬間の集中力'],
      en: ['Patience that outlasts time', 'Cool risk management', 'Total focus at the decisive moment'],
    },
    caution: { ko: '속을 안 보여주다 보니 오해를 살 때가 있어요.', ja: '本心を見せないため、誤解されることがあります。', en: 'Keeping your cards hidden can invite misunderstanding.' },
  },
  {
    slug: 'guojia', code: 'ABBB', hanja: '郭嘉 奉孝', symbol: '奇', color: '#3b82f6', match: 'caocao', clash: 'lvbu',
    name: { ko: '곽가', ja: '郭嘉', en: 'Guo Jia' },
    catch: { ko: '번뜩이는 수읽기의 귀재', ja: '閃きの読みの天才', en: 'The prodigy of lightning-fast reads' },
    desc: {
      ko: '남들이 열 수 앞을 볼 때 상대의 심리까지 읽는 유형이에요. 관습에 얽매이지 않는 자유로운 발상으로, 모두가 반대하는 수에서 승기를 찾아냅니다. 믿는 리더에게는 아낌없이 승부수를 건네줘요.',
      ja: '他人が十手先を読むとき、相手の心理まで読むタイプです。常識に縛られない自由な発想で、皆が反対する一手に勝機を見出します。信じたリーダーには惜しみなく勝負手を授けます。',
      en: 'While others read ten moves ahead, you read the opponent’s mind. Free of convention, you find victory in the move everyone else rejects. To a leader you trust, you hand over your boldest plays without holding back.',
    },
    strengths: {
      ko: ['사람 심리를 읽는 직관', '틀을 깨는 발상', '핵심만 짚는 판단력'],
      ja: ['人の心理を読む直感', '枠を破る発想', '核心だけを突く判断力'],
      en: ['Intuition for people', 'Convention-breaking ideas', 'Judgment that finds the crux'],
    },
    caution: { ko: '몰입하면 자기 관리는 뒷전이 되기 쉬워요.', ja: '没頭すると自己管理が後回しになりがちです。', en: 'Deep in the game, self-care comes last.' },
  },
  {
    slug: 'machao', code: 'BAAA', hanja: '馬超 孟起', symbol: '錦', color: '#f59e0b', match: 'zhaoyun', clash: 'caocao',
    name: { ko: '마초', ja: '馬超', en: 'Ma Chao' },
    catch: { ko: '칼을 갈며 때를 기다리는 맹장', ja: '刃を研ぎ時を待つ猛将', en: 'The fierce general who sharpens his blade and waits' },
    desc: {
      ko: '한번 세운 뜻은 꺾지 않고, 그 뜻을 이룰 힘을 묵묵히 기르는 유형이에요. 화려한 실력만큼이나 잊지 않는 집념이 강점 — 목표를 위해 오래 준비하고, 준비가 끝나면 서량의 기병처럼 몰아칩니다.',
      ja: '一度立てた志は曲げず、それを叶える力を黙々と養うタイプです。華やかな実力に劣らぬ執念が強み — 目標のために長く備え、備えが整えば西涼の騎兵のように攻め立てます。',
      en: 'Once your purpose is set, you never bend it — you quietly build the strength to achieve it. Your tenacity matches your brilliance: you prepare long, and when ready, you charge like the cavalry of Xiliang.',
    },
    strengths: {
      ko: ['꺾이지 않는 집념', '목표를 향한 꾸준한 단련', '몸으로 보여주는 존재감'],
      ja: ['折れない執念', '目標へ向けた鍛錬', '姿で示す存在感'],
      en: ['Unbreakable tenacity', 'Steady training toward the goal', 'Presence that speaks for itself'],
    },
    caution: { ko: '뜻에 사로잡히면 시야가 좁아질 수 있어요.', ja: '志に囚われると視野が狭くなることがあります。', en: 'Fixation on the mission can narrow your view.' },
  },
  {
    slug: 'sunce', code: 'BAAB', hanja: '孫策 伯符', symbol: '烈', color: '#ef4444', match: 'sunjian', clash: 'simayi',
    name: { ko: '손책', ja: '孫策', en: 'Sun Ce' },
    catch: { ko: '거침없이 질주하는 소패왕', ja: '駆け抜ける小覇王', en: 'The Little Conqueror at full gallop' },
    desc: {
      ko: '생각이 서면 몸이 먼저 움직이는 돌파형 리더예요. 특유의 밝은 에너지로 사람을 끌어당기고, 함께라면 뭐든 될 것 같은 기세를 만듭니다. 맨손에서 강동을 일군 것처럼, 속도 자체가 전략이에요.',
      ja: '考えが固まれば体が先に動く突破型リーダーです。持ち前の明るいエネルギーで人を惹きつけ、一緒なら何でもできそうな勢いを作ります。裸一貫から江東を築いたように、速さそのものが戦略です。',
      en: 'Once your mind is set, your body is already moving. Your bright energy pulls people in and creates the feeling that anything is possible together. Like conquering Jiangdong from nothing — speed itself is your strategy.',
    },
    strengths: {
      ko: ['사람을 끌어당기는 에너지', '압도적인 추진 속도', '두려움 없는 개척 정신'],
      ja: ['人を惹きつけるエネルギー', '圧倒的な推進スピード', '恐れを知らない開拓精神'],
      en: ['Magnetic energy', 'Overwhelming momentum', 'Fearless pioneering spirit'],
    },
    caution: { ko: '속도가 붙으면 브레이크가 잘 안 들어요.', ja: 'スピードに乗るとブレーキが利きにくいです。', en: 'At full speed, the brakes barely work.' },
  },
  {
    slug: 'zhaoyun', code: 'BABA', hanja: '趙雲 子龍', symbol: '龍', color: '#10b981', match: 'liubei', clash: 'lvbu',
    name: { ko: '조운', ja: '趙雲', en: 'Zhao Yun' },
    catch: { ko: '빈틈없는 완벽주의 무장', ja: '隙のない完璧主義の武将', en: 'The flawless perfectionist warrior' },
    desc: {
      ko: '맡은 일은 어떤 상황에서도 완수하는 유형이에요. 화려함을 내세우지 않지만 위기일수록 진가가 드러나고, 필요하면 홀로 적진 한복판도 뚫습니다. 언제나 냉정함을 잃지 않는 프로페셔널이에요.',
      ja: '任された仕事はどんな状況でも完遂するタイプです。派手さは求めませんが危機ほど真価を発揮し、必要なら単騎で敵陣の真ん中も突破します。常に冷静さを失わないプロフェッショナルです。',
      en: 'Whatever the situation, you complete the mission. You don’t seek the spotlight, but crisis reveals your true worth — even cutting through the heart of an enemy army alone. A professional who never loses composure.',
    },
    strengths: {
      ko: ['위기에서 빛나는 실력', '흔들림 없는 자기 관리', '조용한 책임감'],
      ja: ['危機で光る実力', '揺るがぬ自己管理', '静かな責任感'],
      en: ['Skill that shines in crisis', 'Unwavering self-discipline', 'Quiet sense of duty'],
    },
    caution: { ko: '완벽을 좇다 혼자 짐을 떠안기 쉬워요.', ja: '完璧を求めるあまり一人で抱え込みがちです。', en: 'Chasing perfection, you shoulder too much alone.' },
  },
  {
    slug: 'guanyu', code: 'BABB', hanja: '關羽 雲長', symbol: '義', color: '#10b981', match: 'zhangfei', clash: 'sunquan',
    name: { ko: '관우', ja: '関羽', en: 'Guan Yu' },
    catch: { ko: '의리로 천리를 가는 무신', ja: '義のために千里を行く武神', en: 'The war god who rides a thousand miles for loyalty' },
    desc: {
      ko: '한번 맺은 의리는 천리를 가로질러서라도 지키는 유형이에요. 눈앞의 이익에 절대 흔들리지 않고, 옳다고 믿는 길이라면 다섯 관문이라도 돌파합니다. 그 일관됨이 사람들의 존경을 만들어요.',
      ja: '一度結んだ義理は千里を越えてでも守るタイプです。目先の利益には決して揺らがず、正しいと信じる道なら五つの関所でも突破します。その一貫性が人々の尊敬を生みます。',
      en: 'A bond once made, you keep — even across a thousand miles. No immediate gain can sway you, and on the road you believe in, you break through five gates if you must. That constancy commands respect.',
    },
    strengths: {
      ko: ['이익에 흔들리지 않는 의리', '홀로도 뚫는 돌파력', '말한 것은 지키는 일관성'],
      ja: ['利に揺らがない義理', '単独でも突き進む突破力', '言ったことを守る一貫性'],
      en: ['Loyalty no profit can buy', 'Breakthrough power even alone', 'A word that is always kept'],
    },
    caution: { ko: '자부심이 강해 도움을 청하는 게 서툴러요.', ja: '誇り高く、助けを求めるのが苦手です。', en: 'Pride makes it hard to ask for help.' },
  },
  {
    slug: 'luxun', code: 'BBAA', hanja: '陸遜 伯言', symbol: '火', color: '#ef4444', match: 'sunquan', clash: 'guanyu',
    name: { ko: '육손', ja: '陸遜', en: 'Lu Xun' },
    catch: { ko: '조용히 승부를 끝내는 젊은 사령관', ja: '静かに勝負を決める若き総司令', en: 'The young commander who ends the war quietly' },
    desc: {
      ko: '얕보이는 것조차 전략으로 쓰는 유형이에요. 조용히 기다리며 상대가 지치기를 유도하고, 단 한 번의 반격으로 판을 끝냅니다. 나이나 경력이 아니라 결과로 자신을 증명하는 실력파예요.',
      ja: '侮られることさえ戦略に使うタイプです。静かに待って相手が疲れるのを誘い、たった一度の反撃で勝負を終わらせます。年齢や経歴ではなく結果で自分を証明する実力派です。',
      en: 'Even being underestimated becomes part of your strategy. You wait quietly, let the opponent exhaust themselves, then end it with a single counterstroke. You prove yourself by results, not by rank or age.',
    },
    strengths: {
      ko: ['판 전체를 보는 침착함', '기다림 끝의 결정력', '결과로 증명하는 실력'],
      ja: ['盤面全体を見る冷静さ', '待った末の決定力', '結果で証明する実力'],
      en: ['Calm that sees the whole board', 'Decisiveness after the wait', 'Results that speak'],
    },
    caution: { ko: '실력을 드러내기 전까진 저평가를 견뎌야 해요.', ja: '実力を示すまでは過小評価に耐える必要があります。', en: 'Until you strike, you must endure being underrated.' },
  },
  {
    slug: 'lvbu', code: 'BBAB', hanja: '呂布 奉先', symbol: '戟', color: '#f59e0b', match: 'machao', clash: 'liubei',
    name: { ko: '여포', ja: '呂布', en: 'Lü Bu' },
    catch: { ko: '천하무쌍, 압도적 실행력', ja: '天下無双、圧倒的な実行力', en: 'Peerless under heaven — pure execution' },
    desc: {
      ko: '생각과 행동 사이의 거리가 0인 유형이에요. 남들이 회의하는 동안 이미 결과를 만들어 오고, 불리한 판도 개인 기량으로 뒤집습니다. 어디에도 얽매이지 않는 자유로움이 최대 매력이에요.',
      ja: '考えと行動の距離がゼロのタイプです。他人が会議をしている間にすでに結果を出し、不利な局面も個人の力量で覆します。何にも縛られない自由さが最大の魅力です。',
      en: 'The distance between your thought and your action is zero. While others hold meetings, you return with results, flipping losing boards through sheer individual skill. Your greatest charm is being bound by nothing.',
    },
    strengths: {
      ko: ['누구도 못 따라오는 실행 속도', '판을 뒤집는 개인 기량', '얽매이지 않는 자유로움'],
      ja: ['誰も追いつけない実行速度', '局面を覆す個人技', '縛られない自由さ'],
      en: ['Execution no one can match', 'Game-flipping individual skill', 'Total freedom from convention'],
    },
    caution: { ko: '혼자서도 강하지만, 함께일 때 더 오래 이겨요.', ja: '一人でも強いですが、仲間とならもっと長く勝てます。', en: 'You’re strong alone — but you win longer together.' },
  },
  {
    slug: 'huangzhong', code: 'BBBA', hanja: '黃忠 漢升', symbol: '弓', color: '#10b981', match: 'zhaoyun', clash: 'guanyu',
    name: { ko: '황충', ja: '黄忠', en: 'Huang Zhong' },
    catch: { ko: '결과로 증명하는 백전노장', ja: '結果で証明する歴戦の名将', en: 'The veteran who proves it with results' },
    desc: {
      ko: '편견과 저평가를 실력 한 방으로 뒤집는 유형이에요. 서두르지 않고 조용히 기회를 노리다, 결정적 순간에 활시위를 놓습니다. 나이도 환경도 핑계 삼지 않는 꾸준함이 진짜 무기예요.',
      ja: '偏見や過小評価を実力の一撃で覆すタイプです。焦らず静かに機会を狙い、決定的瞬間に弓を放ちます。年齢も環境も言い訳にしない継続力が本当の武器です。',
      en: 'You overturn every bias with a single proof of skill. Never rushing, you quietly wait for the opening — then loose the arrow at the decisive moment. Your true weapon is persistence that makes no excuses of age or circumstance.',
    },
    strengths: {
      ko: ['한 방으로 증명하는 실력', '때를 노리는 침착함', '핑계 없는 꾸준함'],
      ja: ['一撃で証明する実力', '機を狙う冷静さ', '言い訳しない継続力'],
      en: ['Skill proven in one shot', 'Calm that waits for the opening', 'Persistence without excuses'],
    },
    caution: { ko: '인정받으려는 마음이 무리로 이어질 수 있어요.', ja: '認められたい思いが無理につながることがあります。', en: 'The drive to be recognized can push you too hard.' },
  },
  {
    slug: 'zhangfei', code: 'BBBB', hanja: '張飛 翼德', symbol: '猛', color: '#10b981', match: 'guanyu', clash: 'lvbu',
    name: { ko: '장비', ja: '張飛', en: 'Zhang Fei' },
    catch: { ko: '돌파력 만렙의 행동대장', ja: '突破力全開の行動隊長', en: 'The frontline captain with maxed-out drive' },
    desc: {
      ko: '말보다 행동, 고민보다 결과로 보여주는 유형이에요. 다리 하나로 대군을 막아서는 배짱과, 의외로 세심한 꾀도 갖췄습니다. 곁에 있는 것만으로 팀에 용기를 주는 존재예요.',
      ja: '言葉より行動、悩むより結果で示すタイプです。橋一つで大軍を止める度胸に加え、意外に細やかな知恵も持っています。そばにいるだけでチームに勇気を与える存在です。',
      en: 'Action over words, results over deliberation. You have the nerve to hold a bridge against an army — and, surprisingly, the cunning to back it up. Your very presence gives the whole team courage.',
    },
    strengths: {
      ko: ['주저 없는 행동력', '대군도 멈추는 배짱', '의외로 치밀한 꾀'],
      ja: ['ためらわない行動力', '大軍をも止める度胸', '意外に緻密な知恵'],
      en: ['Hesitation-free action', 'Nerve that stops an army', 'Surprisingly sharp cunning'],
    },
    caution: { ko: '욱하는 순간이 공든 탑을 흔들 수 있어요.', ja: 'カッとなる瞬間が積み上げたものを揺るがすことがあります。', en: 'One flash of temper can shake all you’ve built.' },
  },
]

export const CHAR_BY_SLUG: Record<string, TKChar> = Object.fromEntries(CHARS.map(c => [c.slug, c]))
export const CHAR_BY_CODE: Record<string, TKChar> = Object.fromEntries(CHARS.map(c => [c.code, c]))

// answers: 12 A/B picks in question order → majority per axis → 4-letter code
export function resolveCode(answers: AB[]): string {
  const cnt = [0, 0, 0, 0] // count of A per axis
  answers.forEach((ans, i) => { if (ans === 'A') cnt[QUESTIONS[i].axis]++ })
  return cnt.map(c => (c >= 2 ? 'A' : 'B')).join('')
}
