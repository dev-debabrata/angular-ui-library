import { Component, input, output } from '@angular/core';

import { DismissableMenu, MenuPath, type MenuItemEvent, runItem } from '../../menu-utils';
import type { MenuItem } from '../../types';
import { MenuItemComponent } from '../menu-item/menu-item.component';

@Component({
  selector: 'nex-mega-menu',
  imports: [MenuItemComponent],
  templateUrl: './mega-menu.html',
  styleUrl: './mega-menu.css',
})
export class MegaMenuComponent extends DismissableMenu {
  /**
   * Top-level items. Each top item's `items` are the panel COLUMNS; each column's `items` are
   * SECTIONS (`{ label, items }`), and each section's `items` are the links:
   * `{ label: 'Furniture', items: [ { items: [ { label: 'Living Room', items: [ { label: 'Sofas' } ] } ] } ] }`
   */
  readonly model = input<MenuItem[]>([]);

  /** Bar direction: panels open below (horizontal) or to the right (vertical) */
  readonly orientation = input<'horizontal' | 'vertical'>('horizontal');

  /** Emits when an enabled item is clicked */
  readonly itemClick = output<MenuItemEvent>();

  /** path.items()[0] is the top-level item whose panel is open */
  protected readonly path = new MenuPath();

  /** Once a panel is open, hovering another top-level item switches to it */
  protected hover(item: MenuItem) {
    if (this.path.items().length) this.path.open(item, 0);
  }

  protected select(event: Event, item: MenuItem, top = false) {
    if (!runItem(event, item, this.itemClick)) return;
    if (top && item.items?.length) this.path.toggle(item, 0);
    else this.hide();
  }

  protected hide() {
    this.path.clear();
  }
}
