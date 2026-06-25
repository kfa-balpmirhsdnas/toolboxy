declare module 'gifenc' {
  interface Encoder {
    writeFrame(index: Uint8Array, width: number, height: number, opts?: { palette?: number[][]; delay?: number; transparent?: boolean }): void
    finish(): void
    bytes(): Uint8Array
  }
  export function GIFEncoder(): Encoder
  export function quantize(data: Uint8ClampedArray | Uint8Array, maxColors: number): number[][]
  export function applyPalette(data: Uint8ClampedArray | Uint8Array, palette: number[][]): Uint8Array
}
