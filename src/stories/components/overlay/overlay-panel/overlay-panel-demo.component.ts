import { Component, booleanAttribute, input, output } from '@angular/core';

import { AvatarComponent } from '../../media/avatar/avatar.component';
import { ButtonComponent } from '../../form/button/button.component';
import { IconComponent } from '../../media/icon/icon.component';
import { OverlayPanelComponent } from './overlay-panel.component';

/** Story-only helper: the "Share" example for OverlayPanel. Not part of the library */
@Component({
  selector: 'nex-overlay-panel-demo',
  imports: [AvatarComponent, ButtonComponent, IconComponent, OverlayPanelComponent],
  templateUrl: './overlay-panel-demo.html',
  styleUrl: './overlay-panel-demo.css',
})
export class OverlayPanelDemoComponent {
  /** Passed to the panel's dismissable input */
  readonly dismissable = input(true, { transform: booleanAttribute });

  /** Passed to the panel's showCloseIcon input */
  readonly showCloseIcon = input(false, { transform: booleanAttribute });

  /** Re-emits the panel's onShow */
  readonly onShow = output<void>();

  /** Re-emits the panel's onHide */
  readonly onHide = output<void>();

  protected readonly url = 'https://example.com/documents/quarterly-report';

  protected readonly members = [
    { name: 'Amy Elsner', email: 'amy@email.com', role: 'Owner' },
    { name: 'Bernardo Dominic', email: 'bernardo@email.com', role: 'Editor' },
    { name: 'Ioni Bowcher', email: 'ioni@email.com', role: 'Viewer' },
  ];

  protected copy() {
    navigator.clipboard?.writeText(this.url);
  }
}
