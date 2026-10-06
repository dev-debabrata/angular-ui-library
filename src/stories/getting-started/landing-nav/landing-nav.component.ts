import { Component, DestroyRef, afterNextRender, inject, input, signal } from '@angular/core';
import { UPDATE_GLOBALS } from 'storybook/internal/core-events';
import { addons } from 'storybook/preview-api';

import { DEFAULT_GLOBALS, PALETTES } from '../../../../.storybook/np-theme';
import { IconComponent } from '../../components/media/icon/icon.component';
import { PAGES, SECTIONS, managerHref } from '../landing';

/** Top bar of the full-screen landing pages: logo, section links, search, light/dark mode, theme color */
@Component({
  selector: 'np-landing-nav',
  imports: [IconComponent],
  templateUrl: './landing-nav.html',
  styleUrl: './landing-nav.css',
})
export class LandingNavComponent {
  /** The current page: 'home' or a SECTIONS id */
  readonly active = input('');

  protected readonly pages = PAGES;
  protected readonly href = managerHref;
  protected readonly palettes = Object.entries(PALETTES).map(([key, p]) => ({ key, ...p }));
  /** Every section except Onboarding, which has no page of its own */
  protected readonly links = SECTIONS.filter((s) => s.id !== 'onboarding');

  /** Mirrors the page's data-theme, which the toolbar's mode button can also change */
  protected readonly dark = signal(false);
  /** The current theme color, from the page's data-np-theme ("light|teal", set by applyTheme) */
  protected readonly palette = signal(DEFAULT_GLOBALS.palette);
  protected readonly menuOpen = signal(false);

  constructor() {
    afterNextRender(() => {
      const root = document.documentElement;
      const sync = () => {
        this.dark.set(root.dataset['theme'] === 'dark');
        // Before a color is picked the attribute can read "light|undefined": fall back to the default
        const key = root.dataset['npTheme']?.split('|')[1] ?? '';
        this.palette.set(key in PALETTES ? key : DEFAULT_GLOBALS.palette);
      };
      sync();
      const observer = new MutationObserver(sync);
      observer.observe(root, {
        attributes: true,
        attributeFilter: ['data-theme', 'data-np-theme'],
      });
      this.destroyRef.onDestroy(() => observer.disconnect());
    });
  }

  private readonly destroyRef = inject(DestroyRef);

  /** Changes a Storybook global; preview.ts applies it and manager.ts saves it */
  private setGlobal(globals: Record<string, string>) {
    addons.getChannel().emit(UPDATE_GLOBALS, { globals });
  }

  protected toggleMode() {
    this.setGlobal({ theme: this.dark() ? 'light' : 'dark' });
  }

  protected pickPalette(key: string) {
    this.setGlobal({ palette: key });
    this.menuOpen.set(false);
  }
}
