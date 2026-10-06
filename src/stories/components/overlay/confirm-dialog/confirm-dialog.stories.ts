import type { Meta, StoryObj } from '@storybook/angular-vite';
import { moduleMetadata } from '@storybook/angular-vite';

import { ConfirmDialogComponent } from './confirm-dialog.component';
import {
  type ConfirmDemoAction,
  ConfirmDialogDemoComponent,
} from './confirm-dialog-demo.component';
import { appearanceStories } from '../../../utils/appearance-stories';
import { TONES } from '../../../utils/types';
import { DIALOG_VARIANTS } from '../dialog/dialog.component';

const meta: Meta<ConfirmDialogComponent> = {
  title: 'Components/Overlay/Confirm Dialog',
  component: ConfirmDialogComponent,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [ConfirmDialogDemoComponent] })],
  argTypes: { variant: { control: 'select', options: DIALOG_VARIANTS } },
  args: { variant: 'default' },
  parameters: {
    docs: {
      story: { inline: false, height: '320px' },
      description: {
        component:
          'Open it from code with `inject(ConfirmationService).confirm({ message, header, accept, reject })`. ' +
          'Confirmations without a `target` show here; ones with a `target` show in ConfirmPopup.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<ConfirmDialogComponent>;

/** Demo buttons are passed as props, not args, to keep them out of the Controls panel */
const renderWith =
  (
    actions: ConfirmDemoAction[],
    dialogs = `<np-confirm-dialog [key]="key" [variant]="variant" />`,
  ): Story['render'] =>
  (args) => ({
    props: { ...args, actions, variants: DIALOG_VARIANTS },
    template: `${dialogs}<np-confirm-dialog-demo [actions]="actions" />`,
  });

const ask = { header: 'Turn on AI drafts?', message: 'Replies are drafted for you to review.' };

export const Default: Story = {
  render: renderWith([
    {
      label: 'Save',
      primary: true,
      options: {
        header: 'Confirmation',
        message: 'Are you sure you want to proceed?',
        icon: 'triangle-alert',
      },
    },
    {
      label: 'Delete',
      options: {
        header: 'Delete Confirmation',
        message: 'Do you want to delete this record?',
        icon: 'info',
        acceptTone: 'danger',
      },
    },
  ]),
};

export const CustomLabels: Story = {
  render: renderWith([
    {
      label: 'Leave page',
      primary: true,
      options: {
        header: 'Unsaved changes',
        message: 'You have unsaved changes. Leave without saving?',
        icon: 'circle-help',
        acceptLabel: 'Leave',
        rejectLabel: 'Stay',
        acceptTone: 'danger',
      },
    },
  ]),
};

/** Per-confirm `tone`: a round badge with the tone's glyph (or `icon`); danger turns Yes red */
export const Tones: Story = {
  render: renderWith(TONES.map((tone) => ({ label: tone, options: { ...ask, tone } }))),
};

/** `confirmText`: Yes stays disabled until the project name is typed */
export const TypeToConfirm: Story = {
  args: { variant: 'hero' },
  render: renderWith([
    {
      label: 'Delete project',
      options: { tone: 'danger', confirmText: 'nexprime-ui', message: 'Delete the project?' },
    },
  ]),
};

/** Every dialog look, one ConfirmDialog per `key` */
export const Variants: Story = {
  render: renderWith(
    DIALOG_VARIANTS.map((key) => ({
      label: key,
      options: { ...ask, key, tone: 'info', icon: 'sparkles' },
    })),
    `@for (v of variants; track v) { <np-confirm-dialog [key]="v" [variant]="v" /> }`,
  ),
};

/** The appearance classes from theme.css (np-color-*, np-shape-*) on the Default example */
const appearance = appearanceStories(meta, Default);
export const AppearanceColors = appearance.colors;
export const AppearanceShapes = appearance.shapes;
