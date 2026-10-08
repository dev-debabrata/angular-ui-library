import { Component, ElementRef, computed, signal, viewChild } from '@angular/core';

import { IconComponent } from '../../components/media/icon/icon.component';
import { TextEditorComponent } from '../text-editor.component';
import { persist, plainText, toggleFullscreen, wordCount } from './text-editor-page-utils';

/** Where the text and the goal are kept between visits (this browser only) */
const STORAGE_KEY = 'np-text-editor-focus';
const GOALS = [250, 500, 1000, 2000];

/**
 * The Text Editor page's Focus mode: a dark, distraction-free page without a toolbar (Markdown shortcuts still work),
 * a word goal with a progress bar, and full screen. Not part of the library
 */
@Component({
  selector: 'np-text-editor-focus',
  imports: [IconComponent, TextEditorComponent],
  templateUrl: './text-editor-focus.html',
  styleUrl: './text-editor-focus.css',
  host: { '(document:fullscreenchange)': 'fullscreen.set(isFullscreen())' },
})
export class TextEditorFocusComponent {
  protected readonly goals = GOALS;
  protected readonly text = signal('');
  protected readonly goal = signal(500);
  protected readonly fullscreen = signal(false);
  protected readonly words = computed(() => wordCount(plainText(this.text())));
  protected readonly progress = computed(() => Math.min(100, (this.words() / this.goal()) * 100));

  private readonly page = viewChild.required<ElementRef<HTMLElement>>('page');

  constructor() {
    persist(
      STORAGE_KEY,
      () => ({ html: this.text(), goal: this.goal() }),
      (saved) => {
        this.text.set(saved.html ?? '');
        if (GOALS.includes(saved.goal)) this.goal.set(saved.goal);
      },
    );
  }

  protected isFullscreen() {
    return !!document.fullscreenElement;
  }

  protected toggleFullscreen() {
    toggleFullscreen(this.page().nativeElement);
  }
}
