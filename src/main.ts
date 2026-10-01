import { bootstrapApplication } from '@angular/platform-browser';

import { applyTheme, readThemeHash, savedTheme } from '../.storybook/nexui-theme';
import { App } from './app/app';
import { appConfig } from './app/app.config';

// A link from Storybook brings its light/dark mode and theme color (themeHash in nexui-theme.ts)
readThemeHash();
const { theme, palette } = savedTheme();
applyTheme(document, theme, palette);

bootstrapApplication(App, appConfig).catch((err) => console.error(err));
