import { RenderMode, ServerRoute } from '@angular/ssr';

/**
 * How each route is rendered: Server = on every request, Prerender = once at build time (static HTML),
 * Client = in the browser only. Add specific paths above '**' to mix them.
 */
export const serverRoutes: ServerRoute[] = [
  {
    path: '**',
    renderMode: RenderMode.Server,
  },
];
