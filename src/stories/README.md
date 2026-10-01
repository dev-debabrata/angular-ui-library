# NexUI

Next-generation UI for Angular 21: standalone, signal-based components in the "Aurora" design, with 2,000+ icons,
CSS animations, a Lottie player and canvas effects. Every component renders on the server (SSR + hydration).

## Install

```bash
npm install nexui
```

## Set up

1. Add the theme to your global styles (`src/styles.css`):

   ```css
   @import 'nexui/styles/theme.css';
   ```

2. Serve the icons at `/icons`, so `<nex-icon name="…">` can load them. In `angular.json`, under
   `build.options.assets`:

   ```json
   { "glob": "*.svg", "input": "node_modules/nexui/icons", "output": "icons" }
   ```

## Use

```ts
import { Component, signal } from '@angular/core';
import { ToggleComponent } from 'nexui';

@Component({
  selector: 'app-settings',
  imports: [ToggleComponent],
  template: `<nex-toggle label="Dark mode" [(checked)]="dark" />`,
})
export class Settings {
  dark = signal(false);
}
```

Dark mode: set `data-theme="dark"` on `<html>`.

Every component, with live examples and its inputs and outputs, is in the NexUI Storybook.
Icons are from [Lucide](https://lucide.dev) (ISC license, `icons/LICENSE-lucide.txt`).
