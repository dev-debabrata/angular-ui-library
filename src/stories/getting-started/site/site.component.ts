import { Component, DestroyRef, effect, inject, input, viewChild } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { addons } from 'storybook/preview-api';

import { CookieConsentComponent } from '../cookie-consent/cookie-consent.component';
import { SITE_GO, SITE_PAGES, SITE_SEARCH, clickedPage } from '../landing';
import { SiteSearchComponent } from '../site-search/site-search.component';

/**
 * The NexPrime site: Welcome, Components, Icons, Animations and NexLottie in one Angular app. Its router switches
 * pages instantly, without Storybook loading a story; each page's story opens the site on that page. The top bar
 * is Storybook's (manager.ts), shared with the docs pages: its links and search button reach the site through
 * SITE_GO and SITE_SEARCH
 */
@Component({
  selector: 'np-site',
  imports: [RouterOutlet, SiteSearchComponent, CookieConsentComponent],
  templateUrl: './site.html',
  styleUrl: './site.css',
  host: { '(click)': 'follow($event)' },
})
export class SiteComponent {
  /** Page to open: a short URL from SITE_PAGES ('' for Welcome) */
  readonly page = input('');

  private readonly router = inject(Router);
  private readonly search = viewChild.required(SiteSearchComponent);

  constructor() {
    effect(() => this.router.navigateByUrl(`/${this.page()}`, { replaceUrl: true }));
    const channel = addons.getChannel();
    const go = (page: string) => this.router.navigateByUrl(`/${page}`);
    const search = () => this.search().open();
    channel.on(SITE_GO, go);
    channel.on(SITE_SEARCH, search);
    inject(DestroyRef).onDestroy(() => {
      channel.off(SITE_GO, go);
      channel.off(SITE_SEARCH, search);
    });
  }

  /** Links to the site's pages (managerHref) open in the router; preview.ts opens the others in Storybook */
  protected follow(event: MouseEvent) {
    const page = clickedPage(event);
    if (page === undefined || !SITE_PAGES.includes(page)) return;
    event.preventDefault();
    this.router.navigateByUrl(`/${page}`);
  }
}
