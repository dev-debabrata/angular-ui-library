/**
 * Turns Lottie JSON into MP4 / WebM / MOV / GIF in the browser. Frames are drawn with lottie-web's canvas renderer;
 * videos are encoded with WebCodecs (via mediabunny), GIFs with gifenc. Everything is imported on first use.
 */
import type { VideoCodec } from 'mediabunny';

export type ExportFormat = 'mp4' | 'webm' | 'mov' | 'gif';
type VideoFormat = Exclude<ExportFormat, 'gif'>;

/** Lottie JSON fields that set the output size and timing */
export interface LottieSize {
  w?: number;
  h?: number;
  fr?: number;
  ip?: number;
  op?: number;
}

export interface ExportOptions {
  /** CSS color behind the animation; 'transparent' keeps alpha in GIFs (videos fall back to white) */
  background: string;
  /** Called with 0…1 while frames are encoded */
  onProgress?: (progress: number) => void;
}

type Lottie = (typeof import('lottie-web/build/player/lottie_light_canvas'))['default'];

const PREFERRED: Record<VideoFormat, VideoCodec[]> = {
  mp4: ['avc', 'hevc', 'vp9', 'av1'],
  webm: ['vp9', 'vp8', 'av1'],
  mov: ['avc', 'hevc', 'prores'],
};

const MIME: Record<VideoFormat, string> = {
  mp4: 'video/mp4',
  webm: 'video/webm',
  mov: 'video/quicktime',
};

/** Encodable codec per format and size, probed once */
const codecs = new Map<string, Promise<VideoCodec | null>>();

/** Output size: `scale`× the file, capped at `max`px, even numbers (H.264 needs them) */
function outputSize({ w = 200, h = 200 }: LottieSize, scale: number, max: number) {
  const s = Math.min(scale, max / Math.max(w, h));
  const even = (n: number) => Math.max(2, Math.round((n * s) / 2) * 2);
  return { width: even(w), height: even(h) };
}

/** Draws every `step`-th frame onto a canvas with the background, calling `frame` after each one */
async function renderFrames(
  lottie: Lottie,
  data: object,
  size: { width: number; height: number },
  { background, onProgress }: ExportOptions,
  { step = 1, readback = false },
  frame: (ctx: CanvasRenderingContext2D, index: number) => Promise<void> | void,
) {
  const layer = Object.assign(document.createElement('canvas'), size);
  const out = Object.assign(document.createElement('canvas'), size);
  // Only GIFs read pixels back; for video a CPU-backed canvas would just slow drawing down
  const ctx = out.getContext('2d', { willReadFrequently: readback })!;
  const anim = lottie.loadAnimation({
    // No container on purpose: with one, the canvas renderer sizes itself from that element and draws nothing
    container: undefined as unknown as Element,
    renderer: 'canvas',
    loop: false,
    autoplay: false,
    animationData: structuredClone(data),
    rendererSettings: {
      context: layer.getContext('2d')!,
      clearCanvas: true,
      preserveAspectRatio: 'xMidYMid meet',
    },
  });
  try {
    if (!anim.isLoaded)
      await new Promise<void>((resolve) => anim.addEventListener('DOMLoaded', () => resolve()));
    anim.resize(size.width, size.height);
    const count = Math.ceil(Math.max(1, Math.round(anim.totalFrames)) / step);
    for (let i = 0; i < count; i++) {
      anim.goToAndStop(i * step, true);
      ctx.clearRect(0, 0, size.width, size.height);
      if (background !== 'transparent') {
        ctx.fillStyle = background;
        ctx.fillRect(0, 0, size.width, size.height);
      }
      ctx.drawImage(layer, 0, 0);
      await frame(ctx, i);
      onProgress?.((i + 1) / count);
    }
  } finally {
    anim.destroy();
  }
}

async function exportVideo(
  lottie: Lottie,
  data: LottieSize,
  format: VideoFormat,
  options: ExportOptions,
) {
  if (typeof VideoEncoder === 'undefined') {
    throw new Error('This browser has no video encoder (WebCodecs). Try Chrome, Edge or Safari.');
  }
  const mb = await import('mediabunny');
  const fps = data.fr ?? 30;
  const size = outputSize(data, 2, 1080);
  const outputFormat =
    format === 'mp4'
      ? new mb.Mp4OutputFormat()
      : format === 'webm'
        ? new mb.WebMOutputFormat()
        : new mb.MovOutputFormat();
  const key = `${format} ${size.width}x${size.height}`;
  if (!codecs.has(key)) {
    const supported = outputFormat.getSupportedVideoCodecs();
    codecs.set(
      key,
      mb.getFirstEncodableVideoCodec(
        PREFERRED[format].filter((c) => supported.includes(c)),
        size,
      ),
    );
  }
  const codec = await codecs.get(key)!;
  if (!codec) throw new Error(`This browser can't encode ${format.toUpperCase()} video.`);

  const output = new mb.Output({ format: outputFormat, target: new mb.BufferTarget() });
  let source: InstanceType<typeof mb.CanvasSource> | null = null;
  const background = options.background === 'transparent' ? '#ffffff' : options.background;
  await renderFrames(lottie, data, size, { ...options, background }, {}, async (ctx, i) => {
    if (!source) {
      source = new mb.CanvasSource(ctx.canvas, { codec, quality: new mb.Quality('high') });
      output.addVideoTrack(source, { frameRate: fps });
      await output.start();
    }
    await source.add(i / fps, 1 / fps);
  });
  await output.finalize();
  return new Blob([output.target.buffer!], { type: MIME[format] });
}

/** At most 30 fps and 480px; a transparent background uses 1-bit alpha */
async function exportGif(lottie: Lottie, data: LottieSize, options: ExportOptions) {
  const { GIFEncoder, quantize, applyPalette } = await import('gifenc');
  const fps = data.fr ?? 30;
  const step = Math.max(1, Math.round(fps / 30));
  const size = outputSize(data, 1.5, 480);
  const transparent = options.background === 'transparent';
  const format = transparent ? 'rgba4444' : 'rgb565';
  const gif = GIFEncoder();
  await renderFrames(lottie, data, size, options, { step, readback: true }, async (ctx, i) => {
    const rgba = ctx.getImageData(0, 0, size.width, size.height).data;
    const palette = quantize(rgba, 256, { format, oneBitAlpha: transparent });
    const transparentIndex = transparent ? palette.findIndex((c) => c[3] === 0) : -1;
    gif.writeFrame(applyPalette(rgba, palette, format), size.width, size.height, {
      palette,
      delay: (1000 * step) / fps,
      transparent: transparentIndex >= 0,
      transparentIndex: Math.max(0, transparentIndex),
      dispose: transparent ? 2 : -1,
    });
    // Let the progress bar paint between frames
    if (i % 4 === 3) await new Promise((r) => setTimeout(r));
  });
  gif.finish();
  return new Blob([gif.bytes() as BlobPart], { type: 'image/gif' });
}

/** One loop of the animation as a video or GIF */
export async function exportAnimation(
  data: object,
  format: ExportFormat,
  options: ExportOptions,
): Promise<Blob> {
  // Fetch the renderer and the encoder together; the encoder's own import below then resolves from cache
  const [{ default: lottie }] = await Promise.all([
    import('lottie-web/build/player/lottie_light_canvas'),
    format === 'gif' ? import('gifenc') : import('mediabunny'),
  ]);
  return format === 'gif'
    ? exportGif(lottie, data, options)
    : exportVideo(lottie, data, format, options);
}
