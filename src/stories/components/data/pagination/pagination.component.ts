import {
  Component,
  booleanAttribute,
  computed,
  input,
  model,
  numberAttribute,
} from '@angular/core';

import type { Size } from '../../../utils/types';
import { SelectComponent } from '../../form/select/select.component';
import { IconComponent } from '../../media/icon/icon.component';

/** Looks of the pagination */
export const PAGINATION_VARIANTS = [
  'default',
  'outlined',
  'soft',
  'glass',
  'minimal',
  'dots',
  'compact',
  'segmented',
  'input',
  'load-more',
] as const;
export type PaginationVariant = (typeof PAGINATION_VARIANTS)[number];

@Component({
  selector: 'np-pagination',
  imports: [IconComponent, SelectComponent],
  templateUrl: './pagination.html',
  styleUrl: './pagination.css',
})
export class PaginationComponent {
  /** Current page, starting at 1. Supports [(page)] two-way binding */
  readonly page = model(1);
  /** Total number of pages (ignored when totalRecords is set) */
  readonly totalPages = input(1, { transform: numberAttribute });
  /** Page numbers shown on each side of the current page */
  readonly siblings = input(1, { transform: numberAttribute });
  /**
   * Look: default (pill track), outlined, soft, glass (frosted), minimal ("Page 3 of 12"), dots, compact (a data
   * table footer: "Items per page" select, "1 – 10 of 240" and arrows), segmented (joined buttons), input ("Page [3]
   * of 12", type a page) or load-more ("Showing 20 of 240" and a "Load more" button: show page × rows items)
   */
  readonly variant = input<PaginationVariant>('default');
  /** Button size */
  readonly size = input<Size>('medium');
  /** Total number of items; when set, the page count comes from it and rows */
  readonly totalRecords = input(0, { transform: numberAttribute });
  /** Items per page, used with totalRecords. Supports [(rows)] two-way binding */
  readonly rows = model(10);
  /** Rows-per-page choices; shows a select when not empty (use with totalRecords) */
  readonly rowsOptions = input<number[]>([]);
  /** Show "1–10 of 240" before the pages (needs totalRecords) */
  readonly showSummary = input(false, { transform: booleanAttribute });
  /** Show first and last page buttons */
  readonly showFirstLast = input(false, { transform: booleanAttribute });
  /** Show a "Go to" page number box */
  readonly showJump = input(false, { transform: booleanAttribute });
  /** Number of pages */
  protected readonly count = computed(
    () => Math.ceil(this.totalRecords() / this.rows()) || this.totalPages(),
  );

  /** The items of this page: from–to of total, and how many the next page adds (load-more) */
  protected readonly range = computed(() => {
    const [total, rows, page] = [this.totalRecords(), this.rows(), this.page()];
    const to = Math.min(page * rows, total);
    return { from: (page - 1) * rows + 1, to, total, next: Math.min(rows, total - to) };
  });

  /** The rows-per-page choices, for the select ("10 / page"; just "10" after compact's "Items per page:") */
  protected readonly rowsChoices = computed(() =>
    this.rowsOptions().map((n) => ({
      value: String(n),
      label: this.variant() === 'compact' ? String(n) : `${n} / page`,
    })),
  );

  /** Page numbers to show, with null where pages are skipped */
  protected readonly pages = computed(() => {
    const total = this.count();
    const current = this.page();
    const start = Math.max(2, current - this.siblings());
    const end = Math.min(total - 1, current + this.siblings());
    const result: (number | null)[] = [1];
    if (start > 2) {
      result.push(null);
    }
    for (let i = start; i <= end; i++) {
      result.push(i);
    }
    if (end < total - 1) {
      result.push(null);
    }
    if (total > 1) {
      result.push(total);
    }
    return result;
  });

  /** Arrow keys change the page, except in the page number box (where they move the caret) */
  protected arrow(event: Event, step: number) {
    if (!(event.target instanceof HTMLInputElement)) this.goTo(this.page() + step);
  }

  protected goTo(page: number) {
    this.page.set(Math.min(this.count(), Math.max(1, page)));
  }
}
