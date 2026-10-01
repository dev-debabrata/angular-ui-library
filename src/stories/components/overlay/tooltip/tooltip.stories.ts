import type { Meta, StoryObj } from '@storybook/angular-vite';
import { moduleMetadata } from '@storybook/angular-vite';

import { ButtonComponent } from '../../form/button/button.component';
import { TooltipComponent } from './tooltip.component';

const meta: Meta<TooltipComponent> = {
  title: 'Components/Overlay/Tooltip',
  component: TooltipComponent,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [ButtonComponent] })],
  argTypes: {
    position: {
      control: 'select',
      options: ['top', 'bottom', 'left', 'right'],
    },
  },
  args: {
    text: 'This is a tooltip',
  },
  render: (args) => ({
    props: args,
    template: `
      <div style="padding: 60px 120px; display: inline-block">
        <nex-tooltip [text]="text" [position]="position">
          <storybook-button label="Hover me" />
        </nex-tooltip>
      </div>
    `,
  }),
};

export default meta;
type Story = StoryObj<TooltipComponent>;

export const Top: Story = { args: { position: 'top' } };

export const Bottom: Story = { args: { position: 'bottom' } };

export const Left: Story = { args: { position: 'left' } };

export const Right: Story = { args: { position: 'right' } };
