/**
 * Light/dark mode and theme colors for the whole Storybook. They are Storybook globals (`theme`, `palette`):
 * the toolbar (manager.ts) and the landing pages' top bar change them, preview.ts applies them to the page as
 * `data-theme` plus the primary/accent CSS variables, and manager.ts remembers them in localStorage.
 */

/** Theme colors offered in the palette menu; indigo is the Aurora default in theme.css */
export const PALETTES: Record<
  string,
  { label: string; primary: string; hover: string; accent: string }
> = {
  indigo: { label: 'Indigo', primary: '#6366f1', hover: '#4f46e5', accent: '#a855f7' },
  violet: { label: 'Violet', primary: '#8b5cf6', hover: '#7c3aed', accent: '#ec4899' },
  purple: { label: 'Purple', primary: '#a855f7', hover: '#9333ea', accent: '#6366f1' },
  fuchsia: { label: 'Fuchsia', primary: '#d946ef', hover: '#c026d3', accent: '#8b5cf6' },
  pink: { label: 'Pink', primary: '#ec4899', hover: '#db2777', accent: '#f43f5e' },
  rose: { label: 'Rose', primary: '#f43f5e', hover: '#e11d48', accent: '#f97316' },
  red: { label: 'Red', primary: '#ef4444', hover: '#dc2626', accent: '#f59e0b' },
  orange: { label: 'Orange', primary: '#f97316', hover: '#ea580c', accent: '#eab308' },
  amber: { label: 'Amber', primary: '#f59e0b', hover: '#d97706', accent: '#ef4444' },
  green: { label: 'Green', primary: '#22c55e', hover: '#16a34a', accent: '#14b8a6' },
  emerald: { label: 'Emerald', primary: '#10b981', hover: '#059669', accent: '#84cc16' },
  teal: { label: 'Teal', primary: '#14b8a6', hover: '#0d9488', accent: '#0ea5e9' },
  cyan: { label: 'Cyan', primary: '#06b6d4', hover: '#0891b2', accent: '#3b82f6' },
  sky: { label: 'Sky', primary: '#0ea5e9', hover: '#0284c7', accent: '#6366f1' },
  blue: { label: 'Blue', primary: '#3b82f6', hover: '#2563eb', accent: '#06b6d4' },
  slate: { label: 'Slate', primary: '#475569', hover: '#334155', accent: '#64748b' },
  // Dark shades
  navy: { label: 'Navy', primary: '#1e3a8a', hover: '#172554', accent: '#3b82f6' },
  midnight: { label: 'Midnight', primary: '#312e81', hover: '#1e1b4b', accent: '#7c3aed' },
  plum: { label: 'Plum', primary: '#6b21a8', hover: '#581c87', accent: '#c026d3' },
  wine: { label: 'Wine', primary: '#9f1239', hover: '#881337', accent: '#e11d48' },
  brown: { label: 'Brown', primary: '#92400e', hover: '#78350f', accent: '#d97706' },
  forest: { label: 'Forest', primary: '#166534', hover: '#14532d', accent: '#65a30d' },
  ocean: { label: 'Ocean', primary: '#115e59', hover: '#134e4a', accent: '#0891b2' },
  graphite: { label: 'Graphite', primary: '#27272a', hover: '#18181b', accent: '#52525b' },
};

export const DEFAULT_GLOBALS = { theme: 'light', palette: 'indigo' };

/**
 * localStorage key holding the last choice plus its CSS variables, e.g. {"theme":"dark","palette":"teal","vars":{…}}.
 * The colors let preview-head.html theme Storybook's loading screen before any of this code has loaded
 */
const STORAGE_KEY = 'np-theme';

/** The last mode and palette the user picked (manager and preview share the origin, so both can read it) */
export function savedTheme() {
  try {
    return themeOf(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}'));
  } catch {
    return DEFAULT_GLOBALS;
  }
}

export function saveTheme(theme: string, palette: string) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ theme, palette, vars: paletteVars(palette) }));
}

/** The CSS variables a palette sets */
function paletteVars(palette: string | undefined) {
  const { primary, hover, accent } = paletteColors(palette);
  return { '--ui-primary': primary, '--ui-primary-hover': hover, '--ui-accent': accent };
}

/** A palette's colors: a preset, or a custom color ("custom-ff6a00"); unknown keys fall back to the default */
export function paletteColors(key: string | undefined) {
  const custom = key?.match(/^custom-([\da-f]{6})$/i);
  if (custom) {
    const [h, s, l] = hsl(`#${custom[1]}`);
    return {
      label: 'Custom',
      primary: `#${custom[1]}`,
      hover: hex(h, s, l * 0.85),
      accent: hex(h + 40, s, l),
    };
  }
  return PALETTES[key ?? ''] ?? PALETTES[DEFAULT_GLOBALS.palette];
}

/** Custom theme colors the user added in the theme menu, newest first (this browser only) */
const CUSTOM_KEY = 'np-theme-custom';
const MAX_CUSTOM = 8;

export const customPalette = (color: string) => `custom-${color.slice(1).toLowerCase()}`;

export function customColors(): string[] {
  try {
    const list = JSON.parse(localStorage.getItem(CUSTOM_KEY) ?? '[]');
    return Array.isArray(list) ? list.filter((c) => /^#[\da-f]{6}$/i.test(c)) : [];
  } catch {
    return [];
  }
}

/** Adds (or moves to the front) a custom color, or removes it; returns the new list */
export function editCustomColors(color: string, remove = false): string[] {
  const list = customColors().filter((c) => c !== color);
  const next = remove ? list : [color, ...list].slice(0, MAX_CUSTOM);
  try {
    localStorage.setItem(CUSTOM_KEY, JSON.stringify(next));
  } catch {
    // Storage blocked: the color still applies, it just isn't kept
  }
  return next;
}

/** A #rrggbb color as hue (degrees), saturation and lightness (0–1) */
function hsl(color: string): [number, number, number] {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(color.slice(i, i + 2), 16) / 255);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const d = max - min;
  if (!d) return [0, 0, l];
  const s = d / (1 - Math.abs(2 * l - 1));
  const h = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return [(h * 60 + 360) % 360, s, l];
}

/** Hue, saturation and lightness back to #rrggbb */
function hex(h: number, s: number, l: number) {
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const value = l - s * Math.min(l, 1 - l) * Math.max(-1, Math.min(k - 3, 9 - k, 1));
    return Math.round(value * 255)
      .toString(16)
      .padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

/** Mode and palette from Storybook globals, with defaults */
export function themeOf(globals: Record<string, string | undefined>) {
  return {
    theme: globals['theme'] ?? DEFAULT_GLOBALS.theme,
    palette: globals['palette'] ?? DEFAULT_GLOBALS.palette,
  };
}

/**
 * Puts a mode and palette on a document (the preview iframe, or the manager). Storybook sends globals on every
 * story render, so an unchanged theme returns false without touching the page
 */
export function applyTheme(doc: Document, theme: string | undefined, palette: string | undefined) {
  const root = doc.documentElement;
  const mode = theme === 'dark' ? 'dark' : 'light';
  const key = `${mode}|${palette}`;
  if (root.dataset['npTheme'] === key) return false;
  root.dataset['npTheme'] = key;
  root.dataset['theme'] = mode;
  for (const [name, value] of Object.entries(paletteVars(palette)))
    root.style.setProperty(name, value);
  return true;
}
