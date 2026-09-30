import type { Meta, StoryObj } from '@storybook/angular-vite';
import { fn } from 'storybook/test';

import { TabsComponent } from './tabs.component';

const meta: Meta<TabsComponent> = {
  title: 'Components/Tabs',
  component: TabsComponent,
  tags: ['autodocs'],
  args: {
    tabs: [
      { id: 'profile', label: 'Profile', content: 'Profile settings go here.' },
      { id: 'account', label: 'Account', content: 'Account settings go here.' },
      { id: 'billing', label: 'Billing', content: 'Billing details go here.' },
    ],
    activeTabChange: fn(),
  },
};

export default meta;
type Story = StoryObj<TabsComponent>;

export const Default: Story = { args: { activeTab: 'profile' } };

export const SecondTabActive: Story = { args: { activeTab: 'account' } };
