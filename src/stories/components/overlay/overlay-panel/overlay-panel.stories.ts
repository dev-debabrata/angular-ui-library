import type { Meta, StoryObj } from '@storybook/angular-vite';
import { moduleMetadata } from '@storybook/angular-vite';
import { fn } from 'storybook/test';

import { ButtonComponent } from '../../form/button/button.component';
import { OVERLAY_PANEL_VARIANTS, OverlayPanelComponent } from './overlay-panel.component';
import { OverlayPanelDemoComponent } from './overlay-panel-demo.component';
import { appearanceStories } from '../../../utils/appearance-stories';

const meta: Meta<OverlayPanelComponent> = {
  title: 'Components/Overlay/Overlay Panel',
  component: OverlayPanelComponent,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [ButtonComponent, OverlayPanelDemoComponent] })],
  parameters: {
    docs: {
      story: { inline: false, height: '520px' },
      description: {
        component:
          'Add `#op` to `<np-overlay-panel>` and call `op.toggle($event)` from a button. ' +
          'The panel opens under the clicked element and closes on outside click or Escape.',
      },
    },
  },
  argTypes: { variant: { control: 'select', options: OVERLAY_PANEL_VARIANTS } },
  args: { dismissable: true, showCloseIcon: false, onShow: fn(), onHide: fn() },
};

export default meta;
type Story = StoryObj<OverlayPanelComponent>;

const bindings = `[dismissable]="dismissable" [showCloseIcon]="showCloseIcon" (onShow)="onShow()" (onHide)="onHide()"`;

/** The "Share" example: a panel with a link, an invite field and a member list */
export const Default: Story = {
  render: (args) => ({ props: args, template: `<np-overlay-panel-demo ${bindings} />` }),
};

export const Basic: Story = {
  args: { showCloseIcon: true },
  render: (args) => ({
    props: args,
    template: `
      <np-button label="Toggle panel" [primary]="true" (clicked)="op.toggle($event)" />
      <np-overlay-panel #op ${bindings}>
        <p style="margin: 0; padding-right: 24px; max-width: 260px; line-height: 1.5">
          Any content goes here. Click outside or press Escape to close.
        </p>
      </np-overlay-panel>
    `,
  }),
};

/** Every variant (default, glass, glow, gradient header band, minimal) with a `header` + `icon`, `width` and a `panelFooter` button */
export const Variants: Story = {
  render: (args) => ({
    props: { ...args, variants: OVERLAY_PANEL_VARIANTS },
    template: `
      <div style="display: flex; flex-wrap: wrap; gap: 8px">
        @for (v of variants; track v) {
          <np-button [label]="v" size="small" (clicked)="op.toggle($event)" />
          <np-overlay-panel #op [variant]="v" header="Upgrade to Pro" icon="sparkles" width="280px" ${bindings}>
            <p style="margin: 0; line-height: 1.5">Unlimited projects, custom domains and priority support.</p>
            <button panelFooter type="button" class="ui-btn ui-btn--primary ui-btn--sm">Upgrade</button>
          </np-overlay-panel>
        }
      </div>
    `,
  }),
};

/** The appearance classes from theme.css (np-color-*, np-shape-*) on the Default example */
const appearance = appearanceStories(meta, Default);
export const AppearanceColors = appearance.colors;
export const AppearanceShapes = appearance.shapes;
