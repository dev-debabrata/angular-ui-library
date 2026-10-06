/** Shared by the full-screen landing pages (Welcome, Components overview). Not part of the library */
import pkg from '../../../package.json';

export const VERSION = `${pkg.name}@${pkg.version}`;

/**
 * Storybook pages by their short URL (see manager.ts): a Storybook id, or a component's id for its first page.
 * Landing pages run in the preview iframe; links open these in the manager
 */
export const PAGES = {
  welcome: '',
  catalog: 'components-overview',
  getStarted: 'getting-started-use-in-react-vue-angular',
  icons: 'icons',
  animations: 'animations',
  lottie: 'nexlottie',
  effects: 'effects-particles--hero',
  onboarding: 'onboarding-tour',
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
];

/** Channel event: the site's page changed ({ page, title }); manager.ts shows it in the address bar and tab */
export const SITE_ROUTE = 'np/site-route';

/** The site's sections, for the landing nav and Welcome's "Pick a place to start" cards */
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
