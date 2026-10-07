import { Component, input } from '@angular/core';

import { VERSION } from '../../getting-started/landing';
import { TextEditorDemoComponent, type TextEditorDemoMode } from './text-editor-demo.component';

/** The site's Text Editor page: a hero and the editor workspace (text-editor-demo). Not part of the library */
@Component({
  selector: 'np-text-editor-page',
  imports: [TextEditorDemoComponent],
  templateUrl: './text-editor-page.html',
  styleUrl: './text-editor-page.css',
})
export class TextEditorPageComponent {
  /** Mode to open with (?mode= in the site's URL) */
  readonly mode = input<TextEditorDemoMode | undefined>();

  protected readonly version = VERSION;
}
