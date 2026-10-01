/// <reference types="vite/client" />
import type { GalleryAnimation } from './lottie-gallery.component';

/** Every .json in src/stories/nexlottie/files, read at build time, so new files appear automatically */
const files = import.meta.glob<GalleryAnimation['data']>('./files/*.json', {
  import: 'default',
  eager: true,
});

export const ANIMATIONS: GalleryAnimation[] = Object.entries(files)
  .map(([path, data]) => ({ name: path.split('/').pop()!.replace('.json', ''), data }))
  .sort((a, b) => a.name.localeCompare(b.name));
