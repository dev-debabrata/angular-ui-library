/**
 * Autodocs page for every component: Storybook's usual layout (title, description, primary story, controls,
 * stories), but each story's "Show code" has framework tabs, all built by framework-snippets.ts: Angular (a
 * component importing from 'nexprime'), React, Next.js, Vue and HTML. Set in preview.ts (parameters.docs.page).
 * Plain .ts with createElement: the Angular Vite builder doesn't serve .tsx files.
 */
import {
  createElement as h,
  Fragment,
  useContext,
  useMemo,
  useState,
  useSyncExternalStore,
} from 'react';
import {
  Canvas,
  Controls,
  Description,
  DocsContext,
  Heading,
  Source,
  Subheading,
  Subtitle,
  Title,
  useOf,
} from '@storybook/addon-docs/blocks';

import { PAGES, managerHref } from '../src/stories/getting-started/landing';
import { FRAMEWORKS, setupNote, type Framework } from '../src/stories/utils/framework-code';
import {
  angularSnippet,
  frameworkSnippets,
  type StoryLike,
} from './framework-snippets';

const LANGUAGE: Record<Framework, string> = {
  angular: 'typescript',
  react: 'tsx',
  next: 'tsx',
  vue: 'html',
  html: 'html',
};

/** Setup note under the generated code; Next.js snippets here use the NexPrime wrapper (nexprime/react) */
const NOTES: Partial<Record<Framework, string>> = {
  angular: 'npm install nexprime, and load nexprime/styles/theme.css once.',
  next: 'npm install nexprime. Uses the NexPrime wrapper from nexprime/react, which loads the elements in the browser.',
};
const note = (framework: Framework) => NOTES[framework] ?? setupNote(framework);

/** Every framework's code for a story (null for a framework that can't be built), once "Show code" opens */
function buildSnippets(story: PreparedStory): Partial<Record<Framework, string | null>> {
  const attempt = <T>(build: () => T) => {
    try {
      return build();
    } catch (error) {
      console.warn('NexPrime docs: could not build a code snippet', error);
      return null;
    }
  };
  return { angular: attempt(() => angularSnippet(story)), ...attempt(() => frameworkSnippets(story)) };
}

const GUIDE = managerHref(PAGES.getStarted);

// The chosen framework is shared by every story, and kept while moving between docs pages
let current: Framework = 'angular';
const listeners = new Set<() => void>();
const subscribe = (listener: () => void) => (
  listeners.add(listener),
  () => listeners.delete(listener)
);
const setFramework = (value: Framework) => (
  (current = value),
  listeners.forEach((listener) => listener())
);

/** Lucide code-xml, the icon Storybook's own "Show code" button has */
const CODE_ICON = h(
  'svg',
  {
    width: 14,
    height: 14,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    'aria-hidden': true,
  },
  h('path', {
    d: 'm18 16 4-4-4-4M6 8l-4 4 4 4M14.5 4l-5 16',
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
  }),
);

type PreparedStory = StoryLike & {
  id: string;
  name: string;
  moduleExport: unknown;
  parameters: Record<string, any>;
};

/** "Show code" bar with framework tabs, below a story's canvas */
function StoryCode({ story }: { story: PreparedStory }) {
  const [open, setOpen] = useState(false);
  const framework = useSyncExternalStore(subscribe, () => current);
  // Built on first open, not for every story on the page
  const snippets = useMemo(() => (open ? buildSnippets(story) : {}), [open, story]);
  // Only Angular when the component has no Web Component
  const web = !!snippets.html;
  const shown: Framework = web ? framework : 'angular';
  const code = snippets[shown];

  const toggle = h(
    'button',
    {
      type: 'button',
      className: 'np-code__toggle',
      'aria-expanded': open,
      onClick: () => setOpen(!open),
    },
    CODE_ICON,
    open ? 'Hide code' : 'Show code',
  );
  const tabs =
    open &&
    web &&
    h(
      'div',
      { className: 'np-code__tabs', role: 'tablist', 'aria-label': 'Framework' },
      FRAMEWORKS.map(({ value, label }) =>
        h(
          'button',
          {
            key: value,
            type: 'button',
            role: 'tab',
            'aria-selected': shown === value,
            className: 'np-code__tab',
            onClick: () => setFramework(value),
          },
          label,
        ),
      ),
    );
  const panel =
    open &&
    (code
      ? h(
          Fragment,
          null,
          h(Source, { code, language: LANGUAGE[shown] as never, dark: true }),
          h(
            'p',
            { className: 'np-code__note' },
            note(shown) + ' ',
            h('a', { href: GUIDE, target: '_top' }, 'Setup guide'),
          ),
        )
      : // Storybook's own snippet, when ours can't be built
        h(Source, { of: story.moduleExport as never, dark: true }));

  return h(
    'div',
    { className: 'np-code' },
    h('div', { className: 'np-code__bar' }, toggle, tabs),
    panel,
  );
}

function StoryBlock({ story, primary }: { story: PreparedStory; primary?: boolean }) {
  const of = story.moduleExport as never;
  return h(
    'section',
    { id: `anchor--${story.id}`, className: 'np-story' },
    !primary && h(Subheading, null, story.name),
    !primary && h(Description, { of }),
    h(Canvas, { of, sourceState: 'none' }),
    h(StoryCode, { story }),
  );
}

export function NexDocsPage() {
  const { csfFile } = useOf('meta', ['meta']);
  const context = useContext(DocsContext);
  const stories = (
    context.componentStoriesFromCSFFile(csfFile) as unknown as PreparedStory[]
  ).filter((story) => !story.parameters?.['docs']?.disable);
  const [primary, ...rest] = stories;

  // Like PrimeNG's docs: every example first, the API (inputs and outputs table) at the end
  return h(
    Fragment,
    null,
    h(Title),
    h(Subtitle),
    h(Description, { of: 'meta' }),
    primary && h(StoryBlock, { story: primary, primary: true }),
    rest.length > 0 &&
      h(
        Fragment,
        null,
        h(Heading, null, 'Examples'),
        rest.map((story) => h(StoryBlock, { key: story.id, story })),
      ),
    h(Heading, null, 'API'),
    h(Controls),
  );
}
