import { Component, computed, signal } from '@angular/core';

import { IconComponent } from '../../components/media/icon/icon.component';
import { TextEditorComponent, type TextEditorTool } from '../text-editor.component';
import { plainText } from './text-editor-page-utils';
import { SAMPLE_EMAIL } from './text-editor-samples';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
/** Addresses typed into a field, split at commas, semicolons and spaces */
const addresses = (text: string) => text.split(/[\s,;]+/).filter(Boolean);

/**
 * The Text Editor page's Email mode: To / Cc / Subject, the editor with a compact toolbar, attachments and Send.
 * Nothing is sent (the site has no backend). Not part of the library
 */
@Component({
  selector: 'np-text-editor-email',
  imports: [IconComponent, TextEditorComponent],
  templateUrl: './text-editor-email.html',
  styleUrl: './text-editor-email.css',
})
export class TextEditorEmailComponent {
  protected readonly tools: TextEditorTool[] = [
    'bold',
    'italic',
    'underline',
    'color',
    'highlight',
    'bullet',
    'ordered',
    'align',
    'link',
    'image',
    'emoji',
    'clean',
  ];
  protected readonly to = signal('team@example.com');
  protected readonly cc = signal('');
  protected readonly showCc = signal(false);
  protected readonly subject = signal('Portal redesign: ready for review');
  protected readonly body = signal(SAMPLE_EMAIL);
  protected readonly files = signal<File[]>([]);
  /** The address rows; Cc after its button is clicked */
  protected readonly fields = computed(() => [
    { label: 'To', value: this.to },
    ...(this.showCc() ? [{ label: 'Cc', value: this.cc }] : []),
    { label: 'Subject', value: this.subject },
  ]);
  protected readonly tried = signal(false);
  protected readonly sent = signal(false);

  /** What's wrong with the addresses, if anything; then the first problem that stops sending */
  protected readonly addressError = computed(() => {
    const bad = [...addresses(this.to()), ...addresses(this.cc())].find((a) => !EMAIL.test(a));
    if (!addresses(this.to()).length) return 'Add at least one recipient.';
    return bad ? `"${bad}" isn't an email address.` : '';
  });
  protected readonly error = computed(
    () => this.addressError() || (plainText(this.body()) ? '' : 'Write a message first.'),
  );
  protected readonly recipients = computed(
    () => addresses(this.to()).length + addresses(this.cc()).length,
  );

  protected attach(input: HTMLInputElement) {
    this.files.update((list) => [...list, ...Array.from(input.files ?? [])]);
    input.value = '';
  }

  protected remove(file: File) {
    this.files.update((list) => list.filter((f) => f !== file));
  }

  protected size(bytes: number) {
    return bytes < 1024 * 1024
      ? `${Math.ceil(bytes / 1024)} KB`
      : `${(bytes / 1048576).toFixed(1)} MB`;
  }

  protected send() {
    this.tried.set(true);
    if (!this.error()) this.sent.set(true);
  }

  protected reset() {
    for (const text of [this.to, this.cc, this.subject, this.body]) text.set('');
    this.files.set([]);
    this.tried.set(false);
    this.sent.set(false);
  }
}
