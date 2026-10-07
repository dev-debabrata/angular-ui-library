import { NgComponentOutlet } from '@angular/common';
import { Component, afterNextRender, computed, input, signal } from '@angular/core';

import {
  ButtonToggleComponent,
  type ToggleOption,
} from '../../components/form/button-toggle/button-toggle.component';
import { SearchInputComponent } from '../../components/form/search-input/search-input.component';
import { IconComponent } from '../../components/media/icon/icon.component';
import { VERSION, managerHref } from '../landing';
import type { EffectPreview } from './effect-previews';

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

/**
 * What a catalog lists: the sidebar root its stories are under and their title depth (`Components/<Group>/<Name>`,
 * `Effects/<Name>`), its groups in order, and an entry's group and icon (from its title parts, folder and, for
 * effects, its preview)
 */
const KINDS = {
  components: {
    root: 'Components',
    depth: 3,
    noun: 'UI components',
    intro:
      ', crafted for real-world Angular applications and equally at home in React, Vue or plain HTML.',
    groups: GROUPS,
    group: (parts: string[]) => parts[1].toLowerCase(),
    icon: (folder: string) => COMPONENT_ICONS[folder],
  },
  effects: {
    root: 'Effects',
    depth: 2,
    noun: 'visual effects',
    intro:
      ': animated backgrounds, pointer trails and highlights that paint behind your content, in Angular, React, Vue or plain HTML.',
    groups: { canvas: 'Canvas', css: 'Pure CSS' } as Record<string, string>,
    group: (_parts: string[], preview?: EffectPreview) => (preview?.canvas ? 'canvas' : 'css'),
    icon: (_folder: string, preview?: EffectPreview) => preview?.icon,
  },
};

type View = 'grid' | 'compact' | 'list';

/**
 * "View Components": a full-screen catalog of every component, grouped like the sidebar, like primeng.dev/components.
 * The Effects page is the same catalog over the effects (`kind`, set by the site's route data)
 */
@Component({
  selector: 'np-components-catalog',
  imports: [ButtonToggleComponent, IconComponent, NgComponentOutlet, SearchInputComponent],
  templateUrl: './components-catalog.html',
  styleUrl: './components-catalog.css',
})
export class ComponentsCatalogComponent {
  /** What to list: the components or the effects */
  // The router's input binding sets it to undefined on routes without `kind` data (Components)
  readonly kind = input('components', {
    transform: (kind: keyof typeof KINDS | undefined) => kind ?? 'components',
  });

  protected readonly config = computed(() => KINDS[this.kind()]);
  protected readonly version = VERSION;
  protected readonly query = signal('');
  protected readonly view = signal<View>('grid');
  protected readonly views: ToggleOption<View>[] = [
    { value: 'grid', icon: 'grid-2x2', ariaLabel: 'Large cards' },
    { value: 'compact', icon: 'layout-grid', ariaLabel: 'Small cards' },
    { value: 'list', icon: 'list', ariaLabel: 'List' },
  ];

  /** Effects page: each card shows its effect running, by folder (loaded with the page) */
  protected readonly previews = signal<Record<string, EffectPreview>>({});

  /** Every component in the sidebar, from Storybook's own index: its group, title, link and preview icon */
  private readonly items = signal<
    { group: string; title: string; folder: string; href: string; icon: string }[]
  >([]);

  constructor() {
    afterNextRender(async () => {
      // The Effects page's previews load alongside the index, so its cards appear with their effects running
      // instead of the icon tile first
      const [{ entries }, previews] = await Promise.all([
        fetch('./index.json').then(
          (r) => r.json() as Promise<{ entries: Record<string, IndexEntry> }>,
        ),
        this.kind() === 'effects'
          ? import('./effect-previews').then((m) => m.EFFECT_PREVIEWS)
          : ({} as Record<string, EffectPreview>),
      ]);
      this.previews.set(previews);
      const { root, depth, group, icon } = this.config();
      // One entry per title (component), and only what the sidebar lists: `!dev` in a story removes its `dev` tag
      const byTitle = new Map<string, IndexEntry>();
      for (const e of Object.values(entries)) {
        const parts = e.title.split('/');
        if (parts[0] !== root || parts.length !== depth || !e.tags?.includes('dev')) continue;
        if (!byTitle.has(e.title)) byTitle.set(e.title, e);
      }
      this.items.set(
        [...byTitle].map(([title, entry]) => {
          const parts = title.split('/');
          const folder = entry.importPath.split('/').slice(-2, -1)[0];
          const preview = previews[folder];
          return {
            group: group(parts, preview),
            title: parts.at(-1)!,
            folder,
            // The component's id: Storybook opens its docs page if there is one, else the first story
            href: managerHref(entry.id.split('--')[0]),
            icon: icon(folder, preview) ?? 'box',
          };
        }),
      );
      this.loaded.set(true);
    });
  }

  /** False until index.json has been read: the page shows placeholder cards instead of "no match" */
  protected readonly loaded = signal(false);
  protected readonly total = computed(() => this.items().length);

  protected readonly groups = computed(() => {
    const q = this.query().trim().toLowerCase();
    return Object.entries(this.config().groups)
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
