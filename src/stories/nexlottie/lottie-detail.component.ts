import {
  Component,
  ElementRef,
  computed,
  effect,
  input,
  output,
  resource,
  signal,
  viewChild,
} from '@angular/core';

import { copyToClipboard } from '../utils/clipboard';
import {
  ButtonToggleComponent,
  type ToggleOption,
} from '../components/form/button-toggle/button-toggle.component';
import { DialogComponent } from '../components/overlay/dialog/dialog.component';
import { formatFileSize } from '../components/form/file-upload/file-upload.component';
import { IconComponent } from '../components/media/icon/icon.component';
import { LottieComponent } from '../components/media/lottie/lottie.component';
import { downloadBlob } from '../utils/download';
import { elementCode, FRAMEWORKS, type ElementCode, type Framework } from '../utils/framework-code';
import { FrameworkCodeComponent } from '../getting-started/framework-code/framework-code.component';
import { categoryOf, isDarkBg, type GalleryAnimation } from './gallery-animation';
import type { ExportFormat, LottieSize } from './lottie-export';

/** Lottie JSON fields the details tab reads */
interface LottieData extends LottieSize {
  v?: string;
  layers?: unknown[];
  meta?: { bg?: string; cat?: string };
}

type Tab = 'download' | 'embed' | 'details';

const TABS: ToggleOption<Tab>[] = [
  { value: 'download', label: 'Download' },
  { value: 'embed', label: 'Asset & Embed' },
  { value: 'details', label: 'Details' },
];

const SPEEDS: ToggleOption<number>[] = [0.5, 1, 1.5, 2].map((value) => ({
  value,
  label: `${value}×`,
}));

/** Preview backgrounds: '' uses the file's own meta.bg */
const BACKGROUNDS = [
  { value: '', label: 'Default' },
  { value: '#ffffff', label: 'White' },
  { value: '#0f172a', label: 'Dark' },
  { value: 'transparent', label: 'Transparent' },
];

/** "Other export formats". SVG and PNG are the frame on screen; the rest are one full loop */
const EXPORT_FORMATS = (['mp4', 'webm', 'mov', 'svg', 'gif', 'png'] as const).map((id) => ({
  id,
  label: id === 'webm' ? 'WebM' : id.toUpperCase(),
  title: id === 'svg' || id === 'png' ? 'Frame on screen' : 'One full loop',
}));

/** Same animation with 3-decimal numbers and without layer/shape names (not needed for playback) */
function optimize(data: object): string {
  return JSON.stringify(data, (key, value) =>
    key === 'nm' || key === 'mn' || key === 'ix'
      ? undefined
      : typeof value === 'number'
        ? Math.round(value * 1000) / 1000
        : value,
  );
}

/** dotLottie: a zip with manifest.json and animations/<id>.json */
async function zipDotLottie(id: string, json: string): Promise<Blob> {
  const { zipSync, strToU8 } = await import('fflate');
  const manifest = {
    version: '1',
    generator: 'NexPrime',
    animations: [{ id, speed: 1, loop: true, autoplay: true }],
  };
  const zip = zipSync(
    {
      'manifest.json': strToU8(JSON.stringify(manifest)),
      [`animations/${id}.json`]: strToU8(json),
    },
    { level: 9 },
  );
  return new Blob([zip as BlobPart], { type: 'application/zip' });
}

/** The four download options, built once per animation so clicking just saves the Blob */
async function buildDownloads(name: string, data: object) {
  const json = JSON.stringify(data);
  const min = optimize(data);
  const [zip, zipMin] = await Promise.all([zipDotLottie(name, json), zipDotLottie(name, min)]);
  const jsonBlob = new Blob([json], { type: 'application/json' });
  const minBlob = new Blob([min], { type: 'application/json' });
  /** " 38% smaller…" when it's worth mentioning */
  const smaller = (blob: Blob, suffix: string) => {
    const pct = Math.round((1 - blob.size / jsonBlob.size) * 100);
    return pct >= 5 ? ` ${pct}% smaller${suffix}` : '';
  };
  return [
    {
      label: 'Optimized dotLottie',
      ext: 'lottie',
      blob: zipMin,
      hint: `Smallest file.${smaller(zipMin, ' than Lottie JSON.')}`,
    },
    {
      label: 'dotLottie',
      ext: 'lottie',
      blob: zip,
      hint: 'Zipped Lottie, plays in <np-lottie> and the LottieFiles players.',
    },
    {
      label: 'Optimized Lottie JSON',
      ext: 'json',
      blob: minBlob,
      hint: `Rounded numbers, no layer names.${smaller(minBlob, '.')}`,
    },
    { label: 'Lottie JSON', ext: 'json', blob: jsonBlob, hint: 'Original file, works everywhere.' },
  ];
}

/** Unique solid fill and stroke colors in the file, as hex */
function palette(data: unknown, max = 10): string[] {
  const found = new Set<string>();
  const walk = (node: unknown) => {
    if (found.size >= max || !node || typeof node !== 'object') return;
    if (Array.isArray(node)) return node.forEach(walk);
    const o = node as Record<string, unknown>;
    const c = o['c'] as { a?: number; k?: unknown } | undefined;
    if ((o['ty'] === 'fl' || o['ty'] === 'st') && c?.a === 0 && Array.isArray(c.k)) {
      const hex = (c.k as number[])
        .slice(0, 3)
        .map((v) =>
          Math.round(Math.min(1, Math.max(0, v)) * 255)
            .toString(16)
            .padStart(2, '0'),
        )
        .join('');
      found.add(`#${hex}`);
    }
    Object.values(o).forEach(walk);
  };
  walk(data);
  return [...found];
}

/** NexLottie page dialog for one animation: big preview, downloads, embed code, details and related animations */
@Component({
  selector: 'np-lottie-detail',
  imports: [
    ButtonToggleComponent,
    DialogComponent,
    FrameworkCodeComponent,
    IconComponent,
    LottieComponent,
  ],
  templateUrl: './lottie-detail.html',
  styleUrl: './lottie-detail.css',
})
export class LottieDetailComponent {
  /** Animation to show */
  readonly animation = input.required<GalleryAnimation>();

  /** Animations listed under "Related animations" */
  readonly related = input<GalleryAnimation[]>([]);

  /** Emits when the dialog is closed */
  readonly closed = output<void>();

  /** Emits the related animation the user opened */
  readonly picked = output<GalleryAnimation>();

  protected readonly tabs = TABS;
  protected readonly speeds = SPEEDS;
  protected readonly backgrounds = BACKGROUNDS;
  protected readonly exportFormats = EXPORT_FORMATS;
  protected readonly formatSize = formatFileSize;
  protected readonly isDarkBg = isDarkBg;

  protected readonly tab = signal<Tab>('download');
  protected readonly speed = signal(1);
  protected readonly playing = signal(true);
  protected readonly background = signal('');
  protected readonly copied = signal('');
  /** Video/GIF export in progress */
  protected readonly exporting = signal<{ format: ExportFormat; progress: number } | null>(null);
  protected readonly exportError = signal('');

  private readonly player = viewChild(LottieComponent);
  private readonly stage = viewChild<ElementRef<HTMLElement>>('stage');

  protected readonly data = computed(() => this.animation().data as LottieData | undefined);

  protected readonly downloads = resource({
    params: () => {
      const data = this.data();
      return data && { name: this.animation().name, data };
    },
    loader: ({ params }) => buildDownloads(params.name, params.data),
  });

  protected readonly title = computed(() =>
    this.animation()
      .name.split(/[-_\s]+/)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' '),
  );

  protected readonly category = computed(() => categoryOf(this.animation()));

  protected readonly description = computed(() => {
    const { src } = this.animation();
    return src
      ? `Loaded from ${new URL(src).hostname}`
      : `${this.category()} animation from the NexPrime set. Free to use in any project.`;
  });

  /** The file's own background, and the one in use (a swatch overrides it) */
  private readonly fileBg = computed(() => this.data()?.meta?.bg);
  private readonly chosenBg = computed(() => this.background() || this.fileBg());
  protected readonly previewBg = computed(() => this.chosenBg() || 'var(--ui-surface-muted)');

  protected readonly path = computed(() => {
    const a = this.animation();
    return a.src ?? `lottie/${a.name}.json`;
  });

  /** <np-lottie> / <np-lottie> for each framework */
  protected readonly embed = computed(() => {
    const element: ElementCode = {
      tag: 'lottie',
      inputs: { src: this.path(), speed: this.speed() !== 1 && this.speed(), size: '240px' },
    };
    return Object.fromEntries(
      FRAMEWORKS.map(({ value }) => [value, elementCode(value, element)]),
    ) as Record<Framework, string>;
  });

  /** Without NexPrime: lottie-web on its own */
  protected readonly snippets = computed(() => [
    {
      id: 'lottie-web',
      label: 'lottie-web (without NexPrime)',
      code: `lottie.loadAnimation({\n  container: document.getElementById('animation'),\n  renderer: 'svg',\n  loop: true,\n  autoplay: true,\n  path: '${this.path()}',\n});`,
    },
  ]);

  protected readonly details = computed(() => {
    const d = this.data();
    if (!d) return [];
    const fps = d.fr ?? 0;
    const frames = (d.op ?? 0) - (d.ip ?? 0);
    return [
      { icon: 'clock', label: 'Duration', value: fps ? `${(frames / fps).toFixed(2)} s` : '—' },
      { icon: 'film', label: 'Frames', value: `${frames} at ${fps} fps` },
      { icon: 'image', label: 'Size', value: `${d.w ?? '?'} × ${d.h ?? '?'}` },
      { icon: 'layers', label: 'Layers', value: `${d.layers?.length ?? 0}` },
      { icon: 'info', label: 'Lottie version', value: d.v ?? '—' },
      { icon: 'sparkles', label: 'Category', value: this.category() },
    ];
  });

  protected readonly colors = computed(() => palette(this.data()));

  constructor() {
    // A new animation starts playing on its own background
    effect(() => {
      this.animation();
      this.playing.set(true);
      this.background.set('');
    });
  }

  protected swatchBg(value: string) {
    return value === 'transparent' ? null : value || this.fileBg() || 'var(--ui-surface-muted)';
  }

  protected togglePlay() {
    const player = this.player();
    if (!player) return;
    if (this.playing()) player.pause();
    else player.play();
    this.playing.update((p) => !p);
  }

  protected download(d: { ext: string; blob: Blob }) {
    downloadBlob(d.blob, `${this.animation().name}.${d.ext}`);
  }

  protected exportFormat(id: ExportFormat | 'svg' | 'png') {
    if (id === 'svg' || id === 'png') this.exportFrame(id);
    else this.exportLoop(id);
  }

  /** The frame on screen as SVG, or as a 2× PNG on the chosen background */
  private exportFrame(format: 'svg' | 'png') {
    const svg = this.stage()?.nativeElement.querySelector('svg');
    if (!svg) return;
    const { name } = this.animation();
    const [w, h] = [this.data()?.w ?? 200, this.data()?.h ?? 200];
    const copy = svg.cloneNode(true) as SVGSVGElement;
    copy.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    copy.setAttribute('width', `${w}`);
    copy.setAttribute('height', `${h}`);
    copy.removeAttribute('style');
    const markup = new XMLSerializer().serializeToString(copy);
    if (format === 'svg')
      return downloadBlob(new Blob([markup], { type: 'image/svg+xml' }), `${name}.svg`);

    const img = new Image();
    img.onload = () => {
      const canvas = Object.assign(document.createElement('canvas'), {
        width: w * 2,
        height: h * 2,
      });
      const ctx = canvas.getContext('2d')!;
      const bg = this.chosenBg();
      if (bg && bg !== 'transparent') {
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => blob && downloadBlob(blob, `${name}.png`));
    };
    img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(markup)}`;
  }

  /** One loop as MP4, WebM, MOV or GIF, encoded in the browser */
  private async exportLoop(format: ExportFormat) {
    const data = this.data();
    if (!data || this.exporting()) return;
    const { name } = this.animation();
    this.exportError.set('');
    this.exporting.set({ format, progress: 0 });
    try {
      const { exportAnimation } = await import('./lottie-export');
      const blob = await exportAnimation(data, format, {
        background: this.chosenBg() || '#ffffff',
        onProgress: (progress) => this.exporting.set({ format, progress }),
      });
      if (this.animation().name === name) downloadBlob(blob, `${name}.${format}`);
    } catch (e) {
      this.exportError.set(
        e instanceof Error ? e.message : `Couldn't export ${format.toUpperCase()}.`,
      );
    } finally {
      this.exporting.set(null);
    }
  }

  protected async copy(id: string, text: string) {
    await copyToClipboard(text);
    this.copied.set(id);
    setTimeout(() => this.copied() === id && this.copied.set(''), 1500);
  }
}
