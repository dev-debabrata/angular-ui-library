import type { Meta, StoryObj } from '@storybook/angular-vite';
import { fn } from 'storybook/test';

import { HeaderComponent } from './header.component';

const meta: Meta<HeaderComponent> = {
  title: 'Components/Header',
  component: HeaderComponent,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  args: { onLogin: fn(), onLogout: fn(), onCreateAccount: fn() },
};

export default meta;
type Story = StoryObj<HeaderComponent>;

export const LoggedIn: Story = { args: { user: { name: 'Jane Doe' } } };

export const LoggedOut: Story = {};
