/** Color tone shared by Alert, Badge, Toast and Progress Bar. Maps to the .tone-* classes in theme.css */
export type Tone = 'info' | 'success' | 'warning' | 'danger' | 'neutral';

export const TONES: Tone[] = ['info', 'success', 'warning', 'danger', 'neutral'];

/** Icon glyph shown for each tone by Alert and Toast */
export const TONE_ICONS: Record<Tone, string> = {
  info: 'i',
  success: '✓',
  warning: '!',
  danger: '✕',
  neutral: '•',
};

export type Size = 'small' | 'medium' | 'large';

export const SIZES: Size[] = ['small', 'medium', 'large'];

/** The np-color-* appearance classes in theme.css, also Button's severities */
export const APPEARANCE_COLORS = [
  'primary',
  'secondary',
  'success',
  'info',
  'warning',
  'danger',
  'help',
  'contrast',
] as const;
export type AppearanceColor = (typeof APPEARANCE_COLORS)[number];

/** The palette colors: np-color-<name> classes in theme.css, the same colors as the theme menu (np-color-custom takes
 * any color from --np-color) */
// prettier-ignore
export const PALETTE_COLORS = [
  'indigo', 'violet', 'purple', 'fuchsia', 'pink', 'rose', 'red', 'orange', 'amber', 'green', 'emerald', 'teal',
  'cyan', 'sky', 'blue', 'slate', 'navy', 'midnight', 'plum', 'wine', 'brown', 'forest', 'ocean', 'graphite',
] as const;
export type PaletteColor = (typeof PALETTE_COLORS)[number];

/** Field styles for inputs (the ui-field--* classes in theme.css); outlined is the default look */
export const FIELD_VARIANTS = ['outlined', 'filled', 'underline', 'floating'] as const;
export type FieldVariant = (typeof FIELD_VARIANTS)[number];

/** The np-shape-* appearance classes in theme.css, also Button's shapes */
export const APPEARANCE_SHAPES = ['pill', 'rounded', 'square'] as const;
export type AppearanceShape = (typeof APPEARANCE_SHAPES)[number];

export interface User {
  name: string;
}

/** Menu entry shared by Menu, Menubar, MegaMenu, PanelMenu and TieredMenu */
export interface MenuItem {
  label?: string;
  /** Icon file name from src/stories/icons/svg, e.g. 'house' */
  icon?: string;
  /** Link target. When set the item renders as <a href> */
  url?: string;
  /** Child items (submenu) */
  items?: MenuItem[];
  /** Called when the item is clicked */
  command?: (event: { originalEvent: Event; item: MenuItem }) => void;
  disabled?: boolean;
  /** Render a divider line instead of an item */
  separator?: boolean;
  /** Small badge text shown after the label */
  badge?: string;
}

/** Node shared by Tree and TreeTable */
export interface TreeNode<T = Record<string, unknown>> {
  /** Unique id, used for tracking, selection and expansion */
  key: string;
  label?: string;
  /** Icon file name from src/stories/icons/svg */
  icon?: string;
  /** Row values for TreeTable, keyed by column field */
  data?: T;
  children?: TreeNode<T>[];
  /** Start expanded */
  expanded?: boolean;
  selectable?: boolean;
}
