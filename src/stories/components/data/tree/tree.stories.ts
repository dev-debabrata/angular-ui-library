import type { Meta, StoryObj } from '@storybook/angular-vite';
import { fn } from 'storybook/test';

import type { TreeNode } from '../../../utils/types';
import { TREE_VARIANTS, TreeComponent } from './tree.component';
import { appearanceStories } from '../../../utils/appearance-stories';

const files: TreeNode[] = [
  {
    key: 'documents',
    label: 'Documents',
    expanded: true,
    children: [
      {
        key: 'work',
        label: 'Work',
        expanded: true,
        children: [
          { key: 'expenses', label: 'Expenses.doc', icon: 'file-text' },
          { key: 'resume', label: 'Resume.doc', icon: 'file-text' },
        ],
      },
      {
        key: 'home',
        label: 'Home',
        children: [{ key: 'invoices', label: 'Invoices.txt', icon: 'file-text' }],
      },
    ],
  },
  {
    key: 'pictures',
    label: 'Pictures',
    children: [
      { key: 'barcelona', label: 'barcelona.jpg', icon: 'image' },
      { key: 'logo', label: 'logo.png', icon: 'image' },
      { key: 'primeui', label: 'primeui.png', icon: 'image' },
    ],
  },
  {
    key: 'media',
    label: 'Media',
    children: [
      { key: 'song', label: 'Song.mp3', icon: 'music' },
      { key: 'trailer', label: 'Trailer.mp4', icon: 'video' },
    ],
  },
  { key: 'notes', label: 'notes.md' },
];

const meta: Meta<TreeComponent> = {
  title: 'Components/Data/Tree',
  component: TreeComponent,
  tags: ['autodocs'],
  argTypes: {
    selectionMode: {
      control: 'select',
      options: ['none', 'single', 'multiple', 'checkbox'],
      mapping: { none: null },
    },
    variant: { control: 'select', options: TREE_VARIANTS },
  },
  args: {
    value: files,
    selectionChange: fn(),
    nodeSelect: fn(),
    nodeUnselect: fn(),
    nodeExpand: fn(),
    nodeCollapse: fn(),
  },
};

export default meta;
type Story = StoryObj<TreeComponent>;

export const Default: Story = {};
export const SingleSelection: Story = { args: { selectionMode: 'single' } };
export const MultipleSelection: Story = { args: { selectionMode: 'multiple' } };
export const Checkbox: Story = { args: { selectionMode: 'checkbox' } };

export const WithFilter: Story = {
  args: { filter: true, filterPlaceholder: 'Search files...', selectionMode: 'single' },
};

export const ExpandCollapseAll: Story = {
  render: (args) => ({
    props: args,
    template: `
      <div style="display: flex; gap: 8px; margin-bottom: 12px">
        <button class="ui-btn ui-btn--primary ui-btn--sm" (click)="tree.expandAll()">Expand all</button>
        <button class="ui-btn ui-btn--sm" (click)="tree.collapseAll()">Collapse all</button>
      </div>
      <np-tree #tree [value]="value" (nodeExpand)="nodeExpand($event)" (nodeCollapse)="nodeCollapse($event)" />
    `,
  }),
};

/** Every look, with single selection (glass on a gradient so the frosting shows) */
export const Variants: Story = {
  render: (args) => ({
    props: { ...args, variants: TREE_VARIANTS, selection: files[0].children![0].children![1] },
    template: `
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 20px">
        @for (v of variants; track v) {
          <div style="padding: 12px; border-radius: 16px" [style.background]="v === 'glass' ? 'var(--ui-gradient)' : null">
            <code>{{ v }}</code>
            <np-tree [variant]="v" [value]="value" selectionMode="single" [selection]="selection" />
          </div>
        }
      </div>
    `,
  }),
};

/** `cards`, with `data.description` lines, `showCounts` on parents and a `data.badge` on the leaf */
export const Cards: Story = {
  args: {
    variant: 'cards',
    showCounts: true,
    selectionMode: 'single',
    value: files.map((n) => ({
      ...n,
      data: {
        description: `${n.children?.length ?? 0} items`,
        badge: n.children ? undefined : 'New',
      },
    })),
  },
};

/** `compact` file explorer: checkboxes, expand/collapse `controls`, and `highlight` marks the filter text */
export const Compact: Story = {
  args: {
    variant: 'compact',
    selectionMode: 'checkbox',
    controls: true,
    filter: true,
    highlight: true,
  },
};

/** The appearance classes from theme.css (np-color-*, np-shape-*) on the Default example */
const appearance = appearanceStories(meta, Default);
export const AppearanceColors = appearance.colors;
export const AppearanceShapes = appearance.shapes;
