// Writes the NexUI site's data for the Angular app to src/app/site-data/ (git-ignored). Storybook reads the same
// folders with import.meta.glob, which the Angular build doesn't have. `npm start` and `npm run build` run it first
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { basename, dirname } from 'node:path';

const stories = 'src/stories';
const out = 'src/app/site-data';
const read = (path) => readFileSync(path, 'utf8');
/** Files in a folder with an extension, sorted by name like the Storybook pages */
const files = (dir, ext) =>
  readdirSync(dir)
    .filter((file) => file.endsWith(ext))
    .sort((a, b) => a.localeCompare(b))
    .map((file) => ({ name: basename(file, ext), path: `${dir}/${file}` }));
const write = (name, data) => writeFileSync(`${out}/${name}.json`, JSON.stringify(data));

mkdirSync(out, { recursive: true });

write('icons', {
  icons: files(`${stories}/icons/svg`, '.svg').map(({ name, path }) => ({ name, svg: read(path) })),
  tags: JSON.parse(read(`${stories}/icons/svg/tags.json`)),
});

write('animations', { css: read(`${stories}/styles/animations.css`) });

// Lottie data stays a string, so TypeScript doesn't infer a type for 3 MB of JSON
write(
  'lottie',
  files(`${stories}/nexlottie/files`, '.json').map(({ name, path }) => ({
    name,
    data: read(path),
  })),
);

// The components the sidebar lists: Components/<Group>/<Name> titles, except stories tagged '!dev'
const components = [];
for (const file of readdirSync(`${stories}/components`, { recursive: true })) {
  if (!file.endsWith('.stories.ts')) continue;
  const source = read(`${stories}/components/${file}`);
  const title = source.match(/title: '(Components\/[^/']+\/[^']+)'/)?.[1];
  if (title && !/tags: \[[^\]]*'!dev'/.test(source))
    components.push({ title, folder: basename(dirname(file)) });
}
write('components', components);
