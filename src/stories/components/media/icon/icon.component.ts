import {
  Component,
  DOCUMENT,
  PLATFORM_ID,
  ViewEncapsulation,
  effect,
  inject,
  input,
  numberAttribute,
  signal,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { DomSanitizer, type SafeHtml } from '@angular/platform-browser';

export const ICON_VARIANTS = ['outline', 'duotone', 'gradient', 'soft', 'solid'] as const;
export type IconVariant = (typeof ICON_VARIANTS)[number];

/** Shared <linearGradient> for the gradient variant, added to the page once */
const GRADIENT_ID = 'np-icon-gradient';

/**
 * Adds `attrs` to every closed shape (circle, rect, ellipse, polygon, path ending in "z") that has no fill of its
 * own. The duotone variant fills these shapes with a tint.
 */
export function markClosedShapes(svg: string, attrs = 'class="np-closed"') {
  return svg.replace(
    /<(?:circle|rect|ellipse|polygon|path(?=[^>]*\bd="[^"]*[zZ]\s*"))\b(?![^>]*\bfill=)/g,
    `$& ${attrs}`,
  );
}

/**
 * Folder the icon files are loaded from (src/stories/icons/svg is served at icons/). Apps using the Web Components
 * can point it elsewhere, e.g. a CDN, with window.NEXPRIME_ICONS_URL = 'https://cdn.example.com/nexprime/icons/'
 */
const iconsUrl = () => (globalThis as { NEXPRIME_ICONS_URL?: string }).NEXPRIME_ICONS_URL ?? 'icons/';

/** Each SVG is downloaded once from /icons (served from src/stories/icons/svg) and shared by every <np-icon> */
const cache = new Map<string, Promise<string>>();

function loadSvg(name: string): Promise<string> {
  let svg = cache.get(name);
  if (!svg) {
    svg = fetch(`${iconsUrl()}${name}.svg`).then((res) =>
      res.ok
        ? res.text().then(markClosedShapes)
        : Promise.reject(
            new Error(`Icon "${name}" not found. Add ${name}.svg to src/stories/icons/svg/`),
          ),
    );
    svg.catch(() => cache.delete(name));
    cache.set(name, svg);
  }
  return svg;
}

function addGradient(doc: Document) {
  if (doc.getElementById(GRADIENT_ID)) return;
  doc.body.insertAdjacentHTML(
    'beforeend',
    `<svg aria-hidden="true" width="0" height="0" style="position: absolute">
      <linearGradient id="${GRADIENT_ID}" gradientUnits="userSpaceOnUse" x1="2" y1="2" x2="22" y2="22">
        <stop offset="0" style="stop-color: var(--ui-primary)" />
        <stop offset="1" style="stop-color: var(--ui-accent)" />
      </linearGradient>
    </svg>`,
  );
}

@Component({
  selector: 'np-icon',
  templateUrl: './icon.html',
  styleUrl: './icon.css',
  // Styles must reach the <svg> inserted with innerHTML, which view encapsulation can't target
  encapsulation: ViewEncapsulation.None,
  host: {
    class: 'np-icon',
    '[class]': "'np-icon--' + variant()",
    '[style.width.px]': 'size()',
    '[style.height.px]': 'size()',
    '[style.--icon-stroke]': 'strokeWidth()',
    '[attr.role]': "label() ? 'img' : null",
    '[attr.aria-label]': 'label() || null',
    '[attr.aria-hidden]': '!label() || null',
  },
})
export class IconComponent {
  /** File name in src/stories/icons/svg, without .svg */
  readonly name = input.required<string>();

  /** Width and height in pixels */
  readonly size = input(20, { transform: numberAttribute });

  /** Line thickness for outline icons. Leave empty to keep the value from the SVG file */
  readonly strokeWidth = input<number>();

  /** Style: outline (as drawn), duotone (tinted fill), gradient stroke, soft tinted tile or solid gradient tile */
  readonly variant = input<IconVariant>('outline');

  /** Raw SVG markup to show instead of downloading `name` (used by the Icons page) */
  readonly svg = input<string>();

  /** Accessible name. Leave empty for decorative icons next to text */
  readonly label = input('');

  private readonly sanitizer = inject(DomSanitizer);
  private readonly document = inject(DOCUMENT);
  protected readonly html = signal<SafeHtml | null>(null);

  private readonly browser = isPlatformBrowser(inject(PLATFORM_ID));

  constructor() {
    effect(() => this.variant() === 'gradient' && addGradient(this.document));

    effect((onCleanup) => {
      const raw = this.svg();
      // Icon files are downloaded in the browser (after hydration on server-rendered pages)
      if (!raw && !this.browser) return;
      let active = true;
      onCleanup(() => (active = false));
      const markup = raw ? Promise.resolve(markClosedShapes(raw)) : loadSvg(this.name());
      markup.then(
        (svg) => active && this.html.set(this.sanitizer.bypassSecurityTrustHtml(svg)),
        (error: Error) => {
          console.warn(error.message);
          if (active) this.html.set(null);
        },
      );
    });
  }
}
