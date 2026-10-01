import type { Meta, StoryObj } from '@storybook/angular-vite';
import { expect, userEvent, within } from 'storybook/test';

import { PageComponent } from './page.component';

const meta: Meta<PageComponent> = {
  title: 'Components/Misc/Page',
  component: PageComponent,
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<PageComponent>;

export const LoggedOut: Story = {};

/** Clicks "Log in" and checks that the header switches to the logged-in state */
export const LoggedIn: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const loginButton = canvas.getByRole('button', { name: /Log in/i });
    await expect(loginButton).toBeInTheDocument();
    await userEvent.click(loginButton);
    await expect(loginButton).not.toBeInTheDocument();

    const logoutButton = canvas.getByRole('button', { name: /Log out/i });
    await expect(logoutButton).toBeInTheDocument();
  },
};
