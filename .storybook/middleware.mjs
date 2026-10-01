// Dev server: short page URLs (manager.ts), e.g. /icons or /components-form-button-toggle, are Storybook pages.
// Page loads of one path segment get the Storybook UI, fetched once from "/" (staticDirs like /icons would answer
// a rewritten request first); manager.ts then opens the page. Restart Storybook after editing
let html;

export default function middleware(app) {
  app.use(async (req, res, next) => {
    const path = req.url.split('?')[0];
    if (req.method !== 'GET' || req.headers['sec-fetch-dest'] !== 'document' || !/^\/[\w-]+$/.test(path))
      return next();
    try {
      html ??= fetch(`http://${req.headers.host}/`).then((response) => response.text());
      res.setHeader('Content-Type', 'text/html');
      res.end(await html);
    } catch {
      html = undefined;
      next();
    }
  });
}
