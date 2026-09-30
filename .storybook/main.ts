import type { StorybookConfig } from '@storybook/angular-vite';

const config: StorybookConfig = {
  "stories": [
    "../src/**/*.mdx",
    "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"
  ],
  "addons": [
    "@chromatic-com/storybook",
    "@storybook/addon-vitest",
    "@storybook/addon-a11y",
    "@storybook/addon-docs",
    "@storybook/addon-onboarding"
  ],
  "framework": "@storybook/angular-vite",
  // public/ gives the NexUI favicon.svg; drop-in SVG icons are served at /icons, Lottie files at /lottie
  "staticDirs": [
    "../public",
    { "from": "../src/stories/icons", "to": "/icons" },
    { "from": "../src/stories/lottie", "to": "/lottie" }
  ]
};
export default config;