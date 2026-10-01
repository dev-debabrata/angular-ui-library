import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { chromium } from 'playwright';
const types = {
  js: 'text/javascript',
  mjs: 'text/javascript',
  css: 'text/css',
  svg: 'image/svg+xml',
  html: 'text/html',
  json: 'application/json',
  woff2: 'font/woff2',
};
const server = createServer(async (req, res) => {
  let path = decodeURIComponent(req.url.split('?')[0]);
  if (path.endsWith('/')) path += 'index.html';
  if (!path.includes('.')) path = '/index.html';
  try {
    const body = await readFile('storybook-static' + path);
    res.setHeader('content-type', types[path.split('.').pop()] ?? 'application/octet-stream');
    res.end(body);
  } catch {
    res.statusCode = 404;
    res.end();
  }
}).listen(4400);
const b = await chromium.launch({ channel: 'chrome' });
const ctx = await b.newContext({ viewport: { width: 1400, height: 900 } });
await ctx.route(/^http:\/\/localhost:(4200|6006)\//, async (route) => {
  const url = route.request().url().replace(':4200/', ':4100/').replace(':6006/', ':4400/');
  route.fulfill({ response: await route.fetch({ url }) });
});
const pg = await ctx.newPage();
const errors = [];
pg.on(
  'console',
  (m) => (m.type() === 'error' || m.type() === 'warning') && errors.push(m.text().slice(0, 300)),
);
pg.on('pageerror', (e) => errors.push('PAGEERROR ' + e.message));
const look = () =>
  pg.evaluate(() => [
    document.documentElement.dataset.theme,
    getComputedStyle(document.documentElement).getPropertyValue('--ui-primary').trim(),
  ]);
for (const p of ['', 'components-overview', 'icons', 'animations', 'nexlottie']) {
  await pg.goto('http://localhost:4200/' + p, { waitUntil: 'networkidle' });
  console.log(
    '/' + p,
    await pg.title(),
    await pg.locator('.card, .explore__card').count(),
    'active:',
    await pg
      .locator('nex-landing-nav [aria-current="page"]')
      .first()
      .textContent()
      .catch(() => '-'),
  );
}
await pg.goto('http://localhost:4200/', { waitUntil: 'networkidle' });
await pg.evaluate(() => (window.marker = 1));
await pg.click('nex-landing-nav a[href="./animations"]');
await pg.waitForTimeout(800);
console.log(
  'nav click (no reload):',
  pg.url(),
  await pg.title(),
  await pg.evaluate(() => window.marker),
);
await pg.click('button[aria-label="Switch to dark mode"]');
await pg.click('nex-landing-nav button[aria-label="Theme color"]');
await pg.click('nex-landing-nav [role="menu"] [aria-label="Emerald"]');
console.log('picked:', await look());
await pg.reload({ waitUntil: 'networkidle' });
console.log(
  'after reload:',
  await look(),
  'toggle label:',
  await pg.locator('nex-landing-nav button[aria-label*="mode"]').getAttribute('aria-label'),
);
await pg.goto('http://localhost:4200/components-overview', { waitUntil: 'networkidle' });
await pg.locator('a.card').first().click();
await pg.waitForURL('http://localhost:6006/**');
await pg.waitForLoadState('networkidle');
console.log('storybook from card:', pg.url(), await look());
await pg.locator('[data-item-id="nexlottie--nex-lottie"]').click();
await pg.waitForURL('http://localhost:4200/**');
await pg.waitForLoadState('networkidle');
console.log('back to app:', pg.url(), await look());
console.log('errors', errors);
await b.close();
server.close();
