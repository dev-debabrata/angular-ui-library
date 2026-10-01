/**
 * NexUI toolbar buttons (PrimeNG-style): search, light/dark mode and theme color. They replace Storybook's
 * default toolbar tools (see `features` in main.ts and `toolbar` in manager.ts). Written with createElement, so
 * the manager needs no JSX setup. Icon shapes are Lucide (src/stories/icons/svg).
 */
import React from 'react';
import { IconButton, WithTooltip } from 'storybook/internal/components';
import { useGlobals, useStorybookApi } from 'storybook/manager-api';
import { create } from 'storybook/theming';

import { PALETTES, paletteColors } from './nexui-theme';
import { APP_URL } from '../src/stories/getting-started/landing';

const h = React.createElement;

/** Inner markup of the Lucide icons the toolbar uses */
const ICONS: Record<string, string> = {
  search: '<path d="m21 21-4.34-4.34"/><circle cx="11" cy="11" r="8"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>',
  moon: '<path d="M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401"/>',
  palette:
    '<path d="M12 22a1 1 0 0 1 0-20 10 9 0 0 1 10 9 5 5 0 0 1-5 5h-2.25a1.75 1.75 0 0 0-1.4 2.8l.3.4a1.75 1.75 0 0 1-1.4 2.8z"/><circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/>',
};

/** A toolbar button with a 16px Lucide icon */
const tool = (label: string, icon: string, onClick?: () => void) =>
  h(
    IconButton,
    { title: label, 'aria-label': label, onClick },
    h('svg', {
      width: 16,
      height: 16,
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      strokeWidth: 2,
      strokeLinecap: 'round',
      strokeLinejoin: 'round',
      'aria-hidden': true,
      dangerouslySetInnerHTML: { __html: ICONS[icon] },
    }),
  );

/** Storybook UI theme (sidebar, toolbar) for a mode and palette */
export function managerTheme(mode: string | undefined, palette: string | undefined) {
  const colors = paletteColors(palette);
  const dark = mode === 'dark';
  return create({
    base: dark ? 'dark' : 'light',
    brandTitle: 'NexUI — Next-generation UI',
    // The logo opens Welcome, which is only in the Angular app
    brandUrl: APP_URL,
    brandTarget: '_self',
    // public/nexui-brand-*.svg: logo tile plus "NexUI", in the text color of each mode
    brandImage: dark ? 'nexui-brand-dark.svg' : 'nexui-brand-light.svg',
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

/** Focuses the sidebar search (and shows the sidebar first if it's hidden) */
export function SearchTool() {
  const api = useStorybookApi();
  return tool('Search components', 'search', () => {
    if (!api.getIsNavShown()) api.toggleNav(true);
    setTimeout(() => api.focusOnUIElement('storybook-explorer-searchfield'));
  });
}

export function ModeTool() {
  const [globals, updateGlobals] = useGlobals();
  const dark = globals['theme'] === 'dark';
  return tool(dark ? 'Switch to light mode' : 'Switch to dark mode', dark ? 'sun' : 'moon', () =>
    updateGlobals({ theme: dark ? 'light' : 'dark' }),
  );
}

/** Theme color menu: one swatch per palette */
export function PaletteTool() {
  const [globals, updateGlobals] = useGlobals();
  const current = globals['palette'] ?? 'indigo';
  const menu = ({ onHide }: { onHide: () => void }) =>
    h(
      'div',
      {
        role: 'menu',
        'aria-label': 'Theme color',
        style: { display: 'grid', gridTemplateColumns: 'repeat(4, 28px)', gap: 10, padding: 14 },
      },
      ...Object.entries(PALETTES).map(([key, p]) =>
        h('button', {
          key,
          type: 'button',
          role: 'menuitemradio',
          'aria-checked': key === current,
          'aria-label': p.label,
          title: p.label,
          onClick: () => {
            updateGlobals({ palette: key });
            onHide();
          },
          style: {
            width: 28,
            height: 28,
            padding: 0,
            border: 0,
            borderRadius: 8,
            cursor: 'pointer',
            background: `linear-gradient(135deg, ${p.primary}, ${p.accent})`,
            boxShadow: key === current ? `0 0 0 2px #fff, 0 0 0 4px ${p.primary}` : 'none',
          },
        }),
      ),
    );
  return h(
    WithTooltip,
    { placement: 'bottom', trigger: 'click', closeOnOutsideClick: true, tooltip: menu },
    tool('Theme color', 'palette'),
  );
}
