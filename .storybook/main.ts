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
  // The toolbar shows NexPrime's own search / dark mode / theme color buttons (manager.ts) instead of these.
  // highlight read every element's computed style on each page change (~350 ms leaving NexLottie)
  features: {
    backgrounds: false,
    outline: false,
    measure: false,
    viewport: false,
    highlight: false,
  },
  // public/ gives the NexPrime favicon.svg; drop-in SVG icons are served at /icons, Lottie files at /lottie
  staticDirs: [
    '../public',
    { from: '../src/stories/icons/svg', to: '/icons' },
    { from: '../src/stories/nexlottie/files', to: '/lottie' },
  ],
};
export default config;
