// Three Kingdoms idioms — part 1/2: 정사 본문 15. See threeKingdomsIdioms.ts for types.
// 뜻·유래·예문은 자체 서술(저작권 클린), 출전 구분은 승인된 draft 기준.
import type { TKIdiom } from './threeKingdomsIdioms'

export const IDIOMS_A: TKIdiom[] = [
  {
    slug: 'samgochoryeo', hanja: '三顧草廬', ko: '삼고초려', ja: '三顧の礼（さんこのれい）', pinyin: 'sān gù cǎo lú', enLit: 'Three Visits to the Thatched Cottage',
    src: 'history', srcName: { ko: '정사 삼국지 제갈량전(출사표)', ja: '正史『三国志』諸葛亮伝（出師表）', en: 'Records of the Three Kingdoms — Zhuge Liang (the Chu Shi Biao)' },
    people: ['liubei', 'zhugeliang'],
    meaning: {
      ko: '뛰어난 인재를 얻기 위해 정성을 다해 여러 번 찾아가 예를 갖추는 것을 뜻해요. 오늘날에는 인재 영입이나 간곡한 부탁에 두루 쓰입니다.',
      ja: '優れた人材を得るために、何度も足を運び礼を尽くすことを意味します。現代では人材のスカウトや、心を込めた依頼の場面で広く使われます。',
      en: 'To court a talented person with utmost sincerity, visiting again and again. Today it describes going to great lengths to recruit someone or win them over.',
    },
    story: {
      ko: '형주에 몸을 의탁하던 유비는 세력을 일으킬 책사를 애타게 찾고 있었어요. 그때 융중의 초가집에 숨은 인재 제갈량이 있다는 말을 듣습니다. 유비는 관우·장비를 데리고 찾아갔지만 두 번이나 만나지 못했고, 세 번째에야 낮잠에서 깨어난 제갈량을 만날 수 있었죠. 세 번이나 몸을 낮춰 찾아온 정성에 감복한 제갈량은 천하삼분의 계책을 내놓으며 유비의 사람이 됩니다. 제갈량 스스로 출사표에 "선제께서 신을 비루하다 여기지 않으시고 세 번이나 초려로 찾아주셨다"고 적어, 이 이야기는 정사에 남았습니다.',
      ja: '荊州に身を寄せていた劉備は、勢力を興すための軍師を切実に探していました。そんな折、隆中の草庵に諸葛亮という逸材が隠れ住んでいると耳にします。劉備は関羽・張飛を連れて訪ねますが二度も会えず、三度目にようやく昼寝から覚めた諸葛亮に会うことができました。三度も腰を低くして訪ねてきた誠意に感じ入った諸葛亮は、天下三分の計を献じて劉備に仕えます。諸葛亮自身が出師表に「先帝は臣を卑しいとせず、三たび草廬を顧みられた」と記しており、この話は正史に残っています。',
      en: 'Liu Bei, then a guest in Jing Province, was desperately seeking a strategist to build his cause. He heard of a hidden genius named Zhuge Liang living in a thatched cottage in Longzhong. Twice Liu Bei visited with Guan Yu and Zhang Fei and twice failed to meet him; only on the third visit did he find Zhuge Liang, just waking from a nap. Moved by a lord humble enough to call three times, Zhuge Liang offered his grand plan to divide the realm in three and pledged his service. Zhuge Liang himself wrote in his Chu Shi Biao that the late Emperor "condescended to visit my cottage three times" — preserving the story in official history.',
    },
    ex: [
      { ko: '대표가 삼고초려 끝에 업계 최고 개발자를 영입했다.', ja: '社長が三顧の礼を尽くして業界随一のエンジニアを迎え入れた。', en: 'The CEO courted the industry’s best engineer with three-visits persistence until she finally joined.' },
      { ko: '그 감독은 은퇴한 배우를 삼고초려해 복귀시켰다.', ja: '監督は引退した俳優に三顧の礼で復帰を頼み込んだ。', en: 'The director all but camped on the retired actor’s doorstep to bring him back for the film.' },
    ],
    rel: ['sueojigyo', 'cheonhasambunjigye', 'chulsapyo'],
  },
  {
    slug: 'gyereuk', hanja: '鷄肋', ko: '계륵', ja: '鶏肋（けいろく）', pinyin: 'jī lèi', enLit: 'Chicken Ribs',
    src: 'history', srcName: { ko: '후한서 양수전', ja: '『後漢書』楊修伝', en: 'Book of the Later Han — Yang Xiu' },
    people: ['caocao', 'yangxiu'],
    meaning: {
      ko: '먹자니 별 살이 없고 버리자니 아까운 닭갈비처럼, 큰 쓸모는 없지만 버리기는 아까운 것을 뜻해요. 이러지도 저러지도 못하는 애매한 대상에 씁니다.',
      ja: '食べるほど身はないが捨てるには惜しい鶏のあばら骨のように、大した役には立たないが手放すのは惜しいものを指します。どっちつかずの微妙な対象に使います。',
      en: 'Like chicken ribs — too little meat to eat, too good to throw away — it describes something of marginal value you still can’t quite give up.',
    },
    story: {
      ko: '한중을 놓고 유비와 대치하던 조조는 전황이 지지부진하자 고민에 빠졌어요. 어느 날 밤 암구호를 정하라는 물음에 조조는 무심코 "계륵"이라고 답합니다. 부하들이 어리둥절해하는 가운데 참모 양수만이 짐을 싸기 시작했죠. "닭갈비는 먹자니 맛이 없고 버리자니 아깝다 — 왕께서 한중을 그리 여기시니 곧 철군할 것"이라는 해석이었습니다. 과연 조조는 얼마 뒤 한중에서 군을 물렸고, 조조의 속마음을 꿰뚫어 본 이 일화에서 계륵이라는 말이 퍼졌어요.',
      ja: '漢中を巡って劉備と対峙していた曹操は、戦況が膠着して思い悩んでいました。ある夜、合言葉を尋ねられた曹操は思わず「鶏肋」と答えます。部下たちが戸惑う中、参謀の楊修だけが荷物をまとめ始めました。「鶏のあばらは食べても身がなく、捨てるには惜しい — 王は漢中をそう見ておられるのだから、じきに撤退する」という読みでした。果たして曹操はほどなく漢中から兵を引き、曹操の本心を見抜いたこの逸話から鶏肋という言葉が広まりました。',
      en: 'Facing Liu Bei in a stalemate over Hanzhong, Cao Cao grew weary of the campaign. One night, asked for the watchword, he absent-mindedly answered "chicken ribs." His officers were baffled — but the aide Yang Xiu quietly began packing. "Chicken ribs have no meat to eat, yet feel wasteful to discard: that is how the King sees Hanzhong, so we will soon withdraw," he explained. Cao Cao did indeed pull his army out shortly after, and the tale of reading his mind made "chicken ribs" a lasting expression.',
    },
    ex: [
      { ko: '쓰지도 않으면서 해지하긴 아까운 구독 서비스, 딱 계륵이다.', ja: '使わないのに解約するのは惜しいサブスク、まさに鶏肋だ。', en: 'That subscription I never use but can’t bring myself to cancel is pure chicken ribs.' },
      { ko: '수익은 적은데 접자니 아까운 사업이라 계륵 같은 존재가 됐다.', ja: '利益は少ないのに畳むには惜しい事業で、鶏肋のような存在になった。', en: 'The side business barely makes money, but shutting it down feels wasteful — a chicken-ribs dilemma.' },
    ],
    rel: ['mangmaejigal', 'byeonggwisinsok', 'woldanpyeong'],
  },
  {
    slug: 'eupchammasok', hanja: '泣斬馬謖', ko: '읍참마속', ja: '泣いて馬謖を斬る（ないてばしょくをきる）', pinyin: 'qì zhǎn mǎ sù', enLit: 'Executing Ma Su in Tears',
    src: 'history', srcName: { ko: '정사 삼국지 마속전(읍 묘사는 양양기)', ja: '正史『三国志』馬謖伝（涙の描写は襄陽記）', en: 'Records of the Three Kingdoms — Ma Su' },
    people: ['zhugeliang', 'masu'],
    meaning: {
      ko: '아무리 아끼는 사람이라도 대의와 기강을 위해서는 눈물을 머금고 처벌한다는 뜻이에요. 공정한 원칙 앞에 사사로운 정을 접는 결단을 가리킵니다.',
      ja: 'どんなに可愛がっている人でも、大義と規律のためには涙をのんで処罰するという意味です。公正な原則の前で私情を断つ決断を指します。',
      en: 'To punish even someone you cherish, in tears, for the sake of discipline and the greater cause — putting principle above personal affection.',
    },
    story: {
      ko: '제1차 북벌에서 제갈량은 아끼던 마속에게 요충지 가정의 수비를 맡겼어요. 그러나 마속은 물가를 버리고 산 위에 진을 치라는 지시를 어긴 끝에 위군에게 대패하고 맙니다. 보급로가 끊긴 촉군은 애써 얻은 땅을 모두 버리고 철군해야 했죠. 제갈량은 마속을 친아들처럼 아꼈지만, 군령의 지엄함을 세우기 위해 눈물을 흘리며 처형을 명했습니다. 그리고 자신 역시 사람을 잘못 쓴 책임을 물어 스스로 관직을 세 등급 깎았어요.',
      ja: '第一次北伐で諸葛亮は、目をかけていた馬謖に要衝・街亭の守備を任せました。しかし馬謖は水場を捨てて山上に陣を敷き、指示に背いた末に魏軍に大敗してしまいます。補給路を断たれた蜀軍は、せっかく得た土地をすべて捨てて撤退するしかありませんでした。諸葛亮は馬謖を我が子のように可愛がっていましたが、軍令の厳粛さを立てるため、涙を流しながら処刑を命じました。そして自らも人選を誤った責任を取り、自分の官位を三階級下げたのです。',
      en: 'In his first northern campaign, Zhuge Liang entrusted the vital pass of Jieting to his favorite protégé, Ma Su. Ignoring orders, Ma Su abandoned the water source and camped on a hilltop — and was crushed by the Wei army. With the supply line cut, the Shu forces had to abandon everything they had gained and retreat. Though he loved Ma Su like a son, Zhuge Liang ordered his execution in tears to uphold military law. He then demoted himself three ranks for having chosen the wrong man.',
    },
    ex: [
      { ko: '구단은 에이스라도 음주 운전에는 읍참마속으로 방출을 결정했다.', ja: '球団はエースであっても飲酒運転には泣いて馬謖を斬る覚悟で放出を決めた。', en: 'Star player or not, the club cut him over the drunk-driving scandal — a tearful but necessary execution of discipline.' },
      { ko: '창업 멤버의 비리가 드러나자 대표는 읍참마속의 심정으로 해임했다.', ja: '創業メンバーの不正が発覚し、代表は泣いて馬謖を斬る思いで解任した。', en: 'When the co-founder’s misconduct surfaced, the CEO dismissed him with a heavy heart, principle over friendship.' },
    ],
    rel: ['eongwagisil', 'chulsapyo', 'baekmi'],
  },
  {
    slug: 'baekmi', hanja: '白眉', ko: '백미', ja: '白眉（はくび）', pinyin: 'bái méi', enLit: 'The White Eyebrows',
    src: 'history', srcName: { ko: '정사 삼국지 마량전', ja: '正史『三国志』馬良伝', en: 'Records of the Three Kingdoms — Ma Liang' },
    people: ['maliang'],
    meaning: {
      ko: '여럿 가운데 가장 뛰어난 사람이나 작품을 뜻해요. 무리 중 단연 돋보이는 최고를 가리킬 때 씁니다.',
      ja: '多くの中で最も優れた人や作品を意味します。群を抜いて際立つ最高のものを指すときに使います。',
      en: 'The finest among many — the standout person or work in a group.',
    },
    story: {
      ko: '형주 양양의 마씨 집안에는 다섯 형제가 있었는데, 모두 재주가 뛰어나 고을의 자랑이었어요. 다섯 모두 자(字)에 상(常) 자가 들어 있어 사람들은 이들을 "마씨오상"이라 불렀습니다. 그중에서도 눈썹에 흰 털이 섞인 넷째 마량이 가장 뛰어났죠. 그래서 고을 사람들은 "마씨 오상 가운데 백미가 으뜸"이라는 말을 입에 올렸습니다. 여기서 흰 눈썹, 곧 백미가 여럿 중 최고를 가리키는 말이 되었어요. 마량은 훗날 유비를 섬기며 남방 이민족을 회유하는 큰 공을 세웁니다.',
      ja: '荊州襄陽の馬氏には五人の兄弟がいて、みな才に恵まれ郷里の誇りでした。五人とも字（あざな）に「常」の字が入っていたため、人々は彼らを「馬氏の五常」と呼びました。その中でも眉に白い毛の混じった馬良が最も優れていたのです。そこで郷里の人々は「馬氏の五常、白眉もっとも良し」と口にしました。ここから白い眉、すなわち白眉が、多くの中の最高を指す言葉になりました。馬良は後に劉備に仕え、南方異民族の懐柔に大きな功を立てます。',
      en: 'The Ma family of Xiangyang had five talented brothers, the pride of their county. All five had the character "Chang" in their courtesy names, so people called them the "Five Changs of the Ma clan." The most brilliant was Ma Liang, whose eyebrows carried streaks of white hair. Locals would say, "Of the Five Changs, the white eyebrows are the finest." Thus "white eyebrows" came to mean the best among many. Ma Liang later served Liu Bei with distinction, winning over the southern tribes.',
    },
    ex: [
      { ko: '이번 전시의 백미는 마지막 방의 대형 설치 작품이다.', ja: '今回の展示の白眉は、最後の部屋の大型インスタレーションだ。', en: 'The crown jewel of the exhibition is the large installation in the final room.' },
      { ko: '그 영화의 백미는 단연 10분간 이어지는 오프닝 롱테이크다.', ja: 'あの映画の白眉は、なんといっても10分続くオープニングの長回しだ。', en: 'The film’s finest moment is unquestionably the ten-minute opening long take.' },
    ],
    rel: ['eupchammasok', 'gwalmoksangdae', 'chilbojijae'],
  },
  {
    slug: 'sueojigyo', hanja: '水魚之交', ko: '수어지교', ja: '水魚の交わり（すいぎょのまじわり）', pinyin: 'shuǐ yú zhī jiāo', enLit: 'Like Fish and Water',
    src: 'history', srcName: { ko: '정사 삼국지 제갈량전', ja: '正史『三国志』諸葛亮伝', en: 'Records of the Three Kingdoms — Zhuge Liang' },
    people: ['liubei', 'zhugeliang'],
    meaning: {
      ko: '물과 물고기처럼 떼려야 뗄 수 없는 아주 친밀한 사이를 뜻해요. 서로가 서로에게 꼭 필요한 관계에 씁니다.',
      ja: '水と魚のように切っても切れない、非常に親密な間柄を意味します。互いが互いに欠かせない関係に使います。',
      en: 'A bond as inseparable as fish and water — a relationship where each is essential to the other.',
    },
    story: {
      ko: '삼고초려로 제갈량을 얻은 유비는 그와 밤낮없이 천하의 일을 논하며 나날이 가까워졌어요. 갓 들어온 젊은 책사가 총애를 독차지하자, 오랜 세월 생사를 함께한 관우와 장비는 서운함을 감추지 못했습니다. 그러자 유비는 두 아우를 이렇게 달랬죠. "내가 공명을 얻은 것은 물고기가 물을 만난 것과 같으니, 다시는 말하지 말라." 주군이 스스로를 물고기에, 신하를 물에 비유한 이 말에 두 사람도 더는 불평하지 않았습니다. 여기서 물과 물고기의 사귐, 수어지교가 나왔어요.',
      ja: '三顧の礼で諸葛亮を得た劉備は、昼夜を問わず天下の事を語り合い、日に日に親密になっていきました。新参の若い軍師が寵愛を独り占めするので、長年生死を共にしてきた関羽と張飛は不満を隠せません。すると劉備は二人の弟分をこう諭しました。「私が孔明を得たのは、魚が水を得たようなものだ。二度と言うな」。主君が自らを魚に、臣下を水にたとえたこの言葉に、二人もそれ以上文句を言いませんでした。ここから水と魚の交わり、水魚の交わりが生まれました。',
      en: 'After winning Zhuge Liang through his three visits, Liu Bei spent days and nights with him discussing the realm, growing ever closer. Guan Yu and Zhang Fei, sworn companions through life and death, couldn’t hide their resentment at the newcomer monopolizing their lord’s favor. Liu Bei soothed them: "Having Kongming is like a fish finding water — speak of it no more." A lord likening himself to the fish and his minister to the water silenced all complaint. From this came "the friendship of water and fish."',
    },
    ex: [
      { ko: '창업자와 CTO는 10년을 함께한 수어지교의 파트너다.', ja: '創業者とCTOは10年を共にした水魚の交わりのパートナーだ。', en: 'The founder and CTO are fish-and-water partners, ten years inseparable.' },
      { ko: '감독과 주연 배우는 수어지교라 불릴 만큼 합이 잘 맞는다.', ja: '監督と主演俳優は水魚の交わりと呼ばれるほど息が合っている。', en: 'Director and lead actor click so completely that people call them fish and water.' },
    ],
    rel: ['samgochoryeo', 'dowongyeorui', 'cheonhasambunjigye'],
  },
  {
    slug: 'cheonhasambunjigye', hanja: '天下三分之計', ko: '천하삼분지계', ja: '天下三分の計（てんかさんぶんのけい）', pinyin: 'tiān xià sān fēn zhī jì', enLit: 'The Plan to Divide the Realm in Three',
    src: 'history', srcName: { ko: '정사 삼국지 제갈량전(융중대)', ja: '正史『三国志』諸葛亮伝（隆中対）', en: 'Records of the Three Kingdoms — Zhuge Liang (the Longzhong Plan)' },
    people: ['zhugeliang', 'liubei'],
    meaning: {
      ko: '천하를 셋으로 나누어 정립시킨다는 제갈량의 대전략에서 나온 말로, 판 전체를 읽고 세우는 원대한 청사진을 뜻해요. 강자와 정면 대결하는 대신 자기 몫의 기반부터 확보하는 전략을 가리키기도 합니다.',
      ja: '天下を三つに分けて鼎立させるという諸葛亮の大戦略から生まれた言葉で、盤面全体を読んで立てる壮大な青写真を意味します。強者と正面から争わず、まず自分の基盤を確保する戦略も指します。',
      en: 'From Zhuge Liang’s grand strategy of splitting the realm into three, it means a sweeping master plan built on reading the whole board — securing your own base rather than fighting the strongest head-on.',
    },
    story: {
      ko: '세 번째 방문에서 유비를 만난 제갈량은 초가집에 앉은 채 천하의 형세를 그려 보였어요. 조조는 백만 대군에 천자를 끼고 있으니 정면으로 다툴 수 없고, 손권은 삼대에 걸쳐 강동을 다져 놓았으니 동맹으로 삼아야 한다고 봤죠. 대신 유비는 형주와 익주를 취해 셋 중 하나의 축을 세우라는 것이 계책의 핵심이었습니다. 천하를 셋으로 나눠 정립한 뒤, 때가 오면 두 갈래로 북진해 한실을 부흥한다는 청사진이었어요. 아직 근거지 하나 없던 유비에게 천하 경영의 지도를 쥐여준 이 대화가 바로 융중대, 천하삼분지계입니다.',
      ja: '三度目の訪問で劉備に会った諸葛亮は、草庵に座したまま天下の形勢を描いてみせました。曹操は百万の軍勢に天子を擁しているので正面から争えず、孫権は三代にわたり江東を固めているので同盟とすべきだと見ました。代わりに劉備は荊州と益州を取り、三つのうち一つの軸を立てよというのが計略の核心でした。天下を三分して鼎立した後、時が来れば二方面から北進して漢室を復興するという青写真です。まだ根拠地一つ持たない劉備に天下経営の地図を握らせたこの対話こそ、隆中対、天下三分の計です。',
      en: 'Meeting Liu Bei on the third visit, Zhuge Liang sketched the shape of the realm without leaving his cottage. Cao Cao, with a million troops and the Emperor in hand, could not be fought head-on; Sun Quan, whose family had held the Southland for three generations, should be an ally. The heart of the plan: Liu Bei should take Jing and Yi provinces and become the third pillar. Divide the realm in three, then, when the moment came, march north on two fronts to restore the Han. This conversation — handing a landless wanderer a map to the empire — is the Longzhong Plan.',
    },
    ex: [
      { ko: '후발 주자인 그 회사는 양강 구도를 피해 틈새를 차지하는 천하삼분지계를 택했다.', ja: '後発のあの会社は二強の構図を避け、隙間を押さえる天下三分の計を選んだ。', en: 'Rather than charge the two giants head-on, the latecomer carved out its own third of the market — a classic divide-in-three play.' },
      { ko: '리그가 양분된 상황에서 신생팀은 천하삼분지계를 노리고 전력을 키웠다.', ja: '二分されたリーグで新興チームは天下三分の計を狙って戦力を蓄えた。', en: 'With the league split between two powers, the new team quietly built strength to make it a three-way race.' },
    ],
    rel: ['samgochoryeo', 'chulsapyo', 'sueojigyo'],
  },
  {
    slug: 'chulsapyo', hanja: '出師表', ko: '출사표', ja: '出師の表（すいしのひょう）', pinyin: 'chū shī biǎo', enLit: 'The Memorial on Marching Out',
    src: 'history', srcName: { ko: '정사 삼국지 제갈량전 수록(국궁진췌는 후출사표 — 진위 논란 있음)', ja: '正史『三国志』諸葛亮伝所収（鞠躬尽瘁は後出師表 — 真偽に議論あり）', en: 'Records of the Three Kingdoms — Zhuge Liang (jugong-jinchui is from the disputed Later Memorial)' },
    people: ['zhugeliang'],
    meaning: {
      ko: '큰 싸움이나 도전에 나서며 각오를 밝히는 것을 뜻해요. "출사표를 던지다"는 선거·경쟁 참가 선언의 관용구가 됐고, 함께 쓰이는 국궁진췌(鞠躬盡瘁)는 몸을 굽혀 온 힘을 다한다는 뜻입니다.',
      ja: '大きな戦いや挑戦に臨んで決意を表明することを意味します。日本語でも「出師の表を奉る」は覚悟の表明として使われ、共に語られる鞠躬尽瘁は身を屈めて全力を尽くすという意味です。',
      en: 'To declare one’s resolve before a great undertaking. "Submitting the chu-shi-biao" now means formally throwing your hat in the ring; the companion phrase jugong-jinchui means bending one’s body in utter devotion.',
    },
    story: {
      ko: '유비가 세상을 떠난 뒤, 제갈량은 어린 황제 유선을 보필하며 북벌을 준비했어요. 위나라 정벌군을 이끌고 떠나기 전, 그는 황제에게 올리는 글 한 편을 남깁니다. 선제의 은혜, 어진 신하를 가까이하고 간신을 멀리하라는 당부, 그리고 한실 부흥의 각오가 절절히 담긴 이 글이 출사표예요. "읽고 눈물을 흘리지 않으면 충신이 아니다"라는 말이 붙을 만큼 명문으로 꼽힙니다. 이어지는 후출사표의 "국궁진췌 사이후이(죽은 뒤에야 그만둔다)"는 제갈량의 헌신을 상징하는 구절이 되었지만, 후출사표 자체는 후대에 진위 논란이 있어요.',
      ja: '劉備の死後、諸葛亮は幼い皇帝・劉禅を補佐しながら北伐を準備しました。魏への遠征軍を率いて発つ前、彼は皇帝に奉る一編の文章を残します。先帝の恩、賢臣を近づけ佞臣を遠ざけよという戒め、そして漢室復興の決意が切々と綴られたこの文章が出師の表です。「読んで涙を流さぬ者は忠臣にあらず」と言われるほどの名文とされます。続く後出師表の「鞠躬尽瘁、死して後已む」は諸葛亮の献身を象徴する一節となりましたが、後出師表自体は後世、真偽の議論があります。',
      en: 'After Liu Bei’s death, Zhuge Liang served the young emperor Liu Shan while preparing the northern campaigns. Before marching against Wei, he submitted a memorial to the throne: gratitude to the late Emperor, counsel to keep worthy ministers close and flatterers far, and his vow to restore the Han. This is the Chu Shi Biao, so moving it was said no loyal heart could read it dry-eyed. The Later Memorial’s line "I shall bend my body and give my all, ceasing only in death" became the emblem of his devotion — though that second memorial’s authenticity has long been debated.',
    },
    ex: [
      { ko: '그는 시장 선거에 출사표를 던지며 공식 출마를 선언했다.', ja: '彼は市長選に出師の表を奉じる思いで正式に出馬を表明した。', en: 'He formally threw his hat in the ring for mayor, declaring his resolve like a general marching out.' },
      { ko: '신제품 발표회는 세계 시장을 향한 회사의 출사표였다.', ja: '新製品発表会は世界市場へ向けた会社の出師の表だった。', en: 'The product launch was the company’s declaration of war on the global market.' },
    ],
    rel: ['samgochoryeo', 'siksosabeon', 'sagongmyeong'],
  },
  {
    slug: 'dandobuhoe', hanja: '單刀赴會', ko: '단도부회', ja: '単刀赴会（たんとうふかい）', pinyin: 'dān dāo fù huì', enLit: 'Attending the Meeting with a Single Blade',
    src: 'history', srcName: { ko: '정사 삼국지 노숙전(연의는 관우 시점으로 극화)', ja: '正史『三国志』魯粛伝（演義は関羽視点に脚色）', en: 'Records of the Three Kingdoms — Lu Su (the novel retells it from Guan Yu’s side)' },
    people: ['guanyu', 'lusu'],
    meaning: {
      ko: '칼 한 자루만 차고 적진의 모임에 나아간다는 뜻으로, 위험을 무릅쓴 담대한 단신 협상을 가리켜요. 배짱과 당당함으로 승부하는 자리에 씁니다.',
      ja: '刀一振りだけを帯びて敵地の会合に赴くという意味で、危険を冒した大胆な単身交渉を指します。度胸と堂々たる態度で勝負する場面に使います。',
      en: 'To walk into the enemy’s parley wearing a single blade — a bold, lone negotiation in the lion’s den, won by sheer nerve.',
    },
    story: {
      ko: '적벽대전 이후 형주의 반환을 놓고 촉과 오의 갈등이 깊어졌어요. 오의 노숙은 담판을 위해 관우에게 회담을 청했고, 양측 군사는 백 보 밖에 물린 채 장수들만 칼 한 자루씩 차고 만나기로 했습니다. 살벌한 분위기 속에서 노숙은 형주를 돌려달라 다그쳤고, 관우 측도 물러서지 않아 회담장엔 긴장이 팽팽했죠. 정사는 이 단도회를 노숙의 당당한 담판으로 기록하지만, 연의는 관우가 홀로 적진에 들어가 유유히 빠져나오는 명장면으로 극화했습니다. 어느 쪽이든 칼 한 자루에 의지해 사지로 걸어 들어가는 담대함이 이 말의 핵심이에요.',
      ja: '赤壁の戦いの後、荊州の返還を巡って蜀と呉の対立が深まりました。呉の魯粛は談判のため関羽に会談を申し入れ、両軍を百歩の外に下げ、将だけが刀一振りを帯びて会うことになりました。殺伐とした空気の中、魯粛は荊州の返還を迫り、関羽側も引かず、会談の場は緊張が張り詰めました。正史はこの単刀会を魯粛の堂々たる談判として記録していますが、演義は関羽が単身敵地に乗り込み悠々と引き上げる名場面に脚色しています。いずれにせよ、刀一振りを頼りに死地へ歩み入る大胆さがこの言葉の核心です。',
      en: 'After Red Cliffs, Shu and Wu fell into bitter dispute over Jing Province. Wu’s Lu Su proposed a parley with Guan Yu: both armies would withdraw a hundred paces, and the commanders would meet wearing a single blade each. In that razor-edged atmosphere Lu Su pressed for the province’s return, Guan Yu’s side yielded nothing, and the meeting crackled with tension. The histories record it as Lu Su’s fearless negotiation; the novel restaged it as Guan Yu strolling alone into the enemy camp and out again. Either way, the heart of the phrase is the audacity to walk into mortal danger with only one sword.',
    },
    ex: [
      { ko: '그는 변호사도 없이 단도부회 격으로 협상 테이블에 혼자 나섰다.', ja: '彼は弁護士も付けず、単刀赴会さながらに交渉の席へ一人で臨んだ。', en: 'He walked into the negotiation alone, no lawyers — a single blade at the enemy’s table.' },
      { ko: '적대적 주주총회에 대표 혼자 참석한 것은 단도부회나 다름없었다.', ja: '敵対的な株主総会に代表が一人で出席したのは、単刀赴会も同然だった。', en: 'Facing the hostile shareholders’ meeting solo, the CEO played it like the lone-blade parley.' },
    ],
    rel: ['maninjijeok', 'gwalmoksangdae', 'choseonchajeon'],
  },
  {
    slug: 'pajukjise', hanja: '破竹之勢', ko: '파죽지세', ja: '破竹の勢い（はちくのいきおい）', pinyin: 'pò zhú zhī shì', enLit: 'Like Splitting Bamboo',
    src: 'history', srcName: { ko: '진서 두예전(삼국 통일 전쟁)', ja: '『晋書』杜預伝（三国統一戦争）', en: 'Book of Jin — Du Yu (the war that ended the Three Kingdoms)' },
    people: ['duyu'],
    meaning: {
      ko: '대나무를 쪼갤 때 첫 마디만 가르면 나머지가 죽 갈라지듯, 거침없이 이겨 나가는 맹렬한 기세를 뜻해요. 연승 행진이나 무서운 상승세에 씁니다.',
      ja: '竹を割るとき最初の節さえ裂けば残りが一気に割れるように、とどまるところを知らない猛烈な勢いを意味します。連勝街道や凄まじい上昇気流に使います。',
      en: 'Like bamboo that splits all the way down once the first joints crack — unstoppable momentum, victory after victory.',
    },
    story: {
      ko: '삼국 시대의 마지막 장면, 진나라는 마지막 남은 오나라 정벌에 나섰어요. 사령관 두예의 군대가 연전연승하자 일부 참모들은 "곧 강물이 불어나는 철이니 일단 물러났다 다음에 다시 치자"고 건의했습니다. 두예는 고개를 저으며 답했죠. "지금 우리 군의 기세는 대나무를 쪼개는 것과 같다 — 몇 마디만 가르면 나머지는 칼날만 대도 갈라진다." 진군은 그대로 밀어붙여 순식간에 오의 수도 건업을 함락시켰고, 백 년 가까운 삼국의 분열이 끝났습니다. 대나무 쪼개는 기세, 파죽지세는 여기서 나왔어요.',
      ja: '三国時代の最後の場面、晋は最後に残った呉の征伐に乗り出しました。司令官・杜預の軍が連戦連勝すると、一部の参謀は「まもなく川が増水する季節だから、一旦引いて次の機会に攻めよう」と進言しました。杜預は首を横に振って答えます。「今の我が軍の勢いは竹を割るようなものだ — 数節を裂けば、残りは刃を当てるだけで割れていく」。晋軍はそのまま押し切り、瞬く間に呉の都・建業を陥落させ、百年近い三国の分裂が終わりました。竹を割る勢い、破竹の勢いはここから生まれました。',
      en: 'In the closing act of the Three Kingdoms, Jin marched on Wu, the last kingdom standing. As commander Du Yu won battle after battle, some staff urged him to pause: the rivers would soon flood, better to withdraw and strike again later. Du Yu shook his head: "Our momentum is like splitting bamboo — crack the first few joints and the rest falls open at the touch of the blade." The army pressed on, took the Wu capital Jianye in a rush, and a century of division ended. From his words comes "the force that splits bamboo."',
    },
    ex: [
      { ko: '개막 10연승 — 그 팀은 파죽지세로 리그 선두를 질주했다.', ja: '開幕10連勝 — あのチームは破竹の勢いでリーグ首位を独走した。', en: 'Ten straight wins to open the season — the team tore through the league like splitting bamboo.' },
      { ko: '신제품은 출시 한 달 만에 파죽지세로 시장 점유율 1위에 올랐다.', ja: '新製品は発売1か月で破竹の勢いのままシェア1位に躍り出た。', en: 'A month after launch, the product surged unstoppably to the top market share.' },
    ],
    rel: ['byeonggwisinsok', 'maninjijeok', 'chiljongchilgeum'],
  },
  {
    slug: 'maninjijeok', hanja: '萬人之敵', ko: '만인지적', ja: '万人の敵（ばんにんのてき）', pinyin: 'wàn rén zhī dí', enLit: 'A Match for Ten Thousand',
    src: 'history', srcName: { ko: '정사 삼국지 관장마황조전', ja: '正史『三国志』関張馬黄趙伝', en: 'Records of the Three Kingdoms — Biographies of Guan, Zhang, Ma, Huang, Zhao' },
    people: ['guanyu', 'zhangfei'],
    meaning: {
      ko: '혼자서 만 명을 상대할 만한 뛰어난 용맹, 또는 그런 인물을 뜻해요. 압도적인 개인 기량을 가진 에이스를 가리킵니다.',
      ja: '一人で万人を相手にできるほどの並外れた武勇、またはその持ち主を意味します。圧倒的な個人技量を持つエースを指します。',
      en: 'Prowess worth ten thousand men — an individual so formidable they count as an army.',
    },
    story: {
      ko: '관우와 장비는 유비가 아직 아무것도 아니던 시절부터 곁을 지킨 두 팔이었어요. 관우는 안량의 목을 대군 한가운데서 베어 왔고, 장비는 장판교에서 홀로 조조의 추격군을 멈춰 세웠습니다. 정사를 쓴 진수는 두 사람을 평하며 "만 명을 상대할 만한 자들로, 당대의 범 같은 신하였다"고 적었죠. 적국이던 위와 오의 신하들조차 두 사람을 만인지적이라 부르며 경계했다는 기록이 남아 있습니다. 이후 만인지적은 홀로 전세를 바꾸는 압도적 무용의 대명사가 되었어요.',
      ja: '関羽と張飛は、劉備がまだ何者でもなかった頃からそばを守ってきた両腕でした。関羽は大軍のただ中で顔良の首を取り、張飛は長坂橋でただ一人、曹操の追撃軍を止めました。正史を著した陳寿は二人を評して「万人を相手にすべき者たちで、当代の虎臣であった」と記しています。敵国だった魏や呉の臣下たちでさえ、二人を万人の敵と呼んで警戒したという記録が残っています。以来、万人の敵は一人で戦局を変える圧倒的武勇の代名詞となりました。',
      en: 'Guan Yu and Zhang Fei guarded Liu Bei’s side from the days when he was nobody. Guan Yu took the enemy general Yan Liang’s head from the middle of an army; Zhang Fei alone halted Cao Cao’s pursuit at Changban Bridge. The historian Chen Shou judged them "men to match ten thousand, tiger ministers of their age." Even the ministers of rival Wei and Wu, records say, warily called the pair wanren-zhi-di. The phrase became the byword for valor that turns a battle single-handedly.',
    },
    ex: [
      { ko: '그 에이스는 혼자 경기를 뒤집는 만인지적급 선수다.', ja: 'あのエースは一人で試合をひっくり返す万人の敵クラスの選手だ。', en: 'That ace is a one-man army, the kind who flips a game single-handedly.' },
      { ko: '장애 대응에서는 그 시니어 엔지니어가 만인지적이다.', ja: '障害対応ではあのシニアエンジニアが万人の敵だ。', en: 'In an outage, that senior engineer is worth ten thousand — the whole war changes when she logs on.' },
    ],
    rel: ['dandobuhoe', 'dowongyeorui', 'pajukjise'],
  },
  {
    slug: 'eongwagisil', hanja: '言過其實', ko: '언과기실', ja: '言過其実（げんかきじつ）', pinyin: 'yán guò qí shí', enLit: 'Words Beyond One’s Deeds',
    src: 'history', srcName: { ko: '정사 삼국지 마량전(유비의 유언)', ja: '正史『三国志』馬良伝（劉備の遺言）', en: 'Records of the Three Kingdoms — Ma Liang (Liu Bei’s dying counsel)' },
    people: ['liubei', 'masu'],
    meaning: {
      ko: '말이 실제 능력이나 사실보다 부풀려져 있다는 뜻이에요. 화려한 언변에 비해 실속이 없는 사람이나 과장된 주장에 씁니다.',
      ja: '言葉が実際の能力や事実より誇張されているという意味です。派手な弁舌のわりに中身のない人や、大げさな主張に使います。',
      en: 'Talk that outruns the substance — describing someone whose eloquence exceeds their real ability, or an inflated claim.',
    },
    story: {
      ko: '마속은 병법 이야기를 시작하면 밤을 새울 만큼 언변이 뛰어난 수재였고, 제갈량도 그와의 토론을 아꼈어요. 그러나 임종을 앞둔 유비의 눈은 달랐습니다. 백제성에서 제갈량에게 뒷일을 맡기며 유비는 이렇게 당부했죠. "마속은 말이 실제보다 지나치니(言過其實) 크게 쓰면 안 되오. 공은 잘 살피시오." 제갈량은 이 유언을 무겁게 여기지 않았고, 훗날 가정 전투에서 마속을 중용했다가 북벌 전체를 그르치게 됩니다. 사람을 말로 평가하는 위험을 경고하는 이 한마디는 그렇게 현실이 되었어요.',
      ja: '馬謖は兵法談義を始めれば夜を明かすほど弁の立つ秀才で、諸葛亮も彼との議論を好みました。しかし死期を悟った劉備の目は違いました。白帝城で諸葛亮に後事を託しながら、劉備はこう言い残します。「馬謖は言葉が実際に過ぎる（言過其実）。大きく用いてはならぬ。よく見極めよ」。諸葛亮はこの遺言を重く受け止めず、後に街亭の戦いで馬謖を重用して北伐全体を誤らせてしまいます。人を言葉で評価する危うさを戒めたこの一言は、そうして現実となりました。',
      en: 'Ma Su was a brilliant talker who could discourse on strategy all night, and Zhuge Liang treasured their debates. But the dying Liu Bei saw differently. Entrusting the state to Zhuge Liang at Baidicheng, he warned: "Ma Su’s words outrun his substance — do not give him great responsibility. Watch him carefully." Zhuge Liang did not take the warning to heart, later gave Ma Su the key command at Jieting, and lost the whole campaign. The old king’s caution against judging people by their eloquence proved true in the harshest way.',
    },
    ex: [
      { ko: '그 스타트업의 발표는 언과기실이라, 시제품조차 없었다.', ja: 'あのスタートアップの発表は言過其実で、試作品すらなかった。', en: 'The startup’s pitch was all words beyond substance — they didn’t even have a prototype.' },
      { ko: '면접 때는 화려했지만 실무에서 언과기실임이 드러났다.', ja: '面接では華やかだったが、実務で言過其実だと露呈した。', en: 'He dazzled in the interview, but on the job his talk clearly outran his skills.' },
    ],
    rel: ['eupchammasok', 'baekmi', 'woldanpyeong'],
  },
  {
    slug: 'gaemuneupdo', hanja: '開門揖盜', ko: '개문읍도', ja: '開門揖盗（かいもんゆうとう）', pinyin: 'kāi mén yī dào', enLit: 'Opening the Gate to Bow the Thief In',
    src: 'history', srcName: { ko: '정사 삼국지 오주전(장소의 간언)', ja: '正史『三国志』呉主伝（張昭の諫言）', en: 'Records of the Three Kingdoms — Sun Quan (Zhang Zhao’s counsel)' },
    people: ['sunquan', 'zhangzhao'],
    meaning: {
      ko: '문을 열고 도둑에게 절까지 하며 맞아들인다는 뜻으로, 스스로 화를 불러들이는 어리석음을 가리켜요. 위기 앞에서 넋을 놓아 적에게 틈을 내주는 상황에 씁니다.',
      ja: '門を開けて盗人にお辞儀までして迎え入れるという意味で、自ら災いを招き入れる愚かさを指します。危機を前に呆然として敵に隙を与える状況に使います。',
      en: 'To open your own gate and bow the robber in — inviting disaster through your own negligence at the very moment vigilance is needed.',
    },
    story: {
      ko: '강동의 젊은 패자 손책이 자객의 습격으로 급서하자, 열아홉 손권은 형을 잃은 슬픔에 정사를 놓은 채 통곡만 했어요. 원로 장소가 그를 일으켜 세우며 간언합니다. "지금은 천하가 승냥이처럼 다투는 때인데, 슬픔에 잠겨 문을 열어 두는 것은 도둑을 절하며 맞아들이는 격입니다." 상중이라도 갑옷을 입고 군을 살펴야 한다는 채찍이었죠. 손권은 눈물을 거두고 말에 올라 군영을 순시했고, 강동은 흔들림 없이 다음 시대로 넘어갔습니다. 여기서 문 열고 도둑 맞이하기, 개문읍도가 나왔어요.',
      ja: '江東の若き覇者・孫策が刺客の襲撃で急死すると、十九歳の孫権は兄を失った悲しみに政務を放り出して泣き崩れるばかりでした。長老の張昭が彼を立たせて諫めます。「今は天下が豺狼のごとく争う時。悲しみに沈んで門を開け放つのは、盗人に礼をして迎え入れるようなものです」。喪中であっても甲冑をまとい軍を見回れという鞭でした。孫権は涙を収めて馬に乗り、軍営を巡視し、江東は揺らぐことなく次の時代へ進みました。ここから門を開けて盗人を迎える、開門揖盗が生まれました。',
      en: 'When Sun Ce, the young conqueror of the Southland, was cut down by assassins, nineteen-year-old Sun Quan abandoned state affairs to weep for his brother. The elder statesman Zhang Zhao pulled him to his feet: "The realm is a den of fighting wolves. To drown in grief with the gates standing open is to bow the robber into your own house." Even in mourning, he must don armor and inspect the troops. Sun Quan dried his tears, mounted his horse, reviewed the camps — and the Southland passed unshaken into its next era.',
    },
    ex: [
      { ko: '보안 패치를 미루는 것은 해커에게 개문읍도하는 셈이다.', ja: 'セキュリティパッチを先延ばしにするのは、ハッカーに開門揖盗するようなものだ。', en: 'Putting off security patches is opening the gate and bowing the hackers in.' },
      { ko: '내분에 빠진 사이 경쟁사에 시장을 내준 것은 개문읍도였다.', ja: '内輪もめの間に競合へ市場を明け渡したのは開門揖盗だった。', en: 'Squabbling internally while a rival took the market — we opened the door to the thief ourselves.' },
    ],
    rel: ['subulseokgwon', 'gwalmoksangdae', 'ohaamong'],
  },
  {
    slug: 'byeonggwisinsok', hanja: '兵貴神速', ko: '병귀신속', ja: '兵は神速を貴ぶ（へいはしんそくをたっとぶ）', pinyin: 'bīng guì shén sù', enLit: 'Speed Is the Essence of War',
    src: 'history', srcName: { ko: '정사 삼국지 곽가전', ja: '正史『三国志』郭嘉伝', en: 'Records of the Three Kingdoms — Guo Jia' },
    people: ['guojia', 'caocao'],
    meaning: {
      ko: '용병에서는 귀신같은 빠르기가 가장 귀하다는 뜻으로, 기회를 잡으려면 속도가 생명이라는 말이에요. 상대가 대비하기 전에 움직이는 전격전의 원리입니다.',
      ja: '用兵では神のごとき速さこそ最も貴いという意味で、好機を掴むには速度が命だという言葉です。相手が備える前に動く電撃戦の原理です。',
      en: 'In war, divine speed is the supreme virtue — strike before the enemy can prepare. Momentum and surprise decide everything.',
    },
    story: {
      ko: '관도에서 원소를 꺾은 조조는 북방으로 달아난 원소의 아들들을 쫓아 오환 원정을 계획했어요. 천 리가 넘는 원정길에 무거운 치중을 끌고 가면 기회를 놓친다고 본 곽가는 이렇게 진언합니다. "용병은 신속함을 귀하게 여깁니다(兵貴神速) — 치중을 버리고 경기병으로 밤낮없이 달려 허를 찌르십시오." 조조는 그 말대로 정예 기병만 이끌고 험로를 강행해, 방심하던 적을 백랑산에서 격파했습니다. 이 전격전으로 북방이 평정되었고, 병귀신속은 속도전의 금언이 되었어요.',
      ja: '官渡で袁紹を破った曹操は、北方に逃れた袁紹の息子たちを追って烏丸遠征を計画しました。千里を超える遠征路に重い輜重を引いていけば好機を逃すと見た郭嘉は、こう進言します。「兵は神速を貴びます — 輜重を捨て、軽騎兵で昼夜兼行し、虚を突いてください」。曹操はその言葉どおり精鋭騎兵だけを率いて険路を強行し、油断していた敵を白狼山で撃破しました。この電撃戦で北方は平定され、兵は神速を貴ぶは速攻の金言となりました。',
      en: 'After crushing Yuan Shao at Guandu, Cao Cao planned to chase Yuan’s sons deep into the northern steppes. Guo Jia saw that dragging a heavy baggage train a thousand li would forfeit the chance: "In war, speed is everything — drop the baggage, take light cavalry, ride day and night, and strike where they least expect." Cao Cao did exactly that, forcing the mountain paths with picked horsemen and smashing the unprepared enemy at White Wolf Mountain. The lightning campaign pacified the north, and Guo Jia’s words became the axiom of speed.',
    },
    ex: [
      { ko: '트렌드 상품은 병귀신속 — 검토만 하다간 시장이 끝난다.', ja: 'トレンド商品は兵は神速を貴ぶ — 検討ばかりしていては市場が終わる。', en: 'With trend products, speed is the essence — deliberate too long and the market is gone.' },
      { ko: '장애 대응은 병귀신속이 원칙이라 원인 분석보다 복구가 먼저다.', ja: '障害対応は兵は神速を貴ぶが原則で、原因分析より復旧が先だ。', en: 'In incident response, speed rules: restore first, analyze later.' },
    ],
    rel: ['pajukjise', 'gyereuk', 'mangmaejigal'],
  },
  {
    slug: 'siksosabeon', hanja: '食少事煩', ko: '식소사번', ja: '食少事煩（しょくしょうじはん）', pinyin: 'shí shǎo shì fán', enLit: 'Eating Little, Toiling Much',
    src: 'history', srcName: { ko: '진서 선제기', ja: '『晋書』宣帝紀', en: 'Book of Jin — Annals of Emperor Xuan (Sima Yi)' },
    people: ['simayi', 'zhugeliang'],
    meaning: {
      ko: '먹는 것은 적은데 일은 많다는 뜻으로, 몸을 돌보지 않고 과로하는 상태를 가리켜요. 건강을 해칠 만큼 일을 떠안은 사람을 걱정할 때 씁니다.',
      ja: '食べる量は少ないのに仕事は多いという意味で、体を顧みず働きすぎる状態を指します。健康を害するほど仕事を抱え込んだ人を案じるときに使います。',
      en: 'Eating little while laboring much — working oneself into the ground. Used of someone whose workload is visibly consuming their health.',
    },
    story: {
      ko: '오장원에서 제갈량과 사마의는 백 일 넘게 대치하고 있었어요. 제갈량이 아무리 도발해도 사마의는 성을 굳게 닫고 나오지 않았죠. 대신 사마의는 촉의 사자에게 지나가듯 승상의 근황을 물었습니다. 사자가 "새벽부터 밤까지 몸소 일을 살피시고, 벌 이십 대 이상의 형벌은 다 직접 결재하시는데 드시는 것은 몇 홉이 안 됩니다"라고 답하자, 사마의는 말했어요. "먹는 건 적고 일은 많으니(食少事煩) 어찌 오래 버티겠는가." 과연 제갈량은 그 진중에서 병으로 세상을 떠났고, 이 말은 과로를 경계하는 성어로 남았습니다.',
      ja: '五丈原で諸葛亮と司馬懿は百日以上対峙していました。諸葛亮がいくら挑発しても司馬懿は城門を固く閉ざして出てきません。代わりに司馬懿は蜀の使者に、それとなく丞相の近況を尋ねました。使者が「夜明けから夜まで自ら政務を執られ、罰二十以上の刑はすべて直々に決裁なさいますが、召し上がる量はわずかです」と答えると、司馬懿は言いました。「食少なく事煩わし — どうして長くもつだろうか」。果たして諸葛亮はその陣中で病に倒れて世を去り、この言葉は過労を戒める成語として残りました。',
      en: 'At Wuzhang Plains, Zhuge Liang and Sima Yi faced off for over a hundred days, Sima Yi refusing battle no matter the provocation. Instead, he casually asked a Shu envoy how the Chancellor was faring. "He works from dawn past dusk, personally reviews every punishment above twenty strokes — yet eats only a few measures of grain," the envoy replied. Sima Yi observed: "Eating little and toiling much — how can he last?" Zhuge Liang indeed died of illness in that very camp, and the remark endured as a warning against burnout.',
    },
    ex: [
      { ko: '점심도 거르고 야근하는 팀장을 보며 다들 식소사번을 걱정했다.', ja: '昼食も抜いて残業するチーム長を見て、みな食少事煩を心配した。', en: 'Watching the team lead skip lunch and stay late every night, everyone worried he was burning himself out.' },
      { ko: '식소사번으로 버티다 결국 병가를 냈다 — 일보다 몸이 먼저다.', ja: '食少事煩で持ちこたえた末、ついに病欠を出した — 仕事より体が先だ。', en: 'She ran on empty until she finally went on sick leave — no job is worth your health.' },
    ],
    rel: ['sagongmyeong', 'chulsapyo', 'gongseonggye'],
  },
  {
    slug: 'woldanpyeong', hanja: '月旦評', ko: '월단평', ja: '月旦評（げったんひょう）', pinyin: 'yuè dàn píng', enLit: 'The First-of-the-Month Review',
    src: 'history', srcName: { ko: '후한서 허소전', ja: '『後漢書』許劭伝', en: 'Book of the Later Han — Xu Shao' },
    people: ['xushao', 'caocao'],
    meaning: {
      ko: '매달 초하루마다 인물을 품평하던 데서 나온 말로, 인물이나 작품에 대한 논평 자체를 뜻해요. 오늘날 인물평·월평 같은 말의 어원입니다.',
      ja: '毎月一日に人物を品評したことから生まれた言葉で、人物や作品に対する論評そのものを意味します。今日の人物評・月旦といった言葉の語源です。',
      en: 'From a famed critique session held on the first of each month — it now means the act of appraising people or works. The origin of "monthly review" in East Asian usage.',
    },
    story: {
      ko: '후한 말 여남 땅의 허소는 사촌 허정과 함께 매달 초하루에 고을 인물들을 품평했는데, 그 안목이 얼마나 날카로웠던지 여기서 좋은 평을 받으면 하루아침에 이름이 났어요. 사람들은 이 모임을 "월단평"이라 불렀습니다. 아직 무명이던 젊은 조조도 허소를 찾아가 집요하게 평을 청했죠. 마지못해 허소가 내놓은 평이 그 유명한 "치세의 능신, 난세의 간웅"입니다. 조조는 그 말을 듣고 크게 웃으며 돌아갔다고 전해요. 인물 비평의 대명사가 된 월단평은 이 초하루 품평회에서 나왔습니다.',
      ja: '後漢末、汝南の許劭は従兄の許靖とともに毎月一日に郷里の人物を品評しており、その眼力の鋭さから、ここで良い評を得れば一夜にして名が知られました。人々はこの集まりを「月旦評」と呼びました。まだ無名だった若き曹操も許劭を訪ね、執拗に評を求めます。やむなく許劭が下した評こそ、有名な「治世の能臣、乱世の姦雄」です。曹操はそれを聞いて大笑いして帰ったと伝えられます。人物批評の代名詞となった月旦評は、この一日の品評会から生まれました。',
      en: 'In the twilight of the Han, Xu Shao of Runan held a critique of local figures with his cousin on the first day of every month; his eye was so sharp that a good word from him made a reputation overnight. People called it the "first-of-the-month review." The young, still-obscure Cao Cao pestered Xu Shao for a verdict. Reluctantly, Xu Shao delivered the immortal line: "An able minister in times of order, a cunning hero in times of chaos." Cao Cao roared with laughter and left satisfied. From that monthly session comes the classic term for appraising people.',
    },
    ex: [
      { ko: '그 평론가의 신간 월단평은 출판계가 가장 먼저 챙겨 본다.', ja: 'あの評論家の新刊月旦評は、出版界が真っ先にチェックする。', en: 'The critic’s monthly review of new releases is the first thing the publishing world reads.' },
      { ko: '연말이면 각 언론이 올해의 인물 월단평을 쏟아낸다.', ja: '年末になると各メディアが今年の人物月旦評を競って出す。', en: 'Every December, the media pour out their appraisals of the year’s most notable figures.' },
    ],
    rel: ['gyereuk', 'mangmaejigal', 'chilbojijae'],
  },
]
