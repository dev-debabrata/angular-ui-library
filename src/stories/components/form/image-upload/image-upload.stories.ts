import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular-vite';
import { fn } from 'storybook/test';

import { IMAGE_UPLOAD_VARIANTS, ImageUploadComponent } from './image-upload.component';
import { appearanceStories } from '../../../utils/appearance-stories';

const meta: Meta<ImageUploadComponent> = {
  title: 'Components/Form/Image Upload',
  component: ImageUploadComponent,
  tags: ['autodocs'],
  argTypes: {
    shape: { control: 'select', options: ['square', 'circle'] },
    variant: { control: 'select', options: IMAGE_UPLOAD_VARIANTS },
  },
  args: { maxFileSize: 1_000_000, valueChange: fn(), fileSelect: fn(), remove: fn() },
};

export default meta;
type Story = StoryObj<ImageUploadComponent>;

export const Default: Story = {};

/** Avatar uploader */
export const Circle: Story = { args: { shape: 'circle', width: '140px', label: 'Add photo' } };

export const WithImage: Story = { args: { value: 'https://picsum.photos/400' } };

export const Disabled: Story = { args: { disabled: true } };

/** `variant`: default, avatar (round photo with a camera badge), cover (wide banner) and minimal (plus tile); empty and filled */
export const Variants: Story = {
  decorators: [moduleMetadata({ imports: [ImageUploadComponent] })],
  render: (args) => ({
    props: { ...args, photo: 'https://picsum.photos/id/64/400', banner: 'https://picsum.photos/id/1018/1200/375' },
    template: `<div style="display: grid; gap: 32px; max-width: 760px">
  <div style="display: flex; flex-wrap: wrap; gap: 32px; align-items: flex-start">
    <np-image-upload [maxFileSize]="maxFileSize" />
    <np-image-upload variant="avatar" initials="AJ" label="Add photo" />
    <np-image-upload variant="avatar" label="Add photo" />
    <np-image-upload variant="avatar" [value]="photo" />
    <np-image-upload variant="minimal" label="Add" />
    <np-image-upload variant="minimal" [value]="photo" />
  </div>
  <np-image-upload variant="cover" label="Upload cover image" [maxFileSize]="maxFileSize" />
  <np-image-upload variant="cover" [value]="banner" />
</div>`,
  }),
};

/** A round profile photo with a camera badge on its edge; initials (or a person icon) while empty */
export const Avatar: Story = { args: { variant: 'avatar', initials: 'AJ', label: 'Add photo' } };

/** A wide 16:5 banner; hover or focus it to show "Change cover" */
export const Cover: Story = {
  args: { variant: 'cover', value: 'https://picsum.photos/id/1018/1200/375' },
  render: (args) => ({
    props: args,
    template: `<div style="max-width: 760px">
  <np-image-upload [variant]="variant" [(value)]="value" [maxFileSize]="maxFileSize" (valueChange)="valueChange($event)" (fileSelect)="fileSelect($event)" (remove)="remove()" />
</div>`,
  }),
  decorators: [moduleMetadata({ imports: [ImageUploadComponent] })],
};

/** A small dashed tile with a plus icon, e.g. for a gallery of attachments */
export const Minimal: Story = { args: { variant: 'minimal', label: 'Add' } };

/** The appearance classes from theme.css (np-color-*, np-shape-*) on the Default example */
const appearance = appearanceStories(meta, Default);
export const AppearanceColors = appearance.colors;
export const AppearanceShapes = appearance.shapes;
