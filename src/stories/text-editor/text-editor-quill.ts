/** Quill for the text editor: loading it with its own registry, keyboard shortcuts, find and HTML helpers */
import type Quill from 'quill';
import type { Range as QuillRange } from 'quill';

import { TEXT_EDITOR_SIZES } from './text-editor-tools';

/**
 * The formats this editor uses, in their own Quill registry, so Quill instances elsewhere on the page keep their own
 * setup. Alignment and font size are styles (style="text-align: center"), so the HTML looks right without Quill's
 * CSS. Loaded once, on first use.
 */
let quillLoader: Promise<{ Quill: typeof Quill; registry: unknown }> | null = null;
export function loadQuill() {
  return (quillLoader ??= Promise.all([import('quill'), import('quill/formats/table')]).then(
    ([{ default: Quill, Parchment }, tables]) => {
      const registry = new Parchment.Registry();
      const blots = 'block block/embed break container cursor embed inline scroll text';
      const formats =
        'header bold italic underline strike code script color background link image blockquote code-block list indent';
      type Definition = { blotName?: string; requiredContainer?: Definition };
      const definitions = [
        ...blots.split(' ').map((b) => `blots/${b}`),
        ...formats.split(' ').map((f) => `formats/${f}`),
        'attributors/style/align',
      ].map((name) => Quill.import(name) as Definition);
      // A horizontal rule (<hr>), which Quill doesn't have
      const BlockEmbed = Quill.import('blots/block/embed') as new (...args: never[]) => object;
      class Divider extends BlockEmbed {
        static blotName = 'divider';
        static tagName = 'HR';
      }
      const size = new Parchment.StyleAttributor('size', 'font-size', {
        scope: Parchment.Scope.INLINE,
        whitelist: TEXT_EDITOR_SIZES.map((s) => s.value).filter(Boolean),
      });
      // Lists and code blocks need their container blots too; abstract base blots can't be registered
      for (const definition of [
        ...definitions,
        ...definitions.flatMap((d) => d.requiredContainer ?? []),
        Divider as Definition,
        size as Definition,
        ...([
          tables.TableCell,
          tables.TableRow,
          tables.TableBody,
          tables.TableContainer,
        ] as Definition[]),
      ])
        if (definition.blotName !== 'abstract') registry.register(definition as never);
      return { Quill, registry };
    },
  ));
}

/** Typed shortcuts and the symbols that replace them as you type */
const TYPOGRAPHY = '-> → <- ← => ⇒ -- — ... … <= ≤ >= ≥ != ≠ (c) © (r) ® (tm) ™ 1/2 ½';

/**
 * Markdown at the start of a line, the keys that end it, and what the line becomes (lists: Quill's own "list
 * autofill"). --- may have become —- (typography)
 */
const BLOCK_MARKDOWN: [RegExp, string[], (quill: Quill, index: number, typed: string) => void][] = [
  [/^#{1,3}$/, [' '], (quill, i, typed) => quill.formatLine(i, 1, 'header', typed.length, 'user')],
  [/^>$/, [' '], (quill, i) => quill.formatLine(i, 1, 'blockquote', true, 'user')],
  [/^```$/, [' ', 'Enter'], (quill, i) => quill.formatLine(i, 1, 'code-block', true, 'user')],
  [/^(---|—-)$/, ['Enter'], (quill, i) => insertDivider(quill, i)],
];

/** Markdown around text, applied when its closing mark is typed (no space just inside the marks: 2 * 3 * 4) */
const INLINE_MARKDOWN: [key: string, RegExp, format: string][] = [
  ['*', /\*\*([^*\s](?:[^*]*[^*\s])?)\*$/, 'bold'],
  ['*', /(?<!\*)\*([^*\s](?:[^*]*[^*\s])?)$/, 'italic'],
  ['~', /~~([^~\s](?:[^~]*[^~\s])?)~$/, 'strike'],
  ['`', /`([^`]+)$/, 'code'],
];

/** Formats where typed characters mean what they say */
const NOT_IN_CODE = { 'code-block': false, code: false };

export interface ShortcutOptions {
  openLink: () => void;
  openFind: () => void;
  typography: () => boolean;
  markdown: () => boolean;
}

/**
 * Keyboard setup: Tab leaves the editor (no keyboard trap); Ctrl/⌘ K link, F find, E inline code, ] and [ indent;
 * typography shortcuts become symbols and markdown becomes formatting (not in code, where -> means ->)
 */
export function addShortcuts(quill: Quill, options: ShortcutOptions) {
  const keyboard = quill.keyboard;
  const handled = (run: () => unknown) => (run(), false);
  keyboard.bindings['Tab'] = [];

  const commands: [key: string, run: (range: QuillRange) => unknown][] = [
    ['k', options.openLink],
    ['f', options.openFind],
    [']', (range) => indent(quill, range, 1)],
    ['[', (range) => indent(quill, range, -1)],
    ['e', (range) => quill.format('code', !quill.getFormat(range)['code'], 'user')],
  ];
  for (const [key, run] of commands)
    keyboard.addBinding({ key, shortKey: true }, (range: QuillRange) => handled(() => run(range)));

  /** Replaces the `typed` characters before the cursor (the binding's key isn't typed yet) */
  const replace = (index: number, typed: number, text: string, formats = {}) => {
    quill.deleteText(index - typed, typed, 'user');
    quill.insertText(index - typed, text, formats, 'user');
    quill.setSelection(index - typed + text.length, 0, 'user');
  };

  // Typography: each shortcut's last key, typed after the rest of it
  for (const [, before, key, symbol] of TYPOGRAPHY.matchAll(/(\S*)(\S) (\S+)/g))
    keyboard.addBinding(
      {
        key,
        shiftKey: null,
        prefix: new RegExp(`${before.replace(/[.()]/g, '\\$&')}$`, 'i'),
        format: NOT_IN_CODE,
      },
      (range: QuillRange) =>
        !options.typography() || handled(() => replace(range.index, before.length, symbol)),
    );

  for (const [prefix, keys, apply] of BLOCK_MARKDOWN)
    for (const key of keys) {
      keyboard.addBinding(
        { key, collapsed: true, prefix, format: { ...NOT_IN_CODE, table: false } },
        (range: QuillRange, { prefix: typed }: { prefix: string }) =>
          !options.markdown() ||
          handled(() => {
            replace(range.index, typed.length, '');
            apply(quill, range.index - typed.length, typed);
          }),
      );
      // Quill's own Enter handler runs first and always handles the key, so Enter shortcuts go before it
      if (key === 'Enter') keyboard.bindings['Enter'].unshift(keyboard.bindings['Enter'].pop()!);
    }

  for (const [key, pattern, format] of INLINE_MARKDOWN)
    keyboard.addBinding(
      { key, shiftKey: null, collapsed: true, prefix: pattern, format: NOT_IN_CODE },
      (range: QuillRange, { prefix }: { prefix: string }) => {
        const match = prefix.match(pattern);
        if (!options.markdown() || !match) return true;
        replace(range.index, match[0].length, match[1], { [format]: true });
        quill.format(format, false, 'user'); // what's typed next isn't formatted
        return false;
      },
    );
}

/** A divider before the cursor's line when the cursor is at its start (or it's empty), else after the whole line */
export function insertDivider(quill: Quill, index: number) {
  const [line, offset] = quill.getLine(index);
  const at = index - offset + (offset && line ? line.length() : 0);
  if (at >= quill.getLength()) quill.insertText(at - 1, '\n', 'user');
  quill.insertEmbed(at, 'divider', true, 'user');
  quill.setSelection(at + 1, 0, 'user');
}

/** Indents (step 1) or outdents (-1) the selected lines, up to 3 levels */
export function indent(quill: Quill, range: QuillRange, step: 1 | -1) {
  const level = Number(quill.getFormat(range)['indent'] ?? 0);
  if (step > 0 ? level < 3 : level > 0) quill.format('indent', step > 0 ? '+1' : '-1', 'user');
}

/** Where `query` occurs in the text (case-insensitive). Images and dividers count as one character, as in Quill */
export function findAll(quill: Quill, query: string): number[] {
  const text = quill
    .getContents()
    .ops.map((op) => (typeof op.insert === 'string' ? op.insert : '￼'))
    .join('')
    .toLowerCase();
  const needle = query.toLowerCase();
  const found: number[] = [];
  for (
    let i = needle ? text.indexOf(needle) : -1;
    i >= 0;
    i = text.indexOf(needle, i + needle.length)
  )
    found.push(i);
  return found;
}

/** The DOM range of quill text [index, index + length), for highlighting */
function domRange(quill: Quill, index: number, length: number) {
  const [start, startOffset] = quill.getLeaf(index + 1);
  const [end, endOffset] = quill.getLeaf(index + length);
  if (!start || !end) return null;
  const range = document.createRange();
  range.setStart(start.domNode, startOffset - 1);
  range.setEnd(end.domNode, endOffset);
  return range;
}

/**
 * Highlights the matches with the CSS Custom Highlight API (::highlight(np-find) in the CSS), without changing the
 * document; the current one also scrolls into view. No matches clears them. Browsers without the API skip it.
 */
export function highlightMatches(quill: Quill, matches: number[], length: number, current: number) {
  const highlights = (globalThis as { CSS?: { highlights?: Map<string, unknown> } }).CSS
    ?.highlights;
  const Highlight = (globalThis as { Highlight?: new (...ranges: Range[]) => unknown }).Highlight;
  if (!highlights || !Highlight) return;
  const ranges = matches.map((i) => domRange(quill, i, length)).filter((r): r is Range => !!r);
  highlights.set('np-find', new Highlight(...ranges));
  const active = ranges[current];
  highlights.set('np-find-current', new Highlight(...(active ? [active] : [])));
  active?.startContainer.parentElement?.scrollIntoView({ block: 'nearest' });
}

/**
 * The editor's HTML ('' when empty). Quill 2.0 writes every space as &nbsp;: single spaces become plain again. Tables
 * get cell borders inline, so they look right anywhere (Quill reads the cells back without them)
 */
export const editorHtml = (quill: Quill) =>
  quill.getLength() <= 1
    ? ''
    : quill
        .getSemanticHTML()
        .replace(/(?:&nbsp;)+/g, (run) => ' ' + '&nbsp;'.repeat(run.length / 6 - 1))
        // Quill's placeholder for a format waiting for the next typed character
        .replace(/<span class="ql-cursor">\ufeff?<\/span>/g, '')
        .replaceAll(
          '<table style="border: 1px solid #000;">',
          '<table style="width: 100%; border-collapse: collapse;">',
        )
        .replace(/<td([^>]*)>/g, '<td$1 style="border: 1px solid #cbd5e1; padding: 6px 10px;">');

/** Adds https:// to bare addresses (example.com); keeps mailto:, tel:, other schemes, relative and # links */
export const normalizeUrl = (url: string) =>
  /^([a-z][a-z\d+.-]*:|[/#?.])/i.test(url) ? url : `https://${url}`;

/** A file as a data: URL (images are inlined unless `uploadImage` is set) */
export const dataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
