import {defineConfig} from 'vite';
import {createHash, randomUUID} from 'node:crypto';
import {rename, rm, writeFile} from 'node:fs/promises';
import path from 'node:path';
import {API_MANIFEST, DISTRIBUTION_DESCRIPTOR, parseExtensionDistribution} from '@kubohiroya/turbowarp-extension-manifest/distribution';
import {readPackageResourceDeclaration} from '@kubohiroya/turbowarp-extension-manifest/resources';
import {extensionManifestPlugin} from '@kubohiroya/turbowarp-extension-manifest';
import {turboWarpExtension} from '@kubohiroya/vite-plugin-turbowarp-extension';
import packageMetadata from './package.json' with {type: 'json'};
import definitions from './src/block-definitions.json' with {type: 'json'};
import {extensionConfig} from './src/config.js';

const bundleFile = `${extensionConfig.slug}.js`;
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
            const content = entry.type === 'chunk' ? entry.code : entry.source;
            return {file, size: Buffer.byteLength(content), sha256: createHash('sha256').update(content).digest('hex')};
          };
          const [bundle, api] = [artifact(bundleFile), artifact(API_MANIFEST)];
          const distribution = parseExtensionDistribution({
            formatVersion: 1,
            id: extensionConfig.id,
            package: packageMetadata.name,
            version: packageMetadata.version,
            name: extensionConfig.name,
            description: extensionConfig.description,
            license: extensionConfig.license,
            execution: extensionConfig.unsandboxed ? 'unsandboxed' : 'sandboxed',
            resources: readPackageResourceDeclaration(packageMetadata),
            bundle,
            api
          });
          await writeDescriptor(directory, DISTRIBUTION_DESCRIPTOR, distribution);
          await writeDescriptor(directory, 'extension-development.json', {
            formatVersion: 1, id: extensionConfig.id,
            bundle: {file: bundle.file, sha256: bundle.sha256},
            api: {file: api.file, sha256: api.sha256}
          });
        }
      }
    }
  ]
});
