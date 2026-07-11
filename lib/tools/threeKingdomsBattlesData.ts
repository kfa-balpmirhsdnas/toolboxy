// 삼국지 전투 사전 데이터 1/2 (연대순 1–8). 병력 수는 전부 "기록상" 표기 (t3 ⑧ 규칙).
import type { TKBattle } from './threeKingdomsBattles'

export const BATTLES_A: TKBattle[] = [
  {
    id: 'yellow-turban', year: '184', sortYear: 184, hanja: '黃巾之亂',
    name: { ko: '황건적의 난', ja: '黄巾の乱', en: 'Yellow Turban Rebellion' },
    sides: [
      { label: { ko: '한 조정·의병', ja: '漢朝廷・義勇軍', en: 'Han court & volunteers' }, people: ['he-jin', 'liu-bei', 'cao-cao', 'sun-jian', 'guan-yu', 'zhang-fei'] },
      { label: { ko: '황건군', ja: '黄巾軍', en: 'Yellow Turbans' }, people: ['zhang-jiao'] },
    ],
    factions: ['han', 'other'],
    idioms: [],
    background: {
      ko: '거듭된 흉년과 가혹한 세금, 환관들의 부패로 후한의 민심은 바닥나 있었어요. 태평도의 교주 장각은 병 고침과 구원의 약속으로 수십만 신도를 모았고, "창천이사 황천당립"의 구호 아래 갑자년 거사를 준비합니다. 밀고로 계획이 새자 장각은 예정을 앞당겨 전국 동시 봉기를 명령했죠.',
      ja: '度重なる凶作と苛酷な税、宦官の腐敗で後漢の民心は底をついていました。太平道の教主・張角は病の治癒と救済の約束で数十万の信徒を集め、「蒼天已死、黄天当立」のスローガンのもと甲子の年の決起を準備します。密告で計画が漏れると、張角は予定を早めて全国同時蜂起を命じました。',
      en: 'Famine upon famine, crushing taxes and eunuch corruption had drained the Han of its people’s loyalty. Zhang Jiao’s Taiping sect gathered hundreds of thousands with promises of healing and salvation, preparing a rising for the jiazi year under the slogan "the Azure Heaven is dead." When an informer betrayed the plan, Zhang Jiao ordered the empire-wide revolt ahead of schedule.',
    },
    course: {
      ko: '184년 봄, 머리에 누런 두건을 두른 수십만 봉기군이 여덟 주에서 동시에 일어나 관청을 불태웠어요. 조정은 황보숭·주준 등에게 토벌을 맡기는 한편 지방의 자체 무장을 허용했고, 이 조치가 유비·조조·손견 같은 군웅들에게 첫 무대를 열어 주었습니다. 유비는 의용군을 이끌고 첫 공을 세웠고, 조조는 기병을 몰아 영천의 황건군을 쳤으며, 손견은 완성 공략에서 성벽을 먼저 올랐죠. 장각이 그해 병사하자 봉기의 동력은 급격히 꺾였고, 주력은 연말까지 대부분 진압되었습니다.',
      ja: '184年春、頭に黄色い頭巾を巻いた数十万の蜂起軍が八つの州で同時に立ち上がり、役所を焼き払いました。朝廷は皇甫嵩・朱儁らに討伐を任せる一方、地方の自主武装を許可し、この措置が劉備・曹操・孫堅のような群雄に最初の舞台を開きます。劉備は義勇軍を率いて初の功を立て、曹操は騎兵を駆って潁川の黄巾軍を撃ち、孫堅は宛城攻略で真っ先に城壁を登りました。張角がその年に病死すると蜂起の勢いは急速に衰え、主力は年末までにほぼ鎮圧されました。',
      en: 'In the spring of 184, hundreds of thousands in yellow headscarves rose in eight provinces at once, burning government offices. The court sent generals like Huangfu Song against them — and, crucially, authorized local self-armament, opening the stage for Liu Bei, Cao Cao and Sun Jian. Liu Bei won his first merits with a volunteer band; Cao Cao smashed the Turbans at Yingchuan with cavalry; Sun Jian was first over the wall at Wancheng. When Zhang Jiao died of illness that same year, the revolt lost its engine, and the main forces were crushed by winter.',
    },
    outcome: {
      ko: '봉기 자체는 1년 안에 꺾였지만 후한의 권위는 회복 불가능하게 무너졌어요. 지방관과 호족이 합법적으로 사병을 갖게 되면서, 난이 끝난 자리에는 군웅할거의 판이 깔렸습니다. 삼국지의 모든 이야기가 여기서 시작되죠.',
      ja: '蜂起自体は1年以内に挫かれましたが、後漢の権威は回復不能なまでに崩れました。地方官と豪族が合法的に私兵を持つようになり、乱の終わった跡には群雄割拠の盤面が敷かれます。三国志のすべての物語がここから始まります。',
      en: 'The rising itself was broken within a year, but the Han’s authority never recovered. Governors and magnates now held private armies with legal sanction; the board for the age of warlords was laid on the rebellion’s ashes. Every story of the Three Kingdoms begins here.',
    },
    diff: {
      ko: '연의는 이 난을 유관장 삼형제의 등장 무대로 압축하고 장각을 요술사로 그려요. 정사의 주역은 황보숭 등 관군 지휘관들이며, 봉기의 배경에는 종교 열풍보다 민생 붕괴가 있었습니다.',
      ja: '演義はこの乱を劉関張三兄弟の登場舞台として圧縮し、張角を妖術師として描きます。正史の主役は皇甫嵩ら官軍の指揮官であり、蜂起の背景には宗教ブームより民生の崩壊がありました。',
      en: 'The novel compresses the rebellion into a debut stage for the three sworn brothers and paints Zhang Jiao as a sorcerer. In the histories the protagonists are the imperial commanders, and the deeper cause was livelihood collapse, not magic.',
    },
  },
  {
    id: 'hulao-gate', year: '190–191', sortYear: 190, hanja: '汜水關·虎牢關之戰',
    name: { ko: '사수관·호로관 전투', ja: '汜水関・虎牢関の戦い', en: 'Sishui & Hulao Gate' },
    sides: [
      { label: { ko: '반동탁 연합군', ja: '反董卓連合軍', en: 'The Coalition' }, people: ['yuan-shao', 'cao-cao', 'sun-jian', 'yuan-shu', 'liu-bei', 'guan-yu', 'zhang-fei'] },
      { label: { ko: '동탁군', ja: '董卓軍', en: 'Dong Zhuo' }, people: ['dong-zhuo', 'lv-bu'] },
    ],
    factions: ['other', 'han'],
    idioms: [],
    background: {
      ko: '동탁이 헌제를 세우고 폭정을 일삼자, 190년 관동의 제후들이 원소를 맹주로 토벌 연합을 결성했어요. 명분은 거창했지만 제후들은 저마다 세력 보존을 셈하며 낙양으로 향하는 관문 앞에서 머뭇거렸습니다. 그 사이 실제로 칼을 든 것은 손견과 조조 정도였죠.',
      ja: '董卓が献帝を立てて暴政をほしいままにすると、190年、関東の諸侯が袁紹を盟主として討伐連合を結成しました。大義名分は壮大でしたが、諸侯はそれぞれ勢力温存を計算し、洛陽へ向かう関門の前でためらいます。その間、実際に剣を取ったのは孫堅と曹操くらいでした。',
      en: 'When Dong Zhuo enthroned Emperor Xian and ruled by terror, the eastern lords formed a punitive coalition under Yuan Shao in 190. The cause was grand; the lords, each hoarding his own strength, dithered before the passes to Luoyang. The only ones who actually drew swords were Sun Jian and Cao Cao.',
    },
    course: {
      ko: '손견은 양인에서 동탁군을 정면으로 격파하고 도독 화웅의 목을 베며 연합군의 유일한 확실한 승리를 만들어냈어요. 조조는 단독으로 추격전을 벌이다 형양에서 대패해 목숨만 건졌습니다. 압박을 느낀 동탁은 낙양에 불을 지르고 헌제를 끌고 장안으로 천도했고, 손견이 폐허가 된 낙양에 가장 먼저 입성했죠. 그러나 연합은 곧 내분으로 흩어졌습니다.',
      ja: '孫堅は陽人で董卓軍を正面から撃破し、都督・華雄の首を斬って連合軍唯一の確実な勝利を作り出しました。曹操は単独で追撃戦を挑み、滎陽で大敗して命からがら逃れます。圧迫を感じた董卓は洛陽に火を放ち、献帝を連れて長安へ遷都し、孫堅が廃墟となった洛陽に最初に入城しました。しかし連合はまもなく内紛で散り散りになります。',
      en: 'Sun Jian broke Dong Zhuo’s army head-on at Yangren, taking the head of the commandant Hua Xiong — the coalition’s only clear victory. Cao Cao, pursuing alone, was routed at Xingyang and barely escaped. Under pressure, Dong Zhuo torched Luoyang and dragged the Emperor west to Chang’an; Sun Jian was first into the ruined capital. The coalition then dissolved in its own quarrels.',
    },
    outcome: {
      ko: '동탁 타도는 실패했지만 그 권위에 처음으로 균열을 냈고, 연합 해체와 함께 제후들의 각자도생 — 본격적인 군웅할거가 시작되었어요. 손견의 무명(武名)과 조조의 결기가 천하에 알려진 전역이기도 합니다.',
      ja: '董卓打倒は失敗しましたが、その権威に初めて亀裂を入れ、連合解体とともに諸侯の各自図生 — 本格的な群雄割拠が始まりました。孫堅の武名と曹操の気概が天下に知られた戦役でもあります。',
      en: 'The coalition failed to topple Dong Zhuo, but it cracked his aura of invincibility — and its collapse launched the true age of every-lord-for-himself. It also announced Sun Jian’s prowess and Cao Cao’s resolve to the realm.',
    },
    diff: {
      ko: '"관우의 화웅 참수(온주참화웅)"와 "유관장 삼형제 대 여포(삼영전여포)"는 모두 연의의 창작이에요. 정사에서 화웅을 벤 것은 손견이고, 유비 삼형제가 호로관에서 여포와 싸운 기록은 없습니다. 사수관과 호로관이 사실상 같은 관문이라는 지리 문제까지, 연의 각색이 가장 많이 들어간 전투죠.',
      ja: '「関羽の華雄斬り（温酒斬華雄）」と「劉関張対呂布（三英戦呂布）」はいずれも演義の創作です。正史で華雄を斬ったのは孫堅であり、劉備三兄弟が虎牢関で呂布と戦った記録はありません。汜水関と虎牢関が実質同じ関門だという地理の問題まで、演義の脚色が最も多く入った戦いです。',
      en: 'Both "Guan Yu beheads Hua Xiong while the wine is warm" and the three brothers’ duel with Lü Bu are the novel’s inventions: history gives Hua Xiong to Sun Jian, and no record puts Liu Bei’s band at Hulao. Even the two "gates" were in reality one pass — no battle carries more novelistic paint than this one.',
    },
  },
  {
    id: 'xiapi', year: '198–199', sortYear: 198, hanja: '下邳之戰',
    name: { ko: '하비 전투', ja: '下邳の戦い', en: 'Siege of Xiapi' },
    sides: [
      { label: { ko: '조조·유비 연합', ja: '曹操・劉備連合', en: 'Cao Cao & Liu Bei' }, people: ['cao-cao', 'liu-bei'] },
      { label: { ko: '여포군', ja: '呂布軍', en: 'Lü Bu' }, people: ['lv-bu', 'chen-gong', 'zhang-liao'] },
    ],
    factions: ['wei', 'shu', 'other'],
    idioms: [],
    background: {
      ko: '서주를 차지한 여포는 유비를 몰아내고 원술과도 손잡았다 틀어지기를 반복하며 조조의 동쪽을 위협하고 있었어요. 여포에게 근거지를 빼앗긴 유비가 조조에게 몸을 의탁하면서, 두 사람은 공동의 적을 향해 손을 잡습니다. 198년 조조는 대군을 이끌고 서주로 진격했죠.',
      ja: '徐州を手にした呂布は劉備を追い出し、袁術とも結んでは決裂を繰り返しながら曹操の東方を脅かしていました。呂布に根拠地を奪われた劉備が曹操に身を寄せたことで、二人は共通の敵に向けて手を組みます。198年、曹操は大軍を率いて徐州へ進撃しました。',
      en: 'Master of Xuzhou, Lü Bu had driven out Liu Bei and cycled through alliance and rupture with Yuan Shu, menacing Cao Cao’s eastern flank. When the dispossessed Liu Bei took refuge with Cao Cao, the two joined hands against their common enemy, and in 198 Cao Cao marched on Xuzhou in force.',
    },
    course: {
      ko: '연전연패한 여포는 하비성에 틀어박혔고, 조조는 진궁이 성 밖 협공을 진언할 틈도 없이 사수와 기수의 물을 끌어 성을 잠기게 했어요. 석 달의 수공에 성안의 사기가 무너지자, 여포의 부하 장수들이 진궁을 묶어 성문을 열고 투항했습니다. 사로잡힌 여포는 "나를 쓰면 천하를 얻는다"며 목숨을 구걸했지만, 유비의 "정원과 동탁의 일을 잊으셨습니까"라는 한마디에 조조는 처형을 명했죠. 진궁은 스스로 형장으로 걸어 나갔고, 장료는 이때 조조에게 발탁됩니다.',
      ja: '連戦連敗した呂布は下邳城に籠もり、曹操は陳宮が城外からの挟撃を進言する間もなく、泗水と沂水の水を引いて城を水没させました。三か月の水攻めで城内の士気が崩れると、呂布の部下の将たちが陳宮を縛って城門を開き投降します。捕らえられた呂布は「私を用いれば天下が取れる」と命乞いをしましたが、劉備の「丁原と董卓の件をお忘れですか」の一言で曹操は処刑を命じました。陳宮は自ら刑場へ歩み出し、張遼はこのとき曹操に登用されます。',
      en: 'Beaten in the field, Lü Bu holed up in Xiapi; before Chen Gong’s plan for an outside-inside pincer could be tried, Cao Cao diverted two rivers and drowned the city’s approaches. Three months of flood broke the garrison’s spirit, and Lü Bu’s own officers bound Chen Gong and opened the gates. The captured Lü Bu bargained — "with me you could take the realm" — until Liu Bei’s quiet reminder of Ding Yuan and Dong Zhuo sealed the execution. Chen Gong walked to the block himself; Zhang Liao entered Cao Cao’s service.',
    },
    outcome: {
      ko: '당대 최강의 무인 여포가 무대에서 퇴장하고, 조조는 서주를 확보해 원소와의 결전에 집중할 수 있게 되었어요. 장료라는 미래의 명장을 얻은 것도 큰 수확이었죠. 이후 조조와 유비의 동거는 오래가지 못하고 갈라섭니다.',
      ja: '当代最強の武人・呂布が舞台から退場し、曹操は徐州を確保して袁紹との決戦に集中できるようになりました。張遼という未来の名将を得たのも大きな収穫です。以後、曹操と劉備の同居は長続きせず、袂を分かちます。',
      en: 'The age’s mightiest warrior left the stage, and Cao Cao, with Xuzhou secured, could turn to the reckoning with Yuan Shao. Gaining the future great general Zhang Liao was no small bonus. The cohabitation of Cao Cao and Liu Bei, of course, did not last.',
    },
    diff: {
      ko: '큰 줄기는 정사와 연의가 거의 같아요. 다만 여포가 최후에 유비를 "가장 믿을 수 없는 자"라고 저주하는 대사나 백문루 장면의 세부는 연의가 다듬은 연출이고, 정사의 처형 논의는 더 간결합니다.',
      ja: '大筋は正史と演義がほぼ同じです。ただ呂布が最期に劉備を「最も信用ならぬ者」と呪う台詞や白門楼の場面の細部は演義が磨き上げた演出であり、正史の処刑の議論はより簡潔です。',
      en: 'History and novel largely agree here. The White Gate Tower theatrics — Lü Bu’s dying curse on Liu Bei as "the least trustworthy of men" — are the novel’s polish; the historical execution scene is terser.',
    },
  },
  {
    id: 'guandu', year: '200', sortYear: 200, hanja: '官渡之戰',
    name: { ko: '관도대전', ja: '官渡の戦い', en: 'Battle of Guandu' },
    sides: [
      { label: { ko: '조조군', ja: '曹操軍', en: 'Cao Cao' }, people: ['cao-cao', 'xun-yu', 'guo-jia', 'xu-huang'] },
      { label: { ko: '원소군', ja: '袁紹軍', en: 'Yuan Shao' }, people: ['yuan-shao', 'zhang-he'] },
    ],
    factions: ['wei', 'other'],
    idioms: [],
    background: {
      ko: '하북 4주를 통일한 원소와 천자를 낀 조조 — 북방의 두 세력에게 결전은 시간문제였어요. 기록상 원소군 10만에 조조군은 그 몇 분의 일로, 전력 차는 명백했습니다. 곽가는 십승십패론으로, 순욱은 "먼저 물러서는 쪽이 진다"는 조언으로 열세의 진영을 붙들었죠.',
      ja: '河北四州を統一した袁紹と、天子を擁する曹操 — 北方の二大勢力にとって決戦は時間の問題でした。記録上、袁紹軍十万に対し曹操軍はその数分の一で、戦力差は明白でした。郭嘉は十勝十敗論で、荀彧は「先に退いた方が負ける」という助言で、劣勢の陣営を支えます。',
      en: 'Yuan Shao, unifier of the four northern provinces, and Cao Cao, keeper of the Emperor — a showdown was only a matter of time. On record, Yuan Shao fielded a hundred thousand against a fraction of that number. Guo Jia’s "ten victories" analysis and Xun Yu’s counsel that the first to retreat would lose held the weaker camp together.',
    },
    course: {
      ko: '전초전인 백마에서 관우가 안량을 베며 조조군이 기선을 잡았지만, 본전은 관도에서 소모전으로 흘렀어요. 군량이 바닥나 철수를 고민하던 조조에게 순욱은 "지금이 기이한 수를 쓸 때"라는 답장을 보냈습니다. 때마침 원소 진영에서 홀대받던 허유가 투항해 군량 기지 오소의 위치를 밀고했고, 조조는 몸소 정예 5천을 이끌고 야습해 오소를 불태웠죠. 군량이 사라지자 원소군은 하루아침에 무너졌고, 대장 장합마저 조조에게 투항했습니다.',
      ja: '前哨戦の白馬で関羽が顔良を斬り曹操軍が機先を制しましたが、本戦は官渡での消耗戦に流れました。兵糧が尽きて撤退を悩む曹操に、荀彧は「今こそ奇手を打つ時」という返書を送ります。折しも袁紹陣営で冷遇されていた許攸が投降して兵糧基地・烏巣の位置を密告し、曹操は自ら精鋭五千を率いて夜襲し烏巣を焼き払いました。兵糧が消えると袁紹軍は一夜にして崩れ、大将の張郃まで曹操に降りました。',
      en: 'Guan Yu’s slaying of Yan Liang at Baima won the opening round, but the main contest ground into attrition at Guandu. As his grain ran out, Cao Cao contemplated withdrawal — until Xun Yu wrote back that this was precisely the moment for the extraordinary stroke. It came: the slighted Xu You defected and betrayed the location of the Wuchao grain depot, and Cao Cao personally led five thousand picked men to burn it in the night. With the grain gone, Yuan Shao’s host disintegrated overnight, and even his general Zhang He came over.',
    },
    outcome: {
      ko: '기록상 몇 배의 전력 차를 뒤집은 중국사 대표 역전극으로, 하북의 패권이 조조에게 넘어갔어요. 원소는 2년 뒤 화병으로 죽고 아들들의 내분 끝에 원가는 소멸, 조조는 북방 통일로 직행합니다. 정보전과 보급전이 병력을 이긴다는 교과서적 사례로 남았죠.',
      ja: '記録上、数倍の戦力差を覆した中国史を代表する逆転劇であり、河北の覇権が曹操に移りました。袁紹は2年後に失意のうちに死に、息子たちの内紛の末に袁家は消滅、曹操は北方統一へ直行します。情報戦と兵站戦が兵力に勝るという教科書的事例として残りました。',
      en: 'The classic reversal of Chinese military history — a force outnumbered severalfold, by the records, taking the whole north. Yuan Shao died broken within two years, his house consumed by his sons’ feud, and Cao Cao rolled on to unify the north. The textbook case of intelligence and logistics beating numbers.',
    },
    diff: {
      ko: '연의는 백마·연진의 관우 활약(안량·문추 참수)을 크게 키웠어요. 정사에서 관우가 벤 것은 안량뿐이고 문추의 죽음은 난전 중의 일입니다. 오소 기습과 허유 투항 등 본전의 골격은 정사 그대로예요.',
      ja: '演義は白馬・延津での関羽の活躍（顔良・文醜斬り）を大きく膨らませました。正史で関羽が斬ったのは顔良だけで、文醜の死は乱戦の中の出来事です。烏巣奇襲や許攸投降など本戦の骨格は正史そのままです。',
      en: 'The novel doubles Guan Yu’s trophies, adding Wen Chou to Yan Liang; history credits him only with Yan Liang, Wen Chou falling in the melee. The spine of the battle — Wuchao, Xu You’s defection — is straight from the record.',
    },
  },
  {
    id: 'changban', year: '208', sortYear: 208, hanja: '長坂之戰',
    name: { ko: '장판파 전투', ja: '長坂の戦い', en: 'Battle of Changban' },
    sides: [
      { label: { ko: '조조군', ja: '曹操軍', en: 'Cao Cao' }, people: ['cao-cao'] },
      { label: { ko: '유비군', ja: '劉備軍', en: 'Liu Bei' }, people: ['liu-bei', 'zhao-yun', 'zhang-fei', 'zhuge-liang'] },
    ],
    factions: ['wei', 'shu'],
    idioms: [],
    background: {
      ko: '208년 유표가 죽고 아들 유종이 싸움 없이 조조에게 항복하자, 신야의 유비는 갑자기 퇴로 없는 처지가 되었어요. 남쪽 강릉의 군수 물자를 노리고 철수하는 유비를 따라 십수만 백성이 피란길에 동행했고, 행군 속도는 하루 십여 리로 떨어졌습니다. 조조는 정예 기병 5천을 뽑아 밤낮없이 추격전을 걸었죠.',
      ja: '208年、劉表が死に息子の劉琮が戦わずして曹操に降伏すると、新野の劉備は突如、退路のない立場に置かれました。南の江陵の軍需物資を目指して撤退する劉備に十数万の民が避難の道行きを共にし、行軍速度は一日十数里まで落ちます。曹操は精鋭騎兵五千を選りすぐり、昼夜兼行の追撃戦を仕掛けました。',
      en: 'When Liu Biao died in 208 and his heir surrendered Jing Province without a fight, Liu Bei at Xinye was suddenly cut off. He fell back toward the arsenal at Jiangling — with over a hundred thousand refugees walking beside his army, slowing the march to a dozen li a day. Cao Cao picked five thousand elite horsemen and rode them down day and night.',
    },
    course: {
      ko: '당양 장판에서 따라잡힌 유비군은 궤멸했고, 유비는 처자마저 버린 채 수십 기로 달아났어요. 그 혼란 속에서 조운은 홀로 말머리를 돌려 유비의 갓난 아들 유선과 감부인을 찾아 구출해 돌아왔습니다. 장비는 기병 스무 기로 다리를 끊고 "내가 장익덕이다, 와서 겨루자"라고 외쳤고, 그 기세에 눌린 추격군은 감히 다가서지 못했죠. 유비는 한진 나루에서 관우의 선단과 합류해 하구로 탈출했습니다.',
      ja: '当陽の長坂で追いつかれた劉備軍は壊滅し、劉備は妻子さえ捨てて数十騎で逃れました。その混乱の中、趙雲は一人馬首を返し、劉備の乳飲み子・劉禅と甘夫人を探し出して救出して戻ります。張飛は騎兵二十騎で橋を落とし「身はこれ張益徳なり、来たりて共に死を決すべし」と叫び、その気迫に押された追撃軍は敢えて近づけませんでした。劉備は漢津の渡しで関羽の船団と合流し、夏口へ脱出しました。',
      en: 'Caught at Changban near Dangyang, Liu Bei’s column was shattered; he fled with a few dozen riders, abandoning even his family. Into that chaos Zhao Yun turned his horse alone, found the infant Liu Shan and Lady Gan, and carried them out. Zhang Fei broke the bridge with twenty riders and bellowed his challenge — "I am Zhang Yide! Come and decide it!" — and none dared cross. At the Han ford, Liu Bei met Guan Yu’s boats and escaped to Xiakou.',
    },
    outcome: {
      ko: '참패였지만 전멸은 면했고, 이 생존이 역사를 바꿨어요. 하구로 탈출한 유비는 손권과의 동맹 교섭에 나설 수 있었고, 두 달 뒤 적벽에서 전세가 뒤집힙니다. 조운과 장비의 활약은 각각 "일신시담"과 정사에 기록된 일갈로 전설이 되었죠.',
      ja: '惨敗でしたが全滅は免れ、この生存が歴史を変えました。夏口へ脱出した劉備は孫権との同盟交渉に乗り出すことができ、二か月後、赤壁で戦況が覆ります。趙雲と張飛の活躍はそれぞれ「一身是胆」と正史に記録された一喝で伝説となりました。',
      en: 'A rout — but not annihilation, and that survival changed history. From Xiakou, Liu Bei could negotiate the alliance with Sun Quan, and two months later Red Cliffs turned the tide. Zhao Yun’s ride and Zhang Fei’s roar passed into legend, both anchored in the historical record.',
    },
    diff: {
      ko: '조운이 "조조군 50만 한복판을 일곱 번 드나들었다"는 스케일과 미부인의 우물 투신, 조조가 조운을 생포하라 명해 화살을 금지했다는 설정은 모두 연의의 살이에요. 정사는 조운이 아두를 품고 무사히 돌아왔다는 사실만 간결히 전합니다.',
      ja: '趙雲が「曹操軍五十万のただ中を七度出入りした」というスケールや糜夫人の井戸への投身、曹操が趙雲の生け捕りを命じて矢を禁じたという設定は、すべて演義の肉付けです。正史は趙雲が阿斗を抱いて無事に戻ったという事実だけを簡潔に伝えます。',
      en: 'The seven charges through half a million men, Lady Mi’s leap into the well, Cao Cao forbidding archers to take Zhao Yun alive — all the novel’s flesh. The histories state only, and plainly, that Zhao Yun carried the infant back unharmed.',
    },
  },
  {
    id: 'red-cliffs', year: '208', sortYear: 209, hanja: '赤壁之戰',
    name: { ko: '적벽대전', ja: '赤壁の戦い', en: 'Battle of Red Cliffs' },
    sides: [
      { label: { ko: '손유 연합군', ja: '孫劉連合軍', en: 'Sun–Liu alliance' }, people: ['zhou-yu', 'cheng-pu', 'huang-gai', 'lu-su', 'liu-bei', 'zhuge-liang'] },
      { label: { ko: '조조군', ja: '曹操軍', en: 'Cao Cao' }, people: ['cao-cao'] },
    ],
    factions: ['wei', 'shu', 'wu'],
    idioms: ['goyukjigye', 'mansagubi', 'choseonchajeon'],
    background: {
      ko: '형주를 무혈 접수한 조조는 기록상 수십만이라 일컫는 대군과 항복한 형주 수군을 몰아 강동 정복에 나섰어요. 오의 조정은 항복론이 우세했지만 노숙과 주유가 주전론을 세웠고, 제갈량이 유비 측 사절로 동맹을 성사시켰습니다. 손권은 칼로 탁자를 베며 "다시 항복을 말하는 자는 이 탁자와 같으리라"라고 결단했죠.',
      ja: '荊州を無血接収した曹操は、記録上数十万と称する大軍と降伏した荊州水軍を駆って江東征服に乗り出しました。呉の朝廷では降伏論が優勢でしたが、魯粛と周瑜が主戦論を立て、諸葛亮が劉備側の使節として同盟を成立させます。孫権は刀で机を斬り「再び降伏を口にする者はこの机と同じになる」と決断しました。',
      en: 'With Jing Province absorbed without a blow, Cao Cao drove south with a host recorded in the hundreds of thousands, plus the surrendered Jing navy. Wu’s court leaned toward capitulation until Lu Su and Zhou Yu made the case for war and Zhuge Liang sealed the alliance as Liu Bei’s envoy. Sun Quan hacked the corner from his desk: the next man to say "surrender" would share its fate.',
    },
    course: {
      ko: '기록상 5만의 연합군은 장강에서 조조군의 남하를 저지했고, 수전에 서툰 북방군은 전염병까지 겹쳐 배를 쇠사슬로 연결한 채 웅크렸어요. 주유의 부장 황개가 "적의 배가 묶여 있으니 태워 버릴 수 있다"며 거짓 항복과 화공을 진언했습니다. 기름 먹인 마른 섶을 가득 실은 황개의 선단이 항복을 가장해 접근하다 일제히 불을 붙였고, 때마침 세찬 동남풍이 불길을 조조 함대와 강안의 진영까지 몰아갔죠. 연합군이 수륙으로 협공하자 조조는 함대를 스스로 불태우며 화용도의 진창길로 참담하게 퇴각했습니다.',
      ja: '記録上五万の連合軍は長江で曹操軍の南下を阻み、水戦に不慣れな北方軍は疫病まで重なって船を鎖で繋いだままうずくまりました。周瑜の部将・黄蓋が「敵船は繋がれているから焼き払える」と偽降と火攻めを進言します。油を染ませた枯れ柴を満載した黄蓋の船団が降伏を装って接近し、一斉に火を放つと、折からの強い東南の風が炎を曹操の艦隊と岸辺の陣営まで押し流しました。連合軍が水陸から挟撃すると、曹操は艦隊を自ら焼き払い、華容道の泥道を惨憺と退却しました。',
      en: 'Some fifty thousand allies, by the records, blocked the Yangtze crossing while plague swept Cao Cao’s northern troops, who chained their unsteady ships together. Huang Gai saw it: "their ships are bound — they can be burned," and proposed the fake surrender. His squadron, packed with oil-soaked kindling, closed under a flag of submission and ignited as one; a hard southeast wind drove the fire through the fleet and into the shore camps. Struck from water and land at once, Cao Cao burned his remaining ships himself and floundered home through the mud of Huarong.',
    },
    outcome: {
      ko: '조조의 남진은 좌절되었고, 주유는 이어 강릉을 빼앗고 유비는 형남 4군을 차지했어요. 이 승리로 천하는 사실상 셋으로 갈라졌습니다 — 삼국시대의 판도를 결정한 단 하나의 전투를 꼽는다면 적벽이죠.',
      ja: '曹操の南進は挫折し、周瑜は続いて江陵を奪い、劉備は荊南四郡を手にしました。この勝利で天下は事実上三つに割れます — 三国時代の勢力図を決めた唯一の戦いを挙げるなら赤壁です。',
      en: 'The southern conquest was finished. Zhou Yu went on to take Jiangling; Liu Bei scooped up the four southern commanderies. With this one battle the realm split, in fact, into three — no single engagement did more to draw the map of the era.',
    },
    diff: {
      ko: '제갈량의 동남풍 기원, 초선차전, 방통의 연환계, 관우의 화용도 — 적벽 하면 떠오르는 명장면 대부분이 연의의 창작이에요. 정사의 주역은 어디까지나 주유와 황개이며, 배를 묶은 것도 방통의 계략이 아니라 조조군 스스로였습니다. 승패를 가른 실제 변수는 화공과 전염병이었죠.',
      ja: '諸葛亮の東南の風の祈祷、草船借箭、龐統の連環の計、関羽の華容道 — 赤壁と聞いて浮かぶ名場面の大半が演義の創作です。正史の主役はあくまで周瑜と黄蓋であり、船を繋いだのも龐統の計略ではなく曹操軍自身でした。勝敗を分けた実際の変数は火攻めと疫病です。',
      en: 'The prayer for the southeast wind, the straw-boat arrows, Pang Tong’s chain scheme, Guan Yu at Huarong — nearly every iconic Red Cliffs scene is the novel’s. In the histories the heroes are Zhou Yu and Huang Gai, the ships were chained by Cao Cao’s own men, and the true deciders were fire and disease.',
    },
  },
  {
    id: 'tong-pass', year: '211', sortYear: 211, hanja: '潼關之戰',
    name: { ko: '동관 전투', ja: '潼関の戦い', en: 'Battle of Tong Pass' },
    sides: [
      { label: { ko: '조조군', ja: '曹操軍', en: 'Cao Cao' }, people: ['cao-cao', 'jia-xu', 'xu-chu'] },
      { label: { ko: '서량 연합군', ja: '西涼連合軍', en: 'Xiliang coalition' }, people: ['ma-chao'] },
    ],
    factions: ['wei', 'other'],
    idioms: [],
    background: {
      ko: '조조가 한중의 장로를 친다는 명목으로 관중을 지나려 하자, 마초·한수 등 서량의 군벌들은 자신들을 향한 칼로 받아들였어요. 기록상 10만의 연합군이 동관에 집결해 조조의 서진을 가로막았습니다. 마초에게는 아버지 마등이 조정에 인질로 있는 상황에서의 거병이었죠.',
      ja: '曹操が漢中の張魯を討つという名目で関中を通ろうとすると、馬超・韓遂ら西涼の軍閥は自分たちに向けられた刃と受け取りました。記録上十万の連合軍が潼関に集結し、曹操の西進を阻みます。馬超にとっては、父・馬騰が朝廷に人質としている状況での挙兵でした。',
      en: 'When Cao Cao moved to cross Guanzhong, nominally against Zhang Lu of Hanzhong, the Xiliang warlords read it as a blade aimed at themselves. A coalition recorded at a hundred thousand under Ma Chao and Han Sui massed at Tong Pass — Ma Chao rising even with his father Ma Teng held hostage at court.',
    },
    course: {
      ko: '서량 기병의 돌격은 사나웠고, 위수를 건너던 조조는 마초의 기습에 목숨이 위태로운 순간까지 몰렸어요 — 허저가 한 손으로 말안장을 들어 화살을 막으며 배를 몰아 겨우 건넜습니다. "수염을 자르고 전포를 벗어 던지며 달아났다"는 이야기가 남을 정도였죠. 정면 돌파가 어렵다고 본 조조는 가후의 이간계를 받아들여, 한수와 옛정을 나누는 척 담소하고 글자를 지운 편지를 보내 마초의 의심을 부추겼습니다. 연합군의 결속이 무너진 순간 조조는 총공격으로 이를 흩어 버렸어요.',
      ja: '西涼騎兵の突撃は荒々しく、渭水を渡っていた曹操は馬超の奇襲に命が危うい瞬間まで追い込まれました — 許褚が片手で鞍を掲げて矢を防ぎ、船を漕いでかろうじて渡り切ります。「髭を切り、戦袍を脱ぎ捨てて逃げた」という話が残るほどでした。正面突破は難しいと見た曹操は賈詡の離間の計を容れ、韓遂と旧交を温めるふりをして談笑し、文字を塗り消した手紙を送って馬超の疑心を煽ります。連合軍の結束が崩れた瞬間、曹操は総攻撃でこれを蹴散らしました。',
      en: 'The Xiliang cavalry hit like a storm; crossing the Wei River, Cao Cao came within moments of death under Ma Chao’s sudden charge — Xu Chu holding up a saddle one-handed against the arrows as he rowed his lord across. Legend had Cao Cao cutting off his own beard and shedding his robe to escape. Judging a frontal decision impossible, he took Jia Xu’s wedge-driving plan: a warm, chatty reunion with the older Han Sui, then a letter to him with suspicious erasures. The moment mistrust split the coalition, Cao Cao attacked and scattered it.',
    },
    outcome: {
      ko: '관중이 평정되어 조조의 서부 위협이 사라졌고, 이듬해 마등 일족은 처형됩니다. 패주한 마초는 재기를 노리다 결국 유비에게 귀순해 촉의 오호대장군이 되죠. 무력의 마초가 지략의 가후에게 무너진, 이간계의 교과서 같은 전역이에요.',
      ja: '関中が平定されて曹操の西方の脅威が消え、翌年、馬騰一族は処刑されます。敗走した馬超は再起を狙った末、結局劉備に帰順して蜀の五虎大将となります。武力の馬超が知略の賈詡に崩された、離間の計の教科書のような戦役です。',
      en: 'Guanzhong was pacified and Cao Cao’s western flank secured; Ma Teng’s clan was executed the following year. The defeated Ma Chao, after further attempts, finally joined Liu Bei and became a Tiger General of Shu. Ma Chao’s force undone by Jia Xu’s guile — the textbook campaign of the discord stratagem.',
    },
    diff: {
      ko: '연의의 "허저가 웃통을 벗고 마초와 격투(나의전마초)"는 창작이지만, 수염을 잘랐다는 일화와 허저의 도하 분전, 이간계의 골격은 정사·주석에 뿌리가 있어요. 마초 거병과 마등 처형의 선후 관계도 연의가 뒤집은 부분입니다.',
      ja: '演義の「許褚が裸になって馬超と格闘（裸衣戦馬超）」は創作ですが、髭を切った逸話や許褚の渡河の奮戦、離間の計の骨格は正史・注釈に根があります。馬超挙兵と馬騰処刑の前後関係も、演義が覆した部分です。',
      en: 'The novel’s shirtless duel between Xu Chu and Ma Chao is invention, but the beard-cutting tale, Xu Chu’s river stand and the discord scheme all have roots in the record. The novel also reverses the true order of Ma Chao’s rising and Ma Teng’s execution.',
    },
  },
  {
    id: 'hefei', year: '215', sortYear: 215, hanja: '合肥之戰',
    name: { ko: '합비 전투', ja: '合肥の戦い', en: 'Battle of Hefei' },
    sides: [
      { label: { ko: '위군(수비)', ja: '魏軍（守備）', en: 'Wei (garrison)' }, people: ['zhang-liao'] },
      { label: { ko: '오군', ja: '呉軍', en: 'Wu' }, people: ['sun-quan', 'gan-ning'] },
    ],
    factions: ['wei', 'wu'],
    idioms: [],
    background: {
      ko: '조조가 한중 원정으로 서쪽에 묶인 215년, 손권은 기록상 10만 대군을 일으켜 회남의 요충 합비를 노렸어요. 성을 지키는 병력은 장료·악진·이전의 7천 남짓. 조조는 떠나기 전 "적이 오면 장료와 이전은 나가 싸우고 악진은 성을 지키라"는 밀함 하나만 남겨 두었습니다.',
      ja: '曹操が漢中遠征で西に釘付けになった215年、孫権は記録上十万の大軍を起こして淮南の要衝・合肥を狙いました。城を守る兵力は張遼・楽進・李典の七千余り。曹操は発つ前「敵が来たら張遼と李典は出て戦い、楽進は城を守れ」という密函一つだけを残していました。',
      en: 'In 215, with Cao Cao tied down in Hanzhong, Sun Quan raised a host recorded at a hundred thousand against the key fortress of Hefei — garrisoned by barely seven thousand under Zhang Liao, Yue Jin and Li Dian. Cao Cao had left behind a single sealed order: if the enemy comes, Zhang Liao and Li Dian go out and fight; Yue Jin holds the walls.',
    },
    course: {
      ko: '장료는 "적이 자리 잡기 전에 예기를 꺾어야 한다"며 밤새 결사대 800을 뽑았어요. 새벽, 스스로 갑옷을 여미고 선두에 선 장료는 제 이름을 외치며 손권의 본진까지 쇄도했고, 놀란 손권은 높은 언덕으로 피해 긴 창만 움켜쥐었습니다. 포위당하고도 부하를 구하러 되돌아 뚫는 장료의 분전에 오군의 사기는 시작부터 꺾였죠. 열흘 남짓의 공성이 무위로 돌아가 철군하던 길, 소요진에서 장료가 재차 들이쳐 손권 자신이 말을 몰아 끊어진 다리를 뛰어넘어 겨우 살아났습니다.',
      ja: '張遼は「敵が腰を据える前に鋭気を挫くべきだ」と夜通し決死隊八百を選び抜きました。夜明け、自ら鎧を締めて先頭に立った張遼は己の名を叫びながら孫権の本陣まで殺到し、驚いた孫権は高い丘に逃れて長戟を握りしめるばかりでした。包囲されても部下を救いに引き返して突破する張遼の奮戦に、呉軍の士気は緒戦から挫かれます。十日余りの攻城が無為に終わり撤退する道すがら、逍遥津で張遼が再び襲いかかり、孫権自身が馬を駆って断たれた橋を跳び越え、かろうじて生き延びました。',
      en: 'Zhang Liao picked eight hundred volunteers overnight — the enemy’s edge must be blunted before they settled in. At dawn, armored and first through the gate, he cut a path to Sun Quan’s own standard, shouting his name; the shaken Sun Quan scrambled up a mound clutching a long halberd. Surrounded, Zhang Liao turned back to carve his trapped men free, and Wu’s morale never recovered. When the ten-day siege was abandoned, he struck the retreat at Xiaoyao Ford — and Sun Quan escaped only by leaping his horse across a broken bridge.',
    },
    outcome: {
      ko: '기록상 7천이 10만을 물리친 수성전의 전설이 완성되었고, 합비는 이후로도 오가 끝내 넘지 못한 벽으로 남았어요. "장료가 온다(遼來來)"는 이름이 강동에서 우는 아이를 그치게 했다는 이야기가 이 전투에서 나왔습니다. 위의 동부 전선은 이 승리로 한 세대가 안정되죠.',
      ja: '記録上、七千が十万を退けた守城戦の伝説が完成し、合肥は以後も呉がついに越えられなかった壁として残りました。「遼来来」の名が江東で泣く子を黙らせたという話はこの戦いから生まれています。魏の東部戦線はこの勝利で一世代の安定を得ました。',
      en: 'Seven thousand turning back a hundred thousand, by the record — the legend of fortress defense was complete, and Hefei remained the wall Wu never breached. From this battle came the tale that the words "Zhang Liao is coming" silenced crying children in the Southland. Wei’s eastern front was secure for a generation.',
    },
    diff: {
      ko: '연의는 이 대목에서 태사자를 전사시키지만, 정사의 태사자는 9년 전에 이미 병사했어요. 감녕의 백기 야습도 이 전투가 아니라 2년 전 유수구의 일입니다. 장료의 800 돌격 자체는 정사 기록 그대로로, 각색이 필요 없을 만큼 극적이었죠.',
      ja: '演義はこの場面で太史慈を戦死させますが、正史の太史慈は9年前にすでに病没しています。甘寧の百騎夜襲もこの戦いではなく2年前の濡須口の出来事です。張遼の八百突撃自体は正史の記録そのままで、脚色が要らないほど劇的でした。',
      en: 'The novel kills Taishi Ci here — a man nine years dead in the histories — and borrows Gan Ning’s hundred-rider night raid from Ruxukou two years earlier. Zhang Liao’s charge needed no such help; the record is dramatic enough exactly as written.',
    },
  },
]
