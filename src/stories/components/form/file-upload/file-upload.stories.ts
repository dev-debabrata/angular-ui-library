import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular-vite';
import { fn } from 'storybook/test';

import { FILE_UPLOAD_VARIANTS, FileUploadComponent } from './file-upload.component';
import { appearanceStories } from '../../../utils/appearance-stories';

/** Uploading is simulated (~1.5s) unless you pass an `uploadHandler` */
const meta: Meta<FileUploadComponent> = {
  title: 'Components/Form/File Upload',
  component: FileUploadComponent,
  tags: ['autodocs'],
  argTypes: {
    mode: { control: 'select', options: ['advanced', 'basic'] },
    variant: { control: 'select', options: FILE_UPLOAD_VARIANTS },
  },
  args: {
    multiple: true,
    accept: '.pdf,image/*',
    maxFileSize: 1_000_000,
    select: fn(),
    upload: fn(),
    remove: fn(),
    clear: fn(),
    error: fn(),
  },
};

export default meta;
type Story = StoryObj<FileUploadComponent>;

export const Advanced: Story = {};

export const Basic: Story = { args: { mode: 'basic', multiple: false, auto: true } };

export const ImagesOnly: Story = { args: { accept: 'image/*' } };

export const WithLimits: Story = { args: { maxFileSize: 100_000, fileLimit: 3 } };

/** `variant` (advanced mode): default, dropzone (big drop area), compact (one line for tight forms) and cards (file grid) */
export const Variants: Story = {
  decorators: [moduleMetadata({ imports: [FileUploadComponent] })],
  render: (args) => ({
    props: args,
    template: `<div style="display: grid; gap: 32px; max-width: 720px">
  @for (v of ['default', 'dropzone', 'compact', 'cards']; track v) {
    <div style="display: grid; gap: 10px">
      <code style="justify-self: start; padding: 2px 8px; border-radius: 6px; background: var(--ui-surface-sunken); color: var(--ui-text-muted); font-size: 12px">{{ v }}</code>
      <np-file-upload [variant]="$any(v)" [multiple]="multiple" [accept]="accept" [maxFileSize]="maxFileSize" (select)="select($event)" (upload)="upload($event)" (remove)="remove($event)" (clear)="clear()" (error)="error($event)" />
    </div>
  }
</div>`,
  }),
};

/** A large drop area with the accepted types and size limit; rows show each file's type icon and progress */
export const Dropzone: Story = { args: { variant: 'dropzone', fileLimit: 5 } };

/** One line: a choose button and file chips, for tight forms */
export const Compact: Story = { args: { variant: 'compact', chooseLabel: 'Attach' } };

/** Files as cards: image thumbnails or a file-type icon, size, status and a progress bar */
export const Cards: Story = { args: { variant: 'cards', accept: '', maxFileSize: 5_000_000 } };

/** The appearance classes from theme.css (np-color-*, np-shape-*) on the Advanced example */
const appearance = appearanceStories(meta, Advanced);
export const AppearanceColors = appearance.colors;
export const AppearanceShapes = appearance.shapes;
