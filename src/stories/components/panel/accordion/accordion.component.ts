import { Component, booleanAttribute, input, model } from '@angular/core';

import { IconComponent } from '../../media/icon/icon.component';

export interface AccordionItem {
  title: string;
  content: string;
  subtitle?: string;
  /** Leading icon file name, e.g. 'shield' */
  icon?: string;
  disabled?: boolean;
}

/** Looks of the accordion */
export const ACCORDION_VARIANTS = [
  'default',
  'bordered',
  'minimal',
  'soft',
  'glass',
  'gradient',
] as const;
export type AccordionVariant = (typeof ACCORDION_VARIANTS)[number];

let nextId = 0;

@Component({
  selector: 'np-accordion',
  imports: [IconComponent],
  templateUrl: './accordion.html',
  styleUrl: './accordion.css',
})
export class AccordionComponent {
  /** Sections to display */
  readonly items = input<AccordionItem[]>([]);

  /** Allow more than one section open at a time? */
  readonly multiple = input(false, { transform: booleanAttribute });

  /** Indexes of the open sections. Supports [(expanded)] two-way binding */
  readonly expanded = model<number[]>([]);
  /** Look: default (cards), bordered (one box), minimal (lines), soft (tinted), glass (frosted) or gradient (open header) */
  readonly variant = input<AccordionVariant>('default');
  /** Toggle icon: a rotating chevron or plus/minus */
  readonly toggleIcon = input<'chevron' | 'plus'>('chevron');
  /** Toggle icon before ('start') or after ('end') the title */
  readonly iconPos = input<'start' | 'end'>('end');

  /** Prefix for the panel ids (aria-controls) */
  protected readonly uid = `np-accordion-${nextId++}`;

  protected toggle(index: number) {
    if (this.expanded().includes(index)) {
      this.expanded.update((open) => open.filter((i) => i !== index));
    } else {
      this.expanded.update((open) => (this.multiple() ? [...open, index] : [index]));
    }
  }

  /** Up/Down, Home and End move between the enabled headers */
  protected onKeydown(event: KeyboardEvent) {
    const el = event.currentTarget as HTMLElement;
    const headers = [...el.querySelectorAll<HTMLElement>('.accordion-header:enabled')];
    const i = headers.indexOf(event.target as HTMLElement);
    const next = { ArrowUp: i - 1, ArrowDown: i + 1, Home: 0, End: headers.length - 1 }[event.key];
    if (next === undefined) return;
    event.preventDefault();
    headers.at(next % headers.length)?.focus();
  }
}
