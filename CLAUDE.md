# CLAUDE.md

NexPrime (one premium UI system for every framework): Angular 21 UI component library, developed and documented in Storybook 10 (`@storybook/angular-vite`).
Names (the project was called NexUI): Angular selectors and all CSS classes, attributes, ids and storage keys use `np-`
(`np-form`, `np-anim-*`, `np-effect`, `np-icon--*`, `np-theme`); JavaScript names use `NexPrime` (`window.NexPrime`,
`window.NEXPRIME_ICONS_URL`, the `NexPrime` React wrapper). Web Components use the same `<np-*>` tags as Angular. The bundle is `nexprime.js` in `dist/nexprime-elements/`.

## Commands

```bash
npm run storybook         # Storybook dev server on http://localhost:6006
npm run build-storybook   # Static Storybook build -> storybook-static/
npm start                 # Angular app (src/app) on http://localhost:4200
npm run build             # Production app build with SSR -> dist/nexprime-ui/{browser,server}
npm run serve:ssr:nexprime-ui          # Run the built SSR server (node, port 4000)
npm run build:elements    # Web Components for React/Vue/HTML -> dist/nexprime-elements/browser/ (nexprime.js, styles.css, icons/)
npm run build:lib         # npm package "nexprime" (ng build nexprime-lib, ng-packagr) -> dist/nexprime-lib/ (entry src/public-api.ts,
                          # config src/ng-package.json + src/package.json, README src/README.md, LICENSE src/LICENSE = a copy of the root LICENSE, tsconfig.lib.json),
                          # then build:elements; packaging/package-lib.mjs adds elements/ (nexprime/elements, for
                          # React/Vue/HTML) and react/ (nexprime/react: <NexPrime> wrapper, JSX types) from packaging/.
                          # packaging/ is outside src/ so the app's tsconfigs don't type-check its React typings
npm run pack:lib          # build:lib + npm pack -> dist/nexprime-lib/nexprime-<version>.tgz. npm run publish:lib builds and publishes; or
                          # `cd dist/nexprime-lib && npm publish`. New components: export them in src/public-api.ts
npm test                  # Vitest unit tests (*.spec.ts)
npx ngc -p .storybook/tsconfig.json --noEmit   # Type-check all components + stories (incl. templates)
```

The Storybook Vite build does not fail on template type errors. Run the `ngc` command above after changing components.

## Layout

```
src/stories/         One folder per top-level sidebar section, plus shared utils/ and styles/:
  getting-started/   "Getting Started": site/ (the NexPrime site, see "Site" below), welcome/ (the landing page, an Angular
                     page built from NexPrime components and effects), components-catalog/ ("View Components": every
                     component grouped like the sidebar, read at runtime from Storybook's index.json; story
                     Components/Overview, hidden from the sidebar; the same catalog with `kind: 'effects'` (route data)
                     is the Effects page /effects-overview, story Effects/Overview, groups Canvas | Pure CSS; each card runs
                     its effect via NgComponentOutlet, from effect-previews.ts (component, story background, icon,
                     `idle` keeps the icon on top, `canvas` = extends CanvasEffect, `inputs` raise per-area counts so a
                     small card isn't sparse), loaded with the index), landing.ts (PAGES,
                     SECTIONS, VERSION, SITE_PAGES, clickedPage() shared by the site's pages), Installation.mdx (npm install
                     nexprime per framework), Configuration.mdx (theme, dark mode, tokens, icons, Lottie, animations),
                     playground/ (Getting Started ▸ Playground: pick a component from playground-data.ts, edit its
                     inputs, live preview via NgComponentOutlet, code from elementCode() in np-framework-code),
                     framework-code/ (np-framework-code: Angular | React | Next.js | Vue | HTML tabs over copyable code
                     with a setup note; used by the Icons panel, Animations panel and NexLottie's Asset & Embed tab)
  components/        "Components": library components only, grouped like the sidebar (Components ▸ <Group> ▸ <Name>):
    <group>/           form, data, panel, overlay, menu, feedback, media, chat, misc
      <name>/
        <name>.component.ts   Class only: inputs/outputs/logic
        <name>.html           Template (templateUrl)
        <name>.css            Styles (styleUrl)
        <name>.stories.ts
  icons/             "Icons" page (icon-gallery.*, icons-data.ts, icons.stories.ts: search, customize, copy code)
    svg/               Drop-in .svg files for <np-icon name="file-name" />, served at /icons: full Lucide set + user icons (see svg/README.md)
  animations/        "Animations" page (animation-gallery.*, animations-data.ts, animations.stories.ts: filter, preview, replay, copy code)
  onboarding/        "Onboarding": onboarding/ (Tour) and onboarding-checklist/ (Checklist) components
  nexlottie/         "NexLottie" page (lottie-gallery.*, lottie-detail.*, lottie-export.ts: preview, detail dialog, exports)
    files/             Drop-in Lottie files (.json) for <np-lottie>, served at /lottie; the NexLottie page lists them
  effects/           "Effects": visual effect components, one folder each: particles/, spotlight/, aurora/, starfield/,
                     matrix-rain/, waves/, dot-grid/, cursor-trail/, confetti/,
                     meteors/, fireflies/, retro-grid/, border-beam/, ripple/, snow/, bubbles/,
                     flickering-grid/, light-rays/, grain/, dot-wave/, dot-ribbon/
    canvas-effect.ts   Shared engine of the canvas effects (base class CanvasEffect)
    effect-story.ts    Story-only helpers (hero copy, dark backgrounds) for the Effects pages
  text-editor/       np-text-editor (Quill 2; docs at Components ▸ Form ▸ Text Editor, spec file; toolbar config in
                     text-editor-tools.ts, Quill setup and shortcuts in text-editor-quill.ts) and page/: the site's
                     "Text Editor" page (sidebar entry after Effects, /text-editor): Document (variant="document",
                     zoom, import .html/.txt/.md, export Word/HTML/PDF, autosave in localStorage) | Simple (live
                     HTML) | Comments modes, in text-editor-demo (also on Welcome as `preview`: shorter, inert, inside a link to
                     the page, loaded with @defer on viewport); text-editor-preview is the Welcome card's picture (no Quill)
  utils/             Shared TypeScript helpers (no components):
    types.ts           Shared types: Tone, TONES, TONE_ICONS, Size, SIZES, User, MenuItem, TreeNode
    anchor-position.ts Shared fixed-position helper for popovers and popup menus
    menu-utils.ts      Shared menu logic: runItem, MenuPath, DismissableMenu, PopupMenu
    clipboard.ts       copyToClipboard() shared by the Icons, Animations and NexLottie pages
    download.ts        downloadBlob() shared by the Icons and NexLottie pages
    framework-code.ts  FRAMEWORKS, the shared FRAMEWORK choice, elementCode() (a component as <np-x> or <np-x> with
                       kebab attributes and JSX/Vue/HTML styles), markupCode() (class vs. className), setup snippets
  styles/            Global CSS:
    theme.css          Design tokens (--ui-*), .tone-* color classes, shared .ui-* classes; imports animations.css
    animations.css     np-anim-* animation classes (see Animations below)
    gallery-page.css   Shared layout of the Icons, Animations and NexLottie pages (.gallery-page wrapper with a centered
                       .gallery-hero: version pill, big title, intro), loaded by preview.ts
    responsive.css     Tablet (<= 1024px) and mobile (<= 640px) layout of the site pages, shared overlays and the docs
                       pages; loaded last by preview.ts and by src/styles.css. Overrides start with `:root <host-tag>`
                       (and repeat a class for descendant selectors) to beat Angular's scoped component styles
src/app/             Demo Angular app (not used by Storybook), server-rendered: src/server.ts (Express), src/main.server.ts,
                     app.config.server.ts, app.routes.server.ts (RenderMode.Server for all routes)
src/elements/nexprime.ts  Web Components entry: registers every component as <np-*> (Angular Elements), window.NexPrime.confirm()
src/styles.css       Imports stories/styles/theme.css for the app
public/favicon.svg   NexPrime icon: the "prism" NP mark (blue stem, blue→violet connector, violet P, glass edges, two
                     glowing nodes) on a midnight tile; the favicon of the app and Storybook (staticDirs). Also
                     nexprime-logo{,-dark,-mono}.svg (mark + wordmark), nexprime-icon-mono.svg, nexprime-brand-{light,dark}.svg
                     (Storybook sidebar: the same lockup as the site's top bar, tile icon + "Nex" regular + "Prime" bold), nexprime-hero.svg (1600×900 banner / social card; also
                     the Welcome hero's background, dimmed, zoomed onto the NP mark on phones) and nexprime-mark.svg (the NP
                     mark without a tile). Wordmark and tagline are
                     Manrope (OFL) converted to outlines, so the files need no font
.storybook/          Storybook config; preview.ts imports src/stories/styles/theme.css
                     preview-head.html adds a plain-JS "back to top" button to every page (docs scroll in the preview frame),
                     and themes Storybook's loading screen (spinner, docs skeleton) from the saved 'np-theme' before JS loads
                     manager.ts sets the Storybook UI theme and brand name "NexPrime — One UI system for every framework"
                     and renames the browser tab ("NexPrime - Button - Primary") over Storybook's own title
                     keeps one sidebar group open on load (the open page's group, else Getting Started), and makes
                     groups and components accordions (opening one closes the other)
                     sets the layout per page from story tags: `np-landing` (the site's pages) hides the sidebar,
                     toolbar and addon panel; elsewhere they come back. It uses `layoutCustomisations` (asked on every
                     render, from the first frame; before the index loads, pages are known by id in `LANDING`), so a
                     reload never flashes the sidebar. It follows the page the preview shows (STORY_PREPARED/DOCS_PREPARED,
                     kept in addon state), not the selected one, so the layout doesn't change while the previous page is
                     still on screen. The site's SITE_ROUTE event puts its page in the address bar and tab.
                     The toolbar is hidden with CSS (`data-np-layout`), never toggleToolbar(false): Storybook then
                     keeps a landmark without an element, and showing the sidebar later crashes the manager UI
                     Short page URLs (`np/page-url`): "/" is Welcome, other pages are their Storybook id as one path
                     segment (a component's id for its first page: /icons, /components-form-button-toggle). It turns
                     them into ?path= just before Storybook reads the URL and shortens every URL Storybook writes;
                     middleware.mjs serves them in the dev server (a static host needs a fallback to index.html).
                     Landing-page links (`managerHref(PAGES.x)`), the site search and the top bar open short URLs in
                     place through openPage() (OPEN_PAGE from the preview): a component id opens its first page even
                     when it's hidden from the sidebar, an MDX page's id its docs. Don't use SELECT_STORY for short ids
                     docs-page.ts is every component's docs page (parameters.docs.page in preview.ts): Storybook's layout,
                     but "Show code" has Angular | React | Next.js | Vue | HTML tabs, all from framework-snippets.ts.
                     Angular (angularSnippet): a standalone component importing from 'nexprime', with the story's
                     template as written (or the component with its args) and the values it uses as fields (signals
                     as signal()). The others: story args + template → Web Component code; @for/@if/@switch/@let are
                     expanded with the story's values, #refs become ids (Vue refs), `(clicked)="menu.toggle($event)"`
                     and `(clicked)="visible = true"` (set on the element bound to `visible`) become real handlers,
                     and a Carousel <ng-template> becomes one child per item. Left as a "Simplified" note: other
                     <ng-template>s and element refs passed as inputs. Plain .ts with createElement: the builder doesn't serve .tsx
                     manager-head.html styles the Storybook sidebar like a docs site (quilljs.com/docs): plain text links
                     without icons, a 2px theme-color bar left of the selected page, group pages indented behind a guide
                     line, groups with a small chevron, page-colored background (restart Storybook after editing)
                     One top bar for every page, the site's included (`#np-topbar`, built in manager.ts, styled in
                     manager-head.html: logo, SECTIONS links, search, light/dark mode, theme color, Get Started, content
                     centered in 1200px; links in a second row on phones). It sits above Storybook's layout box
                     (`#root > div`, shortened by --np-topbar-h; a `[style*=…]` selector didn't match). On docs pages
                     (data-np-layout="default") that box is centered in the same 1200px column and the sidebar's logo row
                     is hidden. On the site's pages its links go to the site's router (SITE_GO) and search opens the site
                     search (SITE_SEARCH); elsewhere links select the story and search focuses the sidebar search
                     Toolbar: Storybook's own tools are off (`features` in main.ts, `toolbar` in manager.ts); search, light/dark
                     mode and theme color are in the top bar (icons in theme-tools.ts, which also has managerTheme()). np-theme.ts holds the palettes and
                     applyTheme(); the choice is the `theme`/`palette` globals, applied by preview.ts (data-theme +
                     --ui-primary/--ui-primary-hover/--ui-accent) and saved by manager.ts in localStorage ('np-theme').
                     docs-theme.css styles Storybook's docs pages in dark mode; manager-head.html's sidebar CSS uses
                     --nav-* variables that follow the mode; the sidebar logo is public/nexprime-brand-{light,dark}.svg. Toolbar tools are hidden by id in
                     manager.ts (`isolationMode`, `storybook/a11y/panel`, …); only "Show addon panel" needs CSS
```

All components live in `src/stories/components/<group>/<name>/`, one folder per component. Groups:
Form (inputs, buttons, pickers, uploads), Data (tables, trees, charts, lists), Panel (layout containers), Overlay (dialogs, popups, tooltips), Menu, Feedback (alerts, progress, loading), Media (icons, avatars, badges, Lottie), Chat, Misc (page helpers). Onboarding components live in `src/stories/onboarding/<name>/` (their own sidebar section), not under components/.
Import shared types and helpers with `from '../../../utils/types'` (or `../../../utils/<helper>`), components in the same group with `from '../<other>/<other>.component'` and in another group with `from '../../<group>/<other>/<other>.component'`.
Every story title is `Components/<Group>/<Name>` (Onboarding and Effects keep their own `Onboarding/…` and `Effects/…` groups). Do not use an `Example/` group. The group order in the sidebar is set in `storySort` in `.storybook/preview.ts`.
The sidebar in `manager.ts` lists components like PrimeNG's docs: groups inside Components (Form, Data, …) are always-open
bold headings, and each component is one link to its first page (a trusted click selects it instead of expanding it; its
story and docs rows are hidden by CSS, prefixes components-/effects-/onboarding-). The current component gets the selected
bar from a `#np-current-component` style. Top-level groups and components are still accordions.

## Component conventions

- Standalone components (no `standalone: true` needed, no NgModules, no `CommonModule`).
- Signal APIs only: `input()`, `output()`, `model()` for two-way values (`[(value)]`, `[(checked)]`, `[(open)]`, `[(page)]`), `signal()`/`computed()` for internal state.
- Built-in control flow (`@if`, `@for`, `@else`). Do not use `*ngIf`, `*ngFor` or `ngClass`.
- Every component has 3 files: `templateUrl: './<name>.html'` and `styleUrl: './<name>.css'`. Never use inline `template` or `styles` in the `.ts` file.
- Selector prefix `np-` (NexPrime; it was `nex-`), for every component including Button, Header and Page. Web Components
  stay `<np-*>` (`np-form` → `np-form`).
- Every public input/output gets a one-line `/** doc comment */`. Storybook autodocs shows these.
- Static `class="x"` plus `[class]="'x--' + variant()"` merge in Angular. Don't repeat the base class inside the binding.
- Components must render on the server (the app uses SSR + hydration): don't touch `window`, `document`, `matchMedia`, observers or `fetch` in constructors, `computed` or effects. Put that code in `afterNextRender` or behind `isPlatformBrowser(inject(PLATFORM_ID))` (see Scroll Top, Icon, Chart).
- Boolean inputs use `input(false, { transform: booleanAttribute })` and number inputs `input(0, { transform: numberAttribute })`, so HTML attributes (`card`, `num-visible="3"`) work in the Web Components and in Angular templates.

## Styling ("Aurora" design)

The look is an indigo → violet gradient accent (`--ui-gradient`) on slate neutrals, with soft layered shadows, rounded corners, a glowing focus ring on every interactive element, and short entrance/hover animations. Keep new components consistent with this:

- Dark mode is `data-theme="dark"` on `<html>` (theme.css overrides the neutral tokens, shadows and tones); `--ui-primary-soft` and `--ui-primary-ring` are derived from `--ui-primary`, so components must use the variables for both modes and every theme color to work.
- Use theme variables, not hex values. Colors: `--ui-primary`, `--ui-primary-hover`, `--ui-accent`, `--ui-gradient`, `--ui-primary-soft`, `--ui-text`, `--ui-text-muted`, `--ui-text-subtle`, `--ui-border`, `--ui-border-strong`, `--ui-surface`, `--ui-surface-muted`, `--ui-surface-sunken`, `--ui-success`, `--ui-warning`, `--ui-danger`. Shape and motion: `--ui-radius-sm`, `--ui-radius`, `--ui-radius-lg`, `--ui-shadow-sm`, `--ui-shadow`, `--ui-shadow-lg`, `--ui-ring`, `--ui-ease`, `--ui-font`.
- Selected/active states use `background: var(--ui-gradient)` with white text. Hover changes color, background, border or shadow only (e.g. `--ui-primary-soft`). Never move elements on hover (no `translateY` lift). `:focus-visible` uses `box-shadow: var(--ui-ring)`.
- Alert and Toast show a round tone icon: `<span class="ui-tone-icon">{{ icons[type()] }}</span>` with `TONE_ICONS`.
- Color variants: add the class `tone-<tone>` and read `--tone-bg`, `--tone-fg`, `--tone-border`, `--tone-solid`. Type the input as `Tone` from `utils/types.ts` (`info | success | warning | danger | neutral`).
- Appearance classes (theme.css) work on every component: `np-color-<primary|secondary|success|info|warning|danger|help|contrast>`
  overrides `--ui-primary`/`--ui-accent` (and re-declares `--ui-gradient`, `--ui-primary-soft`, the ring, which are
  computed where declared) and `np-shape-<pill|rounded|square>` overrides `--ui-radius-sm/-/-lg/-full`. So components
  must take colors and radii from the tokens: fully round parts use `var(--ui-radius-full)`, never `999px`.
- Button (`np-button`) has `severity` (BUTTON_SEVERITIES), `variant` solid | outlined | text | soft, `shape` pill |
  rounded | square, `icon` + `iconPos`, `loading`, `disabled`; each severity sets `--btn`/`--btn-fg` in button.css.
- Form fields: wrap in `.ui-field`, with `.ui-label`, `.ui-control` (on input/select/textarea), `.ui-hint` and `.ui-error`. `aria-invalid="true"` on a `.ui-control` gives it a red border.
- Buttons inside components use the shared `.ui-btn` classes: `.ui-btn--primary` (gradient), `--danger`, `--text` (combine with `--danger` for red text), `--sm`, `--icon`. Don't write component-local button CSS.
- Close buttons use `.ui-close`. Screen-reader-only text uses `.ui-visually-hidden`.
- The theme is global, so component CSS can use these classes despite view encapsulation.

## Icons

- Users add their own `.svg` files to `src/stories/icons/svg/`. `<np-icon name="x" />` (`components/media/icon/`) fetches `icons/x.svg` at runtime, caches it, and inlines it so `currentColor` works.
- The folder is served at `/icons` by Storybook (`staticDirs` in `.storybook/main.ts`) and by the app build (`assets` in `angular.json`). Keep both in sync with `ICONS_URL` in `icon.component.ts`.
- The folder ships with all Lucide icons (`LICENSE-lucide.txt`, search keywords in `tags.json`). The **Icons** page reads every `.svg` with `import.meta.glob(..., { query: '?raw' })` in `icons/icons-data.ts`, so new files need no code changes. The site's router gives it to the page (route resolvers), so it stays out of the Controls panel.
- `http://localhost:6006/` opens the Welcome page (`getting-started-welcome--welcome`; Storybook would pick Icons) and keeps its URL as plain `/` (short page URLs in manager.ts).
- Sidebar order is set in `.storybook/preview.ts` (`storySort`): Getting Started, Components, Icons, Animations, Onboarding (Tour, Checklist), NexLottie, Effects, Text Editor. Root pages, the Onboarding and Effects groups and Text Editor are moved below Components with CSS `order` in manager-head.html.
- Icon styles: `variant` = `outline` (default) | `duotone` (closed shapes tinted, marked by `markClosedShapes()`) | `gradient` (stroke uses a shared `#np-icon-gradient` added to the page once) | `soft` / `solid` (rounded tile filling `size`; on `solid` a `style="color"` becomes the tile color and the icon stays white). They work on any outline icon, so new `.svg` files get them too. The Icons page renders `<np-icon [svg]>` and writes variants out as plain SVG for Copy SVG / Download.
- `IconComponent` uses `ViewEncapsulation.None` to style the inlined `<svg>`, so scope its CSS under `.np-icon`.

## Animations

- `src/stories/styles/animations.css` (imported by theme.css, so global) defines `np-anim-<name>` classes for any element, tuned with `--np-anim-duration`, `--np-anim-delay`, `--np-anim-ease`, `--np-anim-repeat`. A shared `[class*='np-anim-']` rule sets the defaults; each class sets `animation-name` (loop classes use the full shorthand with `infinite`). `prefers-reduced-motion` turns them off.
- Categories are the `/* === Name === */` comments (Entrance, Attention, Loop, Exit). The **Animations** page (`animations/animations-data.ts`) imports the file with `?raw` and `parseAnimations()` builds the list and each card's standalone CSS, so a new class plus its `@keyframes nex-<name>` needs no other changes.

## Web Components (React, Vue, plain HTML)

- `npm run build:elements` builds `src/elements/nexprime.ts` with Angular Elements. Every component is registered under its Angular selector (`np-<name>`). Components render `np-*` tags inside themselves too; Angular creates those (they carry `__ngContext__`), so the registered element skips its own start-up for them (`ownedByAngular()` in nexprime.ts) and nothing runs twice.
- Outputs are DOM events (`event.detail`). camelCase outputs are also dispatched in kebab-case (`valueChange` and `value-change`) for Vue. Arrays, objects and functions must be set as properties.
- Features that need `<ng-template>` or services have Web Component alternatives: Carousel uses its child elements as slides when there's no template, and `window.NexPrime.confirm()` wraps ConfirmationService. Icons load from `window.NEXPRIME_ICONS_URL` (default `icons/`).
- The docs pages are `src/stories/getting-started/Installation.mdx` and `Configuration.mdx` (Getting Started). Storybook MDX has no GitHub table syntax, so write tables as HTML.
- Docs code blocks (MDX and "Show code") are dark (`#1e293b`) with a copy icon that shows on hover (docs-theme.css);
  preview-head.html turns it into a check after copying.

## Lottie

- `np-lottie` (`components/media/lottie/`) plays Lottie animations as SVG with lottie-web's light build, imported on first use and only in the browser (SSR-safe). `src` takes a `.json` or `.lottie` URL (`.lottie` is unzipped with fflate, and its images are inlined). `data` takes a parsed object. `hover` plays only while hovered, `paused` holds the current frame (the NexLottie page pauses its grid while the dialog is open). `loadLottie(url)` reads either format into JSON. With reduced motion it shows the last frame still.
- `src/stories/nexlottie/files/*.json` is served at `/lottie` (Storybook `staticDirs`, and `assets` in the app and elements builds). The starter set is generated by our own script (no third-party artwork). `meta.cat` sets the category and `meta.bg` the card background on the NexLottie page, which reads the folder with `import.meta.glob` (`nexlottie/lottie-data.ts`), so new files need no code changes. LottieFiles downloads work as-is and land in the "Other" category.
- The NexLottie story sets `name: 'NexLottie'` so it shows as a single sidebar page (the story ID is `nexlottie--nex-lottie`).
- Clicking a card opens `lottie-detail` (a `np-dialog`, LottieFiles-style): preview with play/speed/background, tabs Download (dotLottie / JSON, plain and optimized, with real sizes) | Asset & Embed | Details, and related animations.
  "Other export formats" are built in the browser by `lottie-export.ts`: MP4/WebM/MOV via WebCodecs (`mediabunny`), GIF via `gifenc` (types in `gifenc.d.ts`), SVG/PNG from the frame on screen. Both packages are devDependencies, imported on click. Frames come from lottie-web's canvas renderer, which must be loaded **without** a `container` or it draws nothing offscreen.

## Site (Welcome, Components, Icons, Animations, NexLottie, About, Contact, Privacy, Terms)

- About (`getting-started/about/`), Contact (`contact/`: an np-form that opens a mailto: link, the site has no backend)
  and Privacy / Terms (`legal/`: one LegalComponent, `doc` set by route data, text in `legal-data.ts`) are site pages
  with hidden stories (`!dev`) at /about, /contact, /privacy, /terms. They're wrapped in `np-site-page` (`site-page/`: hero
  with `heading`/`intro`/`note`, projected content, footer; `.site-card` and `.site-icon` in gallery-page.css). They and Welcome end with `np-site-footer`
  (`getting-started/site-footer/`); contact details and the creators (LinkedIn URLs) are CONTACT and AUTHORS in landing.ts.

- The site's pages are one Angular app, `np-site` (`getting-started/site/`): the site search plus `<router-outlet>` (the top bar is Storybook's, see manager.ts), with
  Angular Router routes in `site.routes.ts` whose paths are the pages' short URLs. Links between them switch instantly,
  without Storybook loading a story.
- Each page keeps its own story (sidebar entry and URL: `/`, `/components-overview`, `/icons`, `/animations`,
  `/nexlottie`, `/effects-overview`); the story spreads `SITE_STORY` (`site-story.ts`) and sets its page in `args: { page }`. `title` and
  `tags: ['np-landing']` stay literal in each story file, since Storybook's indexer reads them statically.
- The router keeps its URL in the preview iframe's hash (`withHashLocation`), so Back/Forward go through the browser's
  history. Its TitleStrategy emits `SITE_ROUTE` ({ page, title }); manager.ts shows that page's short URL and title.
- Page links stay `managerHref()` anchors with `target="_top"`: the site routes its own pages (`SITE_PAGES`), and
  preview.ts opens the others in Storybook (SELECT_STORY). Both use `clickedPage()`, so new-tab clicks keep the link.
- Site search (`getting-started/site-search/`, in np-site, opened by the top bar's search button; Ctrl/⌘ K or /): a modal `<dialog>` over pages,
  components and their stories (index.json, sidebar entries only), icons (with tags.json keywords), animations and
  Lottie files, loaded on first open. Site pages open in the router with `?q=` (the galleries' `q` input pre-fills
  their search via withComponentInputBinding; the URL sent to the manager drops the query); other pages via SELECT_STORY.
- The galleries' data is in `icons/icons-data.ts`, `animations/animations-data.ts` and `nexlottie/lottie-data.ts`,
  given to the pages by route resolvers. preview.ts preloads it after the first page renders (`preloadSiteData()`).
- Long grids (Icons, NexLottie) render in batches as they're scrolled with `renderInBatches()` (`utils/render-in-batches.ts`).
  `np-lottie` pauses while off screen. Storybook's `highlight` feature is off in main.ts: it read every element's
  computed style on each page change.

## Shared patterns

- Menus (Menu, Menubar, MegaMenu, PanelMenu, TieredMenu) take `[model]="MenuItem[]"` from `utils/types.ts`: `icon` is an icon file name, `command` runs on click, plus `url`, `items`, `separator`, `disabled`, `badge`. Popup menus expose `toggle(event)`, `show(event)`, `hide()`.
- Drag and drop uses `@angular/cdk/drag-drop` (PickList). Style CDK states (`.cdk-drag-preview`, `.cdk-drag-placeholder`, `.cdk-drop-list-dragging`) in the component CSS. The preview is a clone of the item, so component styles still apply.
- Badge is a standalone label; Overlay Badge (`<np-overlay-badge [value]="6">…</np-overlay-badge>`) wraps content and puts a count or dot on its corner.
- Footer slots (`<div dialogFooter>`, `<div modalFooter>`, `<div cardFooter>`) get `display: contents` from theme.css, so the component's footer lays out the buttons with its gap. Card's `footerAlign="stretch"` uses a grid to make them equal width.
- Tree and TreeTable take `TreeNode[]` from `utils/types.ts` (`key` is required and must be unique). Both have
  `selectionMode` single | checkbox (tri-state; `[(selection)]` is `TreeNode | TreeNode[] | null`), a filter and
  `expandAll()`/`collapseAll()`. Tree: `variant` (TREE_VARIANTS: default | lines | soft | cards | compact | glass),
  `highlight`, `showCounts`, `controls`; per-node `data.badge` and `data.description`; indent from `--level`.
  TreeTable: `variant` (TREE_TABLE_VARIANTS: default | striped | bordered | lines | minimal | glass), `size`,
  `scrollHeight` (sticky header), columns with `align` and `width`.
- Table (`np-table`): `variant` (TABLE_VARIANTS: default | striped | bordered | minimal | cards | glass), `size`,
  `scrollHeight` (sticky header), `selectable` + `[(selection)]` (rows matched by reference), `loading` (skeleton
  rows), `rows` (pages with an internal np-pagination; the page resets when the filtered rows change); columns take
  `align`, `tones` (value → Tone status pill) and `image` (avatar). Variants only set `--tbl-*` variables.
- Pagination (`np-pagination`): `variant` (PAGINATION_VARIANTS: default | outlined | soft | glass | minimal | dots),
  `size`, `totalRecords` + `[(rows)]`, `rowsOptions`, `showSummary`, `showFirstLast`, `showJump`, arrow keys.
- Pick List: `variant` (PICK_LIST_VARIANTS: default | cards | compact | glass | minimal), `optionIcon`,
  `optionDescription`, `targetLimit`. Timeline: `variant` (TIMELINE_VARIANTS: default | cards | outlined | gradient |
  compact), `activeIndex` (done / active with a pulse / pending), `dateOpposite`, event `tag`, `lineColor` (a
  tone or any CSS color, as `--tl-c` on the root; line and markers fall back to the border / brand gradient).
- ConfirmDialog and ConfirmPopup share `ConfirmationService` (`components/overlay/confirm-dialog/confirmation.service.ts`, `providedIn: 'root'`). Call `confirm({ message, header, accept, reject })`. Pass `target: event.currentTarget` for the popup; confirms without a target open the dialog.
- Anchored overlays (OverlayPanel, ConfirmPopup) and popup menus share `src/stories/utils/anchor-position.ts`.
  Floating panels (Select, OverlayPanel, ConfirmPopup, popup Menu / TieredMenu) render as `popover="manual"` and call
  `showPopover()` before measuring (menus: `[npMenuPopover]` in menu-item.component.ts): the top layer can't be moved
  by Storybook's transformed docs blocks or clipped by `overflow: hidden`. Their CSS undoes the popover defaults
  (`inset: auto; margin: 0; overflow: visible; color`).
- Panel / overlay / menu looks (each a `*_VARIANTS` const): Accordion (`[(expanded)]`, `toggleIcon`, `iconPos`, item
  `icon`/`subtitle`/`disabled`, height animates via grid rows), Card (`horizontal`, `overlay`, `badge`, `href` /
  `clickable` + `cardClick`, `loading`), Inplace (`editable` + `[(value)]`, `icon`), Dialog (`tone`, `icon`, `subtitle`,
  `draggable`, `blockScroll`), Modal (`size`, `closeOnBackdrop`, `closeOnEscape`, `[modalFooter]`), ConfirmDialog
  (`variant`; confirm options `tone`, `confirmText` = type to confirm), OverlayPanel (`header`, `icon`, `[panelFooter]`,
  `width`, `closeOnEscape`), ConfirmPopup (`tone`, `acceptLabel`, `rejectLabel`), Tooltip (`tone`, `heading`,
  `shortcut`, `arrow`, `showDelay`/`hideDelay` in CSS), Breadcrumb (`separator` chevron|arrow|slash|dot, `home`,
  `maxItems`), Menubar (`sticky`, `[(current)]`), MegaMenu (`stretch`, item `featured` promo card), Menu and TieredMenu
  (shared MENU_VARIANTS via `.mi-look-*` in menu-item.css, `shortcuts` shows badges as kbd, Menu `[menuHeader]` /
  `[menuFooter]`, TieredMenu `trigger` hover | click), PanelMenu (`[(collapsed)]` icon rail, `[(selected)]`).
- All menus render rows with the internal `np-menu-item` (`components/menu/menu-item/`, global CSS, tuned per menu via `--mi-*` variables). Its story is hidden from the sidebar with `tags: ['!dev']`.
- ConfirmDialog renders `<np-dialog>` internally; its No/Yes are `.ui-btn--text` (Yes turns red with `acceptTone: 'danger'`).
- `*-demo.component.ts` files (confirm-dialog, overlay-panel) are story-only helpers for examples that need injected services or icon buttons. They are not part of the library.
- Chart (`np-chart`) is dependency-free SVG: `type` line | area | bar (`stacked`) | pie | doughnut, `labels` + `datasets: ChartDataset[]`. Series colors are the theme's `--ui-chart-1…8` (validated for color-blind separation; keep that order, don't add a 9th). It follows the data-viz rules: bars ≤ 24px with 2px gaps and 4px rounded tops, 2px lines, a legend only for 2+ series, a hover tooltip, and a visually hidden data table. SVG colors are set with `[style.fill]`/`[style.stroke]` because presentation attributes can't use `var()`.
  More types: radar, radial (progress rings), gauge (first value; both use `max`) and sparkline (no axes, own range);
  `gradient` (fades fills), `showValues` (bar labels; stacked shows totals), `animate` (draw-in, off with reduced motion).
  New types reuse the scales, tooltip, legend and hidden table.
- Carousel (`np-carousel`) renders a projected `<ng-template let-item let-i="index">` per item; `numVisible`, `numScroll`, `circular`, `autoplayInterval` (pauses on hover/focus; the countdown restarts on every page change), `[(page)]`, arrow keys and swipe.
  `variant` (CAROUSEL_VARIANTS: default | peek | coverflow (each slide gets `--offset`) | fade | glass), `indicator`
  (CAROUSEL_INDICATORS: dots | bars (fills over the autoplay interval) | numbers | progress), `vertical` + `height`.
  Slides are sized by `.carousel__track > ::ng-deep *` so the Web Component's child-element slides get the variants too.
- Form (`np-form`) builds a validated form from `fields: FormField[]` (or multi-step `steps: FormStep[]`) and reuses the input components. Extra field types (rating, chips, multichips, cards, segmented, choice, color) render as `.option` buttons. It has an optional header (`title`, `subtitle`, `icon`, `tone`), `card`, `layout="inline"`, `loading`, and a success view (`successTitle`). Extra content goes in `[formBeforeActions]` (above the buttons) or the default slot (below the form). A field's `match` names another field it must equal (confirm password). The Form stories double as ready-made templates, with the account forms first in flow order (Login, Sign up, Forgot password, Reset password, then Contact, Feedback, Survey, Newsletter, Bug report, Feature request, Onboarding).
- Chat (`np-chat`) appends what the user sends to `[(messages)]` (`ChatMessage[]`) and emits `send`; the consumer appends the replies. Voice Chat (`np-voice-chat`) reuses `ChatMessage`: its mic goes idle → listening → processing → speaking with the Web Speech API (a text box when recognition isn't available), emits `utterance`, and speaks the next `them` message.
- Helpful (`np-helpful`) is the "Was this helpful?" vote widget: `variant`, `mode` thumbs | emoji | stars with
  `[(rating)]` + `rated`, `followUp` comment box (`commented`), `thanks`.
- Feedback / media / misc looks (each a `*_VARIANTS` const): Alert (`icon`, `compact`, `closable`, `[alertActions]`),
  Toast (TOAST_POSITIONS adds top-/bottom-center, `title`, `action` + `actionClick`, `pauseOnHover`, `swipeable`),
  Progress Bar (looks are `look` / PROGRESS_BAR_VARIANTS because `variant` was already its tone; `circular` ring,
  `indeterminate`, `buffer`, `segments`, `labelPosition`, `size`), Skeleton (`preset` text | avatar | list | card |
  table, `lines`, `columns`, `duration`), Tag (`size`, `count`, `removable` + `remove`), Avatar (`icon`, `more` +N,
  `stacked` overlap, status `busy`), Overlay Badge (`pulse`, `icon`, `circular`), Lottie (`direction` forward | reverse
  | bounce, `controls` bar, `seek()`, `loopComplete`; the per-frame listener exists only with `controls`), Chat
  (`suggestions`, `reactions` + `react` via a popover="auto" picker, `dateSeparators`), Voice Chat (`mode` toggle |
  push, `caption`, `muteButton` + `[(muted)]`), Animate On Scroll (blur-in, blur-up, tilt, `stagger`, `scrub` via
  animation-timeline: view()), Header (`brand`, `links`, `[(active)]`, `sticky`, `avatar`), Scroll Top (`label`,
  `percent`, `smart`).
- Calendar (`np-calendar`) styles and extras: `variant` default | gradient (header on a gradient band) | glass (frosted)
  | minimal (CALENDAR_VARIANTS); `presets` (`CalendarPreset[]`, values or functions evaluated on click; RANGE_PRESETS
  ships Today … Last month) in a side list, the matching one highlighted; `marks` (`CalendarMark[]`: event dots, up
  to 3 per day, labels added to the day's aria-label); `showWeekNumbers` (ISO week from each row's Thursday).
- Stepper (`np-stepper`): `steps` are labels or `StepItem` ({ label, description, icon, error }); `variant` circles
  (default) | progress | dots | arrows | cards (STEPPER_VARIANTS), `vertical` (circles, dots, cards), `clickable` +
  `linear` (only finished steps) with `stepClick` and `[(activeStep)]` (a linkedSignal follows the input). Connectors
  fill via `--fill` (the gradient's background-size), so one rule covers horizontal and vertical.
- Tabs (`np-tabs`): `variant` pill (default) | underline | boxed | solid | minimal (TAB_VARIANTS), `vertical`, `stretch`;
  a `Tab` can have `icon`, `badge` and `disabled`. Arrow keys (Up/Down when vertical), Home and End move between the
  enabled tabs (roving tabindex, aria-controls/labelledby ids).
- Select (`np-select`) is a custom listbox, not a native `<select>`: a `.ui-control` button (role combobox) opens a
  `position: fixed` panel measured from the trigger (opens upwards without room; closes on outside click, scroll and
  resize). The panel is a `popover="manual"` (top layer, so
  Storybook's transformed docs blocks and overflow: hidden can't clip it). Options take `icon`, `image` (avatar), `color`
  (swatch), `group` (heading), `description`, `disabled`; `filter` adds a search box; `multiple` + `[(values)]`
  (checkboxes, chips in the trigger); `layout` list | grid (SELECT_LAYOUTS). Keys: arrows, Home/End,
  Enter/Space, Escape, type-ahead.
- Chip (`np-chip`): `variant` default | soft | outlined | solid | gradient | glass | dot (CHIP_VARIANTS), `tone`, `size`,
  `count`, `selectable` + `[(selected)]` (a transparent toggle button laid over the chip; the remove button sits above it).
- Checkbox (`np-checkbox`): `variant` default | circle | card | chip | todo (CHECKBOX_VARIANTS), `[(indeterminate)]`,
  `description`, `icon` (card, chip), `size`, `invalid`. The check is an SVG path drawn in with `pathLength="1"`.
- Rating (`np-rating`): `variant` star | heart | emoji | number | bar (RATING_VARIANTS); star/heart are SVG shapes with
  a clipped filled copy, so `allowHalf` can fill half. `labels`, `showValue`, `clearable`, arrow keys (roving tabindex).
- Input OTP: `variant` box | underline | filled | circle | connected (OTP_VARIANTS), `placeholder`, `success`,
  `resendSeconds` + `resend` (countdown started in afterNextRender). Input Number: `buttonLayout` stacked | inline |
  horizontal | split | vertical (INPUT_NUMBER_LAYOUTS), field `variant`, `icon`, `meter` (needs min and max).
- Form: `variant` default | glass | gradient | accent | glow (FORM_VARIANTS; all but default are cards), `fieldVariant`
  (passed to text, select, textarea, number), `progress` bars | stepper (np-stepper), field `icon`, option `icon`, and the
  field types `number` (min/max/step), `otp` (length) and `emoji` (option labels name the faces).
- Onboarding lives in its own sidebar group (titles `Onboarding/Tour`, `Onboarding/Checklist`) instead of `Components/`. `np-onboarding` is a tour over `steps` (CSS selectors) with `mode` spotlight | beacon | welcome and `theme` light | dark | gradient | glass. Use `start(step?)`, or `autoStart` + `storageKey` to show it once. `np-onboarding-checklist` emits `showMe(task)` so the app can start a tour step. Tour stories use `docs.story.inline: false`, so each auto-starting tour runs in its own frame.
- Scroll Top (`np-scroll-top`) is fixed to the page corner by default. With `[target]` set to a scrolling element, place it as that element's last child: it sticks to the element's bottom edge.
- Effects (`src/stories/effects/`, sidebar Effects ▸ …) wrap projected content and paint behind it (Confetti and Cursor Trail paint over it, with `.np-effect__canvas--front`, and Grain lays its texture over it); give them a height and a background. Hosts use the global `.np-effect` and `.np-effect__content` classes from theme.css.
  Canvas effects extend `CanvasEffect` (`effects/canvas-effect.ts`, a `@Directive` that also adds the `np-effect` host class) and implement `seed()` (state for the current size), `step(dt)` and `draw(ctx)`, plus optional `active()` (Confetti, Cursor Trail and Dot Grid return false when idle, so no loop runs) and `onPointerMove`/`onPointerDown`/`onPointerLeave`. Inputs read in `seed()` reseed and inputs read in `draw()` repaint automatically, so don't add effects for that. The base handles canvas size and DPR and the pointer, and runs requestAnimationFrame only while on screen, in a visible tab, without reduced motion (a still frame instead) and while `active()`; it starts in `afterNextRender`, so effects are SSR-safe. Colors: `textColor()` and `palette(colors, vars)` read theme variables through a cache that's refreshed on resize (no `getComputedStyle` per frame). Batch canvas drawing into a few paths (opacity or depth steps) rather than one stroke per item.
  Meteors, Fireflies, Snow, Bubbles, Flickering Grid and Dot Wave (a 3D dot surface in perspective) and Dot Ribbon (a twisting
  3D band of dots) are canvas effects. Retro Grid (tilted grid in perspective),
  Border Beam (a beam along the host's rounded border via `offset-path`; wrap a card), Ripple (pulsing rings), Light Rays
  (blurred swaying bars) and Grain (SVG noise tile, drawn over the content) are pure CSS with no listeners.
  Spotlight and Aurora are pure CSS; their pointer listeners are plain `addEventListener` calls in `afterNextRender`, so pointer moves don't run change detection. Confetti's `fire(x?, y?)` bursts from code (`trigger="manual"`). Stories build their template with `demo(tag, { height, background, content })` from `effects/effect-story.ts`.
- Particles (`np-particles`): dots joined by lines within `linkDistance`, `count` per 1000×600 px (so density is size-independent), a pointer `interaction` grab (lines to the cursor) | repulse | attract | none, and `pushOnClick` adds dots. Without `color` it uses the text color (`--ui-primary` by default).
- Text Editor (`np-text-editor`, `src/stories/text-editor/`, title `Components/Form/Text Editor`; the sidebar's
  `Text Editor` entry is the site page in `page/`): Quill 2, imported in
  afterNextRender (SSR-safe; Quill reads `navigator` at import), with its own Parchment registry (only the formats
  it uses; align as a style, so the HTML needs no Quill CSS). Its own toolbar (role="toolbar", roving tabindex,
  `tools` subset), color palette as `popover="auto"`, link bar (Ctrl/⌘ K). The value is HTML from
  getSemanticHTML() (Quill 2.0's &nbsp; for every space is undone), `''` when empty. It's the library's only
  ControlValueAccessor (formControlName, ngModel), so the package peers on @angular/forms; `quill` is a package
  dependency. ViewEncapsulation.None (Quill builds the editing area), so its CSS is scoped under `.np-text-editor`.
  Tab leaves the editor (Quill's Tab bindings are cleared). `variant` default | document (a wide surface with a centered text column, `zoom`);
  `[editorToolbarStart]` / `[editorToolbarEnd]` project extra toolbar controls (class `te__tool`, `data-tool` joins
  the toolbar's arrow keys; the roving tabindex is set on the DOM, so projected controls take part). `theme` light | dark re-declares the neutral tokens.
  Also: font size (px, a style), indent (3 levels, class ql-indent-N; lists nest in the HTML), alignment and color
  menus, tables (Quill's table module; size picker, row/column menu; cells get inline borders in the HTML), find &
  replace (Ctrl/⌘ F, CSS Custom Highlight API), markdown and typography shortcuts (text-editor-quill.ts; Enter
  shortcuts go before Quill's own Enter handler), `showCount` / `maxLength`. Two stylesheets, each under the 10 kB
  budget: text-editor.css (frame, toolbar, menus) and text-editor-content.css (the content's look).
  Unit tests: `text-editor.component.spec.ts`.
- AnimateOnScroll is a wrapper component (`<np-animate-on-scroll animation="fade-up">`). Pass `[root]` when content scrolls inside a container instead of the page.

## Stories

```ts
const meta: Meta<FooComponent> = {
  title: 'Components/Form/Foo',
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
- Every component's docs page shows its examples first and the API table (Controls) last (`.storybook/docs-page.ts`).
- Each component's stories end with the appearance examples, built from its main (or a checked/filled) story:
  `const appearance = appearanceStories(meta, Default); export const AppearanceColors = appearance.colors;
  export const AppearanceShapes = appearance.shapes;` (`utils/appearance-stories.ts`: one copy per `np-color-*` /
  `np-shape-*` class). Left out where copies would stack: fixed overlays (Toast, Dialog, Modal, Bottom Sheet, Scroll
  Top), Page, Lottie, the hidden Menu Item, and Button (it has its own Severities/Variants/Shapes stories).

## Adding a component

1. Pick a group and create `src/stories/components/<group>/<name>/` with `<name>.component.ts`, `<name>.html`, `<name>.css` and `<name>.stories.ts`, following the conventions above.
2. Add it to the `components` list in `src/elements/nexprime.ts` (and the element list in `getting-started/Installation.mdx`),
   and export it from `src/public-api.ts` (the npm package).
3. Run `npx ngc -p .storybook/tsconfig.json --noEmit`, then `npm run build-storybook` and `npm run build:elements`.
