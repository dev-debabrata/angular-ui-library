import { NgTemplateOutlet } from '@angular/common';
import { Component, booleanAttribute, input, output } from '@angular/core';

import { MenuPath, type MenuItemEvent, PopupMenu, runItem } from '../../../utils/menu-utils';
import type { MenuItem } from '../../../utils/types';
import { MenuItemComponent, MenuPopoverDirective } from '../menu-item/menu-item.component';
import type { MenuVariant } from '../menu/menu.component';

export const TIERED_MENU_TRIGGERS = ['hover', 'click'] as const;
export type TieredMenuTrigger = (typeof TIERED_MENU_TRIGGERS)[number];

@Component({
  selector: 'np-tiered-menu',
  imports: [MenuItemComponent, MenuPopoverDirective, NgTemplateOutlet],
  templateUrl: './tiered-menu.html',
  styleUrl: './tiered-menu.css',
})
export class TieredMenuComponent extends PopupMenu {
  /** Menu items. Items with `items` open a flyout submenu (any depth) */
  readonly model = input<MenuItem[]>([]);

  /** Hide the menu until toggle(event) / show(event) is called, then float it below the event target */
  readonly popup = input(false, { transform: booleanAttribute });

  /** Look (MENU_VARIANTS): default, soft, gradient, glass, minimal or contrast */
  readonly variant = input<MenuVariant>('default');

  /** Open submenus on hover (and click), or on click only */
  readonly trigger = input<TieredMenuTrigger>('hover');

  /** Show item badges as keyboard shortcut keys (e.g. badge: '⌘K') */
  readonly shortcuts = input(false, { transform: booleanAttribute });

  /** Emits when an enabled item is clicked */
  readonly itemClick = output<MenuItemEvent>();

  protected readonly path = new MenuPath();

  /** Close the popup menu and any open submenus */
  override hide() {
    super.hide();
    this.path.clear();
  }

  protected select(event: Event, item: MenuItem, depth: number) {
    if (!runItem(event, item, this.itemClick)) return;
    // Click toggles the flyout too, for touch and keyboard users
    if (item.items?.length) this.path.toggle(item, depth);
    else this.hide();
  }

  /** Arrow keys: Up/Down move between rows, Right opens the submenu and focuses its first row once rendered, Left closes it */
  protected key(event: KeyboardEvent, item: MenuItem, depth: number) {
    const row = event.target as HTMLElement;
    const li = row.closest('li')!;
    const step = { ArrowDown: 1, ArrowUp: -1 }[event.key];
    if (step) {
      const list = [
        ...li.parentElement!.querySelectorAll<HTMLElement>(':scope > li > * > .mi:not(:disabled)'),
      ];
      list.at((list.indexOf(row) + step) % list.length)?.focus();
    } else if (event.key === 'ArrowRight' && item.items?.length) {
      this.path.open(item, depth);
      setTimeout(() => li.querySelector<HTMLElement>('ul .mi:not(:disabled)')?.focus());
    } else if (event.key === 'ArrowLeft' && depth) {
      this.path.open(null, depth - 1);
      li.parentElement!.closest('li')!.querySelector<HTMLElement>('.mi')!.focus();
    } else return;
    event.preventDefault();
  }
}
