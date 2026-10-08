import type { Meta, StoryObj } from '@storybook/angular-vite';
import { fn } from 'storybook/test';

import { SIZES, type TreeNode } from '../../../utils/types';
import { TREE_TABLE_VARIANTS, TreeTableComponent } from './tree-table.component';
import { appearanceStories } from '../../../utils/appearance-stories';

const folder = (
  key: string,
  name: string,
  size: string,
  children: TreeNode[],
  expanded = false,
): TreeNode => ({
  key,
  data: { name, size, type: 'Folder' },
  children,
  expanded,
});

const file = (key: string, name: string, size: string, type: string, icon = 'file'): TreeNode => ({
  key,
  icon,
  data: { name, size, type },
});

const fileSystem: TreeNode[] = [
  folder(
    'applications',
    'Applications',
    '200mb',
    [
      folder('editor', 'Editor', '25mb', [
        file('editor-app', 'editor.app', '10mb', 'Application', 'package'),
        file('editor-cfg', 'settings.json', '2kb', 'JSON', 'file-text'),
      ]),
      file('mail', 'mail.app', '20mb', 'Application', 'package'),
      file('music-app', 'music.app', '155mb', 'Application', 'package'),
    ],
    true,
  ),
  folder('documents', 'Documents', '75kb', [
    folder('work', 'Work', '55kb', [
      file('expenses', 'Expenses.doc', '30kb', 'Document', 'file-text'),
      file('resume', 'Resume.doc', '25kb', 'Document', 'file-text'),
    ]),
    file('invoices', 'Invoices.txt', '20kb', 'Text', 'file-text'),
  ]),
  folder('pictures', 'Pictures', '150kb', [
    file('barcelona', 'barcelona.jpg', '90kb', 'Picture', 'image'),
    file('logo', 'logo.png', '60kb', 'Picture', 'image'),
  ]),
  file('song', 'Song.mp3', '4mb', 'Audio', 'music'),
];

/** The same tree with every folder expanded */
const openAll = (nodes: TreeNode[]): TreeNode[] =>
  nodes.map((n) => ({ ...n, expanded: !!n.children, children: n.children && openAll(n.children) }));
const allOpen = openAll(fileSystem);

const meta: Meta<TreeTableComponent> = {
  title: 'Components/Data/Tree Table',
  component: TreeTableComponent,
  tags: ['autodocs'],
  argTypes: {
    selectionMode: {
      control: 'select',
      options: ['none', 'single', 'checkbox'],
      mapping: { none: null },
    },
    variant: { control: 'select', options: TREE_TABLE_VARIANTS },
    size: { control: 'inline-radio', options: SIZES },
  },
  args: {
    value: fileSystem,
    columns: [
      { field: 'name', header: 'Name' },
      { field: 'size', header: 'Size', align: 'right', width: '120px' },
      { field: 'type', header: 'Type', width: '160px' },
    ],
    selectionChange: fn(),
    nodeSelect: fn(),
    nodeUnselect: fn(),
    nodeExpand: fn(),
    nodeCollapse: fn(),
  },
};

export default meta;
type Story = StoryObj<TreeTableComponent>;

export const Default: Story = {};
export const Selection: Story = { args: { selectionMode: 'single' } };

/** `checkbox` selection: checking a parent checks its children, partly checked parents show a dash */
export const CheckboxSelection: Story = { args: { selectionMode: 'checkbox' } };

/** Every look, with every folder open (glass on a gradient so the frosting shows) */
export const Variants: Story = {
  render: (args) => ({
    props: { ...args, value: allOpen, variants: TREE_TABLE_VARIANTS },
    template: `
      @for (v of variants; track v) {
        <div style="display: grid; gap: 8px; padding: 12px; border-radius: 16px"
          [style.background]="v === 'glass' ? 'var(--ui-gradient)' : null">
          <code>{{ v }}</code>
          <np-tree-table [variant]="v" [value]="value" [columns]="columns" selectionMode="single" />
        </div>
      }
    `,
  }),
};

/** Small, medium and large row density */
export const Sizes: Story = {
  render: (args) => ({
    props: { ...args, sizes: SIZES },
    template: `@for (s of sizes; track s) {<np-tree-table [size]="s" [value]="value" [columns]="columns" style="display: block; margin-bottom: 20px" />}`,
  }),
};

/** `filter` keeps matching rows and their ancestors; `scrollHeight` keeps the header in view after `expandAll()` */
export const FilterAndExpandAll: Story = {
  render: (args) => ({
    props: args,
    template: `
      <div style="display: flex; gap: 8px; margin-bottom: 12px">
        <button class="ui-btn ui-btn--primary ui-btn--sm" (click)="table.expandAll()">Expand all</button>
        <button class="ui-btn ui-btn--sm" (click)="table.collapseAll()">Collapse all</button>
      </div>
      <np-tree-table #table filter filterPlaceholder="Search files..." [value]="value" [columns]="columns"
        variant="striped" size="small" scrollHeight="260px" (nodeExpand)="nodeExpand($event)" (nodeCollapse)="nodeCollapse($event)" />
    `,
  }),
};

/** The appearance classes from theme.css (np-color-*, np-shape-*) on the Default example */
const appearance = appearanceStories(meta, Default, 560);
export const AppearanceColors = appearance.colors;
export const AppearanceShapes = appearance.shapes;
