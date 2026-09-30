import { NgTemplateOutlet } from '@angular/common';
import { Component, input, output, signal } from '@angular/core';

import { DismissableMenu, MenuPath, type MenuItemEvent, runItem } from '../../menu-utils';
import type { MenuItem } from '../../types';
import { IconComponent } from '../icon/icon.component';
import { MenuItemComponent } from '../menu-item/menu-item.component';

@Component({
  selector: 'nex-menubar',
  imports: [IconComponent, MenuItemComponent, NgTemplateOutlet],
  templateUrl: './menubar.html',
  styleUrl: './menubar.css',
})
export class MenubarComponent extends DismissableMenu {
  /** Top-level items. Items with `items` open a dropdown; deeper children open flyouts to the right */
  readonly model = input<MenuItem[]>([]);

  /** Emits when an enabled item is clicked */
  readonly itemClick = output<MenuItemEvent>();

  protected readonly path = new MenuPath();
  /** A dropdown was opened by click, so hovering other top-level items switches dropdowns */
  private active = false;
  /** Hamburger menu open (narrow widths only) */
  protected readonly mobileOpen = signal(false);

  /** Hovering switches submenus, but top-level dropdowns only once one was opened by click */
  protected hover(item: MenuItem, depth: number) {
    if (depth || this.active) this.path.open(item, depth);
  }

  protected select(event: Event, item: MenuItem, depth: number) {
    if (!runItem(event, item, this.itemClick)) return;
    if (!item.items?.length) return this.hide();
    this.path.toggle(item, depth);
    if (!depth) this.active = this.path.isOpen(item, 0);
  }

  protected hide() {
    this.path.clear();
    this.active = false;
    this.mobileOpen.set(false);
  }
}
