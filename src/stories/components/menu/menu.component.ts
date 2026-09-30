import { Component, booleanAttribute, input, output } from '@angular/core';

import { type MenuItemEvent, PopupMenu, runItem } from '../../menu-utils';
import type { MenuItem } from '../../types';
import { MenuItemComponent } from '../menu-item/menu-item.component';

@Component({
  selector: 'nex-menu',
  imports: [MenuItemComponent],
  templateUrl: './menu.html',
  styleUrl: './menu.css',
})
export class MenuComponent extends PopupMenu {
  /** Menu items. Top-level items with `items` render as group headers */
  readonly model = input<MenuItem[]>([]);

  /** Hide the menu until toggle(event) / show(event) is called, then float it below the event target */
  readonly popup = input(false, { transform: booleanAttribute });

  /** Emits when an enabled item is clicked */
  readonly itemClick = output<MenuItemEvent>();

  protected select(event: Event, item: MenuItem) {
    if (runItem(event, item, this.itemClick) && this.popup()) this.hide();
  }
}
