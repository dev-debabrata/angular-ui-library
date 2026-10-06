import { argsToTemplate, type Meta, type StoryObj } from '@storybook/angular-vite';
import { moduleMetadata } from '@storybook/angular-vite';
import { fn } from 'storybook/test';

import { IconComponent } from '../../media/icon/icon.component';
import { BottomSheetComponent } from './bottom-sheet.component';

/** Trigger button + sheet with the story's args bound; `body` goes inside the sheet */
const sheet = <A extends object>(args: A, trigger: string, body: string) => `
  <button type="button" class="ui-btn ui-btn--primary" (click)="visible = true">${trigger}</button>
  <np-bottom-sheet [(visible)]="visible" ${argsToTemplate(args, { exclude: ['visible' as keyof A] })}>
    ${body}
  </np-bottom-sheet>
`;

/** Material-style action list rows */
const actions = [
  ['link', 'Copy link', 'Share a link to this page'],
  ['mail', 'Email', 'Send by email'],
  ['share-2', 'Share', 'Open the share menu'],
  ['printer', 'Print', 'Print this page'],
  ['download', 'Download', 'Save a PDF copy'],
];
const actionList = `
  <ul style="margin: 0; padding: 0; list-style: none">
    @for (a of actions; track a[1]) {
      <li>
        <button type="button" (click)="visible = false"
          style="display: flex; align-items: center; gap: 16px; width: 100%; padding: 12px 8px; border: none;
                 border-radius: var(--ui-radius); background: none; font: inherit; text-align: left; cursor: pointer">
          <span style="display: grid; place-items: center; width: 40px; height: 40px; border-radius: 50%;
                       background: var(--ui-primary-soft); color: var(--ui-primary)">
            <np-icon [name]="a[0]" [size]="18" />
          </span>
          <span style="display: flex; flex-direction: column">
            <b style="font-size: 15px">{{ a[1] }}</b>
            <small style="color: var(--ui-text-muted)">{{ a[2] }}</small>
          </span>
        </button>
      </li>
    }
  </ul>
`;

const meta: Meta<BottomSheetComponent> = {
  title: 'Components/Overlay/Bottom Sheet',
  component: BottomSheetComponent,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [IconComponent] })],
  parameters: { docs: { story: { inline: false, height: '460px' } } },
  args: { visible: false, show: fn(), hide: fn() },
  render: (args) => ({
    props: { ...args, actions },
    template: sheet(args, 'Open bottom sheet', actionList),
  }),
};

export default meta;
type Story = StoryObj<BottomSheetComponent>;

/** List of actions, like Material's bottom sheet overview */
export const Default: Story = {};

export const WithHeader: Story = { args: { header: 'Share this page' } };

/** Long content scrolls inside the sheet */
export const LongContent: Story = {
  args: { header: 'Terms of service', maxHeight: '50vh' },
  render: (args) => ({
    props: { ...args, paragraphs: Array.from({ length: 12 }, (_, i) => i + 1) },
    template: sheet(
      args,
      'Read terms',
      `@for (p of paragraphs; track p) {
         <p style="margin: 0 8px 14px; color: var(--ui-text-muted); line-height: 1.6">
           {{ p }}. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore.
         </p>
       }`,
    ),
  }),
};

/** Only closes from its own buttons */
export const NotDismissable: Story = {
  args: { header: 'Confirm your choice', dismissable: false, showHandle: false },
  render: (args) => ({
    props: args,
    template: sheet(
      args,
      'Open',
      `<p style="margin: 0 8px 16px; color: var(--ui-text-muted)">This sheet ignores backdrop clicks, Escape and dragging.</p>
       <div style="display: grid; grid-auto-flow: column; grid-auto-columns: 1fr; gap: 10px; padding: 0 8px">
         <button type="button" class="ui-btn" (click)="visible = false">Cancel</button>
         <button type="button" class="ui-btn ui-btn--primary" (click)="visible = false">Confirm</button>
       </div>`,
    ),
  }),
};
