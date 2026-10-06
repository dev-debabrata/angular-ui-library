import type { Meta, StoryObj } from '@storybook/angular-vite';

import { SkeletonComponent } from './skeleton.component';

/** <np-skeleton> with the given attributes, following the story's animation arg */
const sk = (attrs: string) => `<np-skeleton ${attrs} [animation]="animation" />`;
const lines = (...widths: string[]) =>
  `<div style="flex: 1; display: grid; gap: 8px">${widths.map((w) => sk(w)).join('')}</div>`;
const radius = 'borderRadius="var(--ui-radius)"';

const meta: Meta<SkeletonComponent> = {
  title: 'Components/Feedback/Skeleton',
  component: SkeletonComponent,
  tags: ['autodocs'],
  argTypes: {
    shape: { control: 'select', options: ['rectangle', 'circle'] },
    animation: { control: 'select', options: ['wave', 'pulse', 'none'] },
  },
  args: { shape: 'rectangle', width: '100%', height: '1rem', animation: 'wave' },
};

export default meta;
type Story = StoryObj<SkeletonComponent>;

export const Default: Story = {};

export const Shapes: Story = {
  render: (args) => ({
    props: args,
    template: `
      <div style="display: flex; align-items: center; gap: 16px">
        ${sk('shape="circle" size="48px"')}
        ${sk('size="48px"')}
        ${sk('width="160px" height="48px" borderRadius="var(--ui-radius-lg)"')}
        ${sk('width="120px" height="12px" borderRadius="999px"')}
      </div>
    `,
  }),
};

export const CardLoading: Story = {
  render: (args) => ({
    props: args,
    template: `
      <div style="max-width: 360px; padding: 20px; border: 1px solid var(--ui-border); border-radius: var(--ui-radius-lg); background: var(--ui-surface); box-shadow: var(--ui-shadow)">
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px">
          ${sk('shape="circle" size="44px"')}
          ${lines('width="60%" height="12px"', 'width="40%" height="10px"')}
        </div>
        ${sk(`height="160px" ${radius}`)}
        <div style="margin: 16px 0">${lines('height="10px"', 'height="10px"', 'width="75%" height="10px"')}</div>
        <div style="display: flex; justify-content: flex-end; gap: 8px">
          ${sk(`width="80px" height="34px" ${radius}`).repeat(2)}
        </div>
      </div>
    `,
  }),
};

export const ListLoading: Story = {
  render: (args) => ({
    props: { ...args, rows: [1, 2, 3, 4] },
    template: `
      <ul style="max-width: 420px; margin: 0; padding: 0; list-style: none; display: grid; gap: 16px">
        @for (row of rows; track row) {
          <li style="display: flex; align-items: center; gap: 12px">
            ${sk('shape="circle" size="40px"')}
            ${lines('width="50%" height="12px"', 'width="85%" height="10px"')}
          </li>
        }
      </ul>
    `,
  }),
};

export const TableLoading: Story = {
  render: (args) => ({
    props: { ...args, rows: [1, 2, 3, 4, 5], cols: [1, 2, 3, 4] },
    template: `
      <table style="width: 100%; max-width: 560px; border-collapse: collapse">
        <thead>
          <tr>
            @for (col of cols; track col) {
              <th style="padding: 10px 12px; border-bottom: 1px solid var(--ui-border-strong)">
                <np-skeleton width="60%" height="12px" animation="none" />
              </th>
            }
          </tr>
        </thead>
        <tbody>
          @for (row of rows; track row) {
            <tr>
              @for (col of cols; track col) {
                <td style="padding: 12px; border-bottom: 1px solid var(--ui-border)">
                  ${sk(`[width]="col === 1 ? '80%' : '60%'" height="10px"`)}
                </td>
              }
            </tr>
          }
        </tbody>
      </table>
    `,
  }),
};

export const Pulse: Story = { args: { animation: 'pulse', height: '2rem' } };
