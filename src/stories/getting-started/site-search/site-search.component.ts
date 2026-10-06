import { Component, ElementRef, computed, inject, signal, viewChild } from '@angular/core';
import { Router } from '@angular/router';
import { SELECT_STORY } from 'storybook/internal/core-events';
import { addons } from 'storybook/preview-api';

import { IconComponent } from '../../components/media/icon/icon.component';
import { COMPONENT_ICONS } from '../components-catalog/components-catalog.component';
import { PAGES, SECTIONS, SITE_PAGES } from '../landing';

/** A result: `page` is a short URL (a site page or a Storybook id) */
interface Hit {
  group: string;
  label: string;
  detail: string;
  icon: string;
  page: string;
}

/** Storybook index entry (index.json, next to the preview's iframe.html) */
type Entry = { [K in 'id' | 'title' | 'name' | 'type' | 'importPath']: string } & {
  tags?: string[];
};

/** Group order; each shows its best 6 matches. Gallery results open their page searched for the name (?q=) */
const GALLERIES = ['Icons', 'Animations', 'Lottie'];
const GROUPS = [
  'Pages',
  'Components',
  'Getting Started',
  'Effects',
  'Onboarding',
  'Examples',
  ...GALLERIES,
];
const ROOT_ICONS: Record<string, string> = { Effects: 'sparkles', Onboarding: 'map' };

/** One result per gallery item (icon, animation, Lottie file); `icon` defaults to the item's name (icons) */
const gallery = <T extends { name: string }>(
  group: string,
  page: string,
  items: T[],
  icon: string,
  detail: (t: T) => string,
) =>
  items.map((t): Hit => ({ group, page, icon: icon || t.name, label: t.name, detail: detail(t) }));

/** Site-wide search (Ctrl/⌘ K or /): pages, components and their examples, icons, animations and Lottie files */
@Component({
  selector: 'np-site-search',
  imports: [IconComponent],
  templateUrl: './site-search.html',
  styleUrl: './site-search.css',
  host: { '(document:keydown)': 'onShortcut($event)' },
})
export class SiteSearchComponent {
  protected readonly query = signal('');
  /** Highlighted result (index in the flat list), moved by the arrow keys and the pointer */
  protected readonly active = signal(0);
  protected readonly loading = signal(false);
  private readonly all = signal<Hit[]>(
    SECTIONS.filter((s) => s.id !== 'onboarding').map(({ label, text, icon, path }) => ({
      group: 'Pages',
      label,
      detail: text,
      icon,
      page: path,
    })),
  );
  private readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('dlg');
  private readonly router = inject(Router, { optional: true });
  /** The search data, loaded on the first open */
  private data?: Promise<void>;

  /** Matches by group (every word must match), labels starting with the query first, each with its flat index */
  protected readonly groups = computed(() => {
    const q = this.query().trim().toLowerCase();
    const words = q.split(/\s+/).filter(Boolean);
    const rank = (h: Hit) => +!h.label.toLowerCase().startsWith(q);
    const hits = this.all().filter((h) =>
      q
        ? words.every((w) => `${h.label} ${h.detail}`.toLowerCase().includes(w))
        : h.group === 'Pages',
    );
    let i = 0;
    return GROUPS.map((name) => ({
      name,
      hits: hits
        .filter((h) => h.group === name)
        .sort((a, b) => rank(a) - rank(b))
        .slice(0, 6)
        .map((h) => ({ ...h, i: i++ })),
    })).filter((g) => g.hits.length);
  });
  private readonly flat = computed(() => this.groups().flatMap((g) => g.hits));

  open(): void {
    this.dialog().nativeElement.showModal();
    this.data ??= this.load();
  }

  protected go(h: Hit): void {
    this.dialog().nativeElement.close();
    // The site's own pages open in its router (with ?q= for the galleries); the rest open in Storybook
    const q = GALLERIES.includes(h.group) ? h.label : undefined;
    if (this.router && SITE_PAGES.includes(h.page)) {
      this.router.navigate(['/' + h.page], { queryParams: { q } });
    } else {
      addons
        .getChannel()
        .emit(SELECT_STORY, { storyId: h.page || 'getting-started-welcome--welcome' });
    }
  }

  protected onShortcut(e: KeyboardEvent): void {
    const typing = (e.target as HTMLElement).closest?.('input, textarea, [contenteditable]');
    if (((e.ctrlKey || e.metaKey) && e.key === 'k') || (e.key === '/' && !typing)) {
      e.preventDefault();
      if (!this.dialog().nativeElement.open) this.open();
    }
  }

  protected onKeydown(e: KeyboardEvent): void {
    const count = this.flat().length;
    if (!count || !['ArrowDown', 'ArrowUp', 'Enter'].includes(e.key)) return;
    e.preventDefault();
    if (e.key === 'Enter') return this.go(this.flat()[this.active()]);
    this.active.set((this.active() + (e.key === 'ArrowDown' ? 1 : count - 1)) % count);
    document.getElementById(`np-search-${this.active()}`)?.scrollIntoView({ block: 'nearest' });
  }

  /** Reads everything to search on the first open (the gallery data is the chunks the site preloads) */
  private async load(): Promise<void> {
    this.loading.set(true);
    const [index, icons, animations, lottie] = await Promise.all([
      fetch('./index.json').then((r) => r.json()),
      import('../../icons/icons-data'),
      import('../../animations/animations-data'),
      import('../../nexlottie/lottie-data'),
    ]);
    const hits: Hit[] = [];
    const seen = new Set<string>();
    for (const e of Object.values<Entry>(index.entries)) {
      // Only what the sidebar lists (`!dev` removes the `dev` tag), without the site's own pages
      if (!e.tags?.includes('dev') || e.tags.includes('np-landing')) continue;
      const path = e.title.split('/');
      const root = path[0];
      if (!seen.has(e.title) && seen.add(e.title)) {
        const folder = e.importPath.split('/').at(-2)!;
        const icon =
          root === 'Components'
            ? (COMPONENT_ICONS[folder] ?? 'box')
            : (ROOT_ICONS[root] ?? 'book-open');
        hits.push({
          group: root,
          label: path.at(-1)!,
          detail: path.slice(0, -1).join(' › '),
          icon,
          page: e.id.split('--')[0],
        });
      }
      if (e.type === 'story')
        hits.push({
          group: 'Examples',
          label: e.name,
          detail: path.join(' › '),
          icon: 'play',
          page: e.id,
        });
    }
    const tags = icons.TAGS as Record<string, string[]>;
    hits.push(
      ...gallery('Icons', PAGES.icons, icons.ICONS, '', (i) => tags[i.name]?.join(', ') || 'Icon'),
      ...gallery(
        'Animations',
        PAGES.animations,
        animations.ANIMATIONS,
        'sparkles',
        (a) => a.category,
      ),
      ...gallery('Lottie', PAGES.lottie, lottie.ANIMATIONS, 'clapperboard', () => 'Lottie file'),
    );
    this.all.update((pages) => [...pages, ...hits]);
    this.loading.set(false);
  }
}
