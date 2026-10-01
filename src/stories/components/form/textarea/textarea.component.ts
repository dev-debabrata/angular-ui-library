import { Component, booleanAttribute, input, model, numberAttribute } from '@angular/core';

@Component({
  selector: 'nex-textarea',
  templateUrl: './textarea.html',
  styleUrl: './textarea.css',
})
export class TextareaComponent {
  /** Text shown above the textarea */
  readonly label = input('');

  /** Text shown when the textarea is empty */
  readonly placeholder = input('');

  /** Textarea value. Supports [(value)] two-way binding */
  readonly value = model('');

  /** Visible number of lines */
  readonly rows = input(4, { transform: numberAttribute });

  /** Maximum number of characters. Shows a counter when set */
  readonly maxLength = input(0, { transform: numberAttribute });

  /** Is the textarea disabled? */
  readonly disabled = input(false, { transform: booleanAttribute });
}
