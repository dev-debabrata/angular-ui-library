# nexprime

NexPrime: one premium UI system for every framework. 85+ components (forms, tables, charts, dialogs, menus, chat,
onboarding tours, background effects, Lottie), 2,000+ icons, CSS animations and a light/dark theme.

**Docs and live demos: [nexprime-dev.vercel.app](https://nexprime-dev.vercel.app/)**

- **Angular, React, Next.js, Vue, Svelte and plain HTML**: the same components everywhere, as Web Components outside Angular (`<np-button>`, `<np-chart>`, …).

Dark mode: set `data-theme="dark"` on `<html>`.

## Angular

```bash
npm i nexprime @angular/cdk
```

1. Theme, in `src/styles.css`:

   ```css
   @import 'nexprime/styles/theme.css';
   ```

2. Icons, in `angular.json` under `build.options.assets` (served at `/icons`, where `<np-icon>` looks for them):

   ```json
   { "glob": "**/*.svg", "input": "node_modules/nexprime/icons", "output": "icons" }
   ```

   Optional, the bundled Lottie animations: `{ "glob": "**/*.json", "input": "node_modules/nexprime/lottie", "output": "lottie" }`

3. Use:

   ```ts
   import { Component } from '@angular/core';
   import { ButtonComponent, IconComponent } from 'nexprime';

   @Component({
     selector: 'app-root',
     imports: [ButtonComponent, IconComponent],
     template: `
       <np-button primary label="Save" />
       <np-icon name="house" />
     `,
   })
   export class App {}
   ```

## React and Next.js

```bash
npm i nexprime
```

Angular is bundled inside the Web Components; you don't install it.

```tsx
// main.tsx (Next.js: app/layout.tsx)
import 'nexprime/styles/theme.css';
```

```tsx
'use client'; // Next.js only
import { useState } from 'react';
import { NpButton, NpChart, NpIcon, setIconsUrl } from 'nexprime/react';

setIconsUrl('https://cdn.jsdelivr.net/npm/nexprime/icons/'); // or copy node_modules/nexprime/icons to public/icons

const datasets = [{ label: 'Sales', data: [120, 150, 170] }];

export function Dashboard() {
  const [saved, setSaved] = useState(0);
  return (
    <>
      <NpButton primary label={`Saved ${saved}`} onclicked={() => setSaved((n) => n + 1)} />
      <NpChart type="bar" labels={['Q1', 'Q2', 'Q3']} datasets={datasets} />
      <NpIcon name="rocket" size="32" />
    </>
  );
}
```

- React components are imported directly from `'nexprime/react'` (`<NpButton>`, `<NpChart>`, `<NpTable>`, etc.).
- Props, data arrays and objects are passed directly (`labels={...}`, `datasets={...}`).
- Custom events use `on<event>` callbacks (`onclicked`, `onselectionChange`, `onrowClick`), receiving the event with `e.detail`.
- Elements load in the browser only (safe with Next.js SSR and React 18/19 hydration).

## Vue 3

```bash
npm i nexprime
```

```ts
// vite.config.ts
vue({ template: { compilerOptions: { isCustomElement: (tag) => tag.startsWith('np-') } } });
```

```ts
// main.ts
import 'nexprime/styles/theme.css';
import 'nexprime/elements';
window.NEXPRIME_ICONS_URL = 'https://cdn.jsdelivr.net/npm/nexprime/icons/';
```

```vue
<template>
  <np-chart type="bar" :labels="labels" :datasets="datasets" />
  <np-button primary label="Save" @clicked="save" />
  <np-select :options="options" :value="city" @value-change="city = $event.detail" />
</template>
```

Vue passes arrays and objects as properties. Use kebab-case event names (`@value-change`).

## Plain HTML (no build step)

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/nexprime/styles/theme.css" />
<script>
  window.NEXPRIME_ICONS_URL = 'https://cdn.jsdelivr.net/npm/nexprime/icons/';
</script>
<script type="module" src="https://cdn.jsdelivr.net/npm/nexprime/elements/nexprime.js"></script>

<np-button primary label="Save"></np-button>
<np-chart id="sales" type="bar"></np-chart>

<script type="module">
  await customElements.whenDefined('np-chart');
  const chart = document.querySelector('#sales');
  chart.labels = ['Q1', 'Q2', 'Q3'];
  chart.datasets = [{ label: 'Sales', data: [120, 150, 170] }];
  document.querySelector('np-button').addEventListener('clicked', () => alert('Saved'));
</script>
```

## Web Component rules (React, Vue, HTML)

- Tag names are the Angular selectors: `<np-form>`, `<np-chart>`, `<np-voice-chat>`.
- Strings, numbers and booleans can be kebab-case attributes: `num-visible="3"`, `card`, `submit-label="Send"`.
- Arrays, objects and functions must be set as properties (`el.fields = [...]`).
- Outputs are DOM events with the output's name; camelCase ones are also sent in kebab-case (`valueChange` and
  `value-change`). The value is `event.detail`.
- Confirm dialogs: put `<np-confirm-dialog>` on the page and call `window.NexPrime.confirm({ header, message, accept })`.
- A `nexprime:ready` event fires on `window` once every element is registered.
