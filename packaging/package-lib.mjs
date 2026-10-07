/**
 * Adds the framework-independent parts to the npm package after `ng build nexprime-lib` (dist/nexprime-lib):
 * elements/ (the Web Components bundle from `npm run build:elements`, without its icons and lottie copies, which the
 * package already has at the top level) and react/ (the NexPrime wrapper), plus their typings from packaging/.
 */
import { cpSync, existsSync } from 'node:fs';
import { basename } from 'node:path';
import './build-icons.mjs';

const lib = 'dist/nexprime-lib';
const elements = 'dist/nexprime-elements/browser';
if (!existsSync(`${elements}/nexprime.js`)) throw new Error(`${elements}/nexprime.js is missing: run npm run build:elements`);

cpSync(elements, `${lib}/elements`, {
  recursive: true,
  filter: (path) => path === elements || !['icons', 'lottie'].includes(basename(path)),
});
cpSync('packaging/elements', `${lib}/elements`, { recursive: true });
cpSync('packaging/react', `${lib}/react`, { recursive: true });
console.log(`Added elements/ and react/ to ${lib}`);
