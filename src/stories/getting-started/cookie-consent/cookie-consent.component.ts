import { Component, DestroyRef, afterNextRender, effect, inject, signal } from '@angular/core';
import { addons } from 'storybook/preview-api';

import { PAGES, SITE_COOKIE_OVERLAY, managerHref } from '../landing';

const KEY = 'np-cookie-notice';

/**
 * The site's cookie notice: a bar over a grey overlay until the visitor accepts (remembered in localStorage) or
 * closes it (until the next visit). The top bar is Storybook's, outside this frame, so manager.ts dims it too
 */
@Component({
  selector: 'np-cookie-consent',
  templateUrl: './cookie-consent.html',
  styleUrl: './cookie-consent.css',
})
export class CookieConsentComponent {
  protected readonly privacyHref = managerHref(PAGES.privacy);
  protected readonly visible = signal(false);

  constructor() {
    const channel = addons.getChannel();
    afterNextRender(() => this.visible.set(!localStorage.getItem(KEY)));
    effect(() => channel.emit(SITE_COOKIE_OVERLAY, this.visible()));
    inject(DestroyRef).onDestroy(() => channel.emit(SITE_COOKIE_OVERLAY, false));
  }

  protected accept() {
    localStorage.setItem(KEY, new Date().toISOString());
    this.visible.set(false);
  }
}
