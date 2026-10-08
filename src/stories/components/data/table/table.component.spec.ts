import { type ComponentFixture, TestBed } from '@angular/core/testing';

import { TableComponent } from './table.component';

const data = Array.from({ length: 12 }, (_, i) => ({ id: i + 1, name: `Member ${i + 1}` }));

describe('TableComponent pagination', () => {
  let fixture: ComponentFixture<TableComponent>;
  const el = () => fixture.nativeElement as HTMLElement;
  const text = (selector: string) =>
    el().querySelector(selector)?.textContent?.replace(/\s+/g, ' ').trim();
  const bodyRows = () => el().querySelectorAll('tbody tr').length;

  beforeEach(async () => {
    fixture = TestBed.createComponent(TableComponent);
    fixture.componentRef.setInput('columns', [
      { key: 'id', label: 'ID', sortable: true },
      { key: 'name', label: 'Name' },
    ]);
    fixture.componentRef.setInput('data', data);
    fixture.componentRef.setInput('rows', 5);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('shows the compact bar: items per page, the range and arrows without page numbers', () => {
    expect(text('.pagination__per-page')).toContain('Items per page:');
    expect(text('.pagination__text[aria-live]')).toBe('1 – 5 of 12');
    expect(el().querySelectorAll('.pagination__page').length).toBe(0);
    expect(el().querySelector('[aria-label="Previous page"]')?.hasAttribute('disabled')).toBe(true);
    expect(bodyRows()).toBe(5);
  });

  it('pages with the arrows and changes the page size from the select', async () => {
    (el().querySelector('[aria-label="Next page"]') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(text('.pagination__text[aria-live]')).toBe('6 – 10 of 12');

    // The size picker is np-select (a themed listbox), not a native <select>
    (el().querySelector('.pagination__per-page [role="combobox"]') as HTMLButtonElement).click();
    fixture.detectChanges();
    const options = [...el().querySelectorAll<HTMLElement>('[role="option"]')];
    expect(options.map((o) => o.textContent?.trim())).toEqual(['5', '10', '25', '50']);
    options[1].click();
    fixture.detectChanges();
    await fixture.whenStable();
    // Back to the first page with the new size
    expect(text('.pagination__text[aria-live]')).toBe('1 – 10 of 12');
    expect(bodyRows()).toBe(10);
  });

  it('can use another pagination look, with page numbers', () => {
    fixture.componentRef.setInput('paginator', 'default');
    fixture.detectChanges();
    expect(el().querySelectorAll('.pagination__page').length).toBe(3);
    expect(text('.pagination__text[aria-live]')).toBe('1–5 of 12');
    expect(text('.pagination__per-page')).not.toContain('Items per page');
  });

  it('load-more adds the next rows below', () => {
    fixture.componentRef.setInput('paginator', 'load-more');
    fixture.detectChanges();
    expect(text('.pagination__text[aria-live]')).toBe('Showing 5 of 12');
    const more = () =>
      [...el().querySelectorAll('button')].find((b) => b.textContent?.includes('more'));
    expect(more()?.textContent?.trim()).toBe('Load 5 more');
    more()!.click();
    fixture.detectChanges();
    expect(bodyRows()).toBe(10);
    expect(more()?.textContent?.trim()).toBe('Load 2 more');
    more()!.click();
    fixture.detectChanges();
    expect(bodyRows()).toBe(12);
    expect(more()).toBeUndefined();
    expect(el().textContent).toContain('All loaded');
  });

  it('input goes to the typed page', () => {
    fixture.componentRef.setInput('paginator', 'input');
    fixture.detectChanges();
    const box = el().querySelector('.pagination__status input') as HTMLInputElement;
    box.value = '3';
    box.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    expect(box.value).toBe('3');
    expect(bodyRows()).toBe(2);
  });
});

describe('TableComponent features', () => {
  let fixture: ComponentFixture<TableComponent>;
  let table: TableComponent;
  const el = () => fixture.nativeElement as HTMLElement;
  const cells = (row: number) =>
    [...el().querySelectorAll(`tbody tr:nth-child(${row}) td`)].map((td) => td.textContent?.trim());
  const set = (inputs: Record<string, unknown>) => {
    for (const [name, value] of Object.entries(inputs)) fixture.componentRef.setInput(name, value);
    fixture.detectChanges();
  };
  const rows = [
    { item: 'Towel', cost: 5, about: 'Soft' },
    { item: 'Ball', cost: 4, about: 'Round' },
    { item: 'Cooler', cost: 25, about: 'Cold' },
  ];

  beforeEach(() => {
    fixture = TestBed.createComponent(TableComponent);
    table = fixture.componentInstance;
  });

  it('formats cells, totals the footer and shows a footer note', () => {
    set({
      data: rows,
      footerNote: 'Made-up prices',
      columns: [
        { key: 'item', label: 'Item', footer: 'Total', description: 'What was bought' },
        {
          key: 'cost',
          label: 'Cost',
          format: (v: unknown) => `$${Number(v).toFixed(2)}`,
          footer: (all: Record<string, unknown>[]) =>
            all.reduce((s, r) => s + Number(r['cost']), 0),
        },
      ],
    });
    expect(cells(1)).toEqual(['Towel', '$5.00']);
    expect([...el().querySelectorAll('tfoot td')].map((td) => td.textContent?.trim())).toEqual([
      'Total',
      '$34.00',
      'Made-up prices',
    ]);
    expect(el().querySelector('.table__desc')?.textContent).toBe('What was bought');
  });

  it('starts sorted by sortField / sortOrder', () => {
    set({
      data: rows,
      columns: [
        { key: 'item', label: 'Item' },
        { key: 'cost', label: 'Cost' },
      ],
      sortField: 'cost',
      sortOrder: 'desc',
    });
    expect(cells(1)[0]).toBe('Cooler');
    expect(el().querySelector('th[aria-sort]')?.getAttribute('aria-sort')).toBe('descending');
  });

  it('opens a detail row with detailKey and emits row actions', () => {
    const actions: { action: string; row: unknown }[] = [];
    table.rowAction.subscribe((a) => actions.push(a));
    set({
      data: rows,
      expandable: true,
      detailKey: 'about',
      columns: [
        { key: 'item', label: 'Item' },
        { key: 'actions', label: '', actions: [{ label: 'Delete', icon: 'trash-2' }] },
      ],
    });
    (el().querySelector('[aria-label="Show details"]') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(el().querySelector('.table__detail')?.textContent?.trim()).toBe('Soft');
    (el().querySelector('[aria-label="Delete"]') as HTMLButtonElement).click();
    expect(actions).toEqual([{ action: 'Delete', row: rows[0] }]);
  });

  it('moves a dropped row in data, mapping shown positions to the data', () => {
    const moves: unknown[] = [];
    table.rowReorder.subscribe((m) => moves.push(m));
    set({ data: rows, reorderable: true, columns: [{ key: 'item', label: 'Item' }] });
    (table as unknown as { drop(e: object): void }).drop({ previousIndex: 0, currentIndex: 2 });
    fixture.detectChanges();
    expect(table.data().map((r) => r['item'])).toEqual(['Ball', 'Cooler', 'Towel']);
    expect(moves).toEqual([{ previousIndex: 0, currentIndex: 2 }]);
    expect(el().querySelectorAll('[aria-label="Drag to reorder"]').length).toBe(3);
  });

  it('lazy: shows data as one page and asks for each page and sort', async () => {
    const requests: unknown[] = [];
    table.lazyLoad.subscribe((r) => requests.push(r));
    set({
      lazy: true,
      rows: 2,
      totalRecords: 9,
      data: rows,
      columns: [{ key: 'item', label: 'Item', sortable: true }],
    });
    await fixture.whenStable();
    expect(el().querySelectorAll('tbody tr').length).toBe(3);
    expect(el().querySelector('.pagination__text[aria-live]')?.textContent?.trim()).toBe(
      '1 – 2 of 9',
    );
    (el().querySelector('[aria-label="Next page"]') as HTMLButtonElement).click();
    fixture.detectChanges();
    await fixture.whenStable();
    (el().querySelector('th.sortable') as HTMLElement).click();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(requests).toEqual([
      { page: 1, rows: 2, sortField: null, sortOrder: 'asc', filter: '' },
      { page: 2, rows: 2, sortField: null, sortOrder: 'asc', filter: '' },
      { page: 1, rows: 2, sortField: 'item', sortOrder: 'asc', filter: '' },
    ]);
  });

  it('opens details by clicking anywhere on an expandable row, and centers action buttons', () => {
    set({
      data: rows,
      expandable: true,
      detailKey: 'about',
      columns: [
        { key: 'item', label: 'Item' },
        { key: 'actions', label: 'Actions', actions: [{ label: 'Edit', icon: 'pencil' }] },
      ],
    });
    const first = el().querySelector('tbody tr') as HTMLElement;
    first.click();
    fixture.detectChanges();
    expect(el().querySelector('.table__detail')?.textContent?.trim()).toBe('Soft');
    first.click();
    fixture.detectChanges();
    expect(el().querySelector('.table__detail')).toBeNull();
    expect((el().querySelectorAll('th')[1] as HTMLElement).style.textAlign).toBe('center');
  });

  it('moves a dropped column in columns', () => {
    const moves: unknown[] = [];
    table.columnReorder.subscribe((m) => moves.push(m));
    set({
      data: rows,
      reorderableColumns: true,
      columns: [
        { key: 'item', label: 'Item' },
        { key: 'cost', label: 'Cost' },
      ],
    });
    (table as unknown as { dropColumn(e: object): void }).dropColumn({
      previousIndex: 0,
      currentIndex: 1,
    });
    fixture.detectChanges();
    expect([...el().querySelectorAll('th')].map((th) => th.textContent?.trim())).toEqual([
      'Cost',
      'Item',
    ]);
    expect(moves).toEqual([{ previousIndex: 0, currentIndex: 1 }]);
  });

  it('sorts on every click: already ascending columns go descending first, a third click unsorts', () => {
    set({
      data: rows,
      columns: [
        { key: 'item', label: 'Item', sortable: true },
        { key: 'n', label: 'N', sortable: true },
      ],
    });
    const [item, n] = [...el().querySelectorAll<HTMLElement>('th.sortable')];
    const firstItems = () => [1, 2, 3].map((r) => cells(r)[0]);
    // Item isn't sorted yet (Towel, Ball, Cooler): the first click sorts A–Z
    item.click();
    fixture.detectChanges();
    expect(firstItems()).toEqual(['Ball', 'Cooler', 'Towel']);
    item.click();
    fixture.detectChanges();
    expect(firstItems()).toEqual(['Towel', 'Cooler', 'Ball']);
    item.click();
    fixture.detectChanges();
    expect(firstItems()).toEqual(['Towel', 'Ball', 'Cooler']);
    expect(item.getAttribute('aria-sort')).toBeNull();
    // N already ascends (1, 2, 3): the first click visibly sorts descending
    set({ data: rows.map((r, i) => ({ ...r, n: i + 1 })) });
    n.click();
    fixture.detectChanges();
    expect(n.getAttribute('aria-sort')).toBe('descending');
    expect(cells(1)[0]).toBe('Cooler');
  });
});
