import { Component, input, output } from '@angular/core';

import { ButtonComponent } from '../../form/button/button.component';
import type { User } from '../../../utils/types';

@Component({
  selector: 'np-header',
  imports: [ButtonComponent],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class HeaderComponent {
  /** Logged-in user, or null when logged out */
  readonly user = input<User | null>(null);

  readonly login = output<Event>();
  readonly logout = output<Event>();
  readonly createAccount = output<Event>();
}
