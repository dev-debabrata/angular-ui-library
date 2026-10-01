import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter, map } from 'rxjs';

import { carryTheme } from '../../.storybook/nexui-theme';
import { ScrollTopComponent } from '../stories/components/misc/scroll-top/scroll-top.component';
import { SECTIONS, SITE_PAGES, STORYBOOK_URL } from '../stories/getting-started/landing';
import { LandingNavComponent } from '../stories/getting-started/landing-nav/landing-nav.component';

/** The NexUI site: top bar plus Welcome, Components, Icons, Animations and NexLottie (app.routes.ts) */
@Component({
  selector: 'nex-root',
  imports: [LandingNavComponent, RouterOutlet, ScrollTopComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
  host: { '(mousedown)': 'link($event)', '(click)': 'follow($event)' },
})
export class App {
  private readonly router = inject(Router);
  private readonly url = toSignal(
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map((event) => event.urlAfterRedirects.slice(1)),
    ),
    { initialValue: '' },
  );
  /** The nav link of the current page */
  protected readonly active = computed(() =>
    this.url() ? (SECTIONS.find((section) => section.path === this.url())?.id ?? '') : 'home',
  );

  /** The pressed link. Links to Storybook take the light/dark mode and theme color along (on press, so new-tab
   *  clicks get it too) */
  protected link(event: MouseEvent) {
    const link = (event.target as Element).closest?.<HTMLAnchorElement>('a[href]');
    if (link?.href.startsWith(STORYBOOK_URL)) carryTheme(link);
    return link;
  }

  /** Plain clicks on links to the site's pages (pageHref) open in the router; the others open Storybook */
  protected follow(event: MouseEvent) {
    const link = this.link(event);
    if (!link || event.defaultPrevented || event.button) return;
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    const url = new URL(link.href);
    const page = url.pathname.slice(1);
    if (url.origin !== location.origin || !SITE_PAGES.includes(page)) return;
    event.preventDefault();
    this.router.navigateByUrl(`/${page}`);
  }
}
