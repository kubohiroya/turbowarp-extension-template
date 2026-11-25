import {defineConfig} from 'vite';
import {createHash, randomUUID} from 'node:crypto';
import {rename, rm, writeFile} from 'node:fs/promises';
import path from 'node:path';
import {extensionManifestPlugin} from '@kubohiroya/turbowarp-extension-manifest';
import {turboWarpExtension} from '@kubohiroya/vite-plugin-turbowarp-extension';
import definitions from './src/block-definitions.json' with {type: 'json'};
import {extensionConfig} from './src/config.js';

const bundleFile = `${extensionConfig.slug}.js`;
const apiFile = 'extension-manifest.json';

export default defineConfig({
  plugins: [
    turboWarpExtension({
      id: extensionConfig.id,
      name: extensionConfig.name,
      description: extensionConfig.description,
      author: extensionConfig.author,
      license: extensionConfig.license,
      fileName: bundleFile
    }),
    extensionManifestPlugin({
      id: extensionConfig.id,
      definitions
    }),
    {
      name: 'turbowarp-development-descriptor',
      writeBundle: {
        order: 'post',
        sequential: true,
        async handler(output, written) {
          const directory = output.dir ?? (output.file ? path.dirname(output.file) : undefined);
          if (directory === undefined) throw new Error('Missing extension output directory');
          const artifact = (file: string) => {
            const entry = written[file];
            if (!entry) throw new Error(`Missing development artifact ${file}`);
            return {file, sha256: createHash('sha256').update(entry.type === 'chunk' ? entry.code : entry.source).digest('hex')};
          };
          const [bundle, api] = [artifact(bundleFile), artifact(apiFile)];
          const descriptor = path.join(directory, 'extension-development.json');
          const temporary = `${descriptor}.${randomUUID()}.tmp`;
          try {
            await writeFile(temporary, JSON.stringify({formatVersion: 1, id: extensionConfig.id, bundle, api}) + '\n', {flag: 'wx'});
            await rename(temporary, descriptor);
          } finally {
            await rm(temporary, {force: true});
          }
        }
      }
    }
  ]
});
