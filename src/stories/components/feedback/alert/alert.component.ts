import { Component, booleanAttribute, input, output, signal } from '@angular/core';

import { TONE_ICONS, type Tone } from '../../../utils/types';
import { IconComponent } from '../../media/icon/icon.component';

/** Looks of the alert */
export const ALERT_VARIANTS = [
  'default',
  'solid',
  'outlined',
  'accent',
  'glass',
  'banner',
] as const;
export type AlertVariant = (typeof ALERT_VARIANTS)[number];

@Component({
  selector: 'np-alert',
  imports: [IconComponent],
  templateUrl: './alert.html',
  styleUrl: './alert.css',
  host: { '[hidden]': "state() === 'closed'" },
})
export class AlertComponent {
  /** Color tone of the alert */
  readonly type = input<Tone>('info');

  /** Bold heading shown above the message */
  readonly title = input('');

  /** Alert text */
  readonly message = input('');

  /** Show a close button? */
  readonly dismissible = input(false, { transform: booleanAttribute });

  /** Emits when the close button is clicked */
  readonly dismiss = output<void>();

  /** Look: default (soft), solid, outlined, accent (thick tone bar on a surface), glass (frosted) or banner (full width, square) */
  readonly variant = input<AlertVariant>('default');
  /** Icon file name from src/stories/icons/svg shown instead of the tone glyph */
  readonly icon = input('');
  /** Smaller padding and text */
  readonly compact = input(false, { transform: booleanAttribute });
  /** Show a close button that animates the alert out and removes it (then emits dismiss) */
  readonly closable = input(false, { transform: booleanAttribute });

  protected readonly icons = TONE_ICONS;
  /** closable: '' while shown, then closing (exit animation), then closed (hidden) */
  protected readonly state = signal<'' | 'closing' | 'closed'>('');
  protected close = () => (this.closable() ? this.state.set('closing') : this.dismiss.emit());
}
