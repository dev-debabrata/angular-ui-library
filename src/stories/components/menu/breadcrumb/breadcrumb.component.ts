import {
  Component,
  booleanAttribute,
  computed,
  input,
  numberAttribute,
  output,
  signal,
} from '@angular/core';

import { IconComponent } from '../../media/icon/icon.component';

export interface BreadcrumbItem {
  label: string;
  url?: string;
  /** Icon file name from src/stories/icons/svg, shown before the label */
  icon?: string;
}

/** Looks of the breadcrumb */
export const BREADCRUMB_VARIANTS = ['default', 'pills', 'steps', 'glass', 'minimal'] as const;
export type BreadcrumbVariant = (typeof BREADCRUMB_VARIANTS)[number];

@Component({
  selector: 'np-breadcrumb',
  imports: [IconComponent],
  templateUrl: './breadcrumb.html',
  styleUrl: './breadcrumb.css',
})
export class BreadcrumbComponent {
  /** Path items. The last one is the current page */
  readonly items = input<BreadcrumbItem[]>([]);
  /** Text shown between items, or an icon: 'chevron', 'arrow', 'slash' or 'dot' */
  readonly separator = input('/');
  /** Look: default (soft bar), pills (each crumb a pill), steps (arrow segments), glass (frosted bar) or minimal (plain text) */
  readonly variant = input<BreadcrumbVariant>('default');
  /** Show the first item as a house icon (its label stays for screen readers) */
  readonly home = input(false, { transform: booleanAttribute });
  /** Collapse longer trails to the first item, an ellipsis button and the last items (0: show all) */
  readonly maxItems = input(0, { transform: numberAttribute });
  /** Emits the item that was clicked */
  readonly itemClick = output<BreadcrumbItem>();

  protected readonly expanded = signal(false);

  /** Items to render; null marks the collapsed middle */
  protected readonly shown = computed(() => {
    const items = this.items(),
      max = Math.max(this.maxItems(), 2);
    if (!this.maxItems() || this.expanded() || items.length <= max) return items;
    return [items[0], null, ...items.slice(1 - max)];
  });

  protected onClick(event: Event, item: BreadcrumbItem) {
    if (!item.url) {
      event.preventDefault();
    }
    this.itemClick.emit(item);
  }
}
