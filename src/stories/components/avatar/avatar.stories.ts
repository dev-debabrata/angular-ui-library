import type { Meta, StoryObj } from '@storybook/angular-vite';

import { SIZES } from '../../types';
import { AvatarComponent } from './avatar.component';

const meta: Meta<AvatarComponent> = {
  title: 'Components/Avatar',
  component: AvatarComponent,
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'select', options: SIZES },
    status: { control: 'select', options: ['', 'online', 'away', 'offline'] },
  },
  args: { name: 'Jane Doe' },
};

export default meta;
type Story = StoryObj<AvatarComponent>;

export const Initials: Story = {};

export const WithImage: Story = { args: { src: 'https://i.pravatar.cc/128?img=5' } };

export const WithStatus: Story = { args: { status: 'online', size: 'large' } };

export const Small: Story = { args: { size: 'small' } };

export const Large: Story = { args: { size: 'large' } };

/** Every name gets its own gradient color */
export const Group: Story = {
  render: () => ({
    props: { names: ['Jane Doe', 'John Smith', 'Alex Lee', 'Sam Patel', 'Maria Garcia'] },
    template: `
      <div style="display: flex; gap: 12px">
        @for (name of names; track name) {
          <nex-avatar [name]="name" />
        }
      </div>
    `,
  }),
};
