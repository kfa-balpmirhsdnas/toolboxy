// 삼국지 인물 사전 데이터 2/4 — 촉 16명.
import type { TKChar } from './threeKingdomsCharacters'

export const CHARS_SHU: TKChar[] = [
  {
    id: 'liu-bei', hanja: '劉備', name: { ko: '유비', ja: '劉備', en: 'Liu Bei' },
    courtesy: { hanja: '玄德', read: { ko: '현덕', ja: 'げんとく', en: 'Xuande' } },
    posthumous: { ko: '소열제', ja: '昭烈帝', en: 'Emperor Zhaolie' },
    birth: '161', death: '223', faction: 'shu', role: 'both',
    intro: {
      ko: '돗자리를 팔던 한실 후예에서 촉한의 초대 황제까지 오른 입지전의 주인공이에요. 근거지 하나 없이 반평생을 떠돌면서도 관우·장비·조운 같은 사람들이 끝까지 곁을 지켰고, 삼고초려로 제갈량을 얻으며 천하삼분의 한 축이 되었습니다. 적벽 이후 형주와 익주를 차지하고 한중왕을 거쳐 황제에 올랐죠. 이릉의 패전 후 백제성에서 제갈량에게 나라를 맡기고 눈을 감은, 인덕으로 기억되는 군주입니다.',
      ja: 'むしろ売りの漢室後裔から蜀漢の初代皇帝まで上り詰めた立志伝の主人公です。根拠地一つなく半生を流浪しながらも、関羽・張飛・趙雲のような人々が最後までそばを守り、三顧の礼で諸葛亮を得て天下三分の一角となりました。赤壁の後、荊州と益州を手にし、漢中王を経て皇帝に即位します。夷陵の敗戦後、白帝城で諸葛亮に国を託して世を去った、仁徳で記憶される君主です。',
      en: 'From sandal-weaver of imperial descent to first emperor of Shu-Han. He wandered half his life without a base of his own, yet men like Guan Yu, Zhang Fei and Zhao Yun never left his side; with Zhuge Liang won by three visits, he became one pillar of the divided realm. After Red Cliffs he took Jing and Yi provinces, became King of Hanzhong, then emperor. Defeated at Yiling, he died at Baidicheng entrusting the state to Zhuge Liang — remembered above all for winning hearts.',
    },
    imageDiff: {
      ko: '연의는 어질고 눈물 많은 성인군자로 그리지만, 정사의 유비는 여포도 조조도 인정한 당대급 효웅(梟雄)이에요. 익주 탈취처럼 냉정한 결단도 서슴지 않은, 부드러움 속에 강함을 감춘 승부사입니다.',
      ja: '演義は情け深く涙もろい聖人君子として描きますが、正史の劉備は呂布も曹操も認めた当代級の梟雄です。益州奪取のような冷徹な決断も辞さない、柔の中に剛を秘めた勝負師です。',
      en: 'The novel paints a gentle, tearful saint; the histories show a formidable operator whom even Lü Bu and Cao Cao rated dangerous — capable of cold decisions like the seizure of Yi Province. Steel wrapped in warmth.',
    },
  },
  {
    id: 'guan-yu', hanja: '關羽', name: { ko: '관우', ja: '関羽', en: 'Guan Yu' },
    courtesy: { hanja: '雲長', read: { ko: '운장', ja: 'うんちょう', en: 'Yunchang' } },
    birth: '?', death: '220', faction: 'shu',
    factionNote: { ko: '조조에게 일시 몸을 의탁 후 유비에게 복귀', ja: '曹操に一時身を寄せた後、劉備のもとへ復帰', en: 'Briefly served Cao Cao before returning to Liu Bei' },
    role: 'military',
    intro: {
      ko: '유비의 오른팔이자 후대에 신으로 모셔진 충의의 화신이에요. 조조에게 잡혔을 때도 극진한 대우를 마다하고 안량을 벤 공으로 은혜를 갚은 뒤 유비에게 돌아갔습니다. 형주를 홀로 맡아 번성 전투에서 위의 칠군을 수장시키며 "그 위엄이 화하를 뒤흔들었다"는 기록을 남겼죠. 그러나 오의 기습으로 형주를 잃고 맥성에서 최후를 맞았습니다. 사후 관제묘에 모셔지며 무와 의리, 나아가 재물의 신으로까지 숭배되는 유일무이한 인물이에요.',
      ja: '劉備の右腕にして、後世に神として祀られた忠義の化身です。曹操に捕らわれた際も手厚い待遇を断り、顔良を斬った功で恩に報いてから劉備のもとへ帰りました。荊州を一人で預かり、樊城の戦いで魏の七軍を水没させ「その威、華夏を震わす」との記録を残します。しかし呉の奇襲で荊州を失い、麦城で最期を迎えました。死後は関帝廟に祀られ、武と義、さらには財の神とまで崇められる唯一無二の人物です。',
      en: 'Liu Bei’s right arm, and the incarnation of loyalty later worshipped as a god. Captured by Cao Cao, he refused every honor until he had repaid the debt by slaying Yan Liang — then rode back to Liu Bei. Holding Jing Province alone, he drowned seven Wei armies at Fancheng, his fame "shaking the heartland." Wu’s surprise attack cost him the province and his life at Maicheng. Temples to Lord Guan still make him the one Three Kingdoms figure venerated as a deity of war, honor — even wealth.',
    },
    imageDiff: {
      ko: '청룡언월도·오관참육장·화타의 뼈 수술은 모두 연의의 창작이에요. 정사의 관우는 그런 장식 없이도 "만인지적"이라 불린 당대 최강급 장수지만, 자존심이 강해 동맹을 얕본 것이 몰락의 씨앗이 되었다고 기록됩니다.',
      ja: '青龍偃月刀・五関六将・華佗の骨手術はすべて演義の創作です。正史の関羽はそうした装飾なしでも「万人の敵」と呼ばれた当代最強級の武将ですが、誇り高く同盟を侮ったことが没落の種になったと記録されています。',
      en: 'The Green Dragon blade, the five passes, the bone surgery — all the novel’s inventions. The historical Guan Yu needed none of it: a "match for ten thousand" — whose pride toward allies, the histories note, sowed his downfall.',
    },
  },
  {
    id: 'zhang-fei', hanja: '張飛', name: { ko: '장비', ja: '張飛', en: 'Zhang Fei' },
    courtesy: { hanja: '益德', read: { ko: '익덕', ja: 'えきとく', en: 'Yide' } },
    birth: '?', death: '221', faction: 'shu', role: 'military',
    intro: {
      ko: '관우와 함께 "만인지적"이라 불린 유비군의 돌파 대장이에요. 장판교에서 홀로 다리를 끊고 버텨 조조의 추격군을 멈춰 세운 장면이 대표작입니다. 무용 일변도 같지만 엄안을 사로잡고 의로 대접해 촉 공략의 길을 연 것처럼 지략과 도량도 겸비했죠. 관우의 복수전을 준비하다 부하들에게 살해당했는데, 정사는 "군자는 공경했으나 아랫사람에게 가혹했다"고 그 원인을 짚었습니다.',
      ja: '関羽とともに「万人の敵」と呼ばれた劉備軍の突破隊長です。長坂橋でただ一人橋を落として立ちはだかり、曹操の追撃軍を止めた場面が代表作です。武勇一辺倒のようで、厳顔を捕らえて義をもって遇し蜀攻略の道を開いたように、知略と度量も兼ね備えていました。関羽の復讐戦を準備中に部下に殺害されましたが、正史は「君子を敬ったが目下に苛烈だった」とその原因を指摘しています。',
      en: 'With Guan Yu, the other "match for ten thousand" — Liu Bei’s battering ram. His signature moment: standing alone at Changban Bridge and stopping Cao Cao’s pursuit cold. Nor was he all muscle; capturing the veteran Yan Yan and treating him with honor opened the road into Shu. He was murdered by subordinates while preparing to avenge Guan Yu — because, the histories observe, he honored gentlemen but brutalized the men beneath him.',
    },
    imageDiff: {
      ko: '연의의 술주정뱅이 이미지와 "연인 장비" 호통은 극적 장치예요. 정사의 장비는 명문가 딸을 아내로 맞고 서화에 능했다는 후대 전승이 있을 만큼, 단순한 폭한과는 거리가 있습니다.',
      ja: '演義の酒乱イメージと「燕人張飛」の一喝は劇的装置です。正史の張飛は名門の娘を妻に迎え、後世には書画に長けたという伝承もあるほどで、単純な乱暴者とは距離があります。',
      en: 'The drunken brute bellowing from the bridge is stagecraft. The historical Zhang Fei married into high nobility, and later tradition even credits him with calligraphy and painting — hardly a simple thug.',
    },
  },
  {
    id: 'zhao-yun', hanja: '趙雲', name: { ko: '조운', ja: '趙雲', en: 'Zhao Yun' },
    courtesy: { hanja: '子龍', read: { ko: '자룡', ja: 'しりゅう', en: 'Zilong' } },
    birth: '?', death: '229', faction: 'shu',
    factionNote: { ko: '공손찬 휘하에서 유비에게 합류', ja: '公孫瓚麾下から劉備に合流', en: 'Joined Liu Bei from Gongsun Zan’s command' },
    role: 'military',
    intro: {
      ko: '장판파에서 유비의 어린 아들을 품에 안고 단기로 적진을 돌파한 일화로 유명한 무장이에요. 한수 전투에서는 텅 빈 영채의 문을 열어 추격군을 물리쳐 유비에게 "자룡은 온몸이 담덩어리(一身是膽)"라는 극찬을 들었습니다. 무용만이 아니라 익주 평정 후 논밭 분배에 반대하고 이릉 원정에 간언하는 등 대국을 보는 눈도 갖췄죠. 촉의 오호대장군 중 가장 오래 살아남아 북벌까지 함께한 상승 불패의 상징입니다.',
      ja: '長坂で劉備の幼子を懐に抱き、単騎で敵陣を突破した逸話で有名な武将です。漢水の戦いでは空の陣営の門を開け放って追撃軍を退け、劉備から「子龍は一身これ胆なり」と絶賛されました。武勇だけでなく、益州平定後の田畑分配に反対し夷陵遠征を諫めるなど、大局を見る眼も備えていました。蜀の五虎大将で最も長く生き残り、北伐まで従軍した常勝不敗の象徴です。',
      en: 'Famed for cradling Liu Bei’s infant son through the enemy at Changban, alone on horseback. At the Han River he flung open the gates of an empty camp and turned back the pursuit, earning Liu Bei’s verdict: "Zilong is courage from head to foot." He had judgment to match — opposing land confiscations in Yi Province, cautioning against the Yiling campaign. Longest-lived of the Five Tiger Generals, serving into the northern campaigns: the emblem of the unbeaten.',
    },
    imageDiff: {
      ko: '장판파에서 "조조군 50만 한복판을 뚫었다"는 스케일은 연의의 과장이지만, 아두를 구한 일 자체는 정사 기록이에요. 정사의 조운은 화려한 선봉장이라기보다 신중하고 강직한 호위·간언형 명장에 가깝습니다.',
      ja: '長坂で「曹操軍五十万のただ中を突破した」というスケールは演義の誇張ですが、阿斗を救ったこと自体は正史の記録です。正史の趙雲は華やかな先鋒というより、慎重で剛直な護衛・諫言型の名将に近い存在です。',
      en: 'The novel’s "through half a million men" is inflation, but the rescue of the infant heir is history. The real Zhao Yun reads less as flashy vanguard than as the steady, upright guardian who told his lord hard truths.',
    },
  },
  {
    id: 'ma-chao', hanja: '馬超', name: { ko: '마초', ja: '馬超', en: 'Ma Chao' },
    courtesy: { hanja: '孟起', read: { ko: '맹기', ja: 'もうき', en: 'Mengqi' } },
    birth: '176', death: '222', faction: 'shu',
    factionNote: { ko: '서량 군벌에서 장로를 거쳐 촉으로', ja: '西涼軍閥から張魯を経て蜀へ', en: 'Xiliang warlord; joined Shu via Zhang Lu' },
    role: 'military',
    intro: {
      ko: '"비단 마초(錦馬超)"라 불린 서량의 맹장이에요. 동관에서 조조를 사지까지 몰아붙여 "마초가 죽지 않으면 내 묻힐 곳이 없다"는 탄식을 받아냈습니다. 그러나 거병의 대가로 조정에 있던 아버지 마등과 일족이 몰살당했고, 세력을 잃은 뒤 유비에게 귀순했죠. 성도 공략전에서 그의 이름만으로 성의 항전 의지가 꺾였을 만큼 위명이 대단했고, 촉의 오호대장군 반열에 올랐습니다. 마흔일곱, 일족의 원한을 유언으로 남기고 병사했어요.',
      ja: '「錦馬超」と呼ばれた西涼の猛将です。潼関で曹操を死地まで追い詰め、「馬超が死なねば我が葬られる地はない」という嘆息を引き出しました。しかし挙兵の代償として朝廷にいた父・馬騰と一族が皆殺しにされ、勢力を失った後、劉備に帰順します。成都攻略戦ではその名だけで城の抗戦意志が挫けたほど威名が轟き、蜀の五虎大将に列せられました。四十七歳、一族の恨みを遺言に残して病没します。',
      en: 'The "Splendid Ma Chao" of Xiliang. At Tong Pass he drove Cao Cao to the edge of death — "unless Ma Chao dies, I shall have no grave." The price of his rising was the massacre of his father Ma Teng and clan at court; stripped of his power base, he came over to Liu Bei. At Chengdu his name alone broke the defenders’ will, and he joined the Five Tiger Generals. He died at forty-seven, bequeathing his clan’s vengeance in his last testament.',
    },
    imageDiff: {
      ko: '연의는 아버지의 복수를 위해 거병한 효자로 그리지만, 정사의 순서는 반대예요 — 마초가 먼저 거병했고 그 결과 마등이 처형됐습니다. 화려한 무용과 비극적 몰락이 겹친, 정사가 더 쓰라린 인물입니다.',
      ja: '演義は父の復讐のために挙兵した孝子として描きますが、正史の順序は逆です — 馬超が先に挙兵し、その結果馬騰が処刑されました。華やかな武勇と悲劇的没落が重なる、正史のほうがより苦い人物です。',
      en: 'The novel makes him a filial son avenging his father; history runs the other way — his rising came first, his father’s execution followed. The true story is the more bitter one.',
    },
  },
  {
    id: 'huang-zhong', hanja: '黃忠', name: { ko: '황충', ja: '黄忠', en: 'Huang Zhong' },
    courtesy: { hanja: '漢升', read: { ko: '한승', ja: 'かんしょう', en: 'Hansheng' } },
    birth: '?', death: '220', faction: 'shu',
    factionNote: { ko: '유표·조조 관할을 거쳐 유비에게 귀순', ja: '劉表・曹操の管轄を経て劉備に帰順', en: 'Under Liu Biao, then Cao Cao’s administration, before Liu Bei' },
    role: 'military',
    intro: {
      ko: '노장의 대명사이자 백전노장의 아이콘이에요. 형주 남부에서 유비에게 귀순한 뒤 익주 공략전에서 "매번 선봉에 서서 삼군의 으뜸가는 용맹"을 떨쳤습니다. 절정은 정군산 — 험지를 거슬러 올라 위의 총사령 하후연을 단칼에 베며 한중 쟁탈전의 승부를 갈랐죠. 이 공으로 관우·장비와 같은 반열에 올랐고, "늙었으나 그 활은 늙지 않았다"는 노익장 서사의 원형이 되었습니다.',
      ja: '老将の代名詞にして歴戦の勇士のアイコンです。荊州南部で劉備に帰順した後、益州攻略戦で「常に先登し、勇は三軍に冠たり」と謳われました。絶頂は定軍山 — 険地を駆け上がり、魏の総帥・夏侯淵を一刀のもとに斬って漢中争奪戦の勝敗を分けました。この功で関羽・張飛と同列に上り、「老いてなおその弓は老いず」という老益壮の物語の原型となりました。',
      en: 'The very archetype of the ageless veteran. Joining Liu Bei in southern Jing, he "always first up the walls, bravest of the three armies" in the conquest of Yi Province. His summit was Mount Dingjun: charging uphill to cut down Wei’s supreme commander Xiahou Yuan, deciding the war for Hanzhong. The feat raised him to the rank of Guan Yu and Zhang Fei — the original "old but his bow is not."',
    },
    imageDiff: {
      ko: '관우와의 일기토 끝에 서로를 알아봤다는 명장면은 연의의 창작이에요. 나이도 정사엔 명시가 없지만 "노장" 언급에서 노익장 서사가 자라났습니다. 정군산의 공적은 정사 그대로예요.',
      ja: '関羽との一騎打ちの末に互いを認め合ったという名場面は演義の創作です。年齢も正史には明記がありませんが、「老将」への言及から老益壮の物語が育ちました。定軍山の功績は正史そのままです。',
      en: 'The celebrated duel with Guan Yu is the novel’s invention, and even his age is unstated in the histories — the "old general" legend grew from a passing mention. Dingjun, however, is fact.',
    },
  },
  {
    id: 'zhuge-liang', hanja: '諸葛亮', name: { ko: '제갈량', ja: '諸葛亮', en: 'Zhuge Liang' },
    courtesy: { hanja: '孔明', read: { ko: '공명', ja: 'こうめい', en: 'Kongming' } },
    posthumous: { ko: '충무후', ja: '忠武侯', en: 'Marquis Zhongwu' },
    birth: '181', death: '234', faction: 'shu', role: 'civil',
    intro: {
      ko: '융중의 초가집에서 천하삼분지계를 설계한 촉한의 승상이자, 동아시아에서 지략과 충의의 대명사가 된 인물이에요. 삼고초려로 유비를 만나 적벽 동맹과 익주 확보를 이끌었고, 유비 사후에는 어린 유선을 보필하며 나라 살림 전체를 짊어졌습니다. 남만을 평정한 뒤 출사표를 올리고 다섯 차례 북벌에 나섰지만, 오장원 진중에서 병사했죠. "몸을 굽혀 온 힘을 다하고 죽은 뒤에야 그친다(국궁진췌)"는 그의 삶 자체의 요약입니다.',
      ja: '隆中の草庵で天下三分の計を設計した蜀漢の丞相であり、東アジアで知略と忠義の代名詞となった人物です。三顧の礼で劉備に出会い、赤壁の同盟と益州確保を導きました。劉備の死後は幼い劉禅を補佐し、国政全体を背負います。南蛮を平定した後、出師の表を奉って五度の北伐に出ますが、五丈原の陣中で病没しました。「鞠躬尽瘁、死して後已む」はその生涯そのものの要約です。',
      en: 'The chancellor of Shu-Han who drafted the three-way division of the realm from a thatched cottage — and became East Asia’s very byword for genius and devotion. Won by Liu Bei’s three visits, he engineered the Red Cliffs alliance and the taking of Yi Province; after Liu Bei’s death he carried the whole state for the young Liu Shan. He pacified the south, submitted his famous memorial, and led five northern campaigns before dying in camp at Wuzhang Plains. "Bend the body, give everything, cease only in death" — his own words, his whole life.',
    },
    imageDiff: {
      ko: '동남풍 기원, 초선차전, 공성계 같은 신기(神技)는 연의의 창작·각색이에요. 정사의 진수는 그를 "정치의 재능은 관중·소하에 비길 만하나 임기응변의 용병은 장기가 아니었다"고 평했습니다 — 마법사가 아니라 위대한 재상이라는 뜻이죠.',
      ja: '東南の風の祈祷、草船借箭、空城の計のような神業は演義の創作・脚色です。正史の陳寿は彼を「政治の才は管仲・蕭何に比すべきだが、臨機応変の用兵は長所ではなかった」と評しました — 魔法使いではなく偉大な宰相だという意味です。',
      en: 'Summoning the southeast wind, borrowing arrows, the empty fort — the sorcery is all the novel’s. Chen Shou’s actual verdict: a statesman to rank with Guan Zhong and Xiao He, though improvisational generalship "was not his strength." Not a wizard — a great chancellor.',
    },
  },
  {
    id: 'pang-tong', hanja: '龐統', name: { ko: '방통', ja: '龐統', en: 'Pang Tong' },
    courtesy: { hanja: '士元', read: { ko: '사원', ja: 'しげん', en: 'Shiyuan' } },
    birth: '179', death: '214', faction: 'shu', role: 'civil',
    intro: {
      ko: '"와룡(제갈량)과 봉추 중 하나만 얻어도 천하를 안정시킨다"던 그 봉추예요. 볼품없는 행색 탓에 유비에게 처음엔 말단 현령으로 밀려났지만, 밀린 정무를 반나절 만에 처리해 진가를 증명했습니다. 익주 공략의 밑그림을 그리고 상·중·하 세 가지 계책을 올린 실전형 전략가였죠. 낙성 공방전에서 서른여섯의 나이에 유시에 맞아 전사 — 유비는 그의 이름만 나와도 눈물을 흘렸다고 합니다.',
      ja: '「臥龍（諸葛亮）と鳳雛、どちらか一人を得れば天下を安んじられる」と言われたその鳳雛です。風采の上がらぬ身なりのせいで劉備には最初、末端の県令に回されましたが、溜まった政務を半日で片付けて真価を証明しました。益州攻略の青写真を描き、上・中・下の三策を献じた実戦型の戦略家です。雒城攻防戦で三十六歳のとき流れ矢に当たって戦死 — 劉備はその名が出るだけで涙を流したといいます。',
      en: 'The "Fledgling Phoenix" of the saying: win either him or the Sleeping Dragon and the realm is yours. His unimpressive looks got him shunted to a county post — until he cleared a backlog of cases in half a day. He drew the blueprint for the Yi Province campaign and famously offered his lord three plans, best to worst. A stray arrow killed him at Luocheng at thirty-six; ever after, Liu Bei wept at the mention of his name.',
    },
    imageDiff: {
      ko: '적벽의 연환계도, "낙봉파"라는 지명 복선도 연의의 창작이에요. 정사의 방통은 계책만이 아니라 인물평에 능한 형주 명사로, 제갈량과 나란히 군사중랑장을 지냈습니다.',
      ja: '赤壁の連環の計も、「落鳳坡」という地名の伏線も演義の創作です。正史の龐統は策だけでなく人物評に長けた荊州の名士で、諸葛亮と並んで軍師中郎将を務めました。',
      en: 'The chain-link ships at Red Cliffs and the ominous "Fallen Phoenix Slope" are both fiction. The historical Pang Tong was a celebrated judge of character who held the strategist-general post side by side with Zhuge Liang.',
    },
  },
  {
    id: 'fa-zheng', hanja: '法正', name: { ko: '법정', ja: '法正', en: 'Fa Zheng' },
    courtesy: { hanja: '孝直', read: { ko: '효직', ja: 'こうちょく', en: 'Xiaozhi' } },
    birth: '176', death: '220', faction: 'shu',
    factionNote: { ko: '유장 휘하에서 유비에게 내응', ja: '劉璋麾下から劉備に内応', en: 'Defected to Liu Bei from Liu Zhang’s service' },
    role: 'civil',
    intro: {
      ko: '유비의 익주·한중 시대를 설계한 제일 참모예요. 유장의 홀대에 실망해 유비를 익주로 끌어들이는 내응의 주역이 되었고, 이후 정군산에서 하후연을 잡는 계책을 지휘했습니다. 유비가 조조와 대치하다 화살비 속에서 물러서지 않자 몸으로 앞을 막아 퇴각시킨 일화가 남아 있죠. 제갈량조차 "법정이 살아 있었다면 이릉 원정을 막았거나, 가더라도 지지 않았을 것"이라 탄식했을 만큼, 유비가 가장 아낀 책사였습니다.',
      ja: '劉備の益州・漢中時代を設計した第一の参謀です。劉璋の冷遇に失望して劉備を益州に引き入れる内応の主役となり、その後、定軍山で夏侯淵を討つ策を指揮しました。劉備が曹操と対峙して矢の雨の中でも退かなかったとき、身をもって前を塞ぎ退却させた逸話が残ります。諸葛亮でさえ「法正が生きていれば夷陵遠征を止めたか、行っても負けなかっただろう」と嘆いたほど、劉備が最も寵愛した策士でした。',
      en: 'The chief architect of Liu Bei’s Yi Province and Hanzhong years. Slighted by Liu Zhang, he masterminded the defection that handed Liu Bei the province, then directed the stratagem that killed Xiahou Yuan at Dingjun. When Liu Bei refused to retreat under a rain of arrows, Fa Zheng stepped in front of him bodily until he withdrew. Even Zhuge Liang sighed that a living Fa Zheng would have stopped the Yiling campaign — or won it.',
    },
    imageDiff: {
      ko: '연의에서는 존재감이 옅지만, 정사에서는 "기이한 계책에 능해 곽가에 비견된다"는 평을 받은 촉의 두뇌예요. 은원이 분명해 사적인 원한을 갚기도 했다는 흠까지 함께 기록된, 입체적인 인물입니다.',
      ja: '演義では存在感が薄いものの、正史では「奇策に長け、郭嘉に比せられる」と評された蜀の頭脳です。恩讐に潔癖で私怨を晴らしたこともあるという欠点まで併せて記録された、立体的な人物です。',
      en: 'Faint in the novel, but in the histories the brain of Shu — "a master of the unexpected, comparable to Guo Jia." The record even preserves his flaw: he repaid old grudges as faithfully as old debts.',
    },
  },
  {
    id: 'wei-yan', hanja: '魏延', name: { ko: '위연', ja: '魏延', en: 'Wei Yan' },
    courtesy: { hanja: '文長', read: { ko: '문장', ja: 'ぶんちょう', en: 'Wenchang' } },
    birth: '?', death: '234', faction: 'shu', role: 'military',
    intro: {
      ko: '부곡(사병) 출신에서 한중 태수까지 발탁된 촉의 맹장이에요. 모두가 장비를 예상한 한중 수비 인선에서 유비가 위연을 지목하자 전군이 놀랐다는 기록이 남아 있습니다. "조조가 천하를 들어 와도 대왕을 위해 막아내겠다"는 취임 일성처럼 한중을 굳건히 지켰고, 북벌에서는 자오곡 기습책을 거듭 진언했죠. 제갈량 사후 철군 서열 다툼 끝에 반역자로 몰려 죽었지만, 정사는 그가 모반할 뜻은 없었다고 시사합니다.',
      ja: '部曲（私兵）出身から漢中太守まで抜擢された蜀の猛将です。誰もが張飛を予想した漢中守備の人選で劉備が魏延を指名し、全軍が驚いたという記録が残ります。「曹操が天下を挙げて来ようとも、大王のために防いでみせる」という就任の一声のとおり漢中を固く守り、北伐では子午谷奇襲策を繰り返し進言しました。諸葛亮の死後、撤退の序列争いの末に逆賊とされて死にましたが、正史は彼に謀反の意はなかったと示唆しています。',
      en: 'Risen from household troops to Governor of Hanzhong — a appointment everyone expected to go to Zhang Fei, leaving the army stunned. "Should Cao Cao come with the whole realm, I will hold him for my king," he vowed, and held it he did; in the northern campaigns he pressed again and again for his bold Ziwu Valley strike. After Zhuge Liang’s death he was destroyed in a power struggle and branded a traitor — a charge the histories quietly doubt.',
    },
    imageDiff: {
      ko: '"뒤통수에 반골이 있다"며 제갈량이 처음부터 경계했다는 설정은 연의의 창작이에요. 정사의 위연은 제갈량 북벌의 주력 사령관이었고, 그의 죽음은 반역이 아니라 양의와의 권력 다툼의 결과로 읽힙니다.',
      ja: '「後頭部に反骨の相がある」と諸葛亮が最初から警戒していたという設定は演義の創作です。正史の魏延は諸葛亮北伐の主力司令官であり、その死は謀反ではなく楊儀との権力闘争の結果として読まれています。',
      en: 'The "bone of rebellion in his skull" that made Zhuge Liang distrust him on sight is pure novel. The historical Wei Yan was the campaigns’ main field commander, and his death reads as a lost power struggle, not treason.',
    },
  },
  {
    id: 'jiang-wei', hanja: '姜維', name: { ko: '강유', ja: '姜維', en: 'Jiang Wei' },
    courtesy: { hanja: '伯約', read: { ko: '백약', ja: 'はくやく', en: 'Boyue' } },
    birth: '202', death: '264', faction: 'shu',
    factionNote: { ko: '위 장수 출신으로 1차 북벌 때 촉에 귀순', ja: '魏の将から第一次北伐の際に蜀へ帰順', en: 'A Wei officer who came over to Shu in the first campaign' },
    role: 'both',
    intro: {
      ko: '위나라 장수였다가 촉에 귀순해 제갈량의 유지를 이은 촉한 최후의 대들보예요. 제갈량이 "양주 최고의 인재"라 아꼈고, 그 사후 군권을 이어받아 아홉 차례가 넘는 북벌을 이끌었습니다. 촉이 항복한 뒤에도 포기하지 않고 위장 투항으로 부흥을 꾀하다 난전 속에 최후를 맞았죠. "한 번의 계책으로 세 영웅을 죽였다"는 평처럼, 마지막까지 판을 흔든 집념의 화신입니다.',
      ja: '魏の将から蜀に帰順し、諸葛亮の遺志を継いだ蜀漢最後の大黒柱です。諸葛亮が「涼州随一の人材」と寵愛し、その死後は軍権を受け継いで九度を超える北伐を率いました。蜀が降伏した後も諦めず、偽装投降で復興を図り、乱戦の中で最期を迎えます。「一計をもって三賢を殺した」と評されるように、最後まで盤面を揺さぶった執念の化身です。',
      en: 'The Wei officer who crossed to Shu and inherited Zhuge Liang’s mission — the last pillar of the kingdom. Prized by Zhuge Liang as the finest talent of Liangzhou, he took command after his mentor’s death and led more than nine northern campaigns. Even after Shu surrendered he would not stop, staging a false defection to resurrect the state before dying in the chaos. His final scheme, men said, killed three heroes with one stroke.',
    },
    imageDiff: {
      ko: '연의는 제갈량과의 일기토·계승 서사를 사제 관계로 극화했어요. 정사의 강유는 국력을 소모시켰다는 당대의 비판과, 망국 후에도 충절을 다한 지사라는 평가가 공존하는 논쟁적 인물입니다.',
      ja: '演義は諸葛亮との一騎打ちや継承の物語を師弟関係として脚色しました。正史の姜維は、国力を消耗させたという当時の批判と、亡国後も忠節を尽くした志士という評価が共存する論争的な人物です。',
      en: 'The novel dramatizes a master-disciple bond complete with a duel. In the histories he is contested ground: criticized in his own day for bleeding the state dry, honored ever after for loyalty that outlived the kingdom itself.',
    },
  },
  {
    id: 'ma-su', hanja: '馬謖', name: { ko: '마속', ja: '馬謖', en: 'Ma Su' },
    courtesy: { hanja: '幼常', read: { ko: '유상', ja: 'ようじょう', en: 'Youchang' } },
    birth: '190', death: '228', faction: 'shu', role: 'civil',
    intro: {
      ko: '병법 토론이라면 밤을 새우던 수재이자, 읍참마속 고사의 그 마속이에요. 남만 정벌 때 "성을 치지 말고 마음을 치라"는 명언으로 칠종칠금 전략의 이론적 토대를 제공했습니다. 그러나 가정 전투에서 물가에 진을 치라는 지시를 어기고 산에 올랐다가 참패, 1차 북벌 전체를 무너뜨렸죠. 유비가 임종 때 "말이 실제보다 앞서니 크게 쓰지 말라"고 경고했던 그대로였습니다. 재능과 실전의 간극을 보여주는 영원한 반면교사예요.',
      ja: '兵法談義なら夜を明かした秀才であり、「泣いて馬謖を斬る」の故事のその馬謖です。南蛮平定の際は「城を攻めず心を攻めよ」の名言で七縦七擒戦略の理論的土台を提供しました。しかし街亭の戦いで水場に布陣せよという指示に背いて山に登り、惨敗。第一次北伐全体を崩壊させます。劉備が臨終の際「言葉が実際に過ぎる。重用するな」と警告したとおりでした。才能と実戦の間隙を示す永遠の反面教師です。',
      en: 'The brilliant theorist who could debate strategy till dawn — and the Ma Su of the famous tearful execution. His maxim for the southern campaign, "attack hearts, not cities," underpinned the seven-captures strategy. But at Jieting he defied orders, camped on the hill instead of by the water, and was routed — collapsing the entire first campaign. Exactly as the dying Liu Bei had warned: "his words outrun his substance." The eternal cautionary tale of talent without the test of battle.',
    },
    imageDiff: {
      ko: '정사에서도 연의에서도 가정의 패장이라는 골격은 같아요. 다만 최후는 기록마다 갈립니다 — 처형됐다는 기록과 옥사했다는 기록이 병존하고, 연의는 처형 장면을 극대화했습니다.',
      ja: '正史でも演義でも街亭の敗将という骨格は同じです。ただ最期は記録によって分かれます — 処刑されたという記録と獄死したという記録が併存し、演義は処刑場面を最大化しました。',
      en: 'Novel and history agree on the defeat; they diverge on the end. Some records say execution, others death in prison — the novel, naturally, chose the scaffold and turned up the volume.',
    },
  },
  {
    id: 'ma-liang', hanja: '馬良', name: { ko: '마량', ja: '馬良', en: 'Ma Liang' },
    courtesy: { hanja: '季常', read: { ko: '계상', ja: 'きじょう', en: 'Jichang' } },
    birth: '187', death: '222', faction: 'shu', role: 'civil',
    intro: {
      ko: '"마씨 오상 중 백미가 으뜸" — 고사성어 백미의 주인공이에요. 흰 눈썹이 섞인 외모만큼이나 형제 중 재주가 단연 뛰어났고, 유비의 형주 통치를 안정시킨 문관이었습니다. 제갈량과는 형제의 의를 맺었다고 할 만큼 가까웠고, 오에 사신으로 가서는 손권의 존중을 받아냈죠. 이릉 원정에 종군해 남방 이민족을 회유하는 성과를 올렸지만, 대패의 와중에 목숨을 잃었습니다. 동생 마속과 대비되는, 말보다 실질이 앞선 인재였어요.',
      ja: '「馬氏の五常、白眉もっとも良し」 — 故事成語・白眉の主人公です。白い眉の混じった容貌と同じく兄弟の中で才が抜きん出ており、劉備の荊州統治を安定させた文官でした。諸葛亮とは兄弟の義を結んだと言われるほど親しく、呉への使者としては孫権の敬意を勝ち取りました。夷陵遠征に従軍して南方異民族の懐柔に成果を上げましたが、大敗の中で命を落とします。弟の馬謖と対照的な、言葉より実質が先立つ人材でした。',
      en: 'The hero of the idiom "white eyebrows" — finest of the five Ma brothers. The white-flecked brows marked the family’s standout talent, a civil official who steadied Liu Bei’s rule over Jing Province. Close enough to Zhuge Liang to address him as a brother, he won Sun Quan’s respect as an envoy and rallied the southern tribes during the Yiling campaign — where he died in the great defeat. Unlike his brother Ma Su, his substance always outran his words.',
    },
    imageDiff: {
      ko: '연의와 정사의 상이 거의 같은 인물이에요. 조용한 행정가형이라 극적 각색의 여지가 없었고, 그의 이름은 성어 백미와 함께 기억됩니다.',
      ja: '演義と正史の像がほぼ同じ人物です。物静かな行政家タイプで劇的脚色の余地がなく、その名は成語・白眉とともに記憶されています。',
      en: 'One of the rare figures novel and history portray identically — a quiet administrator with nothing to dramatize, remembered forever through the idiom he inspired.',
    },
  },
  {
    id: 'liu-shan', hanja: '劉禪', name: { ko: '유선', ja: '劉禅', en: 'Liu Shan' },
    courtesy: { hanja: '公嗣', read: { ko: '공사', ja: 'こうし', en: 'Gongsi' } },
    birth: '207', death: '271', faction: 'shu', role: 'other',
    intro: {
      ko: '장판파에서 조운의 품에 안겨 구출된 아두, 촉한의 2대이자 마지막 황제예요. 제갈량 생전에는 "정사는 승상에게" 맡기는 전폭 위임으로 나라가 안정됐고, 그 사후로도 30년을 더 재위해 삼국 군주 중 최장 기록을 세웠습니다. 위군이 성도에 육박하자 항복을 택해 백성의 희생을 줄였고, 낙양에서 "이곳이 즐거워 촉 생각이 안 난다(낙불사촉)"는 대답으로 천수를 누렸죠. 암군인가 생존의 달인인가 — 평가가 가장 크게 갈리는 군주입니다.',
      ja: '長坂で趙雲の懐に抱かれて救出された阿斗、蜀漢の二代目にして最後の皇帝です。諸葛亮の生前は「政は丞相に」と全面委任して国が安定し、その死後も30年在位して三国の君主中最長記録を立てました。魏軍が成都に迫ると降伏を選んで民の犠牲を減らし、洛陽では「ここが楽しくて蜀を思わない（楽不思蜀）」の答えで天寿を全うします。暗君か、生存の達人か — 評価が最も大きく分かれる君主です。',
      en: 'The infant A-Dou carried from Changban in Zhao Yun’s arms — second and last emperor of Shu-Han. By delegating everything to Zhuge Liang he kept the state stable, then reigned thirty more years after the chancellor’s death, longest of any Three Kingdoms sovereign. With Wei at the gates of Chengdu he chose surrender and spared his people; in Luoyang, his cheerful "I’m too happy here to miss Shu" bought him a peaceful old age. Fool, or master survivor? No verdict divides opinion more.',
    },
    imageDiff: {
      ko: '"아두 같은 놈"이라는 무능의 대명사는 연의가 굳힌 이미지예요. 근래에는 제갈량에게 전권을 맡긴 통치 감각과 항복·낙불사촉을 난세의 생존술로 재평가하는 시각도 만만치 않습니다.',
      ja: '「阿斗のような奴」という無能の代名詞は演義が固めたイメージです。近年は諸葛亮に全権を委ねた統治感覚と、降伏・楽不思蜀を乱世の生存術として再評価する視点も少なくありません。',
      en: 'His name as a byword for uselessness is largely the novel’s doing. Modern readers increasingly see shrewdness instead: total delegation to a genius chancellor, and surrender-plus-contentment as survival craft in a murderous age.',
    },
  },
  {
    id: 'wang-ping', hanja: '王平', name: { ko: '왕평', ja: '王平', en: 'Wang Ping' },
    courtesy: { hanja: '子均', read: { ko: '자균', ja: 'しきん', en: 'Zijun' } },
    birth: '?', death: '248', faction: 'shu',
    factionNote: { ko: '위군에서 한중 전투 때 촉으로 귀순', ja: '魏軍から漢中の戦いの際に蜀へ帰順', en: 'Came over from Wei during the Hanzhong campaign' },
    role: 'military',
    intro: {
      ko: '글은 열 자도 채 못 읽었지만 병법의 요체를 꿰뚫었던 실전형 명장이에요. 가정에서 마속의 포진에 홀로 반대했고, 참패 속에서도 자기 부대만은 온전히 거두어 돌아왔습니다. 이 공으로 발탁된 뒤 위연의 반란 진압, 그리고 흥세에서 위의 대군을 지형으로 막아낸 방어전까지 — 맡긴 곳은 뚫리지 않았죠. 무학(無學)의 명장이라는 별명이 그의 실력을 더 돋보이게 합니다.',
      ja: '字は十もろくに読めなかったが兵法の要諦を見抜いていた実戦型の名将です。街亭では馬謖の布陣に一人反対し、惨敗の中でも自分の部隊だけは無傷でまとめて帰還しました。この功で抜擢された後、魏延の乱の鎮圧、そして興勢で魏の大軍を地形で防ぎ切った防衛戦まで — 任された場所は破られませんでした。無学の名将という異名が、その実力をいっそう際立たせます。',
      en: 'Barely able to read ten characters, yet he grasped the essence of war better than the theorists. Alone in opposing Ma Su’s deployment at Jieting, he brought his own unit home intact from the disaster. Promotion followed: he helped put down Wei Yan’s revolt, then repelled Wei’s massive invasion at Xingshi with terrain and nerve. Wherever the unlettered general stood, the line held.',
    },
    imageDiff: {
      ko: '연의에서는 조연에 머물지만, 정사는 그를 가정의 유일한 승자이자 촉 후기 방어전의 핵심으로 기록해요. 마속의 이론과 왕평의 실전 감각의 대비는 정사가 만든 구도입니다.',
      ja: '演義では脇役にとどまりますが、正史は彼を街亭の唯一の勝者であり、蜀後期の防衛戦の要として記録しています。馬謖の理論と王平の実戦感覚の対比は、正史が作った構図です。',
      en: 'A bit player in the novel, but the histories crown him the only winner at Jieting and the anchor of Shu’s later defenses. The theorist Ma Su versus the veteran Wang Ping is history’s own framing.',
    },
  },
  {
    id: 'xu-shu', hanja: '徐庶', name: { ko: '서서', ja: '徐庶', en: 'Xu Shu' },
    courtesy: { hanja: '元直', read: { ko: '원직', ja: 'げんちょく', en: 'Yuanzhi' } },
    birth: '?', death: '?', faction: 'shu',
    factionNote: { ko: '유비의 참모였으나 모친 때문에 위로', ja: '劉備の参謀だったが母のために魏へ', en: 'Liu Bei’s adviser, forced to Wei for his mother’s sake' },
    role: 'civil',
    intro: {
      ko: '젊어서는 검객이었다가 학문으로 전향한 이색 경력의 책사예요. 신야 시절 유비의 참모가 되어 처음으로 "제대로 된 두뇌"를 선물했고, 조조군에 어머니가 억류되자 눈물로 떠나며 제갈량을 천거했습니다. "이 사람은 저와 비교할 수준이 아닙니다"라는 그 추천이 삼고초려의 시작이었죠. 위에서 벼슬을 지냈지만 큰 자리에 오르지 못했고, 제갈량이 북벌 중 그 소식에 "위는 인재가 그리 많은가"라며 탄식했다고 전합니다.',
      ja: '若い頃は剣客で、学問に転向した異色の経歴の策士です。新野時代に劉備の参謀となり、初めて「本物の頭脳」を贈りました。曹操軍に母を抑留されると涙ながらに去り、諸葛亮を推挙します。「彼は私と比べられる水準ではありません」というその推薦が三顧の礼の始まりでした。魏で官職に就きましたが高位には上れず、諸葛亮が北伐中にその消息を聞いて「魏はそれほど人材が多いのか」と嘆いたと伝わります。',
      en: 'A swordsman turned scholar — Liu Bei’s first real strategist in the Xinye days. When Cao Cao’s side took his mother, he left in tears, but not before recommending his replacement: "He is beyond any comparison with me." That recommendation set the three visits in motion. In Wei he held office but never rose high; hearing of it years later, Zhuge Liang sighed, "Has Wei so many talents that Xu Shu goes unused?"',
    },
    imageDiff: {
      ko: '어머니의 가짜 편지, 어머니의 자결, "위를 위해 한 계책도 내지 않았다"는 서약은 모두 연의의 각색이에요. 정사에서는 장판 패주 중 어머니가 포로가 되자 스스로 조조에게 간 것으로 기록됩니다.',
      ja: '母の偽手紙、母の自決、「魏のために一策も出さない」という誓いはすべて演義の脚色です。正史では長坂の敗走中に母が捕虜となり、自ら曹操のもとへ赴いたと記録されています。',
      en: 'The forged letter, the mother’s suicide, the vow never to devise a single plan for Wei — all the novel’s. In the histories, his mother was captured in the rout at Changban, and he simply chose to follow her.',
    },
  },
]
