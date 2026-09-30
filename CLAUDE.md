# CLAUDE.md

NexUI (Next-generation UI): Angular 21 UI component library, developed and documented in Storybook 10 (`@storybook/angular-vite`).

## Commands

```bash
npm run storybook         # Storybook dev server on http://localhost:6006
npm run build-storybook   # Static Storybook build -> storybook-static/
npm start                 # Angular app (src/app) on http://localhost:4200
npm run build             # Production app build with SSR -> dist/angular-ui-library/{browser,server}
npm run serve:ssr:angular-ui-library   # Run the built SSR server (node, port 4000)
npm run build:elements    # Web Components for React/Vue/HTML -> dist/nexui-elements/browser/ (nexui.js, styles.css, icons/)
npm test                  # Vitest unit tests (*.spec.ts)
npx ngc -p .storybook/tsconfig.json --noEmit   # Type-check all components + stories (incl. templates)
```

The Storybook Vite build does not fail on template type errors. Run the `ngc` command above after changing components.

## Layout

```
src/stories/
  theme.css          Global design tokens (--ui-*), .tone-* color classes, shared .ui-* classes; imports animations.css
  animations.css     nex-anim-* animation classes (see Animations below)
  clipboard.ts       copyToClipboard() shared by the Icons and Animations pages
  gallery-page.css   Shared layout of the Icons and Animations pages (.gallery-page wrapper), loaded by preview.ts
  types.ts           Shared types: Tone, TONES, TONE_ICONS, Size, SIZES, User, MenuItem, TreeNode
  anchor-position.ts Shared fixed-position helper for popovers and popup menus
  menu-utils.ts      Shared menu logic: runItem, MenuPath, DismissableMenu, PopupMenu
  icons/             Drop-in .svg files for <nex-icon name="file-name" />: full Lucide set + user icons (see icons/README.md)
  icon-gallery/      "Icons" docs page: search, customize, copy code. Not a library component
  animation-gallery/ "Animations" docs page: filter, preview, replay, copy code. Not a library component
  lottie/            Drop-in Lottie files (.json) for <nex-lottie>, served at /lottie; the NexLottie page lists them
  lottie-gallery/    "NexLottie" docs page: categories, preview, paste a LottieFiles link, copy code, download
  components/
    <name>/
      <name>.component.ts   Class only: inputs/outputs/logic
      <name>.html           Template (templateUrl)
      <name>.css            Styles (styleUrl)
      <name>.stories.ts
  Configure.mdx, assets/   Storybook welcome page (boilerplate)
src/app/             Demo Angular app (not used by Storybook), server-rendered: src/server.ts (Express), src/main.server.ts,
                     app.config.server.ts, app.routes.server.ts (RenderMode.Server for all routes)
src/elements/nexui.ts  Web Components entry: registers every component as <nexui-*> (Angular Elements), window.NexUI.confirm()
src/styles.css       Imports stories/theme.css for the app
public/favicon.svg   NexUI logo, used as the favicon by the app and by Storybook (staticDirs)
.storybook/          Storybook config; preview.ts imports src/stories/theme.css
                     preview-head.html adds a plain-JS "back to top" button to every page (docs scroll in the preview frame)
                     manager.ts sets the Storybook UI theme and brand name "NexUI — Next-generation UI"
                     and renames the browser tab ("NexUI - Button - Primary") over Storybook's own title
                     keeps one sidebar group open on load (the open page's group, else Getting Started), and makes
                     groups and components accordions (opening one closes the other)
                     manager-head.html styles the Storybook sidebar like PrimeNG's docs: top-level entries get a boxed
                     icon (set per `data-item-id`, Lucide SVG data URIs) and groups a chevron (restart Storybook after editing)
```

All components live in `src/stories/components/<name>/`, one folder per component. Import shared types with `from '../../types'` and other components with `from '../<other>/<other>.component'`.
Every story title is `Components/<Name>`. Do not use an `Example/` group.

## Component conventions

- Standalone components (no `standalone: true` needed, no NgModules, no `CommonModule`).
- Signal APIs only: `input()`, `output()`, `model()` for two-way values (`[(value)]`, `[(checked)]`, `[(open)]`, `[(page)]`), `signal()`/`computed()` for internal state.
- Built-in control flow (`@if`, `@for`, `@else`). Do not use `*ngIf`, `*ngFor` or `ngClass`.
- Every component has 3 files: `templateUrl: './<name>.html'` and `styleUrl: './<name>.css'`. Never use inline `template` or `styles` in the `.ts` file.
- Selector prefix `nex-` (the Button/Header/Page examples keep `storybook-`).
- Every public input/output gets a one-line `/** doc comment */`. Storybook autodocs shows these.
- Static `class="x"` plus `[class]="'x--' + variant()"` merge in Angular. Don't repeat the base class inside the binding.
- Components must render on the server (the app uses SSR + hydration): don't touch `window`, `document`, `matchMedia`, observers or `fetch` in constructors, `computed` or effects. Put that code in `afterNextRender` or behind `isPlatformBrowser(inject(PLATFORM_ID))` (see Scroll Top, Icon, Chart).
- Boolean inputs use `input(false, { transform: booleanAttribute })` and number inputs `input(0, { transform: numberAttribute })`, so HTML attributes (`card`, `num-visible="3"`) work in the Web Components and in Angular templates.

## Styling ("Aurora" design)

The look is an indigo → violet gradient accent (`--ui-gradient`) on slate neutrals, with soft layered shadows, rounded corners, a glowing focus ring on every interactive element, and short entrance/hover animations. Keep new components consistent with this:

- Use theme variables, not hex values. Colors: `--ui-primary`, `--ui-primary-hover`, `--ui-accent`, `--ui-gradient`, `--ui-primary-soft`, `--ui-text`, `--ui-text-muted`, `--ui-text-subtle`, `--ui-border`, `--ui-border-strong`, `--ui-surface`, `--ui-surface-muted`, `--ui-surface-sunken`, `--ui-success`, `--ui-warning`, `--ui-danger`. Shape and motion: `--ui-radius-sm`, `--ui-radius`, `--ui-radius-lg`, `--ui-shadow-sm`, `--ui-shadow`, `--ui-shadow-lg`, `--ui-ring`, `--ui-ease`, `--ui-font`.
- Selected/active states use `background: var(--ui-gradient)` with white text. Hover changes color, background, border or shadow only (e.g. `--ui-primary-soft`). Never move elements on hover (no `translateY` lift). `:focus-visible` uses `box-shadow: var(--ui-ring)`.
- Alert and Toast show a round tone icon: `<span class="ui-tone-icon">{{ icons[type()] }}</span>` with `TONE_ICONS`.
- Color variants: add the class `tone-<tone>` and read `--tone-bg`, `--tone-fg`, `--tone-border`, `--tone-solid`. Type the input as `Tone` from `types.ts` (`info | success | warning | danger | neutral`).
- Form fields: wrap in `.ui-field`, with `.ui-label`, `.ui-control` (on input/select/textarea), `.ui-hint` and `.ui-error`. `aria-invalid="true"` on a `.ui-control` gives it a red border.
- Buttons inside components use the shared `.ui-btn` classes: `.ui-btn--primary` (gradient), `--danger`, `--text` (combine with `--danger` for red text), `--sm`, `--icon`. Don't write component-local button CSS.
- Close buttons use `.ui-close`. Screen-reader-only text uses `.ui-visually-hidden`.
- The theme is global, so component CSS can use these classes despite view encapsulation.

## Icons

- Users add their own `.svg` files to `src/stories/icons/`. `<nex-icon name="x" />` (`components/icon/`) fetches `icons/x.svg` at runtime, caches it, and inlines it so `currentColor` works.
- The folder is served at `/icons` by Storybook (`staticDirs` in `.storybook/main.ts`) and by the app build (`assets` in `angular.json`). Keep both in sync with `ICONS_URL` in `icon.component.ts`.
- The folder ships with all Lucide icons (`LICENSE-lucide.txt`, search keywords in `tags.json`). The **Icons** page (`icon-gallery/icons.stories.ts`) reads every `.svg` with `import.meta.glob(..., { query: '?raw' })`, so new files need no code changes. Its data is passed as `props`, not `args`, to keep it out of the Controls panel.
- `http://localhost:6006/` opens Configure your project (a redirect script at the top of `manager-head.html`; Storybook would pick Icons).
- Sidebar order is set in `.storybook/preview.ts` (`storySort`): Getting Started, Components, Icons, Animations, Onboarding (Tour, Checklist), NexLottie. Root pages and the Onboarding group are moved below Components with CSS `order` in manager-head.html.
- Icon styles: `variant` = `outline` (default) | `duotone` (closed shapes tinted, marked by `markClosedShapes()`) | `gradient` (stroke uses a shared `#nex-icon-gradient` added to the page once) | `soft` / `solid` (rounded tile filling `size`; on `solid` a `style="color"` becomes the tile color and the icon stays white). They work on any outline icon, so new `.svg` files get them too. The Icons page renders `<nex-icon [svg]>` and writes variants out as plain SVG for Copy SVG / Download.
- `IconComponent` uses `ViewEncapsulation.None` to style the inlined `<svg>`, so scope its CSS under `.nex-icon`.

## Animations

- `src/stories/animations.css` (imported by theme.css, so global) defines `nex-anim-<name>` classes for any element, tuned with `--nex-anim-duration`, `--nex-anim-delay`, `--nex-anim-ease`, `--nex-anim-repeat`. A shared `[class*='nex-anim-']` rule sets the defaults; each class sets `animation-name` (loop classes use the full shorthand with `infinite`). `prefers-reduced-motion` turns them off.
- Categories are the `/* === Name === */` comments (Entrance, Attention, Loop, Exit). The **Animations** page (`animation-gallery/animations.stories.ts`) imports the file with `?raw` and `parseAnimations()` builds the list and each card's standalone CSS, so a new class plus its `@keyframes nex-<name>` needs no other changes.

## Web Components (React, Vue, plain HTML)

- `npm run build:elements` builds `src/elements/nexui.ts` with Angular Elements. Every component is registered as `nexui-<name>`, not `nex-<name>`: the components render `nex-*` tags internally, and registering those names would make the browser start a second copy of each nested component.
- Outputs are DOM events (`event.detail`). camelCase outputs are also dispatched in kebab-case (`valueChange` and `value-change`) for Vue. Arrays, objects and functions must be set as properties.
- Features that need `<ng-template>` or services have Web Component alternatives: Carousel uses its child elements as slides when there's no template, and `window.NexUI.confirm()` wraps ConfirmationService. Icons load from `window.NEXUI_ICONS_URL` (default `icons/`).
- The docs page is `src/stories/Frameworks.mdx` (Getting Started). Storybook MDX has no GitHub table syntax, so write tables as HTML.

## Lottie

- `nex-lottie` (`components/lottie/`) plays Lottie animations as SVG with lottie-web's light build, imported on first use and only in the browser (SSR-safe). `src` takes a `.json` or `.lottie` URL (`.lottie` is unzipped with fflate, and its images are inlined). `data` takes a parsed object. `hover` plays only while hovered. With reduced motion it shows the last frame still.
- `src/stories/lottie/*.json` is served at `/lottie` (Storybook `staticDirs`, and `assets` in the app and elements builds). The starter set is generated by our own script (no third-party artwork). `meta.cat` sets the category and `meta.bg` the card background on the NexLottie page, which reads the folder with `import.meta.glob`, so new files need no code changes. LottieFiles downloads work as-is and land in the "Other" category.
- The NexLottie story sets `name: 'NexLottie'` so it shows as a single sidebar page (the story ID is `nexlottie--nex-lottie`).

## Shared patterns

- Menus (Menu, Menubar, MegaMenu, PanelMenu, TieredMenu) take `[model]="MenuItem[]"` from `types.ts`: `icon` is an icon file name, `command` runs on click, plus `url`, `items`, `separator`, `disabled`, `badge`. Popup menus expose `toggle(event)`, `show(event)`, `hide()`.
- Drag and drop uses `@angular/cdk/drag-drop` (PickList). Style CDK states (`.cdk-drag-preview`, `.cdk-drag-placeholder`, `.cdk-drop-list-dragging`) in the component CSS. The preview is a clone of the item, so component styles still apply.
- Badge is a standalone label; Overlay Badge (`<nex-overlay-badge [value]="6">…</nex-overlay-badge>`) wraps content and puts a count or dot on its corner.
- Footer slots (`<div dialogFooter>`, `<div cardFooter>`) get `display: contents` from theme.css, so the component's footer lays out the buttons with its gap. Card's `footerAlign="stretch"` uses a grid to make them equal width.
- Tree and TreeTable take `TreeNode[]` from `types.ts` (`key` is required and must be unique).
- ConfirmDialog and ConfirmPopup share `ConfirmationService` (`components/confirm-dialog/confirmation.service.ts`, `providedIn: 'root'`). Call `confirm({ message, header, accept, reject })`. Pass `target: event.currentTarget` for the popup; confirms without a target open the dialog.
- Anchored overlays (OverlayPanel, ConfirmPopup) and popup menus share `src/stories/anchor-position.ts`.
- All menus render rows with the internal `nex-menu-item` (`components/menu-item/`, global CSS, tuned per menu via `--mi-*` variables). Its story is hidden from the sidebar with `tags: ['!dev']`.
- ConfirmDialog renders `<nex-dialog>` internally; its No/Yes are `.ui-btn--text` (Yes turns red with `acceptTone: 'danger'`).
- `*-demo.component.ts` files (confirm-dialog, overlay-panel) are story-only helpers for examples that need injected services or icon buttons. They are not part of the library.
- Chart (`nex-chart`) is dependency-free SVG: `type` line | area | bar (`stacked`) | pie | doughnut, `labels` + `datasets: ChartDataset[]`. Series colors are the theme's `--ui-chart-1…8` (validated for color-blind separation; keep that order, don't add a 9th). It follows the data-viz rules: bars ≤ 24px with 2px gaps and 4px rounded tops, 2px lines, a legend only for 2+ series, a hover tooltip, and a visually hidden data table. SVG colors are set with `[style.fill]`/`[style.stroke]` because presentation attributes can't use `var()`.
- Carousel (`nex-carousel`) renders a projected `<ng-template let-item let-i="index">` per item; `numVisible`, `numScroll`, `circular`, `autoplayInterval` (pauses on hover/focus), `[(page)]`, arrow keys and swipe.
- Form (`nex-form`) builds a validated form from `fields: FormField[]` (or multi-step `steps: FormStep[]`) and reuses the input components. Extra field types (rating, chips, multichips, cards, segmented, choice, color) render as `.option` buttons. It has an optional header (`title`, `subtitle`, `icon`, `tone`), `card`, `layout="inline"`, `loading`, and a success view (`successTitle`). Extra content goes in `[formBeforeActions]` (above the buttons) or the default slot (below the form). The Form stories double as ready-made templates (Login, Contact, Feedback, Survey, Newsletter, Bug report, Feature request, Onboarding).
- Chat (`nex-chat`) appends what the user sends to `[(messages)]` (`ChatMessage[]`) and emits `send`; the consumer appends the replies. Voice Chat (`nex-voice-chat`) reuses `ChatMessage`: its mic goes idle → listening → processing → speaking with the Web Speech API (a text box when recognition isn't available), emits `utterance`, and speaks the next `them` message.
- Helpful (`nex-helpful`) is the "Was this helpful?" vote widget.
- Onboarding lives in its own sidebar group (titles `Onboarding/Tour`, `Onboarding/Checklist`) instead of `Components/`. `nex-onboarding` is a tour over `steps` (CSS selectors) with `mode` spotlight | beacon | welcome and `theme` light | dark | gradient | glass. Use `start(step?)`, or `autoStart` + `storageKey` to show it once. `nex-onboarding-checklist` emits `showMe(task)` so the app can start a tour step. Tour stories use `docs.story.inline: false`, so each auto-starting tour runs in its own frame.
- Scroll Top (`nex-scroll-top`) is fixed to the page corner by default. With `[target]` set to a scrolling element, place it as that element's last child: it sticks to the element's bottom edge.
- AnimateOnScroll is a wrapper component (`<nex-animate-on-scroll animation="fade-up">`). Pass `[root]` when content scrolls inside a container instead of the page.

## Stories

```ts
const meta: Meta<FooComponent> = {
  title: 'Components/Foo',
  component: FooComponent,
  tags: ['autodocs'],
  argTypes: { variant: { control: 'select', options: TONES } },  // union inputs need explicit options
  args: { label: 'Foo', clicked: fn() },                          // shared args + fn() for every output
};
export const Default: Story = {};
export const Disabled: Story = { args: { disabled: true } };      // keep short args on one line
```

- For `model()` inputs, add `<name>Change: fn()` to `args` so changes show in the Actions panel.
- Use a `render` template when the component needs projected content, a trigger button (Modal, Toast), or several instances in one story (`AllTypes`/`AllVariants`).
- Overlays (Modal, Toast) set `parameters.docs.story = { inline: false, height }` so they render inside the docs page.
- To reuse another component in a story template, add `decorators: [moduleMetadata({ imports: [ButtonComponent] })]`.

## Adding a component

1. Create `src/stories/components/<name>/` with `<name>.component.ts`, `<name>.html`, `<name>.css` and `<name>.stories.ts`, following the conventions above.
2. Add it to the `components` list in `src/elements/nexui.ts` (and the element list in `Frameworks.mdx`).
3. Run `npx ngc -p .storybook/tsconfig.json --noEmit`, then `npm run build-storybook` and `npm run build:elements`.
