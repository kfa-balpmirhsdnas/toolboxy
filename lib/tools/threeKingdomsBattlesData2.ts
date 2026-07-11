// 삼국지 전투 사전 데이터 2/2 (연대순 9–15).
import type { TKBattle } from './threeKingdomsBattles'

export const BATTLES_B: TKBattle[] = [
  {
    id: 'hanzhong', year: '217–219', sortYear: 217, hanja: '漢中之戰(定軍山)',
    name: { ko: '한중 공방전 (정군산)', ja: '漢中の戦い（定軍山）', en: 'Hanzhong Campaign (Mount Dingjun)' },
    sides: [
      { label: { ko: '유비군', ja: '劉備軍', en: 'Liu Bei' }, people: ['liu-bei', 'fa-zheng', 'huang-zhong', 'zhao-yun'] },
      { label: { ko: '조조군', ja: '曹操軍', en: 'Cao Cao' }, people: ['cao-cao', 'xiahou-yuan', 'zhang-he', 'xu-huang'] },
    ],
    factions: ['shu', 'wei'],
    idioms: ['gyereuk', 'eongwagisil'],
    background: {
      ko: '익주를 손에 넣은 유비에게 한중은 목에 걸린 칼이었어요 — 조조가 이곳을 쥐고 있는 한 촉은 언제든 침공당할 수 있었죠. 법정은 "하후연과 장합은 나라의 명장이 아니니 이길 수 있다"며 출병을 강권했고, 217년 유비는 처음으로 조조를 상대로 한 전면전을 결심합니다.',
      ja: '益州を手にした劉備にとって漢中は喉元に突きつけられた刃でした — 曹操がここを握っている限り、蜀はいつでも侵攻されうる立場だったのです。法正は「夏侯淵と張郃は国を代表する名将ではないから勝てる」と出兵を強く勧め、217年、劉備は初めて曹操を相手にした全面戦を決意します。',
      en: 'For the new master of Yi Province, Hanzhong was a knife at the throat — as long as Cao Cao held it, Shu lay open to invasion. Fa Zheng pressed the case: Xiahou Yuan and Zhang He were beatable. In 217, Liu Bei committed for the first time to a full war against Cao Cao himself.',
    },
    course: {
      ko: '2년 가까운 공방 끝에 유비는 219년 정군산으로 진영을 옮겨 높은 곳에서 위군을 내려다봤어요. 하후연이 방어선을 보수하러 병력을 나눈 순간, 법정이 "칠 때다"라고 신호하자 황충이 북소리와 함께 산을 내리꽂아 하후연을 단칼에 벴습니다. 뒤늦게 달려온 조조의 본군에 유비는 험지에 웅크린 채 정면 대결을 피했고, 조운이 한수에서 영채 문을 열어젖히는 담력으로 추격군을 물리쳤죠. 보급이 말라붙은 조조는 "계륵"이라는 암구호를 남긴 채 철군했습니다.',
      ja: '2年近い攻防の末、劉備は219年、定軍山へ陣を移して高所から魏軍を見下ろしました。夏侯淵が防御線を修復するため兵力を分けた瞬間、法正が「今だ」と合図すると、黄忠が太鼓の音とともに山を駆け下り、夏侯淵を一刀のもとに斬りました。遅れて駆けつけた曹操の本軍に対し、劉備は険地に構えて正面対決を避け、趙雲が漢水で陣営の門を開け放つ胆力で追撃軍を退けます。兵站の涸れた曹操は「鶏肋」という合言葉を残して撤退しました。',
      en: 'After nearly two years of grinding, Liu Bei shifted onto Mount Dingjun in 219, looking down on the Wei lines. The instant Xiahou Yuan split his force to repair a palisade, Fa Zheng gave the signal — and Huang Zhong came down the mountain with the drums, cutting Xiahou Yuan down. When Cao Cao arrived with the main army, Liu Bei sat tight on the high ground and refused battle, while Zhao Yun’s open-gates bravado at the Han River threw back the pursuit. His supply lines withering, Cao Cao withdrew — leaving behind the watchword "chicken ribs."',
    },
    outcome: {
      ko: '유비가 조조와의 정면 대결에서 거둔 처음이자 가장 큰 승리로, 그해 유비는 한중왕에 올랐어요. 촉은 북쪽 방벽을 확보해 이후 제갈량 북벌의 발진 기지가 됩니다. 다만 같은 해 형주가 무너지며 승리의 기쁨은 오래가지 못했죠.',
      ja: '劉備が曹操との正面対決で収めた最初にして最大の勝利であり、その年、劉備は漢中王に即位しました。蜀は北の防壁を確保し、以後、諸葛亮の北伐の発進基地となります。ただし同じ年に荊州が崩れ、勝利の喜びは長く続きませんでした。',
      en: 'Liu Bei’s first and greatest head-to-head victory over Cao Cao; that year he took the title King of Hanzhong. Shu gained its northern rampart, the launching pad of every later campaign. But the same year Jing Province fell, and the triumph was short-lived.',
    },
    diff: {
      ko: '연의는 황충과 엄안 콤비, 조운의 대활약을 크게 부풀렸지만 정군산 참수와 한수의 공영계는 정사·주석에 있는 사실이에요. 이 전역의 숨은 주역이 법정이라는 점은 정사가 더 분명히 보여줍니다 — 조조도 "현덕이 이런 수를 낼 리 없다, 필시 누가 가르쳐 줬을 것"이라 말했다고 전하죠.',
      ja: '演義は黄忠と厳顔のコンビ、趙雲の大活躍を大きく膨らませましたが、定軍山の斬殺と漢水の空営の計は正史・注釈にある事実です。この戦役の陰の主役が法正である点は正史がより明確に示しています — 曹操も「玄徳にこんな手が打てるはずがない、きっと誰かに教わったのだ」と語ったと伝わります。',
      en: 'The novel inflates the Huang Zhong–Yan Yan double act and Zhao Yun’s heroics, but the beheading at Dingjun and the empty-camp ruse at the Han River are in the record. The histories are clearer about the campaign’s hidden author, Fa Zheng — even Cao Cao reportedly said Liu Bei could never have devised it himself.',
    },
  },
  {
    id: 'fancheng', year: '219', sortYear: 219.5, hanja: '樊城之戰',
    name: { ko: '번성 전투와 형주 상실', ja: '樊城の戦いと荊州喪失', en: 'Fancheng & the Fall of Jing Province' },
    sides: [
      { label: { ko: '관우군', ja: '関羽軍', en: 'Guan Yu' }, people: ['guan-yu'] },
      { label: { ko: '위·오 연합', ja: '魏・呉連合', en: 'Wei & Wu' }, people: ['cao-ren', 'xu-huang', 'lv-meng', 'lu-xun', 'sun-quan'] },
    ],
    factions: ['shu', 'wei', 'wu'],
    idioms: ['dandobuhoe'],
    background: {
      ko: '유비가 한중왕에 오른 219년, 형주의 관우는 기세를 몰아 북쪽 번성의 조인을 쳤어요. 형주 반환 문제로 오와의 감정의 골이 깊어진 상태에서의 북진이었고, 후방 경계용 병력까지 전선으로 끌어올린 것이 화근이 됩니다. 여몽은 병을 핑계로 물러나고 무명의 육손을 후임으로 세워 관우를 안심시켰죠.',
      ja: '劉備が漢中王に即位した219年、荊州の関羽は勢いに乗って北の樊城の曹仁を攻めました。荊州返還問題で呉との感情の溝が深まった状態での北進であり、後方警戒用の兵力まで前線へ引き上げたことが禍根となります。呂蒙は病を口実に退き、無名の陸遜を後任に立てて関羽を安心させました。',
      en: 'In 219, as Liu Bei took his royal title, Guan Yu rode the momentum north against Cao Ren at Fancheng. He marched with the Wu alliance already soured over Jing Province — and stripped even his rear-guard garrisons for the front. Lü Meng feigned illness and installed the unknown Lu Xun in his place, and Guan Yu relaxed.',
    },
    course: {
      ko: '가을 홍수가 한수를 범람시키자 관우는 수군으로 우금의 칠군을 통째로 수장시키고 명장 방덕을 베었어요 — "그 위엄이 화하를 뒤흔들어" 조조가 천도를 논의할 정도였습니다. 그러나 번성의 조인은 무너지지 않았고, 서황의 구원군이 포위망을 정면으로 뚫었죠. 그 사이 여몽의 병사들이 상인으로 위장한 배로 강을 거슬러 올라(백의도강) 형주의 봉수대를 소리 없이 접수했습니다. 점령지의 가족들이 후대받고 있다는 소식에 관우의 군대는 싸우지 않고 흩어졌고, 관우는 맥성으로 몰렸다가 사로잡혀 처형되었어요.',
      ja: '秋の洪水が漢水を氾濫させると、関羽は水軍で于禁の七軍を丸ごと水没させ、名将・龐徳を斬りました — 「その威、華夏を震わす」と、曹操が遷都を議論するほどでした。しかし樊城の曹仁は崩れず、徐晃の救援軍が包囲網を正面から突き破ります。その間、呂蒙の兵士たちが商人に偽装した船で川を遡り（白衣渡江）、荊州の烽火台を音もなく接収しました。占領地の家族が厚遇されているという知らせに関羽の軍は戦わずして散り散りになり、関羽は麦城に追い詰められた末、捕らえられ処刑されました。',
      en: 'When autumn floods burst the Han River, Guan Yu’s navy drowned Yu Jin’s seven armies whole and executed the general Pang De — "his majesty shook the heartland," and Cao Cao debated moving the capital. But Cao Ren’s Fancheng held, and Xu Huang’s relief force smashed through the siege. Meanwhile Lü Meng’s soldiers rowed upriver disguised as merchants and took Jing Province’s signal towers without a sound. Word that their families were being treated kindly dissolved Guan Yu’s army without a battle; cornered at Maicheng, he was captured and put to death.',
    },
    outcome: {
      ko: '촉은 형주와 관우를 한꺼번에 잃었고, 천하삼분지계의 "두 갈래 북진" 구상은 영구히 불가능해졌어요. 손유 동맹은 파탄 났고, 이 원한이 2년 뒤 이릉대전으로 폭발합니다. 삼국지 전체의 운명이 꺾인 변곡점이죠.',
      ja: '蜀は荊州と関羽を一挙に失い、天下三分の計の「二方面北進」構想は永久に不可能になりました。孫劉同盟は破綻し、この恨みが2年後、夷陵の戦いとして爆発します。三国志全体の運命が折れた変曲点です。',
      en: 'Shu lost Jing Province and Guan Yu in one stroke, and the two-pronged northern offensive at the heart of the grand plan died forever. The Sun–Liu alliance was shattered, and the grievance detonated two years later at Yiling. The hinge on which the whole saga’s fate turned.',
    },
    diff: {
      ko: '관운장의 뼈를 긁는 화타의 수술(괄골요독)은 연대가 맞지 않는 연의의 창작이고, 조조를 화용도에서 놓아준 은혜 서사와 연결되는 최후 장면들도 각색이에요. 수몰칠군을 "관우가 둑을 터뜨린 계략"으로 그린 것도 연의이며, 정사는 자연 홍수를 이용한 것으로 기록합니다.',
      ja: '関羽の骨を削る華佗の手術（刮骨療毒）は年代の合わない演義の創作であり、曹操を華容道で見逃した恩義の物語と結びつく最期の場面も脚色です。水淹七軍を「関羽が堤を切った計略」として描いたのも演義で、正史は自然の洪水を利用したものと記録しています。',
      en: 'Hua Tuo scraping the poisoned bone is chronologically impossible fiction, as are the death scenes tied back to sparing Cao Cao at Huarong. Even the drowning of the seven armies is reframed by the novel as an engineered dam-break; the histories describe the exploitation of a natural flood.',
    },
  },
  {
    id: 'yiling', year: '221–222', sortYear: 221, hanja: '夷陵之戰',
    name: { ko: '이릉대전', ja: '夷陵の戦い', en: 'Battle of Yiling' },
    sides: [
      { label: { ko: '촉군', ja: '蜀軍', en: 'Shu' }, people: ['liu-bei', 'ma-liang'] },
      { label: { ko: '오군', ja: '呉軍', en: 'Wu' }, people: ['lu-xun', 'sun-quan'] },
    ],
    factions: ['shu', 'wu'],
    idioms: [],
    background: {
      ko: '황제에 오른 유비는 관우의 복수와 형주 수복을 내걸고 동정을 선포했어요. 조운이 "국적은 조씨이지 손권이 아니다"라고 간언하고 진진이 말렸지만 꺾지 못했습니다. 손권은 화친을 청하다 거절당하자 위에 신하를 칭해 배후를 안정시키고, 마흔도 안 된 육손에게 전군을 맡겼죠.',
      ja: '皇帝に即位した劉備は、関羽の復讐と荊州回復を掲げて東征を宣言しました。趙雲が「国賊は曹氏であって孫権ではない」と諫め、秦宓が引き留めましたが、翻意させられませんでした。孫権は和睦を請うて拒まれると、魏に臣を称して背後を安定させ、四十にもならない陸遜に全軍を委ねました。',
      en: 'Enthroned as emperor, Liu Bei declared war eastward — vengeance for Guan Yu and the recovery of Jing Province. Zhao Yun protested that the state’s enemy was the house of Cao, not Sun Quan; it changed nothing. Rebuffed in his peace overtures, Sun Quan declared vassalage to Wei to secure his rear, and handed his whole army to Lu Xun, not yet forty.',
    },
    course: {
      ko: '기록상 수만의 촉군은 장강 남안을 따라 진격해 초반 기세를 올렸지만, 육손은 험지를 내주며 이릉까지 수백 리를 물러나 반 년을 버텼어요. 무더위에 지친 유비가 수군을 뭍으로 올리고 숲속에 칠백 리 연영(連營)을 펼치자, 육손은 "이제 됐다"며 화공을 명했습니다. 병사마다 띠풀 한 다발 — 사십여 영채가 동시에 불타올랐고, 촉군은 조직적 저항도 못 한 채 무너졌죠. 유비는 밤을 새워 백제성으로 달아났고, 마량을 비롯한 수많은 인재가 돌아오지 못했습니다.',
      ja: '記録上数万の蜀軍は長江南岸に沿って進撃し、緒戦の勢いを上げましたが、陸遜は険地を譲りながら夷陵まで数百里を退いて半年間持ちこたえました。猛暑に疲れた劉備が水軍を陸に上げ、林の中に七百里の連営を敷くと、陸遜は「今こそ」と火攻めを命じます。兵士一人につき茅一束 — 四十余りの陣営が同時に燃え上がり、蜀軍は組織的な抵抗もできないまま崩れました。劉備は夜を徹して白帝城へ逃れ、馬良をはじめ多くの人材が帰りませんでした。',
      en: 'The Shu army, tens of thousands by the records, drove east along the Yangtze’s south bank with early success — but Lu Xun traded space for time, falling back hundreds of li to Yiling and holding for half a year. When the heat-worn Liu Bei beached his navy and strung his camps through seven hundred li of forest, Lu Xun judged the moment come. One bundle of thatch per soldier: forty camps went up at once, and the Shu army collapsed without organized resistance. Liu Bei fled through the night to Baidicheng; Ma Liang and many of Shu’s best never came home.',
    },
    outcome: {
      ko: '촉의 국력과 인재층이 한 세대분 꺾였고, 유비는 이듬해 백제성에서 세상을 떠납니다. 역설적으로 이 참패 뒤 제갈량이 오와의 동맹을 즉시 복원해, 삼국의 국경은 이후 40년 가까이 큰 틀에서 고정되죠. 관도·적벽과 나란히 "삼국지 3대 전투"로 꼽힙니다.',
      ja: '蜀の国力と人材層は一世代分挫かれ、劉備は翌年、白帝城で世を去ります。逆説的にこの惨敗の後、諸葛亮が呉との同盟を直ちに復元し、三国の国境は以後40年近く大枠で固定されます。官渡・赤壁と並んで「三国志三大戦役」に数えられます。',
      en: 'Shu lost a generation of strength and talent, and Liu Bei died at Baidicheng within the year. Paradoxically, the disaster let Zhuge Liang instantly restore the Wu alliance, and the three borders froze in place for nearly forty years. It stands with Guandu and Red Cliffs as one of the era’s three decisive battles.',
    },
    diff: {
      ko: '연의의 팔진도 — 제갈량이 미리 깔아 둔 돌무더기 진이 추격하는 육손을 가둔다는 결말은 창작이에요. 정사의 육손은 위의 개입 가능성을 읽고 스스로 추격을 멈춘 냉철한 판단가였습니다. "칠백 리 연영" 소식에 조비가 패배를 예언했다는 기록은 정사에 있어요.',
      ja: '演義の八陣図 — 諸葛亮があらかじめ敷いておいた石積みの陣が追撃する陸遜を閉じ込めるという結末は創作です。正史の陸遜は魏の介入の可能性を読み、自ら追撃を止めた冷徹な判断家でした。「七百里の連営」の知らせに曹丕が敗北を予言したという記録は正史にあります。',
      en: 'The novel’s ending — Zhuge Liang’s pre-built stone maze trapping the pursuing Lu Xun — is fiction. The historical Lu Xun halted the pursuit himself, reading the risk of Wei intervention. What is in the record: Cao Pi predicting Liu Bei’s defeat the moment he heard of camps strung over seven hundred li.',
    },
  },
  {
    id: 'nanzhong', year: '225', sortYear: 225, hanja: '南中平定',
    name: { ko: '남만 정벌 (남중 평정)', ja: '南蛮平定（南中平定）', en: 'The Southern Campaign' },
    sides: [
      { label: { ko: '촉군', ja: '蜀軍', en: 'Shu' }, people: ['zhuge-liang', 'ma-su'] },
      { label: { ko: '남중 세력', ja: '南中勢力', en: 'Nanzhong forces' }, people: [] },
    ],
    factions: ['shu', 'other'],
    idioms: ['chiljongchilgeum'],
    background: {
      ko: '이릉 참패와 유비의 죽음으로 촉이 휘청이자, 남중(운남·귀주 일대)의 호족과 이민족 지도자들이 오와 내통하며 일제히 반기를 들었어요. 북벌을 위해서는 등 뒤부터 안정시켜야 했기에, 제갈량은 국상이 끝나기를 기다려 225년 봄 몸소 남정에 나섭니다. 떠나는 길에 마속이 "성을 치는 것은 하책, 마음을 치는 것이 상책"이라는 방침을 건의했죠.',
      ja: '夷陵の惨敗と劉備の死で蜀が揺らぐと、南中（雲南・貴州一帯）の豪族と異民族の指導者たちが呉と内通して一斉に反旗を翻しました。北伐のためには背後から安定させる必要があったため、諸葛亮は国喪が明けるのを待って225年春、自ら南征に出ます。出立の際、馬謖が「城を攻めるは下策、心を攻めるが上策」という方針を献言しました。',
      en: 'With Shu reeling from Yiling and Liu Bei’s death, the magnates and tribal leaders of Nanzhong — the far southwest — rose together, in contact with Wu. The north could not be attempted with fire at his back, so in the spring of 225 Zhuge Liang marched south in person. At his departure, Ma Su offered the campaign’s guiding line: attacking cities is the lesser art; attack hearts.',
    },
    course: {
      ko: '제갈량은 군을 세 갈래로 나눠 반란 세력을 각개 격파하며 불모지라 불리던 남쪽 깊숙이 진군했어요. 한진춘추에 따르면 그는 이민족의 신망을 받던 지도자 맹획을 사로잡고도 처형하는 대신 진영을 구경시키고 놓아주기를 일곱 번 반복했습니다. 일곱 번째에 맹획이 "공은 하늘의 위엄이십니다. 남인은 다시 배반하지 않겠습니다"라며 진심으로 승복했죠. 제갈량은 그해 가을 안에 남중 전역을 평정하고, 현지 지도자들에게 통치를 맡긴 채 군을 물렸습니다.',
      ja: '諸葛亮は軍を三方に分けて反乱勢力を各個撃破しながら、不毛の地と呼ばれた南の奥深くへ進軍しました。漢晋春秋によれば、彼は異民族の信望を集めていた指導者・孟獲を捕らえても処刑する代わりに陣営を見せて放つことを七度繰り返しました。七度目に孟獲が「公は天の威におわします。南人は二度と背きません」と心から承服します。諸葛亮はその年の秋のうちに南中全域を平定し、現地の指導者に統治を任せたまま軍を引き上げました。',
      en: 'Splitting his army three ways, Zhuge Liang defeated the rebels in detail and drove deep into country the maps called barren. By the Han Jin Chunqiu’s account, he captured Meng Huo — the leader the tribes trusted most — and released him after a tour of the camps, seven times over. At the seventh, Meng Huo submitted from the heart: "You carry the majesty of Heaven; the south will not rebel again." By autumn the whole region was pacified, and Zhuge Liang marched home, leaving its own leaders to govern it.',
    },
    outcome: {
      ko: '주둔군 없이도 남중은 촉이 망할 때까지 대체로 안정을 지켰고, 그 물자와 병력(무당비군 등)은 북벌의 밑천이 되었어요. 무력 진압이 아니라 마음의 복속을 노린 통치 실험으로, 2년 뒤 출사표와 북벌의 전제 조건이 완성됩니다.',
      ja: '駐留軍なしでも南中は蜀が滅びるまで概ね安定を保ち、その物資と兵力（無当飛軍など）は北伐の元手となりました。武力鎮圧ではなく心の服属を狙った統治の実験であり、2年後の出師表と北伐の前提条件が完成します。',
      en: 'With no occupying garrison, Nanzhong stayed broadly loyal until Shu itself fell, and its wealth and recruits funded the northern campaigns. An experiment in ruling through won hearts rather than garrisoned force — and the precondition, two years later, for the Chu Shi Biao and the march north.',
    },
    diff: {
      ko: '칠종칠금 자체가 정사 본문이 아닌 한진춘추의 기록이라 사학계에선 사실성 논쟁이 있어요. 연의는 여기에 축융부인·목록대왕·등갑군 같은 판타지급 창작을 대거 더해 남만전을 모험담으로 바꿔 놓았습니다. 노수의 독천, 타사대왕의 독룡동 등도 모두 소설의 산물이죠.',
      ja: '七縦七擒自体が正史本文ではなく漢晋春秋の記録であるため、史学界では事実性の論争があります。演義はここに祝融夫人・木鹿大王・藤甲軍のようなファンタジー級の創作を大量に加え、南蛮戦を冒険譚に変えてしまいました。瀘水の毒泉、朶思大王の毒龍洞などもすべて小説の産物です。',
      en: 'Even the seven captures come from the Han Jin Chunqiu rather than the histories proper, and scholars debate their historicity. The novel then piles on outright fantasy — Lady Zhurong, King Mulu, the rattan-armor army, poisoned springs and dragon caves — turning the campaign into an adventure romance.',
    },
  },
  {
    id: 'jieting', year: '228', sortYear: 228, hanja: '街亭之戰',
    name: { ko: '가정 전투', ja: '街亭の戦い', en: 'Battle of Jieting' },
    sides: [
      { label: { ko: '촉군', ja: '蜀軍', en: 'Shu' }, people: ['ma-su', 'wang-ping', 'zhuge-liang'] },
      { label: { ko: '위군', ja: '魏軍', en: 'Wei' }, people: ['zhang-he'] },
    ],
    factions: ['shu', 'wei'],
    idioms: ['eupchammasok', 'eongwagisil'],
    background: {
      ko: '228년 제갈량의 1차 북벌은 완벽한 기습이었어요 — 천수 등 3군이 잇달아 촉에 호응하며 관중이 흔들렸죠. 위의 반격군이 도착하기 전 요충 가정을 지켜 시간을 버는 것이 승부처였고, 제갈량은 위연·오의 같은 숙장들을 제치고 아끼던 참모 마속을 선봉으로 발탁했습니다. 유비가 임종 때 "마속은 크게 쓰지 말라"고 남긴 경고를 뒤로한 인선이었어요.',
      ja: '228年、諸葛亮の第一次北伐は完璧な奇襲でした — 天水など三郡が相次いで蜀に呼応し、関中が揺らぎます。魏の反撃軍が到着する前に要衝・街亭を守って時間を稼ぐことが勝負どころであり、諸葛亮は魏延・呉懿のような宿将を差し置いて、目をかけていた参謀・馬謖を先鋒に抜擢しました。劉備が臨終の際「馬謖を重用するな」と残した警告を背にした人選でした。',
      en: 'Zhuge Liang’s first campaign in 228 achieved total surprise — three commanderies defected to Shu and the whole northwest trembled. Everything turned on holding the crossroads at Jieting until Wei’s counterstroke could be blunted, and for that vanguard Zhuge Liang passed over veterans like Wei Yan to promote his cherished aide Ma Su — against the dying Liu Bei’s explicit warning.',
    },
    course: {
      ko: '마속은 물길을 낀 길목에 방어선을 펴라는 지시를 어기고 산 위에 진을 쳤어요 — "높은 곳에서 내려다보면 그 기세가 대나무를 쪼갠다"는 병법서의 논리였죠. 부장 왕평이 거듭 말렸지만 듣지 않았습니다. 위의 명장 장합은 산을 포위하고 물 긷는 길부터 끊었고, 갈증에 무너진 촉군은 대패해 흩어졌어요. 왕평만이 천여 병력으로 북을 울리며 의연히 버텨 복병을 의심한 장합의 추격을 막고 흩어진 병사를 수습해 돌아왔습니다. 발판을 잃은 제갈량은 서현의 백성을 이끌고 한중으로 총퇴각했죠.',
      ja: '馬謖は水路を押さえた道筋に防衛線を敷けという指示に背き、山上に布陣しました — 「高所から見下ろせばその勢いは竹を割る」という兵法書の論理でした。副将の王平が繰り返し諫めましたが聞き入れません。魏の名将・張郃は山を包囲して水汲みの道から断ち、渇きに崩れた蜀軍は大敗して散り散りになりました。王平だけが千余りの兵力で太鼓を鳴らして毅然と持ちこたえ、伏兵を疑った張郃の追撃を防いで散った兵を収拾して帰還します。足場を失った諸葛亮は西県の民を connecting率いて漢中へ総退却しました。',
      en: 'Ma Su defied his orders to hold the road by the water and camped on the hilltop instead — by the book, height would give his charge "the force of splitting bamboo." His deputy Wang Ping argued repeatedly, in vain. Zhang He simply surrounded the hill and cut the water paths; the thirst-broken Shu force was routed. Only Wang Ping, beating his drums with a thousand men in a show of composure, made Zhang He fear an ambush, covered the fugitives, and brought his unit home. His foothold gone, Zhuge Liang withdrew everything to Hanzhong.',
    },
    outcome: {
      ko: '가장 성공에 가까웠던 1차 북벌이 물거품이 되었고, 호응했던 3군도 도로 위에 넘어갔어요. 제갈량은 군법대로 마속을 처형하며 눈물을 흘렸고(읍참마속), 자신도 세 등급 강등을 자청했습니다. 왕평은 이 전투로 발탁되어 훗날 한중 방어의 기둥이 되죠.',
      ja: '最も成功に近かった第一次北伐が水泡に帰し、呼応した三郡も魏へ戻りました。諸葛亮は軍法どおり馬謖を処刑して涙を流し（泣いて馬謖を斬る）、自らも三階級の降格を自請しました。王平はこの戦いで抜擢され、後に漢中防衛の柱となります。',
      en: 'The campaign that came closest to success evaporated, and the three defected commanderies returned to Wei. Zhuge Liang executed Ma Su under military law, weeping as he did, and demoted himself three ranks. Wang Ping’s conduct won him the promotion that made him the future anchor of Hanzhong’s defense.',
    },
    diff: {
      ko: '연의는 이 패전 직후에 공성계를 붙여 제갈량의 체면을 살렸지만, 그 일화는 배송지가 신빙성을 부정한 야사예요. 마속의 최후도 기록마다 갈립니다 — 처형·옥사·도주 후 사망설이 병존하고, 연의는 처형 장면을 극대화했죠.',
      ja: '演義はこの敗戦の直後に空城の計を付け加えて諸葛亮の面目を保ちましたが、その逸話は裴松之が信憑性を否定した野史です。馬謖の最期も記録によって分かれます — 処刑・獄死・逃亡後死亡説が併存し、演義は処刑場面を最大化しました。',
      en: 'The novel salvages Zhuge Liang’s dignity by appending the empty-fort ruse — an anecdote the annotator Pei Songzhi himself rejected. Even Ma Su’s end is disputed in the records — execution, death in prison, or death after flight — and the novel, of course, chose the most theatrical version.',
    },
  },
  {
    id: 'wuzhang-plains', year: '234', sortYear: 234, hanja: '五丈原之戰',
    name: { ko: '오장원 대치', ja: '五丈原の戦い', en: 'Wuzhang Plains' },
    sides: [
      { label: { ko: '촉군', ja: '蜀軍', en: 'Shu' }, people: ['zhuge-liang', 'jiang-wei', 'wei-yan'] },
      { label: { ko: '위군', ja: '魏軍', en: 'Wei' }, people: ['sima-yi'] },
    ],
    factions: ['shu', 'wei'],
    idioms: ['sagongmyeong', 'siksosabeon', 'chulsapyo'],
    background: {
      ko: '234년 제갈량은 기록상 10만의 전군을 몰아 5차(정사 기준 마지막) 북벌에 나섰어요. 역대 북벌의 발목을 잡아 온 군량 문제에 대비해 3년을 비축했고, 목우유마로 보급을 잇고 오장원에 둔전까지 열어 장기전을 준비했습니다. 오와의 동시 출병 약속도 받아냈지만, 손권의 공세는 합비에서 일찍 꺾였죠.',
      ja: '234年、諸葛亮は記録上十万の全軍を挙げて第五次（正史基準で最後の）北伐に出ました。歴代北伐の足かせとなってきた兵糧問題に備えて3年間備蓄し、木牛流馬で補給を繋ぎ、五丈原に屯田まで開いて長期戦を準備します。呉との同時出兵の約束も取り付けましたが、孫権の攻勢は合肥で早々に挫かれました。',
      en: 'In 234 Zhuge Liang committed his whole army — a hundred thousand by the records — to his fifth and final campaign. Against the grain shortages that had doomed every previous march, he had stockpiled for three years, ran supplies on his "wooden oxen," and even opened farms at Wuzhang Plains for a long war. Wu had promised a simultaneous offensive; Sun Quan’s thrust broke early at Hefei.',
    },
    course: {
      ko: '사마의는 위수 남쪽에 보루를 쌓고 어떤 도발에도 응하지 않는 지구전으로 일관했어요. 제갈량이 여인의 옷과 머리 장식을 보내 조롱해도, 사마의는 성난 장수들을 "황제의 불허" 형식으로 눌러 가며 백여 일을 버텼습니다. 대신 촉 사자에게 승상의 식사량과 업무를 물었고, "먹는 것은 적고 일은 많다"는 답에 그 명이 다했음을 읽었죠(식소사번). 그해 8월 제갈량이 쉰넷으로 진중에서 병사하자, 촉군은 강유의 지휘 아래 깃발을 돌려 반격 태세를 취해 추격군을 물리고 정연하게 물러났습니다 — "죽은 공명이 산 중달을 달아나게 했다"는 말이 여기서 났어요.',
      ja: '司馬懿は渭水の南に塁を築き、いかなる挑発にも応じない持久戦に徹しました。諸葛亮が女性の衣服と髪飾りを送って嘲っても、司馬懿は怒る将たちを「皇帝の不許可」という形式で抑えながら百余日持ちこたえます。代わりに蜀の使者へ丞相の食事量と執務を尋ね、「食は少なく事は多い」という答えにその命が尽きかけていることを読み取りました（食少事煩）。その年の8月、諸葛亮が五十四歳で陣中に病没すると、蜀軍は姜維の指揮のもと旗を返して反撃の構えを取り、追撃軍を退けて整然と撤退しました — 「死せる孔明、生ける仲達を走らす」の言葉はここから生まれました。',
      en: 'Sima Yi walled himself in south of the Wei River and refused battle against every provocation. Zhuge Liang sent him women’s clothes and hairpins in mockery; Sima Yi muzzled his furious officers behind the formality of an imperial prohibition and held out a hundred days. His only question, to a Shu envoy, was how much the Chancellor ate and how hard he worked — and the answer told him the man was dying. In the eighth month Zhuge Liang died in camp at fifty-four. Under Jiang Wei the army wheeled its banners as if to attack, drove off the pursuit, and withdrew in perfect order — whence "dead Kongming routed living Zhongda."',
    },
    outcome: {
      ko: '제갈량 시대의 북벌이 막을 내리고, 촉위 국경은 이후 강유의 시대까지 소강기에 들어갔어요. 위연은 철군 서열 다툼 끝에 목숨을 잃었고, 촉의 군권은 장완·비의를 거쳐 강유에게 넘어갑니다. 철수한 촉군의 진영 터를 둘러본 사마의는 "천하의 기재로다"라는 찬사를 남겼죠.',
      ja: '諸葛亮時代の北伐が幕を下ろし、蜀魏の国境は以後、姜維の時代まで小康期に入りました。魏延は撤退の序列争いの末に命を落とし、蜀の軍権は蔣琬・費禕を経て姜維に渡ります。撤収した蜀軍の陣営跡を見回った司馬懿は「天下の奇才なり」という賛辞を残しました。',
      en: 'The age of Zhuge Liang’s campaigns closed, and the Shu–Wei frontier fell quiet until Jiang Wei’s day. Wei Yan died in the withdrawal’s power struggle; command passed in time to Jiang Wei. Touring the abandoned Shu camps, Sima Yi paid his enemy the final tribute: "a prodigy of the age."',
    },
    diff: {
      ko: '수명 연장을 비는 칠성등 의식, 죽은 제갈량의 목상으로 사마의를 쫓는 장면, 위연이 등불을 꺼뜨리는 전개는 모두 연의의 창작이에요. "사공명 주생중달" 자체는 한진춘추가 전하는 당대의 말로, 각색이 아닙니다. 위연의 최후도 정사는 반역이 아닌 내분으로 시사하죠.',
      ja: '寿命延長を祈る七星灯の儀式、死んだ諸葛亮の木像で司馬懿を追い払う場面、魏延が灯を消してしまう展開はすべて演義の創作です。「死せる孔明、生ける仲達を走らす」自体は漢晋春秋が伝える当時の言葉で、脚色ではありません。魏延の最期も、正史は謀反ではなく内紛として示唆しています。',
      en: 'The seven-star lamp ritual to extend his life, the wooden statue that routs Sima Yi, Wei Yan bursting in to snuff the flame — all the novel. The saying about dead Kongming, however, is genuine, recorded by the Han Jin Chunqiu; and Wei Yan’s death, in the histories, reads as factional strife rather than treason.',
    },
  },
  {
    id: 'conquest-of-wu', year: '279–280', sortYear: 279, hanja: '晉滅吳之戰',
    name: { ko: '진의 오 정벌 (천하통일)', ja: '晋の呉征伐（天下統一）', en: 'The Conquest of Wu' },
    sides: [
      { label: { ko: '진군', ja: '晋軍', en: 'Jin' }, people: [] },
      { label: { ko: '오군', ja: '呉軍', en: 'Wu' }, people: [] },
    ],
    factions: ['other', 'wu'],
    idioms: ['pajukjise'],
    background: {
      ko: '263년 촉이 무너지고 265년 사마염이 위를 대신해 진을 세우면서, 천하에는 진과 오만 남았어요. 오의 마지막 황제 손호는 가혹한 통치로 민심을 잃어 갔고, 진은 익주에서 왕준이 대형 함선을 건조하며 20년 가까이 정벌을 준비했습니다. 279년 겨울, 진은 여섯 갈래 20만 대군의 총공세를 개시하죠.',
      ja: '263年に蜀が倒れ、265年に司馬炎が魏に代わって晋を建てると、天下には晋と呉だけが残りました。呉の最後の皇帝・孫皓は苛酷な統治で民心を失っていき、晋は益州で王濬が大型艦船を建造しながら20年近く征伐を準備します。279年冬、晋は六方面・二十万の大軍による総攻勢を開始しました。',
      en: 'With Shu gone in 263 and Sima Yan replacing Wei with his new Jin dynasty in 265, only Jin and Wu remained. Wu’s last emperor, the cruel Sun Hao, bled away his people’s loyalty while Jin spent nearly twenty years preparing — Wang Jun building a great river fleet in the old land of Shu. In the winter of 279, Jin launched two hundred thousand men along six axes.',
    },
    course: {
      ko: '왕준의 수군은 장강을 타고 내려가며 오가 자랑하던 쇠사슬 방어선을 거대한 뗏목과 횃불로 태워 끊었어요. 육로의 두예는 강릉을 함락시키며 남부를 휩쓸었고, 진군을 계속할지 묻는 군의에서 그 유명한 말을 남깁니다 — "지금 우리 군의 기세는 대나무를 쪼개는 것과 같다(파죽지세)." 각 방면군이 연쇄적으로 오의 방어선을 허물었고, 280년 3월 왕준의 함대가 건업 석두성에 이르자 손호는 스스로 결박하고 관을 끌고 나와 항복했습니다.',
      ja: '王濬の水軍は長江を下りながら、呉が誇った鉄鎖の防衛線を巨大な筏と松明で焼き切りました。陸路の杜預は江陵を陥落させて南部を席巻し、進軍を続けるかを問う軍議であの有名な言葉を残します — 「今、我が軍の勢いは竹を割るがごとし（破竹の勢い）」。各方面軍が連鎖的に呉の防衛線を崩し、280年3月、王濬の艦隊が建業の石頭城に達すると、孫皓は自らを縛り棺を引いて出て降伏しました。',
      en: 'Wang Jun’s fleet swept down the Yangtze, burning through Wu’s famous chain barriers with giant rafts and torches. On land, Du Yu took Jiangling and rolled up the south — answering the council that asked whether to press on with the immortal line: "our momentum is that of splitting bamboo." Front after front collapsed in sequence, and in the third month of 280, as the fleet reached the Stone Fortress of Jianye, Sun Hao came out bound, dragging a coffin, to surrender.',
    },
    outcome: {
      ko: '오의 항복으로 184년 황건적의 난 이래 96년의 대분열이 끝났어요. 위도 촉도 오도 아닌 진의 통일이라는 결말은, 삼국지라는 이야기에 "천하대세 분구필합(나뉜 지 오래면 반드시 합쳐진다)"의 마침표를 찍었습니다. 다만 통일 진도 한 세대 만에 다시 흔들리죠.',
      ja: '呉の降伏により、184年の黄巾の乱以来96年の大分裂が終わりました。魏でも蜀でも呉でもない晋の統一という結末は、三国志という物語に「天下の大勢、分かれて久しければ必ず合す」の句点を打ちました。ただし統一晋も一世代で再び揺らぎます。',
      en: 'Wu’s surrender ended ninety-six years of division that had begun with the Yellow Turbans in 184. That the unifier was neither Wei nor Shu nor Wu but Jin gave the saga its famous coda: "long divided, the realm must unite." Though united Jin, too, would shake apart within a generation.',
    },
    diff: {
      ko: '연의는 이 최종장을 마지막 회에 빠르게 요약해요. 두예·왕준 같은 주역들은 소설 독자에게 낯설지만, 정사에서는 20년 준비와 여섯 방면 동시 공세라는 대전략의 완성자들입니다. 파죽지세라는 성어가 이 전역의 가장 선명한 유산이죠.',
      ja: '演義はこの最終章を最終回で駆け足にまとめます。杜預・王濬のような主役は小説の読者には馴染みが薄いものの、正史では20年の準備と六方面同時攻勢という大戦略の完成者たちです。破竹の勢いという成語がこの戦役の最も鮮明な遺産です。',
      en: 'The novel hurries through this finale in its last chapter, leaving Du Yu and Wang Jun strangers to most readers — though in the histories they are the executors of a twenty-year, six-front grand design. The idiom "splitting bamboo" is the campaign’s brightest legacy.',
    },
  },
]
