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

export interface User {
  name: string;
}

/** Menu entry shared by Menu, Menubar, MegaMenu, PanelMenu and TieredMenu */
export interface MenuItem {
  label?: string;
  /** Icon file name from src/stories/icons, e.g. 'house' */
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
  /** Icon file name from src/stories/icons */
  icon?: string;
  /** Row values for TreeTable, keyed by column field */
  data?: T;
  children?: TreeNode<T>[];
  /** Start expanded */
  expanded?: boolean;
  selectable?: boolean;
}
