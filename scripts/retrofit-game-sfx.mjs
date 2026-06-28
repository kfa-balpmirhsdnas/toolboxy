// One-off: add the shared SoundToggle (header on/off) + per-action sfx() to the
// existing games. Mechanical string replacements; reports any miss so it can be
// fixed by hand. Run: node scripts/retrofit-game-sfx.mjs
import fs from 'fs'

const BASE = 'app/(intl)/[lang]/tools'
const TOG = '\n        <SoundToggle className="absolute top-0 right-0 z-10" />'
const IMP = ["} from '@/components/tools/GameStage'", ", SoundToggle, sfx } from '@/components/tools/GameStage'"]
const box = (cls) => [`<div data-game-stage className="${cls}">`, `<div data-game-stage className="relative ${cls}">${TOG}`]

const GAMES = {
  'aim-trainer': [
    ["MuteToggle } from '@/components/tools/GameStage'", "MuteToggle, sfx } from '@/components/tools/GameStage'"],
    ['setHits((h) => h + 1); move()', "setHits((h) => h + 1); move(); sfx('hit')"],
  ],
  'choseong-quiz': [
    IMP, box('max-w-sm mx-auto space-y-4 text-center'),
    ['setLastPts(p) } else setLastPts(0)', "setLastPts(p); sfx('point') } else { setLastPts(0); sfx('lose') }"],
  ],
  'click-speed-test': [
    IMP, box('space-y-4'),
    ['setClicks(clicksRef.current) }', "setClicks(clicksRef.current); sfx('move') }"],
  ],
  'color-find': [
    IMP, box('max-w-xs mx-auto space-y-4 text-center select-none'),
    ['setTime((tm) => Math.min(30, tm + 1)) }', "setTime((tm) => Math.min(30, tm + 1)); sfx('point') }"],
    ['else setTime((tm) => Math.max(0, tm - 3))', "else { setTime((tm) => Math.max(0, tm - 3)); sfx('lose') }"],
  ],
  'game-2048': [
    IMP, box('max-w-xs mx-auto space-y-4 text-center select-none'),
    ['const withNew = spawn(nb)', "const withNew = spawn(nb); sfx(s > 0 ? 'point' : 'move')"],
  ],
  'idiom-quiz': [
    IMP, box('max-w-md mx-auto space-y-5 text-center'),
    ['setLastPts(p)\n    } else setLastPts(0)', "setLastPts(p); sfx('point')\n    } else { setLastPts(0); sfx('lose') }"],
  ],
  'memory-game': [
    IMP, box('max-w-sm mx-auto space-y-4 text-center select-none'),
    ['setCards(nc); setOpen(no)', "setCards(nc); setOpen(no); sfx('move')"],
  ],
  'minesweeper': [
    IMP, box('max-w-md mx-auto space-y-4 text-center select-none'),
    ['setDead(true); setCells(cs); return }', "setDead(true); setCells(cs); sfx('lose'); return }"],
  ],
  'number-order': [
    IMP, box('max-w-xs mx-auto space-y-4 text-center select-none'),
    ['setNext((x) => x + 1)', "setNext((x) => x + 1); sfx('point')"],
  ],
  'sliding-puzzle': [
    IMP, box('max-w-xs mx-auto space-y-4 text-center select-none'),
    ['setBoard(nb); setMoves((m) => m + 1)', "setBoard(nb); setMoves((m) => m + 1); sfx('move')"],
  ],
  'sudoku': [
    IMP, box('max-w-sm mx-auto space-y-4 text-center select-none'),
    ['setGrid((g) => g.map((x, i) => (i === sel ? v : x)))', "setGrid((g) => g.map((x, i) => (i === sel ? v : x))); sfx('move')"],
  ],
  'tic-tac-toe': [
    IMP, box('max-w-xs mx-auto space-y-4 text-center select-none'),
    ['setBoard(nb); setXTurn(!xTurn)', "setBoard(nb); setXTurn(!xTurn); sfx('drop')"],
  ],
  'word-guess': [
    IMP, box('max-w-xs mx-auto space-y-4 text-center select-none'),
    ["if (word === answer) setMsg(t('wg_win', { n: ng.length }))", "if (word === answer) { setMsg(t('wg_win', { n: ng.length })); sfx('point') }"],
  ],
  'reaction-time-test': [
    ["import Leaderboard from '@/components/tools/Leaderboard'", "import Leaderboard from '@/components/tools/Leaderboard'\nimport { SoundToggle } from '@/components/tools/GameStage'"],
    ['<ToolLayout tool={tool} lang={params.lang}>\n      <div className="space-y-4">', '<ToolLayout tool={tool} lang={params.lang}>\n      <div className="relative space-y-4">' + TOG],
  ],
}

let misses = 0
for (const [game, reps] of Object.entries(GAMES)) {
  const p = `${BASE}/${game}/page.tsx`
  let src = fs.readFileSync(p, 'utf8')
  for (const [oldS, newS] of reps) {
    if (!src.includes(oldS)) { console.log(`MISS  ${game}: ${oldS.slice(0, 50)}`); misses++; continue }
    src = src.replace(oldS, newS)
  }
  fs.writeFileSync(p, src)
  console.log(`done  ${game}`)
}
console.log(misses ? `\n${misses} MISS(es) — fix by hand` : '\nall replacements applied')
