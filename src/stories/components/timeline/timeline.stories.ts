import type { Meta, StoryObj } from '@storybook/angular-vite';

import { TimelineComponent, type TimelineEvent } from './timeline.component';

const step = (...[status, date, icon, description, tone]: string[]) =>
  ({ status, date, icon, description, tone }) as TimelineEvent;

const orderEvents: TimelineEvent[] = [
  step('Ordered', '15/10/2026 10:30', 'shopping-cart', 'Your order was placed.'),
  step('Processing', '15/10/2026 14:00', 'package', 'Items are being packed.'),
  step('Shipped', '16/10/2026 16:15', 'truck', 'Handed over to the courier.'),
  step('Delivered', '18/10/2026 10:00', 'circle-check', 'Signed for at the front door.', 'success'),
];

const meta: Meta<TimelineComponent> = {
  title: 'Components/Timeline',
  component: TimelineComponent,
  tags: ['autodocs'],
  argTypes: {
    align: { control: 'select', options: ['left', 'right', 'alternate'] },
    layout: { control: 'select', options: ['vertical', 'horizontal'] },
  },
  args: { value: orderEvents, align: 'left', layout: 'vertical' },
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
      <nex-timeline [value]="value" [align]="align" [layout]="layout">
        <ng-template #content let-event>
          <div style="display: inline-block; max-width: 260px; padding: 14px 16px; border: 1px solid var(--ui-border);
            border-radius: var(--ui-radius); background: var(--ui-surface); box-shadow: var(--ui-shadow); text-align: left">
            <div style="font-weight: 700">{{ event.status }}</div>
            <div style="color: var(--ui-text-muted); font-size: 12px">{{ event.date }}</div>
            <p style="margin: 8px 0 0; color: var(--ui-text-muted)">{{ event.description }}</p>
          </div>
        </ng-template>
      </nex-timeline>
    `,
  }),
};
