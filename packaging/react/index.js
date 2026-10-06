'use client';
/**
 * React wrapper of the NexPrime Web Components (nexprime-ui/react). Shipped as-is in the npm package.
 * It loads nexprime-ui/elements in the browser only (SSR-safe for Next.js), then gives each element its properties
 * and event listeners once it is defined, so it works on React 18 and 19 and survives hydration.
 */
import { createElement, useEffect, useRef } from 'react';

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

/** Renders a NexPrime Web Component (tag="np-chart"); arrays, objects and functions go in `props`, events in `on` */
export function NexPrime({ tag, props, on, children, ...attributes }) {
  const ref = useRef(null);

  useEffect(() => {
    let current = true;
    loadNexPrime();
    customElements.whenDefined(tag).then(() => {
      if (current && ref.current && props) Object.assign(ref.current, props);
    });
    return () => {
      current = false;
    };
  }, [tag, props]);

  useEffect(() => {
    const el = ref.current;
    if (!el || !on) return;
    const listeners = Object.entries(on);
    for (const [name, fn] of listeners) el.addEventListener(name, fn);
    return () => {
      for (const [name, fn] of listeners) el.removeEventListener(name, fn);
    };
  }, [on]);

  // The element fills itself in on the client, so its server HTML is only a placeholder
  return createElement(tag, { ref, ...attributes, suppressHydrationWarning: true }, children);
}
