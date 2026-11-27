import {execFile} from 'node:child_process';
import {createHash} from 'node:crypto';
import {access, mkdtemp, mkdir, readFile, rm, writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {promisify} from 'node:util';
import {runInNewContext} from 'node:vm';
import {createExtensionManifest} from '@kubohiroya/turbowarp-extension-manifest';
import {afterEach, beforeEach, describe, expect, it} from 'vitest';
import {checkDistributionArchives} from '../scripts/check-distribution.ts';
import {readDistribution} from '../scripts/distribution-artifacts.ts';
import {prepareReleaseArchive} from '../scripts/prepare-release.ts';
import definitions from '../src/block-definitions.json';

const run = promisify(execFile);
let root: string;
const id = 'anotherauthorweather';
const bundleFile = 'weather-station.js';
const resources = {
  schemaVersion: 1,
  resources: [{
    type: 'network', usage: 'required', purpose: {en: 'Download weather data'},
    data: {direction: 'download', content: {en: 'Weather forecasts'}}
  }]
};
const metadata = {
  name: '@another-author/weather', version: '1.2.3', license: 'MPL-2.0',
  files: ['dist/', 'LICENSE'],
  scripts: {prepack: 'node -e "throw new Error(\'publisher script executed\')"'},
  turbowarpExtension: {resourceDeclaration: resources}
};

async function json(file: string, value: unknown) {
  await writeFile(path.join(root, file), JSON.stringify(value) + '\n');
}

async function replaceArtifact(file: string, bytes: Buffer) {
  await writeFile(path.join(root, 'dist', file), bytes);
  const descriptor = JSON.parse(await readFile(path.join(root, 'dist/extension-package.json'), 'utf8'));
  descriptor[file === bundleFile ? 'bundle' : 'api'] = {
    file, size: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex')
  };
  await json('dist/extension-package.json', descriptor);
}

beforeEach(async () => {
  root = await mkdtemp(path.join(tmpdir(), 'template-distribution-test-'));
  await mkdir(path.join(root, 'dist'));
  await json('package.json', metadata);
  await writeFile(path.join(root, 'LICENSE'), await readFile(new URL('../LICENSE', import.meta.url)));
  await writeFile(path.join(root, 'vite.config.ts'), 'throw new Error("config executed");');
  const info = JSON.stringify({id, blocks: definitions.blocks});
  const bundle = Buffer.from(`Scratch.extensions.register({getInfo: () => (${info}), hello: () => 'Hello, Scratch!'});\n`);
  const api = Buffer.from(JSON.stringify(createExtensionManifest(id, definitions)) + '\n');
  await writeFile(path.join(root, 'dist', bundleFile), bundle);
  await writeFile(path.join(root, 'dist/extension-manifest.json'), api);
  const artifact = (file: string, bytes: Buffer) => ({
    file, size: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex')
  });
  await json('dist/extension-package.json', {
    formatVersion: 1, id, package: metadata.name, version: metadata.version,
    name: 'Weather station', description: 'An independent extension.', license: metadata.license,
    execution: 'sandboxed', resources,
    bundle: artifact(bundleFile, bundle), api: artifact('extension-manifest.json', api)
  });
});

afterEach(async () => {
  await rm(root, {recursive: true, force: true});
});

describe('distribution archives', () => {
  it('ships an independent author and scope unchanged through npm and Release without publisher scripts', async () => {
    await checkDistributionArchives(root);
    const {descriptor, files} = await readDistribution(root);
    const registrations: {getInfo(): {id: string}; hello(): string}[] = [];
    runInNewContext(files.get(`dist/${bundleFile}`)!.toString('utf8'), {
      Scratch: {extensions: {register: (instance: typeof registrations[number]) => registrations.push(instance)}}
    });
    expect(registrations).toHaveLength(1);
    expect(registrations[0]?.getInfo().id).toBe(descriptor.id);
    expect(registrations[0]?.hello()).toBe('Hello, Scratch!');
  }, 15000);

  it('omits development and unrelated files, preserves the legacy JS, and creates repeatable ZIPs', async () => {
    await writeFile(path.join(root, 'dist/private.js.map'), 'private source');
    await json('dist/extension-development.json', {sourceMap: {file: 'private.js.map'}});
    await writeFile(path.join(root, '.env'), 'SECRET=fixture');
    const first = path.join(root, 'first.zip');
    const second = path.join(root, 'second.zip');
    await prepareReleaseArchive(root, first);
    await prepareReleaseArchive(root, second);
    expect(await readFile(first)).toEqual(await readFile(second));
    const {stdout} = await run('unzip', ['-Z1', first]);
    expect(stdout.trim().split('\n').sort()).toEqual([
      'LICENSE', 'package.json', bundleFile,
      `dist/${bundleFile}`, 'dist/extension-manifest.json', 'dist/extension-package.json'
    ].sort());
  });

  it('fails when npm ignore rules omit the descriptor', async () => {
    await json('package.json', {...metadata, files: [`dist/${bundleFile}`, 'dist/extension-manifest.json', 'LICENSE']});
    await expect(checkDistributionArchives(root)).rejects.toThrow(/extension-package.json/u);
  }, 15000);

  it.each(['LICENSE', 'dist/extension-manifest.json', `dist/${bundleFile}`])('rejects missing %s', async file => {
    await rm(path.join(root, file));
    await expect(readDistribution(root)).rejects.toThrow(/ENOENT/u);
  });

  it('rejects a changed bundle even when its byte length is unchanged, before writing an archive', async () => {
    const file = path.join(root, 'dist', bundleFile);
    const bytes = await readFile(file);
    bytes[0] = 0;
    await writeFile(file, bytes);
    const archive = path.join(root, 'broken.zip');
    await expect(prepareReleaseArchive(root, archive)).rejects.toMatchObject({code: 'HASH_MISMATCH'});
    await expect(access(archive)).rejects.toThrow(/ENOENT/u);
  });

  it.each([
    [{...metadata, version: '9.9.9'}, 'PACKAGE_MISMATCH'],
    [{...metadata, turbowarpExtension: {resourceDeclaration: {schemaVersion: 1, resources: []}}}, 'PACKAGE_MISMATCH'],
    [{...metadata, turbowarpExtension: undefined}, 'INVALID_RESOURCES']
  ])('rejects inconsistent version or resource declarations %#', async (changed, code) => {
    await json('package.json', changed);
    await expect(readDistribution(root)).rejects.toMatchObject({code});
  });

  it.each(['missing menus', 'duplicate opcode'])('rejects hash-consistent API with %s', async kind => {
    const api = JSON.parse(await readFile(path.join(root, 'dist/extension-manifest.json'), 'utf8'));
    if (kind === 'missing menus') delete api.menus;
    else api.blocks.push(api.blocks[0]);
    await replaceArtifact('extension-manifest.json', Buffer.from(JSON.stringify(api) + '\n'));
    const archive = path.join(root, 'broken-api.zip');
    await expect(prepareReleaseArchive(root, archive)).rejects.toMatchObject({code: 'API_MISMATCH'});
    await expect(access(archive)).rejects.toThrow(/ENOENT/u);
  });

  it('rejects a truncated API before reading JSON', async () => {
    const file = path.join(root, 'dist/extension-manifest.json');
    const bytes = await readFile(file);
    await writeFile(file, bytes.subarray(1));
    await expect(readDistribution(root)).rejects.toMatchObject({code: 'SIZE_MISMATCH'});
  });

  it('validates an executable bundle as bytes without running it', async () => {
    await replaceArtifact(bundleFile, Buffer.from('throw new Error("bundle executed");\n'));
    expect((await readDistribution(root)).descriptor.id).toBe(id);
  });
});
