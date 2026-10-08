/** The text editor's toolbar: its tools, groups, colors and text styles (re-exported by text-editor.component.ts) */

/** Toolbar tools, in toolbar order. Pass a subset to `tools` to show fewer */
// prettier-ignore
export const TEXT_EDITOR_TOOLS = [
  'undo', 'redo', 'heading', 'font', 'size', 'bold', 'italic', 'underline', 'strike', 'code', 'superscript',
  'subscript', 'color', 'highlight', 'ordered', 'bullet', 'check', 'outdent', 'indent', 'align', 'line-height', 'link',
  'image', 'video', 'table', 'blockquote', 'code-block', 'divider', 'emoji', 'symbol', 'case', 'find', 'clean',
] as const;
export type TextEditorTool = (typeof TEXT_EDITOR_TOOLS)[number];

/** default: a bordered field. document: a wide writing surface with a centered text column (zoom with `zoom`) */
export const TEXT_EDITOR_VARIANTS = ['default', 'document'] as const;
export type TextEditorVariant = (typeof TEXT_EDITOR_VARIANTS)[number];

/** auto follows the page (data-theme on <html>); light and dark force one look on this editor only */
export const TEXT_EDITOR_THEMES = ['auto', 'light', 'dark'] as const;
export type TextEditorTheme = (typeof TEXT_EDITOR_THEMES)[number];

/** Text and highlight colors. They're written into the HTML (style="color: …"), so they're fixed values, not tokens */
// prettier-ignore
export const TEXT_EDITOR_COLORS: readonly { name: string; value: string }[] = Object.entries({
  Black: '#0f172a', Gray: '#64748b', Red: '#e11d48', Orange: '#ea580c', Yellow: '#ca8a04', Green: '#16a34a',
  Teal: '#0d9488', Blue: '#2563eb', Indigo: '#4f46e5', Purple: '#9333ea', Pink: '#db2777',
  'Light yellow': '#fef08a', 'Light green': '#bbf7d0', 'Light blue': '#bfdbfe', 'Light purple': '#e9d5ff',
  'Light pink': '#fbcfe8',
}).map(([name, value]) => ({ name, value }));

/** The color menus: text color (the color tool) and highlight (the highlight tool), each with a "none" choice */
export const TEXT_EDITOR_COLOR_SECTIONS = {
  color: { format: 'color', title: 'Text color', none: 'Default color' },
  highlight: { format: 'background', title: 'Highlight', none: 'No highlight' },
} as const;

/** Options of the toolbar's dropdowns: text style, and font size in px (written as style="font-size: …") */
export const TEXT_EDITOR_HEADINGS = [
  { label: 'Paragraph', value: '' },
  { label: 'Heading 1', value: '1' },
  { label: 'Heading 2', value: '2' },
  { label: 'Heading 3', value: '3' },
] as const;
export const TEXT_EDITOR_SIZES = [
  { label: 'Default', value: '' },
  ...[8, 9, 10, 11, 12, 14, 16, 18, 24, 30, 36, 48, 60, 72, 96].map((px) => ({
    label: String(px),
    value: `${px}px`,
  })),
] as const;

/** Font families (written as style="font-family: …"); plain stacks, no quotes, so they read back unchanged */
export const TEXT_EDITOR_FONTS = [
  { label: 'Default', value: '' },
  { label: 'Sans', value: 'Arial, Helvetica, sans-serif' },
  { label: 'Serif', value: 'Georgia, serif' },
  { label: 'Mono', value: 'Menlo, Consolas, monospace' },
] as const;

/** The line spacing menu (written as style="line-height: …" on the line) */
export const TEXT_EDITOR_LINE_HEIGHTS = [
  { label: 'Default', value: '' },
  ...['1', '1.15', '1.5', '2'].map((value) => ({ label: value, value })),
] as const;

/** The letter case menu */
export const TEXT_EDITOR_CASES = [
  { label: 'UPPERCASE', value: 'upper' },
  { label: 'lowercase', value: 'lower' },
  { label: 'Title Case', value: 'title' },
  { label: 'Sentence case', value: 'sentence' },
] as const;
export type TextCase = (typeof TEXT_EDITOR_CASES)[number]['value'];

/** The emoji and special character menus: characters inserted at the cursor */
export const TEXT_EDITOR_EMOJI =
  '😀 😂 😊 😍 🤔 😎 😢 😮 👍 👎 👏 🙌 🙏 💪 👀 🎉 🔥 ✨ ⭐ ❤️ 💡 ✅ ❌ ⚠️ 🚀 📌 📎 📅 📝 💬 🔗 🎯'.split(
    ' ',
  );
export const TEXT_EDITOR_SYMBOLS =
  '© ® ™ § ¶ † • … – — « » ‹ › “ ” ← → ↑ ↓ ⇒ ⇔ ± × ÷ ≈ ≠ ≤ ≥ ∞ √ ° µ π Σ Ω € £ ¥ ¢ ½ ¼ ¾ ✓ ★'.split(
    ' ',
  );

/** The alignment menu */
export const TEXT_EDITOR_ALIGNMENTS = [
  { label: 'Left', value: '', icon: 'align-left' },
  { label: 'Center', value: 'center', icon: 'align-center' },
  { label: 'Right', value: 'right', icon: 'align-right' },
  { label: 'Justify', value: 'justify', icon: 'align-justify' },
] as const;

/** The table menu's actions while the cursor is in a table: Quill table module methods */
export const TEXT_EDITOR_TABLE_ACTIONS = [
  { label: 'Insert row above', icon: 'between-horizontal-start', run: 'insertRowAbove' },
  { label: 'Insert row below', icon: 'between-horizontal-end', run: 'insertRowBelow' },
  { label: 'Insert column left', icon: 'between-vertical-start', run: 'insertColumnLeft' },
  { label: 'Insert column right', icon: 'between-vertical-end', run: 'insertColumnRight' },
  { label: 'Delete row', icon: 'table-rows-split', run: 'deleteRow' },
  { label: 'Delete column', icon: 'table-columns-split', run: 'deleteColumn' },
  { label: 'Delete table', icon: 'trash-2', run: 'deleteTable' },
] as const;
export type TableAction = (typeof TEXT_EDITOR_TABLE_ACTIONS)[number]['run'];

/** One toolbar control: the Quill `format` it sets (to `value` if given, else on/off) */
export interface ToolItem {
  tool: TextEditorTool;
  label: string;
  icon: string;
  format: string;
  value?: string;
  /** Keyboard shortcut, shown in the tooltip */
  keys?: string;
}

const tool = (t: TextEditorTool, label: string, icon: string, more?: Partial<ToolItem>) =>
  ({ tool: t, label, icon, format: t, ...more }) as ToolItem;

/** Toolbar groups, with a divider between them */
const GROUPS: ToolItem[][] = [
  [
    tool('undo', 'Undo', 'undo-2', { keys: 'Ctrl+Z' }),
    tool('redo', 'Redo', 'redo-2', { keys: 'Ctrl+Shift+Z' }),
  ],
  [
    tool('heading', 'Text style', 'heading', { format: 'header' }),
    tool('font', 'Font', 'type'),
    tool('size', 'Font size', 'a-large-small'),
  ],
  [
    tool('bold', 'Bold', 'bold', { keys: 'Ctrl+B' }),
    tool('italic', 'Italic', 'italic', { keys: 'Ctrl+I' }),
    tool('underline', 'Underline', 'underline', { keys: 'Ctrl+U' }),
    tool('strike', 'Strikethrough', 'strikethrough'),
    tool('code', 'Inline code', 'code', { keys: 'Ctrl+E' }),
  ],
  [
    tool('superscript', 'Superscript', 'superscript', { format: 'script', value: 'super' }),
    tool('subscript', 'Subscript', 'subscript', { format: 'script', value: 'sub' }),
  ],
  [
    tool('color', 'Text color', 'baseline'),
    tool('highlight', 'Highlight', 'highlighter', { format: 'background' }),
  ],
  [
    tool('ordered', 'Numbered list', 'list-ordered', { format: 'list', value: 'ordered' }),
    tool('bullet', 'Bulleted list', 'list', { format: 'list', value: 'bullet' }),
    tool('check', 'Checklist', 'list-todo', { format: 'list', value: 'unchecked' }),
    tool('outdent', 'Decrease indent', 'indent-decrease', { format: 'indent', keys: 'Ctrl+[' }),
    tool('indent', 'Increase indent', 'indent-increase', { keys: 'Ctrl+]' }),
  ],
  [
    tool('align', 'Align', 'align-left'),
    tool('line-height', 'Line spacing', 'unfold-vertical', { format: 'lineheight' }),
  ],
  [
    tool('link', 'Link', 'link', { keys: 'Ctrl+K' }),
    tool('image', 'Image', 'image-plus'),
    tool('video', 'Video (YouTube, Vimeo)', 'square-play'),
    tool('table', 'Table', 'table'),
    tool('blockquote', 'Quote', 'text-quote'),
    tool('code-block', 'Code block', 'code-xml'),
    tool('divider', 'Divider', 'separator-horizontal'),
  ],
  [tool('emoji', 'Emoji', 'smile'), tool('symbol', 'Special characters', 'omega')],
  [
    tool('case', 'Change case', 'case-sensitive'),
    tool('find', 'Find and replace', 'search', { keys: 'Ctrl+F' }),
    tool('clean', 'Clear formatting', 'remove-formatting'),
  ],
];

/** Tools that do something once (no on/off state), drop-downs, and tools that open a menu or a bar */
const ACTIONS = new Set<TextEditorTool>(['clean', 'undo', 'redo', 'divider', 'indent', 'outdent']);
const SELECTS = new Set<TextEditorTool>(['heading', 'font', 'size']);
export const MENUS = new Set<TextEditorTool>([
  'color',
  'highlight',
  'align',
  'line-height',
  'table',
  'emoji',
  'symbol',
  'case',
]);
export const BARS = new Set<TextEditorTool>(['link', 'image', 'video', 'find']);
export type TextEditorBar = 'link' | 'image' | 'video' | 'find';

/** The toolbar's controls for `tools`; the first of each group after the first gets a divider */
export function toolbarItems(tools: readonly TextEditorTool[]) {
  const shown = new Set(tools);
  return GROUPS.map((group) => group.filter((item) => shown.has(item.tool)))
    .filter((group) => group.length)
    .flatMap((group, g) =>
      group.map((item, i) => ({
        ...item,
        divider: g > 0 && i === 0,
        title: item.keys ? `${item.label} (${item.keys})` : item.label,
        select: SELECTS.has(item.tool),
        menu: MENUS.has(item.tool),
        // Toggles report aria-pressed; menus and bars say what they open
        pressable:
          !ACTIONS.has(item.tool) &&
          !SELECTS.has(item.tool) &&
          !MENUS.has(item.tool) &&
          !BARS.has(item.tool),
        popup: MENUS.has(item.tool) ? 'menu' : BARS.has(item.tool) ? 'dialog' : null,
      })),
    );
}
