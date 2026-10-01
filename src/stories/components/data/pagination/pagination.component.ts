import { Component, computed, input, model, numberAttribute } from '@angular/core';

@Component({
  selector: 'nex-pagination',
  templateUrl: './pagination.html',
  styleUrl: './pagination.css',
})
export class PaginationComponent {
  /** Current page, starting at 1. Supports [(page)] two-way binding */
  readonly page = model(1);

  /** Total number of pages */
  readonly totalPages = input(1, { transform: numberAttribute });

  /** Page numbers shown on each side of the current page */
  readonly siblings = input(1, { transform: numberAttribute });

  /** Page numbers to show, with null where pages are skipped */
  protected readonly pages = computed(() => {
    const total = this.totalPages();
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
    this.page.set(Math.min(this.totalPages(), Math.max(1, page)));
  }
}
