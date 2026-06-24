// Korean -> English dictionary (common words). Paired with kr-ja-dict by the
// same Korean keys so all KO/JA/EN directions can be derived. Grows in batches.
export const KR_EN: Record<string, string> = {
  // 인사 / 기본
  '안녕': 'hello', '안녕하세요': 'hello', '안녕히가세요': 'goodbye', '잘가': 'bye', '잘자': 'good night',
  '감사': 'thanks', '감사합니다': 'thank you', '고마워': 'thanks', '고맙습니다': 'thank you',
  '미안': 'sorry', '미안해': 'sorry', '미안합니다': 'sorry', '죄송합니다': 'I apologize', '괜찮아': "it's okay",
  '네': 'yes', '아니요': 'no', '아니': 'no', '예': 'yes', '응': 'yeah',
  '축하': 'congratulations', '환영': 'welcome', '부탁': 'request', '천만에요': "you're welcome",
  // 사람 / 가족
  '사람': 'person', '남자': 'man', '여자': 'woman', '아이': 'child', '어른': 'adult', '아기': 'baby',
  '친구': 'friend', '가족': 'family', '부모': 'parents', '엄마': 'mom', '아빠': 'dad', '어머니': 'mother', '아버지': 'father',
  '형': 'older brother', '누나': 'older sister', '언니': 'older sister', '동생': 'younger sibling',
  '할아버지': 'grandfather', '할머니': 'grandmother', '아들': 'son', '딸': 'daughter', '부부': 'couple',
  '남편': 'husband', '아내': 'wife', '결혼': 'marriage', '선생님': 'teacher', '학생': 'student', '의사': 'doctor',
  '간호사': 'nurse', '경찰': 'police', '손님': 'guest', '이웃': 'neighbor', '연인': 'lover', '애인': 'lover',
  // 신체
  '몸': 'body', '머리': 'head', '얼굴': 'face', '눈': 'eye', '코': 'nose', '입': 'mouth', '귀': 'ear', '이': 'tooth',
  '목': 'neck', '어깨': 'shoulder', '팔': 'arm', '손': 'hand', '손가락': 'finger', '발': 'foot', '무릎': 'knee',
  '배': 'belly', '등': 'back', '가슴': 'chest', '허리': 'waist', '피부': 'skin', '뼈': 'bone', '피': 'blood', '심장': 'heart',
  // 감정 / 성격
  '사랑': 'love', '사랑해': 'I love you', '좋아': 'like', '싫어': 'dislike', '기쁨': 'joy', '슬픔': 'sadness',
  '행복': 'happiness', '슬프다': 'sad', '기쁘다': 'glad', '화나다': 'angry', '무섭다': 'scary', '놀라다': 'surprised',
  '걱정': 'worry', '외롭다': 'lonely', '부끄럽다': 'embarrassed', '긴장': 'nervousness',
  '친절하다': 'kind', '착하다': 'nice', '용감하다': 'brave', '게으르다': 'lazy', '똑똑하다': 'smart', '정직하다': 'honest',
  // 색 / 모양
  '색': 'color', '색깔': 'color', '빨강': 'red', '파랑': 'blue', '노랑': 'yellow', '초록': 'green', '검정': 'black',
  '하양': 'white', '회색': 'gray', '분홍': 'pink', '보라': 'purple', '주황': 'orange', '갈색': 'brown',
  '별': 'star', '동그라미': 'circle', '네모': 'square', '세모': 'triangle',
  // 동물
  '동물': 'animal', '개': 'dog', '강아지': 'puppy', '고양이': 'cat', '새': 'bird', '물고기': 'fish', '말': 'horse',
  '소': 'cow', '돼지': 'pig', '닭': 'chicken', '양': 'sheep', '토끼': 'rabbit', '쥐': 'mouse', '곰': 'bear',
  '호랑이': 'tiger', '사자': 'lion', '코끼리': 'elephant', '원숭이': 'monkey', '뱀': 'snake', '개구리': 'frog',
  '거북이': 'turtle', '나비': 'butterfly', '벌': 'bee', '거미': 'spider', '모기': 'mosquito', '오리': 'duck', '여우': 'fox',
  // 식물 / 자연
  '나무': 'tree', '꽃': 'flower', '풀': 'grass', '잎': 'leaf', '뿌리': 'root', '씨앗': 'seed', '열매': 'fruit',
  '하늘': 'sky', '땅': 'ground', '산': 'mountain', '강': 'river', '바다': 'sea', '호수': 'lake', '섬': 'island',
  '돌': 'stone', '모래': 'sand', '흙': 'soil', '불': 'fire', '물': 'water', '공기': 'air', '바람': 'wind',
  '해': 'sun', '태양': 'sun', '달': 'moon', '지구': 'earth', '우주': 'universe', '구름': 'cloud', '무지개': 'rainbow',
  // 날씨 / 계절
  '날씨': 'weather', '비': 'rain', '맑음': 'sunny', '흐림': 'cloudy', '천둥': 'thunder', '번개': 'lightning',
  '안개': 'fog', '태풍': 'typhoon', '온도': 'temperature', '봄': 'spring', '여름': 'summer', '가을': 'autumn',
  '겨울': 'winter', '계절': 'season',
  // 음식
  '음식': 'food', '밥': 'rice', '국': 'soup', '고기': 'meat', '생선': 'fish', '계란': 'egg', '빵': 'bread',
  '국수': 'noodles', '라면': 'ramen', '김치': 'kimchi', '치즈': 'cheese', '버터': 'butter', '쌀': 'rice',
  '설탕': 'sugar', '소금': 'salt', '기름': 'oil', '과일': 'fruit', '사과': 'apple', '바나나': 'banana', '포도': 'grape',
  '딸기': 'strawberry', '수박': 'watermelon', '오렌지': 'orange', '복숭아': 'peach', '귤': 'tangerine', '레몬': 'lemon',
  '야채': 'vegetable', '채소': 'vegetable', '당근': 'carrot', '감자': 'potato', '양파': 'onion', '마늘': 'garlic',
  '토마토': 'tomato', '오이': 'cucumber', '버섯': 'mushroom', '콩': 'bean', '우유': 'milk', '주스': 'juice',
  '커피': 'coffee', '차': 'tea', '맥주': 'beer', '술': 'alcohol', '와인': 'wine', '과자': 'snack',
  '맛있다': 'delicious', '맛없다': 'tasteless', '달다': 'sweet', '맵다': 'spicy', '짜다': 'salty', '시다': 'sour',
  // 집 / 생활용품
  '집': 'house', '방': 'room', '거실': 'living room', '부엌': 'kitchen', '화장실': 'toilet', '욕실': 'bathroom',
  '문': 'door', '창문': 'window', '벽': 'wall', '바닥': 'floor', '천장': 'ceiling', '계단': 'stairs', '지붕': 'roof',
  '책상': 'desk', '의자': 'chair', '침대': 'bed', '소파': 'sofa', '냉장고': 'fridge', '세탁기': 'washing machine',
  '시계': 'clock', '거울': 'mirror', '그릇': 'bowl', '접시': 'plate', '컵': 'cup', '칼': 'knife', '수건': 'towel',
  '비누': 'soap', '이불': 'blanket', '베개': 'pillow', '우산': 'umbrella', '가방': 'bag', '열쇠': 'key',
  '지갑': 'wallet', '안경': 'glasses',
  // 옷
  '옷': 'clothes', '셔츠': 'shirt', '바지': 'pants', '치마': 'skirt', '모자': 'hat', '신발': 'shoes', '양말': 'socks',
  '장갑': 'gloves', '넥타이': 'necktie', '벨트': 'belt', '반지': 'ring', '목걸이': 'necklace',
  // 장소 / 시설
  '학교': 'school', '회사': 'company', '병원': 'hospital', '은행': 'bank', '우체국': 'post office', '도서관': 'library',
  '식당': 'restaurant', '가게': 'shop', '시장': 'market', '백화점': 'department store', '편의점': 'convenience store',
  '서점': 'bookstore', '약국': 'pharmacy', '카페': 'cafe', '공원': 'park', '동물원': 'zoo', '박물관': 'museum',
  '교회': 'church', '절': 'temple', '호텔': 'hotel', '공장': 'factory', '역': 'station', '공항': 'airport',
  '나라': 'country', '도시': 'city', '시골': 'countryside', '마을': 'village', '거리': 'street', '다리': 'bridge',
  // 교통
  '차': 'car', '자동차': 'car', '버스': 'bus', '택시': 'taxi', '지하철': 'subway', '기차': 'train', '비행기': 'airplane',
  '자전거': 'bicycle', '오토바이': 'motorcycle', '트럭': 'truck', '길': 'road',
  // 학교 / 공부
  '공부': 'study', '숙제': 'homework', '시험': 'exam', '수업': 'class', '교실': 'classroom', '칠판': 'blackboard',
  '책': 'book', '교과서': 'textbook', '공책': 'notebook', '연필': 'pencil', '지우개': 'eraser', '가위': 'scissors',
  '자': 'ruler', '문제': 'problem', '답': 'answer', '점수': 'score', '성적': 'grades', '졸업': 'graduation',
  '입학': 'admission', '방학': 'vacation', '교육': 'education', '국어': 'Korean (subject)', '수학': 'math',
  '과학': 'science', '영어': 'English', '역사': 'history', '지리': 'geography', '음악': 'music', '미술': 'art',
  '체육': 'PE', '단어': 'word', '문장': 'sentence', '글': 'writing',
  // 직업 / 경제
  '일': 'work', '직업': 'job', '월급': 'salary', '회의': 'meeting', '서류': 'document', '사장': 'boss', '직원': 'employee',
  '동료': 'colleague', '면접': 'interview', '돈': 'money', '무료': 'free', '유료': 'paid', '할인': 'discount',
  '가격': 'price', '값': 'price', '세금': 'tax', '현금': 'cash', '카드': 'card', '저금': 'savings', '영수증': 'receipt',
  '경제': 'economy', '계산': 'calculation', '예산': 'budget', '판매': 'sale', '구매': 'purchase',
  // 시간 / 달력
  '시간': 'time', '오늘': 'today', '내일': 'tomorrow', '어제': 'yesterday', '지금': 'now', '나중': 'later',
  '아침': 'morning', '점심': 'noon', '저녁': 'evening', '밤': 'night', '새벽': 'dawn', '낮': 'daytime',
  '주': 'week', '주말': 'weekend', '평일': 'weekday', '년': 'year', '날': 'day', '오전': 'AM', '오후': 'PM',
  '매일': 'every day', '항상': 'always', '가끔': 'sometimes', '월요일': 'Monday', '화요일': 'Tuesday',
  '수요일': 'Wednesday', '목요일': 'Thursday', '금요일': 'Friday', '토요일': 'Saturday', '일요일': 'Sunday',
  '생일': 'birthday', '휴일': 'holiday',
  // 형용사
  '크다': 'big', '작다': 'small', '많다': 'many', '적다': 'few', '높다': 'high', '낮다': 'low', '길다': 'long',
  '짧다': 'short', '넓다': 'wide', '좁다': 'narrow', '무겁다': 'heavy', '가볍다': 'light', '빠르다': 'fast',
  '느리다': 'slow', '강하다': 'strong', '약하다': 'weak', '좋다': 'good', '나쁘다': 'bad', '새롭다': 'new',
  '깨끗하다': 'clean', '더럽다': 'dirty', '예쁘다': 'pretty', '귀엽다': 'cute', '멋지다': 'cool', '아름답다': 'beautiful',
  '쉽다': 'easy', '어렵다': 'difficult', '재미있다': 'fun', '재미없다': 'boring', '중요하다': 'important',
  '덥다': 'hot (weather)', '춥다': 'cold (weather)', '뜨겁다': 'hot', '차갑다': 'cold', '따뜻하다': 'warm',
  '시원하다': 'cool', '밝다': 'bright', '어둡다': 'dark', '조용하다': 'quiet', '시끄럽다': 'noisy', '바쁘다': 'busy',
  '피곤하다': 'tired', '아프다': 'sick', '같다': 'same', '다르다': 'different', '비슷하다': 'similar', '특별하다': 'special',
  // 동사
  '가다': 'go', '오다': 'come', '먹다': 'eat', '마시다': 'drink', '자다': 'sleep', '일어나다': 'wake up',
  '걷다': 'walk', '뛰다': 'run', '서다': 'stand', '앉다': 'sit', '보다': 'see', '듣다': 'listen', '말하다': 'speak',
  '읽다': 'read', '쓰다': 'write', '사다': 'buy', '팔다': 'sell', '주다': 'give', '받다': 'receive', '만나다': 'meet',
  '웃다': 'laugh', '울다': 'cry', '놀다': 'play', '쉬다': 'rest', '열다': 'open', '닫다': 'close', '찾다': 'find',
  '만들다': 'make', '고치다': 'fix', '씻다': 'wash', '배우다': 'learn', '가르치다': 'teach', '생각하다': 'think',
  '알다': 'know', '모르다': "don't know", '기억하다': 'remember', '잊다': 'forget', '믿다': 'believe', '돕다': 'help',
  '기다리다': 'wait', '시작하다': 'start', '끝나다': 'end', '살다': 'live', '죽다': 'die', '되다': 'become',
  '있다': 'exist', '없다': 'not exist', '하다': 'do', '필요하다': 'need', '원하다': 'want',
  // 부사 / 의문사 / 대명사
  '아주': 'very', '너무': 'too', '조금': 'a little', '많이': 'a lot', '빨리': 'quickly', '천천히': 'slowly',
  '함께': 'together', '같이': 'together', '혼자': 'alone', '다시': 'again', '정말': 'really', '그리고': 'and',
  '하지만': 'but', '그래서': 'so', '또': 'also',
  '나': 'I', '너': 'you', '우리': 'we', '여기': 'here', '거기': 'there', '어디': 'where', '누구': 'who',
  '무엇': 'what', '뭐': 'what', '왜': 'why', '어떻게': 'how', '언제': 'when', '얼마': 'how much',
}
