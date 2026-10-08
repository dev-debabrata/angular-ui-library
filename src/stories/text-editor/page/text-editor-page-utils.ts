import { afterNextRender, effect, signal } from '@angular/core';

/** Helpers shared by the Text Editor page's modes. Not part of the library */

export const escapeHtml = (text: string) =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Plain text of editor HTML (block ends become line breaks), for counts, titles and snippets */
export const plainText = (html: string) =>
  html
    .replace(/<\/(p|h\d|li|blockquote|pre)>/g, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&[a-z]+;|&#\d+;/g, 'x')
    .trim();

export const wordCount = (text: string) => text.match(/\S+/g)?.length ?? 0;

/**
 * Keeps `value()` in localStorage (this browser only): what was saved is given to `restore` after the first render
 * (SSR-safe), then each change is saved `delay` ms after the last one. Returns whether the last save worked. Call it
 * in an injection context (a constructor or a field initializer)
 */
export function persist<T>(key: string, value: () => T, restore: (saved: T) => void, delay = 0) {
  const saved = signal(false);
  const restored = signal(false);
  afterNextRender(() => {
    try {
      const data = JSON.parse(localStorage.getItem(key) ?? 'null');
      if (data !== null) restore(data);
    } catch {
      // Storage blocked or bad data: keep the starting content
    }
    restored.set(true);
  });
  effect((onCleanup) => {
    const data = JSON.stringify(value());
    if (!restored()) return;
    saved.set(false);
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(key, data);
        saved.set(true);
      } catch {
        // Storage full or blocked: the content just isn't kept
      }
    }, delay);
    onCleanup(() => clearTimeout(timer));
  });
  return saved.asReadonly();
}

/** Full screen for `element`, or back from it */
export const toggleFullscreen = (element: HTMLElement) =>
  document.fullscreenElement ? document.exitFullscreen() : element.requestFullscreen();

/** Link and image addresses that are safe to render (no javascript: and the like) */
const safeUrl = (url: string) => (/^(https?:|mailto:|tel:|[/#.]|[\w-]+\.)/i.test(url) ? url : '#');

/** Inline Markdown on escaped text: `code`, **bold**, *italic*, ~~strike~~, links and images */
function inline(text: string): string {
  return text
    .split(/(`[^`]+`)/)
    .map((part, i) =>
      i % 2
        ? `<code>${part.slice(1, -1)}</code>`
        : part
            .replace(
              /!\[([^\]]*)\]\(([^)\s]+)\)/g,
              (_, alt, src) => `<img src="${safeUrl(src)}" alt="${alt}">`,
            )
            .replace(
              /\[([^\]]+)\]\(([^)\s]+)\)/g,
              (_, label, href) => `<a href="${safeUrl(href)}">${label}</a>`,
            )
            .replace(/(\*\*|__)(?=\S)(.+?)(?<=\S)\1/g, '<strong>$2</strong>')
            .replace(/\*(?=\S)(.+?)(?<=\S)\*|(?<!\w)_(?=\S)(.+?)(?<=\S)_(?!\w)/g, '<em>$1$2</em>')
            .replace(/~~(?=\S)(.+?)(?<=\S)~~/g, '<s>$1</s>'),
    )
    .join('');
}

const BLOCK_START = /^(#{1,6}\s|&gt;|```|\s*([-*+]|\d+\.)\s|(-{3,}|\*{3,})\s*$|\|)/;

/**
 * Markdown to HTML, for the Markdown mode and .md files: headings, paragraphs, lists (with [ ] / [x] tasks), quotes,
 * fenced code, tables, dividers and the inline formats. The text is escaped first, so the HTML is safe to render
 */
export function markdownToHtml(markdown: string): string {
  const lines = escapeHtml(markdown).split(/\r?\n/);
  const html: string[] = [];
  for (let i = 0; i < lines.length;) {
    const line = lines[i];
    if (!line.trim()) {
      i++;
    } else if (line.startsWith('```')) {
      const code: string[] = [];
      while (++i < lines.length && !lines[i].startsWith('```')) code.push(lines[i]);
      i++;
      html.push(`<pre>${code.join('\n')}</pre>`);
    } else if (/^#{1,6}\s/.test(line)) {
      const level = line.indexOf(' ');
      html.push(`<h${level}>${inline(line.slice(level + 1).trim())}</h${level}>`);
      i++;
    } else if (/^(-{3,}|\*{3,})\s*$/.test(line)) {
      html.push('<hr>');
      i++;
    } else if (line.startsWith('&gt;')) {
      const quote: string[] = [];
      for (; i < lines.length && lines[i].startsWith('&gt;'); i++)
        quote.push(lines[i].replace(/^&gt;\s?/, ''));
      html.push(`<blockquote>${inline(quote.join(' '))}</blockquote>`);
    } else if (/^\s*([-*+]|\d+\.)\s/.test(line)) {
      const ordered = /^\s*\d+\./.test(line);
      const items: string[] = [];
      for (; i < lines.length && /^\s*([-*+]|\d+\.)\s/.test(lines[i]); i++) {
        const text = lines[i].replace(/^\s*([-*+]|\d+\.)\s+/, '');
        const task = text.match(/^\[( |x)\]\s+(.*)/i);
        items.push(
          task
            ? `<li data-list="${task[1] === ' ' ? 'unchecked' : 'checked'}">${inline(task[2])}</li>`
            : `<li>${inline(text)}</li>`,
        );
      }
      html.push(ordered ? `<ol>${items.join('')}</ol>` : `<ul>${items.join('')}</ul>`);
    } else if (line.startsWith('|')) {
      const rows: string[] = [];
      for (; i < lines.length && lines[i].startsWith('|'); i++) {
        if (/^\|[\s:|-]+\|?\s*$/.test(lines[i])) continue; // the |---|---| line under the header
        const cells = lines[i].replace(/^\||\|\s*$/g, '').split('|');
        const tag = rows.length ? 'td' : 'th';
        rows.push(`<tr>${cells.map((c) => `<${tag}>${inline(c.trim())}</${tag}>`).join('')}</tr>`);
      }
      html.push(`<table>${rows.join('')}</table>`);
    } else {
      const paragraph = [lines[i++].trim()];
      for (; i < lines.length && lines[i].trim() && !BLOCK_START.test(lines[i]); i++)
        paragraph.push(lines[i].trim());
      html.push(`<p>${inline(paragraph.join(' '))}</p>`);
    }
  }
  return html.join('\n');
}
