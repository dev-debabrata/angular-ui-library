import { Component, booleanAttribute, input, model } from '@angular/core';

import { IconComponent } from '../../media/icon/icon.component';

export interface Tab {
  id: string;
  label: string;
  content: string;
  /** Icon file name, e.g. 'user' */
  icon?: string;
  /** Small count or label after the text, e.g. 3 or 'New' */
  badge?: string | number;
  disabled?: boolean;
}

export const TAB_VARIANTS = ['pill', 'underline', 'boxed', 'solid', 'minimal'] as const;
export type TabVariant = (typeof TAB_VARIANTS)[number];

let nextId = 0;

@Component({
  selector: 'np-tabs',
  imports: [IconComponent],
  templateUrl: './tabs.html',
  styleUrl: './tabs.css',
})
export class TabsComponent {
  /** Tab definitions */
  readonly tabs = input<Tab[]>([]);

  /** id of the selected tab. Supports [(activeTab)] two-way binding */
  readonly activeTab = model('');

  /** Look: pill (segmented), underline, boxed (folder tabs), solid (gradient) or minimal */
  readonly variant = input<TabVariant>('pill');

  /** Tabs in a column beside the content */
  readonly vertical = input(false, { transform: booleanAttribute });

  /** Tabs share the full width equally */
  readonly stretch = input(false, { transform: booleanAttribute });

  /** Prefix for the tab and panel ids (aria-controls) */
  protected readonly uid = `np-tabs-${nextId++}`;
  /** Arrow keys (Up/Down when vertical), Home and End move to the next enabled tab, like a native tab list */
  protected onKeydown(event: KeyboardEvent) {
    const enabled = this.tabs().filter((t) => !t.disabled);
    const index = enabled.findIndex((t) => t.id === this.activeTab());
    const [back, forward] = this.vertical() ? ['ArrowUp', 'ArrowDown'] : ['ArrowLeft', 'ArrowRight'];
    const next = {
      [back]: index - 1,
      [forward]: index + 1,
      Home: 0,
      End: enabled.length - 1,
    }[event.key];
    if (next === undefined || !enabled.length) return;
    event.preventDefault();
    const tab = enabled[(next + enabled.length) % enabled.length];
    this.activeTab.set(tab.id);
    (event.currentTarget as HTMLElement)
      .querySelector<HTMLElement>(`#${this.uid}-tab-${CSS.escape(tab.id)}`)
      ?.focus();
  }
}
