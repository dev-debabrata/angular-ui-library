import {
  Component,
  ElementRef,
  afterRenderEffect,
  booleanAttribute,
  inject,
  input,
  model,
  output,
  signal,
} from '@angular/core';

import { ButtonComponent } from '../../form/button/button.component';
import { AvatarComponent } from '../../media/avatar/avatar.component';
import { IconComponent } from '../../media/icon/icon.component';
import type { MenuItem, User } from '../../../utils/types';

/** Looks of the header */
export const HEADER_VARIANTS = ['default', 'glass', 'floating', 'minimal', 'gradient'] as const;
export type HeaderVariant = (typeof HEADER_VARIANTS)[number];

@Component({
  selector: 'np-header',
  imports: [ButtonComponent, AvatarComponent, IconComponent],
  templateUrl: './header.html',
  styleUrl: './header.css',
  host: { '[class.header--sticky]': 'sticky()' },
})
export class HeaderComponent {
  /** Logged-in user, or null when logged out */
  readonly user = input<User | null>(null);
  /** Look: default, glass (frosted), floating (rounded bar with a margin), minimal (transparent) or gradient */
  readonly variant = input<HeaderVariant>('default');
  /** Brand name next to the logo */
  readonly brand = input('Acme');
  /** Navigation links in the middle (label, icon, url, command); a menu button shows them on phones */
  readonly links = input<MenuItem[]>([]);
  /** Label of the current link, highlighted. Supports [(active)] two-way binding */
  readonly active = model('');
  /** Stick to the top of the scrolling area, getting slimmer with a shadow once scrolled */
  readonly sticky = input(false, { transform: booleanAttribute });
  /** Show the user's avatar instead of the welcome text */
  readonly avatar = input(false, { transform: booleanAttribute });
  /** Emitted when Log in is clicked */
  readonly login = output<Event>();
  /** Emitted when Log out is clicked */
  readonly logout = output<Event>();
  /** Emitted when Sign up is clicked */
  readonly createAccount = output<Event>();

  protected readonly scrolled = signal(false);
  protected readonly menuOpen = signal(false);

  constructor() {
    const host: HTMLElement = inject(ElementRef).nativeElement;
    afterRenderEffect((onCleanup) => {
      if (!this.sticky()) return; // captured: hears the page and any scrolling ancestor
      const read = (e: Event) => {
        const el = e.target instanceof Element ? e.target : document.documentElement;
        if (el.contains(host)) this.scrolled.set(el.scrollTop > 8);
      };
      document.addEventListener('scroll', read, { capture: true, passive: true });
      onCleanup(() => document.removeEventListener('scroll', read, { capture: true }));
    });
  }

  protected go(link: MenuItem, event: Event) {
    if (!link.url) event.preventDefault();
    this.active.set(link.label ?? '');
    this.menuOpen.set(false);
    link.command?.({ originalEvent: event, item: link });
  }
}
