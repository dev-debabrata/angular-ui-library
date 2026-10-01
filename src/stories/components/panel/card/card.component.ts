import { Component, input } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';

import { AvatarComponent } from '../../media/avatar/avatar.component';

@Component({
  selector: 'nex-card',
  imports: [NgTemplateOutlet, AvatarComponent],
  templateUrl: './card.html',
  styleUrl: './card.css',
})
export class CardComponent {
  /** Card heading */
  readonly title = input('');

  /** Smaller text shown under the heading */
  readonly subtitle = input('');

  /** Image URL shown edge to edge */
  readonly image = input('');

  /** Alt text for the image */
  readonly imageAlt = input('');

  /** 'top': image above everything. 'below-header': image between the header and the content */
  readonly imagePosition = input<'top' | 'below-header'>('top');

  /** Image height (any CSS length) */
  readonly imageHeight = input('200px');

  /** Avatar image URL shown next to the title and subtitle */
  readonly avatar = input('');

  /** Footer buttons: 'start' (left), 'end' (right) or 'stretch' (equal widths) */
  readonly footerAlign = input<'start' | 'end' | 'stretch'>('start');
}
