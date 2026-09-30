import type { Meta, StoryObj } from '@storybook/angular-vite';
import { moduleMetadata } from '@storybook/angular-vite';
import { fn } from 'storybook/test';

import { ButtonComponent } from '../button/button.component';
import { OverlayPanelComponent } from './overlay-panel.component';
import { OverlayPanelDemoComponent } from './overlay-panel-demo.component';

const meta: Meta<OverlayPanelComponent> = {
  title: 'Components/Overlay Panel',
  component: OverlayPanelComponent,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [ButtonComponent, OverlayPanelDemoComponent] })],
  parameters: {
    docs: {
      story: { inline: false, height: '520px' },
      description: {
        component:
          'Add `#op` to `<nex-overlay-panel>` and call `op.toggle($event)` from a button. ' +
          'The panel opens under the clicked element and closes on outside click or Escape.',
      },
    },
  },
  args: { dismissable: true, showCloseIcon: false, onShow: fn(), onHide: fn() },
};

export default meta;
type Story = StoryObj<OverlayPanelComponent>;

const bindings = `[dismissable]="dismissable" [showCloseIcon]="showCloseIcon" (onShow)="onShow()" (onHide)="onHide()"`;

/** The "Share" example: a panel with a link, an invite field and a member list */
export const Default: Story = {
  render: (args) => ({ props: args, template: `<nex-overlay-panel-demo ${bindings} />` }),
};

export const Basic: Story = {
  args: { showCloseIcon: true },
  render: (args) => ({
    props: args,
    template: `
      <storybook-button label="Toggle panel" [primary]="true" (onClick)="op.toggle($event)" />
      <nex-overlay-panel #op ${bindings}>
        <p style="margin: 0; padding-right: 24px; max-width: 260px; line-height: 1.5">
          Any content goes here. Click outside or press Escape to close.
        </p>
      </nex-overlay-panel>
    `,
  }),
};
