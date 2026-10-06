import type { Meta, StoryObj } from '@storybook/angular-vite';

import { TIMELINE_VARIANTS, TimelineComponent, type TimelineEvent } from './timeline.component';
import { appearanceStories } from '../../../utils/appearance-stories';

const step = (...[status, date, icon, description, tone]: string[]) =>
  ({ status, date, icon, description, tone }) as TimelineEvent;

const orderEvents: TimelineEvent[] = [
  step('Ordered', '15/10/2026 10:30', 'shopping-cart', 'Your order was placed.'),
  step('Processing', '15/10/2026 14:00', 'package', 'Items are being packed.'),
  step('Shipped', '16/10/2026 16:15', 'truck', 'Handed over to the courier.'),
  step('Delivered', '18/10/2026 10:00', 'circle-check', 'Signed for at the front door.', 'success'),
];

const meta: Meta<TimelineComponent> = {
  title: 'Components/Data/Timeline',
  component: TimelineComponent,
  tags: ['autodocs'],
  argTypes: {
    align: { control: 'select', options: ['left', 'right', 'alternate'] },
    layout: { control: 'select', options: ['vertical', 'horizontal'] },
    variant: { control: 'select', options: TIMELINE_VARIANTS },
    lineColor: {
      control: 'select',
      options: ['', 'success', 'info', 'warning', 'danger', 'neutral', '#16a34a'],
    },
  },
  args: { value: orderEvents, align: 'left', layout: 'vertical', variant: 'default' },
};

export default meta;
type Story = StoryObj<TimelineComponent>;

export const Default: Story = {};
export const Right: Story = { args: { align: 'right' } };
export const Alternate: Story = { args: { align: 'alternate' } };
export const Horizontal: Story = { args: { layout: 'horizontal' } };
export const HorizontalAlternate: Story = { args: { layout: 'horizontal', align: 'alternate' } };

/** Events without icons show a dot, colored by `tone` */
export const Tones: Story = {
  args: {
    value: [
      { status: 'Build started', date: '09:00', tone: 'info' },
      { status: 'Tests passed', date: '09:04', tone: 'success' },
      { status: 'Lint warnings', date: '09:05', tone: 'warning' },
      {
        status: 'Deploy failed',
        date: '09:07',
        tone: 'danger',
        description: 'Timed out waiting for health check.',
      },
      { status: 'Rolled back', date: '09:10', tone: 'neutral' },
    ],
  },
};

export const CustomContent: Story = {
  args: { align: 'alternate' },
  render: (args) => ({
    props: args,
    template: `
      <np-timeline [value]="value" [align]="align" [layout]="layout">
        <ng-template #content let-event>
          <div style="display: inline-block; max-width: 260px; padding: 14px 16px; border: 1px solid var(--ui-border);
            border-radius: var(--ui-radius); background: var(--ui-surface); box-shadow: var(--ui-shadow); text-align: left">
            <div style="font-weight: 700">{{ event.status }}</div>
            <div style="color: var(--ui-text-muted); font-size: 12px">{{ event.date }}</div>
            <p style="margin: 8px 0 0; color: var(--ui-text-muted)">{{ event.description }}</p>
          </div>
        </ng-template>
      </np-timeline>
    `,
  }),
};

/** `activeIndex` fills the line up to the current event, pulses its marker and dims the pending ones */
export const Progress: Story = { args: { variant: 'gradient', activeIndex: 2 } };

/** `dateOpposite` puts each date across the line from its content (here with cards) */
export const DateOpposite: Story = { args: { dateOpposite: true, variant: 'cards' } };

/** A release log: compact rows with `tag` labels colored by `tone` */
export const Changelog: Story = {
  args: {
    variant: 'compact',
    value: [
      {
        ...step('Dark mode', 'Oct 2026', 'sparkles', 'Every component follows the theme.'),
        tag: 'v2.4',
      },
      { ...step('Faster tables', 'Sep 2026', 'zap', '', 'success'), tag: 'v2.3' },
      { ...step('Fixed focus trap', 'Aug 2026', 'bug', '', 'warning'), tag: 'Fix' },
      { ...step('Removed legacy grid', 'Jul 2026', 'git-merge', '', 'danger'), tag: 'Breaking' },
    ],
  },
};

const tracking: TimelineEvent[] = [
  ['Order placed', '09 Aug 2025, 10:00 am'],
  ['Order confirmed', '09 Aug 2025, 10:30 am'],
  ['Packed', '09 Aug 2025, 12:00 pm'],
  ['Arrived at the warehouse', '10 Aug 2025, 02:00 pm'],
  ['At the courier facility', '10 Aug 2025, 03:00 pm'],
  ['Out for delivery', '12 Aug 2025, 05:00 pm'],
  ['Delivered', '12 Aug 2025, 09:00 pm'],
].map(([status, date]) => step(status, date));

/** `lineColor` (a tone or any CSS color) colors the line and markers; with `activeIndex`, only up to the current step */
export const LineColor: Story = {
  args: { value: tracking, lineColor: 'success', activeIndex: 4, variant: 'compact' },
};

/** Horizontal order tracking with a custom CSS color */
export const LineColorHorizontal: Story = {
  args: { layout: 'horizontal', lineColor: '#16a34a', activeIndex: 2, dateOpposite: true },
};

/** Every variant side by side */
export const Variants: Story = {
  render: (args) => ({
    props: { ...args, variants: TIMELINE_VARIANTS },
    template: `
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 32px">
        @for (v of variants; track v) {
          <div><b style="text-transform: capitalize">{{ v }}</b><np-timeline [value]="value" [variant]="v" /></div>
        }
      </div>
    `,
  }),
};

/** The appearance classes from theme.css (np-color-*, np-shape-*) on the Default example */
const appearance = appearanceStories(meta, Default);
export const AppearanceColors = appearance.colors;
export const AppearanceShapes = appearance.shapes;
