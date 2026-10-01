import { CURRENT_STORY_WAS_SET, GLOBALS_UPDATED } from 'storybook/internal/core-events';
import { type API, addons, types } from 'storybook/manager-api';

import {
  applyTheme,
  carryTheme,
  readThemeHash,
  saveTheme,
  savedTheme,
  themeHash,
  themeOf,
} from './nexui-theme';
import { APP_URL, SITE_PAGES, isLocal } from '../src/stories/getting-started/landing';
import { ModeTool, PaletteTool, SearchTool, managerTheme } from './theme-tools';

// A link from the Angular app brings its light/dark mode and theme color (themeHash in nexui-theme.ts)
readThemeHash();
/** The last light/dark mode and theme color the user picked (preview.ts starts the stories with it too) */
const saved = savedTheme();

// Storybook UI (sidebar, toolbar) branding in the saved mode and color. Storybook's own toolbar tools are hidden
// (with `features` in main.ts for backgrounds/grid, outline, measure and viewport); NexUI's are added below.
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
addons.register('nexui/theme', (api) => {
  for (const [id, title, Tool] of TOOLS) {
    addons.add(`nexui/${id}`, { type: types.TOOL, title, match: () => true, render: () => Tool() });
  }
  // A change from the toolbar: save it and restyle the Storybook UI. Storybook sends
  // GLOBALS_UPDATED on every render, so unchanged themes stop at applyTheme
  api.on(GLOBALS_UPDATED, ({ globals }: { globals: Record<string, string> }) => {
    const { theme, palette } = themeOf(globals);
    if (!applyTheme(document, theme, palette)) return;
    saveTheme(theme, palette);
    api.setOptions({ theme: managerTheme(theme, palette) });
  });
});

// The NexUI site's pages (Icons, Animations, NexLottie) are in the Angular app, not in Storybook: their sidebar
// entries open the app on that page, and so does a Storybook URL of one (location.replace: Back skips the entry)
const APP_PAGES = SITE_PAGES.filter(Boolean);
function openInApp(id: string | undefined) {
  const page = id?.split('--')[0];
  const appUrl =
    typeof window !== 'undefined' && window.location && !isLocal()
      ? `${window.location.origin}/`
      : APP_URL;
  if (page && APP_PAGES.includes(page)) location.replace(appUrl + page + themeHash());
}
openInApp(
  new URLSearchParams(location.search).get('path')?.split('/')[2] ??
    location.pathname.split('/').pop(),
);

// Short page URLs instead of ?path=/docs/…: "/" for Get Started (Welcome is in the Angular app), else the page's
// Storybook id as one path segment, without "--docs"/"--story" for a component's first page (/icons, /components-form-button-toggle). Other params
// stay. `middleware.mjs` serves them in the dev server.
// Storybook only reads ?path=, so a short URL becomes ?path= just before Storybook reads it: on Back/Forward (this
// listener comes before Storybook's) and on load. On load Storybook's router reads the URL right after calling
// replaceState(state with `idx`), which it only does when history.state has no `idx`: so `idx` is dropped and the
// URL is rewritten in that call (rewriting it now would show the long URL for a frame). Every ?path= Storybook
// writes is then shortened in a microtask, once its router has read it
/** The page at "/": Getting Started ▸ Use in React, Vue & Angular (a component id opens its first page) */
const HOME = 'getting-started-use-in-react-vue-angular';
const replace = history.replaceState.bind(history);
/** Storybook's API, once the addons have registered */
let manager: API | undefined;
function storybookUrl() {
  if (new URLSearchParams(location.search).has('path')) return undefined;
  const page = location.pathname.split('/').pop()!;
  let id = /^[\w-]+$/.test(page) ? page : HOME;
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
addEventListener('popstate', () => {
  const url = storybookUrl();
  if (url) replace(history.state, '', url);
  requestAnimationFrame(() => shorten());
});
addons.register('nexui/page-url', (api) => {
  manager = api;
  // Storybook's router has read the long URL by now
  if (opened) replace(history.state, '', pageUrl);
  shorten = () => {
    const url = new URL(location.href);
    const id = url.searchParams.get('path')?.split('/')[2];
    const entry = id ? api.resolveStory(id) : undefined;
    if (!id || !entry || entry.type === 'root') return;
    const parent = entry.parent ? api.resolveStory(entry.parent) : undefined;
    const first =
      entry.type === 'docs' || (parent?.type === 'component' && parent.children[0] === id);
    let page = first ? id.split('--')[0] : id;
    if (page === HOME) page = '';
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
  api.on(CURRENT_STORY_WAS_SET, () => {
    openInApp(api.getUrlState().storyId);
    shorten();
  });
});

// The sidebar logo (brandUrl = APP_URL) takes the light/dark mode and theme color to the app; on press, so the
// middle button and "Open in new tab" get it too
for (const type of ['mousedown', 'click']) {
  document.addEventListener(type, (event) => {
    const appUrl =
      typeof window !== 'undefined' && window.location && !isLocal()
        ? `${window.location.origin}/`
        : APP_URL;
    const link = (event.target as Element).closest?.<HTMLAnchorElement>(`a[href^="${appUrl}"]`);
    if (link) carryTheme(link);
  });
}

// Browser tab title: Storybook writes "Components / Button - Primary ⋅ Storybook"; show "NexUI - Button - Primary"
function renameTab() {
  const title = document.title;
  if (!title.includes('Storybook')) return;
  const parts = title
    .replace(/\s*\u22C5?\s*Storybook$/, '')
    .split(' - ')
    .map((part) => part.split(' / ').pop()!.trim())
    .filter((part, i, all) => part && part !== all[i - 1]);
  document.title = ['NexUI', ...parts].join(' - ');
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
