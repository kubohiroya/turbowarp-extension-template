import {defineConfig} from 'vite';
import {isDeepStrictEqual} from 'node:util';
import {fileURLToPath} from 'node:url';
import {createHash, randomUUID} from 'node:crypto';
import {readFile, rename, rm, writeFile} from 'node:fs/promises';
import path from 'node:path';
import {API_MANIFEST, DISTRIBUTION_DESCRIPTOR, createExtensionDistribution} from '@kubohiroya/turbowarp-extension-manifest/distribution';
import {extensionManifestPlugin} from '@kubohiroya/turbowarp-extension-manifest';
import {turboWarpExtension} from '@kubohiroya/vite-plugin-turbowarp-extension';
import packageMetadata from './package.json' with {type: 'json'};
import definitions from './src/block-definitions.json' with {type: 'json'};
import {extensionConfig} from './src/config.js';

const root = fileURLToPath(new URL('.', import.meta.url));
const projectSource = /^src\/(?:[\p{L}\p{M}\p{N}_-][\p{L}\p{M}\p{N}_. -]*\/)*[\p{L}\p{M}\p{N}_-][\p{L}\p{M}\p{N}_. -]*\.(?:[cm]?[jt]s|[jt]sx)$/iu;
const bundleFile = `${extensionConfig.slug}.js`;
const buildMetadata = [
  ['package.json', packageMetadata],
  ['src/extension-config.json', extensionConfig],
  ['src/block-definitions.json', definitions]
] as const;

async function verifyBuildMetadata() {
  for (const [file, expected] of buildMetadata) {
    const current = JSON.parse(await readFile(new URL(file, import.meta.url), 'utf8'));
    if (!isDeepStrictEqual(current, expected)) {
      throw new Error(`Build metadata changed in ${file}. Restart the build to use the new metadata.`);
    }
  }
}

async function writeDescriptor(directory: string, file: string, descriptor: unknown) {
  const destination = path.join(directory, file);
  const temporary = `${destination}.${randomUUID()}.tmp`;
  try {
    await writeFile(temporary, JSON.stringify(descriptor) + '\n', {flag: 'wx'});
    await rename(temporary, destination);
  } finally {
    await rm(temporary, {force: true});
  }
}

export default defineConfig(({mode}) => ({
  build: {
    sourcemap: mode === 'development' ? 'hidden' : false,
    rollupOptions: {
      output: {
        sourcemapExcludeSources: true,
        sourcemapPathTransform(source, mapFile) {
          const fromRoot = path.relative(root, path.resolve(path.dirname(mapFile), source)).split(path.sep).join('/');
          return projectSource.test(fromRoot) ? fromRoot : '[external]';
        }
      }
    }
  },
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
      async buildStart() {
        for (const [file] of buildMetadata) {
          this.addWatchFile(fileURLToPath(new URL(file, import.meta.url)));
        }
        await verifyBuildMetadata();
      },
      writeBundle: {
        order: 'post',
        sequential: true,
        async handler(output, written) {
          await verifyBuildMetadata();
          const directory = output.dir ?? (output.file ? path.dirname(output.file) : undefined);
          if (directory === undefined) throw new Error('Missing extension output directory');
          const artifactBytes = (file: string) => {
            const entry = written[file];
            if (!entry) throw new Error(`Missing development artifact ${file}`);
            const content = entry.type === 'chunk' ? entry.code : entry.source;
            return typeof content === 'string' ? Buffer.from(content, 'utf8') : Buffer.from(content);
          };
          const distribution = await createExtensionDistribution(packageMetadata, extensionConfig,
            {file: bundleFile, bytes: artifactBytes(bundleFile)}, artifactBytes(API_MANIFEST));
          const {bundle, api} = distribution;
          await writeDescriptor(directory, DISTRIBUTION_DESCRIPTOR, distribution);
          const mapFile = bundle.file + '.map';
          const map = written[mapFile];
          const sourceMap = mode === 'development' && map?.type === 'asset' ?
            {file: mapFile, sha256: createHash('sha256').update(map.source).digest('hex')} : undefined;
          await writeDescriptor(directory, 'extension-development.json', {
            formatVersion: 1, id: extensionConfig.id,
            bundle: {file: bundle.file, sha256: bundle.sha256},
            api: {file: api.file, sha256: api.sha256},
            ...(sourceMap ? {sourceMap} : {})
          });
        }
      }
    }
  ]
}));
