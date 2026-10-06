import { Component, afterNextRender, computed, signal } from '@angular/core';

import {
  ButtonToggleComponent,
  type ToggleOption,
} from '../../components/form/button-toggle/button-toggle.component';
import { SearchInputComponent } from '../../components/form/search-input/search-input.component';
import { IconComponent } from '../../components/media/icon/icon.component';
import { VERSION, managerHref } from '../landing';

/** Sidebar order and labels of the component groups */
const GROUPS: Record<string, string> = {
  form: 'Form',
  data: 'Data',
  panel: 'Panel',
  overlay: 'Overlay',
  menu: 'Menu',
  feedback: 'Feedback',
  media: 'Media',
  chat: 'Chat',
  misc: 'Misc',
};

/** Storybook index entry (index.json, next to the preview's iframe.html) */
interface IndexEntry {
  id: string;
  title: string;
  importPath: string;
  tags?: string[];
}

/** Lucide icon drawn on each card's preview, by component folder (also used by the site search) */
export const COMPONENT_ICONS: Record<string, string> = {
  accordion: 'list-collapse',
  alert: 'triangle-alert',
  'animate-on-scroll': 'mouse',
  avatar: 'circle-user',
  badge: 'badge',
  'bottom-sheet': 'panel-bottom',
  breadcrumb: 'chevrons-right',
  button: 'mouse-pointer-click',
  'button-toggle': 'columns-3',
  calendar: 'calendar',
  card: 'rectangle-horizontal',
  carousel: 'gallery-horizontal',
  chart: 'chart-line',
  chat: 'message-circle',
  checkbox: 'square-check',
  chip: 'tags',
  'confirm-dialog': 'message-square-warning',
  'confirm-popup': 'message-square-more',
  dialog: 'app-window',
  'file-upload': 'upload',
  form: 'clipboard-list',
  header: 'panel-top',
  helpful: 'thumbs-up',
  icon: 'shapes',
  'image-upload': 'image-up',
  inplace: 'pencil',
  'input-number': 'hash',
  'input-otp': 'key-round',
  lottie: 'clapperboard',
  'mega-menu': 'layout-grid',
  menu: 'menu',
  menubar: 'ellipsis',
  modal: 'picture-in-picture',
  'overlay-badge': 'bell-dot',
  'overlay-panel': 'message-square',
  page: 'file',
  pagination: 'ellipsis',
  'panel-menu': 'panel-left',
  'pick-list': 'arrow-left-right',
  'progress-bar': 'loader',
  'radio-group': 'circle-dot',
  rating: 'star',
  'scroll-top': 'arrow-up-to-line',
  'search-input': 'search',
  select: 'list-filter',
  skeleton: 'rectangle-ellipsis',
  spinner: 'loader-circle',
  stepper: 'list-ordered',
  table: 'table',
  tabs: 'panels-top-left',
  tag: 'tag',
  textarea: 'text',
  'text-input': 'text-cursor-input',
  'tiered-menu': 'list-tree',
  'time-picker': 'clock',
  timeline: 'git-commit-vertical',
  toast: 'bell',
  toggle: 'toggle-right',
  tooltip: 'message-square-text',
  tree: 'folder-tree',
  'tree-table': 'table-properties',
  'voice-chat': 'mic',
};

type View = 'grid' | 'compact' | 'list';

/** "View Components": a full-screen catalog of every component, grouped like the sidebar, like primeng.dev/components */
@Component({
  selector: 'np-components-catalog',
  imports: [ButtonToggleComponent, IconComponent, SearchInputComponent],
  templateUrl: './components-catalog.html',
  styleUrl: './components-catalog.css',
})
export class ComponentsCatalogComponent {
  protected readonly version = VERSION;
  protected readonly query = signal('');
  protected readonly view = signal<View>('grid');
  protected readonly views: ToggleOption<View>[] = [
    { value: 'grid', icon: 'grid-2x2', ariaLabel: 'Large cards' },
    { value: 'compact', icon: 'layout-grid', ariaLabel: 'Small cards' },
    { value: 'list', icon: 'list', ariaLabel: 'List' },
  ];

  /** Every component in the sidebar, from Storybook's own index: its group, title, link and preview icon */
  private readonly items = signal<
    { group: string; title: string; folder: string; href: string; icon: string }[]
  >([]);

  constructor() {
    afterNextRender(async () => {
      const { entries } = (await (await fetch('./index.json')).json()) as {
        entries: Record<string, IndexEntry>;
      };
      const byTitle = new Map<string, IndexEntry[]>();
      for (const e of Object.values(entries)) {
        const [root, group, name] = e.title.split('/');
        // Only what the sidebar lists: `!dev` in a story removes its `dev` tag
        if (root !== 'Components' || !name || !e.tags?.includes('dev')) continue;
        byTitle.set(e.title, [...(byTitle.get(e.title) ?? []), e]);
      }
      this.items.set(
        [...byTitle].map(([title, list]) => {
          const [entry] = list;
          const folder = entry.importPath.split('/').slice(-2, -1)[0];
          return {
            group: title.split('/')[1].toLowerCase(),
            title: title.split('/')[2],
            folder,
            // The component's id: Storybook opens its docs page if there is one, else the first story
            href: managerHref(entry.id.split('--')[0]),
            icon: COMPONENT_ICONS[folder] ?? 'box',
          };
        }),
      );
    });
  }

  protected readonly total = computed(() => this.items().length);

  protected readonly groups = computed(() => {
    const q = this.query().trim().toLowerCase();
    return Object.entries(GROUPS)
      .map(([key, label]) => ({
        key,
        label,
        items: this.items()
          .filter((i) => i.group === key && i.title.toLowerCase().includes(q))
          .sort((a, b) => a.title.localeCompare(b.title)),
      }))
      .filter((g) => g.items.length);
  });
}
