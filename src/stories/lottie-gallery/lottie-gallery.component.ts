import { Component, computed, input, signal } from '@angular/core';

import { copyToClipboard } from '../clipboard';
import {
  ButtonToggleComponent,
  type ToggleOption,
} from '../components/button-toggle/button-toggle.component';
import { LottieComponent } from '../components/lottie/lottie.component';
import { SearchInputComponent } from '../components/search-input/search-input.component';

export interface GalleryAnimation {
  /** File name in src/stories/lottie, without .json */
  name: string;
  /** Parsed Lottie JSON (meta.cat and meta.bg are optional: category and card background) */
  data?: { meta?: { bg?: string; cat?: string } };
  /** Remote file (pasted link) instead of data */
  src?: string;
}

/** Storybook page that plays every Lottie file in src/stories/lottie: search, preview, copy code, download */
@Component({
  selector: 'nex-lottie-gallery',
  imports: [ButtonToggleComponent, LottieComponent, SearchInputComponent],
  templateUrl: './lottie-gallery.html',
  styleUrl: './lottie-gallery.css',
})
export class LottieGalleryComponent {
  /** All animations to show */
  readonly animations = input<GalleryAnimation[]>([]);

  protected readonly query = signal('');
  protected readonly category = signal('All');
  /** Animations added from pasted links */
  protected readonly linked = signal<GalleryAnimation[]>([]);
  protected readonly linkError = signal('');
  protected readonly speed = signal(1);
  protected readonly hoverOnly = signal(false);
  protected readonly selected = signal<GalleryAnimation | null>(null);
  protected readonly copied = signal(false);

  protected readonly all = computed(() => [...this.linked(), ...this.animations()]);

  protected readonly categories = computed<ToggleOption<string>[]>(() =>
    ['All', ...new Set(this.all().map((a) => this.categoryOf(a)))].map((value) => ({
      value,
      label: value,
    })),
  );

  protected readonly filtered = computed(() => {
    const query = this.query().trim().toLowerCase();
    const category = this.category();
    return this.all().filter(
      (a) => a.name.includes(query) && (category === 'All' || this.categoryOf(a) === category),
    );
  });

  protected categoryOf(a: GalleryAnimation) {
    return a.src ? 'From link' : (a.data?.meta?.cat ?? 'Other');
  }

  /** Preview a LottieFiles (or any) .json / .lottie URL */
  protected addLink(input: HTMLInputElement) {
    const url = input.value.trim();
    if (!/^https?:\/\/.+\.(json|lottie)(\?.*)?$/i.test(url)) {
      return this.linkError.set('Paste a link that ends in .json or .lottie');
    }
    const name = decodeURIComponent(
      url
        .split('?')[0]
        .split('/')
        .pop()!
        .replace(/\.(json|lottie)$/i, ''),
    );
    const animation = { name, src: url };
    this.linkError.set('');
    this.linked.update((list) => [animation, ...list.filter((a) => a.src !== url)]);
    this.category.set('All');
    this.selected.set(animation);
    input.value = '';
  }

  protected readonly code = computed(() => {
    const a = this.selected();
    if (!a) return '';
    const extras = [this.speed() !== 1 && `speed="${this.speed()}"`, this.hoverOnly() && 'hover']
      .filter(Boolean)
      .join(' ');
    return `<nex-lottie src="${a.src ?? `lottie/${a.name}.json`}"${extras ? ' ' + extras : ''} />`;
  });

  protected async copy() {
    await copyToClipboard(this.code());
    this.copied.set(true);
    setTimeout(() => this.copied.set(false), 1500);
  }

  protected download(animation: GalleryAnimation) {
    const url =
      animation.src ??
      URL.createObjectURL(new Blob([JSON.stringify(animation.data)], { type: 'application/json' }));
    Object.assign(document.createElement('a'), {
      href: url,
      download: `${animation.name}.json`,
    }).click();
    if (!animation.src) URL.revokeObjectURL(url);
  }
}
