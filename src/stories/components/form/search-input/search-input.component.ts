import { Component, booleanAttribute, input, output } from '@angular/core';

@Component({
  selector: 'nex-search-input',
  templateUrl: './search-input.html',
  styleUrl: './search-input.css',
})
export class SearchInputComponent {
  /** Text shown when the input is empty */
  readonly placeholder = input('Search...');

  /** Initial value of the input */
  readonly value = input('');

  /** Is the input disabled? */
  readonly disabled = input(false, { transform: booleanAttribute });

  /** Emits the current text on every keystroke */
  readonly search = output<string>();
}
