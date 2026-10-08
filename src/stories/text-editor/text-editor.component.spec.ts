import { Component, signal } from '@angular/core';
import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import type Quill from 'quill';

import { TextEditorComponent } from './text-editor.component';

/** Render, then wait for Quill (loaded on first use) */
async function ready<T>(
  fixture: ComponentFixture<T>,
  editor: () => TextEditorComponent,
): Promise<Quill> {
  const quill = new Promise<Quill>((resolve) => editor().ready.subscribe(resolve));
  fixture.detectChanges();
  await fixture.whenStable();
  const instance = await quill;
  await fixture.whenStable();
  return instance;
}

const root = (fixture: ComponentFixture<unknown>) =>
  (fixture.nativeElement as HTMLElement).querySelector('.ql-editor') as HTMLElement;

describe('TextEditorComponent', () => {
  let fixture: ComponentFixture<TextEditorComponent>;
  let editor: TextEditorComponent;

  beforeEach(() => {
    fixture = TestBed.createComponent(TextEditorComponent);
    editor = fixture.componentInstance;
  });

  it('creates the editor and its toolbar', async () => {
    await ready(fixture, () => editor);
    expect(editor).toBeTruthy();
    expect(root(fixture)).toBeTruthy();
    const toolbar = fixture.nativeElement.querySelector('[role="toolbar"]') as HTMLElement;
    expect(toolbar.querySelector('[aria-label="Bold"]')).toBeTruthy();
    // Roving tabindex: only the first control is in the Tab order
    expect(toolbar.querySelectorAll('[data-tool][tabindex="0"]').length).toBe(1);
  });

  it('shows the initial HTML value', async () => {
    fixture.componentRef.setInput('value', '<p>Hello <strong>world</strong></p>');
    await ready(fixture, () => editor);
    expect(root(fixture).innerHTML).toContain('<strong>world</strong>');
  });

  it('emits valueChange with HTML on user edits, and an empty string when cleared', async () => {
    const quill = await ready(fixture, () => editor);
    const emitted: string[] = [];
    editor.value.subscribe((v) => emitted.push(v));

    quill.insertText(0, 'Hi there', 'user');
    expect(emitted.at(-1)).toBe('<p>Hi there</p>');

    quill.deleteText(0, quill.getLength(), 'user');
    expect(emitted.at(-1)).toBe('');
  });

  it('does not emit valueChange for value set from outside', async () => {
    await ready(fixture, () => editor);
    const emitted: string[] = [];
    editor.value.subscribe((v) => emitted.push(v));
    fixture.componentRef.setInput('value', '<p>From outside</p>');
    await fixture.whenStable();
    expect(root(fixture).textContent).toContain('From outside');
    expect(emitted).toEqual([]);
  });

  it('applies formats from the toolbar', async () => {
    // jsdom has no layout; Quill measures the selection to scroll it into view
    Range.prototype.getBoundingClientRect ??= () => new DOMRect();
    fixture.componentRef.setInput('value', '<p>Make me bold</p>');
    const quill = await ready(fixture, () => editor);
    quill.setSelection(0, 4);
    (fixture.nativeElement.querySelector('[aria-label="Bold"]') as HTMLButtonElement).click();
    expect(editor.value()).toBe('<p><strong>Make</strong> me bold</p>');
  });

  describe('content tools', () => {
    const click = (label: string) =>
      (
        fixture.nativeElement.querySelector(`button[aria-label="${label}"]`) as HTMLButtonElement
      ).click();

    beforeEach(() => {
      Range.prototype.getBoundingClientRect ??= () => new DOMRect();
    });

    /** A key pressed in the editing area (Quill's keyboard bindings) */
    const press = (quill: Quill, key: string, init: KeyboardEventInit = {}) =>
      quill.root.dispatchEvent(
        new KeyboardEvent('keydown', {
          key,
          shiftKey: '>*~'.includes(key),
          bubbles: true,
          ...init,
        }),
      );
    /** Types text at the cursor (jsdom doesn't move the cursor itself) */
    const typeAtCursor = (quill: Quill, text: string) => {
      const index = quill.getSelection(true).index;
      quill.insertText(index, text, 'user');
      quill.setSelection(index + text.length, 0);
    };
    /** Types text, then presses the shortcut's last key */
    const typeThen = (quill: Quill, text: string, key: string) => {
      typeAtCursor(quill, text);
      press(quill, key);
    };
    /** Opens a toolbar menu, then picks an item in it */
    const pick = (menu: string, item: string) => {
      click(menu);
      fixture.detectChanges();
      const button = [...document.querySelectorAll<HTMLButtonElement>('.te__menu button')].find(
        (b) => b.textContent?.trim() === item || b.getAttribute('aria-label') === item,
      );
      button!.click();
      fixture.detectChanges();
    };

    it('turns markdown at the start of a line into headings, quotes, code blocks, lists and dividers', async () => {
      const quill = await ready(fixture, () => editor);
      const cases: [typed: string, key: string, html: string][] = [
        ['#', ' ', '<h1>x</h1>'],
        ['###', ' ', '<h3>x</h3>'],
        ['>', ' ', '<blockquote>x</blockquote>'],
        ['-', ' ', '<ul><li>x</li></ul>'],
        ['1.', ' ', '<ol><li>x</li></ol>'],
        ['[]', ' ', '<ul><li data-list="unchecked">x</li></ul>'],
      ];
      for (const [typed, key, html] of cases) {
        quill.setText('', 'user');
        quill.setSelection(0, 0);
        typeThen(quill, typed, key);
        typeAtCursor(quill, 'x');
        expect(editor.value(), typed).toBe(html);
      }
      quill.setText('', 'user');
      quill.setSelection(0, 0);
      typeThen(quill, '```', 'Enter');
      expect(quill.getFormat()['code-block']).toBeTruthy();

      quill.setText('', 'user');
      quill.setSelection(0, 0);
      typeThen(quill, '---', 'Enter');
      typeAtCursor(quill, 'after');
      expect(editor.value()).toBe('<hr><p>after</p>');
    });

    it('turns **bold**, *italic*, `code` and ~~strike~~ into formatting, but not 2 * 3 * 4', async () => {
      const quill = await ready(fixture, () => editor);
      const cases: [typed: string, key: string, html: string][] = [
        ['a **b*', '*', '<p>a <strong>b</strong>z</p>'],
        ['a *b', '*', '<p>a <em>b</em>z</p>'],
        ['a `b', '`', '<p>a <code>b</code>z</p>'],
        ['a ~~b~', '~', '<p>a <s>b</s>z</p>'],
      ];
      for (const [typed, key, html] of cases) {
        quill.setText('', 'user');
        quill.setSelection(0, 0);
        typeThen(quill, typed, key);
        typeAtCursor(quill, 'z');
        expect(editor.value(), typed).toBe(html);
      }
      quill.setText('', 'user');
      quill.setSelection(0, 0);
      typeThen(quill, '2 * 3 ', '*');
      expect(editor.value()).toBe('<p>2 * 3 </p>');

      fixture.componentRef.setInput('markdown', false);
      quill.setText('', 'user');
      quill.setSelection(0, 0);
      typeThen(quill, '#', ' ');
      typeAtCursor(quill, 'x');
      expect(editor.value()).toBe('<p>#x</p>');
    });

    it('sets the font size as an inline style', async () => {
      fixture.componentRef.setInput('value', '<p>Big text</p>');
      const quill = await ready(fixture, () => editor);
      quill.setSelection(0, 3);
      const select = fixture.nativeElement.querySelector(
        'select[aria-label="Font size"]',
      ) as HTMLSelectElement;
      select.value = '24px';
      select.dispatchEvent(new Event('change'));
      expect(editor.value()).toBe('<p><span style="font-size: 24px;">Big</span> text</p>');
    });

    it('sets the font as an inline style and line spacing on the line', async () => {
      fixture.componentRef.setInput('value', '<p>Serif text</p>');
      const quill = await ready(fixture, () => editor);
      quill.setSelection(0, 5);
      const select = fixture.nativeElement.querySelector(
        'select[aria-label="Font"]',
      ) as HTMLSelectElement;
      select.value = 'Georgia, serif';
      select.dispatchEvent(new Event('change'));
      expect(editor.value()).toBe(
        '<p><span style="font-family: Georgia, serif;">Serif</span> text</p>',
      );
      quill.setSelection(0, 0);
      pick('Line spacing', '1.5');
      expect(editor.value()).toContain('<p style="line-height: 1.5;">');
    });

    it('changes the letter case of the selection, keeping its formatting', async () => {
      fixture.componentRef.setInput('value', '<p>hello <strong>big</strong> world. next one</p>');
      const quill = await ready(fixture, () => editor);
      quill.setSelection(0, 15);
      pick('Change case', 'UPPERCASE');
      expect(editor.value()).toBe('<p>HELLO <strong>BIG</strong> WORLD. next one</p>');
      quill.setSelection(0, 24);
      pick('Change case', 'Title Case');
      expect(editor.value()).toBe('<p>Hello <strong>Big</strong> World. Next One</p>');
      quill.setSelection(0, 24);
      pick('Change case', 'Sentence case');
      expect(editor.value()).toBe('<p>Hello <strong>big</strong> world. Next one</p>');
    });

    it('inserts emoji and special characters at the cursor', async () => {
      fixture.componentRef.setInput('value', '<p>AB</p>');
      const quill = await ready(fixture, () => editor);
      quill.setSelection(1, 0);
      pick('Emoji', '🎉');
      pick('Special characters', '©');
      expect(editor.value()).toBe('<p>A🎉©B</p>');
    });

    it('embeds YouTube and Vimeo videos as players, and nothing else', async () => {
      fixture.componentRef.setInput('value', '<p>A</p>');
      const quill = await ready(fixture, () => editor);
      quill.setSelection(1, 0);
      click('Video (YouTube, Vimeo)');
      fixture.detectChanges();
      const form = fixture.nativeElement.querySelector('.te__bar') as HTMLFormElement;
      const url = form.querySelector('.te__bar-input') as HTMLInputElement;
      const submit = form.querySelector('[type=submit]') as HTMLButtonElement;
      url.value = 'example.com/clip';
      url.dispatchEvent(new Event('input'));
      fixture.detectChanges();
      expect(submit.disabled).toBe(true);
      url.value = 'https://youtu.be/dQw4w9WgXcQ';
      url.dispatchEvent(new Event('input'));
      fixture.detectChanges();
      form.requestSubmit();
      expect(editor.value()).toContain(
        '<iframe class="ql-video" src="https://www.youtube.com/embed/dQw4w9WgXcQ"',
      );
      // Other iframes (pasted HTML) are blanked
      fixture.componentRef.setInput(
        'value',
        '<iframe class="ql-video" src="https://evil.example"></iframe>',
      );
      fixture.detectChanges();
      await fixture.whenStable();
      expect(root(fixture).querySelector('iframe')?.getAttribute('src')).toBe('about:blank');
    });

    it('indents up to 3 levels, nesting list items in the HTML', async () => {
      fixture.componentRef.setInput('value', '<ol><li>One</li><li>Two</li></ol><p>Para</p>');
      const quill = await ready(fixture, () => editor);
      quill.setSelection(5, 0);
      click('Increase indent');
      expect(editor.value()).toBe('<ol><li>One<ol><li>Two</li></ol></li></ol><p>Para</p>');
      quill.setSelection(9, 0);
      for (let i = 0; i < 5; i++) click('Increase indent');
      expect(editor.value()).toContain('<p class="ql-indent-3">Para</p>');
      click('Decrease indent');
      expect(editor.value()).toContain('<p class="ql-indent-2">Para</p>');
    });

    it('aligns from the alignment menu and colors from the color menu', async () => {
      fixture.componentRef.setInput('value', '<p>Hello</p>');
      const quill = await ready(fixture, () => editor);
      quill.setSelection(0, 5);
      pick('Align', 'Center');
      expect(editor.value()).toBe('<p style="text-align: center;">Hello</p>');
      quill.setSelection(0, 5);
      pick('Highlight', 'Highlight: Light yellow');
      expect(editor.value()).toContain('background-color: rgb(254, 240, 138)');
    });

    it('inserts a table from the size picker, edits it, and reads it back', async () => {
      fixture.componentRef.setInput('value', '<p>Start</p>');
      const quill = await ready(fixture, () => editor);
      quill.setSelection(5, 0);
      pick('Table', '2 by 3 table');
      const cells = () => root(fixture).querySelectorAll('td').length;
      expect(cells()).toBe(6);
      expect(editor.value()).toContain('<table style="width: 100%; border-collapse: collapse;">');
      expect(editor.value()).toContain('style="border: 1px solid #cbd5e1; padding: 6px 10px;"');

      const firstCell = (quill.scroll as unknown as { find(n: Node): never }).find(
        root(fixture).querySelector('td')!,
      );
      quill.setSelection(quill.getIndex(firstCell), 0);
      editor['formats'].set(quill.getFormat());
      pick('Table', 'Insert row below');
      expect(cells()).toBe(9);

      const html = editor.value();
      editor.writeValue('<p>x</p>');
      editor.writeValue(html);
      await fixture.whenStable();
      expect(cells()).toBe(9);
    });

    it('finds and replaces, keeping the formatting', async () => {
      fixture.componentRef.setInput('value', '<p>cat <strong>Cat</strong> dog cat</p>');
      const quill = await ready(fixture, () => editor);
      quill.setSelection(0, 0);
      press(quill, 'f', { ctrlKey: true });
      fixture.detectChanges();
      const [find, replaceInput] = fixture.nativeElement.querySelectorAll(
        '.te__bar .te__bar-input',
      ) as NodeListOf<HTMLInputElement>;
      find.value = 'cat';
      find.dispatchEvent(new Event('input'));
      replaceInput.value = 'fox';
      replaceInput.dispatchEvent(new Event('input'));
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('.te__matches').textContent.trim()).toBe('1 of 3');
      (
        fixture.nativeElement.querySelector('[aria-label="Next match"]') as HTMLButtonElement
      ).click();
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('.te__matches').textContent.trim()).toBe('2 of 3');
      [...fixture.nativeElement.querySelectorAll('.te__bar button')]
        .find((b: HTMLButtonElement) => b.textContent?.trim() === 'Replace')
        .click();
      expect(editor.value()).toBe('<p>cat <strong>fox</strong> dog cat</p>');
      [...fixture.nativeElement.querySelectorAll('.te__bar button')]
        .find((b: HTMLButtonElement) => b.textContent?.trim() === 'All')
        .click();
      expect(editor.value()).toBe('<p>fox <strong>fox</strong> dog fox</p>');
    });

    it('counts words and characters, and stops at maxLength', async () => {
      fixture.componentRef.setInput('maxLength', 10);
      const quill = await ready(fixture, () => editor);
      quill.insertText(0, 'one two', 'user');
      fixture.detectChanges();
      const count = () =>
        fixture.nativeElement.querySelector('.te__count').textContent.replace(/\s+/g, ' ').trim();
      expect(count()).toBe('2 words · 7 / 10 characters');
      quill.insertText(7, ' three four', 'user');
      fixture.detectChanges();
      expect(editor.value()).toBe('<p>one two th</p>');
      expect(count()).toBe('3 words · 10 / 10 characters');
    });

    it('applies inline code, superscript and subscript', async () => {
      fixture.componentRef.setInput('value', '<p>x2 H2O code</p>');
      const quill = await ready(fixture, () => editor);
      quill.setSelection(1, 1);
      click('Superscript');
      quill.setSelection(4, 1);
      click('Subscript');
      quill.setSelection(7, 4);
      click('Inline code');
      expect(editor.value()).toBe('<p>x<sup>2</sup> H<sub>2</sub>O <code>code</code></p>');
    });

    it('makes a checklist and keeps checked items', async () => {
      fixture.componentRef.setInput('value', '<p>Todo</p>');
      const quill = await ready(fixture, () => editor);
      quill.setSelection(1, 0);
      click('Checklist');
      expect(editor.value()).toBe('<ul><li data-list="unchecked">Todo</li></ul>');
      editor.writeValue('<ul><li data-list="checked">Done</li></ul>');
      await fixture.whenStable();
      expect(root(fixture).querySelector('li')?.getAttribute('data-list')).toBe('checked');
    });

    it('inserts a divider under the cursor line, then types below it, and reads <hr> back', async () => {
      fixture.componentRef.setInput('value', '<p>Above</p>');
      const quill = await ready(fixture, () => editor);
      quill.setSelection(5, 0); // end of the last line
      click('Divider');
      quill.insertText(quill.getSelection()!.index, 'Below', 'user');
      expect(editor.value()).toBe('<p>Above</p><hr><p>Below</p>');

      quill.setSelection(2, 0); // middle of a line: the line stays whole
      click('Divider');
      expect(editor.value()).toBe('<p>Above</p><hr><hr><p>Below</p>');

      editor.writeValue('<p>a</p><p><br></p><p>b</p>');
      await fixture.whenStable();
      quill.setSelection(2, 0); // an empty line: the divider takes its place, the cursor stays on it
      click('Divider');
      quill.insertText(quill.getSelection()!.index, 'x', 'user');
      expect(editor.value()).toBe('<p>a</p><hr><p>x</p><p>b</p>');
      editor.writeValue('<p>a</p><hr><p>b</p>');
      await fixture.whenStable();
      expect(root(fixture).querySelector('hr')).toBeTruthy();
    });

    it('inserts images at the cursor: uploaded from the image bar, or by address', async () => {
      const upload = vi.fn(async () => 'https://cdn.example.com/a.png');
      fixture.componentRef.setInput('uploadImage', upload);
      fixture.componentRef.setInput('value', '<p>AB</p>');
      const quill = await ready(fixture, () => editor);
      const openBar = () => {
        click('Image');
        fixture.detectChanges();
        return fixture.nativeElement.querySelector('.te__bar') as HTMLFormElement;
      };

      quill.setSelection(1, 0);
      const file = openBar().querySelector('input[type=file]') as HTMLInputElement;
      Object.defineProperty(file, 'files', {
        value: [new File(['x'], 'a.png', { type: 'image/png' })],
      });
      file.dispatchEvent(new Event('change'));
      await vi.waitFor(() =>
        expect(editor.value()).toBe('<p>A<img src="https://cdn.example.com/a.png">B</p>'),
      );

      const form = openBar();
      const url = form.querySelector('.te__bar-input') as HTMLInputElement;
      url.value = 'example.com/b.jpg';
      url.dispatchEvent(new Event('input'));
      fixture.detectChanges();
      form.requestSubmit();
      await vi.waitFor(() =>
        expect(editor.value()).toBe(
          '<p>A<img src="https://cdn.example.com/a.png"><img src="https://example.com/b.jpg">B</p>',
        ),
      );
    });

    it('turns typed shortcuts into symbols, unless typography is off', async () => {
      fixture.componentRef.setInput('value', '<p>a -</p>');
      const quill = await ready(fixture, () => editor);
      const type = (key: string) =>
        quill.root.dispatchEvent(
          new KeyboardEvent('keydown', { key, shiftKey: key === '>', bubbles: true }),
        );
      quill.setSelection(3, 0);
      type('>');
      expect(editor.value()).toBe('<p>a →</p>');

      fixture.componentRef.setInput('typography', false);
      quill.setText('a -', 'user');
      quill.setSelection(3, 0);
      type('>');
      expect(editor.value()).toBe('<p>a -</p>');
    });
  });

  it('undoes and redoes edits, with the buttons disabled when there is nothing to do', async () => {
    Range.prototype.getBoundingClientRect ??= () => new DOMRect();
    const quill = await ready(fixture, () => editor);
    const button = (label: string) =>
      fixture.nativeElement.querySelector(`[aria-label="${label}"]`) as HTMLButtonElement;
    fixture.detectChanges();
    expect(button('Undo').disabled).toBe(true);
    expect(button('Redo').disabled).toBe(true);

    quill.insertText(0, 'Draft', 'user');
    fixture.detectChanges();
    expect(button('Undo').disabled).toBe(false);

    button('Undo').click();
    fixture.detectChanges();
    expect(editor.value()).toBe('');
    expect(button('Redo').disabled).toBe(false);

    button('Redo').click();
    expect(editor.value()).toBe('<p>Draft</p>');
  });

  it('clears the formats of the cursor line when nothing is selected', async () => {
    Range.prototype.getBoundingClientRect ??= () => new DOMRect();
    fixture.componentRef.setInput('value', '<h2><strong>Title</strong></h2><p>Next</p>');
    const quill = await ready(fixture, () => editor);
    quill.setSelection(2, 0);
    (
      fixture.nativeElement.querySelector('[aria-label="Clear formatting"]') as HTMLButtonElement
    ).click();
    expect(editor.value()).toBe('<p>Title</p><p>Next</p>');

    // The last line too, without adding an empty line after it
    quill.setSelection(7, 0);
    quill.formatLine(7, 1, 'header', 3, 'user');
    (
      fixture.nativeElement.querySelector('[aria-label="Clear formatting"]') as HTMLButtonElement
    ).click();
    expect(editor.value()).toBe('<p>Title</p><p>Next</p>');
  });

  it('inserts a link at the cursor when nothing is selected', async () => {
    Range.prototype.getBoundingClientRect ??= () => new DOMRect();
    fixture.componentRef.setInput('value', '<p>Docs</p>');
    const quill = await ready(fixture, () => editor);
    quill.setSelection(4, 0);
    (fixture.nativeElement.querySelector('[aria-label="Link"]') as HTMLButtonElement).click();
    fixture.detectChanges();
    const url = fixture.nativeElement.querySelector('.te__bar-input') as HTMLInputElement;
    url.value = 'example.com';
    url.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    (fixture.nativeElement.querySelector('.te__bar') as HTMLFormElement).requestSubmit();
    expect(editor.value()).toContain('<a href="https://example.com"');
    expect(editor.value()).toContain('>example.com</a>');
  });

  it('writes alignment as an inline style', async () => {
    fixture.componentRef.setInput('value', '<p>Centered</p>');
    const quill = await ready(fixture, () => editor);
    quill.formatLine(0, 1, 'align', 'center', 'user');
    expect(editor.value()).toBe('<p style="text-align: center;">Centered</p>');
  });

  it('keeps single spaces plain in the emitted HTML', async () => {
    const quill = await ready(fixture, () => editor);
    quill.insertText(0, 'a b  c', 'user');
    expect(editor.value()).toBe('<p>a b &nbsp;c</p>');
  });

  it('shows the placeholder', async () => {
    fixture.componentRef.setInput('placeholder', 'Type here');
    await ready(fixture, () => editor);
    expect(root(fixture).getAttribute('data-placeholder')).toBe('Type here');
    expect(root(fixture).getAttribute('aria-placeholder')).toBe('Type here');
    expect(root(fixture).classList).toContain('ql-blank');
  });

  it('labels the editing area', async () => {
    fixture.componentRef.setInput('label', 'Description');
    await ready(fixture, () => editor);
    const labelId = root(fixture).getAttribute('aria-labelledby')!;
    expect(fixture.nativeElement.querySelector(`#${labelId}`).textContent).toContain('Description');
    expect(root(fixture).getAttribute('role')).toBe('textbox');
    expect(root(fixture).getAttribute('aria-multiline')).toBe('true');
  });

  it('turns editing and the toolbar off when disabled', async () => {
    fixture.componentRef.setInput('disabled', true);
    await ready(fixture, () => editor);
    expect(root(fixture).getAttribute('contenteditable')).toBe('false');
    expect(root(fixture).getAttribute('aria-disabled')).toBe('true');
    const buttons = [...fixture.nativeElement.querySelectorAll('.te__tool')] as HTMLButtonElement[];
    expect(buttons.length).toBeGreaterThan(0);
    expect(buttons.every((b) => b.disabled)).toBe(true);
    expect(fixture.nativeElement.classList).toContain('np-text-editor--disabled');
  });

  it('shows content without a toolbar when read-only, and keeps it focusable', async () => {
    fixture.componentRef.setInput('readonly', true);
    fixture.componentRef.setInput('value', '<p>Read me</p>');
    await ready(fixture, () => editor);
    expect(fixture.nativeElement.querySelector('[role="toolbar"]')).toBeNull();
    expect(root(fixture).getAttribute('contenteditable')).toBe('false');
    expect(root(fixture).getAttribute('aria-readonly')).toBe('true');
    expect(root(fixture).getAttribute('tabindex')).toBe('0');
    expect(root(fixture).textContent).toContain('Read me');
  });

  it('lets Tab leave the editor', async () => {
    const quill = await ready(fixture, () => editor);
    expect(quill.keyboard.bindings['Tab']).toEqual([]);
  });

  describe('ControlValueAccessor', () => {
    it('writeValue sets the content without calling onChange', async () => {
      const onChange = vi.fn();
      editor.registerOnChange(onChange);
      await ready(fixture, () => editor);
      editor.writeValue('<p>Written</p>');
      await fixture.whenStable();
      expect(root(fixture).textContent).toContain('Written');
      expect(onChange).not.toHaveBeenCalled();
      editor.writeValue(null);
      await fixture.whenStable();
      expect(editor.value()).toBe('');
    });

    it('calls onChange with the HTML on user edits', async () => {
      const onChange = vi.fn();
      editor.registerOnChange(onChange);
      const quill = await ready(fixture, () => editor);
      quill.insertText(0, 'Typed', 'user');
      expect(onChange).toHaveBeenCalledWith('<p>Typed</p>');
    });

    it('calls onTouched when focus leaves the component', async () => {
      const onTouched = vi.fn();
      editor.registerOnTouched(onTouched);
      await ready(fixture, () => editor);
      const bold = fixture.nativeElement.querySelector('[aria-label="Bold"]');
      root(fixture).dispatchEvent(
        new FocusEvent('focusout', { bubbles: true, relatedTarget: bold }),
      );
      expect(onTouched).not.toHaveBeenCalled();
      root(fixture).dispatchEvent(
        new FocusEvent('focusout', { bubbles: true, relatedTarget: document.body }),
      );
      expect(onTouched).toHaveBeenCalledTimes(1);
    });

    it('setDisabledState disables and re-enables the editor', async () => {
      await ready(fixture, () => editor);
      editor.setDisabledState(true);
      await fixture.whenStable();
      expect(root(fixture).getAttribute('contenteditable')).toBe('false');
      editor.setDisabledState(false);
      await fixture.whenStable();
      expect(root(fixture).getAttribute('contenteditable')).toBe('true');
    });
  });
});

@Component({
  imports: [TextEditorComponent, ReactiveFormsModule, FormsModule],
  template: `
    <np-text-editor id="reactive" [formControl]="control" />
    <np-text-editor id="model" [(ngModel)]="content" />
  `,
})
class FormsHost {
  readonly control = new FormControl('<p>From the control</p>');
  readonly content = signal('<p>From ngModel</p>');
}

describe('TextEditorComponent in forms', () => {
  let fixture: ComponentFixture<FormsHost>;
  let quills: Quill[];
  const editorEl = (id: string) =>
    fixture.nativeElement.querySelector(`#${id} .ql-editor`) as HTMLElement;

  beforeEach(async () => {
    fixture = TestBed.createComponent(FormsHost);
    fixture.detectChanges();
    const editors = fixture.debugElement
      .queryAll(By.directive(TextEditorComponent))
      .map((el) => el.componentInstance as TextEditorComponent);
    const loaded = editors.map((e) => new Promise<Quill>((resolve) => e.ready.subscribe(resolve)));
    await fixture.whenStable();
    quills = await Promise.all(loaded);
    await fixture.whenStable();
  });

  it('shows the FormControl value and writes edits back', async () => {
    expect(editorEl('reactive').textContent).toContain('From the control');
    quills[0].setText('Edited', 'user');
    expect(fixture.componentInstance.control.value).toBe('<p>Edited</p>');
    expect(fixture.componentInstance.control.dirty).toBe(true);
  });

  it('follows setValue and disable() on the FormControl', async () => {
    const { control } = fixture.componentInstance;
    control.setValue('<p>Set from code</p>');
    await fixture.whenStable();
    expect(editorEl('reactive').textContent).toContain('Set from code');
    control.disable();
    await fixture.whenStable();
    expect(editorEl('reactive').getAttribute('contenteditable')).toBe('false');
  });

  it('marks the FormControl touched when focus leaves', () => {
    editorEl('reactive').dispatchEvent(
      new FocusEvent('focusout', { bubbles: true, relatedTarget: document.body }),
    );
    expect(fixture.componentInstance.control.touched).toBe(true);
  });

  it('works with [(ngModel)]', async () => {
    await fixture.whenStable();
    expect(editorEl('model').textContent).toContain('From ngModel');
    quills[1].setText('Changed', 'user');
    await fixture.whenStable();
    expect(fixture.componentInstance.content()).toBe('<p>Changed</p>');
  });
});
