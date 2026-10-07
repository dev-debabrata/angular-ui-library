import {
  Component,
  booleanAttribute,
  ElementRef,
  afterNextRender,
  computed,
  effect,
  input,
  linkedSignal,
  signal,
  viewChild,
} from '@angular/core';

import { AvatarComponent } from '../../components/media/avatar/avatar.component';
import {
  ButtonToggleComponent,
  type ToggleOption,
} from '../../components/form/button-toggle/button-toggle.component';
import { IconComponent } from '../../components/media/icon/icon.component';
import { copyToClipboard } from '../../utils/clipboard';
import { downloadBlob } from '../../utils/download';
import { TextEditorComponent, type TextEditorTool } from '../text-editor.component';
import {
  SAMPLE_COMMENTS,
  SAMPLE_DOCUMENT,
  SAMPLE_SIMPLE,
  SAMPLE_TITLE,
} from './text-editor-samples';

export type TextEditorDemoMode = 'document' | 'simple' | 'comment';
type Mode = TextEditorDemoMode;

const MODES: ToggleOption<Mode>[] = [
  { value: 'document', label: 'Document', icon: 'file-text' },
  { value: 'simple', label: 'Simple', icon: 'pen-line' },
  { value: 'comment', label: 'Comments', icon: 'message-square' },
];

/** Where the document is kept between visits (this browser only) */
// v2: the sample shows every feature, so documents saved with the first sample are set aside once
const STORAGE_KEY = 'np-text-editor-document-v2';
/** Zoom levels in percent */
const ZOOM_STEPS = [50, 75, 90, 100, 110, 125, 150, 200];

/** Plain text of editor HTML, for the word and character counts */
const plainText = (html: string) =>
  html
    .replace(/<\/(p|h\d|li|blockquote|pre)>/g, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&[a-z]+;|&#\d+;/g, 'x')
    .trim();

const escapeHtml = (text: string) =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** A standalone HTML file of the document, styled to print like the page. Word's namespaces make it a .doc */
const htmlFile = (title: string, body: string, word = false) => `<!doctype html>
<html lang="en"${word ? ' xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word"' : ''}>
<head>
<meta charset="utf-8">
<title>${escapeHtml(title)}</title>
<style>
  body { max-width: 816px; margin: 40px auto; padding: 0 24px; font: 15px/1.6 system-ui, sans-serif; color: #0f172a; }
  blockquote { margin: 0; padding: 4px 0 4px 14px; border-left: 3px solid #6366f1; color: #475569; }
  pre { padding: 12px 14px; border-radius: 6px; background: #f1f5f9; white-space: pre-wrap; }
  a { color: #4f46e5; }
  img { max-width: 100%; height: auto; border-radius: 6px; }
  code { padding: 1px 5px; border-radius: 4px; background: #f1f5f9; }
  hr { border: none; border-top: 1px solid #cbd5e1; }
  li[data-list='checked'], li[data-list='unchecked'] { list-style: none; }
  li[data-list='unchecked']::before { content: '☐ '; }
  li[data-list='checked']::before { content: '☑ '; }
  li[data-list='checked'] { color: #64748b; text-decoration: line-through; }
  .ql-indent-1 { padding-left: 2em; } .ql-indent-2 { padding-left: 4em; } .ql-indent-3 { padding-left: 6em; }
</style>
</head>
<body>
${body}
</body>
</html>`;

/**
 * The Text Editor workspace: np-text-editor in three ready-to-use setups (a document with zoom, import/export and
 * autosave; a simple editor with its HTML; a comment box), with a switcher. Used by the site's Text Editor page and
 * by Welcome. Not part of the library.
 */
@Component({
  selector: 'np-text-editor-demo',
  imports: [AvatarComponent, ButtonToggleComponent, IconComponent, TextEditorComponent],
  templateUrl: './text-editor-demo.html',
  styleUrl: './text-editor-demo.css',
  host: {
    '[class.demo--preview]': 'preview()',
    '(document:fullscreenchange)': 'fullscreen.set(isFullscreen())',
  },
})
export class TextEditorDemoComponent {
  /** Mode to open with (the Text Editor page passes ?mode= from the site's URL) */
  readonly mode = input<Mode | undefined>();

  /** A shorter picture of the document editor that can't be used (Welcome wraps it in a link to the editor page) */
  readonly preview = input(false, { transform: booleanAttribute });

  protected readonly modes = MODES;
  protected readonly current = linkedSignal<Mode>(() => this.mode() ?? 'document');

  // Document editor
  protected readonly sample = { title: SAMPLE_TITLE, html: SAMPLE_DOCUMENT };
  protected readonly title = signal(SAMPLE_TITLE);
  protected readonly doc = signal(SAMPLE_DOCUMENT);
  protected readonly zoom = signal(100);
  protected readonly saved = signal(false);
  protected readonly copied = signal(false);
  protected readonly fullscreen = signal(false);
  protected readonly importError = signal('');
  protected readonly stats = computed(() => {
    const text = plainText(this.doc());
    const words = text.match(/\S+/g)?.length ?? 0;
    return {
      words,
      characters: text.replace(/\n/g, '').length,
      minutes: Math.max(1, Math.round(words / 200)),
    };
  });

  /** File actions, in the title bar */
  protected readonly actions = computed(() => [
    {
      icon: 'file-up',
      label: 'Open a file (.html, .txt, .md)',
      run: () => this.fileInput().nativeElement.click(),
    },
    { icon: 'file-down', label: 'Download as Word (.doc)', run: () => this.download(true) },
    { icon: 'download', label: 'Download as HTML', run: () => this.download(false) },
    { icon: 'printer', label: 'Print or save as PDF', run: () => this.print() },
    {
      icon: this.copied() ? 'check' : 'copy',
      label: this.copied() ? 'HTML copied' : 'Copy HTML',
      run: () => this.copyHtml(),
    },
    {
      icon: this.fullscreen() ? 'minimize' : 'maximize',
      label: this.fullscreen() ? 'Exit full screen' : 'Full screen',
      run: () =>
        this.isFullscreen()
          ? document.exitFullscreen()
          : this.docEl().nativeElement.requestFullscreen(),
    },
  ]);

  // Simple editor
  protected readonly simple = signal(SAMPLE_SIMPLE);

  // Comment box
  protected readonly commentTools: TextEditorTool[] = [
    'bold',
    'italic',
    'underline',
    'strike',
    'bullet',
    'ordered',
    'link',
    'code-block',
  ];
  protected readonly comments = signal(SAMPLE_COMMENTS);
  protected readonly draft = signal('');

  private readonly fileInput = viewChild.required<ElementRef<HTMLInputElement>>('fileInput');
  private readonly docEl = viewChild.required<ElementRef<HTMLElement>>('docEl');
  private readonly restored = signal(false);

  constructor() {
    // Bring back the document saved in this browser, then save every change (shortly after typing stops)
    afterNextRender(() => {
      try {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null');
        if (saved?.html) this.load(saved.title ?? SAMPLE_TITLE, saved.html);
      } catch {
        // Storage blocked or bad data: keep the sample
      }
      this.restored.set(true);
    });
    effect((onCleanup) => {
      const data = JSON.stringify({ html: this.doc(), title: this.title() });
      if (!this.restored()) return;
      this.saved.set(false);
      const timer = setTimeout(() => {
        try {
          localStorage.setItem(STORAGE_KEY, data);
          this.saved.set(true);
        } catch {
          // Storage full or blocked: the document just isn't kept
        }
      }, 400);
      onCleanup(() => clearTimeout(timer));
    });
  }

  protected isFullscreen() {
    return !!document.fullscreenElement;
  }

  protected zoomBy(step: number) {
    const i = ZOOM_STEPS.indexOf(this.zoom()) + step;
    this.zoom.set(ZOOM_STEPS[Math.min(Math.max(i, 0), ZOOM_STEPS.length - 1)]);
  }

  protected load(title: string, html: string) {
    this.title.set(title);
    this.doc.set(html);
  }

  /** HTML, or a .doc (HTML with Word's namespaces) that Word, Google Docs and LibreOffice open */
  private download(word: boolean) {
    const name =
      this.title()
        .trim()
        .replace(/[^\w\- ]+/g, '')
        .replace(/\s+/g, '-')
        .toLowerCase() || 'document';
    const file = htmlFile(this.title(), this.doc(), word);
    const blob = word
      ? new Blob(['﻿', file], { type: 'application/msword' })
      : new Blob([file], { type: 'text/html' });
    downloadBlob(blob, `${name}.${word ? 'doc' : 'html'}`);
  }

  /** Print (or "Save as PDF") the document alone, from a hidden frame */
  private print() {
    const frame = Object.assign(document.createElement('iframe'), { title: 'Print' });
    frame.style.cssText = 'position: fixed; width: 0; height: 0; border: 0';
    document.body.append(frame);
    const doc = frame.contentDocument!;
    doc.write(htmlFile(this.title(), this.doc()));
    doc.close();
    frame.contentWindow!.print();
    setTimeout(() => frame.remove(), 1000);
  }

  private async copyHtml() {
    await copyToClipboard(this.doc());
    this.copied.set(true);
    setTimeout(() => this.copied.set(false), 1500);
  }

  /** Open an .html, .txt or .md file: HTML keeps its formatting, text becomes paragraphs */
  protected async importFile(input: HTMLInputElement) {
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;
    this.importError.set(file.size > 2_000_000 ? 'That file is over 2 MB.' : '');
    if (this.importError()) return;
    const text = await file.text();
    const html = /\.html?$/i.test(file.name)
      ? new DOMParser().parseFromString(text, 'text/html').body.innerHTML
      : text
          .split(/\r?\n\s*\r?\n/)
          .map((block) => `<p>${escapeHtml(block.trim()).replace(/\r?\n/g, '<br>')}</p>`)
          .join('');
    this.load(file.name.replace(/\.[^.]+$/, ''), html);
  }

  protected postComment() {
    if (!plainText(this.draft())) return;
    this.comments.update((list) => [
      ...list,
      { name: 'You', time: 'Just now', html: this.draft() },
    ]);
    this.draft.set('');
  }
}
