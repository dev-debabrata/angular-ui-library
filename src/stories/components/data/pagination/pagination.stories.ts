import type { Meta, StoryObj } from '@storybook/angular-vite';
import { fn } from 'storybook/test';

import { SIZES } from '../../../utils/types';
import { PAGINATION_VARIANTS, PaginationComponent } from './pagination.component';
import { appearanceStories } from '../../../utils/appearance-stories';

const meta: Meta<PaginationComponent> = {
  title: 'Components/Data/Pagination',
  component: PaginationComponent,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: PAGINATION_VARIANTS },
    size: { control: 'inline-radio', options: SIZES },
  },
  args: {
    pageChange: fn(),
    rowsChange: fn(),
  },
};

export default meta;
type Story = StoryObj<PaginationComponent>;

export const Default: Story = { args: { page: 1, totalPages: 5 } };

export const ManyPages: Story = { args: { page: 10, totalPages: 20 } };

export const LastPage: Story = { args: { page: 20, totalPages: 20 } };

/** Every variant on page 4 of 12 (glass on a gradient, as it is meant for colored backgrounds) */
export const Variants: Story = {
  render: (args) => ({
    props: { ...args, variants: PAGINATION_VARIANTS },
    template: `
      @for (v of variants; track v) {
        <code style="color: var(--ui-text-muted); font-size: 12px">{{ v }}</code>
        <div style="margin: 6px 0 18px; border-radius: var(--ui-radius-lg)" [style.padding]="v === 'glass' ? '24px' : null"
          [style.background]="v === 'glass' ? 'var(--ui-gradient)' : null">
          <np-pagination [variant]="v" [page]="4" [totalPages]="12" (pageChange)="pageChange($event)" />
        </div>
      }
    `,
  }),
};

/** `size` small, medium and large */
export const Sizes: Story = {
  render: (args) => ({
    props: { ...args, sizes: SIZES },
    template: `@for (s of sizes; track s) {
      <div style="margin-bottom: 14px"><np-pagination [size]="s" [page]="2" [totalPages]="5" (pageChange)="pageChange($event)" /></div>
    }`,
  }),
};

/** Data toolbar: `totalRecords` + `[(rows)]` with a "1–10 of 240" summary, rows-per-page select, first/last buttons and "Go to" box. Arrow keys change the page */
export const DataToolbar: Story = {
  args: {
    totalRecords: 240,
    rowsOptions: [10, 25, 50],
    showSummary: true,
    showFirstLast: true,
    showJump: true,
  },
};

/** The appearance classes from theme.css (np-color-*, np-shape-*) on the Default example */
const appearance = appearanceStories(meta, Default);
export const AppearanceColors = appearance.colors;
export const AppearanceShapes = appearance.shapes;
