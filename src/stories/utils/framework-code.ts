import { signal } from '@angular/core';

import type { ToggleOption } from '../components/form/button-toggle/button-toggle.component';

/** Frameworks the Icons, Animations and NexLottie pages show copyable code for */
export type Framework = 'angular' | 'react' | 'next' | 'vue' | 'html';

export const FRAMEWORKS: ToggleOption<Framework>[] = [
  { value: 'angular', label: 'Angular' },
  { value: 'react', label: 'React' },
  { value: 'next', label: 'Next.js' },
  { value: 'vue', label: 'Vue' },
  { value: 'html', label: 'HTML' },
];

/** The framework picked last, shared by every page, so the choice carries over */
export const FRAMEWORK = signal<Framework>('angular');

/** One-line setup note under the code (the Getting Started page has the details) */
export function setupNote(framework: Framework, angularImport = '') {
  return {
    angular: angularImport
      ? `Add ${angularImport} to your component’s imports.`
      : 'The classes come with theme.css.',
    react: 'React 19+. Load nexprime.js and styles.css once.',
    next: 'Server or client component. Load nexprime.js once in app/layout.tsx.',
    vue: 'Mark np-* tags as custom elements in vite.config.',
    html: 'Load nexprime.js and styles.css once.',
  }[framework];
}

export interface ElementCode {
  /** Name without a prefix: "icon" renders <np-icon> / <np-icon> */
  tag: string;
  /** Inputs that are set; false, null and undefined are left out. Numbers are bound in Angular */
  inputs: Record<string, string | number | false | null | undefined>;
  /** Inline styles, e.g. { color: '#f43f5e' } */
  style?: Record<string, string>;
}

export const kebab = (name: string) => name.replace(/[A-Z]/g, (c) => '-' + c.toLowerCase());
export const camel = (name: string) => name.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());

/** A NexPrime component as Angular markup or as its Web Component (React, Next.js, Vue, HTML) */
export function elementCode(framework: Framework, { tag, inputs, style = {} }: ElementCode) {
  const element = `np-${tag}`;
  const set = Object.entries(inputs).filter(
    (entry): entry is [string, string | number] => entry[1] !== false && entry[1] != null,
  );
  if (framework === 'angular') {
    const attrs = set.map(([k, v]) => (typeof v === 'number' ? `[${k}]="${v}"` : `${k}="${v}"`));
    return `<${element} ${[...attrs, ...cssAttribute(style)].join(' ')} />`;
  }
  const attrs = set.map(([k, v]) => `${kebab(k)}="${v}"`);
  if (framework === 'react' || framework === 'next') {
    return `<${element} ${[...attrs, jsxStyle(style)].filter(Boolean).join(' ')} />`;
  }
  // Custom elements can't self-close in HTML; Vue templates allow it
  const all = [...attrs, ...cssAttribute(style)].join(' ');
  return framework === 'vue' ? `<${element} ${all} />` : `<${element} ${all}></${element}>`;
}

/** Plain markup with classes (the np-anim-* animations): class="" vs. className and a style object in JSX */
export function markupCode(
  framework: Framework,
  className: string,
  style: Record<string, string> = {},
) {
  if (framework === 'react' || framework === 'next') {
    return `<div ${[`className="${className}"`, jsxStyle(style)].filter(Boolean).join(' ')}>…</div>`;
  }
  return `<div ${[`class="${className}"`, ...cssAttribute(style)].join(' ')}>…</div>`;
}

/** Setup lines shown under a framework's code; Angular has none */
export function setupCode(framework: Framework) {
  switch (framework) {
    case 'react':
    case 'html':
      return `<link rel="stylesheet" href="/nexprime/styles.css" />\n<script type="module" src="/nexprime/nexprime.js"></script>`;
    case 'next':
      return `<Script src="/nexprime/nexprime.js" type="module" crossOrigin="anonymous" strategy="afterInteractive" />`;
    case 'vue':
      return `vue({ template: { compilerOptions: { isCustomElement: (tag) => tag.startsWith('np-') } } })`;
    default:
      return '';
  }
}

function cssAttribute(style: Record<string, string>) {
  const css = Object.entries(style).map(([k, v]) => `${k}: ${v}`);
  return css.length ? [`style="${css.join('; ')}"`] : [];
}

/** style={{ … }} with camelCase keys ('' for no styles); custom properties stay quoted and need a cast */
export function jsxStyle(style: Record<string, string>) {
  const keys = Object.keys(style);
  if (!keys.length) return '';
  const entries = keys.map(
    (k) => `${k.startsWith('--') ? `'${k}'` : camel(k)}: '${style[k].replace(/'/g, "\\'")}'`,
  );
  const cast = keys.some((k) => k.startsWith('--')) ? ' as React.CSSProperties' : '';
  return `style={{ ${entries.join(', ')} }${cast}}`;
}
