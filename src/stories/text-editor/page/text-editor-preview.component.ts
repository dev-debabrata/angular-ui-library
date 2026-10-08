import { Component } from '@angular/core';

import { IconComponent } from '../../components/media/icon/icon.component';

/** A small picture of the document editor, for the Text Editor card on Welcome (no Quill). Not part of the library */
@Component({
  selector: 'np-text-editor-preview',
  imports: [IconComponent],
  templateUrl: './text-editor-preview.html',
  styleUrl: './text-editor-preview.css',
})
export class TextEditorPreviewComponent {
  protected readonly actions = ['check', 'file-up', 'file-down', 'download', 'printer'];
  /** Toolbar icons; '' is a separator */
  protected readonly tools = [
    '',
    'bold',
    'italic',
    'underline',
    'strikethrough',
    '',
    'list-ordered',
    'list',
    '',
    'link',
    'image',
    'table',
  ];
}
