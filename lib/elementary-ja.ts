export interface JaWord {
  ko: string // Korean meaning
  ja: string // Japanese word
  yomi: string // hiragana reading
}

/**
 * Elementary-level essential Japanese words (Korean meaning + Japanese + reading)
 * for the flashcard trainer. Hand-curated readings — accuracy matters for a
 * learning tool. Grouped by everyday categories kids learn first.
 */
export const ELEMENTARY_JA: JaWord[] = [
  // 숫자
  { ko: '일(1)', ja: '一', yomi: 'いち' }, { ko: '이(2)', ja: '二', yomi: 'に' }, { ko: '삼(3)', ja: '三', yomi: 'さん' },
  { ko: '사(4)', ja: '四', yomi: 'し' }, { ko: '오(5)', ja: '五', yomi: 'ご' }, { ko: '육(6)', ja: '六', yomi: 'ろく' },
  { ko: '칠(7)', ja: '七', yomi: 'しち' }, { ko: '팔(8)', ja: '八', yomi: 'はち' }, { ko: '구(9)', ja: '九', yomi: 'きゅう' },
  { ko: '십(10)', ja: '十', yomi: 'じゅう' },
  // 가족
  { ko: '가족', ja: '家族', yomi: 'かぞく' }, { ko: '아빠', ja: 'お父さん', yomi: 'おとうさん' }, { ko: '엄마', ja: 'お母さん', yomi: 'おかあさん' },
  { ko: '형/오빠', ja: 'お兄さん', yomi: 'おにいさん' }, { ko: '누나/언니', ja: 'お姉さん', yomi: 'おねえさん' }, { ko: '남동생', ja: '弟', yomi: 'おとうと' },
  { ko: '여동생', ja: '妹', yomi: 'いもうと' }, { ko: '할아버지', ja: 'おじいさん', yomi: 'おじいさん' }, { ko: '할머니', ja: 'おばあさん', yomi: 'おばあさん' },
  { ko: '아기', ja: '赤ちゃん', yomi: 'あかちゃん' },
  // 동물
  { ko: '개', ja: '犬', yomi: 'いぬ' }, { ko: '고양이', ja: '猫', yomi: 'ねこ' }, { ko: '새', ja: '鳥', yomi: 'とり' },
  { ko: '물고기', ja: '魚', yomi: 'さかな' }, { ko: '토끼', ja: 'うさぎ', yomi: 'うさぎ' }, { ko: '곰', ja: '熊', yomi: 'くま' },
  { ko: '호랑이', ja: '虎', yomi: 'とら' }, { ko: '사자', ja: 'ライオン', yomi: 'らいおん' }, { ko: '코끼리', ja: '象', yomi: 'ぞう' },
  { ko: '원숭이', ja: '猿', yomi: 'さる' }, { ko: '말', ja: '馬', yomi: 'うま' }, { ko: '소', ja: '牛', yomi: 'うし' },
  { ko: '돼지', ja: '豚', yomi: 'ぶた' }, { ko: '닭', ja: 'にわとり', yomi: 'にわとり' }, { ko: '뱀', ja: '蛇', yomi: 'へび' },
  { ko: '개구리', ja: 'かえる', yomi: 'かえる' }, { ko: '나비', ja: '蝶', yomi: 'ちょう' },
  // 음식
  { ko: '밥', ja: 'ご飯', yomi: 'ごはん' }, { ko: '물', ja: '水', yomi: 'みず' }, { ko: '빵', ja: 'パン', yomi: 'ぱん' },
  { ko: '우유', ja: '牛乳', yomi: 'ぎゅうにゅう' }, { ko: '계란', ja: '卵', yomi: 'たまご' }, { ko: '고기', ja: '肉', yomi: 'にく' },
  { ko: '생선', ja: '魚', yomi: 'さかな' }, { ko: '라면', ja: 'ラーメン', yomi: 'らーめん' }, { ko: '과자', ja: 'お菓子', yomi: 'おかし' },
  { ko: '사탕', ja: '飴', yomi: 'あめ' }, { ko: '아이스크림', ja: 'アイス', yomi: 'あいす' }, { ko: '주스', ja: 'ジュース', yomi: 'じゅーす' },
  // 과일/채소
  { ko: '사과', ja: 'りんご', yomi: 'りんご' }, { ko: '바나나', ja: 'バナナ', yomi: 'ばなな' }, { ko: '딸기', ja: 'いちご', yomi: 'いちご' },
  { ko: '포도', ja: 'ぶどう', yomi: 'ぶどう' }, { ko: '수박', ja: 'すいか', yomi: 'すいか' }, { ko: '귤', ja: 'みかん', yomi: 'みかん' },
  { ko: '토마토', ja: 'トマト', yomi: 'とまと' }, { ko: '당근', ja: 'にんじん', yomi: 'にんじん' }, { ko: '감자', ja: 'じゃがいも', yomi: 'じゃがいも' },
  // 색깔
  { ko: '빨강', ja: '赤', yomi: 'あか' }, { ko: '파랑', ja: '青', yomi: 'あお' }, { ko: '노랑', ja: '黄色', yomi: 'きいろ' },
  { ko: '초록', ja: '緑', yomi: 'みどり' }, { ko: '검정', ja: '黒', yomi: 'くろ' }, { ko: '하양', ja: '白', yomi: 'しろ' },
  { ko: '분홍', ja: 'ピンク', yomi: 'ぴんく' }, { ko: '갈색', ja: '茶色', yomi: 'ちゃいろ' },
  // 신체
  { ko: '머리', ja: '頭', yomi: 'あたま' }, { ko: '눈', ja: '目', yomi: 'め' }, { ko: '코', ja: '鼻', yomi: 'はな' },
  { ko: '입', ja: '口', yomi: 'くち' }, { ko: '귀', ja: '耳', yomi: 'みみ' }, { ko: '손', ja: '手', yomi: 'て' },
  { ko: '발', ja: '足', yomi: 'あし' }, { ko: '이(치아)', ja: '歯', yomi: 'は' }, { ko: '얼굴', ja: '顔', yomi: 'かお' },
  // 학교/사물
  { ko: '학교', ja: '学校', yomi: 'がっこう' }, { ko: '선생님', ja: '先生', yomi: 'せんせい' }, { ko: '친구', ja: '友達', yomi: 'ともだち' },
  { ko: '책', ja: '本', yomi: 'ほん' }, { ko: '연필', ja: '鉛筆', yomi: 'えんぴつ' }, { ko: '지우개', ja: '消しゴム', yomi: 'けしごむ' },
  { ko: '공책', ja: 'ノート', yomi: 'のーと' }, { ko: '가방', ja: 'かばん', yomi: 'かばん' }, { ko: '의자', ja: '椅子', yomi: 'いす' },
  { ko: '책상', ja: '机', yomi: 'つくえ' }, { ko: '시계', ja: '時計', yomi: 'とけい' }, { ko: '우산', ja: '傘', yomi: 'かさ' },
  // 자연
  { ko: '하늘', ja: '空', yomi: 'そら' }, { ko: '산', ja: '山', yomi: 'やま' }, { ko: '바다', ja: '海', yomi: 'うみ' },
  { ko: '강', ja: '川', yomi: 'かわ' }, { ko: '나무', ja: '木', yomi: 'き' }, { ko: '꽃', ja: '花', yomi: 'はな' },
  { ko: '돌', ja: '石', yomi: 'いし' }, { ko: '해', ja: '太陽', yomi: 'たいよう' }, { ko: '달', ja: '月', yomi: 'つき' },
  { ko: '별', ja: '星', yomi: 'ほし' }, { ko: '구름', ja: '雲', yomi: 'くも' }, { ko: '비', ja: '雨', yomi: 'あめ' },
  { ko: '눈(날씨)', ja: '雪', yomi: 'ゆき' }, { ko: '바람', ja: '風', yomi: 'かぜ' }, { ko: '불', ja: '火', yomi: 'ひ' },
  // 집/교통
  { ko: '집', ja: '家', yomi: 'いえ' }, { ko: '문', ja: 'ドア', yomi: 'どあ' }, { ko: '창문', ja: '窓', yomi: 'まど' },
  { ko: '침대', ja: 'ベッド', yomi: 'べっど' }, { ko: '컵', ja: 'コップ', yomi: 'こっぷ' }, { ko: '전화', ja: '電話', yomi: 'でんわ' },
  { ko: '자동차', ja: '車', yomi: 'くるま' }, { ko: '자전거', ja: '自転車', yomi: 'じてんしゃ' }, { ko: '기차', ja: '電車', yomi: 'でんしゃ' },
  { ko: '비행기', ja: '飛行機', yomi: 'ひこうき' }, { ko: '배', ja: '船', yomi: 'ふね' },
  // 동사
  { ko: '가다', ja: '行く', yomi: 'いく' }, { ko: '오다', ja: '来る', yomi: 'くる' }, { ko: '먹다', ja: '食べる', yomi: 'たべる' },
  { ko: '마시다', ja: '飲む', yomi: 'のむ' }, { ko: '자다', ja: '寝る', yomi: 'ねる' }, { ko: '일어나다', ja: '起きる', yomi: 'おきる' },
  { ko: '보다', ja: '見る', yomi: 'みる' }, { ko: '듣다', ja: '聞く', yomi: 'きく' }, { ko: '말하다', ja: '話す', yomi: 'はなす' },
  { ko: '읽다', ja: '読む', yomi: 'よむ' }, { ko: '쓰다', ja: '書く', yomi: 'かく' }, { ko: '놀다', ja: '遊ぶ', yomi: 'あそぶ' },
  { ko: '웃다', ja: '笑う', yomi: 'わらう' }, { ko: '울다', ja: '泣く', yomi: 'なく' }, { ko: '달리다', ja: '走る', yomi: 'はしる' },
  { ko: '걷다', ja: '歩く', yomi: 'あるく' }, { ko: '앉다', ja: '座る', yomi: 'すわる' }, { ko: '서다', ja: '立つ', yomi: 'たつ' },
  // 형용사
  { ko: '크다', ja: '大きい', yomi: 'おおきい' }, { ko: '작다', ja: '小さい', yomi: 'ちいさい' }, { ko: '많다', ja: '多い', yomi: 'おおい' },
  { ko: '길다', ja: '長い', yomi: 'ながい' }, { ko: '짧다', ja: '短い', yomi: 'みじかい' }, { ko: '높다', ja: '高い', yomi: 'たかい' },
  { ko: '빠르다', ja: '速い', yomi: 'はやい' }, { ko: '덥다', ja: '暑い', yomi: 'あつい' }, { ko: '춥다', ja: '寒い', yomi: 'さむい' },
  { ko: '좋다', ja: '良い', yomi: 'いい' }, { ko: '예쁘다', ja: 'きれい', yomi: 'きれい' }, { ko: '맛있다', ja: 'おいしい', yomi: 'おいしい' },
  { ko: '재미있다', ja: '面白い', yomi: 'おもしろい' }, { ko: '귀엽다', ja: 'かわいい', yomi: 'かわいい' },
  // 인사
  { ko: '안녕(만남)', ja: 'こんにちは', yomi: 'こんにちは' }, { ko: '안녕히(헤어짐)', ja: 'さようなら', yomi: 'さようなら' },
  { ko: '고마워', ja: 'ありがとう', yomi: 'ありがとう' }, { ko: '미안해', ja: 'ごめんなさい', yomi: 'ごめんなさい' },
  { ko: '잘 먹겠습니다', ja: 'いただきます', yomi: 'いただきます' }, { ko: '네', ja: 'はい', yomi: 'はい' }, { ko: '아니요', ja: 'いいえ', yomi: 'いいえ' },
]
