// Perceived-loudness (RMS) measurement for volume normalization. Decodes the audio once and computes
// an integrated RMS; the player caches the resulting gain per track so a file is only analyzed once.
// We normalize DOWNWARD only (via audio.volume, which can't exceed 1.0) so it never touches the Web
// Audio graph — that keeps mobile background / lock-screen playback working.

let ctx: AudioContext | null = null
function audioCtx(): AudioContext | null {
  try {
    if (!ctx) { const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext; if (!AC) return null; ctx = new AC() }
    return ctx
  } catch { return null }
}

// Integrated RMS in linear amplitude (0..1), or null if the file can't be decoded.
export async function measureRms(blob: Blob, signal?: AbortSignal): Promise<number | null> {
  const c = audioCtx()
  if (!c) return null
  try {
    const raw = await blob.arrayBuffer()
    if (signal?.aborted) return null
    const audio = await c.decodeAudioData(raw.slice(0)) // slice: decodeAudioData detaches the buffer
    if (signal?.aborted) return null
    let sum = 0
    let count = 0
    const step = Math.max(1, Math.floor(audio.sampleRate / 8000)) // ~8k samples/sec is plenty for loudness
    for (let ch = 0; ch < audio.numberOfChannels; ch++) {
      const data = audio.getChannelData(ch)
      for (let i = 0; i < data.length; i += step) { const s = data[i]; sum += s * s; count++ }
    }
    return count ? Math.sqrt(sum / count) : null
  } catch { return null }
}

// Target RMS (linear) ≈ -16 dBFS. Tracks louder than this are attenuated toward it; quieter tracks
// stay as-is (we can only turn down, not up).
const TARGET_RMS = 0.158
export function gainForRms(rms: number | null | undefined): number {
  if (!rms || rms <= 0) return 1
  return Math.max(0.1, Math.min(1, TARGET_RMS / rms))
}
