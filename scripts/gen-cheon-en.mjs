// Adds English fields (sectionEn, readingEn, translationEn) to cheonsugyeong.ts.
// readingEn = Revised-Romanization of the Korean reading (for chanting).
// translationEn / sectionEn = ToolBoxy's OWN English renderings (copyright-safe).
import { readFileSync, writeFileSync } from 'fs'

const FILE = 'lib/scriptures/cheonsugyeong.ts'
const src = readFileSync(FILE, 'utf8')
const marker = 'CHEONSUGYEONG: SutraLine[] = '
const arrStart = src.indexOf('[', src.indexOf(marker) + marker.length)
const arr = JSON.parse(src.slice(arrStart, src.lastIndexOf(']') + 1))

// --- Hangul -> Revised Romanization (syllable-based) ---
const CHO = ['g', 'kk', 'n', 'd', 'tt', 'r', 'm', 'b', 'pp', 's', 'ss', '', 'j', 'jj', 'ch', 'k', 't', 'p', 'h']
const MED = ['a', 'ae', 'ya', 'yae', 'eo', 'e', 'yeo', 'ye', 'o', 'wa', 'wae', 'oe', 'yo', 'u', 'wo', 'we', 'wi', 'yu', 'eu', 'ui', 'i']
const JONG = ['', 'k', 'k', 'k', 'n', 'n', 'n', 't', 'l', 'k', 'm', 'l', 'l', 'l', 'p', 'l', 'm', 'p', 'p', 't', 't', 'ng', 't', 't', 'k', 't', 'p', 't']
function romanize(s) {
  let out = ''
  for (const ch of s) {
    const c = ch.charCodeAt(0)
    if (c >= 0xac00 && c <= 0xd7a3) { const i = c - 0xac00; out += CHO[Math.floor(i / 588)] + MED[Math.floor((i % 588) / 28)] + JONG[i % 28] }
    else out += ch
  }
  return out
}

const sectionEn = {
  '정구업진언': 'Mantra for Purifying Speech-Karma',
  '오방내외안위제신진언': 'Mantra to Comfort the Spirits of the Five Directions',
  '개경게': 'Verse for Opening the Sutra',
  '개법장진언': 'Mantra for Opening the Dharma Treasury',
  '천수천안관자재보살광대원만무애대비심대다라니계청': 'Invocation of the Great Compassion Dharani of the Thousand-Hand, Thousand-Eye Bodhisattva',
  '신묘장구대다라니': 'The Great Dharani (Sublime Verses)',
  '사방찬': 'Praise of the Four Directions',
  '도량찬': 'Praise of the Sacred Place',
  '참회게': 'Verse of Repentance',
  '참제업장십이존불': 'The Twelve Buddhas Who Remove Karmic Hindrances',
  '십악참회': 'Repentance of the Ten Evil Acts',
  '참회진언': 'Mantra of Repentance',
  '준제찬': 'Praise of Cundi',
  '정법계진언': 'Mantra for Purifying the Dharma Realm',
  '호신진언': 'Mantra for Protecting the Body',
  '관세음보살본심미묘육자대명왕진언': 'Six-Syllable Mantra of Avalokiteshvara',
  '준제진언': 'Cundi Mantra',
  '준제발원': 'Cundi Aspiration',
  '여래십대발원문': 'The Ten Great Vows of the Tathagata',
  '발사홍서원': 'The Four Great Vows',
  '발원이귀명례삼보': 'Taking Refuge in the Three Jewels',
}

const HOM = 'Homage to Avalokiteshvara of great compassion: '
const translationEn = {
  3: 'The supreme, profound, and sublime Dharma —', 4: 'hard to encounter even in countless ages —', 5: 'now I see, hear, receive, and uphold it;', 6: "I vow to understand the Buddha's true meaning.",
  8: 'Avalokiteshvara of a thousand hands and a thousand eyes, whose compassion is vast and perfect,', 9: 'I invoke and uphold the Great Dharani of unobstructed, boundless compassion.',
  10: 'I bow my head to Avalokiteshvara, lord of great compassion.', 11: 'With vast and deep vows you bear a holy form,', 12: 'adorned with a thousand arms to protect all beings,', 13: 'and with light from a thousand eyes you watch over and illumine all.',
  14: 'Within words of truth you reveal the secret Dharani,', 15: 'and from a mind of non-action you give rise to compassion,', 16: 'swiftly fulfilling every wish', 17: 'and forever dissolving all karmic wrongs.',
  18: 'Heavenly dragons and all sages guard with compassion,', 19: 'and in a single moment a hundred thousand samadhis are perfected;', 20: 'the body that upholds this Dharani is a banner of light,', 21: 'and the mind that upholds it is a storehouse of spiritual power.',
  22: 'It washes away every affliction and crosses the sea of suffering,', 23: 'and swiftly realizes the gateway of skillful means to awakening.', 24: 'Now I recite, uphold, and vow to take refuge;', 25: 'may all that I wish be fulfilled as my heart desires.',
  26: HOM + 'may I swiftly know all dharmas.', 27: HOM + 'may I swiftly attain the eye of wisdom.', 28: HOM + 'may I swiftly ferry all beings across.', 29: HOM + 'may I swiftly gain skillful means.',
  30: HOM + 'may I swiftly board the ship of prajna (wisdom).', 31: HOM + 'may I swiftly cross the sea of suffering.', 32: HOM + 'may I swiftly attain the path of precepts, meditation, and wisdom.', 33: HOM + 'may I swiftly ascend the mountain of nirvana.',
  34: HOM + 'may I swiftly reach the house of non-action.', 35: HOM + 'may I swiftly become one with the body of dharma-nature.',
  36: 'If I face a mountain of swords, it shatters of itself;', 37: 'if I face a cauldron of fire, the fire dries up of itself;', 38: 'if I face the hells, the hells vanish of themselves;', 39: 'if I face the hungry ghosts, they are filled of themselves;',
  40: 'if I face the asuras, their malice is subdued of itself;', 41: 'if I face the animals, they gain great wisdom of themselves.',
  74: 'Sprinkling water to the east, the sanctuary is cleansed;', 75: 'sprinkling to the south, it grows cool and clear;', 76: 'sprinkling to the west, a Pure Land is formed;', 77: 'sprinkling to the north, lasting peace is gained.',
  78: 'The sanctuary is pure and clear, without a speck of dust,', 79: 'and the Three Jewels and heavenly dragons descend to this place.', 80: 'Now I recite the sublime mantra;', 81: 'in compassion, quietly watch over and protect us.',
  82: 'All the evil karma I have made in the past', 83: 'arose from beginningless greed, hatred, and delusion,', 84: 'born of body, speech, and mind;', 85: 'all of it I now repent.',
  98: 'Today I repent the grave wrong of killing living beings.', 99: 'Today I repent the grave wrong of stealing.', 100: 'Today I repent the grave wrong of sexual misconduct.', 101: 'Today I repent the grave wrong of false speech.',
  102: 'Today I repent the grave wrong of frivolous speech.', 103: 'Today I repent the grave wrong of divisive speech.', 104: 'Today I repent the grave wrong of harsh speech.', 105: 'Today I repent the grave wrong of greed and attachment.',
  106: 'Today I repent the grave wrong of anger and hatred.', 107: 'Today I repent the grave wrong of ignorance and delusion.', 108: 'Wrongs piled up over countless ages are washed away in a single thought,', 109: 'vanishing without remainder, as fire consumes dry grass.',
  110: 'Wrong has no nature of its own; it arises following the mind.', 111: 'When the mind is extinguished, wrong is extinguished too.', 112: 'When both wrong and mind are gone and both are empty —', 113: 'this is called true repentance.',
  115: 'The Cundi mantra is a gathering of all merit;', 116: 'recite it always with a still mind,', 117: 'and no great disaster can befall such a person.', 118: 'Whether among the heavens or among humankind,', 119: "one receives blessings no different from a Buddha's,",
  120: 'and whoever meets this wish-fulfilling Dharani', 121: 'will surely attain the unequaled awakening.',
  127: 'Now I recite the Great Cundi Dharani,', 128: 'and at once set forth the vast vow for awakening (bodhi).', 129: 'May my meditation and wisdom swiftly grow bright,', 130: 'may all my merit be fulfilled,', 131: 'may my excellent blessings be wholly adorned,', 132: 'and may I, with all beings, realize the Buddha Way.',
  133: 'I vow to depart forever from the three evil paths of hell, hungry ghosts, and animals;', 134: 'I vow to swiftly cut off greed, hatred, and delusion;', 135: 'I vow to always hear of the Buddha, Dharma, and Sangha;', 136: 'I vow to diligently cultivate precepts, meditation, and wisdom;',
  137: 'I vow to always learn by following all Buddhas;', 138: 'I vow never to retreat from the mind set on awakening;', 139: 'I vow to be reborn without fail in the Land of Bliss;', 140: 'I vow to swiftly behold Amitabha Buddha;', 141: 'I vow to divide my body throughout every world;', 142: 'I vow to ferry all beings across, far and wide.',
  143: 'Beings are numberless; I vow to save them all.', 144: 'Afflictions are inexhaustible; I vow to end them all.', 145: 'Dharma gates are measureless; I vow to learn them all.', 146: 'The Buddha Way is supreme; I vow to accomplish it.',
  147: 'Beings within my own nature — I vow to save them all.', 148: 'Afflictions within my own nature — I vow to end them all.', 149: 'Dharma gates within my own nature — I vow to learn them all.', 150: 'The Buddha Way within my own nature — I vow to accomplish it.',
  151: 'Having made these vows, I bow with my whole life to the Three Jewels.', 152: 'Homage to the Buddhas ever present throughout the ten directions.', 153: 'Homage to the Dharma ever present throughout the ten directions.', 154: 'Homage to the Sangha ever present throughout the ten directions.',
}

let missTr = 0, missSec = 0
for (const l of arr) {
  l.sectionEn = sectionEn[l.sectionKo] || (missSec++, '')
  l.readingEn = romanize(l.reading)
  l.translationEn = l.translation.trim() ? (translationEn[l.order] || (missTr++, '')) : ''
}

const header = `// 천수경 (Cheonsugyeong / Thousand-Hands Sutra) — recitation viewer data.
//
// hanja (원문) + reading (독음) + structure are public domain. translation/
// translationJa/translationEn (meanings), readingJa, and sectionEn are ToolBoxy's
// OWN renderings; readingEn is a Revised-Romanization of the Korean reading.
// 진언/다라니/명호 lines are transliterations.
//
// AUTO-GENERATED — do not edit by hand (see scripts/gen-cheon-en.mjs et al.).

export interface SutraLine {
  order: number
  section: number
  sectionKo: string
  sectionHanja: string
  sectionEn: string
  type: string
  hanja: string
  reading: string
  readingJa: string
  readingEn: string
  translation: string
  translationJa: string
  translationEn: string
  repeat: number
  note: string
}

export const CHEONSUGYEONG: SutraLine[] = `

writeFileSync(FILE, header + JSON.stringify(arr, null, 2) + '\n')
console.log(`done. entries=${arr.length} missingTranslation=${missTr} missingSection=${missSec}`)
