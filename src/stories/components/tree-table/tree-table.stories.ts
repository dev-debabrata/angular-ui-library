import type { Meta, StoryObj } from '@storybook/angular-vite';
import { fn } from 'storybook/test';

import type { TreeNode } from '../../types';
import { TreeTableComponent } from './tree-table.component';

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

const meta: Meta<TreeTableComponent> = {
  title: 'Components/Tree Table',
  component: TreeTableComponent,
  tags: ['autodocs'],
  argTypes: {
    selectionMode: { control: 'select', options: ['none', 'single'], mapping: { none: null } },
  },
  args: {
    value: fileSystem,
    columns: [
      { field: 'name', header: 'Name' },
      { field: 'size', header: 'Size' },
      { field: 'type', header: 'Type' },
    ],
    selectionChange: fn(),
    nodeSelect: fn(),
    nodeExpand: fn(),
    nodeCollapse: fn(),
  },
};

export default meta;
type Story = StoryObj<TreeTableComponent>;

export const Default: Story = {};
export const Selection: Story = { args: { selectionMode: 'single' } };
