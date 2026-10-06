import { NgTemplateOutlet } from '@angular/common';
import { Component, booleanAttribute, input, output } from '@angular/core';

import { MenuPath, type MenuItemEvent, PopupMenu, runItem } from '../../../utils/menu-utils';
import type { MenuItem } from '../../../utils/types';
import { MenuItemComponent } from '../menu-item/menu-item.component';

@Component({
  selector: 'np-tiered-menu',
  imports: [MenuItemComponent, NgTemplateOutlet],
  templateUrl: './tiered-menu.html',
  styleUrl: './tiered-menu.css',
})
export class TieredMenuComponent extends PopupMenu {
  /** Menu items. Items with `items` open a flyout submenu (any depth) */
  readonly model = input<MenuItem[]>([]);

  /** Hide the menu until toggle(event) / show(event) is called, then float it below the event target */
  readonly popup = input(false, { transform: booleanAttribute });

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
}
