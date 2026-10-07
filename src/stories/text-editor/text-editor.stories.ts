import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular-vite';
import { fn } from 'storybook/test';

import {
  TEXT_EDITOR_THEMES,
  TEXT_EDITOR_TOOLS,
  TextEditorComponent,
} from './text-editor.component';
import { appearanceStories } from '../utils/appearance-stories';

const CONTENT = `<h2>Release notes</h2>
<p>This release brings a <strong>faster editor</strong>, <em>better shortcuts</em> and <u>new colors</u>.
Read the <a href="https://example.com">full changelog</a>.</p>
<ul><li>Bold, italic, underline and <s>strike</s></li><li>Headings, lists and quotes</li></ul>
<blockquote>Write once, publish everywhere.</blockquote>`;

const LONG_CONTENT = Array.from(
  { length: 8 },
  (_, i) => `<h3>Section ${i + 1}</h3>
<p>Long documents scroll inside the editor once they pass <code>maxHeight</code>, while the toolbar stays in place.
Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
<ol><li>First point of section ${i + 1}</li><li>Second point</li></ol>`,
).join('\n');

const meta: Meta<TextEditorComponent> = {
  title: 'Components/Form/Text Editor',
  component: TextEditorComponent,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `A rich text editor built on [Quill 2](https://quilljs.com) with a NexPrime toolbar: undo / redo,
text style (paragraph, H1–H3) and font size, bold, italic, underline, strike, inline code, superscript and
subscript, text and highlight colors, numbered, bulleted and check lists, indent (3 levels), alignment, links,
images (upload, address, paste or drop), tables (size picker; insert or delete rows and columns), quotes, code
blocks, dividers, find & replace (Ctrl/⌘ F) and clear formatting. The value is **HTML** (\`''\` when empty).

**Typing shortcuts**: markdown (\`#\` + space for headings, \`-\` / \`1.\` / \`[]\` for lists, \`>\` quote,
three backticks for code, \`---\` + Enter divider, \`**bold**\`, \`*italic*\`, backticks around \`code\`, \`~~strike~~\`; \`markdown\`
turns it off) and typography (\`->\` →, \`--\` —, \`...\` …, \`(c)\` ©; \`typography\`).

**Count and limit**: \`showCount\` shows words and characters under the editor; \`maxLength\` stops at a
number of characters (and shows the count).

**Images**: set \`uploadImage\` to a function that uploads a file and returns its URL; without it, images are
inlined as \`data:\` URLs in the HTML.

**Installation**: \`npm install nexprime\` brings Quill along (a dependency). Nothing else to set up: Quill loads
on first use, only in the browser, so pages that don't show an editor don't load it, and server rendering works.
The editor brings its own styles; Quill's CSS themes aren't needed.

**Basic usage**

\`\`\`html
<np-text-editor [(value)]="html" placeholder="Write your description..." />
\`\`\`

**Template-driven forms** (import \`FormsModule\`)

\`\`\`html
<np-text-editor [(ngModel)]="content" placeholder="Write your description..."></np-text-editor>
\`\`\`

**Reactive forms** (import \`ReactiveFormsModule\`). The editor is a \`ControlValueAccessor\`: \`writeValue\`,
\`registerOnChange\`, \`registerOnTouched\` (on leaving the editor) and \`setDisabledState\` all work.

\`\`\`html
<form [formGroup]="form">
  <np-text-editor formControlName="description" placeholder="Enter description"></np-text-editor>
</form>
\`\`\`

**Disabled vs. read-only**: \`disabled\` (or a disabled form control) dims the editor and turns off editing and the
toolbar; it's announced as \`aria-disabled\` and skipped by Tab. \`readonly\` hides the toolbar and shows the content
as is: it can still be focused, selected and copied, and is announced as \`aria-readonly\`.

**Keyboard**: Ctrl/⌘ B, I, U and K (link). Tab leaves the editor (it doesn't insert a tab). In the toolbar, arrow
keys, Home and End move between the controls.

**Outputs**: \`valueChange\` (the HTML, on every edit) and \`ready\` (the Quill instance, for advanced use).`,
      },
    },
  },
  argTypes: {
    theme: { control: 'inline-radio', options: TEXT_EDITOR_THEMES },
    tools: { control: 'check', options: TEXT_EDITOR_TOOLS },
  },
  args: {
    label: 'Description',
    placeholder: 'Write something...',
    valueChange: fn(),
    ready: fn(),
  },
};

export default meta;
type Story = StoryObj<TextEditorComponent>;

export const Default: Story = {};

export const WithPlaceholder: Story = { args: { placeholder: 'Tell us about your product...' } };

export const WithContent: Story = { args: { value: CONTENT } };

/** No editing and no toolbar actions; dimmed and announced as disabled */
export const Disabled: Story = { args: { value: CONTENT, disabled: true } };

/** Content only: no toolbar, still focusable, selectable and copyable */
export const ReadOnly: Story = { args: { value: CONTENT, readonly: true } };

/** `theme="dark"` gives this editor the dark look on a light page (`auto`, the default, follows the page's mode) */
export const DarkTheme: Story = {
  args: { value: CONTENT, theme: 'dark' },
  render: (args) => ({
    props: args,
    template: `<div style="padding: 24px; border-radius: 16px; background: #0b1222; color: #e2e8f0">
  <np-text-editor [value]="value" [theme]="theme" [label]="label" [placeholder]="placeholder"
    (valueChange)="valueChange($event)"></np-text-editor>
</div>`,
  }),
};

/** Past `maxHeight` the content scrolls inside the editor */
export const LongContent: Story = { args: { value: LONG_CONTENT, maxHeight: '320px' } };

/** `minHeight` and `maxHeight` take any CSS length; a smaller toolbar with `tools` */
export const CustomHeight: Story = {
  args: {
    label: 'Short note',
    minHeight: '96px',
    maxHeight: '160px',
    tools: ['bold', 'italic', 'underline', 'bullet', 'link', 'clean'],
    hint: 'Grows from 96px to 160px, then scrolls.',
  },
};

/** `showCount` and `maxLength`: a word and character count under the editor, and a limit */
export const WordCount: Story = {
  args: {
    label: 'Post',
    minHeight: '120px',
    maxLength: 280,
    hint: 'Up to 280 characters.',
    tools: ['bold', 'italic', 'link', 'bullet', 'clean'],
  },
};

/** Reactive forms (`formControlName`) with a required validator, and template-driven forms (`[(ngModel)]`) */
export const FormIntegration: Story = {
  decorators: [moduleMetadata({ imports: [ReactiveFormsModule, FormsModule] })],
  render: () => {
    const form = new FormGroup({
      description: new FormControl(
        '<p>Initial <strong>HTML</strong> from the form control.</p>',
        Validators.required,
      ),
    });
    const control = form.controls.description;
    return {
      props: { form, control, content: '<p>Bound with <em>ngModel</em>.</p>' },
      template: `<div style="display: grid; gap: 32px; max-width: 720px">
  <form [formGroup]="form" style="display: grid; gap: 12px">
    <np-text-editor formControlName="description" label="Description (reactive form)" placeholder="Enter description"
      minHeight="140px" [invalid]="control.invalid && control.touched"
      [hint]="control.invalid && control.touched ? 'A description is required.' : ''"></np-text-editor>
    <div style="display: flex; gap: 8px; flex-wrap: wrap">
      <button type="button" class="ui-btn ui-btn--sm" (click)="control.disabled ? control.enable() : control.disable()">
        {{ control.disabled ? 'Enable' : 'Disable' }} control
      </button>
      <button type="button" class="ui-btn ui-btn--sm" (click)="control.setValue('<p>Set from <u>code</u>.</p>')">Set value</button>
      <button type="button" class="ui-btn ui-btn--sm" (click)="control.reset('')">Reset</button>
    </div>
    <code style="font-size: 12px; color: var(--ui-text-muted)">
      status: {{ control.status }} · touched: {{ control.touched }} · dirty: {{ control.dirty }}
    </code>
    <pre style="margin: 0; padding: 12px; border-radius: 10px; background: var(--ui-surface-sunken); white-space: pre-wrap; font-size: 12px">{{ control.value }}</pre>
  </form>

  <div style="display: grid; gap: 12px">
    <np-text-editor [(ngModel)]="content" label="Notes (template-driven)" minHeight="120px"></np-text-editor>
    <pre style="margin: 0; padding: 12px; border-radius: 10px; background: var(--ui-surface-sunken); white-space: pre-wrap; font-size: 12px">{{ content }}</pre>
  </div>
</div>`,
    };
  },
};

/** The appearance classes from theme.css (np-color-*, np-shape-*) on the With Content example */
const appearance = appearanceStories(meta, {
  args: { ...WithContent.args, minHeight: '120px', maxHeight: '200px' },
});
export const AppearanceColors = appearance.colors;
export const AppearanceShapes = appearance.shapes;
