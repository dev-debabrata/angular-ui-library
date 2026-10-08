import type { DefineComponent } from 'vue';

export type NexPrimeIconProps = {
  size?: number | string;
  strokeWidth?: number | string;
  variant?: 'outline' | 'duotone' | 'gradient' | 'soft' | 'solid';
  color?: string;
  label?: string;
};

export type NexPrimeIcon = DefineComponent<NexPrimeIconProps>;

/** Creates a Vue icon component for an icon name in src/stories/icons/svg */
export function createIcon(name: string): NexPrimeIcon;

/** Registers every <np-*> element (once, browser only). Resolves when they are ready. */
export function loadNexPrime(): Promise<unknown>;

/** Where <np-icon> loads its SVG files from, e.g. '/icons/' or a CDN folder */
export function setIconsUrl(url: string): void;

export * from './icons';
