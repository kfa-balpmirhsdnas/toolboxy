// Three Kingdoms idioms — part 2/2: 정사 주석 7 + 연의 6 + 후대 2.
import type { TKIdiom } from './threeKingdomsIdioms'

export const IDIOMS_B: TKIdiom[] = [
  {
    slug: 'gwalmoksangdae', hanja: '刮目相對', ko: '괄목상대', ja: '刮目相待（かつもくそうたい）', pinyin: 'guā mù xiāng dài', enLit: 'Rubbing One’s Eyes and Looking Again',
    src: 'annot', srcName: { ko: '강표전(삼국지 여몽전 배송지주 인용)', ja: '江表伝（『三国志』呂蒙伝 裴松之注）', en: 'Jiangbiao Zhuan (Pei Songzhi’s annotations to Lü Meng’s biography)' },
    people: ['lv-meng', 'lu-su'],
    meaning: {
      ko: '눈을 비비고 다시 볼 만큼 상대의 실력이 몰라보게 늘었다는 뜻이에요. 짧은 사이 눈부시게 성장한 사람에게 씁니다.',
      ja: '目をこすってもう一度見るほど、相手の実力が見違えるほど伸びたという意味です。短い間に目覚ましく成長した人に使います。',
      en: 'Someone has improved so much you must rub your eyes and look again — dramatic growth in a short time.',
    },
    story: {
      ko: '오의 장수 여몽은 용맹했지만 배움이 짧아 무식하다는 소리를 듣곤 했어요. 주군 손권이 "장수일수록 책을 읽어야 한다"고 권하자, 여몽은 전장에서도 책을 놓지 않으며 무섭게 공부했습니다. 얼마 뒤 노숙이 여몽과 국사를 논하다 그 식견에 깜짝 놀라 "언제 이렇게 박식해졌는가, 오나라 촌구석의 아몽이 아니구나"라고 감탄했죠. 여몽은 웃으며 답했습니다. "선비는 헤어진 지 사흘이면 눈을 비비고 다시 봐야 합니다(刮目相對)." 노력으로 자신을 갈아치운 사람의 당당한 한마디에서 괄목상대가 나왔어요.',
      ja: '呉の武将・呂蒙は勇猛でしたが学が浅く、無学と言われがちでした。主君の孫権が「将こそ書を読むべきだ」と勧めると、呂蒙は戦場でも書を手放さず猛烈に学びました。しばらくして魯粛が呂蒙と国事を論じ、その見識に驚いて「いつの間にこれほど博識に。呉の田舎の阿蒙ではないな」と感嘆します。呂蒙は笑って答えました。「士は別れて三日たてば、刮目して相待つべきです」。努力で自分を作り変えた者の堂々たる一言から、刮目相待が生まれました。',
      en: 'Lü Meng of Wu was a brave general mocked for his lack of learning. When his lord Sun Quan urged that a commander above all must read, Lü Meng threw himself into study, book in hand even on campaign. Some time later, Lu Su, debating state affairs with him, was astonished at his insight: "When did you become so learned? You are no longer the country boy A-Meng of Wu!" Lü Meng smiled: "Part from a scholar for three days, and you must rub your eyes when you meet him again." From that proud reply of a self-remade man comes the idiom.',
    },
    ex: [
      { ko: '반 년 만에 본 후배의 코드는 괄목상대할 수준이었다.', ja: '半年ぶりに見た後輩のコードは刮目に値する出来だった。', en: 'Six months later, the junior dev’s code had improved so much I had to look twice.' },
      { ko: '피나는 연습으로 그 선수는 한 시즌 만에 괄목상대했다.', ja: '血のにじむ練習で、あの選手はワンシーズンで見違えるほど成長した。', en: 'Through relentless practice, the player transformed beyond recognition in a single season.' },
    ],
    rel: ['ohaamong', 'subulseokgwon', 'baekmi'],
  },
  {
    slug: 'ohaamong', hanja: '吳下阿蒙', ko: '오하아몽', ja: '呉下の阿蒙（ごかのあもう）', pinyin: 'wú xià ā méng', enLit: 'The Old A-Meng of Wu',
    src: 'annot', srcName: { ko: '강표전(삼국지 여몽전 배송지주 인용)', ja: '江表伝（『三国志』呂蒙伝 裴松之注）', en: 'Jiangbiao Zhuan (Pei Songzhi’s annotations to Lü Meng’s biography)' },
    people: ['lv-meng', 'lu-su'],
    meaning: {
      ko: '언제까지나 발전 없이 예전 그대로인 사람을 뜻해요. 주로 "이제 오하아몽이 아니다"처럼, 몰라보게 성장했다는 부정형으로 씁니다.',
      ja: 'いつまでも進歩がなく昔のままの人を意味します。主に「もはや呉下の阿蒙にあらず」のように、見違えるほど成長したという否定形で使います。',
      en: 'Someone stuck exactly as they were — most often used in the negative: "no longer the old A-Meng," meaning utterly transformed.',
    },
    story: {
      ko: '괄목상대와 같은 장면에서 나온 짝꿍 성어예요. 학문과 담을 쌓았던 여몽이 손권의 권유로 책에 파묻혀 지낸 뒤, 노숙은 그와 이야기를 나누다 완전히 달라진 식견에 놀랐습니다. 그때 노숙이 한 말이 "그대는 더 이상 오나라 시골의 아몽(阿蒙)이 아니구려"였죠. 아몽은 여몽의 아명으로, "촌구석 아몽"은 무식했던 옛날의 여몽을 가리킵니다. 그래서 오하아몽은 발전 없는 옛 모습 그대로의 사람을, "오하아몽이 아니다"는 몰라보게 성장했음을 뜻하게 되었어요.',
      ja: '刮目相待と同じ場面から生まれた対の成語です。学問と縁のなかった呂蒙が孫権の勧めで書物に没頭した後、魯粛は彼と語らってすっかり変わった見識に驚きました。そのとき魯粛が言ったのが「君はもはや呉下の阿蒙ではないな」です。阿蒙は呂蒙の幼名で、「呉下の阿蒙」は無学だった昔の呂蒙を指します。そこから呉下の阿蒙は進歩のない昔のままの人を、「呉下の阿蒙にあらず」は見違えるほど成長したことを意味するようになりました。',
      en: 'This is the twin idiom born from the same scene as "rubbing one’s eyes." After the unlettered general Lü Meng buried himself in books at Sun Quan’s urging, Lu Su was stunned by his transformed insight and exclaimed: "You are no longer the A-Meng of backwater Wu!" A-Meng was Lü Meng’s childhood name — shorthand for his old, unschooled self. Hence the phrase came to mean someone unchanged and unimproved, while its negative — "no longer the old A-Meng" — celebrates a stunning transformation.',
    },
    ex: [
      { ko: '유학을 다녀온 그는 더 이상 오하아몽이 아니었다.', ja: '留学から戻った彼は、もはや呉下の阿蒙ではなかった。', en: 'Back from studying abroad, he was no longer the A-Meng everyone remembered.' },
      { ko: '늘 같은 방식만 고집하면 오하아몽 소리를 듣기 마련이다.', ja: 'いつも同じやり方に固執していては、呉下の阿蒙と言われても仕方ない。', en: 'Cling to the same old ways forever and people will say you never left the backwater.' },
    ],
    rel: ['gwalmoksangdae', 'subulseokgwon', 'dandobuhoe'],
  },
  {
    slug: 'subulseokgwon', hanja: '手不釋卷', ko: '수불석권', ja: '手不釈巻（しゅふしゃくかん）', pinyin: 'shǒu bù shì juàn', enLit: 'Never Without a Book in Hand',
    src: 'annot', srcName: { ko: '강표전(삼국지 여몽전 배송지주 인용)', ja: '江表伝（『三国志』呂蒙伝 裴松之注）', en: 'Jiangbiao Zhuan (Pei Songzhi’s annotations to Lü Meng’s biography)' },
    people: ['lv-meng', 'sun-quan'],
    meaning: {
      ko: '손에서 책을 놓지 않는다는 뜻으로, 틈만 나면 공부하는 성실한 배움의 자세를 가리켜요. 독서광이나 꾸준한 학습자를 칭찬할 때 씁니다.',
      ja: '手から書物を放さないという意味で、暇さえあれば学ぶ勤勉な姿勢を指します。読書家やたゆまぬ学習者を称えるときに使います。',
      en: 'Never letting the book leave one’s hand — studying at every spare moment. High praise for a devoted reader or lifelong learner.',
    },
    story: {
      ko: '손권이 여몽에게 학문을 권하자 여몽은 "군중에 일이 많아 책 읽을 겨를이 없다"고 사양했어요. 그러자 손권은 자신을 예로 들며 타일렀습니다. "그대에게 경전 박사가 되라는 게 아니다. 나도 어릴 적부터 책을 읽었고 나라를 다스리는 지금도 손에서 책을 놓지 않는다(手不釋卷). 후한의 광무제는 전쟁 중에도 책을 놓지 않았고, 조조 역시 늙어서도 배움을 즐긴다 하지 않는가." 바쁨은 핑계가 되지 않는다는 이 설득에 여몽은 분발했고, 훗날 괄목상대의 주인공이 됩니다. 손에서 책을 놓지 않는 자세, 수불석권은 여기서 나왔어요.',
      ja: '孫権が呂蒙に学問を勧めると、呂蒙は「軍中は多忙で書を読む暇がありません」と断りました。すると孫権は自らを例に挙げて諭します。「そなたに経学の博士になれと言うのではない。私も幼い頃から書を読み、国を治める今も手から書物を放さない。後漢の光武帝は戦の最中も書を手放さず、曹操もまた老いてなお学を楽しむというではないか」。多忙は言い訳にならぬというこの説得に呂蒙は奮起し、後に刮目相待の主人公となります。手から書を放さぬ姿勢、手不釈巻はここから生まれました。',
      en: 'When Sun Quan urged Lü Meng to study, the general demurred: army life left no time for books. Sun Quan pressed him with his own example: "I don’t ask you to become a classics scholar. I have read since childhood, and even ruling a kingdom I never let a book leave my hand. Emperor Guangwu kept reading in the midst of war; Cao Cao says he still delights in learning as he grows old." Busyness, in other words, is no excuse. Lü Meng took it to heart and became the hero of the rub-your-eyes story — and the phrase for a hand never empty of books was born.',
    },
    ex: [
      { ko: '그녀는 지하철에서도 수불석권이라 1년에 백 권을 읽는다.', ja: '彼女は地下鉄でも手不釈巻で、年に百冊を読む。', en: 'Book in hand even on the subway, she gets through a hundred a year.' },
      { ko: '수불석권하던 신입이 3년 만에 팀의 기술 리더가 됐다.', ja: '手不釈巻だった新人が3年でチームの技術リーダーになった。', en: 'The new hire who never stopped studying became the team’s tech lead in three years.' },
    ],
    rel: ['gwalmoksangdae', 'ohaamong', 'gaemuneupdo'],
  },
  {
    slug: 'biyukjitan', hanja: '髀肉之嘆', ko: '비육지탄', ja: '髀肉の嘆（ひにくのたん）', pinyin: 'bì ròu zhī tàn', enLit: 'Lamenting the Fat on One’s Thighs',
    src: 'annot', srcName: { ko: '구주춘추(삼국지 선주전 배송지주 인용)', ja: '九州春秋（『三国志』先主伝 裴松之注）', en: 'Jiuzhou Chunqiu (Pei Songzhi’s annotations to Liu Bei’s biography)' },
    people: ['liu-bei'],
    meaning: {
      ko: '말을 탈 일이 없어 허벅지에 살만 오른 것을 한탄한다는 뜻으로, 뜻을 펼치지 못한 채 세월만 보내는 안타까움을 가리켜요. 재능을 썩히고 있다는 자탄에 씁니다.',
      ja: '馬に乗る機会がなく腿に肉がついたことを嘆くという意味で、志を果たせぬまま歳月だけが過ぎる無念さを指します。才能を持て余しているという自嘆に使います。',
      en: 'Grieving that one’s thighs have grown fat from too long out of the saddle — the anguish of years slipping by with one’s ambitions unfulfilled.',
    },
    story: {
      ko: '조조에게 쫓겨 형주의 유표에게 몸을 의탁한 유비는 몇 년째 손님 신세로 지내고 있었어요. 어느 날 유표와의 술자리에서 잠시 자리를 비웠다 돌아온 유비의 눈에 눈물이 맺혀 있었습니다. 까닭을 묻자 유비가 답했죠. "예전에는 몸이 말안장을 떠난 적이 없어 허벅지에 살이 없었는데, 요즘은 말을 타지 않으니 살만 올랐습니다. 세월은 달려가는데 이룬 공은 없으니 그것이 서러울 뿐입니다." 천하를 꿈꾸던 영웅이 허벅지 살을 보며 흘린 이 눈물에서 비육지탄이 나왔어요. 얼마 뒤 유비는 삼고초려로 제갈량을 얻으며 다시 일어섭니다.',
      ja: '曹操に追われ、荊州の劉表のもとに身を寄せた劉備は、何年も居候の身で過ごしていました。ある日、劉表との酒席で中座して戻った劉備の目に涙が浮かんでいました。わけを尋ねると劉備は答えます。「かつては体が鞍を離れることがなく、腿に肉などありませんでした。近頃は馬に乗らないので肉ばかりつきました。歳月は駆けていくのに功は成らず、それが無念なのです」。天下を夢見た英雄が腿の肉を見て流したこの涙から、髀肉の嘆が生まれました。ほどなく劉備は三顧の礼で諸葛亮を得て、再び立ち上がります。',
      en: 'Driven off by Cao Cao, Liu Bei spent years as a guest of Liu Biao in Jing Province. One day at a banquet, he returned from a brief absence with tears in his eyes. Asked why, he said: "Once my body never left the saddle, and my thighs carried no fat. Now I ride no more, and the flesh has grown back. The months and years gallop past, and I have accomplished nothing — that is my grief." From a hero’s tears over his own thighs came this idiom. Not long after, Liu Bei made his three visits, won Zhuge Liang, and rose again.',
    },
    ex: [
      { ko: '전공을 살리지 못하는 부서에서 그는 비육지탄의 나날을 보냈다.', ja: '専攻を生かせない部署で、彼は髀肉の嘆の日々を送った。', en: 'Stuck in a role that used none of his training, he ached at his own idle years.' },
      { ko: '부상으로 벤치만 지키던 시즌, 그야말로 비육지탄이었다.', ja: '怪我でベンチを守るだけのシーズンは、まさに髀肉の嘆だった。', en: 'A season on the bench with an injury — watching his edge dull was the old lament of the fattening thighs.' },
    ],
    rel: ['samgochoryeo', 'sueojigyo', 'maninjijeok'],
  },
  {
    slug: 'chiljongchilgeum', hanja: '七縱七擒', ko: '칠종칠금', ja: '七縦七擒（しちしょうしちきん）', pinyin: 'qī zòng qī qín', enLit: 'Captured Seven Times, Released Seven Times',
    src: 'annot', srcName: { ko: '한진춘추(삼국지 제갈량전 배송지주 인용)·화양국지', ja: '漢晋春秋（『三国志』諸葛亮伝 裴松之注）・華陽国志', en: 'Han Jin Chunqiu (Pei Songzhi’s annotations) and Huayang Guozhi' },
    people: ['zhuge-liang', 'meng-huo'],
    meaning: {
      ko: '일곱 번 사로잡고 일곱 번 놓아준다는 뜻으로, 힘이 아니라 마음으로 상대를 복종시키는 것을 가리켜요. 상대가 진심으로 승복할 때까지 아량을 베푸는 전략입니다.',
      ja: '七度捕らえて七度放つという意味で、力ではなく心で相手を従わせることを指します。相手が心から承服するまで度量を示す戦略です。',
      en: 'To capture seven times and release seven times — winning submission of the heart, not just the body, through patient magnanimity.',
    },
    story: {
      ko: '북벌에 앞서 제갈량은 남쪽 이민족의 반란부터 다스려야 했어요. 참모 마속은 "성을 치는 것은 하책이고 마음을 치는 것이 상책"이라 조언했고, 제갈량은 이를 받아들입니다. 남만의 지도자 맹획을 사로잡은 제갈량은 처형하는 대신 진영을 구경시키고 놓아줬어요. 맹획이 "다시 싸우면 이길 수 있다"며 물러가면 또 사로잡고 또 놓아주기를 일곱 번. 일곱 번째 풀려난 맹획은 마침내 "공은 하늘의 위엄이십니다. 남인은 다시는 배반하지 않겠습니다"라며 진심으로 항복했습니다. 덕분에 제갈량은 남쪽 걱정 없이 북벌에 전념할 수 있었죠.',
      ja: '北伐に先立ち、諸葛亮はまず南方異民族の反乱を治める必要がありました。参謀の馬謖は「城を攻めるは下策、心を攻めるが上策」と助言し、諸葛亮はこれを容れます。南蛮の指導者・孟獲を捕らえた諸葛亮は、処刑する代わりに陣営を見せて放してやりました。孟獲が「もう一度戦えば勝てる」と引き下がれば、また捕らえ、また放つこと七度。七度目に放たれた孟獲はついに「公は天の威におわします。南人は二度と背きません」と心から降伏しました。おかげで諸葛亮は南方の憂いなく北伐に専念できたのです。',
      en: 'Before marching north, Zhuge Liang first had to settle the southern tribes’ revolt. His aide Ma Su counseled: "Attacking cities is the lesser way; attacking hearts is the higher one." Zhuge Liang agreed. Capturing the southern leader Meng Huo, he showed him around the camp and set him free instead of executing him. Each time Meng Huo swore he could win a rematch, he was captured and released again — seven times in all. Freed the seventh time, Meng Huo finally submitted from the heart: "You possess the majesty of Heaven; the south will never rebel again." The south stayed loyal, and Zhuge Liang could turn north without fear.',
    },
    ex: [
      { ko: '떠나겠다는 핵심 인재를 조건이 아니라 비전으로 붙잡았다 — 칠종칠금의 설득이었다.', ja: '辞めるという中核人材を条件ではなくビジョンで引き留めた — 七縦七擒の説得だった。', en: 'He kept the star employee not with a counteroffer but by winning her heart — capture-and-release persuasion, seven times patient.' },
      { ko: '반항하던 아이를 혼내는 대신 기다려 준 것이 칠종칠금이 되었다.', ja: '反抗する子を叱る代わりに待ってやったことが七縦七擒になった。', en: 'Instead of punishing the rebellious kid, they waited him out — and won him over for good.' },
    ],
    rel: ['gongseonggye', 'geumnangmyogye', 'chulsapyo'],
  },
  {
    slug: 'nakbulsachok', hanja: '樂不思蜀', ko: '낙불사촉', ja: '楽不思蜀（らくふししょく）', pinyin: 'lè bù sī shǔ', enLit: 'Too Happy to Miss Shu',
    src: 'annot', srcName: { ko: '한진춘추(삼국지 후주전 배송지주 인용)', ja: '漢晋春秋（『三国志』後主伝 裴松之注）', en: 'Han Jin Chunqiu (Pei Songzhi’s annotations to Liu Shan’s biography)' },
    people: ['liu-shan', 'sima-zhao'],
    meaning: {
      ko: '즐거움에 빠져 고향 촉나라 생각을 하지 않는다는 뜻으로, 눈앞의 안락에 취해 근본과 처지를 잊는 것을 가리켜요. 향락에 젖어 본분을 잊은 사람을 꼬집을 때 씁니다.',
      ja: '楽しさに浸って故国の蜀を思わないという意味で、目先の安楽に酔って根本と境遇を忘れることを指します。享楽に溺れて本分を忘れた人を皮肉るときに使います。',
      en: 'So content that one forgets one’s homeland — losing oneself in present comfort and forgetting who you are and where you came from.',
    },
    story: {
      ko: '촉이 멸망한 뒤 후주 유선은 위의 수도 낙양으로 옮겨져 안락공에 봉해졌어요. 실권자 사마소는 연회를 열어 일부러 촉의 음악과 춤을 보여주었습니다. 촉의 옛 신하들이 모두 고개를 떨구고 눈물지었지만, 유선만은 태연히 웃으며 즐겼죠. 사마소가 "촉이 그립지 않으시오?"라고 묻자 유선은 "이곳이 즐거워 촉 생각이 나지 않습니다(此間樂 不思蜀)"라고 답했습니다. 이 대답에 사마소는 경계를 완전히 풀었고, 유선은 천수를 누렸어요. 어리석음인지 목숨을 지킨 처세인지는 지금도 갈리지만, 낙불사촉은 안락에 젖어 근본을 잊는다는 뜻으로 남았습니다.',
      ja: '蜀の滅亡後、後主・劉禅は魏の都・洛陽に移され、安楽公に封じられました。実力者の司馬昭は宴を開き、わざと蜀の音楽と舞を見せます。蜀の旧臣たちはみな頭を垂れて涙ぐみましたが、劉禅だけは平然と笑って楽しんでいました。司馬昭が「蜀が恋しくはないか」と尋ねると、劉禅は「ここが楽しくて蜀を思いません（此間楽、蜀を思わず）」と答えました。この答えに司馬昭は警戒を完全に解き、劉禅は天寿を全うします。愚かさか、命を守る処世か、評価は今も分かれますが、楽不思蜀は安楽に浸って根本を忘れるという意味で残りました。',
      en: 'After Shu fell, the last emperor Liu Shan was moved to the Wei capital and made Duke of Anle. The strongman Sima Zhao threw a banquet and pointedly staged the music and dances of Shu. The old Shu ministers all bowed their heads in tears — but Liu Shan laughed and enjoyed the show. "Do you not miss Shu?" Sima Zhao asked. "It is so pleasant here that I do not think of Shu," Liu Shan replied. The answer dissolved all suspicion, and Liu Shan lived out his days in peace. Folly, or survival wisdom? Debated to this day — but the phrase stuck for forgetting one’s roots in comfort.',
    },
    ex: [
      { ko: '해외 지사의 편한 생활에 낙불사촉하다 본사 복귀 시기를 놓쳤다.', ja: '海外支社の快適な生活に楽不思蜀して、本社復帰の時機を逃した。', en: 'Life at the overseas branch was so comfortable he forgot headquarters entirely — and missed his window to return.' },
      { ko: '단기 흥행에 낙불사촉해 본업 경쟁력을 잃은 기업이 많다.', ja: '目先のヒットに楽不思蜀して本業の競争力を失った企業は多い。', en: 'Many companies bask in a short-term hit and forget the core business that made them.' },
    ],
    rel: ['chulsapyo', 'biyukjitan', 'sagongmyeong'],
  },
  {
    slug: 'sagongmyeong', hanja: '死孔明走生仲達', ko: '사공명 주생중달', ja: '死せる孔明、生ける仲達を走らす', pinyin: 'sǐ kǒng míng zǒu shēng zhòng dá', enLit: 'Dead Kongming Routs Living Zhongda',
    src: 'annot', srcName: { ko: '한진춘추(당대 속담 기록, 연의가 극화)', ja: '漢晋春秋（当時の俗諺の記録、演義が脚色）', en: 'Han Jin Chunqiu (a contemporary saying; dramatized in the novel)' },
    people: ['zhuge-liang', 'sima-yi'],
    meaning: {
      ko: '죽은 공명이 산 중달을 달아나게 했다는 뜻으로, 뛰어난 사람은 죽은 뒤에도 그 명성만으로 상대를 압도한다는 말이에요. 존재감이 실체를 넘어서는 상황에 씁니다.',
      ja: '死んだ孔明が生きている仲達を敗走させたという意味で、優れた人は死してなおその名声だけで相手を圧倒するという言葉です。存在感が実体を超える状況に使います。',
      en: 'The dead Kongming put the living Zhongda to flight — a great figure’s reputation overpowers others even after death.',
    },
    story: {
      ko: '오장원에서 제갈량이 병사하자 촉군은 은밀히 철수를 시작했어요. 백성들의 제보로 이를 안 사마의(자는 중달)는 곧장 추격에 나섰습니다. 그런데 촉군이 갑자기 깃발을 돌리고 북을 울리며 반격할 태세를 보이자, 사마의는 "공명이 아직 살아 있는데 속았구나" 싶어 황급히 군을 물렸죠. 촉군은 그 틈에 유유히 빠져나갔습니다. 백성들 사이에 "죽은 공명이 산 중달을 달아나게 했다"는 말이 돌자, 사마의는 웃으며 "산 사람 일은 헤아려도 죽은 사람 일은 헤아릴 수 없지 않은가"라고 받아넘겼다고 해요. 연의는 여기에 제갈량 목상(木像) 장면을 더해 극적으로 살을 붙였습니다.',
      ja: '五丈原で諸葛亮が病没すると、蜀軍は密かに撤退を始めました。民の通報でこれを知った司馬懿（字は仲達）は、すぐさま追撃に出ます。ところが蜀軍が突然旗を返し、太鼓を鳴らして反撃の構えを見せると、司馬懿は「孔明はまだ生きていて、謀られたか」と慌てて兵を引きました。蜀軍はその隙に悠々と抜け出します。民の間に「死せる孔明、生ける仲達を走らす」という言葉が広まると、司馬懿は笑って「生者のことは読めても、死者のことは読めぬではないか」と受け流したといいます。演義はここに諸葛亮の木像の場面を加え、劇的に脚色しました。',
      en: 'When Zhuge Liang died of illness at Wuzhang Plains, the Shu army began a secret withdrawal. Tipped off by local people, Sima Yi (courtesy name Zhongda) gave chase at once. But when the Shu columns suddenly wheeled their banners and beat the drums as if to counterattack, Sima Yi — convinced Kongming still lived and had baited him — hastily pulled back, and the Shu army slipped away. When the saying spread that "dead Kongming routed living Zhongda," Sima Yi laughed it off: "I can fathom the living; how am I to fathom the dead?" The novel later added the famous wooden-statue scene to the tale.',
    },
    ex: [
      { ko: '창업자가 떠난 뒤에도 그의 원칙이 회사를 지배하니, 사공명 주생중달이다.', ja: '創業者が去った後もその原則が会社を支配している。まさに死せる孔明、生ける仲達を走らすだ。', en: 'Years after the founder left, his principles still run the company — dead Kongming routing living Zhongda.' },
      { ko: '은퇴한 전설의 기록이 여전히 현역들을 압박한다 — 사공명 주생중달인 셈이다.', ja: '引退したレジェンドの記録がいまだ現役を圧迫する — 死せる孔明が生ける仲達を走らせているわけだ。', en: 'The retired legend’s records still haunt today’s players — his ghost routs the living.' },
    ],
    rel: ['siksosabeon', 'gongseonggye', 'chulsapyo'],
  },
  {
    slug: 'dowongyeorui', hanja: '桃園結義', ko: '도원결의', ja: '桃園の誓い（とうえんのちかい）', pinyin: 'táo yuán jié yì', enLit: 'The Peach Garden Oath',
    src: 'novel', srcName: { ko: '삼국지연의 1회(정사에는 없는 창작 장면)', ja: '『三国志演義』第1回（正史にない創作場面）', en: 'Romance of the Three Kingdoms, ch. 1 (a fictional scene, not in the histories)' },
    people: ['liu-bei', 'guan-yu', 'zhang-fei'],
    meaning: {
      ko: '복숭아밭에서 의형제를 맺은 데서 나온 말로, 뜻을 함께하기로 굳게 다짐하는 결의를 뜻해요. 팀이나 동지가 한마음으로 출발을 다짐할 때 씁니다.',
      ja: '桃の園で義兄弟の契りを結んだことから生まれた言葉で、志を共にする固い誓いを意味します。チームや同志が心を一つに出発を誓うときに使います。',
      en: 'From the sworn brotherhood sealed in a peach orchard — a solemn pledge to share one purpose, through everything.',
    },
    story: {
      ko: '황건적의 난으로 천하가 어지럽던 때, 돗자리를 팔던 유비, 도망자 신세의 관우, 푸줏간을 하던 장비가 우연히 만났어요. 세 사람은 뜻이 통함을 알고 장비네 집 뒤 복숭아꽃이 만발한 동산에 모였습니다. 검은 소와 흰 말을 잡아 하늘에 제사 지내며 이들은 맹세했죠. "같은 해 같은 달 같은 날에 태어나지 못했으나, 같은 해 같은 달 같은 날에 죽기를 원하나이다." 이 도원의 맹세는 정사에는 없는 연의의 창작이지만(정사는 "은혜가 형제와 같았다"고만 기록), 삼국지 전체를 관통하는 의리의 상징이 되어 소설 첫 장면의 자리를 지키고 있습니다.',
      ja: '黄巾の乱で天下が乱れていた頃、むしろ売りの劉備、逃亡者の身の関羽、肉屋を営む張飛が偶然出会いました。三人は志が通じ合うことを知り、張飛の家の裏、桃の花が満開の園に集まります。黒牛と白馬を供えて天に祭りを捧げ、彼らは誓いました。「同年同月同日に生まれることはできなかったが、同年同月同日に死ぬことを願う」。この桃園の誓いは正史にはない演義の創作ですが（正史は「恩は兄弟のごとし」と記すのみ）、三国志全体を貫く義の象徴として、小説の冒頭を飾り続けています。',
      en: 'As the Yellow Turban rebellion threw the realm into chaos, three strangers met: Liu Bei the sandal-weaver, Guan Yu the fugitive, Zhang Fei the butcher. Finding their hearts aligned, they gathered in the peach orchard behind Zhang Fei’s house, in full blossom. Sacrificing a black ox and a white horse to Heaven, they swore: "We could not be born on the same day — but we ask to die on the same day." The oath is the novel’s invention (the histories say only that their bond was "like brothers"), yet it became the emblem of loyalty running through the whole saga, and the opening scene of the book.',
    },
    ex: [
      { ko: '셋이서 도원결의하듯 의기투합해 회사를 차렸다.', ja: '三人で桃園の誓いのように意気投合して会社を立ち上げた。', en: 'The three of them founded the company like a peach-garden oath — one purpose, all in.' },
      { ko: '우승을 앞두고 선수단은 도원결의의 각오를 다졌다.', ja: '優勝を前に選手団は桃園の誓いの覚悟を固めた。', en: 'On the eve of the finals, the squad renewed their sworn-brothers resolve.' },
    ],
    rel: ['sueojigyo', 'maninjijeok', 'samgochoryeo'],
  },
  {
    slug: 'goyukjigye', hanja: '苦肉之計', ko: '고육지계', ja: '苦肉の策（くにくのさく）', pinyin: 'kǔ ròu zhī jì', enLit: 'The Self-Injury Ruse',
    src: 'novel', srcName: { ko: '삼국지연의 46회(정사엔 거짓 항복만 있고 매질은 창작)', ja: '『三国志演義』第46回（正史には偽降のみ、杖打ちは創作）', en: 'Romance of the Three Kingdoms, ch. 46 (the histories record only the feigned surrender)' },
    people: ['huang-gai', 'zhou-yu'],
    meaning: {
      ko: '제 몸을 상하게 하면서까지 꾸며내는 계책이라는 뜻으로, 큰 목적을 위해 스스로 손해를 감수하는 고심의 방책을 가리켜요. 오늘날 "고육지책"으로도 널리 씁니다.',
      ja: '我が身を傷つけてまで仕組む計略という意味で、大きな目的のために自ら損害を引き受ける苦渋の方策を指します。日本語では「苦肉の策」として広く使われます。',
      en: 'A stratagem that sacrifices one’s own flesh to deceive the enemy — accepting real self-inflicted loss to sell the lie. Now used for any painful last-resort measure.',
    },
    story: {
      ko: '적벽에서 조조의 대군과 맞선 주유에게는 화공(火攻)이 유일한 승산이었지만, 불배를 조조 함대에 접근시킬 방법이 없었어요. 그때 노장 황개가 거짓 항복을 자청합니다. 조조가 믿게 하려면 그럴듯한 명분이 필요했죠. 다음 날 군의에서 황개는 일부러 주유에게 대들었고, 격노한 주유는 곤장 백 대를 명해 황개의 살이 터지도록 때렸습니다. 이 매질 소식이 첩자를 통해 전해지자 조조는 황개의 항복을 믿었고, 항복하러 오는 척한 황개의 배들은 기름과 마른 짚을 가득 싣고 있었어요. 그 불이 적벽의 조조 함대를 삼켰습니다. 매질 장면은 연의의 창작이지만, "제 살을 내주는 계책"의 대명사가 되었죠.',
      ja: '赤壁で曹操の大軍と対峙した周瑜には火攻めが唯一の勝機でしたが、火船を曹操の艦隊に近づける方法がありません。そこで老将・黄蓋が偽りの降伏を買って出ます。曹操に信じさせるにはもっともらしい口実が必要でした。翌日の軍議で黄蓋はわざと周瑜に盾突き、激怒した周瑜は杖打ち百回を命じて黄蓋の肉が裂けるまで打たせました。この杖打ちの知らせが間者を通じて伝わると曹操は黄蓋の降伏を信じ、降伏を装った黄蓋の船は油と枯れ草を満載していました。その火が赤壁の曹操艦隊を呑み込んだのです。杖打ちの場面は演義の創作ですが、「我が身を差し出す計」の代名詞となりました。',
      en: 'Facing Cao Cao’s armada at Red Cliffs, Zhou Yu’s only hope was fire — but no fire-ship could get close. The veteran Huang Gai volunteered a fake defection, which needed a believable pretext. At the next war council Huang Gai deliberately defied Zhou Yu, who in staged fury had him beaten a hundred strokes until his flesh split. Word of the beating reached Cao Cao through spies, and he believed the old general’s surrender. Huang Gai’s "defecting" ships came loaded with oil and dry straw — and their fire devoured the fleet at Red Cliffs. The beating is the novel’s invention, but it named forever the ruse that spends one’s own flesh.',
    },
    ex: [
      { ko: '적자 매장을 정리하는 고육지계로 회사는 겨우 살아남았다.', ja: '赤字店舗を畳む苦肉の策で会社はかろうじて生き残った。', en: 'Closing its own flagship stores was the painful self-cut that kept the company alive.' },
      { ko: '주전 선수를 빼는 고육지계가 후반 역전의 발판이 됐다.', ja: 'エースを下げる苦肉の策が後半逆転の足がかりになった。', en: 'Benching the ace was a flesh-cutting gamble — and it set up the comeback.' },
    ],
    rel: ['choseonchajeon', 'mansagubi', 'geumnangmyogye'],
  },
  {
    slug: 'geumnangmyogye', hanja: '錦囊妙計', ko: '금낭묘계', ja: '錦嚢の計（きんのうのけい）', pinyin: 'jǐn náng miào jì', enLit: 'The Brocade-Bag Stratagems',
    src: 'novel', srcName: { ko: '삼국지연의 54회', ja: '『三国志演義』第54回', en: 'Romance of the Three Kingdoms, ch. 54' },
    people: ['zhuge-liang', 'zhao-yun'],
    meaning: {
      ko: '비단 주머니 속의 신묘한 계책이라는 뜻으로, 위기의 순간마다 꺼내 쓰도록 미리 마련해 둔 대비책을 가리켜요. 만일에 대비한 비장의 플랜 B에 씁니다.',
      ja: '錦の袋の中の霊妙な計略という意味で、危機のたびに取り出して使えるようあらかじめ用意しておいた備えを指します。万一に備えた秘蔵のプランBに使います。',
      en: 'Miraculous plans sealed in a brocade bag — contingencies prepared in advance, to be opened at each crisis. The ultimate plan B.',
    },
    story: {
      ko: '주유는 유비를 오나라로 불러들여 손권의 누이와 혼인시키는 척 인질로 잡으려는 계략을 꾸몄어요. 위험한 초대임을 안 제갈량은 호위로 조운을 붙이며 비단 주머니 세 개를 건넸습니다. "위급할 때마다 차례로 열어 보게." 첫 주머니의 계책은 혼담을 온 성에 소문내 진짜 혼인으로 굳히는 것, 둘째는 형주가 위급하다는 말로 안락에 빠진 유비를 일으키는 것, 셋째는 추격군 앞에서 손부인의 위세를 빌리는 것이었죠. 세 계책이 차례로 들어맞아 유비는 신부와 함께 무사히 돌아왔고, 주유는 "부인 잃고 군사만 꺾였다"는 조롱을 들었습니다. 여기서 미리 준비된 묘책, 금낭묘계가 나왔어요.',
      ja: '周瑜は劉備を呉に呼び寄せ、孫権の妹と結婚させるふりをして人質に取る計略を企てました。危険な招きと知った諸葛亮は、護衛に趙雲を付け、錦の袋を三つ手渡します。「危急のたびに順に開けなさい」。第一の袋の計は婚談を城中に言い触らして本物の婚姻に固めること、第二は荊州の危急を告げて安楽に溺れた劉備を奮い立たせること、第三は追撃軍の前で孫夫人の威光を借りることでした。三つの計が次々と的中し、劉備は花嫁とともに無事帰還、周瑜は「夫人を失い兵まで挫かれた」と嘲られました。ここから、あらかじめ用意された妙策、錦嚢の計が生まれました。',
      en: 'Zhou Yu schemed to lure Liu Bei to Wu with a marriage to Sun Quan’s sister — and hold him hostage. Knowing the invitation was a trap, Zhuge Liang assigned Zhao Yun as escort and handed him three brocade bags: "Open them in order, at each crisis." The first plan spread news of the betrothal through the whole city, making the sham marriage real; the second roused a comfort-lulled Liu Bei with word that Jing Province was in peril; the third borrowed Lady Sun’s authority to face down the pursuers. All three worked in turn — Liu Bei came home safely with his bride, and Zhou Yu was mocked for "losing the lady and breaking his troops." Hence the brocade-bag stratagem: the brilliant plan prepared before it’s needed.',
    },
    ex: [
      { ko: '협상 결렬에 대비한 금낭묘계를 품고 회담장에 들어갔다.', ja: '交渉決裂に備えた錦嚢の計を懐に会談場へ入った。', en: 'She walked into the talks with a brocade-bag plan ready in case negotiations collapsed.' },
      { ko: '서버 장애 때마다 선임이 남긴 금낭묘계 문서가 팀을 구한다.', ja: 'サーバー障害のたび、先輩が残した錦嚢の計のドキュメントがチームを救う。', en: 'Every outage, the runbooks the old lead left behind save the team — stratagems from the brocade bag.' },
    ],
    rel: ['gongseonggye', 'goyukjigye', 'chiljongchilgeum'],
  },
  {
    slug: 'gongseonggye', hanja: '空城計', ko: '공성계', ja: '空城の計（くうじょうのけい）', pinyin: 'kōng chéng jì', enLit: 'The Empty Fort Strategy',
    src: 'novel', srcName: { ko: '삼국지연의 95회(곽충의 일화 — 배송지가 신빙성을 반박한 야사)', ja: '『三国志演義』第95回（郭沖の逸話 — 裴松之が信憑性を否定した野史）', en: 'Romance of the Three Kingdoms, ch. 95 (from an anecdote Pei Songzhi himself rejected)' },
    people: ['zhuge-liang', 'sima-yi'],
    meaning: {
      ko: '빈 성의 문을 활짝 열어 오히려 적이 의심하고 물러가게 만든다는 뜻으로, 약점을 당당히 드러내 상대의 판단을 흐리는 심리전을 가리켜요. 허세로 위기를 넘기는 배포에 씁니다.',
      ja: '空の城の門を開け放ち、かえって敵に疑わせて退かせるという意味で、弱点を堂々とさらして相手の判断を狂わせる心理戦を指します。はったりで危機を乗り切る度胸に使います。',
      en: 'Throwing open the gates of a defenseless city so the enemy suspects a trap and retreats — psychological warfare that hides weakness in plain sight.',
    },
    story: {
      ko: '가정에서 마속이 대패하자, 제갈량이 있던 서성에는 병력이 거의 남아 있지 않았어요. 그런데 사마의의 15만 대군이 성으로 밀려오고 있다는 급보가 닿습니다. 도망칠 수도 싸울 수도 없는 상황에서 제갈량은 뜻밖의 명을 내렸죠. 깃발을 감추고 성문 네 개를 활짝 연 뒤 병사들에게 백성처럼 물을 뿌리고 거리를 쓸게 한 것입니다. 자신은 성루에 올라 향을 피우고 태연히 거문고를 탔어요. 성 아래 다다른 사마의는 그 여유가 도리어 복병의 징조라 의심해 전군을 물렸습니다. 이 장면은 배송지가 "신빙성이 없다"고 반박한 곽충의 일화를 연의가 명장면으로 살린 것이지만, 심리전의 대명사가 되었죠.',
      ja: '街亭で馬謖が大敗すると、諸葛亮のいた西城にはほとんど兵が残っていませんでした。そこへ司馬懿の十五万の大軍が城に迫っているという急報が届きます。逃げることも戦うこともできない状況で、諸葛亮は意外な命を下しました。旗を隠し、四つの城門を開け放ち、兵士たちに民のように水を撒き、通りを掃かせたのです。自らは城楼に上って香を焚き、平然と琴を弾きました。城下に迫った司馬懿はその余裕をかえって伏兵の兆しと疑い、全軍を退かせます。この場面は裴松之が「信憑性がない」と退けた郭沖の逸話を演義が名場面に仕立てたものですが、心理戦の代名詞となりました。',
      en: 'After Ma Su’s disaster at Jieting, the city where Zhuge Liang was staying had almost no soldiers left — and word came that Sima Yi was bearing down with 150,000 men. Unable to flee or fight, Zhuge Liang gave a startling order: hide the banners, open all four gates, and have soldiers sweep the streets like commoners. He himself climbed the wall, lit incense, and calmly played the zither. Reaching the walls, Sima Yi read the serenity as the sign of an ambush and withdrew his entire army. The novel built this beloved scene from an anecdote the annotator Pei Songzhi had dismissed as unreliable — yet it became the very name of the bluff.',
    },
    ex: [
      { ko: '재고가 바닥났는데도 태연히 프로모션을 이어간 것은 공성계였다.', ja: '在庫が底を突いても平然とプロモーションを続けたのは空城の計だった。', en: 'Running the promotion with zero inventory left was a pure empty-fort bluff.' },
      { ko: '패가 없던 그는 공성계로 판돈을 올려 상대를 접게 만들었다.', ja: '手札のなかった彼は空城の計でレイズし、相手を降ろさせた。', en: 'Holding nothing, he raised big — an empty-fort play that made the whole table fold.' },
    ],
    rel: ['geumnangmyogye', 'sagongmyeong', 'chiljongchilgeum'],
  },
  {
    slug: 'mansagubi', hanja: '萬事俱備 只欠東風', ko: '만사구비 지흠동풍', ja: '万事倶備、只だ東風を欠く', pinyin: 'wàn shì jù bèi, zhǐ qiàn dōng fēng', enLit: 'Everything Ready but the East Wind',
    src: 'novel', srcName: { ko: '삼국지연의 49회', ja: '『三国志演義』第49回', en: 'Romance of the Three Kingdoms, ch. 49' },
    people: ['zhuge-liang', 'zhou-yu'],
    meaning: {
      ko: '모든 준비는 끝났는데 결정적인 한 가지만 빠져 있다는 뜻이에요. 성패를 가르는 마지막 조건이 아직 갖춰지지 않은 상황에 씁니다.',
      ja: 'すべての準備は整ったのに、決定的な一つだけが欠けているという意味です。成否を分ける最後の条件がまだ揃っていない状況に使います。',
      en: 'All preparations complete — except the one decisive thing. Used when a single missing condition holds back everything.',
    },
    story: {
      ko: '적벽 결전을 앞두고 주유는 화공 준비를 완벽하게 끝냈어요. 황개의 거짓 항복도, 기름 실은 불배도, 조조 함대를 묶어둘 연환계까지 모두 갖춰졌습니다. 그런데 결전의 계절은 한겨울 — 바람이 북서쪽에서 불어, 불을 지르면 오히려 아군 쪽으로 번질 판이었죠. 이 생각에 주유는 피를 토하며 몸져눕고 맙니다. 병문안을 온 제갈량은 처방전 대신 열여섯 자를 적어 보였어요. "만사가 다 갖춰졌으나 오직 동풍이 빠졌구려(萬事俱備 只欠東風)." 그러고는 칠성단을 쌓아 사흘 밤낮 기도했고, 정말 동남풍이 불자 불배가 바람을 타고 조조의 함대를 불태웠습니다.',
      ja: '赤壁の決戦を前に、周瑜は火攻めの準備を完璧に整えました。黄蓋の偽降も、油を積んだ火船も、曹操の艦隊を繋ぎ止める連環の計まで、すべてが揃いました。ところが決戦の季節は真冬 — 風は北西から吹き、火を放てばかえって味方に燃え広がる有様でした。この思いに周瑜は血を吐いて床に伏せってしまいます。見舞いに訪れた諸葛亮は処方箋の代わりに十六文字を書いて見せました。「万事倶に備わる、只だ東風を欠くのみ」。そして七星壇を築いて三日三晩祈り、本当に東南の風が吹くと、火船は風に乗って曹操の艦隊を焼き尽くしました。',
      en: 'Before the showdown at Red Cliffs, Zhou Yu had perfected the fire attack: Huang Gai’s fake surrender, the oil-laden fire ships, even the chain scheme locking Cao Cao’s fleet together. But it was deep winter — the wind blew from the northwest, and any fire would blow back onto his own ships. The realization made Zhou Yu collapse, coughing blood. Visiting the sickbed, Zhuge Liang wrote sixteen characters instead of a prescription: "Everything is ready — only the east wind is lacking." He then built an altar and prayed three days and nights; when the southeast wind truly rose, the fire ships rode it and burned Cao Cao’s armada.',
    },
    ex: [
      { ko: '제품도 인력도 준비됐는데 투자만 남았다 — 만사구비 지흠동풍이다.', ja: '製品も人材も揃ったのに、あとは資金調達だけ — 万事倶備、只だ東風を欠くだ。', en: 'Product ready, team ready — only the funding is missing. Everything but the east wind.' },
      { ko: '개업 준비는 끝났고 이제 허가라는 동풍만 기다린다.', ja: '開業準備は終わり、あとは許可という東風を待つだけだ。', en: 'The shop is ready to open; now we just wait for the east wind of the permit.' },
    ],
    rel: ['goyukjigye', 'choseonchajeon', 'gongseonggye'],
  },
  {
    slug: 'choseonchajeon', hanja: '草船借箭', ko: '초선차전', ja: '草船借箭（そうせんしゃくせん）', pinyin: 'cǎo chuán jiè jiàn', enLit: 'Borrowing Arrows with Straw Boats',
    src: 'novel', srcName: { ko: '삼국지연의 46회(정사의 유사 일화는 손권 — 위략)', ja: '『三国志演義』第46回（正史の類話は孫権 — 魏略）', en: 'Romance of the Three Kingdoms, ch. 46 (the historical version involves Sun Quan)' },
    people: ['zhuge-liang', 'lu-su'],
    meaning: {
      ko: '풀단 실은 배로 적의 화살을 빌려 온다는 뜻으로, 상대의 공격이나 자원을 역이용해 내 것으로 만드는 지혜를 가리켜요. 남의 힘을 빌려 문제를 해결하는 기지에 씁니다.',
      ja: '藁を積んだ船で敵の矢を借りてくるという意味で、相手の攻撃や資源を逆用して自分のものにする知恵を指します。他人の力を借りて問題を解決する機知に使います。',
      en: 'Borrowing the enemy’s arrows with straw-covered boats — turning an opponent’s own attack and resources to your advantage.',
    },
    story: {
      ko: '제갈량의 재주를 시기한 주유는 "열흘 안에 화살 십만 개를 만들라"는 불가능한 임무를 맡겼어요. 제갈량은 태연히 "사흘이면 충분하다"며 군령장까지 썼습니다. 그는 배 스무 척의 양편에 풀단을 빽빽이 세우고 푸른 장막을 두르게 했죠. 사흘째 새벽, 강에 짙은 안개가 끼자 제갈량은 배들을 조조의 수채 앞으로 몰고 가 북을 치며 함성을 지르게 했습니다. 복병을 의심한 조조는 나가 싸우는 대신 화살만 퍼부었고, 풀단에는 십만 개가 넘는 화살이 꽂혔어요. 안개 속에서 "화살 고맙소, 승상!" 외치며 돌아온 이 계책은 연의 최고의 명장면 중 하나입니다(정사에는 손권이 배로 화살을 받은 비슷한 일화가 전해요).',
      ja: '諸葛亮の才を妬んだ周瑜は「十日以内に矢十万本を用意せよ」という不可能な任務を課しました。諸葛亮は平然と「三日で十分」と答え、軍令状まで書きます。彼は二十隻の船の両舷に藁束をびっしり立てさせ、青い幕で覆わせました。三日目の未明、川に濃い霧が立ち込めると、諸葛亮は船団を曹操の水寨の前へ進め、太鼓を打ち鬨の声を上げさせます。伏兵を疑った曹操は打って出る代わりに矢を浴びせるだけで、藁束には十万本を超える矢が突き刺さりました。霧の中「矢をありがとう、丞相！」と叫んで戻ったこの計略は、演義屈指の名場面です（正史には孫権が船で矢を受けた類話が伝わります）。',
      en: 'Jealous of Zhuge Liang’s genius, Zhou Yu assigned him an impossible task: produce a hundred thousand arrows within ten days. Zhuge Liang calmly promised three, signing a military pledge on his life. He lined twenty boats with dense bundles of straw under blue canopies. Before dawn on the third day, thick fog blanketed the river; he sailed the boats up to Cao Cao’s naval camp with drums pounding and war cries roaring. Fearing an ambush in the mist, Cao Cao answered only with volleys of arrows — over a hundred thousand of which lodged in the straw. "Thank you for the arrows, Chancellor!" the crews shouted as they slipped away. One of the novel’s greatest scenes (the histories tell a similar tale of Sun Quan).',
    },
    ex: [
      { ko: '악플 세례를 홍보 소재로 뒤집었으니 초선차전인 셈이다.', ja: '誹謗コメントの嵐を宣伝の材料に変えたのだから、草船借箭というわけだ。', en: 'They turned the flood of hate comments into free publicity — borrowing arrows with straw boats.' },
      { ko: '경쟁사의 공개 특허를 역이용해 신제품을 만든 것은 초선차전이었다.', ja: '競合の公開特許を逆用して新製品を作ったのは草船借箭だった。', en: 'Building the new product on a rival’s published patents was a straw-boat raid for arrows.' },
    ],
    rel: ['mansagubi', 'goyukjigye', 'geumnangmyogye'],
  },
  {
    slug: 'mangmaejigal', hanja: '望梅止渴', ko: '망매지갈', ja: '望梅止渇（ぼうばいしかつ）', pinyin: 'wàng méi zhǐ kě', enLit: 'Quenching Thirst with Dreamed Plums',
    src: 'later', srcName: { ko: '세설신어 가휼편(남조 송의 일화집)', ja: '『世説新語』仮譎篇（南朝宋の逸話集）', en: 'Shishuo Xinyu (A New Account of the Tales of the World, 5th c.)' },
    people: ['cao-cao'],
    meaning: {
      ko: '매실을 떠올리게 해 갈증을 잊게 한다는 뜻으로, 상상이나 희망으로 당장의 어려움을 견디게 하는 것을 가리켜요. 임시방편의 위안이라는 뉘앙스로도 씁니다.',
      ja: '梅の実を思い浮かべさせて渇きを忘れさせるという意味で、想像や希望で当面の苦しさをしのがせることを指します。一時しのぎの慰めというニュアンスでも使います。',
      en: 'Easing thirst by imagining plums — sustaining people through hardship with a vivid hope, or offering comfort that is only imaginary.',
    },
    story: {
      ko: '조조가 군을 이끌고 행군하던 어느 여름, 길을 잘못 들어 물을 찾지 못했어요. 병사들은 갈증에 지쳐 쓰러지기 직전이었습니다. 그때 조조가 채찍을 들어 앞을 가리키며 외쳤죠. "저 너머에 큰 매실 숲이 있다. 열매가 시고도 달아 갈증을 풀기에 충분하다!" 새콤한 매실을 떠올린 병사들의 입에 절로 침이 고였고, 그 힘으로 행군을 이어가 마침내 물가에 닿을 수 있었습니다. 세설신어가 전하는 이 일화는 조조의 임기응변을 보여주는 대표 이야기로, "매실을 바라보며 갈증을 그친다"는 망매지갈이 되었어요.',
      ja: '曹操が軍を率いて行軍していたある夏、道を誤って水が見つかりませんでした。兵士たちは渇きに疲れ果て、倒れる寸前です。そのとき曹操が鞭を上げて前方を指し、叫びました。「あの先に大きな梅林がある。実は酸っぱくて甘く、渇きを癒すに十分だ！」酸っぱい梅の実を思い浮かべた兵士たちの口には自然と唾が湧き、その力で行軍を続け、ついに水場にたどり着くことができました。世説新語が伝えるこの逸話は曹操の機転を示す代表的な話で、「梅を望んで渇きを止める」望梅止渇となりました。',
      en: 'One summer on the march, Cao Cao’s army lost its way and could find no water. The soldiers were collapsing from thirst. Cao Cao raised his whip and pointed ahead: "Beyond that rise lies a great plum grove — the fruit is sour and sweet, more than enough to quench your thirst!" At the thought of sour plums the soldiers’ mouths watered, and on that borrowed strength they marched until they truly reached water. Told in the Shishuo Xinyu, the tale became the classic example of Cao Cao’s quick wit — "gazing at plums to stop thirst."',
    },
    ex: [
      { ko: '보너스 약속으로 야근을 버티게 하는 건 망매지갈일 뿐이다.', ja: 'ボーナスの約束で残業をしのがせるのは望梅止渇にすぎない。', en: 'Keeping the team grinding on promises of a bonus is just dreamed plums for real thirst.' },
      { ko: '여행 사진을 보며 방학까지 버티는 망매지갈의 나날이다.', ja: '旅行の写真を眺めて休みまで耐える、望梅止渇の日々だ。', en: 'Scrolling vacation photos to survive until the holidays — quenching thirst with imaginary plums.' },
    ],
    rel: ['gyereuk', 'woldanpyeong', 'byeonggwisinsok'],
  },
  {
    slug: 'chilbojijae', hanja: '七步之才', ko: '칠보지재', ja: '七歩の才（しちほのさい）', pinyin: 'qī bù zhī cái', enLit: 'Genius Within Seven Paces',
    src: 'later', srcName: { ko: '세설신어 문학편(칠보시)', ja: '『世説新語』文学篇（七歩詩）', en: 'Shishuo Xinyu — Literature (the Seven-Pace Poem)' },
    people: ['cao-zhi', 'cao-pi'],
    meaning: {
      ko: '일곱 걸음 안에 시를 짓는 재주라는 뜻으로, 뛰어난 문학적 재능과 놀라운 순발력을 가리켜요. 즉석에서 빛나는 천재성에 씁니다.',
      ja: '七歩のうちに詩を作る才という意味で、優れた文才と驚くべき瞬発力を指します。即興で輝く天才性に使います。',
      en: 'The gift of composing a poem within seven paces — dazzling literary genius under pressure.',
    },
    story: {
      ko: '조조의 아들 조식은 붓만 들면 문장이 쏟아지는 천재로, 한때 아버지의 후계 후보로도 총애받았어요. 그만큼 형 조비에게는 눈엣가시였죠. 황제가 된 조비는 어느 날 조식에게 "일곱 걸음을 걷는 동안 시를 지어라. 못 지으면 큰 벌을 내리겠다"고 명했습니다. 조식은 걸음을 옮기며 읊었어요. 콩대를 태워 콩을 삶으니 콩이 솥 안에서 우는구나 — "본래 한 뿌리에서 났거늘 어찌 이리 급히 삶아 대는가(本是同根生 相煎何太急)." 형제 골육상잔을 콩과 콩대에 빗댄 이 시에 조비는 부끄러워 낯을 붉혔다고 전합니다. 일곱 걸음의 재주, 칠보지재는 여기서 나왔어요.',
      ja: '曹操の息子・曹植は筆を執れば文章があふれ出す天才で、一時は父の後継候補として寵愛されました。それだけに兄・曹丕には目の上のこぶでした。皇帝となった曹丕はある日、曹植に「七歩歩く間に詩を作れ。できなければ重い罰を下す」と命じます。曹植は歩を進めながら詠みました。豆がらを燃やして豆を煮れば、豆は釜の中で泣く — 「本は同じ根から生まれたのに、なぜこうも急いで煮立てるのか（本是同根生、相煎るること何ぞ太だ急なる）」。兄弟の骨肉の争いを豆と豆がらにたとえたこの詩に、曹丕は恥じて顔を赤らめたと伝えられます。七歩の才はここから生まれました。',
      en: 'Cao Zhi, son of Cao Cao, was a prodigy from whose brush poetry simply poured — once even favored as heir, which made him a thorn in his brother Cao Pi’s side. Having taken the throne, Cao Pi one day commanded: "Compose a poem within seven paces, or face heavy punishment." Cao Zhi walked and recited: beanstalks burn to boil the beans, and the beans weep in the pot — "Born of the very same root, why boil me with such haste?" The poem, casting fratricide as beans cooked over their own stalks, is said to have shamed the emperor into silence. From it comes "the talent of seven paces."',
    },
    ex: [
      { ko: '즉석 랩 배틀에서 그는 칠보지재급 순발력을 보여줬다.', ja: '即興のラップバトルで彼は七歩の才級の瞬発力を見せた。', en: 'In the freestyle battle he showed seven-pace genius, verses on demand.' },
      { ko: '기자의 돌발 질문에 명답을 내놓는 칠보지재였다.', ja: '記者の不意打ちの質問に名答を返す、まさに七歩の才だった。', en: 'Every curveball question got a brilliant answer on the spot — poetry within seven paces.' },
    ],
    rel: ['baekmi', 'woldanpyeong', 'gwalmoksangdae'],
  },
]
