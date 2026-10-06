/** Components the Playground (Getting Started ▸ Playground) can show, with a control per input. Not part of the library */
import type { Type } from '@angular/core';

import { CheckboxComponent } from '../../components/form/checkbox/checkbox.component';
import { ChipComponent } from '../../components/form/chip/chip.component';
import {
  BUTTON_SEVERITIES,
  BUTTON_SHAPES,
  BUTTON_VARIANTS,
  ButtonComponent,
} from '../../components/form/button/button.component';
import { SearchInputComponent } from '../../components/form/search-input/search-input.component';
import { TextInputComponent } from '../../components/form/text-input/text-input.component';
import { TextareaComponent } from '../../components/form/textarea/textarea.component';
import { ToggleComponent } from '../../components/form/toggle/toggle.component';
import { AlertComponent } from '../../components/feedback/alert/alert.component';
import { ProgressBarComponent } from '../../components/feedback/progress-bar/progress-bar.component';
import { SkeletonComponent } from '../../components/feedback/skeleton/skeleton.component';
import { SpinnerComponent } from '../../components/feedback/spinner/spinner.component';
import { AvatarComponent } from '../../components/media/avatar/avatar.component';
import { BadgeComponent } from '../../components/media/badge/badge.component';
import { ICON_VARIANTS, IconComponent } from '../../components/media/icon/icon.component';
import { TagComponent } from '../../components/media/tag/tag.component';
import { SIZES, TONES } from '../../utils/types';

/**
 * One input of a component. `value` is what the Playground starts with; `fallback` is the component's own default,
 * left out of the generated code (defaults to `value`'s empty form: '', false)
 */
export type Control =
  | { name: string; type: 'text'; value: string; fallback?: string }
  | { name: string; type: 'boolean'; value: boolean; fallback?: boolean }
  | { name: string; type: 'number'; value: number; fallback?: number; min?: number; max?: number; step?: number }
  | { name: string; type: 'select'; value: string; fallback?: string; options: readonly string[] };

export interface PlaygroundItem {
  /** Name without the np- prefix */
  tag: string;
  label: string;
  group: string;
  component: Type<unknown>;
  /** Class name for the Angular import */
  className: string;
  /** Shown at its own size in the preview (buttons, badges); the others (fields, bars, alerts) get a fixed width */
  compact?: boolean;
  controls: Control[];
}

const text = (name: string, value: string, fallback = ''): Control => ({ name, type: 'text', value, fallback });
const bool = (name: string, value = false, fallback = false): Control => ({ name, type: 'boolean', value, fallback });
const select = (name: string, options: readonly string[], value: string, fallback = value): Control => ({
  name,
  type: 'select',
  value,
  fallback,
  options,
});

export const PLAYGROUND: PlaygroundItem[] = [
  {
    tag: 'button',
    compact: true,
    label: 'Button',
    group: 'Form',
    component: ButtonComponent,
    className: 'ButtonComponent',
    controls: [
      text('label', 'Get started', 'Button'),
      select('severity', ['', ...BUTTON_SEVERITIES], 'primary', ''),
      select('variant', BUTTON_VARIANTS, 'solid'),
      select('shape', BUTTON_SHAPES, 'pill'),
      select('size', SIZES, 'medium'),
      text('icon', 'arrow-right'),
      select('iconPos', ['left', 'right'], 'right', 'left'),
      bool('loading'),
      bool('disabled'),
    ],
  },
  {
    tag: 'text-input',
    label: 'Text Input',
    group: 'Form',
    component: TextInputComponent,
    className: 'TextInputComponent',
    controls: [
      text('label', 'Email'),
      text('placeholder', 'you@example.com'),
      select('type', ['text', 'email', 'password', 'number', 'tel', 'url'], 'email', 'text'),
      text('hint', 'We never share it.'),
      text('error', ''),
      bool('required'),
      bool('disabled'),
    ],
  },
  {
    tag: 'textarea',
    label: 'Textarea',
    group: 'Form',
    component: TextareaComponent,
    className: 'TextareaComponent',
    controls: [
      text('label', 'Message'),
      text('placeholder', 'Write something…'),
      { name: 'rows', type: 'number', value: 4, fallback: 4, min: 1, max: 12 },
      bool('disabled'),
    ],
  },
  {
    tag: 'toggle',
    compact: true,
    label: 'Toggle',
    group: 'Form',
    component: ToggleComponent,
    className: 'ToggleComponent',
    controls: [text('label', 'Email notifications'), bool('disabled')],
  },
  {
    tag: 'checkbox',
    compact: true,
    label: 'Checkbox',
    group: 'Form',
    component: CheckboxComponent,
    className: 'CheckboxComponent',
    controls: [text('label', 'Remember me'), bool('disabled')],
  },
  {
    tag: 'chip',
    compact: true,
    label: 'Chip',
    group: 'Form',
    component: ChipComponent,
    className: 'ChipComponent',
    controls: [text('label', 'Angular'), text('icon', 'sparkles'), bool('removable', true), bool('disabled')],
  },
  {
    tag: 'search-input',
    label: 'Search Input',
    group: 'Form',
    component: SearchInputComponent,
    className: 'SearchInputComponent',
    controls: [text('placeholder', 'Search components…', 'Search...'), bool('disabled')],
  },
  {
    tag: 'badge',
    compact: true,
    label: 'Badge',
    group: 'Media',
    component: BadgeComponent,
    className: 'BadgeComponent',
    controls: [text('label', 'New', 'Badge'), select('variant', TONES, 'success', 'info'), bool('pill', true)],
  },
  {
    tag: 'tag',
    compact: true,
    label: 'Tag',
    group: 'Media',
    component: TagComponent,
    className: 'TagComponent',
    controls: [
      text('value', 'Featured', 'Tag'),
      select('severity', ['primary', ...TONES], 'primary'),
      text('icon', 'star'),
      bool('rounded'),
    ],
  },
  {
    tag: 'avatar',
    compact: true,
    label: 'Avatar',
    group: 'Media',
    component: AvatarComponent,
    className: 'AvatarComponent',
    controls: [
      text('name', 'Ada Lovelace'),
      select('size', SIZES, 'large', 'medium'),
      select('status', ['', 'online', 'away', 'offline'], 'online', ''),
    ],
  },
  {
    tag: 'icon',
    compact: true,
    label: 'Icon',
    group: 'Media',
    component: IconComponent,
    className: 'IconComponent',
    controls: [
      text('name', 'rocket'),
      { name: 'size', type: 'number', value: 40, fallback: 20, min: 12, max: 96, step: 4 },
      select('variant', ICON_VARIANTS, 'gradient', 'outline'),
    ],
  },
  {
    tag: 'alert',
    label: 'Alert',
    group: 'Feedback',
    component: AlertComponent,
    className: 'AlertComponent',
    controls: [
      select('type', TONES, 'success', 'info'),
      text('title', 'Saved'),
      text('message', 'Your changes are live.'),
      bool('dismissible', true),
    ],
  },
  {
    tag: 'progress-bar',
    label: 'Progress Bar',
    group: 'Feedback',
    component: ProgressBarComponent,
    className: 'ProgressBarComponent',
    controls: [
      { name: 'value', type: 'number', value: 64, fallback: 0, min: 0, max: 100, step: 5 },
      select('variant', TONES, 'info'),
      bool('showLabel', true, true),
    ],
  },
  {
    tag: 'spinner',
    compact: true,
    label: 'Spinner',
    group: 'Feedback',
    component: SpinnerComponent,
    className: 'SpinnerComponent',
    controls: [select('size', SIZES, 'large', 'medium'), text('label', 'Loading…')],
  },
  {
    tag: 'skeleton',
    label: 'Skeleton',
    group: 'Feedback',
    component: SkeletonComponent,
    className: 'SkeletonComponent',
    controls: [
      select('shape', ['rectangle', 'circle'], 'rectangle'),
      text('width', '240px', '100%'),
      text('height', '1rem', '1rem'),
      select('animation', ['wave', 'pulse', 'none'], 'wave'),
    ],
  },
];
