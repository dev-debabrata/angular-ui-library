/**
 * React, Next.js, Vue and HTML versions of a story, for the "Show code" tabs on the docs pages (docs-page.ts).
 * Storybook writes the Angular snippet at build time; these are built in the browser from the story's component
 * (selector, inputs and outputs via reflectComponentType), its args, and its template when it has one.
 * NexPrime components become their Web Components (<np-select> → <np-select>): strings, numbers and booleans are
 * attributes, arrays/objects/functions are properties, outputs are DOM events (see Getting Started ▸ Installation).
 */
import { reflectComponentType, type Type } from '@angular/core';

import { camel, jsxStyle, kebab, toPascal, type Framework } from '../src/stories/utils/framework-code';

export type WebFramework = Exclude<Framework, 'angular'>;

interface Prop {
  name: string;
  /** value: an input or attribute; event: an output or DOM event */
  kind: 'value' | 'event';
  value?: unknown;
  /** An event handler that calls a method of a referenced element: (clicked)="menu.toggle($event)" */
  call?: { ref: string; method: string; event: boolean };
  /** The id that stands in for an Angular template reference (#menu): ref="menu" in Vue */
  ref?: boolean;
  /** For bindings: the story variable it reads ([(visible)]="visible" → visible) */
  bound?: string;
  /** (clicked)="visible = true": set properties on the element bound to those variables */
  assign?: { vars: Record<string, unknown>; ref?: string; values?: Record<string, unknown> };
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
  templateRefs = new Set([...source.matchAll(/\s#(\w+)/g)].map((m) => m[1]));
  const root = element('#root');
  parseInto(root, source, { ...scope });
  const nodes = flatten(root.children);
  resolveAssignments(nodes);
  return nodes;
}

/** (clicked)="visible = true" → set `visible` on the element bound to that variable ([(visible)]="visible") */
function resolveAssignments(nodes: Node[]) {
  const elements: Element[] = [];
  const collect = (list: Node[]) =>
    list.forEach((n) => n.type === 'element' && (elements.push(n), collect(n.children)));
  collect(nodes);
  const ids = namer();
  for (const el of elements) {
    for (const event of el.props.filter((p) => p.assign)) {
      const values: Record<string, unknown> = {};
      let target!: Element;
      for (const [variable, value] of Object.entries(event.assign!.vars)) {
        const owner = elements.find((e) =>
          e.props.some((p) => p.kind === 'value' && p.bound === variable),
        );
        if (!owner || (target && owner !== target)) throw new AngularOnly(`(${event.name})`);
        target = owner;
        values[owner.props.find((p) => p.bound === variable)!.name] = value;
      }
      let id = target.props.find((p) => p.name === 'id')?.value as string | undefined;
      if (!id) {
        id = ids(target.tag);
        target.props.unshift({ name: 'id', kind: 'value', value: id, ref: true });
      }
      event.assign = { ...event.assign!, ref: id, values };
    }
  }
}

/** <ng-container> leaves only its children */
function flatten(nodes: Node[]): Node[] {
  return nodes.flatMap((n) => {
    if (n.type === 'text') return [n];
    n.children = flatten(n.children);
    return n.tag === '#fragment' ? n.children : [n];
  });
}

/** Parses `source` into `parent`; control flow blocks are expanded with the story's values */
function parseInto(parent: Element, source: string, scope: Record<string, unknown>) {
  const stack = [parent];
  let i = 0;
  while (i < source.length) {
    const top = stack[stack.length - 1];
    if (source.startsWith('<!--', i)) {
      const end = source.indexOf('-->', i);
      i = end < 0 ? source.length : end + 3;
    } else if (source.startsWith('</', i)) {
      const end = source.indexOf('>', i);
      const name = source.slice(i + 2, end).trim();
      const index = stack
        .map((n) => n.tag)
        .lastIndexOf(name === 'ng-container' ? '#fragment' : name);
      if (index > 0) stack.length = index;
      i = end + 1;
    } else if (/^<[a-zA-Z]/.test(source.slice(i, i + 2))) {
      const tag = /^[\w:-]+/.exec(source.slice(i + 1))![0];
      if (tag === 'ng-template') {
        i = slidesFromTemplate(top, source, i, scope);
        continue;
      }
      if (tag.startsWith('ng-') && tag !== 'ng-container') throw new AngularOnly(`<${tag}>`);
      const node = element(tag === 'ng-container' ? '#fragment' : tag);
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
      const nextTag = source.indexOf('<', i);
      const segment = source.slice(i, nextTag < 0 ? source.length : nextTag);
      const control = /@(for|if|switch|let)\b/.exec(segment);
      const end = i + (control ? control.index : segment.length);
      const text = interpolate(source.slice(i, end).replace(/\s+/g, ' '), scope).trim();
      if (text) top.children.push({ type: 'text', text });
      i = control ? controlFlow(top, source, end, scope) : end;
    }
  }
}

/** The index of the bracket that closes the one at `open` */
function closing(source: string, open: number) {
  const [a, b] = source[open] === '(' ? ['(', ')'] : ['{', '}'];
  let depth = 0;
  for (let i = open; i < source.length; i++) {
    if (source[i] === a) depth++;
    else if (source[i] === b && --depth === 0) return i;
  }
  throw new AngularOnly(`unbalanced ${a}`);
}

/** `( header ) { body }` from `at` (the keyword's end): the header, the body and the index after it */
function block(source: string, at: number) {
  const open = source.indexOf('(', at);
  const brace = source.indexOf('{', at);
  const hasHeader = open >= 0 && open < brace;
  const headerEnd = hasHeader ? closing(source, open) : at - 1;
  const bodyOpen = source.indexOf('{', headerEnd + 1);
  const bodyClose = closing(source, bodyOpen);
  return {
    header: hasHeader ? source.slice(open + 1, headerEnd).trim() : '',
    body: source.slice(bodyOpen + 1, bodyClose),
    end: bodyClose + 1,
  };
}

/** Expands @let, @if/@else, @for/@empty and @switch at `at`; returns the index after the whole block */
function controlFlow(
  parent: Element,
  source: string,
  at: number,
  scope: Record<string, unknown>,
): number {
  const keyword = /^@(\w+)/.exec(source.slice(at))![1];
  if (keyword === 'let') {
    const m = /^@let\s+(\w+)\s*=\s*([^;]+);/.exec(source.slice(at));
    if (!m) throw new AngularOnly('@let');
    scope[m[1]] = evaluate(m[2], scope);
    return at + m[0].length;
  }
  if (keyword === 'if') {
    // @if (…) {…} @else if (…) {…} @else {…}: the first branch whose condition holds
    let next = at + 3;
    let isElse = false;
    let done = false;
    for (;;) {
      const { header, body, end } = block(source, next);
      if (!done) {
        const [condition, alias] = header.split(/;\s*as\s+/);
        const value = isElse || evaluate(condition, scope);
        if (value) {
          done = true;
          parseInto(parent, body, alias ? { ...scope, [alias.trim()]: value } : { ...scope });
        }
      }
      const elseMatch = /^\s*@else(\s+if)?\b/.exec(source.slice(end));
      if (!elseMatch) return end;
      isElse = !elseMatch[1];
      next = end + elseMatch[0].length;
    }
  }
  if (keyword === 'for') {
    const { header, body, end } = block(source, at + 4);
    const [loop, ...options] = header.split(';').map((p) => p.trim());
    const m = /^(\w+)\s+of\s+([\s\S]+)$/.exec(loop);
    if (!m) throw new AngularOnly('@for');
    const items = [...((evaluate(m[2], scope) as Iterable<unknown>) ?? [])];
    const aliases = options
      .filter((o) => o.startsWith('let '))
      .flatMap((o) => o.slice(4).split(','))
      .map((a) => a.split('=').map((x) => x.trim()));
    items.forEach((item, index) => {
      const context: Record<string, unknown> = {
        $index: index,
        $first: index === 0,
        $last: index === items.length - 1,
        $even: index % 2 === 0,
        $odd: index % 2 === 1,
        $count: items.length,
      };
      const local = { ...scope, ...context, [m[1]]: item };
      for (const [name, value] of aliases) local[name] = context[value];
      parseInto(parent, body, local);
    });
    const empty = /^\s*@empty\s*\{/.exec(source.slice(end));
    if (!empty) return end;
    const emptyBlock = block(source, end + empty[0].length - 1);
    if (!items.length) parseInto(parent, emptyBlock.body, { ...scope });
    return emptyBlock.end;
  }
  // @switch: the first @case that matches, else @default
  const { header, body, end } = block(source, at + 7);
  const value = evaluate(header, scope);
  const cases = /@(case|default)\b/g;
  let chosen: string | undefined;
  let fallback: string | undefined;
  let c: RegExpExecArray | null;
  while ((c = cases.exec(body))) {
    const part = block(body, c.index + c[0].length);
    if (c[1] === 'default') fallback = part.body;
    else if (chosen === undefined && evaluate(part.header, scope) === value) chosen = part.body;
    cases.lastIndex = part.end;
  }
  const picked = chosen ?? fallback;
  if (picked) parseInto(parent, picked, { ...scope });
  return end;
}

/** Web Components that take their child elements instead of an <ng-template> (Carousel slides), and the prop the
 *  template repeats over */
const TEMPLATE_CHILDREN: Record<string, string> = { 'np-carousel': 'items' };

/** <ng-template let-item> in one of those: one child per item */
function slidesFromTemplate(
  top: Element,
  source: string,
  at: number,
  scope: Record<string, unknown>,
) {
  const items = top.props.find((p) => p.name === TEMPLATE_CHILDREN[top.tag]);
  const close = source.indexOf('</ng-template>', at);
  const open = source.indexOf('>', at);
  if (!items || close < 0) throw new AngularOnly('<ng-template>');
  // let-item (the item) and let-i="index"
  const lets = [...source.slice(at, open).matchAll(/let-(\w+)(?:="(\w+)")?/g)];
  const body = source.slice(open + 1, close);
  top.props = top.props.filter((p) => p !== items);
  (items.value as unknown[]).forEach((item, index) => {
    const local: Record<string, unknown> = { ...scope };
    for (const [, name, from] of lets) local[name] = from === 'index' ? index : item;
    parseInto(top, body, local);
  });
  return close + '</ng-template>'.length;
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
    if (name.startsWith('#')) {
      // A template reference becomes an id (ref in Vue), for handlers that call its methods
      node.props.push({ name: 'id', kind: 'value', value: name.slice(1), ref: true });
      return;
    }
    if (/^(\*|@|\[@)/.test(name)) throw new AngularOnly(name);
    if (name.startsWith('[(')) {
      const prop = name.slice(2, -2);
      node.props.push({
        name: prop,
        kind: 'value',
        value: evaluate(value ?? '', scope),
        bound: (value ?? '').trim(),
      });
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
      else
        node.props.push({
          name: binding,
          kind: 'value',
          value: result,
          bound: (value ?? '').trim(),
        });
    } else if (name.startsWith('(')) {
      // `visible = $event` on the element's own change event is hand-written two-way binding: the Web Component
      // keeps that state itself, so only the rest of the handler (a logging call) matters
      const event = name.slice(1, -1);
      const own = event.endsWith('Change') ? `${event.slice(0, -6)} = $event` : '';
      const statements = (value ?? '')
        .split(';')
        .map((st) => st.trim().replace(/\s*=\s*/, ' = '))
        .filter((st) => st && st !== own);
      if (!statements.length) return;
      const handler = statements.join('; ');
      const call = /^(\w+)\((\$event)?\)$/.exec(handler);
      const method = /^(\w+)\.(\w+)\((\$event)?\)$/.exec(handler);
      const assignments = statements.map((st) => /^(\w+) = ([^=][\s\S]*)$/.exec(st));
      if (assignments.every(Boolean))
        node.props.push({
          name: event,
          kind: 'event',
          assign: {
            vars: Object.fromEntries(assignments.map((m) => [m![1], evaluate(m![2], scope)])),
          },
        });
      else if (method && scope[method[1]] === undefined)
        node.props.push({
          name: event,
          kind: 'event',
          call: { ref: method[1], method: method[2], event: !!method[3] },
        });
      else if (call && typeof scope[call[1]] === 'function')
        node.props.push({ name: event, kind: 'event' });
      else throw new AngularOnly(`${name}="${handler}"`);
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
  // A template reference passed as a value ([target]="box") has no Web Component equivalent here
  if (templateRefs.has(expr.trim())) throw new AngularOnly(`[…]="${expr.trim()}"`);
  const names = Object.keys(scope).filter((k) => /^[A-Za-z_$][\w$]*$/.test(k));
  try {
    const key = `${names.join(',')}|${expr}`;
    let compiled = compiledExpressions.get(key);
    if (!compiled) compiledExpressions.set(key, (compiled = new Function(...names, `return (${expr});`) as (...values: unknown[]) => unknown));
    const result = compiled(...names.map((k) => scope[k]));
    return isSignal(result) ? result() : result;
  } catch (error) {
    // A name the story doesn't set ([closable]="closable" without the arg) is left out
    if (error instanceof ReferenceError) return undefined;
    throw new AngularOnly(`[…]="${expr.trim()}"`);
  }
}

/** Compiled bindings by scope names and expression: @for bodies evaluate the same ones once per item */
const compiledExpressions = new Map<string, (...values: unknown[]) => unknown>();

/** Template reference names (#menu) of the template being parsed */
let templateRefs = new Set<string>();

// ---------------------------------------------------------------------------------------------------------------
// Shared printing
// ---------------------------------------------------------------------------------------------------------------

/** Angular signals hold the story's state (Chat messages): their current value */
const isSignal = (value: unknown): value is (() => unknown) & { set: unknown } =>
  typeof value === 'function' && typeof (value as { set?: unknown }).set === 'function';

/** A value as JavaScript source; long arrays and objects go on several lines */
function js(value: unknown, indent = ''): string {
  if (isSignal(value)) return js(value(), indent);
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
  if (flat.length <= 72 && !flat.includes('\n')) return flat;
  // Numbers and short strings are packed onto lines (a chart's data), not one per line
  if (Array.isArray(value) && value.every((v) => typeof v === 'number' || typeof v === 'string')) {
    const rows: string[] = [];
    for (const item of items) {
      const last = rows.length - 1;
      if (last >= 0 && inner.length + rows[last].length + item.length + 2 <= 96)
        rows[last] += ', ' + item;
      else rows.push(item);
    }
    return `[\n${rows.map((r) => inner + r).join(',\n')},\n${indent}]`;
  }
  return `${open.trim()}\n${items.map((v) => inner + v).join(',\n')},\n${indent}${close.trim()}`;
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

/** What a handler does besides logging: call a referenced element's method ((clicked)="menu.toggle($event)") or set
 *  properties on the element bound to the variables it assigns ((clicked)="visible = true") */
function action(p: Prop, element: (ref: string) => string, event: string): string | undefined {
  if (p.call) return `${element(p.call.ref)}.${p.call.method}(${p.call.event ? event : ''})`;
  if (p.assign?.ref) return `Object.assign(${element(p.assign.ref)}, ${js(p.assign.values)})`;
  return undefined;
}

/** clicked → onClicked: React's prop for a DOM event, and the Angular example's method name */
const onName = (name: string) => `on${name[0].toUpperCase()}${name.slice(1)}`;

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
// React and Next.js (Next.js passes properties and events through the NexPrime wrapper from nexprime/react)
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
  const usedComponents = new Set<string>();

  const render = (node: Element, indent: string, children: () => string[]) => {
    const custom = isNp(node.tag);
    const iconName =
      custom && node.tag === 'np-icon' && node.props.find((p) => p.name === 'name')?.value;
    const isIcon = typeof iconName === 'string';
    const tag = isIcon
      ? toPascal(iconName).replace(/^(\d)/, 'Icon$1')
      : custom
        ? toPascal(node.tag)
        : node.tag;
    if (custom) usedComponents.add(tag);

    const attrs: string[] = [];
    for (const p of ordered(node.props)) {
      if (isIcon && p.name === 'name') continue;
      const kind = kindOf(p, custom);
      if (kind === 'event') {
        const handler = `(e${next ? ': CustomEvent' : ''}) => console.log('${p.name}', e.detail)`;
        const call = action(
          p,
          (ref) =>
            next
              ? `(document.getElementById('${ref}') as any)`
              : `document.getElementById('${ref}')`,
          custom ? 'e.detail' : 'e.nativeEvent',
        );
        if (!custom) {
          client ||= next;
          attrs.push(
            `${onName(p.name)}={${call ? `(e) => ${call}` : `() => console.log('${p.name}')`}}`,
          );
        } else {
          client ||= next;
          attrs.push(`on${p.name}={${call ? `(e) => ${call}` : handler}}`);
        }
      } else if (p.name === 'style' && typeof p.value === 'string')
        attrs.push(jsxStyle(cssToObject(p.value)));
      else if (kind === 'property') {
        const constName = name(p.name);
        hoisted.push(`const ${constName} = ${js(p.value)};`);
        attrs.push(`${p.name}={${constName}}`);
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
    return print('<' + tag, attrs, children(), indent, tag, true);
  };

  const body = nodes
    .map((n) => walk(n, '    ', (t) => t.replace(/[{}]/g, (c) => `{'${c}'}`), render))
    .join('\n');
  const jsx = nodes.length > 1 ? `    <>\n${body.replace(/^/gm, '  ')}\n    </>` : body;
  // Outside the component, so the values stay the same object on every render
  const top = hoisted.length ? hoisted.join('\n\n') + '\n\n' : '';
  const imports = usedComponents.size
    ? `import { ${[...usedComponents].sort().join(', ')} } from 'nexprime/react';\n\n`
    : '';
  const head = next
    ? `${client ? "'use client';\n\n" : ''}${imports}`
    : imports;
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
      const event = `e${custom ? '.detail' : ''}`;
      const call = action(p, (ref) => `$refs.${ref}`, event);
      if (kind === 'event')
        return [
          `@${custom ? kebab(p.name) : p.name}="(e) => ${call ?? `console.log('${p.name}', ${event})`}"`,
        ];
      // A template reference (#menu) is a Vue ref
      if (p.ref) return [`ref="${p.value}"`];
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
      const event = `e${custom ? '.detail' : ''}`;
      const call = action(p, (ref) => `document.getElementById('${ref}')`, event);
      if (kind === 'event')
        setup.push(
          `addEventListener('${p.name}', (e) => ${call ?? `console.log('${p.name}', ${event})`});`,
        );
      else if (kind === 'property') setup.push(`${p.name} = ${js(p.value)};`);
      else if (kind) attrs.push(attr(custom ? kebab(p.name) : p.name, p.value));
    }
    if (setup.length) {
      // Reuse the id a template reference already gave it
      const existing = node.props.find((p) => p.name === 'id')?.value as string | undefined;
      const id = existing ? camel(existing) : name(tag);
      if (!existing) attrs.unshift(`id="${id}"`);
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

// ---------------------------------------------------------------------------------------------------------------
// Angular: a standalone component that imports from 'nexprime'. Stories with a template show it as written (all
// Angular syntax works there), with the values it uses as class fields; the others show the component with its args
// ---------------------------------------------------------------------------------------------------------------

/** np-button-toggle → ButtonToggleComponent (the library's naming); story-only *-demo helpers aren't exported */
const className = (tag: string) => {
  const name = camel(tag.replace(/^np-/, ''));
  return name[0].toUpperCase() + name.slice(1) + 'Component';
};

/** The template without its common indentation and surrounding blank lines */
function dedent(source: string) {
  const lines = source.replace(/^\s*\n|\n\s*$/g, '').split('\n');
  const indent = Math.min(...lines.filter((l) => l.trim()).map((l) => /^ */.exec(l)![0].length));
  return lines.map((l) => l.slice(indent)).join('\n');
}

/** Everything in the template that's an expression: bindings, events, interpolations and @-block headers */
function expressions(template: string) {
  const parts: string[] = [];
  for (const m of template.matchAll(/[[(*][\w.\-()[\]]*\s*=\s*"([^"]*)"/g)) parts.push(m[1]);
  for (const m of template.matchAll(/{{([\s\S]*?)}}/g)) parts.push(m[1]);
  for (const m of template.matchAll(/@\w+\s*\(([^)]*)\)/g)) parts.push(m[1]);
  return parts.join('\n');
}

export function angularSnippet(story: StoryLike): string | null {
  const mirror = story.component ? reflectComponentType(story.component as Type<unknown>) : null;
  if (!mirror) return null;
  const rendered = renderStory(story);
  const members: string[] = [];
  let template: string;
  let usesSignal = false;
  // Story-only *-demo wrappers aren't in the library: show the component itself with the args instead
  const demoOnly =
    !!rendered?.template && !/<np-[\w-]+/.test(rendered.template.replace(/<np-[\w-]+-demo\b/g, ''));

  if (rendered?.template && !demoOnly) {
    template = dedent(rendered.template);
    const used = new Set(expressions(template).match(/[A-Za-z_$][\w$]*/g));
    const scope = rendered.props ?? story.initialArgs;
    for (const [name, value] of Object.entries(scope)) {
      if (value === undefined || !used.has(name)) continue;
      if (isSignal(value)) {
        usesSignal = true;
        members.push(`${name} = signal(${js(value(), '  ')});`);
      } else
        members.push(
          typeof value === 'function'
            ? `${name}(event?: unknown) {\n    console.log('${name}', event);\n  }`
            : `${name} = ${js(value, '  ')};`,
        );
    }
  } else {
    const node = fromArgs(mirror, story.initialArgs) as Element;
    const attrs = ordered(node.props).flatMap((p) => {
      if (p.kind === 'event') {
        members.push(
          `${onName(p.name)}(event: unknown) {\n    console.log('${p.name}', event);\n  }`,
        );
        return [`(${p.name})="${onName(p.name)}($event)"`];
      }
      const input = mirror.inputs.find((i) => i.templateName === p.name);
      if (p.value === false || p.value == null) return [];
      if (p.value === true) return [input?.transform ? p.name : `[${p.name}]="true"`];
      if (typeof p.value === 'string') return [attr(p.name, p.value)];
      if (typeof p.value === 'number') return [`[${p.name}]="${p.value}"`];
      members.push(`${p.name} = ${js(p.value, '  ')};`);
      return [`[${p.name}]="${p.name}"`];
    });
    template = lines('<' + mirror.selector, attrs, '', ' />');
  }

  const tags = [...new Set([...template.matchAll(/<(np-[\w-]+)/g)].map((m) => m[1]))].filter(
    (tag) => !tag.endsWith('-demo'),
  );
  const imports = tags.map(className);
  const body = template.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$\{/g, '\\${');
  const indented = body.replace(/^(?=.)/gm, '    ');
  const fromNexprime = imports.length ? `import { ${imports.join(', ')} } from 'nexprime';\n` : '';
  const cls = members.length
    ? `export class Example {\n  ${members.join('\n\n  ')}\n}`
    : 'export class Example {}';
  return `import { Component${usesSignal ? ', signal' : ''} } from '@angular/core';
${fromNexprime}
@Component({
  selector: 'app-example',
  imports: [${imports.join(', ')}],
  template: \`
${indented}
  \`,
})
${cls}`;
}
