/**
 * Renders a Japanese string with furigana as <ruby> (reading sits above the
 * kanji), so it can be read silently without the audio button. Combined homonym
 * values ('車・お茶') are split and each segment gets its own ruby when a reading
 * is known; segments without data render as plain text.
 */
export default function RubyText({ text, furi }: { text: string; furi: Record<string, string> | null }) {
  const segments = text.split('・')
  return (
    <>
      {segments.map((seg, i) => {
        const reading = furi?.[seg]
        return (
          <span key={i}>
            {i > 0 && <span className="text-gray-400">・</span>}
            {reading ? (
              <ruby>
                {seg}
                <rt className="text-[0.45em] text-gray-500 font-normal">{reading}</rt>
              </ruby>
            ) : (
              seg
            )}
          </span>
        )
      })}
    </>
  )
}
