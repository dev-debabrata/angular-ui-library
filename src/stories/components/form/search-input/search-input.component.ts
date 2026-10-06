import { Component, booleanAttribute, input, output } from '@angular/core';

@Component({
  selector: 'np-search-input',
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

  /**
   * Emits the current text on every keystroke, and '' when cleared (× or Escape). The input's native `search`
   * event has the same name and bubbles, so the template stops it: listeners get only this output's text
   */
  readonly search = output<string>();
}
