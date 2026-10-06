import { Component, signal } from '@angular/core';

import { HeaderComponent } from '../header/header.component';
import type { User } from '../../../utils/types';

@Component({
  selector: 'np-page',
  imports: [HeaderComponent],
  templateUrl: './page.html',
  styleUrl: './page.css',
})
export class PageComponent {
  protected readonly user = signal<User | null>(null);

  protected logIn() {
    this.user.set({ name: 'Jane Doe' });
  }
}
