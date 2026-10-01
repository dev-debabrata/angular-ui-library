import type { Meta, StoryObj } from '@storybook/angular-vite';
import { fn } from 'storybook/test';

import { CalendarComponent } from './calendar.component';

const today = new Date();
const inDays = (n: number) => new Date(today.getFullYear(), today.getMonth(), today.getDate() + n);

/** Popups need room below the input inside the docs page */
const popup = { docs: { story: { inline: false, height: '440px' } } };

const meta: Meta<CalendarComponent> = {
  title: 'Components/Form/Calendar',
  component: CalendarComponent,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Date picker with single, multiple and range selection, month / year pickers and an optional time picker. ' +
          'Keyboard: arrows move between days, PageUp / PageDown change month (Shift for year), ' +
          'Home / End jump within the week, Enter selects, Escape closes the popup.',
      },
    },
  },
  argTypes: {
    selectionMode: { control: 'inline-radio', options: ['single', 'multiple', 'range'] },
    view: { control: 'inline-radio', options: ['date', 'month', 'year'] },
    hourFormat: { control: 'inline-radio', options: ['24', '12'] },
    firstDayOfWeek: { control: 'inline-radio', options: [0, 1] },
  },
  args: {
    label: 'Date',
    placeholder: 'Select a date',
    showIcon: true,
    valueChange: fn(),
    select: fn(),
    clear: fn(),
    monthChange: fn(),
  },
};

export default meta;
type Story = StoryObj<CalendarComponent>;

export const Default: Story = { parameters: popup };

export const Inline: Story = { args: { inline: true, value: today } };

export const Range: Story = {
  args: { selectionMode: 'range', label: 'Stay', placeholder: 'Check-in - Check-out' },
  parameters: popup,
};

export const Multiple: Story = {
  args: { selectionMode: 'multiple', inline: true, value: [inDays(-2), inDays(3), inDays(5)] },
};

export const WithTime: Story = {
  args: { showTime: true, hourFormat: '12', label: 'Meeting', placeholder: 'Date and time' },
  parameters: { docs: { story: { inline: false, height: '540px' } } },
};

export const MinMax: Story = {
  args: {
    inline: true,
    minDate: today,
    maxDate: inDays(30),
    disabledDays: [0, 6],
    firstDayOfWeek: 1,
    label: 'Delivery (next 30 days, weekdays only)',
  },
};

export const MonthPicker: Story = {
  args: { view: 'month', dateFormat: 'mm/yy', label: 'Month', placeholder: 'Select a month' },
  parameters: popup,
};

export const YearPicker: Story = {
  args: { view: 'year', dateFormat: 'yy', label: 'Year', placeholder: 'Select a year' },
  parameters: popup,
};

export const ButtonBar: Story = { args: { inline: true, showButtonBar: true } };

export const TwoMonths: Story = {
  args: { inline: true, numberOfMonths: 2, selectionMode: 'range', value: [inDays(2), inDays(9)] },
};

export const Disabled: Story = { args: { disabled: true, value: today } };
