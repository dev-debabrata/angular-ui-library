import type { Preview } from '@storybook/angular-vite';
import { GLOBALS_UPDATED, SET_GLOBALS } from 'storybook/internal/core-events';
import { addons } from 'storybook/preview-api';
import '../src/stories/styles/theme.css';
// Storybook's docs pages in dark mode
import './docs-theme.css';
import { applyTheme, savedTheme } from './nexui-theme';

// Light/dark mode and theme color (toolbar in manager.ts): applied to the whole preview, docs pages included
const onGlobals = ({ globals }: { globals: Record<string, string> }) =>
  applyTheme(document, globals['theme'], globals['palette']);
addons.getChannel().on(SET_GLOBALS, onGlobals);
addons.getChannel().on(GLOBALS_UPDATED, onGlobals);

const preview: Preview = {
  // Start in the saved choice, so a reload doesn't flash the light theme first
  initialGlobals: savedTheme(),
  parameters: {
    options: {
      storySort: {
        order: [
          'Getting Started',
          ['Use in React, Vue & Angular'],
          'Components',
          [
            'Overview',
            'Form',
            'Data',
            'Panel',
            'Overlay',
            'Menu',
            'Feedback',
            'Media',
            'Chat',
            'Misc',
          ],
          'Icons',
          'Animations',
          'Onboarding',
          ['Tour', 'Checklist'],
          'NexLottie',
          'Effects',
          [
            'Particles',
            'Spotlight',
            'Aurora',
            'Starfield',
            'Matrix Rain',
            'Waves',
            'Dot Grid',
            'Cursor Trail',
            'Confetti',
          ],
        ],
      },
    },

    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: 'todo',
    },
  },
};

export default preview;
