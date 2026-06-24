// Shared metadata for score-based games (leaderboards + per-user records).
export interface GameMeta {
  label: string
  unit: string
  order: 'asc' | 'desc' // asc = lower is better (reaction time); desc = higher is better
}

export const GAME_META: Record<string, GameMeta> = {
  'reaction-time-test': { label: 'Reaction Time Test', unit: ' ms', order: 'asc' },
  'click-speed-test': { label: 'Click Speed Test', unit: ' CPS', order: 'desc' },
}

/** Pick the best score for a game given the ranking direction. */
export function bestScore(game: string, scores: number[]): number | null {
  if (scores.length === 0) return null
  const order = GAME_META[game]?.order ?? 'desc'
  return order === 'asc' ? Math.min(...scores) : Math.max(...scores)
}
