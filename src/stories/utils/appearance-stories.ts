/**
 * Story-only helper: the "Colors" and "Shapes" examples on every component's docs page. They render the component's
 * main story once per appearance class from theme.css (np-color-*, np-shape-*), so the same markup shows how the
 * classes recolor and reshape it. Not part of the library.
 */
import { reflectComponentType, type Type } from '@angular/core';
import { argsToTemplate, type Meta, type StoryObj } from '@storybook/angular-vite';

import { APPEARANCE_COLORS, APPEARANCE_SHAPES } from './types';

/** The colors besides the theme's own (primary) and the neutral secondary */
const COLORS = APPEARANCE_COLORS.filter((c) => c !== 'primary' && c !== 'secondary');

/** One labeled cell per class, in a responsive grid */
function grid(prefix: string, values: readonly string[], inner: string) {
  const cells = values.map(
    (value) => `<div class="${prefix}${value}" style="display: grid; align-content: start; gap: 10px; min-width: 0">
  <code style="justify-self: start; padding: 2px 8px; border-radius: 6px; background: var(--ui-surface-sunken); color: var(--ui-text-muted); font-size: 12px">${prefix}${value}</code>
  ${inner}
</div>`,
  );
  return `<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 24px">
${cells.join('\n')}
</div>`;
}

/** The component with its args, for stories without a template of their own */
function componentTemplate(component: unknown, args: unknown) {
  const selector = reflectComponentType(component as Type<unknown>)?.selector;
  return `<${selector} ${argsToTemplate(args as Record<string, unknown>)}></${selector}>`;
}

/** Colors and Shapes stories built from the component's main story (its render, or the meta's) */
export function appearanceStories<T>(meta: Meta<T>, base: StoryObj<T>) {
  const make = (name: string, prefix: string, values: readonly string[], description: string): StoryObj<T> => ({
    name,
    args: base.args,
    decorators: base.decorators,
    parameters: {
      ...base.parameters,
      docs: { ...base.parameters?.['docs'], description: { story: description } },
    },
    render: (args, context) => {
      const render = base.render ?? meta.render;
      const rendered = render?.(args, context);
      return {
        ...rendered,
        props: rendered?.props ?? args,
        template: grid(prefix, values, rendered?.template ?? componentTemplate(context.component, args)),
      };
    },
  });

  return {
    colors: make(
      'Colors',
      'np-color-',
      COLORS,
      'Add a `np-color-*` class (theme.css) to recolor it: selected states, focus ring, checked states and accents.',
    ),
    shapes: make(
      'Shapes',
      'np-shape-',
      APPEARANCE_SHAPES,
      'Add a `np-shape-*` class (theme.css) to change its corners: pill, rounded (small radius) or square.',
    ),
  };
}
