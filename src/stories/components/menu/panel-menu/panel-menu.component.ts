import { NgTemplateOutlet } from '@angular/common';
import {
  Component,
  booleanAttribute,
  input,
  model,
  output,
  signal,
  type WritableSignal,
} from '@angular/core';

import { type MenuItemEvent, runItem } from '../../../utils/menu-utils';
import type { MenuItem } from '../../../utils/types';
import { MenuItemComponent } from '../menu-item/menu-item.component';

/** Looks of the panel menu */
export const PANEL_MENU_VARIANTS = ['default', 'joined', 'minimal', 'soft', 'gradient'] as const;
export type PanelMenuVariant = (typeof PANEL_MENU_VARIANTS)[number];

@Component({
  selector: 'np-panel-menu',
  imports: [MenuItemComponent, NgTemplateOutlet],
  templateUrl: './panel-menu.html',
  styleUrl: './panel-menu.css',
})
export class PanelMenuComponent {
  /** Top-level items are panels; their nested `items` form an expandable tree */
  readonly model = input<MenuItem[]>([]);

  /** Allow more than one panel open at a time? */
  readonly multiple = input(false, { transform: booleanAttribute });

  /** Look: default (cards), joined (one card), minimal (sidebar, no cards), soft (tinted) or gradient (open panel) */
  readonly variant = input<PanelMenuVariant>('default');

  /** Icon-only rail: labels become tooltips; clicking a panel with items expands the menu. Supports [(collapsed)] */
  readonly collapsed = model(false);

  /** Highlighted item, set when an item without `items` is clicked; unset: no highlight. Supports [(selected)] */
  readonly selected = model<MenuItem | null>();

  /** Emits when an enabled item or panel header is clicked */
  readonly itemClick = output<MenuItemEvent>();

  protected readonly openPanels = signal<MenuItem[]>([]);
  protected readonly expandedItems = signal<MenuItem[]>([]);

  /** Runs the item and toggles it in `open` (only it stays open when `single`), or selects it when it has no items */
  protected toggle(event: Event, item: MenuItem, open: WritableSignal<MenuItem[]>, single = false) {
    if (!runItem(event, item, this.itemClick)) return;
    const leaf = !item.items?.length;
    if (leaf && this.selected() !== undefined) this.selected.set(item);
    if (leaf) return;
    this.collapsed.set(false);
    open.update((list) =>
      list.includes(item) ? list.filter((i) => i !== item) : single ? [item] : [...list, item],
    );
  }
}
