import { Component, input, model } from '@angular/core';

export interface Tab {
  id: string;
  label: string;
  content: string;
}

@Component({
  selector: 'nex-tabs',
  templateUrl: './tabs.html',
  styleUrl: './tabs.css',
})
export class TabsComponent {
  /** Tab definitions */
  readonly tabs = input<Tab[]>([]);

  /** id of the selected tab. Supports [(activeTab)] two-way binding */
  readonly activeTab = model('');
}
