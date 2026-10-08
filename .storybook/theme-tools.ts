/**
 * Storybook UI theme, and the icons of the top bar's search, light/dark mode and theme color buttons (manager.ts).
 * Icon shapes are Lucide (src/stories/icons/svg).
 */
import { create } from 'storybook/theming';

import { paletteColors } from './np-theme';

/** Inner markup of the Lucide icons the top bar uses */
export const ICONS: Record<string, string> = {
  check: '<path d="M20 6 9 17l-5-5"/>',
  menu: '<path d="M4 6h16"/><path d="M4 12h16"/><path d="M4 18h16"/>',
  x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  plus: '<path d="M5 12h14"/><path d="M12 5v14"/>',
  search: '<path d="m21 21-4.34-4.34"/><circle cx="11" cy="11" r="8"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>',
  moon: '<path d="M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401"/>',
  palette:
    '<path d="M12 22a1 1 0 0 1 0-20 10 9 0 0 1 10 9 5 5 0 0 1-5 5h-2.25a1.75 1.75 0 0 0-1.4 2.8l.3.4a1.75 1.75 0 0 1-1.4 2.8z"/><circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/>',
};

/** Storybook UI theme (sidebar, toolbar) for a mode and palette */
export function managerTheme(mode: string | undefined, palette: string | undefined) {
  const colors = paletteColors(palette);
  const dark = mode === 'dark';
  return create({
    base: dark ? 'dark' : 'light',
    brandTitle: 'NexPrime — One UI system for every framework',
    brandUrl: '/',
    brandTarget: '_self',
    // public/nexprime-brand-*.svg: the NP icon plus "NexPrime", in the text color of each mode
    brandImage: dark ? 'nexprime-brand-dark.svg' : 'nexprime-brand-light.svg',
    colorPrimary: colors.accent,
    colorSecondary: colors.primary,
    barSelectedColor: colors.primary,
    appBorderRadius: 10,
    fontBase: "'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    ...(dark && {
      appBg: '#0b1222',
      appContentBg: '#0f172a',
      appPreviewBg: '#0f172a',
      appBorderColor: '#1e293b',
      barBg: '#0f172a',
      textColor: '#e2e8f0',
      textMutedColor: '#94a3b8',
      inputBg: '#1e293b',
      inputBorder: '#334155',
    }),
  });
}
