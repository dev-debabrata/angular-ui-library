import { Component, booleanAttribute, input, output } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';

import { AvatarComponent } from '../../media/avatar/avatar.component';

/** Looks of the card */
export const CARD_VARIANTS = [
  'default',
  'elevated',
  'outlined',
  'glass',
  'gradient',
  'glow',
] as const;
export type CardVariant = (typeof CARD_VARIANTS)[number];

@Component({
  selector: 'np-card',
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

  /** Look: default (accent bar), elevated, outlined, glass (frosted), gradient (gradient border) or glow (glows on hover) */
  readonly variant = input<CardVariant>('default');
  /** Image on the left, content on the right */
  readonly horizontal = input(false, { transform: booleanAttribute });
  /** Title and subtitle over the bottom of the image (image on top) */
  readonly overlay = input(false, { transform: booleanAttribute });
  /** Label in a pill on the top-right corner, e.g. 'New' */
  readonly badge = input('');
  /** Make the whole card a link to this URL */
  readonly href = input('');
  /** Make the whole card a button that emits cardClick */
  readonly clickable = input(false, { transform: booleanAttribute });
  /** Show a skeleton placeholder instead of the content */
  readonly loading = input(false, { transform: booleanAttribute });
  /** Emitted when a clickable card is clicked */
  readonly cardClick = output<MouseEvent>();
}
