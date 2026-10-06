import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular-vite';
import { fn } from 'storybook/test';

import { CALENDAR_VARIANTS, CalendarComponent, RANGE_PRESETS } from './calendar.component';
import { appearanceStories } from '../../../utils/appearance-stories';

const today = new Date();
const inDays = (n: number) => new Date(today.getFullYear(), today.getMonth(), today.getDate() + n);

/** Popups need room below the input inside the docs page */
const popup = { docs: { story: { inline: false, height: '440px' } } };

const meta: Meta<CalendarComponent> = {
  title: 'Components/Form/Calendar',
  component: CalendarComponent,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [CalendarComponent] })],
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
    variant: { control: 'inline-radio', options: CALENDAR_VARIANTS },
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

/** `variant`: default, gradient, glass (shown on a colorful background, where frosted glass shines) and minimal */
export const Variants: Story = {
  render: () => ({
    props: { value: today },
    template: `<div style="display: flex; flex-wrap: wrap; gap: 24px; align-items: flex-start">
  <np-calendar inline [value]="value" />
  <np-calendar inline variant="gradient" [value]="value" />
  <div style="padding: 24px; border-radius: 20px; background: linear-gradient(135deg, #6366f1, #ec4899 60%, #f59e0b)">
    <np-calendar inline variant="glass" [value]="value" />
  </div>
  <np-calendar inline variant="minimal" [value]="value" />
</div>`,
  }),
};

/** `presets`: quick picks beside the calendar (RANGE_PRESETS); the one matching the value is highlighted */
export const Presets: Story = {
  args: {
    inline: true,
    selectionMode: 'range',
    presets: RANGE_PRESETS,
    value: [inDays(-6), today],
    variant: 'gradient',
  },
};

/** `marks`: dots under days for events; their labels are read out with the day */
export const EventMarks: Story = {
  args: {
    inline: true,
    value: today,
    marks: [
      { date: inDays(1), label: 'Team meeting' },
      { date: inDays(3), color: 'var(--ui-success)', label: 'Release' },
      { date: inDays(3), color: 'var(--ui-warning)', label: 'Review' },
      { date: inDays(8), color: 'var(--ui-danger)', label: 'Deadline' },
    ],
  },
};

/** `showWeekNumbers`: the week of the year in front of each row */
export const WeekNumbers: Story = {
  args: { inline: true, value: today, showWeekNumbers: true, firstDayOfWeek: 1 },
};

/** The appearance classes from theme.css (np-color-*, np-shape-*) on the Default example */
const appearance = appearanceStories(meta, Default);
export const AppearanceColors = appearance.colors;
export const AppearanceShapes = appearance.shapes;
