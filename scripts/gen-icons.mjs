// Generates every installable-app icon in public/icons with the unified look:
// a vertical brand gradient (lighter top -> darker bottom) and white content sized
// to ~54% width (smaller than the old flat icons). Run: node scripts/gen-icons.mjs
import { createCanvas, loadImage, Path2D } from '@napi-rs/canvas'
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

function roundedRectPath(x, rx0, ry0, w, h, r) {
  x.beginPath()
  x.moveTo(rx0 + r, ry0)
  x.arcTo(rx0 + w, ry0, rx0 + w, ry0 + h, r)
  x.arcTo(rx0 + w, ry0 + h, rx0, ry0 + h, r)
  x.arcTo(rx0, ry0 + h, rx0, ry0, r)
  x.arcTo(rx0, ry0, rx0 + w, ry0, r)
  x.closePath()
}

// Draw a lucide-style icon (24x24 viewBox, stroked) as a single white pictogram
// on the gradient — the unified look for object-type tools (no text).
function vectorIcon(nodes, file, rounded, scale = 0.56) {
  const c = createCanvas(SIZE, SIZE); const x = c.getContext('2d')
  bg(x, rounded)
  const S = SIZE * scale, off = (SIZE - S) / 2, k = S / 24
  x.save()
  x.translate(off, off); x.scale(k, k)
  x.strokeStyle = '#fff'; x.fillStyle = '#fff'; x.lineWidth = 1.9; x.lineCap = 'round'; x.lineJoin = 'round'
  for (const [tag, a] of nodes) {
    if (tag === 'path') x.stroke(new Path2D(a.d))
    else if (tag === 'rect') { roundedRectPath(x, +a.x, +a.y, +a.width, +a.height, +(a.rx || 0)); x.stroke() }
    else if (tag === 'fillrect') { roundedRectPath(x, +a.x, +a.y, +a.width, +a.height, +(a.rx || 0)); x.fill() }
    else if (tag === 'line') { x.beginPath(); x.moveTo(+a.x1, +a.y1); x.lineTo(+a.x2, +a.y2); x.stroke() }
    else if (tag === 'circle') { x.beginPath(); x.arc(+a.cx, +a.cy, +a.r, 0, 2 * Math.PI); x.stroke() }
  }
  x.restore()
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
}
// Object-type tools: a unified white lucide pictogram (lucide-react v0.408 paths).
const VECTOR = {
  'video-player': [ // circle-play
    ['circle', { cx: '12', cy: '12', r: '10' }],
    ['path', { d: 'm10 8 6 4-6 4V8z' }],
  ],
  'calculator': [ // calculator (lucide)
    ['rect', { x: '4', y: '2', width: '16', height: '20', rx: '2' }],
    ['line', { x1: '8', x2: '16', y1: '6', y2: '6' }],
    ['line', { x1: '16', x2: '16', y1: '14', y2: '18' }],
    ['path', { d: 'M16 10h.01' }], ['path', { d: 'M12 10h.01' }], ['path', { d: 'M8 10h.01' }],
    ['path', { d: 'M12 14h.01' }], ['path', { d: 'M8 14h.01' }],
    ['path', { d: 'M12 18h.01' }], ['path', { d: 'M8 18h.01' }],
  ],
  'batch-image-editor': [ // image-plus
    ['path', { d: 'M16 5h6' }], ['path', { d: 'M19 2v6' }],
    ['path', { d: 'M21 11.5V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7.5' }],
    ['path', { d: 'm21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21' }],
    ['circle', { cx: '9', cy: '9', r: '2' }],
  ],
  'todo-list': [ // list-todo (checkbox + check + lines)
    ['rect', { x: '3', y: '5', width: '6', height: '6', rx: '1' }],
    ['path', { d: 'm3 17 2 2 4-4' }],
    ['path', { d: 'M13 6h8' }], ['path', { d: 'M13 12h8' }], ['path', { d: 'M13 18h8' }],
  ],
  'online-notepad': [ // notepad-text
    ['path', { d: 'M8 2v4' }], ['path', { d: 'M12 2v4' }], ['path', { d: 'M16 2v4' }],
    ['rect', { x: '4', y: '4', width: '16', height: '18', rx: '2' }],
    ['path', { d: 'M8 10h6' }], ['path', { d: 'M8 14h8' }], ['path', { d: 'M8 18h5' }],
  ],
  'screen-capture': [ // crop
    ['path', { d: 'M6 2v14a2 2 0 0 0 2 2h14' }],
    ['path', { d: 'M18 22V8a2 2 0 0 0-2-2H2' }],
  ],
  'fasting-timer': [ // timer (stopwatch)
    ['line', { x1: '10', x2: '14', y1: '2', y2: '2' }],
    ['line', { x1: '12', x2: '15', y1: '14', y2: '11' }],
    ['circle', { cx: '12', cy: '14', r: '8' }],
  ],
  'image-viewer': [ // image
    ['rect', { x: '3', y: '3', width: '18', height: '18', rx: '2', ry: '2' }],
    ['circle', { cx: '9', cy: '9', r: '2' }],
    ['path', { d: 'm21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21' }],
  ],
  'pdf-annotator': [ // file-pen (document + pen)
    ['path', { d: 'M12.5 22H18a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v9.5' }],
    ['path', { d: 'M14 2v4a2 2 0 0 0 2 2h4' }],
    ['path', { d: 'M10.42 12.61a2.1 2.1 0 1 1 2.97 2.97L7.95 21 4 22l.99-3.95 5.43-5.44Z' }],
  ],
  'zip-files': [ // package (closed box)
    ['path', { d: 'm7.5 4.27 9 5.15' }],
    ['path', { d: 'M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z' }],
    ['path', { d: 'm3.3 7 8.7 5 8.7-5' }],
    ['path', { d: 'M12 22V12' }],
  ],
  'remove-exif': [ // shield-check (privacy — strip location/metadata)
    ['path', { d: 'M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z' }],
    ['path', { d: 'm9 12 2 2 4-4' }],
  ],
  'background-remover': [ // scissors (cut the subject out)
    ['circle', { cx: '6', cy: '6', r: '3' }],
    ['path', { d: 'M8.12 8.12 12 12' }],
    ['path', { d: 'M20 4 8.12 15.88' }],
    ['circle', { cx: '6', cy: '18', r: '3' }],
    ['path', { d: 'M14.8 14.8 20 20' }],
  ],
  'image-mosaic': [ // a 3x3 grid of solid blocks = pixelation / mosaic tiles
    ['fillrect', { x: '3', y: '3', width: '5', height: '5', rx: '1' }], ['fillrect', { x: '9.5', y: '3', width: '5', height: '5', rx: '1' }], ['fillrect', { x: '16', y: '3', width: '5', height: '5', rx: '1' }],
    ['fillrect', { x: '3', y: '9.5', width: '5', height: '5', rx: '1' }], ['fillrect', { x: '9.5', y: '9.5', width: '5', height: '5', rx: '1' }], ['fillrect', { x: '16', y: '9.5', width: '5', height: '5', rx: '1' }],
    ['fillrect', { x: '3', y: '16', width: '5', height: '5', rx: '1' }], ['fillrect', { x: '9.5', y: '16', width: '5', height: '5', rx: '1' }], ['fillrect', { x: '16', y: '16', width: '5', height: '5', rx: '1' }],
  ],
  'unzip': [ // package-open
    ['path', { d: 'M12 22v-9' }],
    ['path', { d: 'M15.17 2.21a1.67 1.67 0 0 1 1.63 0L21 4.57a1.93 1.93 0 0 1 0 3.36L8.82 14.79a1.655 1.655 0 0 1-1.64 0L3 12.43a1.93 1.93 0 0 1 0-3.36z' }],
    ['path', { d: 'M20 13v3.87a2.06 2.06 0 0 1-1.11 1.83l-6 3.08a1.93 1.93 0 0 1-1.78 0l-6-3.08A2.06 2.06 0 0 1 4 16.87V13' }],
    ['path', { d: 'M21 12.43a1.93 1.93 0 0 0 0-3.36L8.83 2.2a1.64 1.64 0 0 0-1.63 0L3 4.57a1.93 1.93 0 0 0 0 3.36l12.18 6.86a1.636 1.636 0 0 0 1.63 0z' }],
  ],
}

// Emit both the rounded desktop icon and the full-bleed maskable icon for mobile.
function textBoth(label, slug) { textIcon(label, `${slug}.png`, true); textIcon(label, `${slug}-maskable.png`, false) }
async function shapeBoth(src, slug, anyScale = 0.66, maskScale = anyScale) { await shapeIcon(src, `${slug}.png`, true, anyScale); await shapeIcon(src, `${slug}-maskable.png`, false, maskScale) }

let n = 0
for (const [slug, labels] of Object.entries(DICT)) LOCS.forEach((loc, i) => { textBoth(labels[i], `${slug}-${loc}`); n += 2 })
for (const [slug, label] of Object.entries(SINGLE)) { textBoth(label, slug); n += 2 }
for (const [slug, nodes] of Object.entries(VECTOR)) { vectorIcon(nodes, `${slug}.png`, true); vectorIcon(nodes, `${slug}-maskable.png`, false); n += 2 }
await shapeBoth('white-noise-machine.png', 'white-noise-machine'); n += 2
await shapeBoth('cheonsugyeong.png', 'cheonsugyeong', 0.84, 0.78); n += 2 // bigger symbol to match the other app icons
console.log(`generated ${n} icons`)
