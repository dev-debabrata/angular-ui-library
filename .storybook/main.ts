import path from 'node:path';
import type { StorybookConfig } from '@storybook/angular-vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [
    '@chromatic-com/storybook',
    '@storybook/addon-vitest',
    '@storybook/addon-a11y',
    '@storybook/addon-docs',
    '@storybook/addon-onboarding',
  ],
  framework: '@storybook/angular-vite',
  // The toolbar shows NexUI's own search / dark mode / theme color buttons (manager.ts) instead of these.
  // highlight read every element's computed style on each page change (~350 ms leaving NexLottie)
  features: {
    backgrounds: false,
    outline: false,
    measure: false,
    viewport: false,
    highlight: false,
  },
  // public/ gives the NexUI favicon.svg; drop-in SVG icons are served at /icons, Lottie files at /lottie
  staticDirs: [
    '../public',
    { from: '../src/stories/icons/svg', to: '/icons' },
    { from: '../src/stories/nexlottie/files', to: '/lottie' },
  ],
  async viteFinal(config, { configType }) {
    if (configType === 'PRODUCTION') {
      config.resolve = config.resolve || {};
      const alias = Array.isArray(config.resolve.alias) ? {} : { ...(config.resolve.alias || {}) };
      alias[path.resolve(import.meta.dirname, '../src/environments/environment.ts')] =
        path.resolve(import.meta.dirname, '../src/environments/environment.prod.ts');
      alias['../../environments/environment'] =
        path.resolve(import.meta.dirname, '../src/environments/environment.prod.ts');
      config.resolve.alias = alias;
    }
    return config;
  },
};
export default config;
