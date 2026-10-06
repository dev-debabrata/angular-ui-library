import {
  Component,
  TemplateRef,
  booleanAttribute,
  computed,
  contentChild,
  input,
  model,
  numberAttribute,
  output,
  signal,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import {
  CdkDrag,
  CdkDropList,
  CdkDropListGroup,
  moveItemInArray,
  type CdkDragDrop,
} from '@angular/cdk/drag-drop';

import { IconComponent } from '../../media/icon/icon.component';
import { SearchInputComponent } from '../../form/search-input/search-input.component';

export type ListSide = 'source' | 'target';

/** Looks of the pick list */
export const PICK_LIST_VARIANTS = ['default', 'cards', 'compact', 'glass', 'minimal'] as const;
export type PickListVariant = (typeof PICK_LIST_VARIANTS)[number];

@Component({
  selector: 'np-pick-list',
  imports: [
    NgTemplateOutlet,
    CdkDrag,
    CdkDropList,
    CdkDropListGroup,
    IconComponent,
    SearchInputComponent,
  ],
  templateUrl: './pick-list.html',
  styleUrl: './pick-list.css',
})
export class PickListComponent<T = unknown> {
  /** Items in the left list. Supports [(source)] two-way binding */
  readonly source = model<T[]>([]);

  /** Items in the right list. Supports [(target)] two-way binding */
  readonly target = model<T[]>([]);

  /** Title above the left list */
  readonly sourceHeader = input('Available');

  /** Title above the right list */
  readonly targetHeader = input('Selected');

  /** Item property shown as the label (when no item template is projected) */
  readonly optionLabel = input('label');

  /** Item property with an icon file name, shown before the label (without an item template) */
  readonly optionIcon = input('');

  /** Item property shown as a second line (without an item template) */
  readonly optionDescription = input('');

  /** Look: default, cards, compact, glass (frosted) or minimal (no panel frame) */
  readonly variant = input<PickListVariant>('default');

  /** Most items the target list can hold (0: no limit). Moves past it are cut off */
  readonly targetLimit = input(0, { transform: numberAttribute });

  /** Show a search box above each list? */
  readonly filter = input(false, { transform: booleanAttribute });

  /** Placeholder text for the search boxes */
  readonly filterPlaceholder = input('Filter...');

  /** Drag items between the lists and reorder them within a list? */
  readonly dragdrop = input(true, { transform: booleanAttribute });

  /** Emits the items moved from source to target */
  readonly moveToTarget = output<T[]>();

  /** Emits the items moved from target to source */
  readonly moveToSource = output<T[]>();

  /** Emits a list's new order after items are dragged within it */
  readonly reorder = output<{ side: ListSide; items: T[] }>();

  /** Optional `<ng-template let-item>` for custom item rendering */
  protected readonly itemTemplate = contentChild<TemplateRef<{ $implicit: T }>>(TemplateRef);

  /** Left and right list, rendered by the same template */
  protected readonly sides: ListSide[] = ['source', 'target'];

  protected readonly selected = { source: signal(new Set<T>()), target: signal(new Set<T>()) };
  protected readonly query = { source: signal(''), target: signal('') };

  protected readonly visible = {
    source: computed(() => this.applyFilter(this.source(), this.query.source())),
    target: computed(() => this.applyFilter(this.target(), this.query.target())),
  };

  /** Free places in the target list */
  protected readonly room = computed(() =>
    this.targetLimit() ? Math.max(0, this.targetLimit() - this.target().length) : Infinity,
  );

  /** Drag-and-drop: a full target list accepts only its own items */
  protected readonly canEnter = (drag: CdkDrag<T>, drop: CdkDropList<ListSide>) =>
    drop.data === 'source' || drag.dropContainer.data === 'target' || this.room() > 0;

  protected header(side: ListSide) {
    return side === 'source' ? this.sourceHeader() : this.targetHeader();
  }

  /** An item property as text; plain (non-object) items are their own label */
  protected field(item: T, key = this.optionLabel()): string {
    const value = item && typeof item === 'object' ? (item as Record<string, unknown>)[key] : item;
    return String(value ?? '');
  }

  /** Click selects one item; Ctrl/Cmd+click adds or removes it from the selection */
  protected onItemClick(side: ListSide, item: T, event: Event) {
    const { ctrlKey, metaKey } = event as MouseEvent | KeyboardEvent;
    this.selected[side].update((set) => {
      if (!ctrlKey && !metaKey)
        return set.has(item) && set.size === 1 ? new Set() : new Set([item]);
      const next = new Set(set);
      next[next.has(item) ? 'delete' : 'add'](item);
      return next;
    });
  }

  /**
   * Move the selected visible items (or `items`, e.g. on double-click) from one list to the other,
   * inserting them at `index` in the other list (default: the end)
   */
  protected move(
    from: ListSide,
    items = this.visible[from]().filter((item) => this.selected[from]().has(item)),
    index = Infinity,
  ) {
    const to: ListSide = from === 'source' ? 'target' : 'source';
    if (to === 'target') items = items.slice(0, this.room());
    if (!items.length) return;
    const moving = new Set(items);
    this[from].update((list) => list.filter((item) => !moving.has(item)));
    this[to].update((list) => [...list.slice(0, index), ...items, ...list.slice(index)]);
    this.selected[from].set(new Set());
    (from === 'source' ? this.moveToTarget : this.moveToSource).emit(items);
  }

  /** Drop handler: reorder within a list, or move to the other list at the drop position */
  protected drop(event: CdkDragDrop<ListSide, ListSide, T>) {
    const from = event.previousContainer.data;
    const to = event.container.data;
    const shown = this.visible[to]();

    if (from === to) {
      if (event.previousIndex === event.currentIndex) return;
      // Reorder the visible items, then write them back into the slots they held in the full list,
      // so items hidden by the filter keep their positions
      const reordered = [...shown];
      moveItemInArray(reordered, event.previousIndex, event.currentIndex);
      const slots = new Set(shown);
      let next = 0;
      this[to].update((list) => list.map((item) => (slots.has(item) ? reordered[next++] : item)));
      this.reorder.emit({ side: to, items: this[to]() });
      return;
    }

    // Dragging one of several selected items moves the whole selection
    const dragged = event.item.data;
    const selected = this.selected[from]();
    const items = selected.has(dragged)
      ? this.visible[from]().filter((item) => selected.has(item))
      : [dragged];
    const anchor = shown[event.currentIndex];
    this.move(from, items, anchor === undefined ? Infinity : this[to]().indexOf(anchor));
  }

  private applyFilter(items: T[], query: string) {
    const q = query.trim().toLowerCase();
    const text = (item: T) => `${this.field(item)} ${this.field(item, this.optionDescription())}`;
    return q ? items.filter((item) => text(item).toLowerCase().includes(q)) : items;
  }
}
