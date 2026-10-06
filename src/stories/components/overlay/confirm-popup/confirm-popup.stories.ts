import type { Meta, StoryObj } from '@storybook/angular-vite';
import { argsToTemplate, moduleMetadata } from '@storybook/angular-vite';

import {
  type ConfirmDemoAction,
  ConfirmDialogDemoComponent,
} from '../confirm-dialog/confirm-dialog-demo.component';
import { CONFIRM_POPUP_VARIANTS, ConfirmPopupComponent } from './confirm-popup.component';
import { TONES } from '../../../utils/types';
import { appearanceStories } from '../../../utils/appearance-stories';

/** Demo buttons are passed as props, not args, to keep them out of the Controls panel */
const actions: ConfirmDemoAction[] = [
  {
    label: 'Save',
    primary: true,
    options: { message: 'Are you sure you want to proceed?', icon: 'triangle-alert' },
  },
  {
    label: 'Delete',
    options: { message: 'Do you want to delete this record?', icon: 'info', acceptTone: 'danger' },
  },
];

const meta: Meta<ConfirmPopupComponent> = {
  title: 'Components/Overlay/Confirm Popup',
  component: ConfirmPopupComponent,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [ConfirmDialogDemoComponent] })],
  argTypes: {
    variant: { control: 'select', options: CONFIRM_POPUP_VARIANTS },
    tone: { control: 'select', options: ['', ...TONES] },
  },
  args: { variant: 'default', tone: '', acceptLabel: 'Yes', rejectLabel: 'No' },
  parameters: {
    docs: {
      story: { inline: false, height: '260px' },
      description: {
        component:
          'Call `inject(ConfirmationService).confirm({ target: event.currentTarget, message, accept, reject })` ' +
          'to show a confirmation anchored to the clicked element. Click outside or press Escape to reject.',
      },
    },
  },
  render: (args) => ({
    props: { ...args, actions },
    template: `<np-confirm-popup ${argsToTemplate(args)} /><np-confirm-dialog-demo [actions]="actions" [popup]="true" />`,
  }),
};

export default meta;
type Story = StoryObj<ConfirmPopupComponent>;

export const Default: Story = {};

/** `acceptLabel` and `rejectLabel` set the default button texts (confirm options still win) */
export const Labels: Story = {
  args: { tone: 'warning', acceptLabel: 'Discard', rejectLabel: 'Keep' },
};

/** Every variant (compact is one row), then every `tone` (round tone icon; danger turns Accept red), with a `header` */
export const Variants: Story = {
  render: (args) => ({
    props: {
      ...args,
      variants: CONFIRM_POPUP_VARIANTS,
      tones: TONES,
      actions: [...CONFIRM_POPUP_VARIANTS, ...TONES].map((key) => ({
        label: key,
        options: { key, header: 'Delete project?', message: 'This removes all of its files.' },
      })),
    },
    template: `
      @for (v of variants; track v) { <np-confirm-popup [key]="v" [variant]="v" /> }
      @for (t of tones; track t) { <np-confirm-popup [key]="t" [tone]="t" /> }
      <np-confirm-dialog-demo [actions]="actions" [popup]="true" />
    `,
  }),
};

/** The appearance classes from theme.css (np-color-*, np-shape-*) on the Default example */
const appearance = appearanceStories(meta, Default);
export const AppearanceColors = appearance.colors;
export const AppearanceShapes = appearance.shapes;
