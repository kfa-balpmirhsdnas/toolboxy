import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'
import { FieldValue } from 'firebase-admin/firestore'

// Per-game config: ranking direction + plausible score bounds (anti-abuse).
const GAMES: Record<string, { order: 'asc' | 'desc'; min: number; max: number }> = {
  'reaction-time-test': { order: 'asc', min: 80, max: 2000 },
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
      const v = d.data() as { name?: string; score?: number }
      return { name: v.name ?? 'Anonymous', score: v.score ?? 0 }
    })
    return NextResponse.json({ top })
  } catch (err) {
    console.error('[leaderboard GET]', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

// POST { game, name, score } -> stores and returns the player's rank
export async function POST(req: NextRequest) {
  try {
    const { game, name, score } = (await req.json()) as { game?: string; name?: string; score?: number }
    const cfg = game ? GAMES[game] : undefined
    if (!cfg) return NextResponse.json({ error: 'Unknown game' }, { status: 400 })
    if (typeof score !== 'number' || !isFinite(score) || score < cfg.min || score > cfg.max) {
      return NextResponse.json({ error: 'Invalid score' }, { status: 400 })
    }

    const ref = scoresRef(game)
    await ref.add({ name: clean(name ?? ''), score, createdAt: FieldValue.serverTimestamp() })

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
