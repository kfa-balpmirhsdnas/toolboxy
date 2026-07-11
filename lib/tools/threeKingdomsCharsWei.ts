// 삼국지 인물 사전 데이터 1/4 — 위 16명. 소개·정사연의 차이는 자체 서술(저작권 클린).
import type { TKChar } from './threeKingdomsCharacters'

export const CHARS_WEI: TKChar[] = [
  {
    id: 'cao-cao', hanja: '曹操', name: { ko: '조조', ja: '曹操', en: 'Cao Cao' },
    courtesy: { hanja: '孟德', read: { ko: '맹덕', ja: 'もうとく', en: 'Mengde' } },
    posthumous: { ko: '무제(추존)', ja: '武帝（追尊）', en: 'Emperor Wu (posthumous)' },
    birth: '155', death: '220', faction: 'wei', role: 'both',
    intro: {
      ko: '후한 말의 혼란을 힘과 지략으로 평정해 위나라의 기틀을 세운 인물이에요. 황건적 토벌로 이름을 알린 뒤 헌제를 허도로 모셔 "천자를 끼고 제후를 호령"하는 패권의 공식을 만들었습니다. 관도에서 원소를 꺾어 북방을 통일했지만 적벽에서 좌절하며 천하는 셋으로 갈라졌죠. 출신을 가리지 않는 인재 등용과 둔전제 같은 실용 정책, 그리고 시인으로서의 재능까지 — 난세가 낳은 가장 입체적인 영웅입니다.',
      ja: '後漢末の混乱を力と知略で平定し、魏の礎を築いた人物です。黄巾討伐で名を上げた後、献帝を許都に迎えて「天子を擁して諸侯に号令する」覇権の方程式を作りました。官渡で袁紹を破って北方を統一しますが、赤壁で挫折し天下は三つに割れます。出自を問わない人材登用や屯田制などの実用政策、さらに詩人としての才能まで — 乱世が生んだ最も立体的な英雄です。',
      en: 'The man who tamed the chaos of the late Han and laid the foundations of Wei. After rising through the Yellow Turban campaigns, he took custody of Emperor Xian and invented the formula of "commanding the lords in the Son of Heaven’s name." He unified the north by crushing Yuan Shao at Guandu, but Red Cliffs stopped him and split the realm in three. Merit-first recruitment, pragmatic policies like the military-farm system, and genuine gifts as a poet — the era’s most complex hero.',
    },
    imageDiff: {
      ko: '연의는 조조를 유비의 대척점에 선 간웅·악역으로 그리지만, 정사의 저자 진수는 "비상한 사람, 시대를 초월한 인걸(非常之人 超世之傑)"이라 평했어요. 문학사에서도 두 아들과 함께 건안 문학을 이끈 대시인으로 기록됩니다.',
      ja: '演義は曹操を劉備の対極に立つ姦雄・悪役として描きますが、正史の著者・陳寿は「非常の人、超世の傑」と評しました。文学史でも二人の息子とともに建安文学を率いた大詩人として記録されています。',
      en: 'The novel casts him as the villainous foil to Liu Bei, but the historian Chen Shou judged him "an extraordinary man, a hero transcending his age." Literary history also remembers him as a great poet who led the Jian’an school with his sons.',
    },
  },
  {
    id: 'cao-pi', hanja: '曹丕', name: { ko: '조비', ja: '曹丕', en: 'Cao Pi' },
    courtesy: { hanja: '子桓', read: { ko: '자환', ja: 'しかん', en: 'Zihuan' } },
    posthumous: { ko: '문제', ja: '文帝', en: 'Emperor Wen' },
    birth: '187', death: '226', faction: 'wei', role: 'civil',
    intro: {
      ko: '조조의 뒤를 이어 헌제의 선양을 받아 위나라 초대 황제가 된 인물이에요. 후계 경쟁에서 동생 조식을 누르고 세자가 되었고, 즉위 후 구품관인법을 시행해 위진 시대 관료제의 틀을 만들었습니다. 문학 비평서 전론을 남긴 문인이기도 해서, 아버지·동생과 함께 삼조(三曹)로 불립니다. 재위 7년 만에 마흔의 나이로 세상을 떠났어요.',
      ja: '曹操の跡を継ぎ、献帝の禅譲を受けて魏の初代皇帝となった人物です。後継争いで弟の曹植を抑えて世子となり、即位後は九品官人法を施行して魏晋時代の官僚制の枠組みを作りました。文学評論『典論』を残した文人でもあり、父・弟とともに三曹と呼ばれます。在位7年、四十歳で世を去りました。',
      en: 'Cao Cao’s heir, who accepted Emperor Xian’s abdication to become the first emperor of Wei. He beat his brother Cao Zhi in the succession contest, then instituted the nine-rank system that shaped bureaucracy for centuries. A genuine man of letters — his Essay on Literature survives — he is counted among the "Three Caos." He died at forty after only seven years on the throne.',
    },
    imageDiff: {
      ko: '연의에서는 동생 조식을 핍박하는 옹졸한 형(칠보시 일화)으로 부각되지만, 정사의 조비는 제도 정비에 능한 유능한 군주이자 중국 문학 비평의 개척자로 평가받아요.',
      ja: '演義では弟の曹植を追い詰める狭量な兄（七歩詩の逸話）として強調されますが、正史の曹丕は制度整備に長けた有能な君主であり、中国文学批評の開拓者と評価されています。',
      en: 'The novel plays up the petty older brother of the seven-pace-poem tale; the histories show a capable institution-builder and a pioneer of Chinese literary criticism.',
    },
  },
  {
    id: 'cao-zhi', hanja: '曹植', name: { ko: '조식', ja: '曹植', en: 'Cao Zhi' },
    courtesy: { hanja: '子建', read: { ko: '자건', ja: 'しけん', en: 'Zijian' } },
    birth: '192', death: '232', faction: 'wei', role: 'civil',
    intro: {
      ko: '조조의 아들이자 건안 문학 최고의 시인으로 꼽히는 천재예요. 붓을 들면 문장이 쏟아져 한때 아버지의 후계 후보로 총애받았지만, 자유분방한 성품 탓에 형 조비에게 자리를 내주었습니다. 형의 즉위 후에는 봉지를 전전하며 감시 속에 살았고, 그 울분이 낙신부 같은 걸작으로 승화되었어요. "천하의 재주가 한 섬이라면 조식이 여덟 말"이라는 재고팔두(才高八斗)의 주인공입니다.',
      ja: '曹操の息子で、建安文学最高の詩人と称される天才です。筆を執れば文章があふれ、一時は父の後継候補として寵愛されましたが、奔放な性格ゆえに兄・曹丕に座を譲りました。兄の即位後は封地を転々とし監視の中で生き、その鬱憤が『洛神賦』のような傑作に昇華されました。「天下の才が一石なら曹植が八斗」という才高八斗の主人公です。',
      en: 'Cao Cao’s son and the finest poet of the Jian’an age. Verse poured from his brush, and he was once favored as heir — until his free spirit cost him the succession to his brother Cao Pi. He spent the new reign shuffled between fiefs under watch, his frustration distilled into masterpieces like the Rhapsody on the Luo River Goddess. Of the world’s ten measures of talent, the saying goes, eight belonged to Cao Zhi.',
    },
    imageDiff: {
      ko: '유명한 칠보시(콩과 콩대) 일화는 정사가 아니라 후대 일화집 세설신어에 실린 이야기예요. 정사의 조식은 정치적 재기를 갈망하며 여러 차례 상소를 올린, 시대와 불화한 천재로 그려집니다.',
      ja: '有名な七歩詩（豆と豆がら）の逸話は正史ではなく、後代の逸話集『世説新語』に載る話です。正史の曹植は政治的再起を渇望して何度も上疏した、時代と不和だった天才として描かれます。',
      en: 'The famous seven-pace poem comes not from the histories but from the later anecdote collection Shishuo Xinyu. The historical Cao Zhi petitioned the throne again and again, a genius at odds with his times.',
    },
  },
  {
    id: 'xiahou-dun', hanja: '夏侯惇', name: { ko: '하후돈', ja: '夏侯惇', en: 'Xiahou Dun' },
    courtesy: { hanja: '元讓', read: { ko: '원양', ja: 'げんじょう', en: 'Yuanrang' } },
    birth: '?', death: '220', faction: 'wei', role: 'military',
    intro: {
      ko: '조조가 거병할 때부터 함께한 최측근 무장이에요. 여포군과 싸우다 왼쪽 눈에 화살을 맞아 애꾸가 되었고, 이후 "맹하후"라 불리며 위군의 정신적 지주가 되었습니다. 전공만큼이나 둔전 개간과 치수 같은 후방 경영에서 공이 컸고, 재물을 쌓지 않는 청렴함으로도 이름났어요. 조조가 같은 수레에 태울 만큼 신임한, 위나라 서열 제일의 공신입니다.',
      ja: '曹操の挙兵時から付き従った最側近の武将です。呂布軍との戦いで左目に矢を受けて隻眼となり、以後「盲夏侯」と呼ばれながら魏軍の精神的支柱となりました。戦功に劣らず屯田開墾や治水など後方経営での功が大きく、財を蓄えない清廉さでも知られました。曹操が同じ車に乗せるほど信任した、魏の筆頭功臣です。',
      en: 'Cao Cao’s companion from the very first muster. An arrow took his left eye fighting Lü Bu’s forces, and the "One-Eyed Xiahou" became the army’s moral anchor. His greatest services were as much logistical — farmland and waterworks — as martial, and he was famed for keeping no personal fortune. Cao Cao trusted him enough to share his own carriage: Wei’s foremost founding subject.',
    },
    imageDiff: {
      ko: '화살 맞은 자기 눈알을 삼켰다는 강렬한 장면은 연의의 창작이에요. 정사의 하후돈은 용장이라기보다 군을 안정시키고 백성을 먹인 관리형 명장에 가깝습니다.',
      ja: '矢に射られた自分の目玉を飲み込んだという強烈な場面は演義の創作です。正史の夏侯惇は猛将というより、軍を安定させ民を養った管理型の名将に近い人物です。',
      en: 'The gruesome scene of swallowing his own eyeball is the novel’s invention. The historical Xiahou Dun was less a berserker than a steadying administrator-general who fed armies and people alike.',
    },
  },
  {
    id: 'xiahou-yuan', hanja: '夏侯淵', name: { ko: '하후연', ja: '夏侯淵', en: 'Xiahou Yuan' },
    courtesy: { hanja: '妙才', read: { ko: '묘재', ja: 'みょうさい', en: 'Miaocai' } },
    birth: '?', death: '219', faction: 'wei', role: 'military',
    intro: {
      ko: '"사흘에 오백 리, 엿새에 천 리"라는 말이 붙을 만큼 속도전에 능했던 위의 서부 총사령관이에요. 서량의 반란 세력과 강족을 연이어 평정하며 관중·농서를 안정시켰습니다. 한중 방어전에서 유비군과 대치하던 중 정군산에서 황충의 기습에 전사했죠. 조조는 "장수란 겁낼 줄도 알아야 하는데 용맹에만 기댔다"며 그의 죽음을 안타까워했다고 전해요.',
      ja: '「三日で五百里、六日で千里」と言われるほど速攻に長けた魏の西部総司令官です。西涼の反乱勢力と羌族を次々と平定し、関中・隴西を安定させました。漢中防衛戦で劉備軍と対峙中、定軍山で黄忠の奇襲に倒れます。曹操は「将たる者は臆することも知るべきなのに、勇に頼りすぎた」とその死を惜しんだと伝わります。',
      en: 'Wei’s western commander-in-chief, so famed for speed that men said he covered "five hundred li in three days, a thousand in six." He pacified the Xiliang rebels and the Qiang tribes, securing the whole northwest. Facing Liu Bei over Hanzhong, he was cut down by Huang Zhong’s surprise assault at Mount Dingjun. A general, Cao Cao lamented, should also know how to fear.',
    },
    imageDiff: {
      ko: '연의에서는 황충의 노익장을 빛내는 상대역으로 소비되지만, 정사에서는 위나라 서부 전선을 홀로 지탱한 방면군 사령관급의 거물이에요.',
      ja: '演義では黄忠の老益壮を輝かせる相手役として消費されますが、正史では魏の西部戦線を一人で支えた方面軍司令官級の大物です。',
      en: 'The novel spends him as a foil for Huang Zhong’s late-life glory; in the histories he was the heavyweight who single-handedly held Wei’s entire western front.',
    },
  },
  {
    id: 'cao-ren', hanja: '曹仁', name: { ko: '조인', ja: '曹仁', en: 'Cao Ren' },
    courtesy: { hanja: '子孝', read: { ko: '자효', ja: 'しこう', en: 'Zixiao' } },
    birth: '168', death: '223', faction: 'wei', role: 'military',
    intro: {
      ko: '위나라 최고의 수성 명장으로 꼽히는 조조의 사촌 동생이에요. 적벽 직후 주유의 맹공을 강릉에서 1년 넘게 버텨냈고, 소수 기병으로 포위된 부하를 구출해 "하늘이 내린 장수(天人)"라는 감탄을 들었습니다. 관우의 수몰칠군으로 고립된 번성에서도 끝까지 성을 지켜 전선을 붕괴에서 구했죠. 화려한 공격보다 무너지지 않는 방어로 나라를 지킨 유형입니다.',
      ja: '魏最高の守城の名将と称される曹操の従弟です。赤壁直後、周瑜の猛攻を江陵で一年以上持ちこたえ、少数の騎兵で包囲された部下を救出して「天人」と感嘆されました。関羽の水淹七軍で孤立した樊城でも最後まで城を守り、戦線を崩壊から救います。華々しい攻めより、崩れない守りで国を支えたタイプです。',
      en: 'Cao Cao’s cousin and Wei’s greatest siege-defender. He held Jiangling against Zhou Yu’s onslaught for over a year after Red Cliffs, and a daring cavalry rescue of surrounded men earned him the cry "a man from Heaven!" Isolated at Fancheng by Guan Yu’s flood, he held the walls and saved the front. His glory was the defense that never broke.',
    },
    imageDiff: {
      ko: '연의에서는 제갈량과 주유에게 연달아 당하는 패장 이미지가 강하지만, 정사는 그를 위나라 방어전의 핵심이자 용맹이 으뜸가는 종실 명장으로 기록해요.',
      ja: '演義では諸葛亮と周瑜に立て続けにやられる敗将のイメージが強いものの、正史は彼を魏の防衛戦の要であり、勇猛随一の宗室の名将として記録しています。',
      en: 'The novel leaves an image of a general repeatedly bested by Zhuge Liang and Zhou Yu; the histories record the clan’s bravest man and the keystone of Wei’s defenses.',
    },
  },
  {
    id: 'zhang-liao', hanja: '張遼', name: { ko: '장료', ja: '張遼', en: 'Zhang Liao' },
    courtesy: { hanja: '文遠', read: { ko: '문원', ja: 'ぶんえん', en: 'Wenyuan' } },
    birth: '169', death: '222', faction: 'wei',
    factionNote: { ko: '정원·동탁·여포를 거쳐 위로', ja: '丁原・董卓・呂布を経て魏へ', en: 'Served Ding Yuan, Dong Zhuo and Lü Bu before Wei' },
    role: 'military',
    intro: {
      ko: '여포의 부장으로 시작해 위나라 오자양장의 첫손에 꼽히게 된 명장이에요. 하비에서 여포가 몰락한 뒤 조조에게 발탁되어 백랑산에서 오환 선우를 베는 등 공을 쌓았습니다. 합비에서는 800 결사대로 손권의 10만 대군을 무너뜨려 "장료가 온다"는 이름만으로 강동을 떨게 했죠. 항장 출신이라는 꼬리표를 실력 하나로 지워버린 입지전적 인물입니다.',
      ja: '呂布の部将から始まり、魏の五将軍の筆頭に数えられるようになった名将です。下邳で呂布が滅んだ後、曹操に抜擢され、白狼山で烏丸単于を斬るなど功を重ねました。合肥では八百の決死隊で孫権の十万の大軍を崩し、「遼来来」の名だけで江東を震え上がらせます。降将という札を実力一つで消し去った立志伝中の人物です。',
      en: 'From Lü Bu’s lieutenant to the first of Wei’s Five Elite Generals. Picked up by Cao Cao after Xiapi, he cut down the Wuhuan khan at White Wolf Mountain — and at Hefei, his 800 volunteers broke Sun Quan’s 100,000, until his mere name frightened the Southland. A surrendered officer who erased the label through sheer ability.',
    },
    imageDiff: {
      ko: '연의도 정사도 합비의 장료는 똑같이 압도적이에요. 다만 관우와의 우정 서사는 연의가 크게 부풀린 부분으로, 정사에는 관우의 마음을 조조에게 전한 일화 정도가 남아 있습니다.',
      ja: '演義でも正史でも合肥の張遼は同じく圧倒的です。ただ関羽との友情の物語は演義が大きく膨らませた部分で、正史には関羽の心中を曹操に伝えた逸話程度が残るのみです。',
      en: 'Both novel and history agree on his dominance at Hefei. The friendship with Guan Yu, though, is largely the novel’s embroidery — the histories preserve only his relaying of Guan Yu’s intentions to Cao Cao.',
    },
  },
  {
    id: 'xu-huang', hanja: '徐晃', name: { ko: '서황', ja: '徐晃', en: 'Xu Huang' },
    courtesy: { hanja: '公明', read: { ko: '공명', ja: 'こうめい', en: 'Gongming' } },
    birth: '?', death: '227', faction: 'wei', role: 'military',
    intro: {
      ko: '위나라 오자양장의 한 사람으로, 군율의 엄정함이 트레이드마크인 명장이에요. 백파적 출신 상관을 떠나 조조에게 귀순한 뒤 관도·적벽·동관 등 주요 전역을 두루 누볐습니다. 백미는 번성 구원전 — 수몰칠군으로 기세가 오른 관우의 포위망을 정면으로 뚫어냈죠. 조조는 "서황의 군영은 주아부(전한의 명장)의 풍모"라며 극찬했습니다.',
      ja: '魏の五将軍の一人で、軍律の厳正さがトレードマークの名将です。白波賊出身の上官のもとを離れて曹操に帰順した後、官渡・赤壁・潼関など主要な戦役を渡り歩きました。白眉は樊城救援戦 — 水淹七軍で勢いに乗る関羽の包囲網を正面から突き破りました。曹操は「徐晃の軍営には周亜夫（前漢の名将）の風格がある」と絶賛しています。',
      en: 'One of Wei’s Five Elite Generals, famed above all for iron discipline. Leaving his bandit-army origins to join Cao Cao, he fought through Guandu, Red Cliffs and Tong Pass. His masterpiece was the relief of Fancheng, smashing head-on through the siege lines of a Guan Yu at the height of his power. Cao Cao compared his camps to those of the legendary Zhou Yafu.',
    },
    imageDiff: {
      ko: '연의는 서황을 관우의 옛 친구이자 도끼 쓰는 장수로 그려요. 정사에서 두 사람의 친분 기록은 소략하지만, 번성에서 사적인 정을 접고 정면 대결한 것은 양쪽 모두에 남아 있는 사실입니다.',
      ja: '演義は徐晃を関羽の旧友で斧の使い手として描きます。正史で二人の親交の記録はわずかですが、樊城で私情を捨てて正面から戦ったことは、双方に残る事実です。',
      en: 'The novel makes him Guan Yu’s old friend with a great axe. The histories say little of the friendship — but that he set sentiment aside and fought Guan Yu head-on at Fancheng is fact in both tellings.',
    },
  },
  {
    id: 'zhang-he', hanja: '張郃', name: { ko: '장합', ja: '張郃', en: 'Zhang He' },
    courtesy: { hanja: '儁乂', read: { ko: '준예', ja: 'しゅんがい', en: 'Junyi' } },
    birth: '?', death: '231', faction: 'wei',
    factionNote: { ko: '원소 휘하에서 관도 때 위로 투항', ja: '袁紹麾下から官渡の際に魏へ降る', en: 'Defected from Yuan Shao to Wei at Guandu' },
    role: 'military',
    intro: {
      ko: '원소군의 명장으로 시작해 관도에서 조조에게 투항한 뒤, 위나라에서 30년을 더 싸운 오자양장의 일원이에요. 지형을 읽는 눈이 탁월해 "변화를 헤아리는 데 능하다"는 평을 들었고, 제갈량 북벌기에는 촉군이 가장 두려워한 상대였습니다. 가정에서 마속을 격파해 1차 북벌을 좌절시킨 것이 대표 전공이죠. 목문도에서 철수하는 촉군을 추격하다 복병의 화살에 전사했습니다.',
      ja: '袁紹軍の名将から官渡で曹操に降り、その後魏で30年戦い続けた五将軍の一人です。地形を読む眼が卓越し「変を料るに長ず」と評され、諸葛亮の北伐期には蜀軍が最も恐れた相手でした。街亭で馬謖を撃破して第一次北伐を挫いたのが代表的戦功です。木門道で撤退する蜀軍を追撃中、伏兵の矢に倒れました。',
      en: 'A star of Yuan Shao’s army who came over to Cao Cao at Guandu — then fought for Wei for thirty more years among its Five Elite Generals. Praised for "mastery of changing circumstances," he was the man Shu feared most during Zhuge Liang’s campaigns, above all after crushing Ma Su at Jieting. He fell to ambush arrows at Mumen Trail, pursuing a retreating Shu army.',
    },
    imageDiff: {
      ko: '연의에서는 장비·조운에게 자주 패하는 역할이지만, 정사의 장합은 촉의 명장들조차 꺼린 백전노장이에요. 목문도 전사도 연의는 사마의의 강요 탓으로 각색했습니다.',
      ja: '演義では張飛・趙雲によく敗れる役回りですが、正史の張郃は蜀の名将たちさえ憚った歴戦の宿将です。木門道での戦死も、演義は司馬懿の強要のせいに脚色しました。',
      en: 'The novel keeps him losing to Zhang Fei and Zhao Yun; the historical Zhang He was the veteran even Shu’s best avoided. His death, too, is reworked in the novel as Sima Yi’s doing.',
    },
  },
  {
    id: 'dian-wei', hanja: '典韋', name: { ko: '전위', ja: '典韋', en: 'Dian Wei' },
    birth: '?', death: '197', faction: 'wei', role: 'military',
    intro: {
      ko: '한 쌍의 철극을 휘두른 조조의 호위대장이에요. 복양에서 여포군에 포위된 조조를 구할 때는 "적이 열 걸음 앞에 오면 알려라" 하고는 짧은 창을 던져 길을 열었다는 일화가 남아 있습니다. 완성에서 장수의 야습이 벌어지자 홀로 군문을 막아섰고, 무기를 잃은 뒤에도 맨몸으로 싸우다 장렬히 전사해 조조가 목 놓아 울었죠. 몸으로 주군을 지킨 충성의 대명사입니다.',
      ja: '一対の鉄戟を振るった曹操の護衛隊長です。濮陽で呂布軍に包囲された曹操を救う際は「敵が十歩先に来たら知らせよ」と言い、短戟を投げて血路を開いたという逸話が残ります。宛城で張繡の夜襲が起こると単身で軍門に立ちはだかり、武器を失った後も素手で戦って壮絶に戦死し、曹操は声を上げて泣きました。身をもって主君を守った忠義の代名詞です。',
      en: 'Cao Cao’s bodyguard captain, wielder of twin iron halberds. Rescuing his lord at Puyang, he reportedly said "tell me when they’re ten paces away" — then cleared the road with thrown halberds. When Zhang Xiu struck at night in Wancheng, Dian Wei alone barred the camp gate, fighting bare-handed after his weapons broke until he died on his feet. Cao Cao wept aloud for him.',
    },
    imageDiff: {
      ko: '"고대의 악래(전설의 장사)"라는 별명과 완성의 최후는 정사 기록 그대로예요. 연의는 여기에 살이 붙었을 뿐, 원본부터 이미 소설 같은 인물입니다.',
      ja: '「古の悪来（伝説の力士）」という異名と宛城での最期は正史の記録そのままです。演義はここに肉付けしただけで、原典からすでに小説のような人物です。',
      en: 'The nickname "E Lai of old" and the last stand at Wancheng are straight from the histories — the novel merely added flesh to a man who was already legend on the page.',
    },
  },
  {
    id: 'xu-chu', hanja: '許褚', name: { ko: '허저', ja: '許褚', en: 'Xu Chu' },
    courtesy: { hanja: '仲康', read: { ko: '중강', ja: 'ちゅうこう', en: 'Zhongkang' } },
    birth: '?', death: '?', faction: 'wei', role: 'military',
    intro: {
      ko: '전위의 뒤를 이어 조조의 곁을 지킨 경호대장이에요. 소를 꼬리째 끌고 백 보를 걸었다는 괴력의 사나이로, 호위병답게 과묵해 "호치(虎癡, 호랑이 바보)"라는 별명을 얻었습니다. 동관에서 마초가 조조를 노리자 눈을 부릅뜨고 곁을 지켜 감히 손을 못 쓰게 했고, 배로 강을 건널 때는 한 손으로 안장을 들어 화살을 막으며 조조를 구했죠. 조조 사후 그 무덤 앞에서 피를 토하며 울었다고 전합니다.',
      ja: '典韋の後を継いで曹操のそばを守った警護隊長です。牛を尻尾ごと引きずって百歩歩いたという怪力の持ち主で、護衛らしく寡黙だったため「虎痴」の異名を得ました。潼関で馬超が曹操を狙うと目を見開いてそばに立ち、手を出させませんでした。船で川を渡る際は片手で鞍を掲げて矢を防ぎ、曹操を救っています。曹操の死後、その墓前で血を吐いて泣いたと伝わります。',
      en: 'Dian Wei’s successor as Cao Cao’s shield. A giant said to have dragged an ox backward a hundred paces, so taciturn they called him the "Tiger Fool." At Tong Pass his glare alone kept Ma Chao from striking at Cao Cao; crossing the river, he held up a saddle one-handed to block the arrows. After Cao Cao’s death, he is said to have wept blood at the tomb.',
    },
    imageDiff: {
      ko: '연의의 명장면인 "맨몸으로 마초와 격투"는 각색이지만, 동관에서 눈빛만으로 마초를 제지한 일은 정사에 있어요. 정사와 연의 모두에서 우직한 충성의 화신입니다.',
      ja: '演義の名場面「裸身で馬超と格闘」は脚色ですが、潼関で眼光だけで馬超を制した話は正史にあります。正史でも演義でも愚直な忠誠の化身です。',
      en: 'The novel’s shirtless duel with Ma Chao is invention, but staring him down at Tong Pass is history. In both tellings he is loyalty made flesh.',
    },
  },
  {
    id: 'xun-yu', hanja: '荀彧', name: { ko: '순욱', ja: '荀彧', en: 'Xun Yu' },
    courtesy: { hanja: '文若', read: { ko: '문약', ja: 'ぶんじゃく', en: 'Wenruo' } },
    birth: '163', death: '212', faction: 'wei', role: 'civil',
    intro: {
      ko: '"왕을 보좌할 재목(王佐之才)"이라 불린 조조 진영의 총사령탑이에요. 헌제를 허도로 모시자는 결정적 진언을 했고, 관도대전에서는 후퇴를 고민하는 조조를 편지 한 통으로 붙잡아 대승으로 이끌었습니다. 곽가·순유 등 기라성 같은 인재를 천거한 인사 책임자이기도 했죠. 그러나 조조가 위공에 오르려 하자 한실의 신하로서 반대했고, 실의 속에 세상을 떠났습니다.',
      ja: '「王佐の才」と呼ばれた曹操陣営の総司令塔です。献帝を許都に迎えるという決定的な進言を行い、官渡の戦いでは撤退を悩む曹操を一通の手紙で引き留めて大勝に導きました。郭嘉・荀攸ら綺羅星のごとき人材を推挙した人事の責任者でもあります。しかし曹操が魏公に上ろうとすると漢室の臣として反対し、失意の中で世を去りました。',
      en: 'The "talent fit to aid kings" who served as the brain of Cao Cao’s camp. His was the decisive counsel to take in Emperor Xian, and at Guandu a single letter from him kept a wavering Cao Cao in the fight until victory. He was also the great talent-spotter who recommended Guo Jia and others. But when Cao Cao reached for a dukedom, Xun Yu — a Han loyalist to the end — opposed him, and died in sorrow.',
    },
    imageDiff: {
      ko: '연의는 조조가 보낸 빈 찬합을 받고 자결하는 장면으로 극화했지만, 정사는 "근심 속에 병사했다"고만 적어요. 조조의 참모이면서 마지막까지 한나라의 신하이고자 했던 이중성이 이 인물의 핵심입니다.',
      ja: '演義は曹操が送った空の食盒を受け取って自決する場面に脚色しましたが、正史は「憂いのうちに病死した」と記すのみです。曹操の参謀でありながら最後まで漢の臣であろうとした二重性がこの人物の核心です。',
      en: 'The novel dramatizes his end with Cao Cao’s empty food box and a suicide; the histories say only that he died of grief. His essence is the paradox: Cao Cao’s chief strategist who remained, at heart, a servant of the Han.',
    },
  },
  {
    id: 'guo-jia', hanja: '郭嘉', name: { ko: '곽가', ja: '郭嘉', en: 'Guo Jia' },
    courtesy: { hanja: '奉孝', read: { ko: '봉효', ja: 'ほうこう', en: 'Fengxiao' } },
    birth: '170', death: '207', faction: 'wei', role: 'civil',
    intro: {
      ko: '조조가 "내 큰일을 이뤄줄 사람"이라 단언한 천재 참모예요. 원소를 떠나 조조를 택하며 십승십패론으로 승리를 예언했고, 여포전의 수공, 원씨 형제의 자멸 예측, "병귀신속"의 오환 원정까지 — 내놓는 수마다 적중했습니다. 서른여덟에 요절하자 조조는 적벽 패전 후 "봉효가 있었다면 이 지경이 되지 않았다"며 통곡했죠. 짧게 타오르고 사라진 불꽃 같은 지략가입니다.',
      ja: '曹操が「わが大業を成させてくれる者」と断言した天才参謀です。袁紹を離れて曹操を選び、十勝十敗論で勝利を予言。呂布戦の水攻め、袁氏兄弟の自滅予測、「兵は神速を貴ぶ」の烏丸遠征まで — 打つ手打つ手が的中しました。三十八歳で早世すると、曹操は赤壁の敗戦後「奉孝がいればこの様にはならなかった」と慟哭します。短く燃えて消えた炎のような知略家です。',
      en: 'The prodigy Cao Cao called "the man who will complete my great work." Leaving Yuan Shao for Cao Cao, he foretold victory with his "ten reasons you will win," then called every shot: the flooding of Lü Bu, the Yuan brothers’ self-destruction, the lightning Wuhuan campaign. Dead at thirty-eight — after Red Cliffs, Cao Cao wept that with Fengxiao alive, it would never have come to this.',
    },
    imageDiff: {
      ko: '정사와 연의의 상이 크게 다르지 않은 드문 인물이에요. 다만 "곽가가 죽으며 요동 평정책을 남겼다(유계정요동)"는 연의의 마지막 계책은 창작입니다.',
      ja: '正史と演義の像が大きく違わない珍しい人物です。ただし「郭嘉が死に際して遼東平定策を残した（遺計定遼東）」という演義の最後の計略は創作です。',
      en: 'One of the rare figures the novel barely needed to embellish — though his deathbed "final stratagem" for pacifying Liaodong is fiction.',
    },
  },
  {
    id: 'jia-xu', hanja: '賈詡', name: { ko: '가후', ja: '賈詡', en: 'Jia Xu' },
    courtesy: { hanja: '文和', read: { ko: '문화', ja: 'ぶんか', en: 'Wenhe' } },
    birth: '147', death: '223', faction: 'wei',
    factionNote: { ko: '동탁 잔당·장수를 거쳐 위로', ja: '董卓残党・張繡を経て魏へ', en: 'Served Dong Zhuo’s remnants and Zhang Xiu before Wei' },
    role: 'civil',
    intro: {
      ko: '난세에서 가장 오래, 가장 높이 살아남은 처세의 달인이자 독보적 책사예요. 완성에서 조조에게 치명타를 입힌 야습을 설계하고도, 훗날 그 조조에게 귀순해 최고 대우를 받았습니다. 동관에서는 이간계 한 수로 마초·한수 연합을 무너뜨렸고, 후계 문제를 묻는 조조에게 "원소와 유표 부자를 생각하고 있었습니다"라는 한마디로 조비의 세자 책봉을 결정지었죠. 위나라의 삼공에 올라 일흔일곱까지 천수를 누렸습니다.',
      ja: '乱世で最も長く、最も高く生き残った処世の達人にして独歩の策士です。宛城で曹操に致命傷を与えた夜襲を設計しながら、後にその曹操に帰順して最高の待遇を受けました。潼関では離間の計の一手で馬超・韓遂連合を崩し、後継問題を問う曹操に「袁紹と劉表の父子を考えておりました」の一言で曹丕の世子冊立を決定づけます。魏の三公に上り、七十七歳まで天寿を全うしました。',
      en: 'The supreme survivor of the age — and its most unerring strategist. He designed the night raid that nearly killed Cao Cao at Wancheng, then later joined Cao Cao and was welcomed with honors. One wedge-driving scheme of his broke the Ma Chao–Han Sui alliance at Tong Pass; one oblique sentence — "I was thinking of Yuan Shao and Liu Biao" — settled the Wei succession on Cao Pi. He died one of the Three Excellencies, at seventy-seven.',
    },
    imageDiff: {
      ko: '연의에서는 출연이 소략하지만, 정사의 가후는 "계책이 어긋난 적이 거의 없다"는 평을 받은 최상급 모사예요. 스스로를 낮추고 문을 닫아걸어 의심을 피한 처세술까지, 지략의 완성형으로 기록됩니다.',
      ja: '演義では出番が控えめですが、正史の賈詡は「策がほぼ外れたことがない」と評された最上級の謀士です。自らを低くし門を閉ざして疑いを避けた処世術まで、知略の完成形として記録されています。',
      en: 'The novel gives him little stage time, but the histories rate him near-infallible — and note the self-effacement, the closed gates, the studied avoidance of suspicion that made his brilliance survivable.',
    },
  },
  {
    id: 'sima-yi', hanja: '司馬懿', name: { ko: '사마의', ja: '司馬懿', en: 'Sima Yi' },
    courtesy: { hanja: '仲達', read: { ko: '중달', ja: 'ちゅうたつ', en: 'Zhongda' } },
    posthumous: { ko: '선제(추존)', ja: '宣帝（追尊）', en: 'Emperor Xuan (posthumous)' },
    birth: '179', death: '251', faction: 'wei', role: 'both',
    intro: {
      ko: '위나라의 대들보이자, 결과적으로 그 위나라를 삼킨 사마씨 천하의 설계자예요. 조조·조비·조예·조방 4대를 섬기며 맹달의 반란을 8일 만에 진압하고 요동을 평정했습니다. 제갈량의 북벌은 정면 대결을 피하는 지구전으로 막아냈고, 오장원에서 최대의 적수를 떠나보냈죠. 이후 십 년 가까이 은인자중하다 고평릉 정변 한 방으로 실권을 장악 — 손자 사마염이 진나라를 세우며 삼국시대의 최종 승자가 되었습니다.',
      ja: '魏の大黒柱にして、結果的にその魏を呑み込んだ司馬氏の天下の設計者です。曹操・曹丕・曹叡・曹芳の四代に仕え、孟達の反乱を8日で鎮圧し遼東を平定しました。諸葛亮の北伐は正面対決を避ける持久戦で防ぎ切り、五丈原で最大の好敵手を見送ります。その後十年近く雌伏し、高平陵の変の一撃で実権を掌握 — 孫の司馬炎が晋を建て、三国時代の最終勝者となりました。',
      en: 'The pillar of Wei — and the architect of the Sima ascendancy that ultimately swallowed it. Serving four generations of Cao rulers, he crushed Meng Da’s revolt in eight days and pacified Liaodong. Against Zhuge Liang he waged patient attrition, refusing battle until his great rival died at Wuzhang Plains. Then, after a decade of feigned retirement, one coup at Gaopingling gave him the state; his grandson founded the Jin. The last man standing of the Three Kingdoms.',
    },
    imageDiff: {
      ko: '연의는 제갈량을 빛내기 위해 사마의를 공성계에 속고 목상에 놀라 달아나는 조연으로 깎아내렸어요. 정사의 사마의는 위의 국방을 홀로 짊어진 당대 최고의 전략가이자, 때를 기다릴 줄 아는 정치가입니다.',
      ja: '演義は諸葛亮を輝かせるため、司馬懿を空城の計に騙され木像に驚いて逃げる脇役に貶めました。正史の司馬懿は魏の国防を一身に背負った当代最高の戦略家であり、時を待つことを知る政治家です。',
      en: 'To glorify Zhuge Liang, the novel demotes him to the dupe of the empty fort and the fleeing victim of a wooden statue. The historical Sima Yi carried Wei’s entire defense on his shoulders — the era’s finest strategist, and its most patient politician.',
    },
  },
  {
    id: 'yang-xiu', hanja: '楊修', name: { ko: '양수', ja: '楊修', en: 'Yang Xiu' },
    courtesy: { hanja: '德祖', read: { ko: '덕조', ja: 'とくそ', en: 'Dezu' } },
    birth: '175', death: '219', faction: 'wei', role: 'civil',
    intro: {
      ko: '명문가 출신으로 조조의 속마음을 번번이 꿰뚫어 본 재사예요. 한중 철군을 앞둔 암구호 "계륵"의 뜻을 홀로 알아채고 짐을 쌌다는 일화가 대표적입니다. 조식의 참모로 후계 경쟁에 깊이 관여했고, 조조가 낼 시험 문제의 모범답안을 미리 만들어 줄 정도였죠. 결국 군심을 어지럽혔다는 죄목으로 처형되었는데, 그 재능이 화를 불렀다는 평이 따라다닙니다.',
      ja: '名門の出で、曹操の胸中をたびたび見抜いた才人です。漢中撤退を前にした合言葉「鶏肋」の意味を一人で察して荷をまとめた逸話が代表的です。曹植の参謀として後継争いに深く関与し、曹操が出す試験の模範解答を先回りして作るほどでした。結局、軍心を乱したかどで処刑されましたが、その才が災いを招いたという評が付きまといます。',
      en: 'A scion of a great family with an uncanny knack for reading Cao Cao’s mind — most famously packing his bags the night the watchword "chicken ribs" was given. As Cao Zhi’s adviser he was deep in the succession fight, even pre-writing model answers for Cao Cao’s tests of his sons. He was executed for unsettling the army; posterity’s verdict is that his brilliance was the blade that killed him.',
    },
    imageDiff: {
      ko: '"재주를 드러내다 조조의 미움을 사 죽었다"는 서사는 연의가 다듬은 것이고, 정사 쪽 기록은 조식 편에 서서 후계 분쟁에 얽힌 정치적 처형에 가깝게 읽혀요.',
      ja: '「才をひけらかして曹操の憎しみを買い殺された」という物語は演義が磨き上げたもので、正史寄りの記録は曹植側に立って後継争いに絡んだ政治的処刑に近いものとして読めます。',
      en: 'The "killed for showing off his wit" arc is the novel’s polish; the historical record reads more like a political execution of Cao Zhi’s chief partisan in the succession struggle.',
    },
  },
]
