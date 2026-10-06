import { NgTemplateOutlet } from '@angular/common';
import { Component, ViewEncapsulation, booleanAttribute, input } from '@angular/core';

import type { MenuItem } from '../../../utils/types';
import { IconComponent } from '../../media/icon/icon.component';

/** One menu row (icon, label, badge, chevron) or separator, shared by Menu, TieredMenu, Menubar, MegaMenu and PanelMenu */
@Component({
  selector: 'np-menu-item',
  imports: [IconComponent, NgTemplateOutlet],
  templateUrl: './menu-item.html',
  styleUrl: './menu-item.css',
  // The CSS is global: the parent menus tune rows with --mi-* custom properties and reuse .mi-panel/.mi-float/.mi-flyout
  encapsulation: ViewEncapsulation.None,
  host: { class: 'np-menu-item' },
})
export class MenuItemComponent {
  /** Item to render. Renders an <a href> when it has a `url`, a divider when `separator` */
  readonly item = input.required<MenuItem>();

  /** Chevron icon shown when the item has `items`. Empty: no chevron */
  readonly chevron = input('');

  /** Submenu open: highlights the row, rotates the chevron by --mi-turn and sets aria-expanded */
  readonly open = input(false, { transform: booleanAttribute });

  /** Tree row (PanelMenu): no menuitem role and no highlight while open */
  readonly tree = input(false, { transform: booleanAttribute });
}
