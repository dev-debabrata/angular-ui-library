import type { ReactElement, ReactNode } from 'react';

export type NexPrimeProps = {
  /** Element name, e.g. "np-chart" */
  tag: `np-${string}`;
  /** Arrays, objects and functions: set as properties once the element is defined */
  props?: Record<string, unknown>;
  /** Output events, e.g. { submitted: (e) => save(e.detail) } */
  on?: Record<string, (event: CustomEvent) => void>;
  children?: ReactNode;
  /** Anything else (strings, numbers, booleans, id, className, style) is passed as an attribute */
  [attribute: string]: unknown;
};

/** Renders a NexPrime Web Component and gives it its properties and events once it is registered */
export function NexPrime(props: NexPrimeProps): ReactElement;

/** Registers every <np-*> element (once, browser only). Resolves when they are ready. */
export function loadNexPrime(): Promise<unknown>;

/** Where <np-icon> loads its SVG files from, e.g. '/icons/' or a CDN folder */
export function setIconsUrl(url: string): void;

/** Lets TSX use <np-*> tags directly */
declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      [tag: `np-${string}`]: any;
    }
  }
}
