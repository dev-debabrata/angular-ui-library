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
import { frameworkSnippets, type StoryLike, type WebFramework } from './framework-snippets';

const LANGUAGE: Record<WebFramework, string> = {
  react: 'tsx',
  next: 'tsx',
  vue: 'html',
  html: 'html',
};

/** Setup note under the generated code; Next.js snippets here use the NexPrime wrapper (Frameworks.mdx) */
const note = (framework: WebFramework) =>
  framework === 'next'
    ? 'Uses the NexPrime wrapper (components/nexprime.tsx). Load nexprime.js once in app/layout.tsx.'
    : setupNote(framework);

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
  const snippets = useMemo(() => {
    try {
      return frameworkSnippets(story);
    } catch (error) {
      console.warn('NexPrime docs: could not build framework snippets', error);
      return null;
    }
  }, [story]);
  // Only Angular when the component has no Web Component
  const shown: Framework = snippets ? framework : 'angular';

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
    snippets &&
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
  const code =
    open &&
    (shown === 'angular' || !snippets
      ? h(Source, { of: story.moduleExport as never, dark: true })
      : h(
          Fragment,
          null,
          h(Source, { code: snippets[shown], language: LANGUAGE[shown] as never, dark: true }),
          h(
            'p',
            { className: 'np-code__note' },
            note(shown) + ' ',
            h('a', { href: GUIDE, target: '_top' }, 'Setup guide'),
          ),
        ));

  return h(
    'div',
    { className: 'np-code' },
    h('div', { className: 'np-code__bar' }, toggle, tabs),
    code,
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

  return h(
    Fragment,
    null,
    h(Title),
    h(Subtitle),
    h(Description, { of: 'meta' }),
    primary && h(StoryBlock, { story: primary, primary: true }),
    h(Controls),
    rest.length > 0 &&
      h(
        Fragment,
        null,
        h(Heading, null, 'Stories'),
        rest.map((story) => h(StoryBlock, { key: story.id, story })),
      ),
  );
}
