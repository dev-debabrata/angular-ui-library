import fs from 'node:fs';
import path from 'node:path';

const svgDir = 'src/stories/icons/svg';
const icons = [
  ...new Map(
    fs
      .readdirSync(svgDir)
      .filter((f) => f.endsWith('.svg'))
      .map((f) => {
        const name = path.basename(f, '.svg');
        const pascal = name
          .split('-')
          .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
          .join('')
          .replace(/^(\d)/, 'Icon$1');
        return [pascal, name];
      }),
  ).entries(),
].sort(([a], [b]) => a.localeCompare(b));

fs.writeFileSync(
  'packaging/react/icons.js',
  `'use client';\nimport { createIcon } from './index.js';\n\n${icons.map(([p, n]) => `export const ${p} = createIcon('${n}');`).join('\n')}\n`,
);

fs.writeFileSync(
  'packaging/react/icons.d.ts',
  `import type { NexPrimeIcon } from './index';\n\n${icons.map(([p]) => `export const ${p}: NexPrimeIcon;`).join('\n')}\n`,
);

fs.writeFileSync(
  'packaging/vue/icons.js',
  `import { createIcon } from './index.js';\n\n${icons.map(([p, n]) => `export const ${p} = createIcon('${n}');`).join('\n')}\n`,
);

fs.writeFileSync(
  'packaging/vue/icons.d.ts',
  `import type { NexPrimeIcon } from './index';\n\n${icons.map(([p]) => `export const ${p}: NexPrimeIcon;`).join('\n')}\n`,
);
