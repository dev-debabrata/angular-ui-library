import type { Meta, StoryObj } from '@storybook/angular-vite';

import { CHART_TYPES, ChartComponent, type ChartDataset } from './chart.component';

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

const meta: Meta<ChartComponent> = {
  title: 'Components/Chart',
  component: ChartComponent,
  tags: ['autodocs'],
  argTypes: { type: { control: 'select', options: CHART_TYPES } },
  args: { labels: months, datasets: revenue, ariaLabel: 'Revenue and expenses by month' },
};

export default meta;
type Story = StoryObj<ChartComponent>;

export const Line: Story = {};

/** One series needs no legend; the title says what is plotted */
export const SmoothArea: Story = {
  args: {
    type: 'area',
    smooth: true,
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
