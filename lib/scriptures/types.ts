// Shared shape for scripture viewer data (천수경, 반야심경, …).
export interface SutraLine {
  order: number
  section: number
  sectionKo: string
  sectionHanja: string
  sectionEn?: string // English section name
  type: string
  hanja: string
  reading: string // Korean 독음
  readingJa: string // Japanese-style reading
  readingEn?: string // Romanized (Revised Romanization) reading
  translation: string // Korean meaning
  translationJa: string // Japanese meaning
  translationEn?: string // English meaning
  repeat: number
  note: string
}
