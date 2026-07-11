// 삼국지 인물 사전 데이터 4/4 — 후한 조정·군벌·기타 14명.
import type { TKChar } from './threeKingdomsCharacters'

export const CHARS_OTHER: TKChar[] = [
  {
    id: 'dong-zhuo', hanja: '董卓', name: { ko: '동탁', ja: '董卓', en: 'Dong Zhuo' },
    courtesy: { hanja: '仲穎', read: { ko: '중영', ja: 'ちゅうえい', en: 'Zhongying' } },
    birth: '?', death: '192', faction: 'other', role: 'military',
    intro: {
      ko: '십상시의 난으로 비어버린 낙양에 서량 군단을 이끌고 들어와 조정을 통째로 장악한 폭군이에요. 소제를 폐하고 헌제를 세웠으며, 반동탁 연합이 일어나자 낙양을 불태우고 장안으로 천도했습니다. 그 폭정은 후한이라는 낡은 질서가 무너지는 결정적 방아쇠가 되었죠. 양아들로 삼았던 여포의 손에 최후를 맞았고, 시신마저 저잣거리에 버려졌다고 전합니다. 난세의 문을 연 장본인입니다.',
      ja: '十常侍の乱で空白となった洛陽に西涼軍団を率いて入り、朝廷を丸ごと掌握した暴君です。少帝を廃して献帝を立て、反董卓連合が起こると洛陽を焼き払って長安に遷都しました。その暴政は後漢という古い秩序が崩れる決定的な引き金となります。養子とした呂布の手にかかって最期を迎え、遺体さえ市中に晒されたと伝わります。乱世の扉を開けた張本人です。',
      en: 'The tyrant who marched his Xiliang legions into a power-vacuum Luoyang and swallowed the court whole. He deposed one boy emperor, installed another, and — when the coalition rose against him — burned Luoyang and dragged the capital to Chang’an. His despotism was the trigger that brought the old Han order down. He died at the hands of Lü Bu, his own adopted son, his corpse dumped in the marketplace. The man who opened the gates of chaos.',
    },
    imageDiff: {
      ko: '연의도 정사도 폭군이라는 평가는 같지만, 초선을 사이에 둔 여포와의 삼각관계는 연의의 창작이에요. 정사의 암살 동기는 사소한 원한과 왕윤의 정치 공작이 결합한 것이었습니다.',
      ja: '演義でも正史でも暴君という評価は同じですが、貂蟬を挟んだ呂布との三角関係は演義の創作です。正史の暗殺の動機は、些細な怨恨と王允の政治工作が結びついたものでした。',
      en: 'Novel and history agree on the tyrant; the love triangle over Diao Chan is fiction. The real assassination mixed a petty grudge with Wang Yun’s political engineering.',
    },
  },
  {
    id: 'lv-bu', hanja: '呂布', name: { ko: '여포', ja: '呂布', en: 'Lü Bu' },
    courtesy: { hanja: '奉先', read: { ko: '봉선', ja: 'ほうせん', en: 'Fengxian' } },
    birth: '?', death: '199', faction: 'other',
    factionNote: { ko: '정원 → 동탁 → 독립 군벌', ja: '丁原 → 董卓 → 独立軍閥', en: 'Ding Yuan → Dong Zhuo → independent warlord' },
    role: 'military',
    intro: {
      ko: '"사람 중엔 여포, 말 중엔 적토"라는 말 그대로 당대 최강의 무인이에요. 활과 말타기에 능해 비장(飛將)이라 불렸고, 원소 밑에서 싸울 때는 흑산적 진영을 하루 서너 번씩 드나들며 휘저었습니다. 그러나 정원과 동탁, 두 주군을 제 손으로 벤 이력이 평생의 족쇄가 되었죠. 조조와 연주를 다투고 유비의 서주를 빼앗으며 독립 군벌로 버텼지만, 하비에서 부하들의 배신으로 사로잡혀 처형됐습니다. 원술군을 활 솜씨 하나로 물린 원문사극 일화가 그의 진면목이에요.',
      ja: '「人中の呂布、馬中の赤兎」の言葉どおり、当代最強の武人です。弓と馬術に長けて飛将と呼ばれ、袁紹の下で戦った際は黒山賊の陣営を日に三、四度出入りしてかき回しました。しかし丁原と董卓、二人の主君を自らの手で斬った経歴が生涯の足枷となります。曹操と兗州を争い、劉備の徐州を奪って独立軍閥として持ちこたえましたが、下邳で部下の裏切りにより捕らえられ処刑されました。袁術軍を弓の腕一つで退けた轅門射戟の逸話が彼の真骨頂です。',
      en: 'The mightiest warrior of the age — "among men, Lü Bu; among horses, Red Hare." A flying general with bow and horse, he once raided a bandit camp three and four times a day. But killing two successive patrons, Ding Yuan and Dong Zhuo, chained his reputation forever. He fought Cao Cao for Yan Province, snatched Xuzhou from Liu Bei, and held out as an independent warlord until his own officers sold him at Xiapi. The gate-halberd shot that stopped a war with a single arrow shows what he was at his best.',
    },
    imageDiff: {
      ko: '적토마와 방천화극, 그리고 초선과의 로맨스로 완성된 "삼국지 최강 캐릭터"는 연의의 연출이에요. 정사의 여포는 무력만큼이나 우유부단하고 귀가 얇았다고 기록되며, 최후에 조조를 향해 "천하를 평정할 수 있다"고 자신을 팔려 한 장면까지 남아 있습니다.',
      ja: '赤兎馬と方天画戟、そして貂蟬とのロマンスで完成された「三国志最強キャラ」は演義の演出です。正史の呂布は武力に劣らず優柔不断で耳が軽かったと記録され、最期に曹操へ「天下を平定できる」と自らを売り込もうとした場面まで残っています。',
      en: 'Red Hare, the crescent halberd, the romance with Diao Chan — the "strongest character" package is the novel’s stagecraft. The histories record a man as irresolute as he was invincible, who at the end even tried to sell his services to Cao Cao: "with me, you could pacify the realm."',
    },
  },
  {
    id: 'yuan-shao', hanja: '袁紹', name: { ko: '원소', ja: '袁紹', en: 'Yuan Shao' },
    courtesy: { hanja: '本初', read: { ko: '본초', ja: 'ほんしょ', en: 'Benchu' } },
    birth: '?', death: '202', faction: 'other', role: 'both',
    intro: {
      ko: '4대에 걸쳐 삼공을 배출한 최고 명문 "사세삼공" 원가의 수장이자, 한때 천하에 가장 가까웠던 남자예요. 반동탁 연합의 맹주로 추대되었고, 이후 하북 4주를 손에 넣어 최대 세력을 이뤘습니다. 그러나 관도에서 몇 배 적은 조조에게 참패하며 대세가 뒤집혔죠. 정사는 "겉은 관대하나 속으로 시기하고, 꾀하기는 좋아하나 결단이 없다"고 그 패인을 요약했습니다. 사후 아들들의 내분으로 거대한 유산마저 흩어졌어요.',
      ja: '四代にわたり三公を輩出した最高の名門「四世三公」袁家の当主であり、一時は天下に最も近かった男です。反董卓連合の盟主に推され、その後河北四州を手にして最大勢力を築きました。しかし官渡で数倍少ない曹操に惨敗し、大勢が覆ります。正史は「外は寛大だが内は猜疑深く、謀を好むが決断がない」とその敗因を要約しました。死後は息子たちの内紛で巨大な遺産まで霧散しました。',
      en: 'Head of the grandest house in the empire — "three Excellencies in four generations" — and once the man closest to the throne of all. Elected leader of the coalition, he went on to hold four northern provinces, the largest power bloc of the age. Then Guandu: routed by a Cao Cao several times smaller. The histories give the epitaph: "outwardly generous, inwardly jealous; fond of scheming, incapable of deciding." His sons’ feud scattered even the wreckage.',
    },
    imageDiff: {
      ko: '연의의 원소는 조조의 위대함을 증명하기 위한 우유부단의 표본으로 단순화됐어요. 정사의 원소는 명사층의 신망을 한 몸에 받고 하북을 안정 통치한 거물로, 그가 죽자 백성이 통곡했다는 기록도 있습니다.',
      ja: '演義の袁紹は曹操の偉大さを証明するための優柔不断の見本に単純化されました。正史の袁紹は名士層の信望を一身に集め、河北を安定統治した大物で、彼が死ぬと民が慟哭したという記録もあります。',
      en: 'The novel flattens him into an indecision exhibit proving Cao Cao’s genius. The historical Yuan Shao commanded the gentry’s devotion and governed the north well — the record even notes the common people weeping at his death.',
    },
  },
  {
    id: 'yuan-shu', hanja: '袁術', name: { ko: '원술', ja: '袁術', en: 'Yuan Shu' },
    courtesy: { hanja: '公路', read: { ko: '공로', ja: 'こうろ', en: 'Gonglu' } },
    birth: '?', death: '199', faction: 'other', role: 'civil',
    intro: {
      ko: '원소의 사촌 형제이자 명문 원가의 적통을 자부한 군벌이에요. 한때 회남 일대에서 손꼽히는 세력을 자랑했고, 손견·손책 부자를 휘하에 두기도 했습니다. 옥새를 손에 넣자 천명이 자기에게 왔다며 197년 스스로 황제를 칭했죠. 그러나 이 참칭은 모든 세력을 적으로 돌리는 자충수였고, 사치와 가렴주구로 민심마저 잃어 2년 만에 몰락했습니다. 꿀물 한 잔을 찾다 피를 토하고 죽었다는 최후가 그 허영의 마침표예요.',
      ja: '袁紹の従兄弟であり、名門袁家の嫡流を自負した軍閥です。一時は淮南一帯で指折りの勢力を誇り、孫堅・孫策父子を麾下に置いたこともありました。玉璽を手に入れると天命が己に来たとして、197年に自ら皇帝を称します。しかしこの僭称はすべての勢力を敵に回す自滅の一手であり、奢侈と苛斂誅求で民心まで失って2年で没落しました。蜂蜜水一杯を求めて血を吐いて死んだという最期が、その虚栄の句点です。',
      en: 'Yuan Shao’s cousin, who considered himself the true heir of the great Yuan house. He once ruled a formidable domain in Huainan with the Sun clan among his vassals — then the Imperial Seal fell into his hands, and in 197 he declared himself Son of Heaven. The pretension united everyone against him; extravagance and extortion did the rest, and he collapsed within two years. He died coughing blood after calling, in vain, for a cup of honeyed water — vanity’s perfect epitaph.',
    },
    imageDiff: {
      ko: '연의와 정사의 상이 거의 일치하는 반면교사형 인물이에요. 다만 정사는 그의 초기 세력이 원소를 압도할 뻔했던 시기가 있었음을 함께 보여줘, 단순한 어릿광대만은 아니었음을 알 수 있습니다.',
      ja: '演義と正史の像がほぼ一致する反面教師型の人物です。ただ正史は、初期の勢力が袁紹を圧倒しかけた時期があったことも併せて示しており、単なる道化ではなかったことがわかります。',
      en: 'One figure novel and history agree on almost entirely. Yet the record also shows his early power once nearly eclipsed Yuan Shao’s — he was more than the clown of the story.',
    },
  },
  {
    id: 'liu-biao', hanja: '劉表', name: { ko: '유표', ja: '劉表', en: 'Liu Biao' },
    courtesy: { hanja: '景升', read: { ko: '경승', ja: 'けいしょう', en: 'Jingsheng' } },
    birth: '142', death: '208', faction: 'other', role: 'civil',
    intro: {
      ko: '단기로 형주에 부임해 호족들을 규합, 20년 가까이 형주를 전란 밖의 안전지대로 지켜낸 학자형 군주예요. "팔준(八俊)"에 꼽힌 명사 출신답게 학교를 세우고 학자를 모아, 전란을 피한 인재들이 형주로 몰려들었습니다. 유비를 받아들여 신야에 두었지만 중용도 견제도 아닌 어정쩡한 관계를 유지했죠. 조조의 남정 직전에 병사했고, 뒤를 이은 아들이 곧바로 항복하며 그의 형주는 역사의 격류에 휩쓸렸습니다.',
      ja: '単騎で荊州に赴任して豪族を糾合し、20年近く荊州を戦乱の外の安全地帯として守り抜いた学者型の君主です。「八俊」に数えられた名士の出身らしく学校を建てて学者を集め、戦乱を避けた人材が荊州に集まりました。劉備を受け入れて新野に置きましたが、重用でも牽制でもない中途半端な関係を保ちます。曹操の南征直前に病死し、跡を継いだ息子がすぐに降伏して、その荊州は歴史の激流に呑まれました。',
      en: 'The scholar-lord who rode into Jing Province alone, won over its clans, and kept it a haven from the wars for nearly twenty years. A famed literatus of the "Eight Paragons," he built schools and gathered scholars until refugees of talent streamed south. He sheltered Liu Bei at Xinye — neither trusting nor discarding him. He died just before Cao Cao’s southern march; his heir surrendered at once, and his sanctuary was swept into the flood.',
    },
    imageDiff: {
      ko: '연의는 유비에게 형주를 물려주려 했다는 서사로 유비의 정통성을 보강해요. 정사의 유표는 "앉아서 지키는 재목(坐談客)"이라는 박한 평과 함께, 난세에 백성을 지킨 드문 통치자라는 재평가가 공존합니다.',
      ja: '演義は劉備に荊州を譲ろうとしたという物語で劉備の正統性を補強します。正史の劉表は「座して談ずる客」という辛い評とともに、乱世に民を守った稀な統治者という再評価が共存しています。',
      en: 'The novel has him offering Jing Province to Liu Bei, burnishing the hero’s legitimacy. History’s verdict is split: dismissed as an "armchair talker," yet increasingly honored as one of the few rulers who actually kept his people safe.',
    },
  },
  {
    id: 'gongsun-zan', hanja: '公孫瓚', name: { ko: '공손찬', ja: '公孫瓚', en: 'Gongsun Zan' },
    courtesy: { hanja: '伯珪', read: { ko: '백규', ja: 'はくけい', en: 'Bogui' } },
    birth: '?', death: '199', faction: 'other', role: 'military',
    intro: {
      ko: '백마 부대를 이끌고 북방 이민족을 위협해 "백마장군"이라 불린 변경의 맹장이에요. 오환·선비족과의 전투로 명성을 쌓았고, 한때 원소와 하북의 패권을 다투는 최대 라이벌이었습니다. 유비·조운이 젊은 시절 몸을 의탁했던 곳이 바로 그의 진영이죠. 그러나 계교 전투 이후 수세에 몰리자 역경에 거대한 요새를 쌓고 틀어박혔고, 포위망이 좁혀지자 가족과 함께 스스로 목숨을 끊었습니다.',
      ja: '白馬部隊を率いて北方異民族を威圧し、「白馬将軍」と呼ばれた辺境の猛将です。烏丸・鮮卑族との戦いで名声を築き、一時は袁紹と河北の覇権を争う最大のライバルでした。劉備・趙雲が若き日に身を寄せたのが彼の陣営です。しかし界橋の戦い以後、守勢に回ると易京に巨大な要塞を築いて閉じこもり、包囲網が狭まると家族とともに自ら命を絶ちました。',
      en: 'The "White Horse General" whose cavalry terrorized the northern tribes. Fame won on the frontier made him Yuan Shao’s chief rival for the north — and his camp was where the young Liu Bei and Zhao Yun first served. After the tide turned at Jieqiao he walled himself into the vast fortress of Yijing, and when the siege closed in, he died by his own hand with his family.',
    },
    imageDiff: {
      ko: '연의에서는 유비의 은인이자 원소전의 조연으로 스치지만, 정사의 공손찬은 북방 국경을 지킨 실력자에서 폭정과 고립으로 자멸해 간 궤적이 상세히 기록된 입체적 군벌이에요.',
      ja: '演義では劉備の恩人であり袁紹戦の脇役として流されますが、正史の公孫瓚は北方国境を守った実力者から暴政と孤立で自滅していく軌跡が詳細に記録された立体的な軍閥です。',
      en: 'A passing benefactor of Liu Bei in the novel; in the histories, a fully drawn tragedy — the frontier hero who curdled into tyranny and isolation until he destroyed himself.',
    },
  },
  {
    id: 'ma-teng', hanja: '馬騰', name: { ko: '마등', ja: '馬騰', en: 'Ma Teng' },
    courtesy: { hanja: '壽成', read: { ko: '수성', ja: 'じゅせい', en: 'Shoucheng' } },
    birth: '?', death: '212', faction: 'other', role: 'military',
    intro: {
      ko: '후한 명장 마원의 후예로 서량에 뿌리내린 군벌이자 마초의 아버지예요. 젊어서는 나무꾼을 할 만큼 가난했지만 체격과 인품으로 군에서 몸을 일으켰습니다. 한수와 의형제를 맺었다 원수가 되기를 반복하며 서량의 패권을 나눠 가졌죠. 만년에 조정의 부름을 받아 위위 벼슬로 입조했지만, 아들 마초가 거병하자 삼족과 함께 처형되었습니다. 서량군의 위명은 아들에게 이어졌어요.',
      ja: '後漢の名将・馬援の後裔として西涼に根を下ろした軍閥であり、馬超の父です。若い頃は樵をするほど貧しかったものの、体格と人柄で軍から身を起こしました。韓遂と義兄弟の契りを結んでは仇敵になることを繰り返し、西涼の覇権を分け合います。晩年に朝廷の召しを受けて衛尉として入朝しましたが、息子の馬超が挙兵すると三族もろとも処刑されました。西涼軍の威名は息子に受け継がれます。',
      en: 'Descendant of the great Han general Ma Yuan, warlord of Xiliang, and father of Ma Chao. Born so poor he once cut firewood for a living, he rose through the ranks on stature and character, sharing — and disputing — the northwest with his sworn brother Han Sui for decades. Summoned to court in his later years, he was executed with his clan when Ma Chao rose in revolt. The dread of the Xiliang cavalry passed to his son.',
    },
    imageDiff: {
      ko: '연의는 마등을 조조 암살 의거(의대조)에 가담한 충신으로 그려 마초 거병에 복수의 명분을 만들어 줬어요. 정사의 순서는 반대로, 마초의 거병이 먼저고 마등의 처형이 그 결과입니다.',
      ja: '演義は馬騰を曹操暗殺の義挙（衣帯詔）に加わった忠臣として描き、馬超の挙兵に復讐の大義名分を作りました。正史の順序は逆で、馬超の挙兵が先、馬騰の処刑がその結果です。',
      en: 'The novel enrolls him in the secret plot against Cao Cao, giving his son’s revolt the color of revenge. History runs backward from the legend: the son rebelled first, and the father paid for it.',
    },
  },
  {
    id: 'zhang-jiao', hanja: '張角', name: { ko: '장각', ja: '張角', en: 'Zhang Jiao' },
    birth: '?', death: '184', faction: 'other', role: 'other',
    intro: {
      ko: '"창천이사 황천당립(푸른 하늘은 죽었으니 누런 하늘이 서리라)" — 삼국시대의 문을 연 황건적의 난의 지도자예요. 부적과 물로 병을 고치는 태평도를 창시해 수십만 신도를 모았고, 184년 갑자년을 기해 전국 동시 봉기를 일으켰습니다. 후한 조정을 뿌리째 흔든 이 난은 각지의 군웅에게 병권을 쥐여 주었죠. 장각 자신은 봉기 그해에 병사했지만, 그가 연 혼란의 시대는 백 년 가까이 이어졌습니다.',
      ja: '「蒼天已に死す、黄天当に立つべし」 — 三国時代の扉を開けた黄巾の乱の指導者です。符と水で病を治す太平道を創始して数十万の信徒を集め、184年の甲子の年を期して全国同時蜂起を起こしました。後漢朝廷を根底から揺るがしたこの乱は、各地の群雄に兵権を握らせます。張角自身は蜂起のその年に病死しましたが、彼が開けた混乱の時代は百年近く続きました。',
      en: '"The Azure Heaven is dead; the Yellow Heaven shall rise" — the prophet of the Yellow Turban Rebellion that opened the era. His Taiping sect, healing with talismans and water, gathered hundreds of thousands, and in the jiazi year 184 he raised the whole empire at once. The revolt shook the Han to its roots and put armies into the hands of the future warlords. Zhang Jiao himself died of illness that same year — but the age of chaos he unleashed ran on for nearly a century.',
    },
    imageDiff: {
      ko: '연의는 그를 요술 부리는 반역의 요인(妖人)으로 그려요. 정사와 사회사 관점에서는 기근과 착취에 내몰린 유민을 조직한 종교 지도자로, 후한 붕괴의 증상이자 촉매로 평가됩니다.',
      ja: '演義は彼を妖術を使う反逆の妖人として描きます。正史と社会史の観点では、飢饉と搾取に追い込まれた流民を組織した宗教指導者であり、後漢崩壊の症状にして触媒と評価されます。',
      en: 'To the novel, a sorcerer-villain. To history, a faith healer who organized the starving and dispossessed — as much a symptom of the Han collapse as its catalyst.',
    },
  },
  {
    id: 'diao-chan', hanja: '貂蟬', name: { ko: '초선', ja: '貂蟬', en: 'Diao Chan' },
    birth: '?', death: '?', faction: 'han', role: 'other', fictional: true,
    intro: {
      ko: '중국 4대 미인에 꼽히지만, 정사에는 존재하지 않는 연의의 창작 인물이에요. 왕윤의 가기(歌妓)로서 동탁과 여포 사이를 오가는 연환계의 주인공이 되어, 천하를 쥔 폭군을 미소 하나로 무너뜨립니다. "달도 부끄러워 구름 뒤로 숨었다(폐월)"는 수식이 그녀의 것이죠. 정사에 여포가 동탁의 시비와 사통해 불안해했다는 짧은 기록이 있는데, 이 한 줄이 초선이라는 캐릭터의 씨앗으로 여겨집니다.',
      ja: '中国四大美人に数えられながら、正史には存在しない演義の創作人物です。王允の歌妓として董卓と呂布の間を行き来する連環の計の主人公となり、天下を握った暴君を微笑み一つで崩します。「月も恥じて雲の後ろに隠れた（閉月）」という形容が彼女のものです。正史には呂布が董卓の侍女と私通して不安がっていたという短い記録があり、この一行が貂蟬というキャラクターの種と考えられています。',
      en: 'Counted among China’s Four Great Beauties — yet she never existed in the histories: she is the novel’s invention. As Wang Yun’s singing girl she plays both Dong Zhuo and Lü Bu in the interlocking scheme, toppling a tyrant with a smile; hers is the epithet "so lovely the moon hid behind the clouds." The seed is a single line in the histories: Lü Bu’s uneasy affair with one of Dong Zhuo’s maids.',
    },
    imageDiff: {
      ko: '이 인물 자체가 정사/연의 구분의 대표 사례예요 — 페이지 전체가 "연의 창작" 배지 아래 있습니다. 실존하지 않지만, 동탁 정권을 무너뜨린 이간계의 서사적 화신으로서 삼국지 문화에서 지워질 수 없는 존재가 되었어요.',
      ja: 'この人物自体が正史/演義区分の代表例です — ページ全体が「演義の創作」バッジの下にあります。実在しませんが、董卓政権を倒した離間の計の物語的化身として、三国志文化から消せない存在になりました。',
      en: 'She is herself the textbook case of the history/novel divide — this entire page sits under the "novel invention" badge. Unreal, yet indelible: the narrative embodiment of the scheme that brought Dong Zhuo down.',
    },
  },
  {
    id: 'xian-di', hanja: '獻帝', name: { ko: '헌제', ja: '献帝', en: 'Emperor Xian' },
    birth: '181', death: '234', faction: 'han', role: 'other',
    intro: {
      ko: '후한의 마지막 황제 유협이에요. 아홉 살에 동탁의 손으로 옹립된 뒤, 이각·곽사의 난 속에 장안을 탈출하는 유랑 끝에 조조의 허도에 안착했습니다. 이후 30년 가까이 "천자를 낀" 조조 패권의 간판이 되었죠. 몇 차례 측근을 통해 조조 제거를 꾀했지만 모두 실패했고, 220년 조비에게 선양하며 400년 한 왕조의 마지막 장을 닫았습니다. 폐위 후에는 산양공으로 천수를 누렸어요.',
      ja: '後漢最後の皇帝・劉協です。九歳で董卓の手により擁立された後、李傕・郭汜の乱の中で長安を脱出する流浪の末、曹操の許都に落ち着きました。以後30年近く「天子を擁する」曹操覇権の看板となります。数度、側近を通じて曹操排除を図りましたが全て失敗し、220年に曹丕へ禅譲して400年の漢王朝の最後の章を閉じました。廃位後は山陽公として天寿を全うします。',
      en: 'Liu Xie, last emperor of the Han. Enthroned at nine by Dong Zhuo, he escaped the chaos of Chang’an in a wandering court until Cao Cao installed him at Xudu — where for thirty years he served as the living banner of another man’s hegemony. His covert plots against Cao Cao all failed; in 220 he abdicated to Cao Pi, closing four hundred years of Han. As Duke of Shanyang, he was permitted, at least, to die of old age.',
    },
    imageDiff: {
      ko: '연의는 의대조(옷띠 속 밀조) 사건을 크게 다뤄 비운의 황제상을 강조해요. 정사의 헌제는 무력한 상징만은 아니어서, 유랑 조정을 지탱하고 선양 후에도 품위를 지킨 기록이 남아 있습니다.',
      ja: '演義は衣帯詔（衣の帯の中の密詔）事件を大きく扱い、悲運の皇帝像を強調します。正史の献帝は無力な象徴だけではなく、流浪の朝廷を支え、禅譲後も品位を保った記録が残っています。',
      en: 'The novel leans on the secret edict in the girdle to paint the tragic puppet. The historical Xian was not merely a symbol: he held a wandering court together, and carried his dignity even past the abdication.',
    },
  },
  {
    id: 'he-jin', hanja: '何進', name: { ko: '하진', ja: '何進', en: 'He Jin' },
    courtesy: { hanja: '遂高', read: { ko: '수고', ja: 'すいこう', en: 'Suigao' } },
    birth: '?', death: '189', faction: 'han', role: 'military',
    intro: {
      ko: '백정 집안에서 여동생이 황후가 되며 대장군까지 오른 후한 말의 외척 권력자예요. 황건적의 난 때 수도 방위를 총괄하며 권력의 정점에 섰습니다. 영제 사후 환관 세력과의 대결에서 원소의 진언을 받아들여 동탁 등 지방군을 수도로 불러들이는 악수를 두었죠. 결단을 미루다 도리어 환관들에게 궁중에서 살해당했고, 그가 부른 동탁이 낙양을 삼키며 난세가 본격화됐습니다.',
      ja: '肉屋の家から妹が皇后になったことで大将軍まで上った後漢末の外戚権力者です。黄巾の乱の際は首都防衛を統括して権力の頂点に立ちました。霊帝の死後、宦官勢力との対決で袁紹の進言を容れ、董卓ら地方軍を都に呼び込む悪手を打ちます。決断を先延ばしにした挙げ句、逆に宦官たちに宮中で殺害され、彼が呼んだ董卓が洛陽を呑み込んで乱世が本格化しました。',
      en: 'The butcher’s son who became Grand General when his sister was made empress. Commanding the capital’s defense during the Yellow Turban crisis, he stood at the summit of power — then, in his showdown with the eunuchs, took Yuan Shao’s fatal advice to summon provincial armies, Dong Zhuo’s among them. He dithered until the eunuchs murdered him inside the palace, and the warlord he had invited swallowed the capital. The blunder that began the age.',
    },
    imageDiff: {
      ko: '연의도 정사도 "우유부단이 난세를 불렀다"는 평가는 일치해요. 정사는 다만 그가 당고의 화로 몰락했던 청류 사대부들을 복권시키는 등, 한때 개혁 세력의 구심점이었음을 함께 기록합니다.',
      ja: '演義でも正史でも「優柔不断が乱世を招いた」という評価は一致します。正史はただ、党錮の禍で没落していた清流士大夫を復権させるなど、一時は改革勢力の求心点だったことも併せて記録しています。',
      en: 'Both tellings agree: his indecision opened the floodgates. The histories add a fairer note — he restored the purged scholar-officials and briefly served as the rallying point of reform.',
    },
  },
  {
    id: 'wang-yun', hanja: '王允', name: { ko: '왕윤', ja: '王允', en: 'Wang Yun' },
    courtesy: { hanja: '子師', read: { ko: '자사', ja: 'しし', en: 'Zishi' } },
    birth: '137', death: '192', faction: 'han', role: 'civil',
    intro: {
      ko: '동탁의 폭정을 안에서 무너뜨린 후한의 사도예요. 겉으로는 동탁에게 순종하며 신임을 얻고, 뒤로는 여포를 포섭해 192년 마침내 동탁을 주살했습니다. 그러나 승리 후가 문제였죠 — 동탁의 서량 잔당에 대한 사면을 거부하는 강경책이 이각·곽사의 반격을 불렀고, 장안이 함락되며 일족과 함께 처형됐습니다. 통쾌한 거사와 서툰 뒷수습이 겹친, 명분의 정치가 갖는 빛과 그늘을 보여주는 인물이에요.',
      ja: '董卓の暴政を内側から崩した後漢の司徒です。表では董卓に従順にして信任を得て、裏では呂布を抱き込み、192年ついに董卓を誅殺しました。しかし勝利の後が問題でした — 董卓の西涼残党への赦免を拒む強硬策が李傕・郭汜の反撃を呼び、長安が陥落して一族とともに処刑されます。痛快な挙事と拙い後始末が重なった、大義名分の政治が持つ光と影を示す人物です。',
      en: 'The Han minister who brought Dong Zhuo down from within — outwardly compliant enough to win the tyrant’s trust, secretly recruiting Lü Bu until the blade fell in 192. Victory undid him: refusing amnesty to Dong Zhuo’s Xiliang remnants provoked their counterattack, Chang’an fell, and he was executed with his clan. The brilliant stroke and the botched aftermath — the light and shadow of politics by principle.',
    },
    imageDiff: {
      ko: '연의는 그의 거사에 초선과 연환계라는 로맨스를 입혔지만, 정사의 실제 수단은 여포의 사적 불안(동탁 시비와의 사통)과 관직 회유를 파고든 정치 공작이었어요.',
      ja: '演義はその挙事に貂蟬と連環の計というロマンスをまといましたが、正史の実際の手段は、呂布の私的な不安（董卓の侍女との私通）と官職での懐柔を突いた政治工作でした。',
      en: 'The novel dresses the plot in Diao Chan and romance; the real levers were colder — Lü Bu’s guilty secret and the promise of rank.',
    },
  },
  {
    id: 'hua-tuo', hanja: '華佗', name: { ko: '화타', ja: '華佗', en: 'Hua Tuo' },
    courtesy: { hanja: '元化', read: { ko: '원화', ja: 'げんか', en: 'Yuanhua' } },
    birth: '?', death: '208', faction: 'other', role: 'other',
    intro: {
      ko: '"신의(神醫)"라는 말의 원형이 된 후한 말의 전설적 의사예요. 마비산이라는 마취약으로 외과 수술을 행했다는 기록이 남아, 세계 의학사에서도 이른 전신마취 시술자로 거론됩니다. 오금희라는 체조를 만들어 예방 의학의 선구자가 되기도 했죠. 조조의 두통을 치료하다 곁에 붙잡아 두려는 그를 거부했고, 결국 옥에 갇혀 세상을 떠났습니다. 옥중에서 의서를 전하려 했으나 불태워졌다는 이야기가 안타까움을 더해요.',
      ja: '「神医」という言葉の原型となった後漢末の伝説的な医師です。麻沸散という麻酔薬で外科手術を行ったという記録が残り、世界医学史でも早期の全身麻酔施術者として言及されます。五禽戯という体操を作り、予防医学の先駆者にもなりました。曹操の頭痛を治療しながら、そばに縛り付けようとする彼を拒み、結局獄に繋がれて世を去ります。獄中で医書を伝えようとしたが焼かれたという話が無念さを添えます。',
      en: 'The legendary physician who became the very word for "miracle doctor." Records credit him with surgery under an anesthetic called mafeisan — one of history’s earliest general anesthesias — and with the Five Animal Frolics, a pioneering exercise regimen. Treating Cao Cao’s headaches, he refused to become the warlord’s captive court physician, and died in prison. The medical text he tried to pass on from his cell, the story goes, was burned.',
    },
    imageDiff: {
      ko: '관우의 팔뼈를 긁어 독을 치료하는 명장면은 연대가 맞지 않는 연의의 창작이에요(화타는 그 전투 11년 전에 죽음). 조조의 두개골을 열자고 했다는 이야기도 연의의 각색입니다.',
      ja: '関羽の腕の骨を削って毒を治療する名場面は、年代の合わない演義の創作です（華佗はその戦いの11年前に死亡）。曹操の頭蓋骨を開けようと言ったという話も演義の脚色です。',
      en: 'The famous scene of scraping poison from Guan Yu’s bone is chronologically impossible — Hua Tuo died eleven years before that battle. The offer to open Cao Cao’s skull is likewise the novel’s.',
    },
  },
  {
    id: 'chen-gong', hanja: '陳宮', name: { ko: '진궁', ja: '陳宮', en: 'Chen Gong' },
    courtesy: { hanja: '公臺', read: { ko: '공대', ja: 'こうだい', en: 'Gongtai' } },
    birth: '?', death: '199', faction: 'other',
    factionNote: { ko: '조조의 막료였다가 여포의 참모로', ja: '曹操の幕僚から呂布の参謀へ', en: 'Left Cao Cao’s staff to advise Lü Bu' },
    role: 'civil',
    intro: {
      ko: '조조의 초기 막료였다가 등을 돌려 여포의 두뇌가 된 책사예요. 조조가 연주를 비운 사이 여포를 끌어들여 근거지를 뒤엎는 대반란을 설계했습니다. 이후 여포의 참모로 조조를 여러 번 궁지에 몰았지만, 결정적 순간마다 여포가 계책을 듣지 않았죠. 하비에서 함께 사로잡히자 목숨을 구걸하는 대신 형장으로 스스로 걸어 나갔고, 조조는 눈물을 흘리며 그의 노모와 가족을 끝까지 돌봐 주었습니다.',
      ja: '曹操の初期の幕僚から背を向け、呂布の頭脳となった策士です。曹操が兗州を空けた隙に呂布を引き入れ、根拠地を覆す大反乱を設計しました。以後、呂布の参謀として曹操を何度も窮地に追い込みますが、決定的な瞬間ごとに呂布が策を聞き入れませんでした。下邳で共に捕らえられると、命乞いをする代わりに刑場へ自ら歩み出し、曹操は涙を流しながらその老母と家族を最後まで面倒見ました。',
      en: 'Once on Cao Cao’s early staff, he turned coat and became Lü Bu’s brain — engineering the great revolt that handed Lü Bu his master’s home province. As Lü Bu’s strategist he cornered Cao Cao more than once, but at every decisive moment his lord ignored the plan. Captured at Xiapi, he walked to the execution ground rather than beg, and a weeping Cao Cao provided for his mother and family ever after.',
    },
    imageDiff: {
      ko: '연의는 그를 "조조를 잡았다 놓아준 뒤 그 비정함에 실망해 떠난" 중모현 현령으로 그리지만, 이는 창작이에요. 정사의 이반 동기는 명사 처형 등으로 쌓인 조조에 대한 불신으로 추정됩니다.',
      ja: '演義は彼を「曹操を捕らえて放した後、その非情さに失望して去った」中牟県の県令として描きますが、これは創作です。正史の離反の動機は、名士処刑などで積もった曹操への不信と推定されます。',
      en: 'The novel makes him the magistrate who freed a captured Cao Cao and then left in disgust at his ruthlessness — invention. The real break, the histories suggest, came from distrust after Cao Cao’s executions of the gentry.',
    },
  },
]
