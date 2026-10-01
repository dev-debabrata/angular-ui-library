/// <reference types="vite/client" />
import type { GalleryIcon } from './icon-gallery.component';

export { default as TAGS } from './svg/tags.json';

/** Every .svg in src/stories/icons/svg, read at build time, so new files appear automatically */
const files = import.meta.glob<string>('./svg/*.svg', {
  query: '?raw',
  import: 'default',
  eager: true,
});

export const ICONS: GalleryIcon[] = Object.entries(files)
  .map(([path, svg]) => ({ name: path.split('/').pop()!.replace('.svg', ''), svg }))
  .sort((a, b) => a.name.localeCompare(b.name));
