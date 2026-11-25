import {deepStrictEqual, ok} from 'node:assert/strict';
import {execFile} from 'node:child_process';
import {createHash} from 'node:crypto';
import {readdir, readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {promisify} from 'node:util';

const execFileAsync = promisify(execFile);
const repositoryRoot = fileURLToPath(new URL('..', import.meta.url));
const dist = new URL('../dist/', import.meta.url);
const apiFile = 'extension-manifest.json';
const [descriptor, files, manifest] = await Promise.all([
  readFile(new URL('extension-development.json', dist), 'utf8'),
  readdir(dist),
  readFile(new URL(apiFile, dist))
]);
const bundles = files.filter(file => file.endsWith('.js'));
const [bundleFile] = bundles;
ok(bundleFile && bundles.length === 1, 'Expected one extension bundle');
const sha256 = (content: Buffer) => createHash('sha256').update(content).digest('hex');
deepStrictEqual(JSON.parse(descriptor), {
  formatVersion: 1,
  id: JSON.parse(manifest.toString('utf8')).id,
  bundle: {file: bundleFile, sha256: sha256(await readFile(new URL(bundleFile, dist)))},
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
