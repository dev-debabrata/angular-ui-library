import { Component, input, output } from '@angular/core';

export interface BreadcrumbItem {
  label: string;
  url?: string;
}

@Component({
  selector: 'np-breadcrumb',
  templateUrl: './breadcrumb.html',
  styleUrl: './breadcrumb.css',
})
export class BreadcrumbComponent {
  /** Path items. The last one is the current page */
  readonly items = input<BreadcrumbItem[]>([]);

  /** Character shown between items */
  readonly separator = input('/');

  /** Emits the item that was clicked */
  readonly itemClick = output<BreadcrumbItem>();

  protected onClick(event: Event, item: BreadcrumbItem) {
    if (!item.url) {
      event.preventDefault();
    }
    this.itemClick.emit(item);
  }
}
