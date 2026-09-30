import type { Meta, StoryObj } from '@storybook/angular-vite';
import { moduleMetadata } from '@storybook/angular-vite';

import { ButtonComponent } from '../button/button.component';
import { ModalComponent } from './modal.component';

const meta: Meta<ModalComponent> = {
  title: 'Components/Modal',
  component: ModalComponent,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [ButtonComponent] })],
  parameters: {
    docs: {
      story: { inline: false, height: '320px' },
    },
  },
  render: (args) => ({
    props: args,
    template: `
      <storybook-button label="Open modal" [primary]="true" (onClick)="open = true" />
      <nex-modal [(open)]="open" [title]="title">
        This is the modal content. Click outside, press Escape, or click × to close.
      </nex-modal>
    `,
  }),
};

export default meta;
type Story = StoryObj<ModalComponent>;

export const Default: Story = { args: { open: false, title: 'Modal Title' } };

export const Open: Story = { args: { open: true, title: 'Modal Title' } };
