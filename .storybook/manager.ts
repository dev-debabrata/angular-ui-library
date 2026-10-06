import {
  CURRENT_STORY_WAS_SET,
  DOCS_PREPARED,
  GLOBALS_UPDATED,
  STORY_PREPARED,
} from 'storybook/internal/core-events';
import { type API, addons, types } from 'storybook/manager-api';

import { applyTheme, saveTheme, savedTheme, themeOf } from './np-theme';
import { SITE_PAGES, SITE_ROUTE } from '../src/stories/getting-started/landing';
import { ModeTool, PaletteTool, SearchTool, managerTheme } from './theme-tools';

/** The last light/dark mode and theme color the user picked (preview.ts starts the stories with it too) */
const saved = savedTheme();

// Storybook UI (sidebar, toolbar) branding in the saved mode and color. Storybook's own toolbar tools are hidden
// (with `features` in main.ts for backgrounds/grid, outline, measure and viewport); NexPrime's are added below.
// The sidebar CSS in manager-head.html reads data-theme and --ui-primary from this page. Restart after editing
applyTheme(document, saved.theme, saved.palette);
addons.setConfig({
  theme: managerTheme(saved.theme, saved.palette),
  toolbar: Object.fromEntries(
    [
      'zoom',
      'remount',
      'fullscreen',
      'eject',
      'copy',
      'share',
      'isolationMode',
      'storybook/a11y/panel',
    ].map((id) => [id, { hidden: true }]),
  ),
});

// Toolbar: search, light/dark mode and theme color (PrimeNG-style). The choice is saved and comes back on reload
const TOOLS = [
  ['search', 'Search', SearchTool],
  ['mode', 'Light or dark mode', ModeTool],
  ['palette', 'Theme color', PaletteTool],
] as const;
addons.register('np/theme', (api) => {
  for (const [id, title, Tool] of TOOLS) {
    addons.add(`np/${id}`, { type: types.TOOL, title, match: () => true, render: () => Tool() });
  }
  // A change from the toolbar or the landing pages' top bar: save it and restyle the Storybook UI. Storybook sends
  // GLOBALS_UPDATED on every render, so unchanged themes stop at applyTheme
  api.on(GLOBALS_UPDATED, ({ globals }: { globals: Record<string, string> }) => {
    const { theme, palette } = themeOf(globals);
    if (!applyTheme(document, theme, palette)) return;
    saveTheme(theme, palette);
    api.setOptions({ theme: managerTheme(theme, palette) });
  });
});

// Short page URLs instead of ?path=/docs/…: "/" for Welcome, else the page's Storybook id as one path segment,
// without "--docs"/"--story" for a component's first page (/icons, /components-form-button-toggle). Other params
// stay. `middleware.mjs` serves them in the dev server.
// Storybook only reads ?path=, so a short URL becomes ?path= just before Storybook reads it: on Back/Forward (this
// listener comes before Storybook's) and on load. On load Storybook's router reads the URL right after calling
// replaceState(state with `idx`), which it only does when history.state has no `idx`: so `idx` is dropped and the
// URL is rewritten in that call (rewriting it now would show the long URL for a frame). Every ?path= Storybook
// writes is then shortened in a microtask, once its router has read it
const WELCOME = 'getting-started-welcome--welcome';
const replace = history.replaceState.bind(history);
/** Storybook's API, once the addons have registered */
let manager: API | undefined;
function storybookUrl() {
  if (new URLSearchParams(location.search).has('path')) return undefined;
  const page = location.pathname.split('/').pop()!;
  let id = /^[\w-]+$/.test(page) ? page : WELCOME;
  // Storybook opens a component's id only on load: on Back/Forward it becomes the component's first page
  const entry = manager?.resolveStory(id);
  if (entry?.type === 'component') id = entry.children[0];
  return `${location.pathname.replace(/[^/]*$/, '')}?path=/story/${id}${location.search.replace('?', '&')}`;
}
const pageUrl = location.href;
const opened = !!storybookUrl();
if (opened) {
  const { idx: _idx, ...state } = history.state ?? {};
  replace(state, '');
  history.replaceState = (state, unused, url) => replace(state, unused, url ?? storybookUrl());
}
let shorten = () => {};
/** The NexPrime site's current page and title (it routes without Storybook, see site.routes.ts) */
let site: { page: string; title: string } | undefined;
addEventListener('popstate', () => {
  const url = storybookUrl();
  if (url) replace(history.state, '', url);
  requestAnimationFrame(() => shorten());
});
addons.register('np/page-url', (api) => {
  manager = api;
  // Storybook's router has read the long URL by now
  if (opened) replace(history.state, '', pageUrl);
  shorten = () => {
    const url = new URL(location.href);
    const id = url.searchParams.get('path')?.split('/')[2];
    let page = site?.page;
    if (page === undefined) {
      const entry = id ? api.resolveStory(id) : undefined;
      if (!id || !entry || entry.type === 'root') return;
      const parent = entry.parent ? api.resolveStory(entry.parent) : undefined;
      const first =
        entry.type === 'docs' || (parent?.type === 'component' && parent.children[0] === id);
      page = id === WELCOME ? '' : first ? id.split('--')[0] : id;
    }
    url.searchParams.delete('path');
    // Mode and theme color are saved in localStorage (saveTheme), so they stay out of the URL
    const globals = url.searchParams
      .get('globals')
      ?.split(';')
      .filter((g) => !/^(theme|palette):/.test(g));
    if (globals?.length) url.searchParams.set('globals', globals.join(';'));
    else url.searchParams.delete('globals');
    url.pathname = url.pathname.replace(/[^/]*$/, page);
    replace(history.state, '', url.href);
  };
  for (const method of ['pushState', 'replaceState'] as const) {
    const write = method === 'pushState' ? history.pushState.bind(history) : replace;
    history[method] = (state, unused, url) => {
      write(state, unused, url);
      queueMicrotask(shorten);
    };
  }
  // The site's router changed page: show it in the address bar and tab, as if Storybook had opened it (Back and
  // Forward go through the router's history in the preview iframe). A Storybook page clears it
  const showPage = (route?: typeof site) => {
    site = route;
    shorten();
    renameTab();
  };
  api.on(CURRENT_STORY_WAS_SET, () => showPage());
  api.on(SITE_ROUTE, showPage);
  // The sidebar logo (brandUrl "/") opens Welcome in place instead of reloading Storybook; new-tab clicks keep it
  document.addEventListener('click', (event) => {
    const link = (event.target as Element).closest?.('.sidebar-header a[href="/"]');
    if (!link || event.button || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey)
      return;
    event.preventDefault();
    api.selectStory(WELCOME);
  });
});

// Browser tab title: Storybook writes "Components / Button - Primary ⋅ Storybook"; show "NexPrime - Button - Primary",
// or the site's page. Storybook's title is kept, since it can come before the site's page is cleared
let storybookTitle = '';
function renameTab() {
  if (document.title.includes('Storybook')) storybookTitle = document.title;
  const parts = storybookTitle
    .replace(/\s*\u22C5?\s*Storybook$/, '')
    .split(' - ')
    .map((part) => part.split(' / ').pop()!.trim())
    .filter((part, i, all) => part && part !== all[i - 1]);
  const title = site ? `NexPrime - ${site.title}` : ['NexPrime', ...parts].join(' - ');
  if (document.title !== title) document.title = title;
}
new MutationObserver(renameTab).observe(document.head, {
  subtree: true,
  childList: true,
  characterData: true,
});
renameTab();

// Storybook opens every sidebar group on page load. Keep one open: the group holding the page being viewed,
// or Getting Started when the page isn't in a group (e.g. Icons).
const collapseGroups = new MutationObserver(() => {
  const groups = [...document.querySelectorAll<HTMLElement>('.sidebar-subheading')];
  if (!groups.length) return;
  collapseGroups.disconnect();
  const selected = document
    .querySelector('.sidebar-item[data-selected="true"]')
    ?.getAttribute('data-item-id');
  const keep =
    groups.find((group) => selected?.startsWith(`${group.dataset.itemId}-`))?.dataset.itemId ??
    'getting-started';
  groups
    .filter((group) => group.dataset.itemId !== keep)
    .forEach((group) => group.querySelector<HTMLElement>('[aria-expanded="true"]')?.click());
});
collapseGroups.observe(document.body, { childList: true, subtree: true });

// Accordion at every level: opening a top-level group closes the other open one, and opening a sub-group
// (Components ▸ Form) or a component closes its open siblings (also when a story is picked from search)
new MutationObserver((mutations) => {
  for (const { target } of mutations) {
    const opened = target as HTMLElement;
    if (opened.getAttribute('aria-expanded') !== 'true') continue;
    const parent = opened.closest<HTMLElement>(
      '.sidebar-item:is([data-nodetype="component"], [data-nodetype="group"])',
    )?.dataset.parentId;
    const selector =
      opened.dataset.action === 'collapse-root'
        ? '[data-action="collapse-root"][aria-expanded="true"]'
        : parent &&
          `.sidebar-item:is([data-nodetype="component"], [data-nodetype="group"])[data-parent-id="${parent}"] > [aria-expanded="true"]`;
    if (!selector) continue;
    document
      .querySelectorAll<HTMLElement>(selector)
      .forEach((other) => other !== opened && other.click());
  }
}).observe(document.body, { subtree: true, attributes: true, attributeFilter: ['aria-expanded'] });

// Layout per page: `np-landing` pages (the NexPrime site: Welcome, Components, Icons, Animations, NexLottie) fill
// the window like a website: no sidebar, toolbar or addon panel. Elsewhere the panel stays as the user left it.
// Storybook asks layoutCustomisations on every render, the first one included, so a reload never shows the wrong
// layout. It follows the page the preview shows, not the one selected, so it doesn't change while the previous
// page is still on screen: STORY_PREPARED/DOCS_PREPARED come as the preview swaps pages (STORY_RENDERED is a second
// later), kept in addon state, which re-renders the manager. Before that, the page in the URL. Until the story
// index has loaded there are no tags, so these pages are also known by id
const LANDING = SITE_PAGES.map((page) => page || WELCOME.split('--')[0]);
const SHOWN = 'np/layout';
function isLanding(state: {
  storyId?: string;
  index?: Record<string, { tags?: string[] }>;
  addons?: Record<string, unknown>;
}) {
  const storyId = (state.addons?.[SHOWN] as string | undefined) ?? state.storyId ?? '';
  const tags = state.index?.[storyId]?.tags;
  const landing = tags ? tags.includes('np-landing') : LANDING.includes(storyId.split('--')[0]);
  // The toolbar is hidden with CSS (manager-head.html): Storybook keeps a hidden toolbar's landmark registered
  // without an element, and showing the sidebar later then crashes the manager UI
  document.documentElement.dataset['npLayout'] = landing ? 'landing' : 'default';
  return landing;
}
addons.setConfig({
  layoutCustomisations: {
    showSidebar: (state) => !isLanding(state),
    showPanel: (state) => (isLanding(state) ? false : undefined),
  },
});
addons.register(SHOWN, (api) => {
  const shown = ({ id }: { id: string }) => api.setAddonState(SHOWN, id);
  api.on(STORY_PREPARED, shown);
  api.on(DOCS_PREPARED, shown);
});
