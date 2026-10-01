import fs from 'node:fs';
import path from 'node:path';

const browserDir = path.resolve('dist/angular-ui-library/browser');
const storybookStaticDir = path.resolve('storybook-static');
const storybookDestDir = path.join(browserDir, 'storybook');

// 1. Ensure index.html exists in browser directory
const csrHtml = path.join(browserDir, 'index.csr.html');
const indexHtml = path.join(browserDir, 'index.html');
if (fs.existsSync(csrHtml)) {
  fs.copyFileSync(csrHtml, indexHtml);
  console.log('✓ Created dist/angular-ui-library/browser/index.html from index.csr.html');
}

// 2. Generate index.html for all SPA routes so direct navigation works cleanly on any static host / CDN
const routes = ['icons', 'animations', 'nexlottie', 'components-overview'];
const sourceHtml = fs.existsSync(indexHtml) ? indexHtml : (fs.existsSync(csrHtml) ? csrHtml : null);

if (sourceHtml) {
  for (const route of routes) {
    const routeDir = path.join(browserDir, route);
    fs.mkdirSync(routeDir, { recursive: true });
    fs.copyFileSync(sourceHtml, path.join(routeDir, 'index.html'));
    console.log(`✓ Created route index.html at browser/${route}/index.html`);
  }
}

// 3. Copy storybook-static to dist/angular-ui-library/browser/storybook
if (fs.existsSync(storybookStaticDir)) {
  fs.cpSync(storybookStaticDir, storybookDestDir, { recursive: true });
  console.log('✓ Synced storybook-static to dist/angular-ui-library/browser/storybook');
}
