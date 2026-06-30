// Pure filename transformation for the batch-image-rename tool. The image bytes
// are untouched — only the name changes — and the engine zips files under their
// new names (browsers can't rename the user's original files in place).
//
// Rules are independent toggles applied in the fixed order below.

export interface RenameRules {
  // 1 — prefix / suffix
  affixOn: boolean
  prefix: string
  suffix: string
  // 2 — sequence number
  seqOn: boolean
  seqStart: number
  seqDigits: number
  seqStep: number
  seqPos: 'front' | 'back'
  // 3 — find / replace
  frOn: boolean
  find: string
  replace: string
  // 4 — whitespace handling
  wsOn: boolean
  wsMode: 'underscore' | 'hyphen' | 'remove'
  // 5 — strip illegal + non-ASCII (hangul / emoji)
  stripOn: boolean
  // 6 — case
  caseOn: boolean
  caseMode: 'upper' | 'lower' | 'capitalize'
  // 7 — unify extension to lowercase
  extLowerOn: boolean
  // 8 — insert date
  dateOn: boolean
  dateValue: string // e.g. 20260627
  datePos: 'front' | 'back'
  // 9 — truncate to first / last N chars
  truncOn: boolean
  truncMode: 'first' | 'last'
  truncN: number
}

export function todayYMD(): string {
  const d = new Date()
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`
}

export const DEFAULT_RULES: RenameRules = {
  affixOn: false, prefix: 'img_', suffix: '',
  seqOn: false, seqStart: 1, seqDigits: 3, seqStep: 1, seqPos: 'back',
  frOn: false, find: '', replace: '',
  wsOn: false, wsMode: 'underscore',
  stripOn: false,
  caseOn: false, caseMode: 'lower',
  extLowerOn: true,
  dateOn: false, dateValue: '', datePos: 'front',
  truncOn: false, truncMode: 'first', truncN: 10,
}

// Collapse runs of a separator into one and trim it off the ends ("a__b_" → "a_b").
function tidySeparator(s: string, sep: string): string {
  const e = sep.replace(/[-\\^$*+?.()|[\]{}]/g, '\\$&')
  return s.replace(new RegExp(`${e}{2,}`, 'g'), sep).replace(new RegExp(`^${e}+|${e}+$`, 'g'), '')
}

/**
 * Build the new filename for one file at a given index.
 *
 * Transformation rules (find/replace, whitespace, strip, case, truncate) modify
 * the original-derived *core* name. Framing rules then wrap that core: sequence
 * and date sit just inside, and prefix/suffix are always the outermost parts —
 * so "prefix img_ + sequence front" reads "img_001name", not "001img_name".
 */
export function buildNewName(originalName: string, index: number, r: RenameRules): string {
  const dot = originalName.lastIndexOf('.')
  let core = dot > 0 ? originalName.slice(0, dot) : originalName
  let ext = dot > 0 ? originalName.slice(dot + 1) : ''

  // --- transforms on the core ---
  // find / replace
  if (r.frOn && r.find) core = core.split(r.find).join(r.replace ?? '')
  // whitespace
  if (r.wsOn) {
    core = r.wsMode === 'remove' ? core.replace(/\s+/g, '') : core.replace(/\s+/g, r.wsMode === 'underscore' ? '_' : '-')
  }
  // strip illegal filename chars + non-ASCII (hangul, emoji, …)
  if (r.stripOn) {
    core = core.replace(/[\\/:*?"<>|]/g, '').replace(/[^\x20-\x7E]/g, '')
    // brackets whose contents were just stripped away (e.g. "(여행)" → "()") become empty — drop them too
    core = core.replace(/\(\s*\)|\[\s*\]|\{\s*\}|<\s*>/g, '').replace(/\s{2,}/g, ' ').trim()
  }
  // tidy separators created above (collapse "__" → "_", trim ends)
  if (r.wsOn && r.wsMode !== 'remove') core = tidySeparator(core, r.wsMode === 'underscore' ? '_' : '-')
  // case
  if (r.caseOn) {
    if (r.caseMode === 'upper') core = core.toUpperCase()
    else if (r.caseMode === 'lower') core = core.toLowerCase()
    else core = core.charAt(0).toUpperCase() + core.slice(1).toLowerCase()
  }
  // truncate the (transformed) original name
  if (r.truncOn && r.truncN > 0) {
    core = r.truncMode === 'first' ? core.slice(0, r.truncN) : core.slice(-r.truncN)
  }
  // extension lowercase
  if (r.extLowerOn) ext = ext.toLowerCase()

  // --- framing: [prefix][seqFront][dateFront] core [dateBack][seqBack][suffix] ---
  let left = ''
  let right = ''
  if (r.seqOn) {
    const n = (r.seqStart || 0) + index * (r.seqStep || 1)
    const num = String(n).padStart(Math.max(1, r.seqDigits || 1), '0')
    if (r.seqPos === 'front') left += num
    else right = num + right
  }
  if (r.dateOn) {
    const d = r.dateValue || todayYMD()
    if (r.datePos === 'front') left += d
    else right += d
  }
  let base = left + core + right
  if (r.affixOn) base = `${r.prefix || ''}${base}${r.suffix || ''}`

  // Always strip path separators so names can't create folders in the zip.
  base = base.replace(/[\\/]/g, '')
  if (!base) base = 'file'
  return ext ? `${base}.${ext}` : base
}
