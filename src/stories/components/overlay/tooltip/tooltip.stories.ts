import type { Meta, StoryObj } from '@storybook/angular-vite';
import { argsToTemplate, moduleMetadata } from '@storybook/angular-vite';

import { ButtonComponent } from '../../form/button/button.component';
import { TONES } from '../../../utils/types';
import { TOOLTIP_VARIANTS, TooltipComponent } from './tooltip.component';
import { appearanceStories } from '../../../utils/appearance-stories';

const meta: Meta<TooltipComponent> = {
  title: 'Components/Overlay/Tooltip',
  component: TooltipComponent,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [ButtonComponent] })],
  argTypes: {
    position: {
      control: 'select',
      options: ['top', 'bottom', 'left', 'right'],
    },
    variant: { control: 'select', options: TOOLTIP_VARIANTS },
    tone: { control: 'select', options: ['', ...TONES] },
  },
  args: {
    text: 'This is a tooltip',
  },
  render: (args) => ({
    props: args,
    template: `
      <div style="padding: 60px 120px; display: inline-block">
        <np-tooltip ${argsToTemplate(args)}>
          <np-button label="Hover me" />
        </np-tooltip>
      </div>
    `,
  }),
};

export default meta;
type Story = StoryObj<TooltipComponent>;

export const Top: Story = { args: { position: 'top' } };

export const Bottom: Story = { args: { position: 'bottom' } };

export const Left: Story = { args: { position: 'left' } };

export const Right: Story = { args: { position: 'right' } };

/** `heading` adds a title (long text wraps); `showDelay`/`hideDelay` (ms) delay it; `arrow` can be turned off */
export const Rich: Story = {
  args: {
    variant: 'light',
    heading: 'Auto-save is on',
    text: 'Changes are saved every 30 seconds while you edit, and when you leave the page.',
    showDelay: 300,
    arrow: false,
  },
};

/** `shortcut` shows keyboard keys after the text */
export const Shortcut: Story = { args: { text: 'Command menu', shortcut: 'Ctrl+K' } };

/** Every variant: default (dark), light, soft (tinted), gradient and glass; then `tone` on the soft variant */
export const Variants: Story = {
  render: (args) => ({
    props: { ...args, variants: TOOLTIP_VARIANTS, tones: TONES },
    template: `
      <div style="display: flex; flex-wrap: wrap; gap: 48px 12px; padding: 56px 24px 8px">
        @for (v of variants; track v) {
          <np-tooltip [variant]="v" [text]="v + ' tooltip'"><np-button [label]="v" size="small" /></np-tooltip>
        }
        @for (t of tones; track t) {
          <np-tooltip variant="soft" [tone]="t" [text]="t"><np-button [label]="t" size="small" /></np-tooltip>
        }
      </div>
    `,
  }),
};

/** The appearance classes from theme.css (np-color-*, np-shape-*) on the Top example */
const appearance = appearanceStories(meta, Top);
export const AppearanceColors = appearance.colors;
export const AppearanceShapes = appearance.shapes;
