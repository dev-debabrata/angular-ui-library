import { Component, booleanAttribute, computed, input, model } from '@angular/core';

import type { Size } from '../../../utils/types';
import { IconComponent } from '../../media/icon/icon.component';

export interface ToggleOption<T = unknown> {
  value: T;
  /** Text on the button. Leave empty for icon-only buttons (then set `ariaLabel`) */
  label?: string;
  /** Icon file name from src/stories/icons/svg */
  icon?: string;
  ariaLabel?: string;
  disabled?: boolean;
}

/** Group of joined buttons: pick one option, or several with `multiple` */
@Component({
  selector: 'np-button-toggle',
  imports: [IconComponent],
  templateUrl: './button-toggle.html',
  styleUrl: './button-toggle.css',
})
export class ButtonToggleComponent<T = unknown> {
  /** Buttons to show */
  readonly options = input<ToggleOption<T>[]>([]);

  /** Selected value (single) or values (multiple). Supports [(value)] two-way binding */
  readonly value = model<T | T[] | null>(null);

  /** Allow selecting several buttons */
  readonly multiple = input(false, { transform: booleanAttribute });

  /** Stack the buttons vertically */
  readonly vertical = input(false, { transform: booleanAttribute });

  /** Show a check mark on selected buttons */
  readonly showCheck = input(true, { transform: booleanAttribute });

  /** Button size */
  readonly size = input<Size>('medium');

  /** Disable the whole group */
  readonly disabled = input(false, { transform: booleanAttribute });

  /** Accessible name for the group */
  readonly ariaLabel = input('');

  private readonly selected = computed(() => {
    const v = this.value();
    return new Set<T>(Array.isArray(v) ? v : v === null ? [] : [v]);
  });

  protected isSelected(option: ToggleOption<T>) {
    return this.selected().has(option.value);
  }

  protected toggle(option: ToggleOption<T>) {
    if (this.disabled() || option.disabled) return;
    if (!this.multiple()) return this.value.set(option.value);
    const next = new Set(this.selected());
    if (next.has(option.value)) next.delete(option.value);
    else next.add(option.value);
    // Keep the order of `options`
    this.value.set(
      this.options()
        .filter((o) => next.has(o.value))
        .map((o) => o.value),
    );
  }

  /** Single mode: arrow keys move to and select the next enabled button, like a radio group */
  protected onKeydown(event: KeyboardEvent, index: number) {
    const dir = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[event.key];
    if (this.multiple() || !dir) return;
    event.preventDefault();
    const options = this.options();
    for (let i = 1; i <= options.length; i++) {
      const next = (index + dir * i + options.length) % options.length;
      if (!options[next].disabled) {
        this.toggle(options[next]);
        const group = (event.currentTarget as HTMLElement).parentElement!;
        (group.children[next] as HTMLElement).focus();
        return;
      }
    }
  }

  /** Single mode uses a roving tabindex: only the selected (or first) button is in the tab order */
  protected tabIndex(index: number) {
    if (this.multiple()) return 0;
    const active = this.options().findIndex((o) => this.isSelected(o));
    return index === (active < 0 ? 0 : active) ? 0 : -1;
  }
}
