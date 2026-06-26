// In-memory handoff of processed files between the batch image tools, so a user
// can "continue with these results in another tool" (e.g. resize → compress).
// Held in a module variable; it survives client-side <Link> navigation within
// the SPA. A hard reload clears it (acceptable — the user can re-upload).

import type { ToolCategory } from '@/lib/tools/registry'

let stash: File[] | null = null

export function stashBatch(files: File[]) {
  stash = files
}

/** Read the stashed files without clearing (safe to call during render/StrictMode). */
export function peekBatch(): File[] | null {
  return stash
}

/** Clear the stash (call from an effect once the files have been consumed). */
export function clearBatch() {
  stash = null
}

// The five batch image tools, used to render the "related tools" / "continue" UI.
export interface BatchTool {
  slug: string
  emoji: string
}
export const BATCH_TOOLS: BatchTool[] = [
  { slug: 'batch-image-resizer', emoji: '📐' },
  { slug: 'batch-image-converter', emoji: '🔄' },
  { slug: 'batch-image-compressor', emoji: '🗜️' },
  { slug: 'batch-image-watermark', emoji: '🏷️' },
  { slug: 'batch-image-rename', emoji: '✏️' },
]

export const BATCH_CATEGORY: ToolCategory = 'image'
