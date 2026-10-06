import { Component, booleanAttribute, input, output } from '@angular/core';

import { type MenuItemEvent, PopupMenu, runItem } from '../../../utils/menu-utils';
import type { MenuItem } from '../../../utils/types';
import { MenuItemComponent, MenuPopoverDirective } from '../menu-item/menu-item.component';

/** Looks of Menu and TieredMenu */
export const MENU_VARIANTS = [
  'default',
  'soft',
  'gradient',
  'glass',
  'minimal',
  'contrast',
] as const;
export type MenuVariant = (typeof MENU_VARIANTS)[number];

@Component({
  selector: 'np-menu',
  imports: [MenuItemComponent, MenuPopoverDirective],
  templateUrl: './menu.html',
  styleUrl: './menu.css',
})
export class MenuComponent extends PopupMenu {
  /** Menu items. Top-level items with `items` render as group headers */
  readonly model = input<MenuItem[]>([]);

  /** Hide the menu until toggle(event) / show(event) is called, then float it below the event target */
  readonly popup = input(false, { transform: booleanAttribute });

  /** Look: default, soft (tinted), gradient (gradient pill rows), glass (frosted), minimal (no card) or contrast (inverted) */
  readonly variant = input<MenuVariant>('default');

  /** Show item badges as keyboard shortcut keys (e.g. badge: '⌘K') */
  readonly shortcuts = input(false, { transform: booleanAttribute });

  /** Emits when an enabled item is clicked */
  readonly itemClick = output<MenuItemEvent>();

  protected select(event: Event, item: MenuItem) {
    if (runItem(event, item, this.itemClick) && this.popup()) this.hide();
  }
}
