import { Component, input, output } from '@angular/core';

import { ButtonComponent } from '../button/button.component';
import type { User } from '../../types';

@Component({
  selector: 'storybook-header',
  imports: [ButtonComponent],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class HeaderComponent {
  /** Logged-in user, or null when logged out */
  readonly user = input<User | null>(null);

  readonly onLogin = output<Event>();
  readonly onLogout = output<Event>();
  readonly onCreateAccount = output<Event>();
}
