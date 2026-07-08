// Self-host the official pandoc WASM binary: copy it out of the pandoc-wasm npm package into
// public/ at build time (runs via the prebuild/predev hooks — locally AND on Vercel). Keeping the
// 58MB binary out of git while still serving it same-origin (no CORS/CDN risk, version pinned by
// package.json).
import { copyFileSync, existsSync, mkdirSync, statSync } from 'node:fs'

const SRC = 'node_modules/pandoc-wasm/src/pandoc.wasm'
const DEST = 'public/pandoc.wasm'

if (!existsSync(SRC)) {
  console.error('[copy-pandoc] source missing:', SRC, '- did npm install run?')
  process.exit(1)
}
mkdirSync('public', { recursive: true })
if (!existsSync(DEST) || statSync(DEST).size !== statSync(SRC).size) {
  copyFileSync(SRC, DEST)
  console.log('[copy-pandoc] copied pandoc.wasm →', DEST, `(${(statSync(DEST).size / 1048576).toFixed(1)} MB)`)
} else {
  console.log('[copy-pandoc] pandoc.wasm already up to date')
}
