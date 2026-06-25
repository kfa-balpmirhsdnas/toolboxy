// Curated country dataset (major/well-known countries across all regions) with
// trilingual country + capital names, ISO-2 code, calling code, population, region,
// and capital coordinates. Public-domain facts. Keystone for the World category
// (calling-code lookup, flag/capital quizzes, country compare, capital distance).

export type Region = 'Asia' | 'Europe' | 'Africa' | 'Americas' | 'Oceania'

export interface Country {
  code: string; en: string; ko: string; ja: string
  cap_en: string; cap_ko: string; cap_ja: string
  dial: string; pop: number; region: Region; lat: number; lng: number
}

export const COUNTRIES: Country[] = [
  { code: 'KR', en: 'South Korea', ko: '대한민국', ja: '韓国', cap_en: 'Seoul', cap_ko: '서울', cap_ja: 'ソウル', dial: '+82', pop: 51700000, region: 'Asia', lat: 37.5665, lng: 126.978 },
  { code: 'JP', en: 'Japan', ko: '일본', ja: '日本', cap_en: 'Tokyo', cap_ko: '도쿄', cap_ja: '東京', dial: '+81', pop: 124000000, region: 'Asia', lat: 35.6895, lng: 139.6917 },
  { code: 'CN', en: 'China', ko: '중국', ja: '中国', cap_en: 'Beijing', cap_ko: '베이징', cap_ja: '北京', dial: '+86', pop: 1410000000, region: 'Asia', lat: 39.9042, lng: 116.4074 },
  { code: 'TW', en: 'Taiwan', ko: '대만', ja: '台湾', cap_en: 'Taipei', cap_ko: '타이베이', cap_ja: '台北', dial: '+886', pop: 23900000, region: 'Asia', lat: 25.033, lng: 121.5654 },
  { code: 'MN', en: 'Mongolia', ko: '몽골', ja: 'モンゴル', cap_en: 'Ulaanbaatar', cap_ko: '울란바토르', cap_ja: 'ウランバートル', dial: '+976', pop: 3400000, region: 'Asia', lat: 47.8864, lng: 106.9057 },
  { code: 'VN', en: 'Vietnam', ko: '베트남', ja: 'ベトナム', cap_en: 'Hanoi', cap_ko: '하노이', cap_ja: 'ハノイ', dial: '+84', pop: 98000000, region: 'Asia', lat: 21.0285, lng: 105.8542 },
  { code: 'TH', en: 'Thailand', ko: '태국', ja: 'タイ', cap_en: 'Bangkok', cap_ko: '방콕', cap_ja: 'バンコク', dial: '+66', pop: 70000000, region: 'Asia', lat: 13.7563, lng: 100.5018 },
  { code: 'PH', en: 'Philippines', ko: '필리핀', ja: 'フィリピン', cap_en: 'Manila', cap_ko: '마닐라', cap_ja: 'マニラ', dial: '+63', pop: 113000000, region: 'Asia', lat: 14.5995, lng: 120.9842 },
  { code: 'ID', en: 'Indonesia', ko: '인도네시아', ja: 'インドネシア', cap_en: 'Jakarta', cap_ko: '자카르타', cap_ja: 'ジャカルタ', dial: '+62', pop: 274000000, region: 'Asia', lat: -6.2088, lng: 106.8456 },
  { code: 'MY', en: 'Malaysia', ko: '말레이시아', ja: 'マレーシア', cap_en: 'Kuala Lumpur', cap_ko: '쿠알라룸푸르', cap_ja: 'クアラルンプール', dial: '+60', pop: 33000000, region: 'Asia', lat: 3.139, lng: 101.6869 },
  { code: 'SG', en: 'Singapore', ko: '싱가포르', ja: 'シンガポール', cap_en: 'Singapore', cap_ko: '싱가포르', cap_ja: 'シンガポール', dial: '+65', pop: 5900000, region: 'Asia', lat: 1.3521, lng: 103.8198 },
  { code: 'MM', en: 'Myanmar', ko: '미얀마', ja: 'ミャンマー', cap_en: 'Naypyidaw', cap_ko: '네피도', cap_ja: 'ネピドー', dial: '+95', pop: 54000000, region: 'Asia', lat: 19.7633, lng: 96.0785 },
  { code: 'KH', en: 'Cambodia', ko: '캄보디아', ja: 'カンボジア', cap_en: 'Phnom Penh', cap_ko: '프놈펜', cap_ja: 'プノンペン', dial: '+855', pop: 16700000, region: 'Asia', lat: 11.5564, lng: 104.9282 },
  { code: 'LA', en: 'Laos', ko: '라오스', ja: 'ラオス', cap_en: 'Vientiane', cap_ko: '비엔티안', cap_ja: 'ビエンチャン', dial: '+856', pop: 7400000, region: 'Asia', lat: 17.9757, lng: 102.6331 },
  { code: 'IN', en: 'India', ko: '인도', ja: 'インド', cap_en: 'New Delhi', cap_ko: '뉴델리', cap_ja: 'ニューデリー', dial: '+91', pop: 1400000000, region: 'Asia', lat: 28.6139, lng: 77.209 },
  { code: 'PK', en: 'Pakistan', ko: '파키스탄', ja: 'パキスタン', cap_en: 'Islamabad', cap_ko: '이슬라마바드', cap_ja: 'イスラマバード', dial: '+92', pop: 231000000, region: 'Asia', lat: 33.6844, lng: 73.0479 },
  { code: 'BD', en: 'Bangladesh', ko: '방글라데시', ja: 'バングラデシュ', cap_en: 'Dhaka', cap_ko: '다카', cap_ja: 'ダッカ', dial: '+880', pop: 169000000, region: 'Asia', lat: 23.8103, lng: 90.4125 },
  { code: 'LK', en: 'Sri Lanka', ko: '스리랑카', ja: 'スリランカ', cap_en: 'Colombo', cap_ko: '콜롬보', cap_ja: 'コロンボ', dial: '+94', pop: 22000000, region: 'Asia', lat: 6.9271, lng: 79.8612 },
  { code: 'NP', en: 'Nepal', ko: '네팔', ja: 'ネパール', cap_en: 'Kathmandu', cap_ko: '카트만두', cap_ja: 'カトマンズ', dial: '+977', pop: 30000000, region: 'Asia', lat: 27.7172, lng: 85.324 },
  { code: 'SA', en: 'Saudi Arabia', ko: '사우디아라비아', ja: 'サウジアラビア', cap_en: 'Riyadh', cap_ko: '리야드', cap_ja: 'リヤド', dial: '+966', pop: 35000000, region: 'Asia', lat: 24.7136, lng: 46.6753 },
  { code: 'AE', en: 'United Arab Emirates', ko: '아랍에미리트', ja: 'アラブ首長国連邦', cap_en: 'Abu Dhabi', cap_ko: '아부다비', cap_ja: 'アブダビ', dial: '+971', pop: 9900000, region: 'Asia', lat: 24.4539, lng: 54.3773 },
  { code: 'IL', en: 'Israel', ko: '이스라엘', ja: 'イスラエル', cap_en: 'Jerusalem', cap_ko: '예루살렘', cap_ja: 'エルサレム', dial: '+972', pop: 9400000, region: 'Asia', lat: 31.7683, lng: 35.2137 },
  { code: 'TR', en: 'Turkey', ko: '튀르키예', ja: 'トルコ', cap_en: 'Ankara', cap_ko: '앙카라', cap_ja: 'アンカラ', dial: '+90', pop: 85000000, region: 'Asia', lat: 39.9334, lng: 32.8597 },
  { code: 'IR', en: 'Iran', ko: '이란', ja: 'イラン', cap_en: 'Tehran', cap_ko: '테헤란', cap_ja: 'テヘラン', dial: '+98', pop: 85000000, region: 'Asia', lat: 35.6892, lng: 51.389 },
  { code: 'IQ', en: 'Iraq', ko: '이라크', ja: 'イラク', cap_en: 'Baghdad', cap_ko: '바그다드', cap_ja: 'バグダッド', dial: '+964', pop: 41000000, region: 'Asia', lat: 33.3152, lng: 44.3661 },
  { code: 'QA', en: 'Qatar', ko: '카타르', ja: 'カタール', cap_en: 'Doha', cap_ko: '도하', cap_ja: 'ドーハ', dial: '+974', pop: 2900000, region: 'Asia', lat: 25.2854, lng: 51.531 },
  { code: 'GB', en: 'United Kingdom', ko: '영국', ja: 'イギリス', cap_en: 'London', cap_ko: '런던', cap_ja: 'ロンドン', dial: '+44', pop: 67000000, region: 'Europe', lat: 51.5074, lng: -0.1278 },
  { code: 'FR', en: 'France', ko: '프랑스', ja: 'フランス', cap_en: 'Paris', cap_ko: '파리', cap_ja: 'パリ', dial: '+33', pop: 65000000, region: 'Europe', lat: 48.8566, lng: 2.3522 },
  { code: 'DE', en: 'Germany', ko: '독일', ja: 'ドイツ', cap_en: 'Berlin', cap_ko: '베를린', cap_ja: 'ベルリン', dial: '+49', pop: 83000000, region: 'Europe', lat: 52.52, lng: 13.405 },
  { code: 'IT', en: 'Italy', ko: '이탈리아', ja: 'イタリア', cap_en: 'Rome', cap_ko: '로마', cap_ja: 'ローマ', dial: '+39', pop: 59000000, region: 'Europe', lat: 41.9028, lng: 12.4964 },
  { code: 'ES', en: 'Spain', ko: '스페인', ja: 'スペイン', cap_en: 'Madrid', cap_ko: '마드리드', cap_ja: 'マドリード', dial: '+34', pop: 47000000, region: 'Europe', lat: 40.4168, lng: -3.7038 },
  { code: 'PT', en: 'Portugal', ko: '포르투갈', ja: 'ポルトガル', cap_en: 'Lisbon', cap_ko: '리스본', cap_ja: 'リスボン', dial: '+351', pop: 10300000, region: 'Europe', lat: 38.7223, lng: -9.1393 },
  { code: 'NL', en: 'Netherlands', ko: '네덜란드', ja: 'オランダ', cap_en: 'Amsterdam', cap_ko: '암스테르담', cap_ja: 'アムステルダム', dial: '+31', pop: 17500000, region: 'Europe', lat: 52.3676, lng: 4.9041 },
  { code: 'BE', en: 'Belgium', ko: '벨기에', ja: 'ベルギー', cap_en: 'Brussels', cap_ko: '브뤼셀', cap_ja: 'ブリュッセル', dial: '+32', pop: 11600000, region: 'Europe', lat: 50.8503, lng: 4.3517 },
  { code: 'CH', en: 'Switzerland', ko: '스위스', ja: 'スイス', cap_en: 'Bern', cap_ko: '베른', cap_ja: 'ベルン', dial: '+41', pop: 8700000, region: 'Europe', lat: 46.948, lng: 7.4474 },
  { code: 'AT', en: 'Austria', ko: '오스트리아', ja: 'オーストリア', cap_en: 'Vienna', cap_ko: '빈', cap_ja: 'ウィーン', dial: '+43', pop: 9000000, region: 'Europe', lat: 48.2082, lng: 16.3738 },
  { code: 'SE', en: 'Sweden', ko: '스웨덴', ja: 'スウェーデン', cap_en: 'Stockholm', cap_ko: '스톡홀름', cap_ja: 'ストックホルム', dial: '+46', pop: 10400000, region: 'Europe', lat: 59.3293, lng: 18.0686 },
  { code: 'NO', en: 'Norway', ko: '노르웨이', ja: 'ノルウェー', cap_en: 'Oslo', cap_ko: '오슬로', cap_ja: 'オスロ', dial: '+47', pop: 5400000, region: 'Europe', lat: 59.9139, lng: 10.7522 },
  { code: 'DK', en: 'Denmark', ko: '덴마크', ja: 'デンマーク', cap_en: 'Copenhagen', cap_ko: '코펜하겐', cap_ja: 'コペンハーゲン', dial: '+45', pop: 5800000, region: 'Europe', lat: 55.6761, lng: 12.5683 },
  { code: 'FI', en: 'Finland', ko: '핀란드', ja: 'フィンランド', cap_en: 'Helsinki', cap_ko: '헬싱키', cap_ja: 'ヘルシンキ', dial: '+358', pop: 5500000, region: 'Europe', lat: 60.1699, lng: 24.9384 },
  { code: 'PL', en: 'Poland', ko: '폴란드', ja: 'ポーランド', cap_en: 'Warsaw', cap_ko: '바르샤바', cap_ja: 'ワルシャワ', dial: '+48', pop: 38000000, region: 'Europe', lat: 52.2297, lng: 21.0122 },
  { code: 'CZ', en: 'Czechia', ko: '체코', ja: 'チェコ', cap_en: 'Prague', cap_ko: '프라하', cap_ja: 'プラハ', dial: '+420', pop: 10700000, region: 'Europe', lat: 50.0755, lng: 14.4378 },
  { code: 'GR', en: 'Greece', ko: '그리스', ja: 'ギリシャ', cap_en: 'Athens', cap_ko: '아테네', cap_ja: 'アテネ', dial: '+30', pop: 10400000, region: 'Europe', lat: 37.9838, lng: 23.7275 },
  { code: 'HU', en: 'Hungary', ko: '헝가리', ja: 'ハンガリー', cap_en: 'Budapest', cap_ko: '부다페스트', cap_ja: 'ブダペスト', dial: '+36', pop: 9700000, region: 'Europe', lat: 47.4979, lng: 19.0402 },
  { code: 'IE', en: 'Ireland', ko: '아일랜드', ja: 'アイルランド', cap_en: 'Dublin', cap_ko: '더블린', cap_ja: 'ダブリン', dial: '+353', pop: 5000000, region: 'Europe', lat: 53.3498, lng: -6.2603 },
  { code: 'RU', en: 'Russia', ko: '러시아', ja: 'ロシア', cap_en: 'Moscow', cap_ko: '모스크바', cap_ja: 'モスクワ', dial: '+7', pop: 144000000, region: 'Europe', lat: 55.7558, lng: 37.6173 },
  { code: 'UA', en: 'Ukraine', ko: '우크라이나', ja: 'ウクライナ', cap_en: 'Kyiv', cap_ko: '키이우', cap_ja: 'キーウ', dial: '+380', pop: 41000000, region: 'Europe', lat: 50.4501, lng: 30.5234 },
  { code: 'RO', en: 'Romania', ko: '루마니아', ja: 'ルーマニア', cap_en: 'Bucharest', cap_ko: '부쿠레슈티', cap_ja: 'ブカレスト', dial: '+40', pop: 19000000, region: 'Europe', lat: 44.4268, lng: 26.1025 },
  { code: 'US', en: 'United States', ko: '미국', ja: 'アメリカ', cap_en: 'Washington, D.C.', cap_ko: '워싱턴 D.C.', cap_ja: 'ワシントンD.C.', dial: '+1', pop: 332000000, region: 'Americas', lat: 38.9072, lng: -77.0369 },
  { code: 'CA', en: 'Canada', ko: '캐나다', ja: 'カナダ', cap_en: 'Ottawa', cap_ko: '오타와', cap_ja: 'オタワ', dial: '+1', pop: 38000000, region: 'Americas', lat: 45.4215, lng: -75.6972 },
  { code: 'MX', en: 'Mexico', ko: '멕시코', ja: 'メキシコ', cap_en: 'Mexico City', cap_ko: '멕시코시티', cap_ja: 'メキシコシティ', dial: '+52', pop: 126000000, region: 'Americas', lat: 19.4326, lng: -99.1332 },
  { code: 'BR', en: 'Brazil', ko: '브라질', ja: 'ブラジル', cap_en: 'Brasília', cap_ko: '브라질리아', cap_ja: 'ブラジリア', dial: '+55', pop: 214000000, region: 'Americas', lat: -15.7939, lng: -47.8828 },
  { code: 'AR', en: 'Argentina', ko: '아르헨티나', ja: 'アルゼンチン', cap_en: 'Buenos Aires', cap_ko: '부에노스아이레스', cap_ja: 'ブエノスアイレス', dial: '+54', pop: 45000000, region: 'Americas', lat: -34.6037, lng: -58.3816 },
  { code: 'CL', en: 'Chile', ko: '칠레', ja: 'チリ', cap_en: 'Santiago', cap_ko: '산티아고', cap_ja: 'サンティアゴ', dial: '+56', pop: 19000000, region: 'Americas', lat: -33.4489, lng: -70.6693 },
  { code: 'CO', en: 'Colombia', ko: '콜롬비아', ja: 'コロンビア', cap_en: 'Bogotá', cap_ko: '보고타', cap_ja: 'ボゴタ', dial: '+57', pop: 51000000, region: 'Americas', lat: 4.711, lng: -74.0721 },
  { code: 'PE', en: 'Peru', ko: '페루', ja: 'ペルー', cap_en: 'Lima', cap_ko: '리마', cap_ja: 'リマ', dial: '+51', pop: 33000000, region: 'Americas', lat: -12.0464, lng: -77.0428 },
  { code: 'EG', en: 'Egypt', ko: '이집트', ja: 'エジプト', cap_en: 'Cairo', cap_ko: '카이로', cap_ja: 'カイロ', dial: '+20', pop: 104000000, region: 'Africa', lat: 30.0444, lng: 31.2357 },
  { code: 'ZA', en: 'South Africa', ko: '남아프리카공화국', ja: '南アフリカ', cap_en: 'Pretoria', cap_ko: '프리토리아', cap_ja: 'プレトリア', dial: '+27', pop: 60000000, region: 'Africa', lat: -25.7479, lng: 28.2293 },
  { code: 'NG', en: 'Nigeria', ko: '나이지리아', ja: 'ナイジェリア', cap_en: 'Abuja', cap_ko: '아부자', cap_ja: 'アブジャ', dial: '+234', pop: 211000000, region: 'Africa', lat: 9.0765, lng: 7.3986 },
  { code: 'KE', en: 'Kenya', ko: '케냐', ja: 'ケニア', cap_en: 'Nairobi', cap_ko: '나이로비', cap_ja: 'ナイロビ', dial: '+254', pop: 54000000, region: 'Africa', lat: -1.2921, lng: 36.8219 },
  { code: 'ET', en: 'Ethiopia', ko: '에티오피아', ja: 'エチオピア', cap_en: 'Addis Ababa', cap_ko: '아디스아바바', cap_ja: 'アディスアベバ', dial: '+251', pop: 118000000, region: 'Africa', lat: 9.03, lng: 38.74 },
  { code: 'MA', en: 'Morocco', ko: '모로코', ja: 'モロッコ', cap_en: 'Rabat', cap_ko: '라바트', cap_ja: 'ラバト', dial: '+212', pop: 37000000, region: 'Africa', lat: 34.0209, lng: -6.8416 },
  { code: 'GH', en: 'Ghana', ko: '가나', ja: 'ガーナ', cap_en: 'Accra', cap_ko: '아크라', cap_ja: 'アクラ', dial: '+233', pop: 31000000, region: 'Africa', lat: 5.6037, lng: -0.187 },
  { code: 'TZ', en: 'Tanzania', ko: '탄자니아', ja: 'タンザニア', cap_en: 'Dodoma', cap_ko: '도도마', cap_ja: 'ドドマ', dial: '+255', pop: 61000000, region: 'Africa', lat: -6.163, lng: 35.7516 },
  { code: 'AU', en: 'Australia', ko: '호주', ja: 'オーストラリア', cap_en: 'Canberra', cap_ko: '캔버라', cap_ja: 'キャンベラ', dial: '+61', pop: 26000000, region: 'Oceania', lat: -35.2809, lng: 149.13 },
  { code: 'NZ', en: 'New Zealand', ko: '뉴질랜드', ja: 'ニュージーランド', cap_en: 'Wellington', cap_ko: '웰링턴', cap_ja: 'ウェリントン', dial: '+64', pop: 5100000, region: 'Oceania', lat: -41.2865, lng: 174.7762 },
  { code: 'FJ', en: 'Fiji', ko: '피지', ja: 'フィジー', cap_en: 'Suva', cap_ko: '수바', cap_ja: 'スバ', dial: '+679', pop: 900000, region: 'Oceania', lat: -18.1416, lng: 178.4419 },
]

export const flag = (code: string) => code.replace(/./g, (c) => String.fromCodePoint(0x1f1e6 + c.charCodeAt(0) - 65))
export const cName = (c: Country, lang: string) => (lang === 'ko' ? c.ko : lang === 'ja' ? c.ja : c.en)
export const capName = (c: Country, lang: string) => (lang === 'ko' ? c.cap_ko : lang === 'ja' ? c.cap_ja : c.cap_en)

const REGION_L: Record<Region, { ko: string; ja: string; en: string }> = {
  Asia: { ko: '아시아', ja: 'アジア', en: 'Asia' }, Europe: { ko: '유럽', ja: 'ヨーロッパ', en: 'Europe' },
  Africa: { ko: '아프리카', ja: 'アフリカ', en: 'Africa' }, Americas: { ko: '아메리카', ja: 'アメリカ', en: 'Americas' },
  Oceania: { ko: '오세아니아', ja: 'オセアニア', en: 'Oceania' },
}
export const regionName = (r: Region, lang: string) => (lang === 'ko' ? REGION_L[r].ko : lang === 'ja' ? REGION_L[r].ja : REGION_L[r].en)

// great-circle distance between two capitals (km)
export function haversine(a: Country, b: Country): number {
  const R = 6371, toRad = (d: number) => (d * Math.PI) / 180
  const dLat = toRad(b.lat - a.lat), dLng = toRad(b.lng - a.lng)
  const s = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2
  return Math.round(2 * R * Math.asin(Math.sqrt(s)))
}
