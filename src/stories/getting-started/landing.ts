/** Shared by the full-screen landing pages (Welcome, Components overview). Not part of the library */
// The npm package (src/package.json), not the repo's own package.json
import pkg from '../../package.json';

export const VERSION = `${pkg.name}@${pkg.version}`;

/**
 * Storybook pages by their short URL (see manager.ts): a Storybook id, or a component's id for its first page.
 * Landing pages run in the preview iframe; links open these in the manager
 */
export const PAGES = {
  welcome: '',
  catalog: 'components-overview',
  getStarted: 'getting-started-installation',
  icons: 'icons',
  animations: 'animations',
  lottie: 'nexlottie',
  textEditor: 'text-editor',
  effects: 'effects-overview',
  onboarding: 'onboarding-tour',
  about: 'about',
  contact: 'contact',
  privacy: 'privacy',
  terms: 'terms',
};

/**
 * Link into the Storybook manager, which sits next to the preview's iframe.html (use with target="_top").
 * preview.ts opens it in place, without reloading Storybook
 */
export function managerHref(page: string) {
  return `./${page}`;
}

/** The page a plain click on a managerHref link opens (none for new-tab clicks, other links or handled clicks) */
export function clickedPage(event: MouseEvent): string | undefined {
  const link = (event.target as Element).closest?.<HTMLAnchorElement>('a[target="_top"]');
  if (!link || event.defaultPrevented || event.button) return undefined;
  if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return undefined;
  const url = new URL(link.href);
  const page = url.pathname.split('/').pop()!;
  return url.origin === location.origin && !url.search && /^[\w-]*$/.test(page) ? page : undefined;
}

/** Pages of the NexPrime site: one Angular app (site/) whose router switches between them without Storybook */
export const SITE_PAGES = [
  PAGES.welcome,
  PAGES.catalog,
  PAGES.icons,
  PAGES.animations,
  PAGES.lottie,
  PAGES.textEditor,
  PAGES.effects,
  PAGES.about,
  PAGES.contact,
  PAGES.privacy,
  PAGES.terms,
];

/** How to reach the NexPrime team: shown by the site footer, About and Contact */
export const CONTACT = {
  email: 'debabratadas711@gmail.com',
  location: 'Kolkata, India',
  x: 'https://twitter.com/nexprime',
  npm: 'https://www.npmjs.com/package/nexprime',
};

/** The creators, with their LinkedIn profiles (replace the placeholder URLs with the real ones) */
export const AUTHORS = [
  {
    name: 'Debabrata Das',
    role: 'Co-creator',
    linkedin: 'https://www.linkedin.com/in/dev-debabrata/',
  },
  { name: 'Salman Ali', role: 'Co-creator', linkedin: '' },
];

/** Channel event: the site's page changed ({ page, title }); manager.ts shows it in the address bar and tab */
export const SITE_ROUTE = 'np/site-route';

/** Channel event from the top bar (manager.ts): open a site page (its short URL) in the site's router */
export const SITE_GO = 'np/site-go';

/** Channel event from the top bar (manager.ts): open the site search */
export const SITE_SEARCH = 'np/site-search';

/**
 * Channel event to the manager: open a page by its short URL (managerHref, '' for Welcome). manager.ts resolves it
 * like the address bar: Storybook's SELECT_STORY can't open a component hidden from the sidebar (Components/Overview)
 * or an MDX page's short id (getting-started-installation)
 */
export const OPEN_PAGE = 'np/open-page';

/** The site's sections, for the top bar (manager.ts) and Welcome's "Pick a place to start" cards */
export const SECTIONS = [
  {
    id: 'catalog',
    label: 'Components',
    icon: 'compass',
    path: PAGES.catalog,
    text: 'Forms, data, overlays, menus and more, grouped like the sidebar.',
  },
  {
    id: 'icons',
    label: 'Icons',
    icon: 'shapes',
    path: PAGES.icons,
    text: 'The full Lucide set in five styles. Search, customize and copy.',
  },
  {
    id: 'animations',
    label: 'Animations',
    icon: 'sparkles',
    path: PAGES.animations,
    text: 'Drop-in np-anim-* classes for entrances, attention and loops.',
  },
  {
    id: 'lottie',
    label: 'NexLottie',
    icon: 'clapperboard',
    path: PAGES.lottie,
    text: 'Hundreds of Lottie files with export to MP4, GIF and dotLottie.',
  },
  {
    id: 'text-editor',
    label: 'Text Editor',
    icon: 'type',
    path: PAGES.textEditor,
    text: 'Write documents in the browser and export them to Word, HTML or PDF.',
  },
  {
    id: 'effects',
    label: 'Effects',
    icon: 'waypoints',
    path: PAGES.effects,
    text: 'Particles, aurora, starfield, confetti and more, behind any content.',
  },
  {
    id: 'onboarding',
    label: 'Onboarding',
    icon: 'signpost',
    path: PAGES.onboarding,
    text: 'Product tours and checklists that guide new users step by step.',
  },
];
