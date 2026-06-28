import fs from 'fs'
const B = 'app/(intl)/[lang]/tools'
const A = `autoFocus={typeof window !== 'undefined' && window.innerWidth >= 640}`
const R = {
  'minesweeper': [['reveal(cs, i, size); setCells(cs)', "reveal(cs, i, size); setCells(cs); sfx('move')"]],
  'sudoku': [['onClick={() => setSel(i)}', "onClick={() => { setSel(i); sfx('move') }}"]],
  'memory-game': [
    ['setTimeout(() => { setCards((cs) => cs.map((c, i) => (i === a || i === b ? { ...c, matched: true } : c))); setOpen([]) }, 350)',
     "setTimeout(() => { sfx('point'); setCards((cs) => cs.map((c, i) => (i === a || i === b ? { ...c, matched: true } : c))); setOpen([]) }, 350)"],
    ['setTimeout(() => { setCards((cs) => cs.map((c, i) => (i === a || i === b ? { ...c, flipped: false } : c))); setOpen([]) }, 800)',
     "setTimeout(() => { sfx('lose'); setCards((cs) => cs.map((c, i) => (i === a || i === b ? { ...c, flipped: false } : c))); setOpen([]) }, 800)"],
  ],
  'number-order': [['if (!stage.playing || n !== next) return', "if (!stage.playing) return\n    if (n !== next) { sfx('lose'); return }"]],
  'word-guess': [
    ["setGuesses(ng); setInput(''); setMsg('')", "setGuesses(ng); setInput(''); setMsg(''); sfx('move')"],
    ['flex-1 text-center rounded-xl border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-400',
     'w-32 mx-auto text-center rounded-xl border border-gray-200 px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-400'],
    ['type="search" autoFocus', `type="search" ${A}`],
  ],
  'choseong-quiz': [['type="search" autoFocus', `type="search" ${A}`]],
}
let miss = 0
for (const [g, reps] of Object.entries(R)) {
  const p = `${B}/${g}/page.tsx`; let s = fs.readFileSync(p, 'utf8')
  for (const [o, n] of reps) { if (!s.includes(o)) { console.log('MISS', g, o.slice(0, 40)); miss++; continue } s = s.replace(o, n) }
  fs.writeFileSync(p, s); console.log('done', g)
}
console.log(miss ? `${miss} MISS` : 'all applied')
