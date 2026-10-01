import { Routes } from '@angular/router';

import {
  AnimationGalleryComponent,
  parseAnimations,
} from '../stories/animations/animation-gallery.component';
import { ComponentsCatalogComponent } from '../stories/getting-started/components-catalog/components-catalog.component';
import { PAGES } from '../stories/getting-started/landing';
import { WelcomeComponent } from '../stories/getting-started/welcome/welcome.component';
import { IconGalleryComponent } from '../stories/icons/icon-gallery.component';
import { LottieGalleryComponent } from '../stories/nexlottie/lottie-gallery.component';

// The pages' data is written by `npm run site-data` and loads when a page first opens
const icons = () => import('./site-data/icons.json').then((m) => m.default);

/** The NexUI site's pages at their short URLs; resolved data goes to the page's inputs */
export const routes: Routes = [
  { path: PAGES.welcome, pathMatch: 'full', title: 'NexUI - Welcome', component: WelcomeComponent },
  {
    path: PAGES.catalog,
    title: 'NexUI - Components',
    component: ComponentsCatalogComponent,
    resolve: { entries: () => import('./site-data/components.json').then((m) => m.default) },
  },
  {
    path: PAGES.icons,
    title: 'NexUI - Icons',
    component: IconGalleryComponent,
    resolve: { icons: () => icons().then((d) => d.icons), tags: () => icons().then((d) => d.tags) },
  },
  {
    path: PAGES.animations,
    title: 'NexUI - Animations',
    component: AnimationGalleryComponent,
    resolve: {
      animations: () =>
        import('./site-data/animations.json').then((m) => parseAnimations(m.default.css)),
    },
  },
  {
    path: PAGES.lottie,
    title: 'NexUI - NexLottie',
    component: LottieGalleryComponent,
    resolve: {
      // Lottie data is kept as strings in the JSON (see scripts/site-data.mjs)
      animations: () =>
        import('./site-data/lottie.json').then((m) =>
          m.default.map(({ name, data }) => ({ name, data: JSON.parse(data) })),
        ),
    },
  },
  { path: '**', redirectTo: '' },
];
