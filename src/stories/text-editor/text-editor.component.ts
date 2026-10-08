import {
  Component,
  DestroyRef,
  ElementRef,
  ViewEncapsulation,
  afterNextRender,
  afterRenderEffect,
  booleanAttribute,
  computed,
  effect,
  forwardRef,
  inject,
  input,
  model,
  numberAttribute,
  output,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { type ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import type Quill from 'quill';
import type { Range as QuillRange } from 'quill';

import { anchorPosition } from '../utils/anchor-position';
import { IconComponent } from '../components/media/icon/icon.component';
import {
  addShortcuts,
  changeCase,
  dataUrl,
  editorHtml,
  findAll,
  highlightMatches,
  indent,
  insertDivider,
  loadQuill,
  normalizeUrl,
  videoUrl,
} from './text-editor-quill';
import {
  BARS,
  MENUS,
  TEXT_EDITOR_ALIGNMENTS,
  TEXT_EDITOR_CASES,
  TEXT_EDITOR_COLOR_SECTIONS,
  TEXT_EDITOR_COLORS,
  TEXT_EDITOR_EMOJI,
  TEXT_EDITOR_FONTS,
  TEXT_EDITOR_HEADINGS,
  TEXT_EDITOR_LINE_HEIGHTS,
  TEXT_EDITOR_SIZES,
  TEXT_EDITOR_SYMBOLS,
  TEXT_EDITOR_TABLE_ACTIONS,
  TEXT_EDITOR_TOOLS,
  type TableAction,
  type TextCase,
  type TextEditorBar,
  type TextEditorTheme,
  type TextEditorTool,
  type TextEditorVariant,
  type ToolItem,
  toolbarItems,
} from './text-editor-tools';

export {
  TEXT_EDITOR_ALIGNMENTS,
  TEXT_EDITOR_CASES,
  TEXT_EDITOR_COLORS,
  TEXT_EDITOR_EMOJI,
  TEXT_EDITOR_FONTS,
  TEXT_EDITOR_HEADINGS,
  TEXT_EDITOR_LINE_HEIGHTS,
  TEXT_EDITOR_SIZES,
  TEXT_EDITOR_SYMBOLS,
  TEXT_EDITOR_THEMES,
  TEXT_EDITOR_TOOLS,
  TEXT_EDITOR_VARIANTS,
  type TextCase,
  type TextEditorTheme,
  type TextEditorTool,
  type TextEditorVariant,
} from './text-editor-tools';

let nextId = 0;

type TableModule = Record<TableAction, () => void> & {
  insertTable(rows: number, columns: number): void;
};

/**
 * Rich text editor (Quill 2) with a NexPrime toolbar. The value is HTML. Works with [(value)], [(ngModel)] and
 * formControlName. Quill loads on first use, only in the browser (SSR-safe: afterNextRender doesn't run on the server).
 * The toolbar's tools are in text-editor-tools.ts, the Quill setup in text-editor-quill.ts; the content's look is in
 * text-editor-content.css.
 */
@Component({
  selector: 'np-text-editor',
  imports: [IconComponent],
  templateUrl: './text-editor.html',
  styleUrls: ['./text-editor.css', './text-editor-content.css'],
  // Quill builds the editing area itself, so its content can't carry Angular's scoped style attributes
  encapsulation: ViewEncapsulation.None,
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => TextEditorComponent), multi: true },
  ],
  host: {
    class: 'np-text-editor',
    '[class.np-text-editor--disabled]': 'isDisabled()',
    '[class.np-text-editor--readonly]': 'readonly()',
    '[class.np-text-editor--light]': "theme() === 'light'",
    '[class.np-text-editor--dark]': "theme() === 'dark'",
    '[class.np-text-editor--document]': "variant() === 'document'",
    '[style.--te-zoom]': 'zoom()',
    '[style.--te-min-height]': 'minHeight()',
    '[style.--te-max-height]': 'maxHeight()',
    '(focusout)': 'onFocusOut($event)',
  },
})
export class TextEditorComponent implements ControlValueAccessor {
  /** Label shown above the editor (also its accessible name) */
  readonly label = input('');

  /** Accessible name when there's no visible label */
  readonly ariaLabel = input('Rich text editor');

  /** Text shown while the editor is empty */
  readonly placeholder = input('Write something...');

  /** Content as HTML. Supports [(value)]; emits valueChange with the HTML ('' when empty) */
  readonly value = model('');

  /** Is the editor disabled? (no editing, dimmed, toolbar off) */
  readonly disabled = input(false, { transform: booleanAttribute });

  /** Show the content without editing (no toolbar; the text can still be selected and copied) */
  readonly readonly = input(false, { transform: booleanAttribute });

  /** Minimum height of the editing area (any CSS length) */
  readonly minHeight = input('200px');

  /** Maximum height of the editing area; longer content scrolls (any CSS length, or 'none') */
  readonly maxHeight = input('500px');

  /** auto (follows the page's light/dark mode), light or dark */
  readonly theme = input<TextEditorTheme>('auto');

  /** Look: default (a form field) or document (a wide surface with a centered text column, for long-form writing) */
  readonly variant = input<TextEditorVariant>('default');

  /** Zoom of the document page (1 = 100%) */
  readonly zoom = input(1, { transform: numberAttribute });

  /** Toolbar tools to show, in TEXT_EDITOR_TOOLS order (default: all) */
  readonly tools = input<readonly TextEditorTool[]>(TEXT_EDITOR_TOOLS);

  /** Hint shown under the editor */
  readonly hint = input('');

  /** Mark the content as invalid (red border, aria-invalid) */
  readonly invalid = input(false, { transform: booleanAttribute });

  /** Replace typed shortcuts as you type: -> →, <- ←, => ⇒, -- —, ... …, (c) ©, (tm) ™, <= ≤, >= ≥, != ≠, 1/2 ½ */
  readonly typography = input(true, { transform: booleanAttribute });

  /** Markdown as you type: # ## ### headings, - * 1. [] lists, > quote, ``` code, --- divider, **bold**, *italic*, `code`, ~~strike~~ */
  readonly markdown = input(true, { transform: booleanAttribute });

  /** Show the word and character count (and the reading time) under the editor */
  readonly showCount = input(false, { transform: booleanAttribute });

  /** Most characters allowed (0: no limit); longer input is cut off. Shows the count */
  readonly maxLength = input(0, { transform: numberAttribute });

  /** Uploads an image (picked, pasted or dropped) and returns its URL. Without it, images are inlined as data: URLs */
  readonly uploadImage = input<((file: File) => Promise<string>) | null>(null);

  /** Emits the Quill instance once the editor is ready, for advanced use (modules, the Delta API) */
  readonly ready = output<Quill>();

  protected readonly options: Record<string, readonly { label: string; value: string }[]> = {
    heading: TEXT_EDITOR_HEADINGS,
    font: TEXT_EDITOR_FONTS,
    size: TEXT_EDITOR_SIZES,
  };
  protected readonly colors = TEXT_EDITOR_COLORS;
  protected readonly colorSections = TEXT_EDITOR_COLOR_SECTIONS;
  protected readonly alignments = TEXT_EDITOR_ALIGNMENTS;
  protected readonly lineHeights = TEXT_EDITOR_LINE_HEIGHTS;
  protected readonly cases = TEXT_EDITOR_CASES;
  protected readonly characters = { emoji: TEXT_EDITOR_EMOJI, symbol: TEXT_EDITOR_SYMBOLS };
  protected readonly tableActions = TEXT_EDITOR_TABLE_ACTIONS;
  protected readonly id = `np-text-editor-${nextId++}`;
  protected readonly items = computed(() => toolbarItems(this.tools()));

  protected readonly countShown = computed(() => this.showCount() || this.maxLength() > 0);

  /** Disabled by the input or by a form control (setDisabledState) */
  private readonly formDisabled = signal(false);
  protected readonly isDisabled = computed(() => this.disabled() || this.formDisabled());

  /** Formats at the cursor, for the toolbar's pressed states and drop-downs */
  protected readonly formats = signal<Record<string, unknown>>({});
  /** Whether there's something to undo / redo */
  protected readonly history = signal({ undo: false, redo: false });
  /** The open toolbar menu (colors, alignment, spacing, table, emoji, symbols, case) and its button */
  protected readonly menu = signal<{
    tool: TextEditorTool;
    label: string;
    button: HTMLElement;
  } | null>(null);
  /** The table size picker: rows × columns under the pointer */
  protected readonly grid = signal([0, 0]);
  protected readonly gridCells = Array.from({ length: 48 }, (_, i) => [
    Math.floor(i / 8) + 1,
    (i % 8) + 1,
  ]);
  /** The bar under the toolbar: a link, image or video address, or find & replace */
  protected readonly bar = signal<TextEditorBar | null>(null);
  protected readonly barUrl = signal('');
  protected readonly replaceWith = signal('');
  protected readonly findIndex = signal(0);

  /** Plain text and a counter of content changes (for the count and find) */
  private readonly text = signal('');
  private readonly version = signal(0);
  protected readonly counts = computed(() => {
    const text = this.text().replace(/\n$/, '');
    const words = text.match(/\S+/g)?.length ?? 0;
    // Reading time at 200 words a minute
    return { words, characters: text.length, minutes: Math.max(1, Math.round(words / 200)) };
  });
  protected readonly matches = computed(() => {
    this.version();
    const quill = this.quill();
    return quill && this.bar() === 'find' ? findAll(quill, this.barUrl()) : [];
  });

  private readonly quill = signal<Quill | null>(null);
  /** The HTML last read from or written to Quill, so value changes from either side don't echo back */
  private lastHtml: string | null = null;
  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly editorEl = viewChild.required<ElementRef<HTMLElement>>('editor');
  private readonly toolbarEl = viewChild<ElementRef<HTMLElement>>('toolbar');
  private readonly menuEl = viewChild<ElementRef<HTMLElement>>('menuEl');
  private readonly barInput = viewChild<ElementRef<HTMLInputElement>>('barInput');

  constructor() {
    const destroyRef = inject(DestroyRef);
    afterNextRender(async () => {
      const { Quill, registry } = await loadQuill();
      if (destroyRef.destroyed) return;
      const quill = new Quill(this.editorEl().nativeElement, {
        registry: registry as never,
        placeholder: this.placeholder(),
        // Pasted and dropped images go through `uploadImage` too
        modules: {
          toolbar: false,
          table: true,
          uploader: {
            handler: (range: QuillRange, files: File[]) => this.insertImages(range, files),
          },
        },
      });
      addShortcuts(quill, {
        openLink: () => this.openBar('link'),
        openFind: () => this.openBar('find'),
        typography: this.typography,
        markdown: this.markdown,
      });
      quill.on('text-change', (_delta, _old, source) => {
        const max = this.maxLength();
        const length = quill.getLength() - 1;
        // Cut off past maxLength (that change comes back here)
        if (source === 'user' && max && length > max) {
          quill.deleteText(max, length - max, 'user');
          return;
        }
        this.text.set(quill.getText());
        this.version.update((v) => v + 1);
        if (source !== 'user') return;
        this.lastHtml = editorHtml(quill);
        this.value.set(this.lastHtml);
        this.onChange(this.lastHtml);
      });
      quill.on('editor-change', () => {
        const range = quill.getSelection();
        if (range) this.formats.set(quill.getFormat(range));
        const { undo, redo } = quill.history.stack;
        this.history.set({ undo: undo.length > 0, redo: redo.length > 0 });
      });
      this.quill.set(quill);
      this.ready.emit(quill);
    });

    // Value -> editor (input, writeValue). Changes typed in the editor are already there; loaded content can't be undone
    effect(() => {
      const html = this.value() ?? '';
      const quill = this.quill();
      if (!quill || html === this.lastHtml) return;
      untracked(() => {
        this.lastHtml = html;
        quill.setContents(quill.clipboard.convert({ html }), 'api');
        quill.history.clear();
        this.history.set({ undo: false, redo: false });
      });
    });

    // Editable state and the editing area's accessibility attributes
    effect(() => {
      const quill = this.quill();
      if (!quill) return;
      const disabled = this.isDisabled();
      const readonly = this.readonly() && !disabled;
      quill.enable(!disabled && !readonly);
      const described = [this.hint() && `${this.id}-hint`, this.countShown() && `${this.id}-count`];
      const attrs: Record<string, string | null> = {
        role: 'textbox',
        'aria-multiline': 'true',
        'aria-labelledby': this.label() ? `${this.id}-label` : null,
        'aria-label': this.label() ? null : this.ariaLabel(),
        'aria-describedby': described.filter(Boolean).join(' ') || null,
        'aria-placeholder': this.placeholder() || null,
        'aria-disabled': disabled ? 'true' : null,
        'aria-readonly': readonly ? 'true' : null,
        'aria-invalid': this.invalid() ? 'true' : null,
        // Read-only content stays reachable with Tab, to read and select it
        tabindex: readonly ? '0' : null,
        'data-placeholder': this.placeholder(),
      };
      for (const [name, value] of Object.entries(attrs))
        value === null ? quill.root.removeAttribute(name) : quill.root.setAttribute(name, value);
    });

    // Menus are popovers (top layer), so the toolbar's container can't clip them; placed under their button
    effect(() => {
      const el = this.menuEl()?.nativeElement;
      const button = this.menu()?.button;
      if (!el || !button) return;
      el.showPopover?.();
      const { top, left } = anchorPosition(button, el);
      Object.assign(el.style, { top: `${top}px`, left: `${left}px` });
      el.querySelector('button')?.focus();
    });

    effect(() => this.bar() && this.barInput()?.nativeElement.focus());

    // Find: highlight the matches (cleared when the bar closes)
    effect(() => {
      const quill = this.quill();
      const matches = this.matches();
      const current = Math.min(this.findIndex(), Math.max(0, matches.length - 1));
      if (quill) highlightMatches(quill, matches, this.barUrl().length, current);
    });

    // Roving tabindex: Tab reaches one toolbar control (the first, until another is focused)
    afterRenderEffect(() => {
      this.items();
      this.readonly();
      this.isDisabled();
      const controls = this.toolbarControls();
      if (!controls.some((c) => c.getAttribute('tabindex') === '0')) this.setTabStop(controls[0]);
    });
  }

  // ControlValueAccessor

  writeValue(value: string | null): void {
    this.value.set(value ?? '');
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(disabled: boolean): void {
    this.formDisabled.set(disabled);
  }

  /** Move focus into the editing area */
  focus() {
    this.quill()?.focus();
  }

  /** The current content as plain text */
  getText(): string {
    return this.quill()?.getText().trimEnd() ?? '';
  }

  /** Touched once focus leaves the whole component (the toolbar, menus and bars count as inside) */
  protected onFocusOut(event: FocusEvent) {
    if (!this.host.contains(event.relatedTarget as Node | null)) this.onTouched();
  }

  /** Is there nothing for an undo / redo button to do? */
  protected isIdle({ tool }: ToolItem): boolean {
    return (tool === 'undo' || tool === 'redo') && !this.history()[tool];
  }

  /** Is the control's format on at the cursor? (for value tools: set to its value) */
  protected isActive(item: ToolItem): boolean {
    const current = this.formats()[item.format];
    if (item.tool === 'check') return current === 'checked' || current === 'unchecked';
    return item.value === undefined ? !!current : current === item.value;
  }

  /** A drop-down's value at the cursor ('' for its default) */
  protected selected(format: string): string {
    return String(this.formats()[format] ?? '');
  }

  /** The Quill instance, unless the editor is disabled or read-only */
  private editable(): Quill | null {
    return this.isDisabled() || this.readonly() ? null : this.quill();
  }

  /** Runs an edit on the selection: focuses the editor (which restores the last selection) unless it's locked */
  private edit(change: (quill: Quill, range: QuillRange) => void) {
    const quill = this.editable();
    quill?.focus();
    const range = quill?.getSelection();
    if (quill && range) change(quill, range);
  }

  protected run(item: ToolItem, button: HTMLElement) {
    const { tool } = item;
    if (MENUS.has(tool)) return this.menu.set({ tool, label: item.label, button });
    if (BARS.has(tool)) return this.openBar(tool as TextEditorBar);
    if (tool === 'undo' || tool === 'redo') return this.edit((quill) => quill.history[tool]());
    this.edit((quill, range) => {
      if (tool === 'divider') insertDivider(quill, range.index);
      else if (tool === 'indent' || tool === 'outdent')
        indent(quill, range, tool === 'indent' ? 1 : -1);
      else if (tool !== 'clean')
        quill.format(item.format, !this.isActive(item) && (item.value ?? true), 'user');
      else if (range.length) quill.removeFormat(range.index, range.length, 'user');
      else {
        // No selection: clear the cursor's line (its text; Quill clears the line's own formats with it)
        const [line, offset] = quill.getLine(range.index);
        if (line) quill.removeFormat(range.index - offset, line.length() - 1, 'user');
      }
      this.formats.set(quill.getFormat(quill.getSelection() ?? range));
    });
  }

  /** Inserts an emoji or a special character in place of the selection */
  protected insert(text: string) {
    this.apply((quill, { index, length }) => {
      quill.deleteText(index, length, 'user');
      quill.insertText(index, text, 'user');
      quill.setSelection(index + text.length, 0, 'user');
    });
  }

  /** UPPERCASE, lowercase, Title Case or Sentence case for the selected text */
  protected setCase(to: TextCase) {
    this.apply((quill, range) => range.length && changeCase(quill, range, to));
  }

  /** Closed without a choice (Escape, a click outside): back to the menu's button */
  protected closeMenu() {
    this.menu()?.button.focus();
    this.menu.set(null);
  }

  /** A menu choice: a color, an alignment or a table action. Closes the menu */
  protected apply(change: (quill: Quill, range: QuillRange) => void) {
    this.menu.set(null);
    this.edit(change);
  }

  /** A drop-down or menu choice: text style ('2': H2), font, size, alignment, spacing, color ('' or false: none) */
  protected setFormat(format: string, value: string | false) {
    this.apply((quill) => quill.format(format, value || false, 'user'));
  }

  protected table(action: TableAction | [rows: number, columns: number]) {
    this.apply((quill) => {
      const tables = quill.getModule('table') as TableModule;
      if (Array.isArray(action)) tables.insertTable(...action);
      else tables[action]();
    });
  }

  protected openBar(kind: TextEditorBar) {
    const quill = this.editable();
    if (!quill) return;
    const range = quill.getSelection();
    const link = kind === 'link' && range && quill.getFormat(range)['link'];
    // Find starts with the selected text
    const selected =
      kind === 'find' && range?.length ? quill.getText(range.index, range.length) : '';
    this.barUrl.set(typeof link === 'string' ? link : selected);
    this.findIndex.set(0);
    this.bar.set(kind);
  }

  protected closeBar() {
    this.bar.set(null);
    this.quill()?.focus();
  }

  protected applyBar() {
    if (this.bar() === 'link') this.applyLink();
    else if (this.bar() === 'image') this.insertImages(null, [normalizeUrl(this.barUrl().trim())]);
    else if (this.bar() === 'video') this.insertVideo();
    else this.step(1);
  }

  /** The video bar's address as a player (YouTube, Vimeo), on its own line at the cursor */
  protected readonly videoSrc = computed(() => videoUrl(this.barUrl().trim()));

  private insertVideo() {
    const src = this.videoSrc();
    if (!src) return;
    this.bar.set(null);
    this.edit((quill, { index }) => {
      quill.insertEmbed(index, 'video', src, 'user');
      quill.setSelection(index + 1, 0, 'user');
    });
  }

  /** Find: the next (1) or previous (-1) match */
  protected step(by: 1 | -1) {
    const count = this.matches().length;
    if (count) this.findIndex.update((i) => (i + by + count) % count);
  }

  /** Find: replaces the current match, or all of them (keeping each one's formatting) */
  protected replace(all = false) {
    const quill = this.editable();
    const matches = this.matches();
    if (!quill || !matches.length) return;
    const current = Math.min(this.findIndex(), matches.length - 1);
    const length = this.barUrl().length;
    for (const index of all ? [...matches].reverse() : [matches[current]]) {
      const formats = quill.getFormat(index, length);
      quill.deleteText(index, length, 'user');
      quill.insertText(index, this.replaceWith(), formats, 'user');
    }
  }

  /** Inserts images (addresses, or files: uploaded with `uploadImage`, else inlined) at the range or the cursor */
  protected async insertImages(range: QuillRange | null, images: (File | string)[]) {
    const quill = this.editable();
    if (!quill) return;
    this.bar.set(null);
    if (!range) quill.focus();
    let index = (range ?? quill.getSelection())?.index ?? quill.getLength() - 1;
    for (const image of images) {
      if (typeof image !== 'string' && !image.type.startsWith('image/')) continue;
      const url = typeof image === 'string' ? image : await (this.uploadImage() ?? dataUrl)(image);
      quill.insertEmbed(index++, 'image', url, 'user');
    }
    quill.setSelection(index, 0, 'user');
  }

  protected applyLink(remove = false) {
    const url = remove ? '' : this.barUrl().trim();
    const link = url && normalizeUrl(url);
    this.bar.set(null);
    this.edit((quill, { index, length }) => {
      if (!length) {
        // The cursor is in a link: change all of it
        const [blot, offset] = quill.scroll.descendant(
          (b: { statics: { blotName: string } } | null) => b?.statics.blotName === 'link',
          index,
        ) as unknown as [{ length(): number } | null, number];
        if (blot) [index, length] = [index - offset, blot.length()];
      }
      if (length) quill.formatText(index, length, 'link', link || false, 'user');
      else if (link) {
        // Nothing selected: insert the address as the link text
        quill.insertText(index, url, 'link', link, 'user');
        quill.setSelection(index + url.length, 0, 'user');
      }
    });
  }

  /** The toolbar's controls, its own and projected ones marked data-tool, in order */
  private toolbarControls(): HTMLElement[] {
    return [
      ...(this.toolbarEl()?.nativeElement.querySelectorAll<HTMLElement>('[data-tool]') ?? []),
    ];
  }

  private setTabStop(target: HTMLElement | undefined) {
    for (const control of this.toolbarControls()) control.tabIndex = control === target ? 0 : -1;
  }

  protected onToolbarFocus(event: FocusEvent) {
    const control = (event.target as HTMLElement).closest<HTMLElement>('[data-tool]');
    if (control) this.setTabStop(control);
  }

  /** Toolbar keys (WAI-ARIA toolbar): arrows, Home and End move between controls; Tab leaves the toolbar */
  protected onToolbarKey(event: KeyboardEvent) {
    const controls = this.toolbarControls().filter((c) => !(c as HTMLButtonElement).disabled);
    const [i, n] = [controls.indexOf(event.target as HTMLElement), controls.length];
    const keys: Record<string, number> = {
      ArrowRight: i + 1,
      ArrowLeft: i - 1 + n,
      Home: 0,
      End: n - 1,
    };
    if (!(event.key in keys) || !n) return;
    event.preventDefault();
    controls[keys[event.key] % n].focus();
  }
}
