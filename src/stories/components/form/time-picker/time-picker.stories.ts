import type { Meta, StoryObj } from '@storybook/angular-vite';
import { fn } from 'storybook/test';

import { TimePickerComponent } from './time-picker.component';

const meta: Meta<TimePickerComponent> = {
  title: 'Components/Form/Time Picker',
  component: TimePickerComponent,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Pick a time with spinner columns. Click the chevrons, scroll the mouse wheel over a column, ' +
          'or focus a column and press ArrowUp / ArrowDown. Values wrap around. ' +
          'Set `mode="list"` for a typeable input with a dropdown of times every `interval` minutes.',
      },
    },
  },
  argTypes: {
    hourFormat: { control: 'inline-radio', options: ['24', '12'] },
    mode: { control: 'inline-radio', options: ['spinner', 'list'] },
  },
  args: { label: 'Time', value: new Date(2026, 8, 30, 14, 30, 0), valueChange: fn() },
};

export default meta;
type Story = StoryObj<TimePickerComponent>;

export const Default: Story = {};

export const TwelveHour: Story = { args: { hourFormat: '12' } };

export const WithSeconds: Story = { args: { showSeconds: true } };

export const Steps: Story = { args: { stepMinute: 15, value: new Date(2026, 8, 30, 9, 0) } };

export const Popup: Story = {
  args: { inline: false, value: null, placeholder: 'Select time' },
  parameters: { docs: { story: { inline: false, height: '260px' } } },
};

/** Material-style: type a time ("2:30 pm", "14:30") or pick from a dropdown every 30 minutes */
export const ListMode: Story = {
  args: {
    mode: 'list',
    hourFormat: '12',
    value: null,
    label: 'Pick a time',
    placeholder: 'Pick a time',
  },
  parameters: { docs: { story: { inline: false, height: '340px' } } },
};

/** Options limited to business hours, every 15 minutes */
export const ListWithRange: Story = {
  args: {
    mode: 'list',
    interval: 15,
    minTime: '09:00',
    maxTime: '18:00',
    value: new Date(2026, 8, 30, 10, 15),
  },
  parameters: { docs: { story: { inline: false, height: '340px' } } },
};

export const Disabled: Story = { args: { disabled: true } };
