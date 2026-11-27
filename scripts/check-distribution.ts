import {deepStrictEqual, ok} from 'node:assert/strict';
import {execFile} from 'node:child_process';
import {mkdtemp, mkdir, readFile, rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {promisify} from 'node:util';
import {assertSameDistribution, readDistribution} from './distribution-artifacts.ts';
import {prepareReleaseArchive} from './prepare-release.ts';

const run = promisify(execFile);

/** Check actual archives, including npm ignore rules, rather than only a file list. */
export async function checkDistributionArchives(root: string) {
  const expected = await readDistribution(root);
  const temporary = await mkdtemp(path.join(tmpdir(), 'extension-distribution-check-'));
  try {
    const {stdout} = await run('npm', ['pack', '--ignore-scripts', '--json', '--pack-destination', temporary,
      '--cache', path.join(temporary, 'cache')], {cwd: root});
    const [packed] = JSON.parse(stdout) as {filename: string}[];
    ok(packed, 'npm pack must report an archive');
    const npmRoot = path.join(temporary, 'npm');
    const releaseRoot = path.join(temporary, 'release');
    await mkdir(npmRoot);
    await mkdir(releaseRoot);
    await run('tar', ['-xzf', path.join(temporary, packed.filename), '-C', npmRoot]);
    assertSameDistribution(expected.files, (await readDistribution(path.join(npmRoot, 'package'))).files);

    const archive = path.join(temporary, 'release.zip');
    await prepareReleaseArchive(root, archive);
    await run('unzip', ['-q', archive, '-d', releaseRoot]);
    assertSameDistribution(expected.files, (await readDistribution(releaseRoot)).files);
    deepStrictEqual(await readFile(path.join(releaseRoot, expected.descriptor.bundle.file)),
      expected.files.get(`dist/${expected.descriptor.bundle.file}`), 'Legacy ZIP entry must match the bundle');
  } finally {
    await rm(temporary, {recursive: true, force: true});
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await checkDistributionArchives(fileURLToPath(new URL('..', import.meta.url)));
  process.stdout.write('Repository, npm tarball and Release ZIP contain identical distribution artifacts.\n');
}
