// 삼국지 인물 사전 데이터 3/4 — 오 14명.
import type { TKChar } from './threeKingdomsCharacters'

export const CHARS_WU: TKChar[] = [
  {
    id: 'sun-jian', hanja: '孫堅', name: { ko: '손견', ja: '孫堅', en: 'Sun Jian' },
    courtesy: { hanja: '文台', read: { ko: '문태', ja: 'ぶんだい', en: 'Wentai' } },
    birth: '155', death: '191', faction: 'wu', role: 'military',
    intro: {
      ko: '"강동의 호랑이"라 불린 오나라의 시조 격 인물이에요. 열일곱에 해적을 소탕하며 이름을 알렸고, 황건적 토벌과 반동탁 연합에서 가장 용맹하게 싸운 제후였습니다. 동탁군을 연파하고 낙양에 가장 먼저 입성한 것도 손견이었죠. 그러나 유표 토벌전에서 복병의 화살에 서른일곱으로 전사 — 그의 용맹과 유지는 손책·손권 형제에게 이어져 강동 제국의 씨앗이 되었습니다.',
      ja: '「江東の虎」と呼ばれた呉の始祖格の人物です。十七歳で海賊を討伐して名を上げ、黄巾討伐と反董卓連合で最も勇猛に戦った諸侯でした。董卓軍を連破して洛陽に最初に入城したのも孫堅です。しかし劉表討伐戦で伏兵の矢に三十七歳で戦死 — その勇猛と遺志は孫策・孫権兄弟に受け継がれ、江東帝国の種となりました。',
      en: 'The "Tiger of Jiangdong," founding father of Wu in all but name. Famous at seventeen for hunting down pirates, he fought harder than any lord against the Yellow Turbans and Dong Zhuo — his troops the first into Luoyang. An ambush arrow killed him at thirty-seven in the war against Liu Biao, but his fire passed to his sons Sun Ce and Sun Quan, the seed of the southern empire.',
    },
    imageDiff: {
      ko: '연의에서 관우에게 돌아간 "화웅 참수"의 원래 주인은 정사의 손견이에요. 옥새를 몰래 감췄다는 서사도 연의가 부풀린 것으로, 정사의 손견은 한실에 충성한 맹장으로 기록됩니다.',
      ja: '演義で関羽のものになった「華雄斬り」の本来の主は正史の孫堅です。玉璽を密かに隠したという物語も演義が膨らませたもので、正史の孫堅は漢室に忠誠を尽くした猛将として記録されています。',
      en: 'The beheading of Hua Xiong, which the novel hands to Guan Yu, belongs to Sun Jian in the histories. The tale of hiding the Imperial Seal is likewise inflated — the historical Sun Jian was a loyalist of the Han to the end.',
    },
  },
  {
    id: 'sun-ce', hanja: '孫策', name: { ko: '손책', ja: '孫策', en: 'Sun Ce' },
    courtesy: { hanja: '伯符', read: { ko: '백부', ja: 'はくふ', en: 'Bofu' } },
    birth: '175', death: '200', faction: 'wu', role: 'military',
    intro: {
      ko: '아버지의 옛 부하 천여 명으로 시작해 몇 년 만에 강동 전역을 정복한 "소패왕"이에요. 항우에 비견되는 무용에 사람을 끌어당기는 쾌활함까지 갖춰, 가는 곳마다 백성과 인재가 모여들었습니다. 절친 주유와 함께한 정복전에서 태사자 같은 적장도 심복으로 만들었죠. 관도대전의 배후를 노리던 중 자객의 습격으로 스물여섯에 요절 — 죽기 전 "강동을 지키는 일은 네가 나보다 낫다"며 동생 손권에게 대업을 맡겼습니다.',
      ja: '父の旧臣千余人から始めて数年で江東全域を征服した「小覇王」です。項羽に比せられる武勇に人を惹きつける快活さまで備え、行く先々で民と人材が集まりました。親友の周瑜とともにした征服戦では、太史慈のような敵将さえ腹心にしています。官渡の戦いの背後を狙っていた最中、刺客の襲撃で二十六歳の若さで世を去り — 死の間際「江東を守ることはお前が私より上だ」と弟の孫権に大業を託しました。',
      en: 'The "Little Conqueror" who started with a thousand of his father’s veterans and took the entire Southland in a few years. With valor compared to Xiang Yu and a magnetism all his own, he drew people and talent wherever he marched — even turning the enemy champion Taishi Ci into a devoted follower. Struck down by assassins at twenty-six while eyeing Cao Cao’s rear during Guandu, he passed the great work to his brother: "At keeping Jiangdong, you surpass me."',
    },
    imageDiff: {
      ko: '연의는 도사 우길을 죽인 뒤 그 원귀에 시달리다 죽는 것으로 각색했지만, 정사의 사인은 자객 습격으로 입은 상처예요. 젊은 정복자의 이미지는 양쪽이 같습니다.',
      ja: '演義は道士・于吉を殺した後、その怨霊に苦しめられて死ぬ筋に脚色しましたが、正史の死因は刺客の襲撃で負った傷です。若き征服者のイメージは双方同じです。',
      en: 'The novel has him haunted to death by the ghost of the mystic Yu Ji; the histories record simply the assassins’ wounds. On the image of the young conqueror, both agree.',
    },
  },
  {
    id: 'sun-quan', hanja: '孫權', name: { ko: '손권', ja: '孫権', en: 'Sun Quan' },
    courtesy: { hanja: '仲謀', read: { ko: '중모', ja: 'ちゅうぼう', en: 'Zhongmou' } },
    posthumous: { ko: '대제', ja: '大帝', en: 'Emperor Da' },
    birth: '182', death: '252', faction: 'wu', role: 'civil',
    intro: {
      ko: '열아홉에 강동을 물려받아 삼국 중 가장 오래간 나라를 일군 오의 초대 황제예요. 적벽에서는 주전론을 택해 조조를 꺾었고, 필요하면 유비와 동맹하고 필요하면 형주를 기습하는 유연한 실리 외교로 나라를 키웠습니다. 주유·노숙·여몽·육손으로 이어지는 도독 계보를 적재적소에 쓴 용인술이 최대 무기였죠. 조조조차 "아들을 낳으려면 손중모 같아야 한다"고 감탄했지만, 만년의 후계 분쟁은 오의 그늘이 되었습니다.',
      ja: '十九歳で江東を受け継ぎ、三国で最も長く続いた国を築いた呉の初代皇帝です。赤壁では主戦論を選んで曹操を破り、必要なら劉備と同盟し、必要なら荊州を奇襲する柔軟な実利外交で国を育てました。周瑜・魯粛・呂蒙・陸遜と続く都督の系譜を適材適所に用いた用人術が最大の武器です。曹操でさえ「子を持つなら孫仲謀のようであれ」と感嘆しましたが、晩年の後継争いは呉の影となりました。',
      en: 'Heir to the Southland at nineteen, and first emperor of the longest-lived of the three kingdoms. He chose war at Red Cliffs and broke Cao Cao; thereafter he allied with Liu Bei when useful and seized Jing Province when useful — flexibility as statecraft. His greatest weapon was judgment of men: the succession of chief commanders from Zhou Yu to Lu Xun, each the right man at the right hour. "If one must have a son," even Cao Cao sighed, "let him be like Sun Quan." Only the succession feuds of his old age darkened the record.',
    },
    imageDiff: {
      ko: '연의에서는 유비·조조에 가려 조연처럼 보이지만, 정사의 손권은 두 사람과 대등하게 겨룬 제3의 주인공이에요. 진수는 "구천(춘추의 명군)의 기이한 영걸"이라 평하면서도 만년의 의심 많음을 함께 지적했습니다.',
      ja: '演義では劉備・曹操の影に隠れて脇役に見えますが、正史の孫権は二人と対等に渡り合った第三の主人公です。陳寿は「勾践（春秋の名君）の奇英」と評しつつ、晩年の猜疑心も併せて指摘しました。',
      en: 'The novel shades him behind Liu Bei and Cao Cao; history makes him their full equal, the third protagonist. Chen Shou called him a hero of Goujian’s stamp — while noting the suspicion that soured his final years.',
    },
  },
  {
    id: 'zhou-yu', hanja: '周瑜', name: { ko: '주유', ja: '周瑜', en: 'Zhou Yu' },
    courtesy: { hanja: '公瑾', read: { ko: '공근', ja: 'こうきん', en: 'Gongjin' } },
    birth: '175', death: '210', faction: 'wu', role: 'both',
    intro: {
      ko: '적벽대전을 지휘해 천하삼분의 물꼬를 튼 오의 대도독이에요. 손책과 동갑내기 절친으로 강동 평정을 함께했고, 손책 사후에는 어린 손권을 앞장서 떠받쳤습니다. 적벽에서는 화공 전략을 총지휘해 조조의 대군을 불태웠죠. 음악에도 정통해 "곡에 틀린 데가 있으면 주랑이 돌아본다"는 말이 유행했을 만큼 풍류까지 갖춘 미남자였습니다. 익주 공략의 웅대한 구상을 품은 채 서른여섯에 병사했어요.',
      ja: '赤壁の戦いを指揮して天下三分の流れを開いた呉の大都督です。孫策と同い年の親友として江東平定を共にし、孫策の死後は幼い孫権を先頭に立って支えました。赤壁では火攻めの戦略を総指揮して曹操の大軍を焼き払います。音楽にも精通し「曲に誤りあれば周郎が顧みる」という言葉が流行ったほど、風流まで備えた美男子でした。益州攻略の雄大な構想を抱いたまま、三十六歳で病没します。',
      en: 'The grand commander of Wu whose victory at Red Cliffs opened the age of three kingdoms. Sun Ce’s exact contemporary and closest friend, he conquered the Southland at his side, then became the young Sun Quan’s foremost champion. At Red Cliffs he directed the fire attack that burned Cao Cao’s armada. Famously handsome and a master of music — "if a note is wrong, Zhou the young lord turns his head," ran the saying. He died at thirty-six, still carrying a grand design to take Yi Province.',
    },
    imageDiff: {
      ko: '"제갈량에게 세 번 골탕 먹고 분사한 속 좁은 라이벌"은 연의 최대의 왜곡 피해 사례예요. 정사의 주유는 "도량이 크고 겸손해 사람들이 따랐다"고 기록된 대인배로, 죽음도 화병이 아니라 원정길의 병사입니다.',
      ja: '「諸葛亮に三度してやられて憤死した狭量なライバル」は演義最大の歪曲被害例です。正史の周瑜は「度量が大きく謙虚で人々が慕った」と記録された大人物で、死も憤死ではなく遠征途上の病死です。',
      en: 'The petty rival who dies of rage at being outwitted three times is the novel’s greatest character assassination. The historical Zhou Yu was "large-minded and modest, beloved by all" — and he died of illness on campaign, not of wounded pride.',
    },
  },
  {
    id: 'lu-su', hanja: '魯肅', name: { ko: '노숙', ja: '魯粛', en: 'Lu Su' },
    courtesy: { hanja: '子敬', read: { ko: '자경', ja: 'しけい', en: 'Zijing' } },
    birth: '172', death: '217', faction: 'wu', role: 'civil',
    intro: {
      ko: '손유 동맹이라는 삼국시대의 기본 구도를 설계하고 지켜낸 오의 전략가예요. 곳간 하나를 통째로 내준 호탕함으로 주유와 벗이 되었고, 손권에게는 제갈량의 융중대에 비견되는 "천하이분지계"를 먼저 제시했습니다. 적벽에서는 거의 유일한 주전파로 손권의 결단을 이끌었죠. 주유 사후 대도독을 이어받아, 형주 갈등 속에서도 단도부회 담판까지 하며 동맹의 큰 틀을 지켰습니다.',
      ja: '孫劉同盟という三国時代の基本構図を設計し、守り抜いた呉の戦略家です。蔵一つを丸ごと譲った豪放さで周瑜と友になり、孫権には諸葛亮の隆中対に比せられる「天下二分の計」をいち早く提示しました。赤壁ではほぼ唯一の主戦派として孫権の決断を導きます。周瑜の死後は大都督を継ぎ、荊州対立の中でも単刀赴会の談判までして同盟の大枠を守りました。',
      en: 'The strategist who designed — and then held together — the Sun–Liu alliance that defined the era. He befriended Zhou Yu by giving away an entire granary; to Sun Quan he offered a "divide the realm in two" plan that rivals Zhuge Liang’s more famous one. At Red Cliffs he was nearly the only voice for war, steeling his lord’s resolve. Succeeding Zhou Yu as commander, he kept the alliance alive through the Jing Province feud — down to the famous single-blade parley.',
    },
    imageDiff: {
      ko: '연의의 노숙은 제갈량과 주유 사이에서 쩔쩔매는 사람 좋은 중재자지만, 정사의 노숙은 대세를 읽는 눈이 누구보다 밝았던 일급 전략가예요. 단도부회의 주인공도 정사에서는 관우가 아니라 노숙입니다.',
      ja: '演義の魯粛は諸葛亮と周瑜の間でおろおろする人の良い仲裁者ですが、正史の魯粛は大勢を読む眼が誰よりも明るかった一級の戦略家です。単刀赴会の主人公も正史では関羽ではなく魯粛です。',
      en: 'The novel’s Lu Su is a good-natured go-between fumbling amid geniuses; the historical Lu Su read the board better than almost anyone. Even the single-blade parley is his scene in the histories, not Guan Yu’s.',
    },
  },
  {
    id: 'lv-meng', hanja: '呂蒙', name: { ko: '여몽', ja: '呂蒙', en: 'Lü Meng' },
    courtesy: { hanja: '子明', read: { ko: '자명', ja: 'しめい', en: 'Ziming' } },
    birth: '178', death: '220', faction: 'wu', role: 'both',
    intro: {
      ko: '괄목상대 고사의 주인공 — 배움으로 자신을 두 번 만든 오의 대도독이에요. 일자무식 용장 소리를 듣다 손권의 권유로 책에 파묻혀, 노숙조차 "오하아몽이 아니다"라며 놀란 지장으로 거듭났습니다. 관우가 북상한 틈에 병사들을 상인으로 꾸민 백의도강으로 형주를 무혈 접수했고, 점령지의 민심까지 다독여 관우군을 스스로 무너지게 만들었죠. 형주 수복 직후 마흔둘에 병사해, 손권이 직접 병상을 지켰다고 전합니다.',
      ja: '刮目相待の故事の主人公 — 学びによって自らを二度作り上げた呉の大都督です。無学の猛将と言われていたのが孫権の勧めで書物に没頭し、魯粛でさえ「呉下の阿蒙にあらず」と驚く知将に生まれ変わりました。関羽が北上した隙に兵士を商人に扮させた白衣渡江で荊州を無血接収し、占領地の民心まで掌握して関羽軍を自壊させます。荊州奪回の直後、四十二歳で病没し、孫権が自ら病床に付き添ったと伝わります。',
      en: 'The hero of the "rub your eyes" idiom — the commander who remade himself through study. Once mocked as an unlettered brawler, he buried himself in books at Sun Quan’s urging until even Lu Su marveled he was "no longer the old A-Meng." When Guan Yu marched north, Lü Meng’s soldiers crossed the river dressed as merchants and took Jing Province without a blow — then won over the occupied people so completely that Guan Yu’s army dissolved. He died at forty-two just after his triumph, Sun Quan at his bedside.',
    },
    imageDiff: {
      ko: '연의는 관우의 원혼이 씌어 죽는 것으로 처리해 "관우를 죽인 자"의 최후를 연출했지만, 정사의 사인은 병사예요. 학습과 지략으로 완성된 그의 성장 서사는 정사 쪽이 훨씬 풍부합니다.',
      ja: '演義は関羽の怨霊に取り憑かれて死ぬ形で「関羽を殺した者」の最期を演出しましたが、正史の死因は病死です。学びと知略で完成されたその成長物語は、正史のほうがはるかに豊かです。',
      en: 'The novel kills him with Guan Yu’s vengeful ghost; history records illness. And the real story — the brawler who studied his way to greatness — is far richer in the original.',
    },
  },
  {
    id: 'lu-xun', hanja: '陸遜', name: { ko: '육손', ja: '陸遜', en: 'Lu Xun' },
    courtesy: { hanja: '伯言', read: { ko: '백언', ja: 'はくげん', en: 'Boyan' } },
    birth: '183', death: '245', faction: 'wu', role: 'both',
    intro: {
      ko: '이릉에서 유비를, 석정에서 위군을 꺾은 오의 마지막 대도독이자 훗날 승상까지 오른 문무겸전의 인물이에요. 형주 기습 때는 무명임을 역이용해 관우를 방심시키는 겸손한 편지로 판을 깔았습니다. 이릉에서는 반 년을 웅크려 유비군이 지치기를 기다렸다 화공 한 방으로 끝냈죠. 서생 취급하던 노장들도 그 지휘에 승복했습니다. 만년에는 후계 분쟁에 휘말려 손권의 질책 속에 분사(憤死)한, 영광과 비극이 겹친 생애였어요.',
      ja: '夷陵で劉備を、石亭で魏軍を破った呉最後の大都督であり、後に丞相まで上った文武兼備の人物です。荊州奇襲の際は無名であることを逆手に取り、関羽を油断させる謙虚な手紙で盤面を整えました。夷陵では半年間身を潜めて劉備軍が疲弊するのを待ち、火攻めの一撃で終わらせます。書生扱いしていた老将たちもその指揮に承服しました。晩年は後継争いに巻き込まれ、孫権の叱責の中で憤死した、栄光と悲劇の重なる生涯でした。',
      en: 'The commander who broke Liu Bei at Yiling and Wei at Shiting — later chancellor of Wu, master of both pen and sword. For the Jing Province strike he weaponized his own obscurity, lulling Guan Yu with humble letters. At Yiling he crouched for half a year until Liu Bei’s army frayed, then ended it with one fire attack; the old generals who had scorned the "schoolboy" submitted on the spot. His end was darker: entangled in the succession feud, he died under his own emperor’s rebukes. Glory and tragedy in one life.',
    },
    imageDiff: {
      ko: '연의는 이릉의 화공 뒤 제갈량의 석진(팔진도)에 갇혀 물러나는 것으로 체면을 깎았지만, 이는 창작이에요. 정사의 육손은 진수가 손권 다음으로 단독 열전을 세워준, 오나라 역사상 최고 평가의 신하입니다.',
      ja: '演義は夷陵の火攻めの後、諸葛亮の石陣（八陣図）に閉じ込められて退く形で面目を削りましたが、これは創作です。正史の陸遜は、陳寿が孫権に次いで単独の列伝を立てた、呉の歴史上最高評価の臣下です。',
      en: 'The novel humbles him after Yiling with Zhuge Liang’s magical stone maze — pure invention. In the histories, Chen Shou honored him with a solo biography, an honor given no other Wu subject: the kingdom’s most esteemed minister.',
    },
  },
  {
    id: 'gan-ning', hanja: '甘寧', name: { ko: '감녕', ja: '甘寧', en: 'Gan Ning' },
    courtesy: { hanja: '興霸', read: { ko: '흥패', ja: 'こうは', en: 'Xingba' } },
    birth: '?', death: '?', faction: 'wu',
    factionNote: { ko: '수적·유표·황조를 거쳐 오로', ja: '賊・劉表・黄祖を経て呉へ', en: 'Pirate, then Liu Biao and Huang Zu, before Wu' },
    role: 'military',
    intro: {
      ko: '비단 돛에 방울을 달고 다니던 수적 "금범적" 출신의 맹장이에요. 오에 귀순한 뒤 황조 토벌의 선봉에 섰고, 적벽과 강릉에서도 앞장서 싸웠습니다. 백미는 유수구 — 정예 백 기로 조조 군영을 야습해 한 명도 잃지 않고 돌아와 "조조에게 장료가 있다면 내게는 감녕이 있다"는 손권의 자랑이 되었죠. 거칠고 살생을 즐겼다는 기록과 호쾌한 의리의 일화가 공존하는, 야성 그대로의 사나이입니다.',
      ja: '錦の帆に鈴を付けて回った水賊「錦帆賊」出身の猛将です。呉に帰順した後、黄祖討伐の先鋒に立ち、赤壁や江陵でも先陣を切って戦いました。白眉は濡須口 — 精鋭百騎で曹操の軍営を夜襲し、一人も失わずに帰還して「曹操に張遼あらば、我に甘寧あり」という孫権の自慢となりました。荒々しく殺生を好んだという記録と豪快な義理の逸話が共存する、野性そのままの男です。',
      en: 'The "Silk-Sail Pirate" who hung bells from his boats — then became one of Wu’s fiercest generals. He led the vanguard against Huang Zu, fought at Red Cliffs and Jiangling, and crowned it at Ruxukou: a night raid on Cao Cao’s camp with a hundred picked riders, returning without a single loss. "Cao Cao has Zhang Liao," boasted Sun Quan, "but I have Gan Ning." The record keeps both his savagery and his rough code of honor — wildness unfiltered.',
    },
    imageDiff: {
      ko: '연의에서는 관우의 아들 관흥에게 죽지만, 정사에는 그런 최후가 없고 병사한 것으로 추정돼요. 능통과의 원한과 화해 서사는 정사에도 뼈대가 있는 이야기입니다.',
      ja: '演義では関羽の息子・関興に討たれますが、正史にそのような最期はなく病死と推定されます。凌統との怨恨と和解の物語は、正史にも骨組みのある話です。',
      en: 'The novel has him slain by Guan Yu’s son; no such end exists in the histories, which imply he died of illness. His feud and reconciliation with Ling Tong, though, has real bones in the record.',
    },
  },
  {
    id: 'taishi-ci', hanja: '太史慈', name: { ko: '태사자', ja: '太史慈', en: 'Taishi Ci' },
    courtesy: { hanja: '子義', read: { ko: '자의', ja: 'しぎ', en: 'Ziyi' } },
    birth: '166', death: '206', faction: 'wu',
    factionNote: { ko: '유요 휘하에서 손책에게 귀순', ja: '劉繇麾下から孫策に帰順', en: 'Came over to Sun Ce from Liu Yao' },
    role: 'military',
    intro: {
      ko: '신의와 활 솜씨로 이름난 오의 명궁 무장이에요. 젊어서는 포위된 북해의 공융을 위해 단기로 포위망을 뚫고 유비에게 구원을 청해온 의협으로 이름을 알렸습니다. 신정에서 손책과 일기토를 벌인 인연으로 사로잡힌 뒤 심복이 되었죠. "약속한 날짜에 반드시 돌아오겠다"며 풀려나 정말 기한에 맞춰 부대를 이끌고 돌아온 일화가 그의 인장입니다. "대장부는 마땅히 칠 척 검을 차고 천자의 계단에 올라야 한다"는 유언을 남기고 마흔하나에 병사했어요.',
      ja: '信義と弓の腕で名を馳せた呉の名弓の武将です。若い頃は包囲された北海の孔融のため、単騎で包囲網を突破して劉備に救援を求めた義侠として名を上げました。神亭で孫策と一騎打ちを演じた縁で捕らえられた後、腹心となります。「約束の日に必ず戻る」と解き放たれ、本当に期限どおり部隊を率いて帰ってきた逸話が彼の印章です。「大丈夫たる者、七尺の剣を帯びて天子の階に上るべし」との遺言を残し、四十一歳で病没しました。',
      en: 'Wu’s legendary archer, famed equally for keeping his word. As a young man he broke through a siege alone to fetch help for the surrounded Kong Rong; his duel with Sun Ce at Shenting led to capture — and devotion. Released on his promise to return by a set day, he rode back exactly on time at the head of new troops: the story that defines him. He died at forty-one, lamenting that a true man should "wear a seven-foot sword and ascend the steps of the Son of Heaven."',
    },
    imageDiff: {
      ko: '연의는 그의 죽음을 합비 전투(215)로 옮겨 장렬한 전사로 각색했지만, 정사의 태사자는 그보다 9년 전에 병사했어요. 신정 일기토와 신의의 일화는 정사 기록입니다.',
      ja: '演義は彼の死を合肥の戦い（215年）に移して壮烈な戦死に脚色しましたが、正史の太史慈はその9年前に病没しています。神亭の一騎打ちと信義の逸話は正史の記録です。',
      en: 'The novel relocates his death to the battle of Hefei for a hero’s end; the historical Taishi Ci died of illness nine years earlier. The duel and the kept promise, however, are genuine history.',
    },
  },
  {
    id: 'huang-gai', hanja: '黃蓋', name: { ko: '황개', ja: '黄蓋', en: 'Huang Gai' },
    courtesy: { hanja: '公覆', read: { ko: '공복', ja: 'こうふく', en: 'Gongfu' } },
    birth: '?', death: '?', faction: 'wu', role: 'military',
    intro: {
      ko: '손견·손책·손권 3대를 섬긴 강동의 원로 무장이자 적벽 화공의 실행자예요. 적벽에서 거짓 항복을 자청해 기름 실은 배로 조조 함대에 돌진, 대화재의 방아쇠를 당겼습니다. 이 과정에서 화살에 맞아 강에 떨어졌다가 구조된 일화도 전하죠. 지방관으로도 유능해 그가 부임한다는 소식만으로 반란이 잦아들었다는 기록이 남아 있습니다. 고육지계 고사의 주인공으로 영원히 기억되는 이름이에요.',
      ja: '孫堅・孫策・孫権の三代に仕えた江東の宿将であり、赤壁の火攻めの実行者です。赤壁では偽りの降伏を買って出て、油を積んだ船で曹操の艦隊に突進し、大火災の引き金を引きました。この過程で矢に当たって川に落ち、救助された逸話も伝わります。地方官としても有能で、彼が赴任するという知らせだけで反乱が収まったという記録が残っています。苦肉の策の故事の主人公として永遠に記憶される名前です。',
      en: 'Veteran of three generations of Sun lords — and the man who pulled the trigger at Red Cliffs. Volunteering the fake surrender, he drove the oil-laden ships into Cao Cao’s fleet and ignited the great fire, taking an arrow and a plunge into the river along the way. He was equally formidable as an administrator: rebellions, the record says, subsided at the mere news of his appointment. His name lives on in the idiom of the self-inflicted ruse.',
    },
    imageDiff: {
      ko: '"주유가 황개를 곤장 치는" 고육계 매질 장면은 연의의 창작이고, 정사에는 거짓 항복 계책 자체만 기록돼 있어요. 어느 쪽이든 적벽의 불길을 당긴 손은 황개의 것입니다.',
      ja: '「周瑜が黄蓋を杖打ちする」苦肉の計の場面は演義の創作で、正史には偽降の策そのものだけが記録されています。いずれにせよ、赤壁の炎を放った手は黄蓋のものです。',
      en: 'The beating by Zhou Yu is the novel’s addition — the histories record only the feigned surrender itself. Either way, the hand that lit Red Cliffs was Huang Gai’s.',
    },
  },
  {
    id: 'cheng-pu', hanja: '程普', name: { ko: '정보', ja: '程普', en: 'Cheng Pu' },
    courtesy: { hanja: '德謀', read: { ko: '덕모', ja: 'とくぼう', en: 'Demou' } },
    birth: '?', death: '?', faction: 'wu', role: 'military',
    intro: {
      ko: '오나라 무장 서열 첫머리에 기록된 3대 공신, "정공(程公)"이라 불린 최고참이에요. 손견의 거병부터 황건적·동탁전을 함께했고, 손책의 강동 평정에서도 늘 선봉이었습니다. 적벽에서는 주유와 함께 좌우 도독을 맡았죠. 젊은 주유 밑에 서는 것을 처음엔 불쾌해했지만, 이내 "주공근과 사귀는 것은 좋은 술을 마시는 것 같아 나도 모르게 취한다"며 승복한 일화가 유명합니다.',
      ja: '呉の武将の序列の筆頭に記された三代の功臣、「程公」と呼ばれた最古参です。孫堅の挙兵から黄巾・董卓戦を共にし、孫策の江東平定でも常に先鋒でした。赤壁では周瑜とともに左右の都督を務めます。若い周瑜の下に立つことを最初は不快に思いましたが、やがて「周公瑾と交わるのは良い酒を飲むようで、知らず知らず酔ってしまう」と承服した逸話が有名です。',
      en: 'First name on the roll of Wu’s generals — the "Elder Cheng" who served all three Sun lords from the very first muster. He fought the Yellow Turbans and Dong Zhuo beside Sun Jian, led vanguards for Sun Ce, and shared the supreme command with Zhou Yu at Red Cliffs. At first he bristled at ranking beneath the younger man — until he famously conceded that keeping company with Zhou Yu "is like drinking fine wine: one is drunk before one knows it."',
    },
    imageDiff: {
      ko: '연의에서는 존재감이 옅은 노장 1로 스쳐 가지만, 정사의 정보는 오나라 개국 무장 중 서열 제일로 대접받는 인물이에요. 주유와의 화해 일화가 그의 도량을 보여줍니다.',
      ja: '演義では存在感の薄い老将その一として流されますが、正史の程普は呉の建国武将の中で序列第一の待遇を受けた人物です。周瑜との和解の逸話がその度量を示しています。',
      en: 'A background elder in the novel, but in the histories the highest-ranked of Wu’s founding generals — and the wine-drunk reconciliation with Zhou Yu shows the measure of the man.',
    },
  },
  {
    id: 'zhou-tai', hanja: '周泰', name: { ko: '주태', ja: '周泰', en: 'Zhou Tai' },
    courtesy: { hanja: '幼平', read: { ko: '유평', ja: 'ようへい', en: 'Youping' } },
    birth: '?', death: '?', faction: 'wu', role: 'military',
    intro: {
      ko: '온몸의 흉터로 충성을 증명한 손권의 방패예요. 젊은 손권이 산적 떼의 기습을 받았을 때 홀로 몸을 던져 지켜냈고, 이때 입은 상처가 열두 곳이 넘었다고 전합니다. 유수구 전투에서도 포위된 손권을 두 번 세 번 적진을 드나들며 구해냈죠. 훗날 손권은 연회에서 주태의 옷을 벗겨 상처 하나하나에 얽힌 사연을 물으며 눈물로 술을 따랐고, 출신을 따지던 장수들도 그날로 승복했습니다.',
      ja: '全身の傷跡で忠誠を証明した孫権の盾です。若き孫権が山賊の群れの奇襲を受けたとき、単身で身を挺して守り抜き、このとき負った傷は十二か所を超えたと伝わります。濡須口の戦いでも包囲された孫権を、二度三度と敵陣に出入りして救い出しました。後に孫権は宴席で周泰の衣を脱がせ、傷の一つ一つにまつわる話を尋ねながら涙で酒を注ぎ、出自にこだわっていた将たちもその日をもって承服しました。',
      en: 'Sun Quan’s shield, whose loyalty was written in scars. When bandits ambushed the young lord, Zhou Tai threw his own body over him and took more than a dozen wounds; at Ruxukou he cut into the encirclement again and again to pull Sun Quan out. Years later, at a banquet, Sun Quan bared the general’s torso and poured a cup of wine for the story behind each scar — and the well-born officers who had sneered at his origins bowed their heads for good.',
    },
    imageDiff: {
      ko: '흉터 연회 일화는 정사(강표전 인용)에 뿌리가 있는 이야기예요. 연의는 유수구 구출전의 액션을 키웠을 뿐, 몸으로 주군을 지킨 무장이라는 본질은 같습니다.',
      ja: '傷跡の宴の逸話は正史（江表伝引用）に根のある話です。演義は濡須口の救出戦のアクションを大きくしただけで、身をもって主君を守った武将という本質は同じです。',
      en: 'The banquet of scars is rooted in the historical record. The novel merely amplifies the rescue scenes — the essence, a man who shielded his lord with his own flesh, is unchanged.',
    },
  },
  {
    id: 'zhang-zhao', hanja: '張昭', name: { ko: '장소', ja: '張昭', en: 'Zhang Zhao' },
    courtesy: { hanja: '子布', read: { ko: '자포', ja: 'しふ', en: 'Zibu' } },
    birth: '156', death: '236', faction: 'wu', role: 'civil',
    intro: {
      ko: '손책이 "안의 일은 모두 장소에게 물어라"라는 유언을 남긴 오의 대들보 문신이에요. 손책 급서 직후 슬픔에 빠진 손권을 말에 태워 군을 순시하게 하며(개문읍도의 간언) 강동의 동요를 잠재웠습니다. 적벽 때는 항복론을 주장해 체면을 구겼지만, 이후로도 직언을 멈추지 않는 조정의 어른이었죠. 노한 손권이 칼을 만지작거려도 "태후의 유언이 귓가에 생생하다"며 물러서지 않은 강골이었습니다.',
      ja: '孫策が「内の事はすべて張昭に問え」との遺言を残した呉の大黒柱の文臣です。孫策の急死直後、悲しみに沈む孫権を馬に乗せて軍を巡視させ（開門揖盗の諫言）、江東の動揺を鎮めました。赤壁の際は降伏論を主張して面目を失いましたが、その後も直言をやめない朝廷の長老でした。怒った孫権が刀に手をかけても「太后の遺言が耳元に生々しい」と一歩も引かない硬骨漢でした。',
      en: 'The elder statesman to whom Sun Ce’s dying words entrusted "all matters within." When grief paralyzed the young Sun Quan, it was Zhang Zhao who put him on a horse to review the troops — the "open gates invite thieves" rebuke — and steadied the Southland. His advocacy of surrender before Red Cliffs cost him prestige, yet he never stopped speaking hard truths; even with an angry Sun Quan’s hand on his sword hilt, the old man would not yield an inch.',
    },
    imageDiff: {
      ko: '연의에서는 제갈량의 설전에 말문이 막히는 항복파 대표로 소비되지만(설전군유는 창작), 정사의 장소는 오나라 국정의 기틀을 놓은 원훈이자 손권조차 어려워한 강직한 스승 같은 존재예요.',
      ja: '演義では諸葛亮の舌戦に言い負かされる降伏派の代表として消費されますが（舌戦群儒は創作）、正史の張昭は呉の国政の基礎を築いた元勲であり、孫権さえ一目置いた剛直な師のような存在です。',
      en: 'The novel spends him as the surrender-faction strawman demolished in Zhuge Liang’s (invented) debate with the scholars. The historical Zhang Zhao built Wu’s civil foundations — a flint-hard mentor even Sun Quan feared to face.',
    },
  },
  {
    id: 'zhuge-jin', hanja: '諸葛瑾', name: { ko: '제갈근', ja: '諸葛瑾', en: 'Zhuge Jin' },
    courtesy: { hanja: '子瑜', read: { ko: '자유', ja: 'しゆ', en: 'Ziyu' } },
    birth: '174', death: '241', faction: 'wu', role: 'civil',
    intro: {
      ko: '제갈량의 친형이면서 오나라의 중신으로 산 인물이에요. 형제가 적국의 기둥으로 갈라졌지만, 서로 공적인 자리에서만 만나고 사사로이 왕래하지 않는 원칙을 평생 지켰습니다. 손권과 유비 진영 사이의 껄끄러운 교섭마다 사신으로 나섰고, 온화한 인품 덕에 "그가 있으면 노한 손권도 풀어졌다"고 전하죠. 대장군까지 올랐고, 아들 제갈각은 오의 최고 권력자가 되었습니다.',
      ja: '諸葛亮の実兄でありながら、呉の重臣として生きた人物です。兄弟が敵国の柱として分かれましたが、互いに公の場でのみ会い、私的に往来しない原則を生涯守りました。孫権と劉備陣営の間の気まずい交渉のたびに使者として立ち、温和な人柄のおかげで「彼がいれば怒った孫権も和らいだ」と伝わります。大将軍まで上り、息子の諸葛恪は呉の最高権力者となりました。',
      en: 'Zhuge Liang’s elder brother — and a pillar of the rival kingdom of Wu. Though the brothers anchored enemy states, they held to one rule for life: meet only on public business, never in private. He was the envoy of choice for every awkward negotiation with Liu Bei’s camp, and his gentle manner, it was said, could soften even an angry Sun Quan. He rose to Grand General; his son Zhuge Ke would later rule Wu in all but name.',
    },
    imageDiff: {
      ko: '연의에서는 동생에게 형주 반환을 조르러 갔다가 번번이 허탕 치는 코믹한 역할이 부각돼요. 정사의 제갈근은 손권이 "자유와 나는 죽어도 변치 않을 사이"라 공언한 최측근 중신입니다.',
      ja: '演義では弟に荊州返還をせがみに行っては空振りするコミカルな役回りが強調されます。正史の諸葛瑾は、孫権が「子瑜と私は死んでも変わらぬ仲」と公言した最側近の重臣です。',
      en: 'The novel plays him for comedy, forever failing to wheedle Jing Province out of his brother. In the histories, Sun Quan declared their bond unbreakable even by death — no minister stood closer.',
    },
  },
]
