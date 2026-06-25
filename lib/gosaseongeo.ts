// 고사성어 사전 — generated from gosaseongeo_master.csv (seed 76).
// 성어·뜻은 공유 지식, 유래·예문은 자체 작성(저작권 클린). 확장은 gosaseongeo_확장_지시문.md 참고.
export interface Idiom { id: string; hanja: string; reading: string; len: number; lit: string; fig: string; origin: string; source: string; example: string; syn: string[]; reviewed: boolean }
export const IDIOMS: Idiom[] = [
  {"id":"gs0001","hanja":"刻舟求劍","reading":"각주구검","len":4,"lit":"배에 표시해 칼을 찾음","fig":"융통성 없이 낡은 방식만 고집함","origin":"칼을 강에 빠뜨린 사람이 뱃전에 표시해 두고 나중에 그 자리에서 찾으려 했다는 이야기","source":"여씨춘추","example":"시대가 바뀌었는데 옛 방식만 고집하는 건 각주구검이나 다름없다.","syn":["守株待兎"],"reviewed":true},
  {"id":"gs0002","hanja":"結草報恩","reading":"결초보은","len":4,"lit":"풀을 묶어 은혜를 갚음","fig":"죽어서도 잊지 않고 은혜를 갚음","origin":"은혜 입은 이의 혼령이 풀을 묶어 적장을 넘어뜨려 보답했다는 고사","source":"춘추좌씨전","example":"그때 도와주신 은혜는 결초보은하겠습니다.","syn":["白骨難忘"],"reviewed":true},
  {"id":"gs0003","hanja":"鷄肋","reading":"계륵","len":2,"lit":"닭의 갈비","fig":"버리기는 아깝지만 그다지 쓸모는 없는 것","origin":"조조가 한중 철군을 두고 '계륵'이라 한 데서 유래","source":"후한서","example":"쓰자니 애매하고 버리자니 아까운, 계륵 같은 물건이다.","syn":[],"reviewed":true},
  {"id":"gs0004","hanja":"苦盡甘來","reading":"고진감래","len":4,"lit":"쓴 것이 다하면 단 것이 옴","fig":"고생 끝에 즐거움이 옴","origin":"","source":"","example":"오랜 노력 끝에 합격했으니 그야말로 고진감래다.","syn":["興盡悲來"],"reviewed":true},
  {"id":"gs0005","hanja":"過猶不及","reading":"과유불급","len":4,"lit":"지나침은 미치지 못함과 같음","fig":"정도를 지나침은 모자람과 같다","origin":"","source":"논어","example":"운동도 과유불급이라 지나치면 몸을 해친다.","syn":[],"reviewed":true},
  {"id":"gs0006","hanja":"群鷄一鶴","reading":"군계일학","len":4,"lit":"닭 무리 속의 한 마리 학","fig":"평범한 사람들 가운데 뛰어난 한 사람","origin":"","source":"진서","example":"수많은 지원자 중에서 그녀는 단연 군계일학이었다.","syn":["囊中之錐"],"reviewed":true},
  {"id":"gs0007","hanja":"錦上添花","reading":"금상첨화","len":4,"lit":"비단 위에 꽃을 더함","fig":"좋은 일에 또 좋은 일이 더해짐","origin":"","source":"","example":"경치도 좋은데 음식까지 훌륭하니 금상첨화다.","syn":["雪上加霜"],"reviewed":true},
  {"id":"gs0008","hanja":"杞憂","reading":"기우","len":2,"lit":"기나라 사람의 걱정","fig":"쓸데없는 걱정","origin":"하늘이 무너질까 걱정한 기나라 사람의 이야기","source":"열자","example":"걱정했던 일은 일어나지 않았으니 한낱 기우였다.","syn":[],"reviewed":true},
  {"id":"gs0009","hanja":"囊中之錐","reading":"낭중지추","len":4,"lit":"주머니 속의 송곳","fig":"뛰어난 재능은 저절로 드러남","origin":"","source":"사기","example":"실력이 있으면 낭중지추처럼 언젠가 드러나기 마련이다.","syn":["群鷄一鶴"],"reviewed":true},
  {"id":"gs0010","hanja":"累卵之危","reading":"누란지위","len":4,"lit":"알을 쌓아 놓은 듯한 위태로움","fig":"몹시 위태로운 형세","origin":"","source":"","example":"회사는 부도 직전의 누란지위에 처했다.","syn":["風前燈火"],"reviewed":true},
  {"id":"gs0011","hanja":"多多益善","reading":"다다익선","len":4,"lit":"많으면 많을수록 좋음","fig":"많을수록 더 좋다","origin":"한신이 군사는 많을수록 좋다고 한 데서 유래","source":"사기","example":"자료는 다다익선이니 많이 모아 두자.","syn":[],"reviewed":true},
  {"id":"gs0012","hanja":"大器晩成","reading":"대기만성","len":4,"lit":"큰 그릇은 늦게 이루어짐","fig":"큰 인물은 늦게 성공함","origin":"","source":"노자","example":"그는 마흔에 빛을 본 대기만성형 배우다.","syn":[],"reviewed":true},
  {"id":"gs0013","hanja":"同病相憐","reading":"동병상련","len":4,"lit":"같은 병을 앓는 이끼리 가엾게 여김","fig":"처지가 비슷한 사람끼리 서로 동정함","origin":"","source":"오월춘추","example":"같은 처지라 동병상련의 마음으로 그를 도왔다.","syn":[],"reviewed":true},
  {"id":"gs0014","hanja":"登龍門","reading":"등용문","len":3,"lit":"용문에 오름","fig":"어려운 관문을 넘어 크게 출세함","origin":"황하 상류 용문을 오른 잉어가 용이 된다는 전설","source":"후한서","example":"그 대회는 신인 배우의 등용문으로 통한다.","syn":[],"reviewed":true},
  {"id":"gs0015","hanja":"燈火可親","reading":"등화가친","len":4,"lit":"등불을 가까이할 만함","fig":"가을은 독서하기 좋은 계절","origin":"","source":"","example":"등화가친의 계절, 책 한 권 읽어 보자.","syn":[],"reviewed":true},
  {"id":"gs0016","hanja":"馬耳東風","reading":"마이동풍","len":4,"lit":"말 귀에 봄바람","fig":"남의 말을 흘려듣고 새겨듣지 않음","origin":"","source":"","example":"아무리 조언해도 마이동풍이니 답답하다.","syn":["牛耳讀經"],"reviewed":true},
  {"id":"gs0017","hanja":"孟母三遷","reading":"맹모삼천","len":4,"lit":"맹자 어머니가 세 번 이사함","fig":"교육에는 주변 환경이 중요함","origin":"맹자 어머니가 자식 교육을 위해 세 번 이사했다는 고사","source":"열녀전","example":"맹모삼천이라더니, 좋은 학군을 찾아 이사했다.","syn":[],"reviewed":true},
  {"id":"gs0018","hanja":"明鏡止水","reading":"명경지수","len":4,"lit":"맑은 거울과 고요한 물","fig":"잡념 없이 맑고 고요한 마음","origin":"","source":"장자","example":"그는 명경지수 같은 마음으로 결정을 내렸다.","syn":[],"reviewed":true},
  {"id":"gs0019","hanja":"矛盾","reading":"모순","len":2,"lit":"창과 방패","fig":"말이나 행동의 앞뒤가 맞지 않음","origin":"무엇이든 뚫는 창과 무엇도 막는 방패를 함께 판 장사꾼 이야기","source":"한비자","example":"그의 주장에는 명백한 모순이 있다.","syn":["自家撞着"],"reviewed":true},
  {"id":"gs0020","hanja":"刎頸之交","reading":"문경지교","len":4,"lit":"목을 베어 줄 수 있는 사귐","fig":"생사를 함께할 만큼 깊은 우정","origin":"염파와 인상여의 우정에서 유래","source":"사기","example":"두 사람은 문경지교를 맺은 둘도 없는 벗이다.","syn":["竹馬故友"],"reviewed":true},
  {"id":"gs0021","hanja":"拔本塞源","reading":"발본색원","len":4,"lit":"뿌리를 뽑고 근원을 막음","fig":"폐단의 근원을 완전히 없앰","origin":"","source":"","example":"부패를 발본색원하겠다고 선언했다.","syn":[],"reviewed":true},
  {"id":"gs0022","hanja":"背水陣","reading":"배수진","len":3,"lit":"물을 등지고 친 진","fig":"물러설 곳 없이 죽을 각오로 맞섬","origin":"한신이 강을 등지고 진을 쳐 승리한 고사","source":"사기","example":"마지막 시험에 배수진을 치고 공부에 매달렸다.","syn":[],"reviewed":true},
  {"id":"gs0023","hanja":"百年河淸","reading":"백년하청","len":4,"lit":"백 년을 기다려도 황하는 맑아지지 않음","fig":"아무리 기다려도 가망이 없음","origin":"","source":"","example":"그 약속만 믿는 건 백년하청이다.","syn":[],"reviewed":true},
  {"id":"gs0024","hanja":"白眉","reading":"백미","len":2,"lit":"흰 눈썹","fig":"여럿 가운데 가장 뛰어난 것","origin":"마씨 오형제 중 흰 눈썹의 마량이 가장 뛰어났다는 데서 유래","source":"삼국지","example":"이 작품이 그의 대표작 중 백미로 꼽힌다.","syn":[],"reviewed":true},
  {"id":"gs0025","hanja":"不恥下問","reading":"불치하문","len":4,"lit":"아랫사람에게 묻기를 부끄러워하지 않음","fig":"모르는 것을 묻는 것을 부끄러워하지 않음","origin":"","source":"논어","example":"불치하문의 자세로 후배에게도 배운다.","syn":[],"reviewed":true},
  {"id":"gs0026","hanja":"四面楚歌","reading":"사면초가","len":4,"lit":"사방에서 들리는 초나라 노래","fig":"사방이 적으로 둘러싸여 고립된 처지","origin":"항우가 한나라 군에 포위돼 사방에서 초나라 노래를 들은 고사","source":"사기","example":"여론도 등을 돌려 그는 사면초가에 빠졌다.","syn":["孤立無援"],"reviewed":true},
  {"id":"gs0027","hanja":"沙上樓閣","reading":"사상누각","len":4,"lit":"모래 위의 누각","fig":"기초가 부실해 오래가지 못하는 것","origin":"","source":"","example":"계획 없는 사업은 사상누각에 불과하다.","syn":[],"reviewed":true},
  {"id":"gs0028","hanja":"塞翁之馬","reading":"새옹지마","len":4,"lit":"변방 노인의 말","fig":"인생의 길흉화복은 미리 알 수 없음","origin":"변방 노인의 말이 화가 되고 복이 되기를 거듭한 이야기","source":"회남자","example":"인생은 새옹지마라 지금의 실패가 약이 될 수 있다.","syn":["轉禍爲福"],"reviewed":true},
  {"id":"gs0029","hanja":"桑田碧海","reading":"상전벽해","len":4,"lit":"뽕밭이 푸른 바다가 됨","fig":"세상이 몰라보게 크게 변함","origin":"","source":"","example":"십 년 만에 온 고향은 상전벽해였다.","syn":["隔世之感"],"reviewed":true},
  {"id":"gs0030","hanja":"雪上加霜","reading":"설상가상","len":4,"lit":"눈 위에 서리가 더해짐","fig":"어려운 일이 잇따라 겹침","origin":"","source":"","example":"늦은 데다 비까지 오니 설상가상이다.","syn":["錦上添花"],"reviewed":true},
  {"id":"gs0031","hanja":"首丘初心","reading":"수구초심","len":4,"lit":"여우가 죽을 때 머리를 고향 언덕으로 둠","fig":"고향을 그리워하는 마음","origin":"","source":"예기","example":"나이 들수록 수구초심으로 고향이 그립다.","syn":[],"reviewed":true},
  {"id":"gs0032","hanja":"守株待兎","reading":"수주대토","len":4,"lit":"그루터기를 지키며 토끼를 기다림","fig":"낡은 방식만 고집하며 헛되이 요행을 바람","origin":"우연히 토끼를 잡은 농부가 그루터기만 지켰다는 이야기","source":"한비자","example":"노력 없이 행운만 바라는 건 수주대토다.","syn":["刻舟求劍"],"reviewed":true},
  {"id":"gs0033","hanja":"脣亡齒寒","reading":"순망치한","len":4,"lit":"입술이 없으면 이가 시림","fig":"서로 의지하던 한쪽이 망하면 다른 쪽도 위태로움","origin":"","source":"춘추좌씨전","example":"협력사가 무너지면 우리도 위태로우니 순망치한이다.","syn":[],"reviewed":true},
  {"id":"gs0034","hanja":"識字憂患","reading":"식자우환","len":4,"lit":"글자를 아는 것이 근심","fig":"어설픈 지식이 도리어 걱정을 부름","origin":"","source":"","example":"어설프게 아는 게 식자우환이 될 때가 있다.","syn":[],"reviewed":true},
  {"id":"gs0035","hanja":"我田引水","reading":"아전인수","len":4,"lit":"제 논에 물 대기","fig":"자기에게만 이롭게 생각하거나 행동함","origin":"","source":"","example":"규정을 아전인수 격으로 해석하지 마라.","syn":[],"reviewed":true},
  {"id":"gs0036","hanja":"漁夫之利","reading":"어부지리","len":4,"lit":"어부의 이익","fig":"둘이 다투는 사이 제삼자가 이익을 봄","origin":"조개와 도요새가 다투다 어부에게 둘 다 잡힌 이야기","source":"전국책","example":"두 후보가 다투는 사이 제3 후보가 어부지리로 당선됐다.","syn":["犬兎之爭"],"reviewed":true},
  {"id":"gs0037","hanja":"緣木求魚","reading":"연목구어","len":4,"lit":"나무에 올라 물고기를 구함","fig":"불가능한 일을 무리하게 하려 함","origin":"","source":"맹자","example":"준비 없이 성공을 바라는 건 연목구어다.","syn":[],"reviewed":true},
  {"id":"gs0038","hanja":"五里霧中","reading":"오리무중","len":4,"lit":"오 리에 걸친 안개 속","fig":"일의 갈피를 전혀 잡을 수 없음","origin":"","source":"후한서","example":"사건은 단서조차 없이 오리무중이다.","syn":[],"reviewed":true},
  {"id":"gs0039","hanja":"吳越同舟","reading":"오월동주","len":4,"lit":"오나라와 월나라가 한 배를 탐","fig":"원수 사이라도 위급할 땐 서로 협력함","origin":"","source":"손자","example":"경쟁사지만 위기 앞에선 오월동주로 손잡았다.","syn":[],"reviewed":true},
  {"id":"gs0040","hanja":"烏合之卒","reading":"오합지졸","len":4,"lit":"까마귀 떼처럼 모인 군사","fig":"규율도 통일도 없는 무리","origin":"","source":"","example":"훈련 없는 오합지졸로는 이길 수 없다.","syn":[],"reviewed":true},
  {"id":"gs0041","hanja":"溫故知新","reading":"온고지신","len":4,"lit":"옛것을 익혀 새것을 앎","fig":"옛것을 바탕으로 새 지식을 얻음","origin":"","source":"논어","example":"고전을 읽으며 온고지신의 지혜를 얻는다.","syn":[],"reviewed":true},
  {"id":"gs0042","hanja":"臥薪嘗膽","reading":"와신상담","len":4,"lit":"섶에 눕고 쓸개를 맛봄","fig":"원수를 갚으려 온갖 괴로움을 참고 견딤","origin":"월왕 구천이 패배 후 복수를 위해 고생을 참은 고사","source":"사기","example":"그는 와신상담 끝에 재기에 성공했다.","syn":["切齒腐心"],"reviewed":true},
  {"id":"gs0043","hanja":"完璧","reading":"완벽","len":2,"lit":"흠 없는 옥","fig":"결함 없이 완전함","origin":"인상여가 화씨벽을 온전히 지켜 돌아온 고사","source":"사기","example":"그의 발표는 빈틈없이 완벽했다.","syn":[],"reviewed":true},
  {"id":"gs0044","hanja":"龍頭蛇尾","reading":"용두사미","len":4,"lit":"용의 머리에 뱀의 꼬리","fig":"시작은 거창하나 끝이 흐지부지함","origin":"","source":"","example":"요란하게 시작했지만 결국 용두사미로 끝났다.","syn":[],"reviewed":true},
  {"id":"gs0045","hanja":"牛耳讀經","reading":"우이독경","len":4,"lit":"쇠귀에 경 읽기","fig":"아무리 일러도 알아듣지 못함","origin":"","source":"","example":"몇 번을 설명해도 우이독경이다.","syn":["馬耳東風"],"reviewed":true},
  {"id":"gs0046","hanja":"有備無患","reading":"유비무환","len":4,"lit":"준비가 있으면 근심이 없음","fig":"미리 대비하면 걱정할 것이 없다","origin":"","source":"서경","example":"유비무환이라고, 미리 대비해 두자.","syn":[],"reviewed":true},
  {"id":"gs0047","hanja":"以心傳心","reading":"이심전심","len":4,"lit":"마음에서 마음으로 전함","fig":"말 없이도 서로 뜻이 통함","origin":"부처가 가섭에게 말 없이 뜻을 전했다는 데서 유래","source":"불교","example":"오랜 친구라 이심전심으로 통한다.","syn":["拈華微笑"],"reviewed":true},
  {"id":"gs0048","hanja":"一擧兩得","reading":"일거양득","len":4,"lit":"한 번에 두 가지를 얻음","fig":"한 가지 일로 두 이익을 봄","origin":"","source":"","example":"운동하며 출근하니 일거양득이다.","syn":["一石二鳥"],"reviewed":true},
  {"id":"gs0049","hanja":"一網打盡","reading":"일망타진","len":4,"lit":"한 그물로 다 잡음","fig":"한꺼번에 모조리 잡아들임","origin":"","source":"","example":"경찰이 조직을 일망타진했다.","syn":[],"reviewed":true},
  {"id":"gs0050","hanja":"自家撞着","reading":"자가당착","len":4,"lit":"자기끼리 부딪침","fig":"자기 말과 행동이 앞뒤가 맞지 않음","origin":"","source":"","example":"그의 변명은 자가당착에 빠졌다.","syn":["矛盾"],"reviewed":true},
  {"id":"gs0051","hanja":"自繩自縛","reading":"자승자박","len":4,"lit":"제 줄로 제 몸을 묶음","fig":"자기 말·행동으로 스스로 곤란해짐","origin":"","source":"","example":"거짓말이 늘어 결국 자승자박이 됐다.","syn":[],"reviewed":true},
  {"id":"gs0052","hanja":"賊反荷杖","reading":"적반하장","len":4,"lit":"도둑이 도리어 매를 듦","fig":"잘못한 자가 도리어 큰소리침","origin":"","source":"","example":"잘못은 자기가 해 놓고 적반하장으로 화를 낸다.","syn":[],"reviewed":true},
  {"id":"gs0053","hanja":"戰戰兢兢","reading":"전전긍긍","len":4,"lit":"몹시 두려워 조심함","fig":"잘못될까 봐 매우 두려워하고 조심함","origin":"","source":"시경","example":"들킬까 봐 전전긍긍하며 지냈다.","syn":[],"reviewed":true},
  {"id":"gs0054","hanja":"轉禍爲福","reading":"전화위복","len":4,"lit":"화가 바뀌어 복이 됨","fig":"나쁜 일이 도리어 좋은 일이 됨","origin":"","source":"","example":"이번 실패가 전화위복의 계기가 됐다.","syn":["塞翁之馬"],"reviewed":true},
  {"id":"gs0055","hanja":"切磋琢磨","reading":"절차탁마","len":4,"lit":"옥돌을 자르고 갈고 쪼고 닦음","fig":"학문과 덕을 끊임없이 갈고닦음","origin":"","source":"시경","example":"동료들과 절차탁마하며 실력을 키웠다.","syn":[],"reviewed":true},
  {"id":"gs0056","hanja":"井底之蛙","reading":"정저지와","len":4,"lit":"우물 안 개구리","fig":"견문이 좁아 넓은 세상을 모름","origin":"","source":"장자","example":"넓은 세상을 보니 그동안 정저지와였음을 깨달았다.","syn":[],"reviewed":true},
  {"id":"gs0057","hanja":"朝三暮四","reading":"조삼모사","len":4,"lit":"아침에 셋 저녁에 넷","fig":"눈앞 차이만 알고 결과가 같음을 모름; 잔꾀로 속임","origin":"원숭이에게 도토리를 아침 셋 저녁 넷이라 하자 화내다, 아침 넷 저녁 셋이라 하자 좋아한 이야기","source":"열자","example":"할인처럼 보여도 조삼모사인 경우가 많다.","syn":[],"reviewed":true},
  {"id":"gs0058","hanja":"主客顚倒","reading":"주객전도","len":4,"lit":"주인과 손님이 뒤바뀜","fig":"사물의 경중·선후가 뒤바뀜","origin":"","source":"","example":"수단이 목적이 되니 주객전도다.","syn":[],"reviewed":true},
  {"id":"gs0059","hanja":"走馬看山","reading":"주마간산","len":4,"lit":"말을 달리며 산을 봄","fig":"자세히 살피지 못하고 대충 보고 지나침","origin":"","source":"","example":"시간이 없어 전시를 주마간산으로 봤다.","syn":[],"reviewed":true},
  {"id":"gs0060","hanja":"竹馬故友","reading":"죽마고우","len":4,"lit":"대말을 타고 놀던 옛 벗","fig":"어릴 때부터 함께 자란 오랜 친구","origin":"","source":"진서","example":"그와는 삼십 년 지기 죽마고우다.","syn":["刎頸之交"],"reviewed":true},
  {"id":"gs0061","hanja":"衆寡不敵","reading":"중과부적","len":4,"lit":"적은 수로 많은 수를 대적하지 못함","fig":"수가 적으면 많은 쪽을 이길 수 없다","origin":"","source":"맹자","example":"용감히 맞섰으나 중과부적이었다.","syn":[],"reviewed":true},
  {"id":"gs0062","hanja":"指鹿爲馬","reading":"지록위마","len":4,"lit":"사슴을 가리켜 말이라 함","fig":"윗사람을 농락하고 권세를 함부로 휘두름","origin":"조고가 사슴을 말이라 우기며 신하들을 시험한 고사","source":"사기","example":"권력자가 지록위마로 진실을 뒤집었다.","syn":[],"reviewed":true},
  {"id":"gs0063","hanja":"千載一遇","reading":"천재일우","len":4,"lit":"천 년에 한 번 만남","fig":"좀처럼 오지 않는 더없이 좋은 기회","origin":"","source":"","example":"이건 천재일우의 기회이니 놓치지 마라.","syn":[],"reviewed":true},
  {"id":"gs0064","hanja":"靑出於藍","reading":"청출어람","len":4,"lit":"쪽에서 나온 푸른빛이 쪽보다 더 푸름","fig":"제자나 후배가 스승·선배보다 나음","origin":"","source":"순자","example":"제자가 스승을 뛰어넘었으니 청출어람이다.","syn":[],"reviewed":true},
  {"id":"gs0065","hanja":"草綠同色","reading":"초록동색","len":4,"lit":"풀빛과 녹색은 같은 색","fig":"처지나 부류가 같은 사람끼리 어울림","origin":"","source":"","example":"끼리끼리 뭉치는 걸 보니 초록동색이다.","syn":["類類相從"],"reviewed":true},
  {"id":"gs0066","hanja":"寸鐵殺人","reading":"촌철살인","len":4,"lit":"한 치의 쇠로 사람을 죽임","fig":"짧은 한마디로 핵심을 찔러 감동·교훈을 줌","origin":"","source":"","example":"그의 한마디는 촌철살인이었다.","syn":[],"reviewed":true},
  {"id":"gs0067","hanja":"七顚八起","reading":"칠전팔기","len":4,"lit":"일곱 번 넘어져도 여덟 번 일어남","fig":"실패를 거듭해도 굴하지 않고 다시 일어남","origin":"","source":"","example":"칠전팔기 끝에 마침내 창업에 성공했다.","syn":["百折不屈"],"reviewed":true},
  {"id":"gs0068","hanja":"兎死狗烹","reading":"토사구팽","len":4,"lit":"토끼가 죽으면 사냥개를 삶음","fig":"쓸모가 다하면 가차 없이 버려짐","origin":"한신이 공을 세운 뒤 토사구팽을 탄식한 고사","source":"사기","example":"쓸모가 없어지자 토사구팽 당했다.","syn":["甘呑苦吐"],"reviewed":true},
  {"id":"gs0069","hanja":"破竹之勢","reading":"파죽지세","len":4,"lit":"대나무를 쪼개는 기세","fig":"막을 수 없을 만큼 거침없이 나아가는 기세","origin":"","source":"진서","example":"우리 팀은 파죽지세로 결승에 올랐다.","syn":[],"reviewed":true},
  {"id":"gs0070","hanja":"風前燈火","reading":"풍전등화","len":4,"lit":"바람 앞의 등불","fig":"매우 위태로워 곧 사라질 듯한 처지","origin":"","source":"","example":"회사의 운명은 풍전등화 같았다.","syn":["累卵之危"],"reviewed":true},
  {"id":"gs0071","hanja":"鶴首苦待","reading":"학수고대","len":4,"lit":"학처럼 목을 빼고 기다림","fig":"몹시 애타게 기다림","origin":"","source":"","example":"합격 발표를 학수고대하고 있다.","syn":["一日如三秋"],"reviewed":true},
  {"id":"gs0072","hanja":"螢雪之功","reading":"형설지공","len":4,"lit":"반딧불과 눈빛으로 이룬 공","fig":"온갖 고생을 하며 부지런히 공부한 보람","origin":"차윤은 반딧불로, 손강은 눈빛으로 글을 읽었다는 고사","source":"진서","example":"형설지공으로 어려운 시험을 통과했다.","syn":[],"reviewed":true},
  {"id":"gs0073","hanja":"浩然之氣","reading":"호연지기","len":4,"lit":"넓고 큰 기운","fig":"거침없이 떳떳하고 도덕적인 기상","origin":"","source":"맹자","example":"산에 올라 호연지기를 길렀다.","syn":[],"reviewed":true},
  {"id":"gs0074","hanja":"畵龍點睛","reading":"화룡점정","len":4,"lit":"용을 그리고 마지막에 눈동자를 찍음","fig":"가장 중요한 부분을 마무리해 일을 완성함","origin":"장승요가 용의 눈동자를 찍자 용이 날아올랐다는 고사","source":"역대명화기","example":"마지막 연설이 행사의 화룡점정이었다.","syn":[],"reviewed":true},
  {"id":"gs0075","hanja":"換骨奪胎","reading":"환골탈태","len":4,"lit":"뼈를 바꾸고 태를 빼앗음","fig":"사람이나 사물이 완전히 새롭게 변함","origin":"","source":"","example":"리모델링 후 가게가 환골탈태했다.","syn":[],"reviewed":true},
  {"id":"gs0076","hanja":"興盡悲來","reading":"흥진비래","len":4,"lit":"즐거움이 다하면 슬픔이 옴","fig":"세상일은 돌고 돌아 기쁨과 슬픔이 갈마듦","origin":"","source":"","example":"흥진비래라더니 좋은 일 뒤에 시련이 왔다.","syn":["苦盡甘來"],"reviewed":true}
]
export const BY_READING: Record<string, Idiom> = Object.fromEntries(IDIOMS.map(i => [i.reading, i]))

const CHO = ['ㄱ','ㄲ','ㄴ','ㄷ','ㄸ','ㄹ','ㅁ','ㅂ','ㅃ','ㅅ','ㅆ','ㅇ','ㅈ','ㅉ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ']
export function choseong(s: string): string {
  let r = ''
  for (const ch of s) { const c = ch.charCodeAt(0); if (c >= 0xac00 && c <= 0xd7a3) r += CHO[Math.floor((c - 0xac00) / 588)]; else if (ch !== ' ') r += ch }
  return r
}
export function searchIdioms(q: string): Idiom[] {
  const s = q.trim(); if (!s) return IDIOMS
  const low = s.toLowerCase()
  const isCho = /^[ㄱ-ㅎ]+$/.test(s.replace(/\s/g, ''))
  return IDIOMS.filter((i) =>
    i.hanja.includes(s) || i.reading.includes(s) || i.reading.replace(/ /g, '').includes(s) ||
    i.lit.includes(s) || i.fig.includes(s) || i.example.toLowerCase().includes(low) ||
    (isCho && choseong(i.reading).includes(s.replace(/\s/g, '')))
  )
}
