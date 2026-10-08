import { Component, computed, output, signal } from '@angular/core';

import { IconComponent } from '../../components/media/icon/icon.component';
import { copyToClipboard } from '../../utils/clipboard';
import { downloadBlob } from '../../utils/download';
import { TextEditorComponent } from '../text-editor.component';
import { markdownToHtml, wordCount } from './text-editor-page-utils';
import { SAMPLE_MARKDOWN } from './text-editor-samples';

/** The Text Editor page's Markdown mode: Markdown on the left, the formatted result on the right. Not part of the library */
@Component({
  selector: 'np-text-editor-markdown',
  imports: [IconComponent, TextEditorComponent],
  templateUrl: './text-editor-markdown.html',
  styleUrl: './text-editor-markdown.css',
})
export class TextEditorMarkdownComponent {
  /** "Open as document": the formatted HTML, for the Document mode */
  readonly openDocument = output<string>();

  protected readonly source = signal(SAMPLE_MARKDOWN);
  protected readonly html = computed(() => markdownToHtml(this.source()));
  protected readonly words = computed(() => wordCount(this.source()));
  protected readonly copied = signal(false);

  protected async copyHtml() {
    await copyToClipboard(this.html());
    this.copied.set(true);
    setTimeout(() => this.copied.set(false), 1500);
  }

  protected download() {
    downloadBlob(new Blob([this.source()], { type: 'text/markdown' }), 'document.md');
  }
}
