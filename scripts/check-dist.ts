import {deepStrictEqual, ok} from 'node:assert/strict';
import {execFile} from 'node:child_process';
import {readdir, readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {promisify} from 'node:util';
import {
  DISTRIBUTION_DESCRIPTOR, assertDistributionPackage, assertDistributionSettings,
  parseExtensionDistribution, verifyExtensionDistribution
} from '@kubohiroya/turbowarp-extension-manifest/distribution';

const execFileAsync = promisify(execFile);
const repositoryRoot = fileURLToPath(new URL('..', import.meta.url));
const dist = new URL('../dist/', import.meta.url);
const apiFile = 'extension-manifest.json';
const metadata = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'));
const distribution = parseExtensionDistribution(JSON.parse(await readFile(new URL(DISTRIBUTION_DESCRIPTOR, dist), 'utf8')));
assertDistributionPackage(distribution, metadata);
const settings = JSON.parse(await readFile(new URL('../src/extension-config.json', import.meta.url), 'utf8'));
assertDistributionSettings(distribution, settings);
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
await verifyExtensionDistribution(distribution, {bundle: bundleBytes, api: manifest});
deepStrictEqual(JSON.parse(descriptor), {
  formatVersion: 1,
  id: distribution.id,
  bundle: {file: bundleFile, sha256: distribution.bundle.sha256},
  api: {file: apiFile, sha256: distribution.api.sha256}
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
