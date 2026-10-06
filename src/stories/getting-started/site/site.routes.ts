import { Injectable } from '@angular/core';
import {
  type RouterStateSnapshot,
  type Routes,
  TitleStrategy,
  provideRouter,
  withComponentInputBinding,
  withDisabledInitialNavigation,
  withHashLocation,
  withInMemoryScrolling,
} from '@angular/router';
import { addons } from 'storybook/preview-api';

import { AnimationGalleryComponent } from '../../animations/animation-gallery.component';
import { IconGalleryComponent } from '../../icons/icon-gallery.component';
import { LottieGalleryComponent } from '../../nexlottie/lottie-gallery.component';
import { ComponentsCatalogComponent } from '../components-catalog/components-catalog.component';
import { PAGES, SITE_ROUTE } from '../landing';
import { WelcomeComponent } from '../welcome/welcome.component';

// The galleries' data is big (~2,000 SVGs, 236 Lottie files), so it loads on its own, not with Welcome
const icons = () => import('../../icons/icons-data');
const animations = () => import('../../animations/animations-data');
const lottie = () => import('../../nexlottie/lottie-data');

/** Loads every page's data, so opening a page doesn't wait for it (preview.ts calls this after the first page) */
export function preloadSiteData() {
  return Promise.all([icons(), animations(), lottie()]);
}

/** The site's pages. Paths are the pages' short URLs; resolved data goes to the page's inputs */
const routes: Routes = [
  { path: PAGES.welcome, pathMatch: 'full', title: 'Welcome', component: WelcomeComponent },
  { path: PAGES.catalog, title: 'Components', component: ComponentsCatalogComponent },
  {
    path: PAGES.icons,
    title: 'Icons',
    component: IconGalleryComponent,
    resolve: { icons: () => icons().then((m) => m.ICONS), tags: () => icons().then((m) => m.TAGS) },
  },
  {
    path: PAGES.animations,
    title: 'Animations',
    component: AnimationGalleryComponent,
    resolve: { animations: () => animations().then((m) => m.ANIMATIONS) },
  },
  {
    path: PAGES.lottie,
    title: 'NexLottie',
    component: LottieGalleryComponent,
    resolve: { animations: () => lottie().then((m) => m.ANIMATIONS) },
  },
  { path: '**', redirectTo: '' },
];

/** Tells the manager the page's short URL and title, for the address bar and the tab (manager.ts) */
@Injectable()
class ManagerTitle extends TitleStrategy {
  override updateTitle(snapshot: RouterStateSnapshot) {
    const page = snapshot.url.slice(1);
    addons.getChannel().emit(SITE_ROUTE, { page, title: this.buildTitle(snapshot) });
  }
}

/**
 * The router keeps its URL in the preview iframe's hash, so Back/Forward work through the browser's history; the
 * story opens the first page itself (SiteComponent's `page`)
 */
export const SITE_PROVIDERS = [
  provideRouter(
    routes,
    withHashLocation(),
    withComponentInputBinding(),
    withDisabledInitialNavigation(),
    withInMemoryScrolling({ scrollPositionRestoration: 'top' }),
  ),
  { provide: TitleStrategy, useClass: ManagerTitle },
];
