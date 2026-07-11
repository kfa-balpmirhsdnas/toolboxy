// 삼국지 명언 데이터 1/2 (승인 목록 1–20). 번역은 직역 아닌 자연문, 맥락은 자체 서술.
import type { TKQuote } from './threeKingdomsQuotes'

export const QUOTES_A: TKQuote[] = [
  {
    slug: 'caocao-betray', hanmun: '寧我負人 毋人負我', person: 'cao-cao', src: 'annot',
    srcName: { ko: '손성 잡기(삼국지 무제기 배송지주)', ja: '孫盛雑記（武帝紀 裴松之注）', en: 'Sun Sheng’s Miscellany (annotations to Cao Cao’s annals)' },
    gist: { ko: '내가 저버릴지언정 저버림당하지 않는다', ja: '我が人に背くとも、人に背かれはせぬ', en: 'Better to wrong others than be wronged' },
    trans: { ko: '차라리 내가 남을 저버릴지언정, 남이 나를 저버리게 두지는 않겠다.', ja: 'むしろ我が人に背こうとも、人に我へ背かせはしない。', en: 'I would rather betray others than let anyone betray me.' },
    context: {
      ko: '동탁을 피해 달아나던 조조가 아버지의 벗 여백사의 집에 묵었다가, 그릇 소리를 자신을 해치려는 것으로 오해해 일가를 죽인 뒤 내뱉은 말이에요. 정사 본문이 아니라 배송지가 인용한 잡기에 실린 기록으로, 연의는 이를 "천하 사람이 나를 저버리게 하느니(休敎天下人負我)"로 키워 조조 악역상의 결정판으로 만들었습니다. 출전에 따라 뉘앙스가 크게 달라지는, 출처 확인의 중요성을 보여주는 대표 명언이죠.',
      ja: '董卓から逃れる途中の曹操が、父の友・呂伯奢の家に泊まり、食器の音を自分を害する企てと誤解して一家を殺した後に吐いた言葉です。正史本文ではなく裴松之が引用した雑記の記録で、演義はこれを「天下の人に我へ背かせるな」と拡大し、曹操悪役像の決定版にしました。出典によってニュアンスが大きく変わる、出所確認の重要性を示す代表的名言です。',
      en: 'Fleeing Dong Zhuo, Cao Cao lodged with his father’s friend Lü Boshe — and, mistaking the clatter of dishes for an ambush, slaughtered the household before uttering these words. The line comes not from the histories proper but from a miscellany quoted in the annotations; the novel inflated it to "let no one under heaven betray me," sealing his villain image. A textbook case of how much the source changes the meaning.',
    },
  },
  {
    slug: 'caocao-old-steed', hanmun: '老驥伏櫪 志在千里', person: 'cao-cao', src: 'history',
    srcName: { ko: '조조 시 「구수수(龜雖壽)」', ja: '曹操の詩「亀雖寿」', en: 'Cao Cao’s poem "Though the Tortoise Lives Long"' },
    gist: { ko: '늙은 천리마의 뜻은 천 리에 있다', ja: '老驥は櫪に伏すとも志は千里に', en: 'The old steed still dreams of a thousand miles' },
    trans: { ko: '늙은 천리마는 마구간에 엎드려 있어도 뜻은 천 리를 달리고, 열사는 늙어도 그 웅심이 그치지 않는다.', ja: '老いた駿馬は厩に伏していても、志は千里を駆ける。烈士は晩年になっても、雄心の已むことがない。', en: 'The old warhorse lies in the stable, yet its heart still runs a thousand miles; the hero grows old, but his great ambition never rests.' },
    context: {
      ko: '쉰을 넘긴 조조가 북방 원정을 마치고 돌아오는 길에 지은 시의 한 구절이에요. 인생의 유한함을 인정하면서도 나이를 핑계 삼지 않겠다는 선언으로, 이후 동아시아에서 노익장을 말할 때 빠지지 않는 인용구가 되었습니다. 정치가 조조가 아닌 시인 조조의 대표작이죠.',
      ja: '五十を過ぎた曹操が北方遠征から帰る道中で詠んだ詩の一節です。人生の有限を認めつつも年齢を言い訳にしないという宣言であり、以後、東アジアで老益壮を語る際に欠かせない引用句となりました。政治家ではなく詩人としての曹操の代表作です。',
      en: 'A couplet from the poem Cao Cao wrote past fifty, returning from his northern campaign. Acknowledging mortality while refusing to make age an excuse, it became East Asia’s definitive quotation on undiminished ambition in later life — the signature of Cao Cao the poet.',
    },
  },
  {
    slug: 'caocao-wine-song', hanmun: '對酒當歌 人生幾何', person: 'cao-cao', src: 'history',
    srcName: { ko: '조조 시 「단가행(短歌行)」', ja: '曹操の詩「短歌行」', en: 'Cao Cao’s "Short Song"' },
    gist: { ko: '술을 마주하면 노래하라, 인생이 얼마나 되랴', ja: '酒に対しては当に歌うべし、人生幾何ぞ', en: 'Sing while the wine is here — how long is life?' },
    trans: { ko: '술을 앞에 두었으면 마땅히 노래할 일이다. 인생이 얼마나 된다고 — 아침 이슬처럼 짧은데, 지나간 날은 많기도 하구나.', ja: '酒を前にしたなら、まさに歌うべきだ。人生はどれほどのものか — 朝露のように短く、過ぎ去った日々はあまりに多い。', en: 'With wine before us, we ought to sing. For how long is a life? Like morning dew — and so many days already gone.' },
    context: {
      ko: '조조의 대표 악부시 단가행의 첫 구절이에요. 짧은 인생에 대한 탄식으로 시작하지만, 시의 결론은 향락이 아니라 "천하의 인재를 모아 대업을 이루겠다"는 갈망으로 이어집니다. 연의는 이 시를 적벽 전야의 연회 장면에 배치해 극적인 복선으로 활용했죠.',
      ja: '曹操の代表的な楽府詩・短歌行の冒頭句です。短い人生への嘆きから始まりますが、詩の結論は享楽ではなく「天下の人材を集めて大業を成す」という渇望へつながります。演義はこの詩を赤壁前夜の宴の場面に配置し、劇的な伏線として活用しました。',
      en: 'The opening of Cao Cao’s most famous song. It begins as a sigh over life’s brevity, but the poem resolves not into hedonism — it builds to his hunger to gather the realm’s talent and finish his great work. The novel stages it at the banquet on the eve of Red Cliffs, as dramatic foreshadowing.',
    },
  },
  {
    slug: 'caocao-mountain-sea', hanmun: '山不厭高 海不厭深', person: 'cao-cao', src: 'history',
    srcName: { ko: '조조 시 「단가행(短歌行)」', ja: '曹操の詩「短歌行」', en: 'Cao Cao’s "Short Song"' },
    gist: { ko: '산은 높기를, 바다는 깊기를 마다하지 않는다', ja: '山は高きを厭わず、海は深きを厭わず', en: 'Mountains never tire of height, seas of depth' },
    trans: { ko: '산은 높아지기를 마다하지 않고 바다는 깊어지기를 마다하지 않는다. 주공이 입 안의 음식을 뱉어가며 인재를 맞으니, 천하의 마음이 그에게 돌아갔다.', ja: '山は高くなることを厭わず、海は深くなることを厭わない。周公は口の中の食べ物を吐き出してまで人材を迎え、天下の心が彼に帰した。', en: 'The mountain never refuses more height, nor the sea more depth. The Duke of Zhou spat out his food to welcome talent — and the hearts of the realm turned to him.' },
    context: {
      ko: '단가행의 맺음 구절로, 조조 인재 철학의 요약이에요. 인재는 산의 흙과 바다의 물처럼 아무리 모아도 지나치지 않다는 것 — 실제로 그는 세 차례의 구현령(求賢令)으로 출신과 흠결을 가리지 않는 채용을 선언했습니다. 채용과 조직을 말할 때 지금도 인용되는 구절이죠.',
      ja: '短歌行の結びの句であり、曹操の人材哲学の要約です。人材は山の土や海の水のように、いくら集めても集めすぎることはない — 実際、彼は三度の求賢令で出自や欠点を問わない登用を宣言しました。採用や組織を語る際、今も引用される一節です。',
      en: 'The closing of the Short Song — Cao Cao’s talent philosophy in one image. People, like earth to a mountain or water to the sea, can never be gathered in excess; he backed it with three "seek the worthy" edicts hiring without regard to birth or blemish. Still quoted wherever recruiting is discussed.',
    },
  },
  {
    slug: 'caocao-sun-quan', hanmun: '生子當如孫仲謀', person: 'cao-cao', src: 'annot',
    srcName: { ko: '오력(삼국지 오주전 배송지주)', ja: '呉暦（呉主伝 裴松之注）', en: 'Wu Li (annotations to Sun Quan’s annals)' },
    gist: { ko: '아들을 낳으려면 손중모처럼', ja: '子を生まば当に孫仲謀の如くなるべし', en: 'A son should be like Sun Quan' },
    trans: { ko: '아들을 낳으려면 마땅히 손중모(손권) 같아야지. 유표의 아들들은 개돼지나 다름없다.', ja: '子を生むならば、まさに孫仲謀（孫権）のようでなければ。劉表の息子たちなど犬や豚も同然だ。', en: 'If one must have a son, let him be like Sun Zhongmou. The sons of Liu Biao are no better than dogs and pigs.' },
    context: {
      ko: '유수구에서 손권군의 군령이 엄정하게 정돈된 것을 바라본 조조가 내뱉은 감탄이에요. 스물 남짓 어린 나이에 강동을 물려받아 자신과 맞서는 손권과, 싸움 없이 형주를 바친 유표의 아들들을 대비시킨 말입니다. 적장에게서 받아낸 최고의 찬사로, 손권 평가의 기준점이 된 명언이죠.',
      ja: '濡須口で孫権軍の軍令が厳正に整っているのを眺めた曹操が漏らした感嘆です。二十歳そこそこで江東を受け継ぎ自分に立ち向かう孫権と、戦わずして荊州を差し出した劉表の息子たちを対比させた言葉です。敵将から引き出した最高の賛辞であり、孫権評価の基準点となった名言です。',
      en: 'Cao Cao’s exclamation at Ruxukou, watching the perfect discipline of Sun Quan’s fleet. It contrasts the young man who inherited the Southland at about twenty and stood against him with Liu Biao’s sons, who handed over their province without a fight. The finest praise an enemy ever paid — and the benchmark of Sun Quan’s reputation since.',
    },
  },
  {
    slug: 'caocao-without-me', hanmun: '設使國家無有孤 不知當幾人稱帝 幾人稱王', person: 'cao-cao', src: 'annot',
    srcName: { ko: '위무고사 — 술지령(무제기 배송지주)', ja: '魏武故事 — 述志令（武帝紀 裴松之注）', en: 'Wei Wu Gushi — the "Statement of Intent" edict' },
    gist: { ko: '내가 없었다면 몇이나 황제를 칭했을까', ja: '国家に孤なかりせば、幾人が帝を称したか', en: 'Without me, how many would have crowned themselves?' },
    trans: { ko: '만약 나라에 내가 없었다면, 몇 사람이나 황제를 칭하고 몇 사람이나 왕을 칭했을지 알 수 없는 일이다.', ja: 'もし国家に私というものがいなかったなら、幾人が帝を称し、幾人が王を称したか分からない。', en: 'Had the state been without me, who knows how many would have styled themselves emperor, and how many king?' },
    context: {
      ko: '조조가 만년에 자신의 뜻을 밝힌 술지령의 한 구절이에요. 찬탈 야심을 의심하는 세간에 "나는 한실을 지탱해 온 사람"이라 항변하면서도, 병권은 결코 내려놓을 수 없다고 못 박는 이중의 문서죠. 자부와 변명, 진심과 계산이 뒤섞인 조조라는 인물의 자화상으로 읽힙니다.',
      ja: '曹操が晩年に自らの志を明かした述志令の一節です。簒奪の野心を疑う世間に「私は漢室を支えてきた者だ」と抗弁しながらも、兵権は決して手放せないと釘を刺す二重の文書です。自負と弁明、本心と計算が入り混じった、曹操という人物の自画像として読まれます。',
      en: 'From the late-life edict in which Cao Cao explained himself. It protests to a suspicious world that he alone had propped up the Han — while flatly refusing to give up his armies. Pride and apologia, sincerity and calculation in one document: a self-portrait of the man.',
    },
  },
  {
    slug: 'caocao-heroes', hanmun: '今天下英雄 唯使君與操耳', person: 'cao-cao', src: 'history',
    srcName: { ko: '정사 삼국지 선주전', ja: '正史『三国志』先主伝', en: 'Records of the Three Kingdoms — Liu Bei’s annals' },
    gist: { ko: '천하 영웅은 그대와 나뿐', ja: '天下の英雄は使君と操のみ', en: 'The only heroes are you and I' },
    trans: { ko: '지금 천하의 영웅은 오직 사군(유비)과 나 조조뿐이오. 원소 같은 무리는 셈에 들지 못하오.', ja: '今、天下の英雄は使君（劉備）とこの曹操だけだ。袁紹のような輩は数のうちに入らない。', en: 'The heroes of this age are you, my lord, and Cao Cao — no one else. The likes of Yuan Shao do not count.' },
    context: {
      ko: '조조에게 몸을 의탁하고 있던 유비와 매실을 안주로 술을 나누던 자리에서 나온 말이에요. 아직 근거지 하나 없던 유비의 그릇을 조조가 정확히 알아본 장면으로, 놀란 유비가 젓가락을 떨어뜨렸다는 기록까지 정사에 남아 있습니다. 연의의 "청매자주논영웅" 명장면의 원본이죠.',
      ja: '曹操のもとに身を寄せていた劉備と、梅を肴に酒を酌み交わしていた席で出た言葉です。まだ根拠地一つない劉備の器を曹操が正確に見抜いた場面で、驚いた劉備が箸を落としたという記録まで正史に残っています。演義の「青梅煮酒論英雄」の名場面の原典です。',
      en: 'Spoken over warm wine and plums while Liu Bei was living under Cao Cao’s protection. Cao Cao had read the measure of a man who did not yet own a single city — and the histories record that Liu Bei, startled, dropped his chopsticks. The original behind the novel’s celebrated "discussing heroes over plum wine."',
    },
  },
  {
    slug: 'liubei-small-good', hanmun: '勿以惡小而爲之 勿以善小而不爲', person: 'liu-bei', src: 'annot',
    srcName: { ko: '제갈량집 인용 유비 유조(선주전 배송지주)', ja: '諸葛亮集所引の遺詔（先主伝 裴松之注）', en: 'Liu Bei’s testament, quoted in the Zhuge Liang Collection' },
    gist: { ko: '작은 악도 말고, 작은 선도 거르지 말라', ja: '悪小なるを以て之を為すなかれ', en: 'No evil is too small to shun, no good too small to do' },
    trans: { ko: '악이 작다고 해서 행하지 말고, 선이 작다고 해서 하지 않으면 안 된다.', ja: '悪が小さいからといって行ってはならず、善が小さいからといって行わずにいてはならない。', en: 'Do no evil because it seems small; leave no good undone because it seems slight.' },
    context: {
      ko: '백제성에서 죽음을 앞둔 유비가 아들 유선에게 남긴 유언의 한 구절이에요. 천하를 다투던 영웅이 마지막으로 남긴 것이 거창한 대업의 당부가 아니라 일상의 선악에 대한 가르침이었다는 점이 이 말의 힘입니다. 오늘날까지 가정교육 명언의 첫 줄에 꼽히죠.',
      ja: '白帝城で死を前にした劉備が息子・劉禅に残した遺言の一節です。天下を争った英雄が最後に残したのが、壮大な大業の頼みではなく日常の善悪についての教えだったという点に、この言葉の力があります。今日まで家庭教育の名言の筆頭に数えられます。',
      en: 'From the testament the dying Liu Bei left his son at Baidicheng. Its power lies in what a hero who had contended for the empire chose to say last: not grand ambitions, but the ethics of small daily acts. It remains a first-line maxim of moral education to this day.',
    },
  },
  {
    slug: 'liubei-fish-water', hanmun: '孤之有孔明 猶魚之有水也', person: 'liu-bei', src: 'history',
    srcName: { ko: '정사 삼국지 제갈량전', ja: '正史『三国志』諸葛亮伝', en: 'Records of the Three Kingdoms — Zhuge Liang' },
    gist: { ko: '공명은 내게 물과 같다', ja: '孤に孔明あるは魚に水あるが如し', en: 'Kongming is water to my fish' },
    trans: { ko: '내가 공명을 얻은 것은 물고기가 물을 만난 것과 같다. 그러니 다시는 불평하지 말라.', ja: '私が孔明を得たのは、魚が水を得たようなものだ。だからもう二度と不平を言うな。', en: 'Having Kongming is like a fish finding water. Speak of it no more.' },
    context: {
      ko: '삼고초려로 얻은 제갈량과 밤낮없이 가까워지는 유비에게 관우·장비가 서운함을 드러내자 돌아온 대답이에요. 주군이 스스로를 물고기에, 갓 들어온 신하를 물에 비유한 파격이 두 아우의 입을 다물게 했습니다. 고사성어 수어지교의 원문이죠.',
      ja: '三顧の礼で得た諸葛亮と昼夜なく親密になる劉備に、関羽・張飛が不満を見せたときの答えです。主君が自らを魚に、新参の臣下を水にたとえた破格が、二人の弟分を黙らせました。故事成語・水魚の交わりの原文です。',
      en: 'Liu Bei’s reply when Guan Yu and Zhang Fei bristled at his inseparability from the newly recruited Zhuge Liang. A lord casting himself as the fish and his minister as the water — the audacity of the image silenced the brothers. The original text of the idiom "fish and water."',
    },
  },
  {
    slug: 'liubei-baidicheng', hanmun: '若嗣子可輔 輔之 如其不才 君可自取', person: 'liu-bei', src: 'history',
    srcName: { ko: '정사 삼국지 제갈량전', ja: '正史『三国志』諸葛亮伝', en: 'Records of the Three Kingdoms — Zhuge Liang' },
    gist: { ko: '아들이 부족하면 그대가 취하라', ja: '嗣子才なくば君自ら取るべし', en: 'If my son fails, take the throne yourself' },
    trans: { ko: '내 아들이 보좌할 만하면 보좌해 주시오. 그러나 그가 재목이 아니거든, 그대가 스스로 (제위를) 취하시오.', ja: '我が子が補佐に値するなら補佐してほしい。だが器でなければ、君が自ら（帝位を）取ってくれ。', en: 'If my heir proves worthy of your support, support him. If he lacks the talent — take the throne for yourself.' },
    context: {
      ko: '백제성에서 유비가 제갈량에게 남긴 탁고의 말로, 군신 관계에서 나올 수 있는 가장 극단의 신뢰 표현이에요. 제갈량은 눈물을 흘리며 "고굉의 힘을 다하고 충정의 절개를 바쳐 죽음으로 잇겠다"고 답했고, 실제로 평생 그 약속을 지켰습니다. 진심이냐 견제냐를 두고 후대의 해석이 갈리는, 삼국지에서 가장 많이 논쟁된 유언이기도 하죠.',
      ja: '白帝城で劉備が諸葛亮に残した託孤の言葉で、君臣関係で出うる最も極端な信頼の表現です。諸葛亮は涙を流しながら「股肱の力を尽くし、忠貞の節を捧げ、死をもって継ぎます」と答え、実際に生涯その約束を守りました。本心か牽制かを巡って後代の解釈が分かれる、三国志で最も論争された遺言でもあります。',
      en: 'Liu Bei’s deathbed charge to Zhuge Liang at Baidicheng — the most extreme statement of trust a sovereign ever made to a minister. Weeping, Zhuge Liang vowed to serve "with every sinew, loyal unto death," and kept the vow for life. Whether the offer was sincerity or a test remains the most debated last testament in the entire saga.',
    },
  },
  {
    slug: 'liubei-brothers', hanmun: '兄弟如手足 妻子如衣服', person: 'liu-bei', src: 'novel',
    srcName: { ko: '삼국지연의 15회', ja: '『三国志演義』第15回', en: 'Romance of the Three Kingdoms, ch. 15' },
    gist: { ko: '형제는 수족, 처자는 의복', ja: '兄弟は手足の如く、妻子は衣服の如し', en: 'Brothers are limbs; wives are clothing' },
    trans: { ko: '형제는 손발과 같고 처자는 옷과 같다. 옷은 해지면 기울 수 있으나, 손발이 끊어지면 어찌 다시 잇겠는가.', ja: '兄弟は手足のごとく、妻子は衣服のごとし。衣は破れれば繕えるが、手足が断たれればどうして繋ぎ直せよう。', en: 'Brothers are like hands and feet; wives and children are like clothing. Torn clothes can be mended — but severed limbs can never be rejoined.' },
    context: {
      ko: '장비가 서주를 여포에게 빼앗기고 유비의 가족까지 두고 도망쳐 자결하려 하자, 유비가 칼을 빼앗으며 달랜 연의의 대사예요. 정사에는 없는 창작이지만 도원결의 서사의 핵심 가치를 압축한 말로 유명해졌습니다. 오늘날에는 시대와 맞지 않는 가치관의 사례로 인용되는 일이 많은, 시대상이 담긴 문장이죠.',
      ja: '張飛が徐州を呂布に奪われ、劉備の家族まで置いて逃げた末に自決しようとしたとき、劉備が刀を奪って慰めた演義の台詞です。正史にない創作ですが、桃園の誓いの物語の核心価値を圧縮した言葉として有名になりました。今日では時代に合わない価値観の例として引用されることも多い、時代相を映す文章です。',
      en: 'In the novel, Zhang Fei loses Xuzhou — and Liu Bei’s family — to Lü Bu and moves to take his own life; Liu Bei wrests the sword away with these words. Pure fiction, but it distilled the oath-brotherhood’s core value so sharply it became famous. Today it is as often cited as a relic of its era’s values as an ideal.',
    },
  },
  {
    slug: 'zhugeliang-jugong', hanmun: '鞠躬盡瘁 死而後已', person: 'zhuge-liang', src: 'history',
    srcName: { ko: '후출사표 (진위 논란 있음)', ja: '後出師表（真偽に議論あり）', en: 'The Later Chu Shi Biao (authenticity debated)' },
    gist: { ko: '온 힘을 다하고 죽어서야 그친다', ja: '鞠躬尽瘁、死して後已む', en: 'Give everything, ceasing only in death' },
    trans: { ko: '몸을 굽혀 온 힘을 다하며, 죽은 뒤에야 그만둘 뿐이다. 성패와 이해득실은 신이 미리 헤아릴 수 있는 바가 아니다.', ja: '身を屈めて全力を尽くし、死して後にようやく已む。成否や利害得失は、臣があらかじめ見通せるものではありません。', en: 'I shall bend my body and spend my utmost strength, ceasing only in death. Success or failure is not mine to foresee.' },
    context: {
      ko: '2차 북벌을 앞두고 올렸다고 전하는 후출사표의 맺음이에요. 승산을 계산하기보다 신하의 도리를 다하겠다는 다짐으로, 제갈량이라는 인물 전체를 여덟 글자로 요약한 문장이 되었습니다. 다만 후출사표 자체는 정사에 실리지 않아 후대의 위작 논란이 있다는 점을 함께 알아 두면 좋아요.',
      ja: '第二次北伐を前に奉ったと伝わる後出師表の結びです。勝算を計算するよりも臣下の道理を尽くすという誓いであり、諸葛亮という人物全体を八文字に要約した文章となりました。ただし後出師表自体は正史に収められておらず、後代の偽作論争があることも併せて知っておくとよいでしょう。',
      en: 'The closing of the Later Memorial, said to precede the second northern campaign. It vows duty over calculation — and became the eight characters that summarize Zhuge Liang entire. Worth knowing: the Later Memorial never appears in the official histories, and its authenticity has been questioned ever since.',
    },
  },
  {
    slug: 'zhugeliang-tranquility', hanmun: '非淡泊無以明志 非寧靜無以致遠', person: 'zhuge-liang', src: 'history',
    srcName: { ko: '제갈량 계자서(誡子書)', ja: '諸葛亮「誡子書」', en: 'Zhuge Liang’s "Admonition to My Son"' },
    gist: { ko: '담박함으로 뜻을 밝히고, 고요함으로 멀리 이른다', ja: '澹泊にあらざれば志を明らかにするなし', en: 'Simplicity clarifies purpose; stillness carries far' },
    trans: { ko: '마음이 담박하지 않으면 뜻을 밝힐 수 없고, 고요하지 않으면 먼 데 이를 수 없다.', ja: '心が淡泊でなければ志を明らかにできず、寧静でなければ遠くに至ることはできない。', en: 'Without simplicity of heart there is no clarity of purpose; without stillness there is no reaching far.' },
    context: {
      ko: '제갈량이 죽기 전 여덟 살 아들 제갈첨에게 남긴 짧은 가훈 계자서의 핵심 구절이에요. 전장에서 평생을 보낸 재상이 아들에게 남긴 것이 "고요히 배우라"는 당부였다는 대비가 깊은 울림을 줍니다. 지금도 동아시아에서 서재에 가장 많이 걸리는 문구 중 하나죠.',
      ja: '諸葛亮が死の前に八歳の息子・諸葛瞻に残した短い家訓「誡子書」の核心句です。戦場で生涯を過ごした宰相が息子に残したのが「静かに学べ」という戒めだったという対比が、深い余韻を残します。今も東アジアで書斎に最も多く掛けられる句の一つです。',
      en: 'The heart of the brief family admonition Zhuge Liang left his eight-year-old son. That a chancellor who spent his life on campaign should leave, as his legacy, an instruction to study in stillness — the contrast is the point. Still among the most-hung calligraphy lines in East Asian studies.',
    },
  },
  {
    slug: 'zhugeliang-chushibiao', hanmun: '先帝創業未半 而中道崩殂', person: 'zhuge-liang', src: 'history',
    srcName: { ko: '출사표(정사 제갈량전 수록)', ja: '出師表（正史諸葛亮伝所収）', en: 'The Chu Shi Biao (in the official histories)' },
    gist: { ko: '선제의 창업이 절반도 못 이루어졌는데', ja: '先帝の創業いまだ半ばならずして', en: 'The late Emperor’s work half done, he was taken' },
    trans: { ko: '선제께서 창업하신 뜻이 절반도 이루어지지 않았는데, 중도에 세상을 떠나셨습니다. 지금 천하는 셋으로 나뉘고 익주는 지쳐 있으니, 참으로 존망이 걸린 위급한 때입니다.', ja: '先帝は創業の志半ばにして、道半ばで崩御されました。今、天下は三つに分かれ、益州は疲弊しております。まことに危急存亡の秋であります。', en: 'The late Emperor passed away with his great work not half complete. Now the realm is split in three and Yi Province is exhausted — truly this is the season of survival or ruin.' },
    context: {
      ko: '북벌을 떠나며 황제 유선에게 올린 출사표의 서두예요. "위급존망지추"라는 성어가 여기서 나왔고, 이 글 전체가 충신 문장의 최고봉으로 꼽히며 천 년 넘게 암송되었습니다. "출사표를 읽고 울지 않으면 충신이 아니다"라는 후대의 평이 그 위상을 말해 주죠.',
      ja: '北伐に発つにあたり皇帝・劉禅に奉った出師表の書き出しです。「危急存亡の秋」という成語がここから生まれ、この文章全体が忠臣の文章の最高峰として千年以上暗誦されてきました。「出師表を読んで泣かぬ者は忠臣にあらず」という後代の評がその地位を物語ります。',
      en: 'The opening of the memorial submitted to Emperor Liu Shan before the northern campaign. It gave the language the phrase "season of survival or ruin," and the text has been memorized as the summit of loyal prose for over a millennium — "no loyal heart reads it dry-eyed," as the saying went.',
    },
  },
  {
    slug: 'zhugeliang-worthies', hanmun: '親賢臣 遠小人', person: 'zhuge-liang', src: 'history',
    srcName: { ko: '출사표(정사 제갈량전 수록)', ja: '出師表（正史諸葛亮伝所収）', en: 'The Chu Shi Biao (in the official histories)' },
    gist: { ko: '어진 신하를 가까이, 소인을 멀리', ja: '賢臣を親しみ、小人を遠ざく', en: 'Keep the worthy close, the petty far' },
    trans: { ko: '어진 신하를 가까이하고 소인을 멀리한 것이 전한이 흥한 까닭이요, 소인을 가까이하고 어진 신하를 멀리한 것이 후한이 기울어진 까닭입니다.', ja: '賢臣を親しみ小人を遠ざけたことが前漢の興った理由であり、小人を親しみ賢臣を遠ざけたことが後漢の傾いた理由であります。', en: 'Keeping worthy ministers close and petty men far — this is why the Former Han flourished. Keeping petty men close and the worthy far — this is why the Later Han declined.' },
    context: {
      ko: '출사표에서 제갈량이 어린 황제에게 남긴 통치의 제1원칙이에요. 왕조의 흥망을 인사 하나로 요약한 이 구절은 이후 동아시아에서 군주 교육의 표준 문구가 되었습니다. 떠나는 재상이 챙긴 것이 결국 "곁에 누구를 두느냐"였다는 점이 핵심이죠.',
      ja: '出師表で諸葛亮が幼い皇帝に残した統治の第一原則です。王朝の興亡を人事一つに要約したこの一節は、以後、東アジアで君主教育の標準文句となりました。旅立つ宰相が最後に念を押したのが結局「そばに誰を置くか」だったという点が核心です。',
      en: 'The first principle of rule Zhuge Liang left his young emperor in the memorial: dynasties rise and fall on personnel. The line became the standard text of royal education across East Asia — a departing chancellor’s last concern being, simply, who stands beside the throne.',
    },
  },
  {
    slug: 'zhugeliang-law', hanmun: '四海分裂 若復廢法 何用討賊邪', person: 'zhuge-liang', src: 'annot',
    srcName: { ko: '양양기(삼국지 마속전 배송지주)', ja: '襄陽記（馬謖伝 裴松之注）', en: 'Xiangyang Ji (annotations to Ma Su’s biography)' },
    gist: { ko: '법을 폐하면 무엇으로 적을 치랴', ja: '法を廃せばなにを用て賊を討たん', en: 'Abandon the law, and with what do we fight?' },
    trans: { ko: '천하가 갈라져 싸움이 이제 막 시작되었는데, 여기서 법을 다시 무너뜨린다면 무엇으로 적을 토벌하겠는가.', ja: '天下が分裂し、戦いがまさに始まったばかりなのに、ここで再び法を崩すなら、何をもって賊を討つのか。', en: 'The realm is broken and the war has only begun. If we now abandon the law as well, with what shall we ever defeat the enemy?' },
    context: {
      ko: '가정 패전 후 "인재가 아까우니 마속을 살리자"는 만류에 제갈량이 눈물을 흘리며 답한 말이에요. 손자를 인용하며 전시일수록 군법이 생명임을 못 박았고, 그 원칙대로 아끼던 마속을 베었습니다. 읍참마속이라는 고사의 논리적 core가 담긴 발언이죠.',
      ja: '街亭の敗戦後、「人材が惜しいから馬謖を生かそう」という引き留めに、諸葛亮が涙を流しながら答えた言葉です。孫子を引きながら戦時こそ軍法が命であることを釘刺し、その原則どおり目をかけていた馬謖を斬りました。泣いて馬謖を斬るという故事の論理的核心が詰まった発言です。',
      en: 'His tearful answer, after Jieting, to those who urged that Ma Su was too talented to execute. Citing the ancient strategists, he insisted that in wartime the law is the army’s very life — then applied the principle to the protégé he loved. The logical core of the "executing Ma Su in tears" story.',
    },
  },
  {
    slug: 'sunquan-scholar', hanmun: '孤豈欲卿治經爲博士邪', person: 'sun-quan', src: 'annot',
    srcName: { ko: '강표전(삼국지 여몽전 배송지주)', ja: '江表伝（呂蒙伝 裴松之注）', en: 'Jiangbiao Zhuan (annotations to Lü Meng’s biography)' },
    gist: { ko: '박사가 되라는 게 아니다 — 손권의 권학', ja: '経学の博士になれと言うのではない', en: 'I don’t ask you to become a scholar' },
    trans: { ko: '내가 어찌 그대에게 경전을 파고들어 박사가 되라 하는 것이겠는가. 다만 지난 일들을 두루 훑어보라는 것뿐이다. 바쁘다 하지만, 그대가 나보다 바쁘겠는가.', ja: '私がどうして君に経書を極めて博士になれと言うだろうか。ただ過去の出来事にざっと目を通せというだけだ。多忙と言うが、君が私より忙しいはずがあるまい。', en: 'Do I ask you to master the classics and become an academician? Only to skim the records of the past. You say you are busy — can you be busier than I?' },
    context: {
      ko: '"군중에 일이 많아 책 읽을 틈이 없다"는 여몽에게 손권이 건넨 설득이에요. 완벽한 학자가 되라는 게 아니라 필요한 만큼만 읽으면 된다는, 지금 들어도 유효한 학습 조언이죠. 이 말에 분발한 여몽은 훗날 괄목상대의 주인공이 되었습니다.',
      ja: '「軍中は多忙で本を読む暇がない」という呂蒙に、孫権が贈った説得です。完璧な学者になれというのではなく、必要な分だけ読めばよいという、今聞いても有効な学習アドバイスです。この言葉に奮起した呂蒙は、後に刮目相待の主人公となりました。',
      en: 'Sun Quan’s reply to Lü Meng’s excuse that army life left no time for books. Not "become a perfect scholar" — just read as much as you need: study advice that still holds. Thus spurred, Lü Meng became the hero of the "rub your eyes" story.',
    },
  },
  {
    slug: 'lvmeng-three-days', hanmun: '士別三日 卽更刮目相待', person: 'lv-meng', src: 'annot',
    srcName: { ko: '강표전(삼국지 여몽전 배송지주)', ja: '江表伝（呂蒙伝 裴松之注）', en: 'Jiangbiao Zhuan (annotations to Lü Meng’s biography)' },
    gist: { ko: '사흘이면 눈을 비비고 다시 보라', ja: '士別れて三日、刮目して相待つべし', en: 'Three days apart — rub your eyes and look again' },
    trans: { ko: '선비란 헤어진 지 사흘이면, 눈을 비비고 다시 대해야 하는 법입니다.', ja: '士たる者、別れて三日もすれば、目をこすって改めて向き合うべきものです。', en: 'When men of purpose part for three days, you must rub your eyes before you look at them again.' },
    context: {
      ko: '무섭게 공부한 여몽의 식견에 노숙이 "오나라 촌구석의 아몽이 아니구나"라고 감탄하자 돌아온 대답이에요. 성장을 남에게 증명받는 것이 아니라 당당히 선언하는 이 태도가 명언의 품격을 만들었습니다. 괄목상대와 오하아몽, 두 성어가 이 한 장면에서 나왔죠.',
      ja: '猛烈に学んだ呂蒙の見識に魯粛が「呉下の阿蒙にあらず」と感嘆したときの返答です。成長を他人に証明してもらうのではなく、堂々と宣言するこの態度が名言の品格を作りました。刮目相待と呉下の阿蒙、二つの成語がこの一場面から生まれています。',
      en: 'Lü Meng’s comeback when Lu Su marveled that he was "no longer the A-Meng of backwater Wu." The dignity of the line is in its posture: growth declared, not begged for. Two idioms — "rub your eyes" and "the old A-Meng" — were born in this single scene.',
    },
  },
  {
    slug: 'zhouyu-music', hanmun: '曲有誤 周郎顧', person: 'zhou-yu', src: 'history',
    srcName: { ko: '정사 삼국지 주유전(당대 민요)', ja: '正史『三国志』周瑜伝（当時の俗謡）', en: 'Records of the Three Kingdoms — Zhou Yu (a popular rhyme)' },
    gist: { ko: '곡이 틀리면 주랑이 돌아본다', ja: '曲に誤りあれば周郎顧みる', en: 'Play a wrong note, and Zhou turns his head' },
    trans: { ko: '연주하는 곡에 틀린 데가 있으면, 주랑이 돌아본다.', ja: '奏でる曲に誤りがあれば、周郎が振り返る。', en: 'If there is a slip in the music, young master Zhou will turn and look.' },
    context: {
      ko: '주유가 술이 세 순배를 돈 뒤에도 연주의 실수를 반드시 알아채고 돌아보았다는 데서 당대 사람들이 지어 부른 노래예요. 적벽의 대도독이 동시에 당대 최고의 음악 감식가였다는 사실을 전하는 기록으로, 주유의 풍류와 완벽주의를 한 줄로 요약합니다. 후대 한시에서 미남 명장의 대명사로 무수히 인용되었죠.',
      ja: '周瑜が酒が三巡した後でも演奏の誤りを必ず聞き分けて振り返ったことから、当時の人々が作って歌った謡です。赤壁の大都督が同時に当代最高の音楽の目利きだったことを伝える記録で、周瑜の風流と完璧主義を一行に要約しています。後代の漢詩で美男の名将の代名詞として無数に引用されました。',
      en: 'A rhyme coined by his contemporaries: even three rounds of wine in, Zhou Yu never failed to catch a wrong note — and turn to look. It preserves the fact that the grand commander of Red Cliffs was also the finest musical ear of his age, his elegance and perfectionism in a single line, endlessly quoted by later poets.',
    },
  },
  {
    slug: 'lusu-couch', hanmun: '漢室不可復興 曹操不可卒除', person: 'lu-su', src: 'history',
    srcName: { ko: '정사 삼국지 노숙전(탑상책)', ja: '正史『三国志』魯粛伝（榻上策）', en: 'Records of the Three Kingdoms — Lu Su (the "Couch Plan")' },
    gist: { ko: '한실은 부흥할 수 없고, 조조는 단숨에 제거할 수 없다', ja: '漢室は復興すべからず、曹操は卒かに除くべからず', en: 'The Han cannot be restored; Cao Cao cannot be quickly removed' },
    trans: { ko: '한 황실은 다시 일으킬 수 없고, 조조는 하루아침에 제거할 수 없습니다. 장군께서는 강동에 정족(鼎足)하여 천하의 틈을 살피십시오.', ja: '漢の皇室は再び興すことができず、曹操は一朝にして除くことができません。将軍は江東に鼎足して、天下の隙をうかがってください。', en: 'The house of Han cannot rise again, and Cao Cao cannot be removed overnight. Hold the Southland, my lord, as one leg of the tripod — and watch for the realm’s opening.' },
    context: {
      ko: '노숙이 손권을 처음 만난 자리, 한 침상에서 술을 나누며 내놓은 대전략이에요. 제갈량의 융중대보다 7년 앞서 한실 부흥이라는 명분의 시대가 끝났음을 직시한 냉철한 정세 분석이었죠. 손권은 겉으로는 "한실을 돕겠다"고 겸양했지만, 오나라는 결국 이 청사진대로 나아갔습니다.',
      ja: '魯粛が孫権に初めて会った席、同じ榻で酒を酌み交わしながら献じた大戦略です。諸葛亮の隆中対より7年早く、漢室復興という大義名分の時代が終わったことを直視した冷徹な情勢分析でした。孫権は表向き「漢室を助ける」と謙遜しましたが、呉は結局この青写真どおりに進みました。',
      en: 'The grand strategy Lu Su offered at his very first meeting with Sun Quan, sharing wine on the same couch. Seven years before Zhuge Liang’s more famous plan, it stared down the era’s pieties: the Han was finished, and Cao Cao would not fall quickly. Sun Quan demurred politely — and Wu followed the blueprint exactly.',
    },
  },
]
