import {mkdir, readFile, writeFile} from 'node:fs/promises';
import {build} from 'esbuild';

const configSource = await readFile(new URL('../src/config.ts', import.meta.url), 'utf8');
const value = (key) => configSource.match(new RegExp(`${key}:\\s*'([^']+)'`))?.[1];
const id = value('id');
const slug = value('slug');
const name = value('name');
const description = value('description');
const author = value('author');
const license = value('license');

if (![id, slug, name, description, author, license].every(Boolean)) {
  throw new Error('Could not read required extension metadata from src/config.ts');
}

await mkdir('dist', {recursive: true});
const result = await build({
  entryPoints: ['src/index.ts'],
  bundle: true,
  write: false,
  format: 'iife',
  platform: 'browser',
  target: ['es2020'],
  minify: false,
  legalComments: 'none'
});

const metadata = `// Name: ${name}\n// ID: ${id}\n// Description: ${description}\n// By: ${author}\n// License: ${license}\n\n`;
await writeFile(`dist/${slug}.js`, metadata + result.outputFiles[0].text, 'utf8');
