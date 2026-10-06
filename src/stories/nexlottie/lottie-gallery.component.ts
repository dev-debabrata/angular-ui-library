import { Component, type ElementRef, computed, input, signal, viewChild } from '@angular/core';

import {
  ButtonToggleComponent,
  type ToggleOption,
} from '../components/form/button-toggle/button-toggle.component';
import { LottieComponent, loadLottie } from '../components/media/lottie/lottie.component';
import { SearchInputComponent } from '../components/form/search-input/search-input.component';
import { categoryOf, isDarkBg, type GalleryAnimation } from './gallery-animation';
import { LottieDetailComponent } from './lottie-detail.component';
import { VERSION } from '../getting-started/landing';
import { renderInBatches } from '../utils/render-in-batches';

export type { GalleryAnimation } from './gallery-animation';

/** Storybook page that plays every Lottie file in src/stories/lottie: search, preview, copy code, download */
@Component({
  selector: 'np-lottie-gallery',
  imports: [ButtonToggleComponent, LottieComponent, LottieDetailComponent, SearchInputComponent],
  templateUrl: './lottie-gallery.html',
  styleUrl: './lottie-gallery.css',
})
export class LottieGalleryComponent {
  protected readonly version = VERSION;

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
  protected readonly isDarkBg = isDarkBg;

  protected readonly all = computed(() => [...this.linked(), ...this.animations()]);

  protected readonly categories = computed<ToggleOption<string>[]>(() =>
    ['All', ...new Set(this.all().map(categoryOf))].map((value) => ({ value, label: value })),
  );

  protected readonly filtered = computed(() => {
    const query = this.query().trim().toLowerCase();
    const category = this.category();
    return this.all().filter(
      (a) => a.name.includes(query) && (category === 'All' || categoryOf(a) === category),
    );
  });

  private readonly end = viewChild.required<ElementRef<HTMLElement>>('end');
  /** A screenful of animations first, more as the grid is scrolled (each one is a Lottie player) */
  protected readonly shown = renderInBatches(this.filtered, this.end, 30);

  /** Up to 6 animations from the selected one's category, topped up from the rest */
  protected readonly related = computed(() => {
    const a = this.selected();
    if (!a) return [];
    const others = this.all().filter((o) => o !== a);
    const cat = categoryOf(a);
    const same = others.filter((o) => categoryOf(o) === cat);
    return [...same, ...others.filter((o) => categoryOf(o) !== cat)].slice(0, 6);
  });

  /** Preview a LottieFiles (or any) .json / .lottie URL. It's loaded once here, then shown from its data */
  protected async addLink(input: HTMLInputElement) {
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
    try {
      const animation: GalleryAnimation = { name, src: url, data: await loadLottie(url) };
      this.linkError.set('');
      this.linked.update((list) => [animation, ...list.filter((a) => a.src !== url)]);
      this.category.set('All');
      this.selected.set(animation);
      input.value = '';
    } catch {
      this.linkError.set(
        "Couldn't load that file. Check the link, and that the site allows downloads.",
      );
    }
  }
}
