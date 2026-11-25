import {deepStrictEqual, ok} from 'node:assert/strict';
import {execFile} from 'node:child_process';
import {createHash} from 'node:crypto';
import {readdir, readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {promisify} from 'node:util';
import {DISTRIBUTION_DESCRIPTOR, assertDistributionApi, parseExtensionDistribution} from '@kubohiroya/turbowarp-extension-manifest/distribution';
import {readPackageResourceDeclaration} from '@kubohiroya/turbowarp-extension-manifest/resources';

const execFileAsync = promisify(execFile);
const repositoryRoot = fileURLToPath(new URL('..', import.meta.url));
const dist = new URL('../dist/', import.meta.url);
const apiFile = 'extension-manifest.json';
const metadata = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'));
const distribution = parseExtensionDistribution(JSON.parse(await readFile(new URL(DISTRIBUTION_DESCRIPTOR, dist), 'utf8')));
deepStrictEqual([distribution.package, distribution.version, distribution.license, distribution.resources],
  [metadata.name, metadata.version, metadata.license, readPackageResourceDeclaration(metadata)]);
const settings = JSON.parse(await readFile(new URL('../src/extension-config.json', import.meta.url), 'utf8'));
deepStrictEqual([distribution.id, distribution.name, distribution.description, distribution.license, distribution.execution],
  [settings.id, settings.name, settings.description, settings.license, settings.unsandboxed ? 'unsandboxed' : 'sandboxed']);
const [descriptor, files, manifest] = await Promise.all([
  readFile(new URL('extension-development.json', dist), 'utf8'),
  readdir(dist),
  readFile(new URL(apiFile, dist))
]);
const bundles = files.filter(file => file.endsWith('.js'));
const [bundleFile] = bundles;
ok(bundleFile && bundles.length === 1, 'Expected one extension bundle');
deepStrictEqual(bundleFile, `${settings.slug}.js`);
const bundleBytes = await readFile(new URL(bundleFile, dist));
assertDistributionApi(distribution, JSON.parse(manifest.toString('utf8')));
const sha256 = (content: Buffer) => createHash('sha256').update(content).digest('hex');
deepStrictEqual(distribution.bundle, {file: bundleFile, size: bundleBytes.length, sha256: sha256(bundleBytes)});
deepStrictEqual(distribution.api, {file: apiFile, size: manifest.length, sha256: sha256(manifest)});
deepStrictEqual(JSON.parse(descriptor), {
  formatVersion: 1,
  id: JSON.parse(manifest.toString('utf8')).id,
  bundle: {file: bundleFile, sha256: sha256(bundleBytes)},
  api: {file: apiFile, sha256: sha256(manifest)}
});

const {stdout} = await execFileAsync(
  'git',
  ['status', '--short', '--untracked-files=all', '--', 'dist', 'lib-module'],
  {cwd: repositoryRoot}
);

if (stdout.length > 0) {
  process.stderr.write('Generated dist files are not up to date:\n');
  process.stderr.write(stdout);
  process.exitCode = 1;
}
