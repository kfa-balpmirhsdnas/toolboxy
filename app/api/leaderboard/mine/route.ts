import { NextRequest, NextResponse } from 'next/server'
import { adminDb, adminAuth } from '@/lib/firebase-admin'
import { bestScore } from '@/lib/games'

/**
 * The signed-in user's own game records, grouped by game (best score, attempts,
 * last played). Requires a Bearer ID token.
 */
export async function GET(req: NextRequest) {
  try {
    const authz = req.headers.get('authorization') || ''
    const token = authz.startsWith('Bearer ') ? authz.slice(7) : ''
    if (!token) return NextResponse.json({ error: 'Login required' }, { status: 401 })
    let uid = ''
    try {
      uid = (await adminAuth.verifyIdToken(token)).uid
    } catch {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const snap = await adminDb.collection('users').doc(uid).collection('gameRecords').get()
    const byGame: Record<string, { scores: number[]; attempts: number; lastPlayed: number }> = {}
    for (const doc of snap.docs) {
      const v = doc.data() as { game?: string; score?: number; createdAt?: { toMillis?: () => number } }
      if (!v.game || typeof v.score !== 'number') continue
      const g = (byGame[v.game] ??= { scores: [], attempts: 0, lastPlayed: 0 })
      g.scores.push(v.score)
      g.attempts += 1
      const ms = v.createdAt?.toMillis ? v.createdAt.toMillis() : 0
      if (ms > g.lastPlayed) g.lastPlayed = ms
    }

    const games = Object.entries(byGame)
      .map(([game, g]) => ({ game, best: bestScore(game, g.scores), attempts: g.attempts, lastPlayed: g.lastPlayed }))
      .sort((a, b) => b.lastPlayed - a.lastPlayed)

    return NextResponse.json({ games })
  } catch (err) {
    console.error('[leaderboard/mine]', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
