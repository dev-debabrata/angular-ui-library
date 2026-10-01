/** Types for the parts of gifenc (https://github.com/mattdesl/gifenc) the NexLottie export uses */
declare module 'gifenc' {
  type Format = 'rgb565' | 'rgba4444';
  type Palette = number[][];

  interface Encoder {
    writeFrame(
      index: Uint8Array,
      width: number,
      height: number,
      options: {
        palette: Palette;
        delay: number;
        transparent: boolean;
        transparentIndex: number;
        dispose: number;
      },
    ): void;
    finish(): void;
    bytes(): Uint8Array;
  }

  export function GIFEncoder(): Encoder;
  export function quantize(
    rgba: Uint8ClampedArray,
    maxColors: number,
    options: { format: Format; oneBitAlpha: boolean },
  ): Palette;
  export function applyPalette(
    rgba: Uint8ClampedArray,
    palette: Palette,
    format: Format,
  ): Uint8Array;
}
