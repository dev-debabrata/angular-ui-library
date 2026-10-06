import type { Meta, StoryObj } from '@storybook/angular-vite';

import { SIZES } from '../../../utils/types';
import { AVATAR_VARIANTS, AvatarComponent } from './avatar.component';
import { appearanceStories } from '../../../utils/appearance-stories';

const meta: Meta<AvatarComponent> = {
  title: 'Components/Media/Avatar',
  component: AvatarComponent,
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'select', options: SIZES },
    status: { control: 'select', options: ['', 'online', 'away', 'busy', 'offline'] },
    variant: { control: 'select', options: AVATAR_VARIANTS },
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

/** Every name gets its own gradient color. `stacked` avatars overlap like a team list, ended by a `more` "+N". Without an image or a name, an `icon` stands in */
export const Group: Story = {
  render: () => ({
    props: { names: ['Jane Doe', 'John Smith', 'Alex Lee', 'Sam Patel', 'Maria Garcia'] },
    template: `
      <div style="display: flex; gap: 12px">
        @for (name of names; track name) {
          <np-avatar [name]="name" />
        }
      </div>
      <div style="display: flex; margin-top: 24px">
        @for (name of names; track name) { <np-avatar [name]="name" stacked /> }
        <np-avatar icon="user" stacked />
        <np-avatar [more]="8" stacked />
      </div>
    `,
  }),
};

/** Every look with initials and with an image, on a colorful background so the glass look shows */
export const Variants: Story = {
  render: (args) => ({
    props: { ...args, variants: AVATAR_VARIANTS },
    template: `<div style="display: grid; grid: repeat(2, auto) / auto-flow max-content; gap: 20px 28px; padding: 24px; border-radius: 16px; background: var(--ui-gradient)">
      @for (v of variants; track v) {
        <np-avatar [name]="name" [variant]="v" size="large" status="online" />
        <np-avatar [name]="name" [variant]="v" size="large" src="https://i.pravatar.cc/128?img=12" />
      }
    </div>`,
  }),
};

/** The appearance classes from theme.css (np-color-*, np-shape-*) on the Initials example */
const appearance = appearanceStories(meta, Initials);
export const AppearanceColors = appearance.colors;
export const AppearanceShapes = appearance.shapes;
