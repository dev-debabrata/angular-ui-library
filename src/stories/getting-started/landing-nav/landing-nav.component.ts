import { Component, afterNextRender, input, signal } from '@angular/core';

import { PALETTES, changeTheme } from '../../../../.storybook/nexui-theme';
import { IconComponent } from '../../components/media/icon/icon.component';
import { PAGES, SECTIONS, pageHref } from '../landing';

/** Top bar of the full-screen landing pages: logo, section links, search, light/dark mode, theme color */
@Component({
  selector: 'nex-landing-nav',
  imports: [IconComponent],
  templateUrl: './landing-nav.html',
  styleUrl: './landing-nav.css',
})
export class LandingNavComponent {
  /** The current page: 'home' or a SECTIONS id */
  readonly active = input('');

  protected readonly pages = PAGES;
  protected readonly href = pageHref;
  protected readonly palettes = Object.entries(PALETTES).map(([key, p]) => ({ key, ...p }));
  /** Every section except Onboarding, which has no page of its own */
  protected readonly links = SECTIONS.filter((s) => s.id !== 'onboarding');

  /** The page's mode (main.ts applies the saved one before the app starts) */
  protected readonly dark = signal(false);
  protected readonly menuOpen = signal(false);

  constructor() {
    afterNextRender(() => this.dark.set(document.documentElement.dataset['theme'] === 'dark'));
  }

  protected toggleMode() {
    this.dark.update((dark) => !dark);
    changeTheme({ theme: this.dark() ? 'dark' : 'light' });
  }

  protected pickPalette(key: string) {
    changeTheme({ palette: key });
    this.menuOpen.set(false);
  }
}
