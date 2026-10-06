import { NgTemplateOutlet } from '@angular/common';
import {
  Component,
  type ElementRef,
  ViewEncapsulation,
  computed,
  input,
  signal,
  viewChild,
} from '@angular/core';

import { ButtonComponent } from '../components/form/button/button.component';
import {
  ButtonToggleComponent,
  type ToggleOption,
} from '../components/form/button-toggle/button-toggle.component';
import {
  ICON_VARIANTS,
  IconComponent,
  type IconVariant,
  markClosedShapes,
} from '../components/media/icon/icon.component';
import { SearchInputComponent } from '../components/form/search-input/search-input.component';
import { copyToClipboard } from '../utils/clipboard';
import { elementCode, FRAMEWORKS, type ElementCode, type Framework } from '../utils/framework-code';
import { downloadBlob } from '../utils/download';
import { renderInBatches } from '../utils/render-in-batches';
import { FrameworkCodeComponent } from '../getting-started/framework-code/framework-code.component';
import { VERSION } from '../getting-started/landing';

export interface GalleryIcon {
  name: string;
  /** Raw SVG markup from src/stories/icons/svg/<name>.svg */
  svg: string;
}

type PreparedIcon = GalleryIcon & { keywords: string };

const DEFAULTS = { size: 24, strokeWidth: 2, color: '#0f172a', variant: 'outline' as IconVariant };
type Settings = typeof DEFAULTS;

/** Storybook page that lists every icon, like lucide.dev: search, customize, click to copy */
@Component({
  selector: 'np-icon-gallery',
  imports: [
    ButtonComponent,
    ButtonToggleComponent,
    FrameworkCodeComponent,
    IconComponent,
    NgTemplateOutlet,
    SearchInputComponent,
  ],
  templateUrl: './icon-gallery.html',
  styleUrl: './icon-gallery.css',
  // Styles are nested under .icon-gallery and reach into the child components
  encapsulation: ViewEncapsulation.None,
})
export class IconGalleryComponent {
  protected readonly version = VERSION;

  /** All icons to show */
  readonly icons = input<GalleryIcon[]>([]);

  /** Extra search keywords per icon name */
  readonly tags = input<Record<string, string[]>>({});

  protected readonly query = signal('');
  protected readonly settings = signal(DEFAULTS);
  protected readonly selected = signal<PreparedIcon | null>(null);
  /** Which button last copied, for the "Copied!" label */
  protected readonly copied = signal('');

  protected readonly sliders = [
    { key: 'size', label: 'Size', min: 12, max: 64, step: 2 },
    { key: 'strokeWidth', label: 'Stroke', min: 0.5, max: 3, step: 0.25 },
  ] as const;

  protected readonly variants: ToggleOption<IconVariant>[] = ICON_VARIANTS.map((value) => ({
    value,
    label: value[0].toUpperCase() + value.slice(1),
  }));

  private readonly prepared = computed<PreparedIcon[]>(() =>
    this.icons().map((icon) => ({
      ...icon,
      keywords: [icon.name, ...(this.tags()[icon.name] ?? [])].join(' ').toLowerCase(),
    })),
  );

  protected readonly filtered = computed(() => {
    const words = this.query().toLowerCase().split(/\s+/).filter(Boolean);
    return this.prepared().filter((icon) => words.every((word) => icon.keywords.includes(word)));
  });

  private readonly end = viewChild.required<ElementRef<HTMLElement>>('end');
  /** A screenful of icons first, more as the grid is scrolled (all ~2,000 at once took a second) */
  protected readonly shown = renderInBatches(this.filtered, this.end, 200);

  protected readonly isCustomized = computed(() => this.settings() !== DEFAULTS);

  /** Only pass a color to the icons once it's picked, so the soft/solid tiles keep their own colors */
  protected readonly color = computed(() =>
    this.settings().color === DEFAULTS.color ? null : this.settings().color,
  );

  /** Copyable code for the selected icon in every framework, with the current settings applied */
  protected readonly code = computed(() => {
    const icon = this.selected();
    if (!icon) return null;
    const { size, strokeWidth, variant } = this.settings();
    const color = this.color();
    const element: ElementCode = {
      tag: 'icon',
      inputs: {
        name: icon.name,
        size: size !== 20 && size,
        strokeWidth: strokeWidth !== DEFAULTS.strokeWidth && strokeWidth,
        variant: variant !== 'outline' && variant,
      },
      style: color ? { color } : {},
    };
    const snippets = Object.fromEntries(
      FRAMEWORKS.map(({ value }) => [value, elementCode(value, element)]),
    ) as Record<Framework, string>;
    return { snippets, svg: toSvgFile(icon.svg, this.settings(), color) };
  });

  protected update<K extends keyof Settings>(key: K, value: Settings[K]) {
    this.settings.update((settings) => ({ ...settings, [key]: value }));
  }

  protected reset() {
    this.settings.set(DEFAULTS);
  }

  protected select(icon: PreparedIcon) {
    this.selected.update((current) => (current?.name === icon.name ? null : icon));
  }

  protected async copySvg() {
    await copyToClipboard(this.code()!.svg);
    this.copied.set('svg');
    setTimeout(() => this.copied() === 'svg' && this.copied.set(''), 1500);
  }

  protected download() {
    downloadBlob(
      new Blob([this.code()!.svg], { type: 'image/svg+xml' }),
      `${this.selected()!.name}.svg`,
    );
  }
}

/** Standalone .svg file for the chosen settings; theme colors are written out since there is no CSS */
function toSvgFile(source: string, { size, strokeWidth, variant }: Settings, color: string | null) {
  const theme = getComputedStyle(document.documentElement);
  const primary = theme.getPropertyValue('--ui-primary').trim() || '#6366f1';
  const accent = theme.getPropertyValue('--ui-accent').trim() || '#a855f7';
  const gradient =
    '<defs><linearGradient id="g" gradientUnits="userSpaceOnUse" x1="2" y1="2" x2="22" y2="22">' +
    `<stop offset="0" stop-color="${primary}"/><stop offset="1" stop-color="${accent}"/></linearGradient></defs>`;
  const tile = variant === 'soft' || variant === 'solid';

  let svg = source
    .replace(/<!--[\s\S]*?-->\s*/g, '')
    .replace(/ class="[^"]*"/, '')
    .replace(/ width="[^"]*"/, ` width="${tile ? 14 : size}"`)
    .replace(/ height="[^"]*"/, ` height="${tile ? 14 : size}"`)
    .replace(/ stroke-width="[^"]*"/, ` stroke-width="${strokeWidth}"`)
    .trim();
  const ink =
    variant === 'solid' ? '#fff' : (color ?? (variant === 'soft' ? primary : 'currentColor'));

  if (variant === 'duotone') svg = markClosedShapes(svg, 'fill="currentColor" fill-opacity="0.2"');
  if (variant === 'gradient') {
    svg = svg
      .replace(/<svg[^>]*>/, `$&${gradient}`)
      .replace('stroke="currentColor"', 'stroke="url(#g)"');
  }
  svg = svg.replaceAll('currentColor', ink);
  if (!tile) return svg;

  const rect = '<rect width="24" height="24" rx="6.7"';
  const background =
    variant === 'soft'
      ? `${rect} fill="${ink}" fill-opacity="0.14"/>`
      : color
        ? `${rect} fill="${color}"/>`
        : `${gradient}${rect} fill="url(#g)"/>`;
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24">\n` +
    `${background}\n${svg.replace('<svg', '<svg x="5" y="5"')}\n</svg>`
  );
}
