import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular-vite';
import { fn } from 'storybook/test';

import { TAB_VARIANTS, TabsComponent, type Tab } from './tabs.component';
import { appearanceStories } from '../../../utils/appearance-stories';

const tabs: Tab[] = [
  { id: 'profile', label: 'Profile', content: 'Profile settings go here.' },
  { id: 'account', label: 'Account', content: 'Account settings go here.' },
  { id: 'billing', label: 'Billing', content: 'Billing details go here.' },
];

const withIcons: Tab[] = [
  { id: 'inbox', label: 'Inbox', icon: 'inbox', badge: 12, content: 'Your messages.' },
  { id: 'starred', label: 'Starred', icon: 'star', content: 'Messages you starred.' },
  { id: 'sent', label: 'Sent', icon: 'send', content: 'Messages you sent.' },
  { id: 'spam', label: 'Spam', icon: 'shield-alert', disabled: true, content: 'Nothing here.' },
];

const meta: Meta<TabsComponent> = {
  title: 'Components/Panel/Tabs',
  component: TabsComponent,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [TabsComponent] })],
  argTypes: { variant: { control: 'select', options: TAB_VARIANTS } },
  args: { tabs, activeTabChange: fn() },
};

export default meta;
type Story = StoryObj<TabsComponent>;

export const Default: Story = { args: { activeTab: 'profile' } };

/** `variant`: pill (default), underline, boxed, solid and minimal */
export const Variants: Story = {
  render: (args) => ({
    props: { ...args, variants: TAB_VARIANTS },
    template: `<div style="display: grid; gap: 28px">
  @for (v of variants; track v) {
    <np-tabs [variant]="v" [tabs]="tabs" activeTab="profile" />
  }
</div>`,
  }),
};

/** Icons, a badge and a disabled tab */
export const IconsAndBadges: Story = {
  args: { tabs: withIcons, activeTab: 'inbox', variant: 'underline' },
};

/** `vertical`: the tabs in a column beside the content */
export const Vertical: Story = {
  args: { tabs: withIcons, activeTab: 'inbox', variant: 'boxed', vertical: true },
};

/** `stretch`: the tabs share the full width */
export const Stretch: Story = { args: { activeTab: 'account', variant: 'solid', stretch: true } };

export const SecondTabActive: Story = { args: { activeTab: 'account' } };

/** The appearance classes from theme.css (np-color-*, np-shape-*) on the Default example */
const appearance = appearanceStories(meta, Default);
export const AppearanceColors = appearance.colors;
export const AppearanceShapes = appearance.shapes;
