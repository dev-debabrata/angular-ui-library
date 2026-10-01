/** Shared by the NexUI site's pages (the Angular app, src/app) and Storybook's config. Not part of the library */
// The npm package's version (src/stories/package.json)
import pkg from '../package.json';

export const VERSION = `nexui@${pkg.version}`;

/** The Angular app (`npm start`), home of the NexUI site; Storybook's logo and site entries open it */
export const APP_URL = 'http://localhost:4200/';

/** Storybook (`npm run storybook`), where the site's links to other pages go: component docs, Get Started, Effects */
export const STORYBOOK_URL = 'http://localhost:6006/';

/** Link to a page by its short URL (see manager.ts): the site's pages stay in the app, the others open Storybook */
export function pageHref(page: string) {
  return (SITE_PAGES.includes(page) ? './' : STORYBOOK_URL) + page;
}

/**
 * Storybook pages by their short URL (see manager.ts): a Storybook id, or a component's id for its first page.
 * The site's own pages (SITE_PAGES) open in the app's router, the others in Storybook (pageHref)
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

/** Pages of the NexUI site, all in the Angular app (`npm start`): its router switches between them. Storybook's
 *  Icons, Animations and NexLottie entries open them there (manager.ts) */
export const SITE_PAGES = [
  PAGES.welcome,
  PAGES.catalog,
  PAGES.icons,
  PAGES.animations,
  PAGES.lottie,
];

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
    text: 'Drop-in nex-anim-* classes for entrances, attention and loops.',
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
