import { Component, computed, signal } from '@angular/core';

import { IconComponent } from '../../components/media/icon/icon.component';
import { TextEditorComponent, type TextEditorTool } from '../text-editor.component';
import { persist, plainText } from './text-editor-page-utils';
import { type Note, sampleNotes } from './text-editor-samples';

/** Where the notes are kept between visits (this browser only) */
const STORAGE_KEY = 'np-text-editor-notes';

/** A note's first line is its title; the rest is the snippet under it */
const describe = (note: Note) => {
  const [title = '', ...rest] = plainText(note.html)
    .split('\n')
    .filter((l) => l.trim());
  return { ...note, title: title || 'Untitled note', snippet: rest.join(' ') };
};

/** "Just now", "5 min ago", "Yesterday" or a date */
function when(time: number, now: number) {
  const minutes = Math.round((now - time) / 60_000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} min ago`;
  if (minutes < 24 * 60) return `${Math.round(minutes / 60)} h ago`;
  if (minutes < 48 * 60) return 'Yesterday';
  return new Date(time).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

/**
 * The Text Editor page's Notes mode: a list of notes (search, new, delete) and the open note's editor, kept in
 * this browser. Not part of the library
 */
@Component({
  selector: 'np-text-editor-notes',
  imports: [IconComponent, TextEditorComponent],
  templateUrl: './text-editor-notes.html',
  styleUrl: './text-editor-notes.css',
})
export class TextEditorNotesComponent {
  protected readonly tools: TextEditorTool[] = [
    'heading',
    'bold',
    'italic',
    'underline',
    'strike',
    'highlight',
    'check',
    'bullet',
    'ordered',
    'link',
    'image',
    'table',
    'emoji',
    'find',
  ];
  protected readonly notes = signal<Note[]>(sampleNotes());
  protected readonly openId = signal(this.notes()[0].id);
  protected readonly query = signal('');

  /** Newest first, filtered by the search */
  protected readonly list = computed(() => {
    const q = this.query().trim().toLowerCase();
    const now = Date.now();
    return this.notes()
      .map(describe)
      .filter((n) => !q || `${n.title} ${n.snippet}`.toLowerCase().includes(q))
      .sort((a, b) => b.updated - a.updated)
      .map((n) => ({ ...n, when: when(n.updated, now) }));
  });
  protected readonly open = computed(() => {
    const note = this.notes().find((n) => n.id === this.openId());
    return note && { ...note, when: when(note.updated, Date.now()) };
  });

  constructor() {
    // The saved notes come back with the newest one open
    persist(STORAGE_KEY, this.notes, (saved) => {
      if (!Array.isArray(saved) || !saved.length) return;
      this.notes.set(saved);
      this.openId.set(this.list()[0].id);
    });
  }

  protected add() {
    const id = Math.max(0, ...this.notes().map((n) => n.id)) + 1;
    this.notes.update((list) => [...list, { id, html: '', updated: Date.now() }]);
    this.openId.set(id);
    this.query.set('');
  }

  protected edit(html: string) {
    const id = this.openId();
    this.notes.update((list) =>
      list.map((n) => (n.id === id && n.html !== html ? { ...n, html, updated: Date.now() } : n)),
    );
  }

  protected remove() {
    const left = this.notes().filter((n) => n.id !== this.openId());
    this.notes.set(left.length ? left : [{ id: 1, html: '', updated: Date.now() }]);
    this.openId.set(this.list()[0].id);
  }
}
