import { Component, booleanAttribute, computed, input, output } from '@angular/core';

import {
  APPEARANCE_COLORS,
  APPEARANCE_SHAPES,
  type AppearanceColor,
  type AppearanceShape,
  type Size,
} from '../../../utils/types';
import { IconComponent } from '../../media/icon/icon.component';

/** Button's colors and shapes are the appearance classes' (np-color-*, np-shape-*) */
export const BUTTON_SEVERITIES = APPEARANCE_COLORS;
export type ButtonSeverity = AppearanceColor;

export const BUTTON_VARIANTS = ['solid', 'outlined', 'text', 'soft'] as const;
export type ButtonVariant = (typeof BUTTON_VARIANTS)[number];

export const BUTTON_SHAPES = APPEARANCE_SHAPES;
export type ButtonShape = AppearanceShape;

const ICON_SIZES: Record<Size, number> = { small: 14, medium: 16, large: 18 };

@Component({
  selector: 'np-button',
  imports: [IconComponent],
  templateUrl: './button.html',
  styleUrl: './button.css',
})
export class ButtonComponent {
  /** Is this the principal call to action on the page? (the primary severity, when no severity is set) */
  readonly primary = input(false, { transform: booleanAttribute });

  /** Color: primary | secondary | success | info | warning | danger | help | contrast */
  readonly severity = input<ButtonSeverity | ''>('');

  /** Style: solid (filled), outlined, text (no background) or soft (tinted background) */
  readonly variant = input<ButtonVariant>('solid');

  /** Corners: pill (fully round), rounded (small radius) or square */
  readonly shape = input<ButtonShape>('pill');

  /** What background color to use (overrides the severity's) */
  readonly backgroundColor = input<string>();

  /** How large should the button be? */
  readonly size = input<Size>('medium');

  /** Button contents. Leave empty for an icon-only button (then set `ariaLabel`) */
  readonly label = input('Button');

  /** Icon file name, e.g. 'check' */
  readonly icon = input('');

  /** Which side of the label the icon is on */
  readonly iconPos = input<'left' | 'right'>('left');

  /** Shows a spinner instead of the icon and blocks clicks */
  readonly loading = input(false, { transform: booleanAttribute });

  /** Disables the button */
  readonly disabled = input(false, { transform: booleanAttribute });

  /** Accessible name, for icon-only buttons */
  readonly ariaLabel = input('');

  /** Optional click handler */
  readonly clicked = output<Event>();

  protected readonly iconSize = computed(() => ICON_SIZES[this.size()]);

  protected readonly classes = computed(() => [
    'np-button--' + this.size(),
    'np-button--' + (this.severity() || (this.primary() ? 'primary' : 'secondary')),
    'np-button--' + this.variant(),
    'np-button--' + this.shape(),
    this.label() ? '' : 'np-button--icon-only',
  ]);
}
