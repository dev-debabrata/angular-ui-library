import { Component, computed, effect, inject, input } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter, map } from 'rxjs';

import { SECTIONS, SITE_PAGES, clickedPage } from '../landing';
import { LandingNavComponent } from '../landing-nav/landing-nav.component';

/**
 * The NexPrime site: Welcome, Components, Icons, Animations and NexLottie in one Angular app. Its router switches
 * pages instantly, without Storybook loading a story; each page's story opens the site on that page
 */
@Component({
  selector: 'np-site',
  imports: [LandingNavComponent, RouterOutlet],
  templateUrl: './site.html',
  styleUrl: './site.css',
  host: { '(click)': 'follow($event)' },
})
export class SiteComponent {
  /** Page to open: a short URL from SITE_PAGES ('' for Welcome) */
  readonly page = input('');

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

  constructor() {
    effect(() => this.router.navigateByUrl(`/${this.page()}`, { replaceUrl: true }));
  }

  /** Links to the site's pages (managerHref) open in the router; preview.ts opens the others in Storybook */
  protected follow(event: MouseEvent) {
    const page = clickedPage(event);
    if (page === undefined || !SITE_PAGES.includes(page)) return;
    event.preventDefault();
    this.router.navigateByUrl(`/${page}`);
  }
}
