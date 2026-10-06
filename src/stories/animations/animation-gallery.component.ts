import {
  Component,
  ElementRef,
  computed,
  inject,
  input,
  signal,
  linkedSignal,
} from '@angular/core';

import { copyToClipboard } from '../utils/clipboard';
import {
  ButtonToggleComponent,
  type ToggleOption,
} from '../components/form/button-toggle/button-toggle.component';
import { IconComponent } from '../components/media/icon/icon.component';
import { SearchInputComponent } from '../components/form/search-input/search-input.component';
import { FrameworkCodeComponent } from '../getting-started/framework-code/framework-code.component';
import { VERSION } from '../getting-started/landing';
import { FRAMEWORKS, markupCode, type Framework } from '../utils/framework-code';

export interface NexAnimation {
  /** Class suffix: np-anim-<name> */
  name: string;
  /** Section of animations.css it's in */
  category: string;
  /** Standalone CSS: shared base rule, the class rule(s) and their keyframes */
  css: string;
}

/** Index just past the `}` matching the `{` at `open` */
function blockEnd(css: string, open: number) {
  for (let i = open, depth = 0; i < css.length; i++) {
    if (css[i] === '{') depth++;
    else if (css[i] === '}' && --depth === 0) return i + 1;
  }
  return css.length;
}

/** Reads animations.css: categories come from its "=== Name ===" comments, animations from .np-anim-* rules */
export function parseAnimations(css: string): NexAnimation[] {
  const base = css.slice(0, blockEnd(css, css.indexOf('{', css.indexOf("[class*='np-anim-']"))));
  const found = new Map<string, NexAnimation & { rules: string[] }>();
  let category = '';
  for (const match of css.matchAll(/\/\* === (\w+) === \*\/|^\.np-anim-([\w-]+)[^{]*\{/gm)) {
    if (match[1]) {
      category = match[1];
      continue;
    }
    const rule = css.slice(match.index, blockEnd(css, match.index + match[0].length - 1));
    const entry = found.get(match[2]) ?? { name: match[2], category, css: '', rules: [] };
    entry.rules.push(rule);
    found.set(match[2], entry);
  }
  return [...found.values()].map(({ rules, ...entry }) => {
    const keyframes = [...rules.join('\n').matchAll(/animation(?:-name)?:\s*(np-[\w-]+)/g)].map(
      ([, name]) => {
        const start = css.indexOf(`@keyframes ${name} {`);
        return css.slice(start, blockEnd(css, css.indexOf('{', start)));
      },
    );
    return { ...entry, css: [base, ...rules, ...keyframes].join('\n\n') };
  });
}

/** Storybook page that lists every np-anim-* class: filter, preview, click to replay and copy */
@Component({
  selector: 'np-animation-gallery',
  imports: [ButtonToggleComponent, FrameworkCodeComponent, IconComponent, SearchInputComponent],
  templateUrl: './animation-gallery.html',
  styleUrl: './animation-gallery.css',
})
export class AnimationGalleryComponent {
  protected readonly version = VERSION;

  /** All animations to show (from parseAnimations) */
  readonly animations = input<NexAnimation[]>([]);

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  /** Search text to start with (the site search opens the page with ?q=…) */
  readonly q = input<string | undefined>('');
  protected readonly query = linkedSignal(() => this.q() ?? '');
  protected readonly category = signal('All');
  /** Seconds; null keeps each animation's own duration */
  protected readonly duration = signal<number | null>(null);
  protected readonly loop = signal(false);
  protected readonly selected = signal<NexAnimation | null>(null);
  protected readonly copied = signal('');
  protected readonly categories = computed<ToggleOption<string>[]>(() =>
    ['All', ...new Set(this.animations().map((a) => a.category))].map((value) => ({
      value,
      label: value,
    })),
  );

  protected readonly filtered = computed(() => {
    const query = this.query().trim().toLowerCase();
    return this.animations().filter(
      (a) =>
        (this.category() === 'All' || a.category === this.category()) && a.name.includes(query),
    );
  });

  /** CSS variables the toolbar changed, as an inline style */
  protected readonly vars = computed(() => {
    const vars: Record<string, string> = {};
    if (this.duration() !== null) vars['--np-anim-duration'] = `${this.duration()}s`;
    if (this.loop()) vars['--np-anim-repeat'] = 'infinite';
    return vars;
  });

  /** Markup for each framework, plus the standalone CSS of the selected animation */
  protected readonly code = computed(() => {
    const a = this.selected();
    if (!a) return null;
    const markup = Object.fromEntries(
      FRAMEWORKS.map(({ value }) => [value, markupCode(value, `np-anim-${a.name}`, this.vars())]),
    ) as Record<Framework, string>;
    return { markup, css: a.css };
  });

  /** Restarts the element's animations, including ones on ::after */
  protected replay(element: HTMLElement) {
    element.getAnimations?.({ subtree: true }).forEach((animation) => {
      animation.cancel();
      animation.play();
    });
  }

  protected replayAll() {
    this.host.nativeElement
      .querySelectorAll<HTMLElement>('.tile')
      .forEach((tile) => this.replay(tile));
  }

  protected select(animation: NexAnimation, tile: HTMLElement) {
    this.selected.set(animation);
    this.replay(tile);
  }

  protected async copyCss() {
    await copyToClipboard(this.code()!.css);
    this.copied.set('css');
    setTimeout(() => this.copied() === 'css' && this.copied.set(''), 1500);
  }
}
