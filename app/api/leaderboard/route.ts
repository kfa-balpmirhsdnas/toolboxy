import { NextRequest, NextResponse } from 'next/server'
import { adminDb, adminAuth } from '@/lib/firebase-admin'
import { FieldValue } from 'firebase-admin/firestore'

// Per-game config: ranking direction + plausible score bounds (anti-abuse).
const GAMES: Record<string, { order: 'asc' | 'desc'; min: number; max: number }> = {
  'reaction-time-test': { order: 'asc', min: 80, max: 2000 },
  'click-speed-test': { order: 'desc', min: 1, max: 25 },
  'game-2048': { order: 'desc', min: 4, max: 500000 },
  'number-order': { order: 'asc', min: 5, max: 300 },
  'aim-trainer': { order: 'desc', min: 1, max: 250 },
  'color-find': { order: 'desc', min: 1, max: 300 },
  'minesweeper-easy': { order: 'asc', min: 1, max: 3600 },
  'minesweeper-medium': { order: 'asc', min: 1, max: 3600 },
  'minesweeper-hard': { order: 'asc', min: 1, max: 3600 },
  'sudoku-easy': { order: 'asc', min: 10, max: 3600 },
  'sudoku-medium': { order: 'asc', min: 10, max: 3600 },
  'sudoku-hard': { order: 'asc', min: 10, max: 3600 },
  'sliding-puzzle': { order: 'asc', min: 1, max: 100000 },
  'memory-6': { order: 'asc', min: 6, max: 1000 },
  'memory-8': { order: 'asc', min: 8, max: 1000 },
  'memory-10': { order: 'asc', min: 10, max: 1000 },
  'idiom-quiz': { order: 'desc', min: 5, max: 200 },
  'choseong-quiz': { order: 'desc', min: 5, max: 200 },
}

function clean(name: string): string {
  return (name || '').trim().replace(/[^\p{L}\p{N}_\- ]/gu, '').slice(0, 20) || 'Anonymous'
}

function scoresRef(game: string) {
  return adminDb.collection('leaderboards').doc(game).collection('scores')
}

// GET /api/leaderboard?game=reaction-time-test&limit=10
export async function GET(req: NextRequest) {
  try {
    const game = req.nextUrl.searchParams.get('game') ?? ''
    const cfg = GAMES[game]
    if (!cfg) return NextResponse.json({ error: 'Unknown game' }, { status: 400 })
    const limit = Math.min(Number(req.nextUrl.searchParams.get('limit')) || 10, 50)

    const snap = await scoresRef(game).orderBy('score', cfg.order).limit(limit).get()
    const top = snap.docs.map((d) => {
      const v = d.data() as { name?: string; score?: number; country?: string }
      return { name: v.name ?? 'Anonymous', score: v.score ?? 0, country: v.country ?? '' }
    })
    return NextResponse.json({ top })
  } catch (err) {
    console.error('[leaderboard GET]', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

// POST { game, name, score } -> stores and returns the player's rank.
// Requires a signed-in user (Bearer ID token). The display name stays the
// player's choice (or Anonymous), but the entry is tied to their uid so it can
// appear on their personal records page.
export async function POST(req: NextRequest) {
  try {
    // Auth: only logged-in users may submit scores.
    const authz = req.headers.get('authorization') || ''
    const token = authz.startsWith('Bearer ') ? authz.slice(7) : ''
    if (!token) return NextResponse.json({ error: 'Login required' }, { status: 401 })
    let uid = ''
    try {
      uid = (await adminAuth.verifyIdToken(token)).uid
    } catch {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const { game, name, score } = (await req.json()) as { game?: string; name?: string; score?: number }
    const cfg = game ? GAMES[game] : undefined
    if (!cfg || !game) return NextResponse.json({ error: 'Unknown game' }, { status: 400 })
    if (typeof score !== 'number' || !isFinite(score) || score < cfg.min || score > cfg.max) {
      return NextResponse.json({ error: 'Invalid score' }, { status: 400 })
    }

    const displayName = clean(name ?? '')
    // Coarse country (ISO-2) from Vercel's edge geo header — no user input needed.
    const ipc = (req.headers.get('x-vercel-ip-country') || '').toUpperCase()
    const country = /^[A-Z]{2}$/.test(ipc) && ipc !== 'XX' ? ipc : ''
    const ref = scoresRef(game)
    await ref.add({ name: displayName, score, uid, country, createdAt: FieldValue.serverTimestamp() })
    // Also keep a per-user record so the player can see their history.
    await adminDb.collection('users').doc(uid).collection('gameRecords').add({
      game, score, name: displayName, country, createdAt: FieldValue.serverTimestamp(),
    })

    // Rank = (# of strictly better scores) + 1
    const betterOp = cfg.order === 'asc' ? '<' : '>'
    const better = await ref.where('score', betterOp, score).count().get()
    const total = await ref.count().get()
    return NextResponse.json({ ok: true, rank: better.data().count + 1, total: total.data().count })
  } catch (err) {
    console.error('[leaderboard POST]', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
