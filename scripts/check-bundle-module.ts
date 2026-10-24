import assert from 'node:assert/strict';
import {execFile} from 'node:child_process';
import {mkdtemp, readFile, rm, writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {promisify} from 'node:util';

const run = promisify(execFile);
const root = fileURLToPath(new URL('..', import.meta.url));
const metadata = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'));
const temporary = await mkdtemp(path.join(tmpdir(), 'turbowarp-bundle-module-'));

try {
  const {stdout} = await run('npm', ['pack', '--ignore-scripts', '--json', '--pack-destination', temporary], {cwd: root});
  const [packed] = JSON.parse(stdout) as {filename: string}[];
  assert.ok(packed);
  await writeFile(path.join(temporary, 'package.json'), JSON.stringify({private: true, type: 'module'}));
  await run('npm', ['install', path.join(temporary, packed.filename), '--omit=dev', '--ignore-scripts',
    '--no-audit', '--no-fund', '--package-lock=false', '--cache', path.join(temporary, 'cache')], {cwd: temporary});

  await writeFile(path.join(temporary, 'consumer.mjs'), `
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import {runInNewContext} from 'node:vm';
for (const name of ['Scratch', 'window', 'document']) {
  Object.defineProperty(globalThis, name, {get() { throw Error('Unexpected global: ' + name); }});
}
const {createExtension, bundleModuleMetadata} = await import('${metadata.name}/bundle-module');
const registrations = [];
const scratch = {
  extensions: {unsandboxed: false, register: instance => registrations.push(instance)},
  BlockType: {REPORTER: 'reporter'}, ArgumentType: {STRING: 'string'},
  Cast: {toString: String},
  translate: (message, placeholders = {}) => Object.entries(placeholders).reduce(
    (text, [key, value]) => text.replace('{' + key + '}', String(value)),
    typeof message === 'string' ? message : message.default)
};
const instance = createExtension(scratch);
assert.equal(registrations.length, 0);
assert.equal(instance.getInfo().id, bundleModuleMetadata.id);
assert.equal(instance.hello({NAME: 'TurboWarp'}), 'Hello, TurboWarp!');
assert.equal(bundleModuleMetadata.unsandboxed, 'not-needed');
const require = createRequire(import.meta.url);
const classic = readFileSync(require.resolve('${metadata.name}/dist/example-extension.js'), 'utf8');
runInNewContext(classic, {Scratch: scratch});
assert.equal(registrations.length, 1);
assert.equal(JSON.stringify(registrations[0].getInfo()), JSON.stringify(instance.getInfo()));
assert.equal(registrations[0].hello({NAME: 'TurboWarp'}), instance.hello({NAME: 'TurboWarp'}));
assert.equal(JSON.parse(readFileSync(require.resolve('${metadata.name}/package.json'))).name, '${metadata.name}');
`);
  await run(process.execPath, ['consumer.mjs'], {cwd: temporary});

  await writeFile(path.join(temporary, 'consumer.ts'), `
import {createExtension, bundleModuleMetadata, type ScratchApi,
  type TurboWarpExtension, type ExtensionModuleMetadata} from '${metadata.name}/bundle-module';
declare const host: ScratchApi;
const instance: TurboWarpExtension = createExtension(host);
const metadata: ExtensionModuleMetadata = bundleModuleMetadata;
const greeting: string = createExtension(host).hello({NAME: 'Ada'});
void [instance, metadata, greeting];
// @ts-expect-error The module entry does not introduce a global Scratch declaration.
void Scratch;
`);
  await run(process.execPath, [path.join(root, 'node_modules/typescript/bin/tsc'), '--noEmit', '--strict',
    '--module', 'NodeNext', '--moduleResolution', 'NodeNext', '--target', 'ES2020', 'consumer.ts'], {cwd: temporary});
  process.stdout.write('Packed bundle module: import isolation, explicit host, standalone parity and public types passed.\n');
} finally {
  await rm(temporary, {recursive: true, force: true});
}
