import {
  Component,
  booleanAttribute,
  computed,
  input,
  model,
  numberAttribute,
} from '@angular/core';

import type { Size } from '../../../utils/types';
import { IconComponent } from '../../media/icon/icon.component';

/** Looks of the pagination */
export const PAGINATION_VARIANTS = [
  'default',
  'outlined',
  'soft',
  'glass',
  'minimal',
  'dots',
] as const;
export type PaginationVariant = (typeof PAGINATION_VARIANTS)[number];

@Component({
  selector: 'np-pagination',
  imports: [IconComponent],
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
  /** Look: default (pill track), outlined, soft, glass (frosted), minimal ("Page 3 of 12") or dots */
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

  protected goTo(page: number) {
    this.page.set(Math.min(this.count(), Math.max(1, page)));
  }
}
