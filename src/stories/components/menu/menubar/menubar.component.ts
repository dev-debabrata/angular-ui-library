import { NgTemplateOutlet } from '@angular/common';
import { Component, booleanAttribute, input, model, output, signal } from '@angular/core';

import { DismissableMenu, MenuPath, type MenuItemEvent, runItem } from '../../../utils/menu-utils';
import type { MenuItem } from '../../../utils/types';
import { IconComponent } from '../../media/icon/icon.component';
import { MenuItemComponent } from '../menu-item/menu-item.component';

/** Looks of the menubar */
export const MENUBAR_VARIANTS = ['default', 'glass', 'floating', 'underline', 'gradient'] as const;
export type MenubarVariant = (typeof MENUBAR_VARIANTS)[number];

@Component({
  selector: 'np-menubar',
  host: {
    '[class.np-menubar--sticky]': 'sticky()',
    '[class.np-menubar--open]': 'path.items().length > 0',
  },
  imports: [IconComponent, MenuItemComponent, NgTemplateOutlet],
  templateUrl: './menubar.html',
  styleUrl: './menubar.css',
})
export class MenubarComponent extends DismissableMenu {
  /** Top-level items. Items with `items` open a dropdown; deeper children open flyouts to the right */
  readonly model = input<MenuItem[]>([]);
  /** Look: default (card), glass (frosted), floating (compact pill), underline (line under the current item) or gradient */
  readonly variant = input<MenubarVariant>('default');
  /** Stick to the top of the scrolling page or container */
  readonly sticky = input(false, { transform: booleanAttribute });
  /** Highlighted top-level item; set when an item (or one of its children) is clicked. Supports [(current)] */
  readonly current = model<MenuItem | null>(null);
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
    if (!item.items?.length) {
      this.current.set(depth ? this.path.items()[0] : item);
      return this.hide();
    }
    this.path.toggle(item, depth);
    if (!depth) this.active = this.path.isOpen(item, 0);
  }

  protected hide() {
    this.path.clear();
    this.active = false;
    this.mobileOpen.set(false);
  }
}
