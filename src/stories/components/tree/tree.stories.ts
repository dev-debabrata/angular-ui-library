import type { Meta, StoryObj } from '@storybook/angular-vite';
import { fn } from 'storybook/test';

import type { TreeNode } from '../../types';
import { TreeComponent } from './tree.component';

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
  title: 'Components/Tree',
  component: TreeComponent,
  tags: ['autodocs'],
  argTypes: {
    selectionMode: {
      control: 'select',
      options: ['none', 'single', 'multiple', 'checkbox'],
      mapping: { none: null },
    },
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
      <nex-tree #tree [value]="value" (nodeExpand)="nodeExpand($event)" (nodeCollapse)="nodeCollapse($event)" />
    `,
  }),
};
