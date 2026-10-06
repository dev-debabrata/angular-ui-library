import {
  Component,
  ElementRef,
  booleanAttribute,
  effect,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';

import { IconComponent } from '../../media/icon/icon.component';
import { type AnchorPosition, anchorPosition } from '../../../utils/anchor-position';

@Component({
  selector: 'np-overlay-panel',
  imports: [IconComponent],
  exportAs: 'overlayPanel',
  host: {
    '(document:keydown.escape)': 'hide()',
    '(document:click)': 'onDocumentClick($event)',
    '(window:resize)': 'reposition()',
    '(window:scroll)': 'reposition()',
  },
  templateUrl: './overlay-panel.html',
  styleUrl: './overlay-panel.css',
})
export class OverlayPanelComponent {
  /** Close when clicking outside the panel */
  readonly dismissable = input(true, { transform: booleanAttribute });

  /** Show a × button in the corner */
  readonly showCloseIcon = input(false, { transform: booleanAttribute });

  /** Accessible name for the panel */
  readonly ariaLabel = input('');

  /** Emits when the panel opens */
  readonly onShow = output<void>();

  /** Emits when the panel closes */
  readonly onHide = output<void>();

  private readonly isVisible = signal(false);

  /** Is the panel open? Use show(), hide() or toggle() to change it */
  readonly visible = this.isVisible.asReadonly();

  private readonly anchor = signal<Element | null>(null);
  private readonly panel = viewChild<ElementRef<HTMLElement>>('panel');
  protected readonly position = signal<AnchorPosition | null>(null);

  constructor() {
    // Measure and place the panel when it opens or its anchor changes
    effect(() => {
      this.anchor();
      this.position.set(null);
      if (this.panel()) this.reposition();
    });
  }

  /** Open the panel under `target` (default: the element that received the event), or close it if already open there */
  toggle(event: Event, target?: HTMLElement) {
    const anchor = target ?? (event.currentTarget as Element | null);
    if (this.visible() && anchor === this.anchor()) this.hide();
    else this.show(event, target);
  }

  /** Open the panel under `target` (default: the element that received the event) */
  show(event: Event, target?: HTMLElement) {
    this.anchor.set(target ?? (event.currentTarget as Element | null));
    if (!this.visible()) {
      this.isVisible.set(true);
      this.onShow.emit();
    }
  }

  /** Close the panel */
  hide() {
    if (!this.visible()) return;
    this.isVisible.set(false);
    this.onHide.emit();
  }

  protected reposition() {
    const anchor = this.anchor();
    const panel = this.panel()?.nativeElement;
    if (anchor && panel) this.position.set(anchorPosition(anchor, panel));
  }

  /** Clicks outside the panel and its anchor close it when dismissable */
  protected onDocumentClick(event: Event) {
    const node = event.target as Node;
    const inside = this.panel()?.nativeElement.contains(node) || this.anchor()?.contains(node);
    if (this.dismissable() && !inside) this.hide();
  }
}
