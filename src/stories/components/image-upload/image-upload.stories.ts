import type { Meta, StoryObj } from '@storybook/angular-vite';
import { fn } from 'storybook/test';

import { ImageUploadComponent } from './image-upload.component';

const meta: Meta<ImageUploadComponent> = {
  title: 'Components/Image Upload',
  component: ImageUploadComponent,
  tags: ['autodocs'],
  argTypes: { shape: { control: 'select', options: ['square', 'circle'] } },
  args: { maxFileSize: 1_000_000, valueChange: fn(), fileSelect: fn(), remove: fn() },
};

export default meta;
type Story = StoryObj<ImageUploadComponent>;

export const Default: Story = {};

/** Avatar uploader */
export const Circle: Story = { args: { shape: 'circle', width: '140px', label: 'Add photo' } };

export const WithImage: Story = { args: { value: 'https://picsum.photos/400' } };

export const Disabled: Story = { args: { disabled: true } };
