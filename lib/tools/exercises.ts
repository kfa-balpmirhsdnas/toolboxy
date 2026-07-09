// Workout-timer presets: core/ab bodyweight exercises with recommended work/rest/sets.
// Adding an exercise = add a row here + a `wkt_ex_<id>` description key in each locale.
export type Exercise = {
  id: string
  level: 1 | 2 | 3 | 4          // difficulty (beginner → advanced), used for sorting/filtering
  work: number                  // recommended seconds of work
  rest: number                  // recommended seconds of rest
  sets: number
  name: { ko: string; ja: string; en: string }
  // Rough muscle-emphasis split shown as effect tags ("복근 60% 허벅지 25%…").
  // Keys map to the wkt_m_* locale strings.
  targets: [string, number][]
}

export const EXERCISES: Exercise[] = [
  { id: 'reverse-crunch', level: 1, work: 30, rest: 20, sets: 3, name: { ko: '리버스 크런치', ja: 'リバースクランチ', en: 'Reverse Crunch' }, targets: [['abs_low', 60], ['core', 25], ['thigh', 15]] },
  { id: 'knee-raise', level: 1, work: 30, rest: 20, sets: 3, name: { ko: '니 레이즈', ja: 'ニーレイズ', en: 'Knee Raise' }, targets: [['abs_low', 55], ['thigh', 30], ['core', 15]] },
  { id: 'seated-leg-raise', level: 1, work: 30, rest: 20, sets: 3, name: { ko: '시티드 레그 레이즈', ja: 'シーテッドレッグレイズ', en: 'Seated Leg Raise' }, targets: [['abs_low', 45], ['thigh', 35], ['core', 20]] },
  { id: 'leg-raise', level: 2, work: 30, rest: 20, sets: 3, name: { ko: '레그 레이즈', ja: 'レッグレイズ', en: 'Leg Raise' }, targets: [['abs_low', 60], ['thigh', 25], ['core', 15]] },
  { id: 'leg-raise-hold', level: 2, work: 30, rest: 25, sets: 3, name: { ko: '레그 레이즈 홀드', ja: 'レッグレイズホールド', en: 'Leg Raise Hold' }, targets: [['core', 45], ['abs_low', 40], ['thigh', 15]] },
  { id: 'flutter-kick', level: 2, work: 30, rest: 20, sets: 3, name: { ko: '플러터 킥', ja: 'フラッターキック', en: 'Flutter Kick' }, targets: [['abs_low', 45], ['thigh', 35], ['core', 20]] },
  { id: 'scissors', level: 2, work: 30, rest: 20, sets: 3, name: { ko: '시저스', ja: 'シザーズ', en: 'Scissors' }, targets: [['abs_low', 40], ['adductor', 30], ['thigh', 20], ['core', 10]] },
  { id: 'toe-touch', level: 3, work: 30, rest: 25, sets: 3, name: { ko: '토터치', ja: 'トータッチ', en: 'Toe Touch' }, targets: [['abs_up', 60], ['core', 30], ['thigh', 10]] },
  { id: 'v-up', level: 3, work: 25, rest: 30, sets: 3, name: { ko: 'V업', ja: 'Vアップ', en: 'V-Up' }, targets: [['abs_up', 40], ['abs_low', 35], ['core', 15], ['thigh', 10]] },
  { id: 'hanging-knee-raise', level: 3, work: 30, rest: 30, sets: 3, name: { ko: '행잉 니 레이즈', ja: 'ハンギングニーレイズ', en: 'Hanging Knee Raise' }, targets: [['abs_low', 50], ['grip', 20], ['thigh', 15], ['core', 15]] },
  { id: 'hanging-leg-raise', level: 4, work: 30, rest: 30, sets: 3, name: { ko: '행잉 레그 레이즈', ja: 'ハンギングレッグレイズ', en: 'Hanging Leg Raise' }, targets: [['abs_low', 55], ['core', 20], ['grip', 15], ['thigh', 10]] },
]

export const exName = (ex: Exercise, lang: string): string => (lang === 'ko' ? ex.name.ko : lang === 'ja' ? ex.name.ja : ex.name.en)
/** i18n description key for an exercise (lives in the toolui namespace). */
export const exDescKey = (id: string): string => 'wkt_ex_' + id.replace(/-/g, '_')
