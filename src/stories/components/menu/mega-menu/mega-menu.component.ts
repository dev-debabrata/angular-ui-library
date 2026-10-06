import { Component, booleanAttribute, input, output } from '@angular/core';

import { DismissableMenu, MenuPath, type MenuItemEvent, runItem } from '../../../utils/menu-utils';
import type { MenuItem } from '../../../utils/types';
import { IconComponent } from '../../media/icon/icon.component';
import { MenuItemComponent } from '../menu-item/menu-item.component';

/** Promo card after a panel's columns: image (URL, on top) or icon, title, text, cta (link text with an arrow) */
export interface MegaMenuFeature {
  title: string;
  text?: string;
  image?: string;
  icon?: string;
  cta?: string;
  url?: string;
}

/** A MenuItem whose panel can end with a `featured` promo card */
export type MegaMenuItem = MenuItem & { featured?: MegaMenuFeature };

/** Looks of the mega menu */
export const MEGA_MENU_VARIANTS = ['default', 'glass', 'cards', 'minimal'] as const;
export type MegaMenuVariant = (typeof MEGA_MENU_VARIANTS)[number];

@Component({
  selector: 'np-mega-menu',
  imports: [IconComponent, MenuItemComponent],
  templateUrl: './mega-menu.html',
  styleUrl: './mega-menu.css',
})
export class MegaMenuComponent extends DismissableMenu {
  /**
   * Top-level items. Each top item's `items` are the panel COLUMNS; each column's `items` are
   * SECTIONS (`{ label, items }`), and each section's `items` are the links:
   * `{ label: 'Furniture', items: [ { items: [ { label: 'Living Room', items: [ { label: 'Sofas' } ] } ] } ] }`.
   * A section's `icon` is shown in its heading; a top item's `featured` adds a promo card to its panel
   */
  readonly model = input<MegaMenuItem[]>([]);
  /** Bar direction: panels open below (horizontal) or to the right (vertical) */
  readonly orientation = input<'horizontal' | 'vertical'>('horizontal');
  /** Look: default, glass (frosted bar and panels), cards (each column a card) or minimal (no bar chrome) */
  readonly variant = input<MegaMenuVariant>('default');
  /** Horizontal only: panels span the whole bar width and their columns share it */
  readonly stretch = input(false, { transform: booleanAttribute });
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
