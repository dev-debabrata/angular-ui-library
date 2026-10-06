import type { Meta, StoryObj } from '@storybook/angular-vite';

import { CHART_TYPES, ChartComponent, type ChartDataset } from './chart.component';
import { appearanceStories } from '../../../utils/appearance-stories';

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const revenue: ChartDataset[] = [
  {
    label: 'Revenue',
    data: [4200, 5100, 4800, 6300, 7100, 6900, 7800, 8400, 8100, 9200, 9800, 11200],
  },
  {
    label: 'Expenses',
    data: [3100, 3300, 3500, 3900, 4100, 4300, 4200, 4700, 4900, 5100, 5400, 5900],
  },
];

const traffic: ChartDataset[] = [{ label: 'Visits', data: [4200, 2600, 1800, 1100, 700] }];

const percent = (value: number) => `${value}%`;

const meta: Meta<ChartComponent> = {
  title: 'Components/Data/Chart',
  component: ChartComponent,
  tags: ['autodocs'],
  argTypes: { type: { control: 'select', options: CHART_TYPES } },
  args: { labels: months, datasets: revenue, ariaLabel: 'Revenue and expenses by month' },
};

export default meta;
type Story = StoryObj<ChartComponent>;

export const Line: Story = {};

/** One series needs no legend; the title says what is plotted. `gradient` fades the fill to transparent */
export const SmoothArea: Story = {
  args: {
    type: 'area',
    smooth: true,
    gradient: true,
    datasets: revenue.slice(0, 1),
    ariaLabel: 'Revenue by month',
  },
};

export const Bar: Story = {
  args: {
    type: 'bar',
    labels: months.slice(0, 6),
    datasets: revenue.map((d) => ({ ...d, data: d.data.slice(0, 6) })),
  },
};

export const StackedBar: Story = {
  args: {
    type: 'bar',
    stacked: true,
    labels: ['Q1', 'Q2', 'Q3', 'Q4'],
    datasets: [
      { label: 'Online', data: [120, 150, 170, 210] },
      { label: 'Retail', data: [90, 80, 95, 110] },
      { label: 'Partners', data: [40, 55, 60, 70] },
    ],
    showValues: true,
    ariaLabel: 'Sales by channel per quarter',
  },
};

export const Pie: Story = {
  args: {
    type: 'pie',
    labels: ['Search', 'Direct', 'Social', 'Email', 'Referral'],
    datasets: traffic,
    ariaLabel: 'Visits by source',
  },
};

export const Doughnut: Story = {
  args: { ...Pie.args, type: 'doughnut' },
};

/** `format` controls every value shown: axis, tooltip and doughnut total */
export const Currency: Story = {
  args: {
    type: 'bar',
    labels: ['Starter', 'Pro', 'Team', 'Enterprise'],
    datasets: [{ label: 'MRR', data: [1800, 7400, 12600, 21400] }],
    format: (value: number) =>
      value.toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
      }),
    ariaLabel: 'Monthly recurring revenue by plan',
  },
};

/** Compare series across several measures */
export const Radar: Story = {
  args: {
    type: 'radar',
    height: 320,
    labels: ['Speed', 'Reliability', 'Comfort', 'Safety', 'Efficiency', 'Design'],
    datasets: [
      { label: 'Model A', data: [82, 90, 64, 88, 70, 76] },
      { label: 'Model B', data: [70, 74, 86, 80, 92, 64] },
    ],
    ariaLabel: 'Model A and B scores',
  },
};

/** Progress rings, one per label, filled up to `max` (100 by default) */
export const Radial: Story = {
  args: {
    type: 'radial',
    labels: ['Move', 'Exercise', 'Stand'],
    datasets: [{ label: 'Daily goal', data: [82, 64, 45] }],
    format: percent,
    ariaLabel: 'Daily goals reached',
  },
};

/** A half ring with the first value in the center */
export const Gauge: Story = { args: { ...Radial.args, type: 'gauge' } };

/** No axes, fitted to its own range, with an end dot: for stat tiles and table cells */
export const Sparkline: Story = {
  args: {
    type: 'sparkline',
    height: 56,
    gradient: true,
    datasets: revenue.slice(0, 1),
    ariaLabel: 'Revenue trend',
  },
};

/** Every type, drawn in with `animate` (still with reduced motion) */
export const AllTypes: Story = {
  render: () => ({
    props: {
      charts: [Line, SmoothArea, Bar, Pie, Doughnut, Radar, Radial, Gauge, Sparkline].map((s) => ({
        ...meta.args,
        type: 'line',
        format: (value: number) => value.toLocaleString(),
        ...s.args,
      })),
    },
    template: `
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 32px">
        @for (c of charts; track c.type) {
          <figure style="display: grid; gap: 8px; min-width: 0; margin: 0">
            <figcaption style="color: var(--ui-text-muted); font: 12px monospace">{{ c.type }}</figcaption>
            <np-chart animate [type]="c.type" [labels]="c.labels" [datasets]="c.datasets" [format]="c.format"
              [ariaLabel]="c.ariaLabel" [height]="c.type === 'sparkline' ? 56 : 220" />
          </figure>
        }
      </div>
    `,
  }),
};

/** The appearance classes from theme.css (np-color-*, np-shape-*) on the Line example */
const appearance = appearanceStories(meta, Line);
export const AppearanceColors = appearance.colors;
export const AppearanceShapes = appearance.shapes;
