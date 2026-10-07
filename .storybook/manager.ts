import {
  CURRENT_STORY_WAS_SET,
  DOCS_PREPARED,
  GLOBALS_UPDATED,
  STORY_PREPARED,
} from 'storybook/internal/core-events';
import { type API, addons } from 'storybook/manager-api';

import { PALETTES, applyTheme, saveTheme, savedTheme, themeOf } from './np-theme';
import {
  OPEN_PAGE,
  PAGES,
  SECTIONS,
  SITE_GO,
  SITE_PAGES,
  SITE_ROUTE,
  SITE_SEARCH,
} from '../src/stories/getting-started/landing';
import { ICONS, managerTheme } from './theme-tools';

/** The last light/dark mode and theme color the user picked (preview.ts starts the stories with it too) */
const saved = savedTheme();

// Storybook UI (sidebar, toolbar) branding in the saved mode and color. Storybook's own toolbar tools are hidden
// (with `features` in main.ts for backgrounds/grid, outline, measure and viewport); search, mode and theme color
// are in the top bar (below).
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

addons.register('np/theme', (api) => {
  // A change from either top bar: save it and restyle the Storybook UI. Storybook sends
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
/**
 * Opens a page by its short URL, like the address bar does: a component's id opens its first page (also when it's
 * hidden from the sidebar, which selectStory alone can't), an MDX page's id its docs, '' Welcome
 */
function openPage(api: API, page: string) {
  const entry = page ? (api.resolveStory(page) ?? api.resolveStory(`${page}--docs`)) : undefined;
  api.selectStory(entry?.type === 'component' ? entry.children[0] : (entry?.id ?? (page || WELCOME)));
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
  // Links from the site's pages and its search (preview.ts, site-search)
  api.on(OPEN_PAGE, (page: string) => openPage(api, page));
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

/** Runs `listener` with the id of each page the preview shows (STORY_PREPARED/DOCS_PREPARED, as it swaps pages) */
function onShown(api: API, listener: (page: { id: string }) => void) {
  api.on(STORY_PREPARED, listener);
  api.on(DOCS_PREPARED, listener);
}

// Accordion: opening a top-level group closes the other open one, and opening a component closes its open siblings
// (also when a story is picked from search). Groups inside Components (Form, Data, …) are headings that stay open:
// closed ones are opened as they appear (programmatic clicks aren't trusted, so the click handler below lets them
// through). Only a row's own button (its first child) counts: the dev server's "⋯" test menu button is a later
// sibling with aria-expanded too, and clicking it opens that menu
new MutationObserver((mutations) => {
  document
    .querySelectorAll<HTMLElement>(
      '.sidebar-item[data-nodetype="group"] > [aria-expanded="false"]:first-child',
    )
    .forEach((group) => group.click());
  for (const { target } of mutations) {
    const opened = target as HTMLElement;
    if (opened.getAttribute?.('aria-expanded') !== 'true') continue;
    const row = opened.closest<HTMLElement>('.sidebar-item');
    if (row && opened !== row.firstElementChild) continue;
    const selector =
      opened.dataset.action === 'collapse-root'
        ? '[data-action="collapse-root"][aria-expanded="true"]'
        : row?.dataset['nodetype'] === 'component' &&
          `.sidebar-item[data-nodetype="component"][data-parent-id="${row.dataset['parentId']}"] > [aria-expanded="true"]:first-child`;
    if (!selector) continue;
    document
      .querySelectorAll<HTMLElement>(selector)
      .forEach((other) => other !== opened && other.click());
  }
}).observe(document.body, {
  childList: true,
  subtree: true,
  attributes: true,
  attributeFilter: ['aria-expanded'],
});

// Components like PrimeNG's docs (styles in manager-head.html): a component is one link to its first page (its
// docs), its stories hidden. A click on a component opens it without toggling it; a click on a group does nothing
addons.register('np/sidebar-components', (api) => {
  document.addEventListener(
    'click',
    (event) => {
      const button = (event.target as Element).closest?.('.sidebar-item > button:first-child');
      const row = button?.parentElement;
      if (!event.isTrusted || !row?.matches('[data-nodetype="component"], [data-nodetype="group"]'))
        return;
      event.preventDefault();
      event.stopPropagation();
      if (row.dataset['nodetype'] === 'component') api.selectStory(row.dataset['itemId']);
    },
    true,
  );
  // The current component gets the selected look (its own row is never the selected one: its pages are hidden)
  const current = document.head.appendChild(document.createElement('style'));
  current.id = 'np-current-component';
  onShown(api, ({ id }) => {
    const row = `.sidebar-item[data-nodetype='component'][data-item-id='${id.split('--')[0]}']`;
    current.textContent = `${row}::before { content: '' } ${row} > button { color: var(--nav-text) !important; font-weight: 500 }`;
  });
});

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
addons.register(SHOWN, (api) => onShown(api, ({ id }) => api.setAddonState(SHOWN, id)));

// Top bar of every page (like quilljs.com/docs): logo, section links, search, light/dark mode, theme color and Get
// Started, its content centered in 1200px. It sits above Storybook's layout, so it stays put across page changes.
// Links are short URLs (new-tab clicks keep them). A plain click on a site page while the site is shown goes to the
// site's router (SITE_GO, no story load); other clicks open the page in Storybook. Search opens the site search
// (SITE_SEARCH) on the site's pages and the sidebar search elsewhere. A section is current while the page's id starts
// with the first word of its own (components-…, effects-…). Onboarding has no page of its own
const TOP_LINKS = SECTIONS.filter((s) => s.id !== 'onboarding').map(({ label, path }) => ({
  label,
  path,
  prefix: path.split(/--|-/)[0],
}));
const icon = (name: string) =>
  `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name]}</svg>`;
addons.register('np/topbar', (api) => {
  const bar = document.createElement('header');
  bar.id = 'np-topbar';
  bar.innerHTML = `
    <nav class="np-topbar__inner" aria-label="NexPrime">
      <a class="np-topbar__brand" href="./" data-page="" aria-label="NexPrime home">
        <img src="favicon.svg" alt="" width="28" height="28" /><span>Nex<b>Prime</b></span>
      </a>
      <div class="np-topbar__links">
        ${TOP_LINKS.map(
          ({ label, path, prefix }) =>
            `<a href="./${path}" data-page="${path}" data-prefix="${prefix}">${label}</a>`,
        ).join('')}
      </div>
      <div class="np-topbar__tools">
        <button type="button" class="np-topbar__tool" data-tool="search" aria-label="Search components" title="Search components">${icon('search')}</button>
        <button type="button" class="np-topbar__tool" data-tool="mode"></button>
        <div class="np-topbar__palette">
          <button type="button" class="np-topbar__tool" data-tool="palette" aria-label="Theme color" title="Theme color" aria-expanded="false">${icon('palette')}</button>
          <div class="np-topbar__menu" role="menu" aria-label="Theme color" hidden>
            ${Object.entries(PALETTES)
              .map(
                ([key, p]) =>
                  `<button type="button" role="menuitemradio" class="np-topbar__swatch" data-palette="${key}" aria-label="${p.label}" title="${p.label}" style="background: linear-gradient(135deg, ${p.primary}, ${p.accent}); --swatch: ${p.primary}"></button>`,
              )
              .join('')}
          </div>
        </div>
      </div>
      <a class="np-topbar__start" href="./${PAGES.getStarted}" data-page="${PAGES.getStarted}">Get Started</a>
    </nav>`;
  document.body.prepend(bar);
  const menu = bar.querySelector<HTMLElement>('.np-topbar__menu')!;
  const paletteButton = bar.querySelector<HTMLElement>('[data-tool="palette"]')!;
  const showMenu = (open: boolean) => {
    menu.hidden = !open;
    paletteButton.setAttribute('aria-expanded', String(open));
  };

  // Mode icon and the checked swatch follow the page's data-np-theme ("dark|teal", set by applyTheme)
  const modeButton = bar.querySelector<HTMLElement>('[data-tool="mode"]')!;
  const sync = () => {
    const [mode, palette] = (document.documentElement.dataset['npTheme'] ?? 'light|').split('|');
    const dark = mode === 'dark';
    modeButton.innerHTML = icon(dark ? 'sun' : 'moon');
    modeButton.title = dark ? 'Light mode' : 'Dark mode';
    modeButton.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
    for (const swatch of menu.querySelectorAll<HTMLElement>('[data-palette]')) {
      const on = swatch.dataset['palette'] === (palette in PALETTES ? palette : 'indigo');
      swatch.classList.toggle('np-topbar__swatch--on', on);
      swatch.setAttribute('aria-checked', String(on));
      swatch.innerHTML = on ? icon('check') : '';
    }
  };
  sync();
  new MutationObserver(sync).observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-np-theme'],
  });

  bar.addEventListener('click', (event) => {
    const target = event.target as Element;
    const tool = target.closest<HTMLElement>('[data-tool]')?.dataset['tool'];
    const swatch = target.closest<HTMLElement>('[data-palette]')?.dataset['palette'];
    const onSite = document.documentElement.dataset['npLayout'] === 'landing';
    if (tool === 'search' && onSite) {
      api.emit(SITE_SEARCH);
    } else if (tool === 'search') {
      if (!api.getIsNavShown()) api.toggleNav(true);
      setTimeout(() => api.focusOnUIElement('storybook-explorer-searchfield'));
    } else if (tool === 'mode') {
      const dark = document.documentElement.dataset['theme'] === 'dark';
      api.updateGlobals({ theme: dark ? 'light' : 'dark' });
    } else if (tool === 'palette') {
      showMenu(menu.hidden !== false);
    } else if (swatch) {
      api.updateGlobals({ palette: swatch });
      showMenu(false);
    }
    const link = target.closest<HTMLAnchorElement>('a[data-page]');
    if (!link || event.button || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey)
      return;
    event.preventDefault();
    const page = link.dataset['page']!;
    if (onSite && SITE_PAGES.includes(page)) api.emit(SITE_GO, page);
    else openPage(api, page);
  });
  // The color menu closes on an outside click or Escape
  document.addEventListener('click', (event) => {
    if (!menu.hidden && !(event.target as Element).closest?.('.np-topbar__palette'))
      showMenu(false);
  });
  bar.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !menu.hidden) {
      showMenu(false);
      paletteButton.focus();
    }
  });

  const markCurrent = ({ id }: { id: string }) => {
    for (const link of bar.querySelectorAll<HTMLAnchorElement>('a[data-prefix]')) {
      if (id.startsWith(link.dataset['prefix']!)) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    }
  };
  onShown(api, markCurrent);
  // The site's router changed page (the site's stories all start on their own page, so the story id isn't it)
  api.on(SITE_ROUTE, ({ page }: { page: string }) => markCurrent({ id: page }));
});
