import {
  Directive,
  ElementRef,
  Injector,
  type OutputEmitterRef,
  afterNextRender,
  inject,
  signal,
} from '@angular/core';

import { type AnchorPosition, anchorPosition } from './anchor-position';
import type { MenuItem } from './types';

/** Payload of every menu's itemClick output */
export interface MenuItemEvent {
  originalEvent: Event;
  item: MenuItem;
}

/** Runs `item.command` and emits `emitter`. Returns false (and blocks link navigation) for disabled items and separators */
export function runItem(event: Event, item: MenuItem, emitter: OutputEmitterRef<MenuItemEvent>) {
  if (item.disabled || item.separator) {
    event.preventDefault();
    return false;
  }
  const payload = { originalEvent: event, item };
  item.command?.(payload);
  emitter.emit(payload);
  return true;
}

/** Chain of open submenus: items()[0] is the open root item, items()[1] its open child, ... */
export class MenuPath {
  readonly items = signal<MenuItem[]>([]);

  isOpen(item: MenuItem, depth: number) {
    return this.items()[depth] === item;
  }

  /** Open `item` at `depth` and close anything deeper. Items without an enabled submenu only close deeper levels */
  open(item: MenuItem | null, depth: number) {
    if (item?.separator) return;
    const open = item && item.items?.length && !item.disabled ? [item] : [];
    this.items.update((path) => [...path.slice(0, depth), ...open]);
  }

  toggle(item: MenuItem, depth: number) {
    this.open(this.isOpen(item, depth) ? null : item, depth);
  }

  clear() {
    this.items.set([]);
  }
}

/** Base for menus that close (hide()) on Escape or a click outside the host and its anchor */
@Directive({
  host: {
    '(document:click)': 'onDocumentClick($event)',
    '(document:keydown.escape)': 'hide()',
  },
})
export abstract class DismissableMenu {
  protected readonly host: HTMLElement = inject(ElementRef).nativeElement;
  protected anchor: Element | null = null;

  protected abstract hide(): void;

  protected onDocumentClick(event: Event) {
    const target = event.target as Node;
    if (!this.host.contains(target) && !this.anchor?.contains(target)) this.hide();
  }
}

/** Popup mode for Menu and TieredMenu: the first element of the template floats below the event target */
@Directive()
export abstract class PopupMenu extends DismissableMenu {
  protected readonly visible = signal(false);
  protected readonly position = signal<AnchorPosition | null>(null);
  private readonly injector = inject(Injector);

  /** Show or hide the popup menu */
  toggle(event: Event) {
    if (this.visible()) this.hide();
    else this.show(event);
  }

  /** Open the popup menu below `event.currentTarget` */
  show(event: Event) {
    const anchor = (this.anchor = event.currentTarget as Element);
    this.visible.set(true);
    afterNextRender(
      () => {
        const popover = this.host.firstElementChild as HTMLElement | null;
        if (popover) this.position.set(anchorPosition(anchor, popover));
      },
      { injector: this.injector },
    );
  }

  /** Close the popup menu */
  hide() {
    this.visible.set(false);
  }
}
