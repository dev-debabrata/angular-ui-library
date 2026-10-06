/**
 * React, Next.js, Vue and HTML versions of a story, for the "Show code" tabs on the docs pages (docs-page.ts).
 * Storybook writes the Angular snippet at build time; these are built in the browser from the story's component
 * (selector, inputs and outputs via reflectComponentType), its args, and its template when it has one.
 * NexPrime components become their Web Components (<np-select> → <np-select>): strings, numbers and booleans are
 * attributes, arrays/objects/functions are properties, outputs are DOM events (see Frameworks.mdx).
 */
import { reflectComponentType, type Type } from '@angular/core';

import { camel, jsxStyle, kebab, type Framework } from '../src/stories/utils/framework-code';

export type WebFramework = Exclude<Framework, 'angular'>;

interface Prop {
  name: string;
  /** value: an input or attribute; event: an output or DOM event */
  kind: 'value' | 'event';
  value?: unknown;
}

type Element = { type: 'element'; tag: string; props: Prop[]; children: Node[] };
type Node = { type: 'text'; text: string } | Element;

/** Thrown when a template uses Angular-only syntax; the snippet then shows the component with its args */
class AngularOnly extends Error {}

/** Components that are not Web Components (internal parts) */
const NOT_ELEMENTS = new Set(['np-menu-item']);
const VOID = new Set([
  'area',
  'br',
  'col',
  'embed',
  'hr',
  'img',
  'input',
  'link',
  'meta',
  'source',
  'track',
  'wbr',
]);
const isNp = (tag: string) => tag.startsWith('np-') && !NOT_ELEMENTS.has(tag);
const element = (tag: string): Element => ({ type: 'element', tag, props: [], children: [] });

export interface StoryLike {
  component?: unknown;
  initialArgs: Record<string, unknown>;
  argTypes?: Record<string, unknown>;
  parameters?: Record<string, unknown>;
  originalStoryFn?: (args: Record<string, unknown>, context: unknown) => unknown;
}

/** Code for each framework, or null when the story's component has no Web Component */
export function frameworkSnippets(story: StoryLike): Record<WebFramework, string> | null {
  const mirror = story.component ? reflectComponentType(story.component as Type<unknown>) : null;
  if (!mirror || !isNp(mirror.selector)) return null;

  let nodes: Node[] = [];
  let note = '';
  const rendered = renderStory(story);
  try {
    if (rendered?.template)
      nodes = parseTemplate(rendered.template, rendered.props ?? story.initialArgs);
  } catch (error) {
    if (!(error instanceof AngularOnly)) throw error;
    note = `Simplified: this story's template uses Angular-only syntax (${error.message}), so this shows the component with the story's args.`;
  }
  if (!nodes.length) nodes = [fromArgs(mirror, story.initialArgs)];

  const js = (code: string) => (note ? `// ${note}\n${code}` : code);
  const html = (code: string) => (note ? `<!-- ${note} -->\n${code}` : code);
  return {
    react: js(toReact(nodes, false)),
    next: js(toReact(nodes, true)),
    vue: html(toVue(nodes)),
    html: html(toHtml(nodes)),
  };
}

function renderStory(story: StoryLike) {
  try {
    const context = {
      args: story.initialArgs,
      argTypes: story.argTypes ?? {},
      parameters: story.parameters ?? {},
      globals: {},
    };
    return story.originalStoryFn?.(story.initialArgs, context) as {
      template?: string;
      props?: Record<string, unknown>;
    };
  } catch {
    return undefined;
  }
}

/** The story's component with its args (stories without a template, and the Angular-only fallback) */
function fromArgs(
  mirror: ReturnType<typeof reflectComponentType> & {},
  args: Record<string, unknown>,
): Node {
  const node = element(mirror.selector);
  for (const { propName, templateName } of mirror.inputs) {
    if (args[propName] !== undefined)
      node.props.push({ name: templateName, kind: 'value', value: args[propName] });
  }
  // model() outputs: the class property is `value`, the output (and the story arg) is `valueChange`
  for (const { propName, templateName } of mirror.outputs) {
    if (typeof (args[templateName] ?? args[propName]) === 'function')
      node.props.push({ name: templateName, kind: 'event' });
  }
  return node;
}

// ---------------------------------------------------------------------------------------------------------------
// Angular template → nodes. A small case-preserving parser (the DOM parser would lowercase [submitLabel])
// ---------------------------------------------------------------------------------------------------------------

/** One attribute, or the end of the tag (`>` / `/>`), from the current position */
const ATTRIBUTE = /\s*(?:(\/?>)|([^\s=/>]+)(?:\s*=\s*("[^"]*"|'[^']*'|[^\s>]+))?)/y;

function parseTemplate(source: string, scope: Record<string, unknown>): Node[] {
  const root = element('#root');
  const stack = [root];
  let i = 0;
  while (i < source.length) {
    const top = stack[stack.length - 1];
    if (source.startsWith('<!--', i)) {
      const end = source.indexOf('-->', i);
      i = end < 0 ? source.length : end + 3;
    } else if (source.startsWith('</', i)) {
      const end = source.indexOf('>', i);
      const index = stack.map((n) => n.tag).lastIndexOf(source.slice(i + 2, end).trim());
      if (index > 0) stack.length = index;
      i = end + 1;
    } else if (/^<[a-zA-Z]/.test(source.slice(i, i + 2))) {
      const tag = /^[\w:-]+/.exec(source.slice(i + 1))![0];
      if (tag.startsWith('ng-')) throw new AngularOnly(`<${tag}>`);
      const node = element(tag);
      const attributes = new Attributes(node, scope);
      ATTRIBUTE.lastIndex = i + 1 + tag.length;
      let match: RegExpExecArray | null;
      while ((match = ATTRIBUTE.exec(source)) && !match[1]) {
        const raw = match[3];
        attributes.add(match[2], raw && /^["']/.test(raw) ? raw.slice(1, -1) : (raw ?? null));
      }
      attributes.finish();
      top.children.push(node);
      if (match?.[1] === '>' && !VOID.has(tag)) stack.push(node);
      i = match ? ATTRIBUTE.lastIndex : source.length;
    } else {
      const next = source.indexOf('<', i);
      const end = next < 0 ? source.length : next;
      const text = interpolate(source.slice(i, end).replace(/\s+/g, ' '), scope).trim();
      if (text) top.children.push({ type: 'text', text });
      i = end;
    }
  }
  return root.children;
}

/** Turns Angular attributes and bindings into props; style and class bindings are merged into one each */
class Attributes {
  private styles: string[] = [];
  private classes: string[] = [];

  constructor(
    private node: Element,
    private scope: Record<string, unknown>,
  ) {}

  add(name: string, value: string | null) {
    const { node, scope } = this;
    if (/^(#|\*|@|\[@)/.test(name)) throw new AngularOnly(name);
    if (name.startsWith('[(')) {
      const prop = name.slice(2, -2);
      node.props.push({ name: prop, kind: 'value', value: evaluate(value ?? '', scope) });
      node.props.push({ name: prop + 'Change', kind: 'event' });
    } else if (name.startsWith('[')) {
      const binding = name.slice(1, -1);
      if (binding === 'style' || binding === 'class') throw new AngularOnly(name);
      const [prefix, rest] = binding.split(/\.(.*)/s);
      const result = evaluate(value ?? '', scope);
      if (prefix === 'style' && rest) this.styles.push(`${rest}: ${result}`);
      else if (prefix === 'class' && rest) result && this.classes.push(rest);
      else if (prefix === 'attr' && rest)
        result != null &&
          result !== false &&
          node.props.push({ name: rest, kind: 'value', value: String(result) });
      else node.props.push({ name: binding, kind: 'value', value: result });
    } else if (name.startsWith('(')) {
      const handler = (value ?? '').trim();
      const call = /^(\w+)\((\$event)?\)$/.exec(handler);
      if (!call || typeof scope[call[1]] !== 'function')
        throw new AngularOnly(`${name}="${handler}"`);
      node.props.push({ name: name.slice(1, -1), kind: 'event' });
    } else if (name === 'style') value && this.styles.push(value.replace(/;\s*$/, ''));
    else if (name === 'class') value && this.classes.push(value);
    else node.props.push({ name, kind: 'value', value: value ?? '' });
  }

  finish() {
    if (this.classes.length)
      this.node.props.push({ name: 'class', kind: 'value', value: this.classes.join(' ') });
    if (this.styles.length)
      this.node.props.push({ name: 'style', kind: 'value', value: this.styles.join('; ') });
  }
}

function interpolate(text: string, scope: Record<string, unknown>) {
  if (/@(for|if|switch|defer|let)\b|^\s*}\s*$|}\s*@else/.test(text))
    throw new AngularOnly('@ control flow');
  return text.replace(/{{(.*?)}}/g, (_, expr: string) => String(evaluate(expr, scope) ?? ''));
}

/** Evaluates a binding against the story's props; pipes and unknown names are Angular-only */
function evaluate(expr: string, scope: Record<string, unknown>): unknown {
  if (/[^|]\|[^|]/.test(expr)) throw new AngularOnly('pipe');
  const names = Object.keys(scope).filter((k) => /^[A-Za-z_$][\w$]*$/.test(k));
  try {
    return new Function(...names, `return (${expr});`)(...names.map((k) => scope[k]));
  } catch {
    throw new AngularOnly(`[…]="${expr.trim()}"`);
  }
}

// ---------------------------------------------------------------------------------------------------------------
// Shared printing
// ---------------------------------------------------------------------------------------------------------------

/** A value as JavaScript source; long arrays and objects go on several lines */
function js(value: unknown, indent = ''): string {
  if (value == null || typeof value === 'number' || typeof value === 'boolean')
    return String(value);
  if (typeof value === 'string')
    return `'${value.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n')}'`;
  if (typeof value === 'function') return 'mock' in value ? '() => {}' : String(value);
  if (value instanceof Date) return `new Date('${value.toISOString()}')`;
  const inner = indent + '  ';
  const [open, close, items] = Array.isArray(value)
    ? ['[', ']', value.map((v) => js(v, inner))]
    : [
        '{ ',
        ' }',
        Object.entries(value)
          .filter(([, v]) => v !== undefined)
          .map(([k, v]) => `${/^[A-Za-z_$][\w$]*$/.test(k) ? k : `'${k}'`}: ${js(v, inner)}`),
      ];
  if (!items.length) return open.trim() + close.trim();
  const flat = open + items.join(', ') + close;
  return flat.length <= 72 && !flat.includes('\n')
    ? flat
    : `${open.trim()}\n${items.map((v) => inner + v).join(',\n')},\n${indent}${close.trim()}`;
}

type Kind = 'event' | 'attribute' | 'property';

/** How a prop is written: strings, numbers and true are attributes, other values on NexPrime elements are
 *  properties; false and null are left out */
function kindOf(p: Prop, custom: boolean): Kind | undefined {
  if (p.kind === 'event') return 'event';
  if (p.value === false || p.value == null) return undefined;
  const attribute = typeof p.value === 'string' || typeof p.value === 'number' || p.value === true;
  return custom && !attribute ? 'property' : 'attribute';
}

/** Attributes and properties first, then events */
const ordered = (props: Prop[]) => [
  ...props.filter((p) => p.kind === 'value'),
  ...props.filter((p) => p.kind === 'event'),
];

const attr = (name: string, value: unknown) =>
  value === true || value === '' ? name : `${name}="${String(value).replace(/"/g, '&quot;')}"`;

/** Names for hoisted constants and ids (options, options2, …) */
function namer() {
  const used = new Map<string, number>();
  return (base: string) => {
    const name = camel(base.replace(/^np-/, '').replace(/[^\w-]/g, ''));
    const n = (used.get(name) ?? 0) + 1;
    used.set(name, n);
    return n === 1 ? name : `${name}${n}`;
  };
}

/** The opening tag on one line, or one attribute per line when long */
function lines(open: string, attrs: string[], indent: string, close: string) {
  const flat = `${indent}${open}${attrs.length ? ' ' + attrs.join(' ') : ''}${close}`;
  if (flat.length <= 100) return flat;
  return `${indent}${open}\n${attrs.map((a) => indent + '  ' + a).join('\n')}\n${indent}${close.trim()}`;
}

/** An element with its children; `selfClose` for JSX and Vue, a closing tag in HTML */
function print(
  open: string,
  attrs: string[],
  children: string[],
  indent: string,
  closeTag: string,
  selfClose: boolean,
) {
  if (children.length)
    return `${lines(open, attrs, indent, '>')}\n${children.join('\n')}\n${indent}</${closeTag}>`;
  if (selfClose) return lines(open, attrs, indent, ' />');
  return lines(open, attrs, indent, '>') + (VOID.has(closeTag) ? '' : `</${closeTag}>`);
}

/** Renders a node tree; `children()` renders the children one level deeper when the element needs them */
function walk(
  node: Node,
  indent: string,
  text: (text: string) => string,
  render: (node: Element, indent: string, children: () => string[]) => string,
): string {
  if (node.type === 'text') return indent + text(node.text);
  return render(node, indent, () => node.children.map((c) => walk(c, indent + '  ', text, render)));
}

const cssToObject = (css: string) =>
  Object.fromEntries(
    css
      .split(';')
      .map((part) => part.split(/:(.*)/s).map((s) => s.trim()))
      .filter(([k, v]) => k && v),
  ) as Record<string, string>;

// ---------------------------------------------------------------------------------------------------------------
// React and Next.js (Next.js passes properties and events through the NexPrime wrapper, Frameworks.mdx)
// ---------------------------------------------------------------------------------------------------------------

const JSX_NAMES: Record<string, string> = {
  class: 'className',
  for: 'htmlFor',
  tabindex: 'tabIndex',
  readonly: 'readOnly',
};

function toReact(nodes: Node[], next: boolean) {
  const hoisted: string[] = [];
  const name = namer();
  let client = false;

  const render = (node: Element, indent: string, children: () => string[]) => {
    const custom = isNp(node.tag);
    const tag = node.tag;
    const attrs: string[] = [];
    const props: string[] = [];
    const events: string[] = [];
    for (const p of ordered(node.props)) {
      const kind = kindOf(p, custom);
      if (kind === 'event') {
        const handler = `(e${next ? ': CustomEvent' : ''}) => console.log('${p.name}', e.detail)`;
        if (!custom)
          attrs.push(
            `on${p.name[0].toUpperCase()}${p.name.slice(1)}={() => console.log('${p.name}')}`,
          );
        else if (next) events.push(`${p.name}: ${handler}`);
        else attrs.push(`on${p.name}={${handler}}`);
      } else if (p.name === 'style' && typeof p.value === 'string')
        attrs.push(jsxStyle(cssToObject(p.value)));
      else if (kind === 'property') {
        const constName = name(p.name);
        hoisted.push(`const ${constName} = ${js(p.value)};`);
        if (next) props.push(constName === p.name ? p.name : `${p.name}: ${constName}`);
        else attrs.push(`${p.name}={${constName}}`);
      } else if (kind === 'attribute') {
        // A bare attribute on a plain element (content slots: formBeforeActions) would be `={true}`, which
        // React drops; write it as an empty string, lowercase like the DOM stores it
        if (!custom && p.value === '') attrs.push(`${p.name.toLowerCase()}=""`);
        else if (custom)
          attrs.push(attr(p.name === 'class' ? 'className' : kebab(p.name), p.value));
        else {
          const attrName =
            JSX_NAMES[p.name] ?? (/^(aria|data)-/.test(p.name) ? p.name : camel(p.name));
          attrs.push(
            typeof p.value === 'number' ? `${attrName}={${p.value}}` : attr(attrName, p.value),
          );
        }
      }
    }
    if (!next || !custom || !(props.length || events.length))
      return print('<' + tag, attrs, children(), indent, tag, true);
    const base = name(tag);
    if (props.length) hoisted.push(`const ${base}Props = ${objectLiteral(props)};`);
    if (events.length) hoisted.push(`const ${base}Events = ${objectLiteral(events)};`);
    client ||= events.length > 0;
    const wrapper = [
      `tag="${tag}"`,
      ...attrs,
      ...(props.length ? [`props={${base}Props}`] : []),
      ...(events.length ? [`on={${base}Events}`] : []),
    ];
    return print('<NexPrime', wrapper, children(), indent, 'NexPrime', true);
  };

  const body = nodes
    .map((n) => walk(n, '    ', (t) => t.replace(/[{}]/g, (c) => `{'${c}'}`), render))
    .join('\n');
  const jsx = nodes.length > 1 ? `    <>\n${body.replace(/^/gm, '  ')}\n    </>` : body;
  // Outside the component, so the values stay the same object on every render
  const top = hoisted.length ? hoisted.join('\n\n') + '\n\n' : '';
  const head = next
    ? `${client ? "'use client';\n\n" : ''}import { NexPrime } from '@/components/nexprime';\n\n`
    : '';
  return `${head}${top}export function Example() {\n  return (\n${jsx}\n  );\n}`;
}

/** `{ a, b }` on one line, or one entry per line when long */
function objectLiteral(entries: string[]) {
  const flat = `{ ${entries.join(', ')} }`;
  return flat.length <= 80 ? flat : `{\n${entries.map((e) => '  ' + e).join(',\n')},\n}`;
}

// ---------------------------------------------------------------------------------------------------------------
// Vue and plain HTML
// ---------------------------------------------------------------------------------------------------------------

function toVue(nodes: Node[]) {
  const hoisted: string[] = [];
  const name = namer();
  const render = (node: Element, indent: string, children: () => string[]) => {
    const custom = isNp(node.tag);
    const attrs = ordered(node.props).flatMap((p) => {
      const kind = kindOf(p, custom);
      if (kind === 'event')
        return [
          `@${custom ? kebab(p.name) : p.name}="(e) => console.log('${p.name}', e${custom ? '.detail' : ''})"`,
        ];
      if (kind === 'property') {
        const constName = name(p.name);
        hoisted.push(`const ${constName} = ${js(p.value)};`);
        return [`:${kebab(p.name)}="${constName}"`];
      }
      return kind ? [attr(custom ? kebab(p.name) : p.name, p.value)] : [];
    });
    return print('<' + node.tag, attrs, children(), indent, node.tag, true);
  };
  const template = nodes.map((n) => walk(n, '  ', (t) => t, render)).join('\n');
  const script = hoisted.length ? `<script setup>\n${hoisted.join('\n\n')}\n</script>\n\n` : '';
  return `${script}<template>\n${template}\n</template>`;
}

function toHtml(nodes: Node[]) {
  const script: string[] = [];
  const name = namer();
  const render = (node: Element, indent: string, children: () => string[]) => {
    const custom = isNp(node.tag);
    const tag = node.tag;
    const attrs: string[] = [];
    const setup: string[] = [];
    for (const p of ordered(node.props)) {
      const kind = kindOf(p, custom);
      if (kind === 'event')
        setup.push(
          `addEventListener('${p.name}', (e) => console.log('${p.name}', e${custom ? '.detail' : ''}));`,
        );
      else if (kind === 'property') setup.push(`${p.name} = ${js(p.value)};`);
      else if (kind) attrs.push(attr(custom ? kebab(p.name) : p.name, p.value));
    }
    if (setup.length) {
      const id = name(tag);
      attrs.unshift(`id="${id}"`);
      script.push(
        `const ${id} = document.getElementById('${id}');\n` +
          setup.map((s) => `${id}.${s}`).join('\n'),
      );
    }
    return print('<' + tag, attrs, children(), indent, tag, false);
  };
  const markup = nodes.map((n) => walk(n, '', (t) => t, render)).join('\n');
  return script.length
    ? `${markup}\n\n<script>\n${script.join('\n\n').replace(/^/gm, '  ')}\n</script>`
    : markup;
}
