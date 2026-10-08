/**
 * Vue icon components of NexPrime (nexprime/vue). Shipped as-is in the npm package.
 * Each icon renders <np-icon name="…">; nexprime/elements is loaded in the browser only (SSR-safe for Nuxt).
 */
import { defineComponent, h, onMounted } from 'vue';

let loading;

/** Registers every <np-*> element (once). Resolves when they are ready. */
export function loadNexPrime() {
  if (typeof window === 'undefined') return Promise.resolve();
  loading ??= import('../elements/nexprime.js');
  return loading;
}

/** Where <np-icon> loads its SVG files from, e.g. '/icons/' or a CDN folder */
export function setIconsUrl(url) {
  if (typeof window !== 'undefined') window.NEXPRIME_ICONS_URL = url;
}

/** Creates a Vue icon component for an icon name in src/stories/icons/svg */
export function createIcon(name) {
  const displayName = name.split('-').map((s) => s.charAt(0).toUpperCase() + s.slice(1)).join('');
  return defineComponent({
    name: displayName,
    props: {
      size: [Number, String],
      strokeWidth: [Number, String],
      variant: String,
      color: String,
      label: String,
    },
    setup(props) {
      onMounted(loadNexPrime);
      // Render functions create <np-icon> as a plain element, so no isCustomElement config is needed
      return () =>
        h('np-icon', {
          name,
          size: props.size,
          'stroke-width': props.strokeWidth,
          variant: props.variant,
          label: props.label,
          style: props.color ? { color: props.color } : undefined,
        });
    },
  });
}

export * from './icons.js';
