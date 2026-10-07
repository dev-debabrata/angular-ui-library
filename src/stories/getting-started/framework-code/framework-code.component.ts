import { Component, computed, input, signal } from '@angular/core';

import { ButtonToggleComponent } from '../../components/form/button-toggle/button-toggle.component';
import { IconComponent } from '../../components/media/icon/icon.component';
import { copyToClipboard } from '../../utils/clipboard';
import {
  FRAMEWORK,
  FRAMEWORKS,
  setupCode,
  setupNote,
  type Framework,
} from '../../utils/framework-code';
import { PAGES, managerHref } from '../landing';

/** Framework tabs (Angular, React, Next.js, Vue, HTML) over copyable code, with a one-line setup note */
@Component({
  selector: 'np-framework-code',
  imports: [ButtonToggleComponent, IconComponent],
  templateUrl: './framework-code.html',
  styleUrl: './framework-code.css',
})
export class FrameworkCodeComponent {
  /** The code for each framework */
  readonly code = input.required<Record<Framework, string>>();

  /** Angular class to import, named in the Angular note (empty for CSS-only code) */
  readonly angularImport = input('');

  /** React component/icon to import, named in the React/Next note and setup code */
  readonly reactImport = input('');

  protected readonly frameworks = FRAMEWORKS;
  protected readonly framework = FRAMEWORK;
  protected readonly guide = managerHref(PAGES.getStarted);
  protected readonly copied = signal(false);

  protected readonly setup = computed(() => ({
    note: setupNote(this.framework(), this.angularImport(), this.reactImport()),
    code: setupCode(this.framework(), this.reactImport()),
  }));

  protected pick(value: unknown) {
    if (value) this.framework.set(value as Framework);
  }

  protected async copy() {
    await copyToClipboard(this.code()[this.framework()]);
    this.copied.set(true);
    setTimeout(() => this.copied.set(false), 1500);
  }
}
