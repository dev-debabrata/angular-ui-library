import { Component, booleanAttribute, input, signal } from '@angular/core';

export interface AccordionItem {
  title: string;
  content: string;
}

@Component({
  selector: 'np-accordion',
  templateUrl: './accordion.html',
  styleUrl: './accordion.css',
})
export class AccordionComponent {
  /** Sections to display */
  readonly items = input<AccordionItem[]>([]);

  /** Allow more than one section open at a time? */
  readonly multiple = input(false, { transform: booleanAttribute });

  protected readonly openIndexes = signal<number[]>([]);

  protected isOpen(index: number) {
    return this.openIndexes().includes(index);
  }

  protected toggle(index: number) {
    if (this.isOpen(index)) {
      this.openIndexes.update((open) => open.filter((i) => i !== index));
    } else {
      this.openIndexes.update((open) => (this.multiple() ? [...open, index] : [index]));
    }
  }
}
