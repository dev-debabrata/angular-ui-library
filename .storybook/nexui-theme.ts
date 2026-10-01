/**
 * Light/dark mode and theme colors for Storybook and the NexUI site. In Storybook they are globals (`theme`,
 * `palette`): the toolbar (manager.ts) changes them, preview.ts applies them to the page as `data-theme` plus the
 * primary/accent CSS variables, and manager.ts remembers them in localStorage. The Angular app (src/app/app.config.ts)
 * applies and saves them the same way, under the same localStorage key.
 */

/** Theme colors offered in the palette menu; indigo is the Aurora default in theme.css */
export const PALETTES: Record<
  string,
  { label: string; primary: string; hover: string; accent: string }
> = {
  indigo: { label: 'Indigo', primary: '#6366f1', hover: '#4f46e5', accent: '#a855f7' },
  violet: { label: 'Violet', primary: '#8b5cf6', hover: '#7c3aed', accent: '#ec4899' },
  blue: { label: 'Blue', primary: '#3b82f6', hover: '#2563eb', accent: '#06b6d4' },
  teal: { label: 'Teal', primary: '#14b8a6', hover: '#0d9488', accent: '#0ea5e9' },
  emerald: { label: 'Emerald', primary: '#10b981', hover: '#059669', accent: '#84cc16' },
  amber: { label: 'Amber', primary: '#f59e0b', hover: '#d97706', accent: '#ef4444' },
  rose: { label: 'Rose', primary: '#f43f5e', hover: '#e11d48', accent: '#f97316' },
};

export const DEFAULT_GLOBALS = { theme: 'light', palette: 'indigo' };

/**
 * localStorage key holding the last choice plus its CSS variables, e.g. {"theme":"dark","palette":"teal","vars":{…}}.
 * The colors let preview-head.html theme Storybook's loading screen before any of this code has loaded
 */
const STORAGE_KEY = 'nexui-theme';

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

/** Applies and saves a new mode or palette (the NexUI site's top bar; Storybook's toolbar goes through globals) */
export function changeTheme(change: { theme?: string; palette?: string }) {
  const { theme, palette } = { ...savedTheme(), ...change };
  applyTheme(document, theme, palette);
  saveTheme(theme, palette);
}

// Storybook (port 6006) and the Angular app (port 4200) are separate origins with their own localStorage, so links
// between them carry the choice in the hash (#theme=dark&palette=teal) and the page they open saves it

/** The saved choice as a hash for a link to the other one */
export function themeHash() {
  const { theme, palette } = savedTheme();
  return `#${new URLSearchParams({ theme, palette })}`;
}

/** Puts a theme hash into a link's address (on press, so the address is current when the link is followed) */
export function carryTheme(link: HTMLAnchorElement) {
  link.href = link.href.split('#')[0] + themeHash();
}

/** Saves the choice a link brought (themeHash) and drops the hash. Only known modes and palettes are kept */
export function readThemeHash() {
  const params = new URLSearchParams(location.hash.slice(1));
  const theme = params.get('theme');
  const palette = params.get('palette');
  if (!theme || !palette) return;
  saveTheme(
    theme === 'dark' ? 'dark' : 'light',
    palette in PALETTES ? palette : DEFAULT_GLOBALS.palette,
  );
  history.replaceState(history.state, '', location.href.split('#')[0]);
}

/** The CSS variables a palette sets */
function paletteVars(palette: string | undefined) {
  const { primary, hover, accent } = paletteColors(palette);
  return { '--ui-primary': primary, '--ui-primary-hover': hover, '--ui-accent': accent };
}

/** A palette's colors; unknown keys fall back to the default */
export function paletteColors(key: string | undefined) {
  return PALETTES[key ?? ''] ?? PALETTES[DEFAULT_GLOBALS.palette];
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
  if (root.dataset['nexuiTheme'] === key) return false;
  root.dataset['nexuiTheme'] = key;
  root.dataset['theme'] = mode;
  for (const [name, value] of Object.entries(paletteVars(palette)))
    root.style.setProperty(name, value);
  return true;
}
