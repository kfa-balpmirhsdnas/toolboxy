// Generates every installable-app icon in public/icons with the unified look:
// a vertical brand gradient (lighter top -> darker bottom) and white content sized
// to ~54% width (smaller than the old flat icons). Run: node scripts/gen-icons.mjs
import { createCanvas, loadImage } from '@napi-rs/canvas'
import { writeFileSync } from 'fs'
import path from 'path'

const SIZE = 512
const OUT = 'public/icons'
const FONT = (s) => `700 ${s}px "Malgun Gothic","Yu Gothic UI","Segoe UI",sans-serif`
// Each icon is emitted twice: a rounded "<slug>.png" for desktop ('any' purpose,
// shown as-is so the square needs softening) and a full-bleed square
// "<slug>-maskable.png" for mobile ('maskable', where the launcher applies its own
// mask). Decoupling them lets desktop round clearly without the phone mask revealing
// transparent corners.
const CORNER = 100

function roundRect(x) {
  const r = CORNER
  x.beginPath()
  x.moveTo(r, 0)
  x.arcTo(SIZE, 0, SIZE, SIZE, r)
  x.arcTo(SIZE, SIZE, 0, SIZE, r)
  x.arcTo(0, SIZE, 0, 0, r)
  x.arcTo(0, 0, SIZE, 0, r)
  x.closePath()
}

function bg(x, rounded) {
  if (rounded) { roundRect(x); x.clip() }
  // azure-blue gradient matching the Samsung-Wear reference: distinctly bright/light
  // at the top, deepening toward the bottom.
  const g = x.createLinearGradient(0, 0, 0, SIZE)
  g.addColorStop(0, '#5BB1FF'); g.addColorStop(0.5, '#2E89F2'); g.addColorStop(1, '#1660E6')
  x.fillStyle = g; x.fillRect(0, 0, SIZE, SIZE)
}

function textIcon(label, file, rounded) {
  const c = createCanvas(SIZE, SIZE); const x = c.getContext('2d')
  bg(x, rounded)
  const lines = label.split('\n')
  let fs = 300; x.font = FONT(fs)
  const widest = () => Math.max(...lines.map((l) => x.measureText(l).width))
  while (widest() > SIZE * 0.44 && fs > 12) { fs -= 4; x.font = FONT(fs) }
  while (lines.length * fs * 1.06 > SIZE * 0.5 && fs > 12) { fs -= 4; x.font = FONT(fs) }
  x.fillStyle = '#fff'; x.textAlign = 'center'; x.textBaseline = 'middle'
  x.shadowColor = 'rgba(255,255,255,0.45)'; x.shadowBlur = fs * 0.08
  const lh = fs * 1.06, y0 = SIZE / 2 - (lines.length * lh) / 2 + lh / 2
  lines.forEach((l, i) => x.fillText(l, SIZE / 2, y0 + i * lh + fs * 0.02))
  writeFileSync(path.join(OUT, file), c.toBuffer('image/png'))
}

// Re-skin a shape icon: keep its exact white shape (extracted from the old flat
// icon) but on the gradient and scaled down ~25%.
async function shapeIcon(src, file, rounded, scale = 0.66) {
  const img = await loadImage(path.join('scripts/icon-src', src)) // flat original (kept for re-runs)
  const t = createCanvas(SIZE, SIZE); const tx = t.getContext('2d')
  tx.drawImage(img, 0, 0, SIZE, SIZE)
  const d = tx.getImageData(0, 0, SIZE, SIZE)
  for (let i = 0; i < d.data.length; i += 4) {
    const a = Math.min(d.data[i], d.data[i + 1], d.data[i + 2]) // whiteness -> alpha
    d.data[i] = d.data[i + 1] = d.data[i + 2] = 255; d.data[i + 3] = a
  }
  tx.putImageData(d, 0, 0)
  const c = createCanvas(SIZE, SIZE); const x = c.getContext('2d')
  bg(x, rounded)
  const s = SIZE * scale, off = (SIZE - s) / 2
  x.shadowColor = 'rgba(255,255,255,0.3)'; x.shadowBlur = 12
  x.drawImage(t, off, off, s, s)
  writeFileSync(path.join(OUT, file), c.toBuffer('image/png'))
}

// slug -> { ko, ja, en } label (matches the originals; just smaller + gradient)
const DICT = {
  'korean-to-japanese': ['한일', '韓日', 'KJ'],
  'korean-to-english': ['한영', '韓英', 'KE'],
  'japanese-to-korean': ['일한', '日韓', 'JK'],
  'english-to-korean': ['영한', '英韓', 'EK'],
  'japanese-to-english': ['일영', '日英', 'JE'],
  'english-to-japanese': ['영일', '英日', 'EJ'],
  'korean-antonyms': ['한↔', '韓↔', 'K↔'],
  'japanese-antonyms': ['일↔', '日↔', 'J↔'],
  'english-antonyms': ['영↔', '英↔', 'E↔'],
}
const LOCS = ['ko', 'ja', 'en']
const SINGLE = {
  'elementary-english-words': 'ABC',
  'elementary-japanese-words': 'あ',
  'zip-files': 'ZIP',
  'unzip': '압축\n풀기',
}

// Emit both the rounded desktop icon and the full-bleed maskable icon for mobile.
function textBoth(label, slug) { textIcon(label, `${slug}.png`, true); textIcon(label, `${slug}-maskable.png`, false) }
async function shapeBoth(src, slug) { await shapeIcon(src, `${slug}.png`, true); await shapeIcon(src, `${slug}-maskable.png`, false) }

let n = 0
for (const [slug, labels] of Object.entries(DICT)) LOCS.forEach((loc, i) => { textBoth(labels[i], `${slug}-${loc}`); n += 2 })
for (const [slug, label] of Object.entries(SINGLE)) { textBoth(label, slug); n += 2 }
await shapeBoth('white-noise-machine.png', 'white-noise-machine'); n += 2
await shapeBoth('cheonsugyeong.png', 'cheonsugyeong'); n += 2
console.log(`generated ${n} icons`)
