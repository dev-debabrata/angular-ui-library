import { signal } from '@angular/core';

import type { ToggleOption } from '../components/form/button-toggle/button-toggle.component';

/** The npm package on jsDelivr, for plain HTML pages (no install) */
export const CDN = 'https://cdn.jsdelivr.net/npm/nexprime';

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

/** One-line setup note under the code (Getting Started ▸ Installation has the details) */
export function setupNote(framework: Framework, angularImport = '') {
  return {
    angular: angularImport
      ? `Add ${angularImport} (from 'nexprime') to your component’s imports.`
      : 'The classes come with nexprime/styles/theme.css.',
    react: 'npm install nexprime, then load the theme and the elements once (main.tsx).',
    next: 'npm install nexprime, then load the elements once from a client component.',
    vue: 'npm install nexprime, load it once in main.ts and mark np-* tags as custom elements.',
    html: 'No install: load the theme and nexprime.js from the CDN once.',
  }[framework];
}

export interface ElementCode {
  /** Name without a prefix: "icon" renders <np-icon> / <np-icon> */
  tag: string;
  /** Inputs that are set; false, null and undefined are left out, true is a bare attribute. Numbers are bound in Angular */
  inputs: Record<string, string | number | boolean | null | undefined>;
  /** Inline styles, e.g. { color: '#f43f5e' } */
  style?: Record<string, string>;
  /** CSS classes, e.g. the appearance classes 'np-color-success np-shape-rounded' (className in JSX) */
  classes?: string;
}

export const kebab = (name: string) => name.replace(/[A-Z]/g, (c) => '-' + c.toLowerCase());
export const camel = (name: string) => name.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());

/** A NexPrime component as Angular markup or as its Web Component (React, Next.js, Vue, HTML) */
export function elementCode(framework: Framework, { tag, inputs, style = {}, classes = '' }: ElementCode) {
  const element = `np-${tag}`;
  const jsx = framework === 'react' || framework === 'next';
  const classAttr = classes ? [`${jsx ? 'className' : 'class'}="${classes}"`] : [];
  const set = Object.entries(inputs).filter(
    (entry): entry is [string, string | number | true] => entry[1] !== false && entry[1] != null,
  );
  if (framework === 'angular') {
    const attrs = set.map(([k, v]) =>
      v === true ? k : typeof v === 'number' ? `[${k}]="${v}"` : `${k}="${v}"`,
    );
    return `<${[element, ...classAttr, ...attrs, ...cssAttribute(style)].join(' ')} />`;
  }
  const attrs = set.map(([k, v]) => (v === true ? kebab(k) : `${kebab(k)}="${v}"`));
  if (jsx) {
    return `<${[element, ...classAttr, ...attrs, jsxStyle(style)].filter(Boolean).join(' ')} />`;
  }
  // Custom elements can't self-close in HTML; Vue templates allow it
  const open = [element, ...classAttr, ...attrs, ...cssAttribute(style)].join(' ');
  return framework === 'vue' ? `<${open} />` : `<${open}></${element}>`;
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
      return `import 'nexprime/styles/theme.css';\nimport 'nexprime/elements';`;
    case 'next':
      return `import 'nexprime/styles/theme.css'; // app/layout.tsx\nimport { loadNexPrime } from 'nexprime/react'; // useEffect(() => { loadNexPrime(); }, [])`;
    case 'vue':
      return `import 'nexprime/styles/theme.css';\nimport 'nexprime/elements';\n// vite.config: vue({ template: { compilerOptions: { isCustomElement: (tag) => tag.startsWith('np-') } } })`;
    case 'html':
      return `<link rel="stylesheet" href="${CDN}/styles/theme.css" />\n<script type="module" src="${CDN}/elements/nexprime.js"></script>`;
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
