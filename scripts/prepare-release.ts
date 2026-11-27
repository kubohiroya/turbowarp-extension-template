import {execFile} from 'node:child_process';
import {chmod, mkdtemp, mkdir, rename, rm, utimes, writeFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {promisify} from 'node:util';
import {readDistribution} from './distribution-artifacts.ts';

const run = promisify(execFile);

/** Stage only verified public artifacts, then atomically replace the Release ZIP. */
export async function prepareReleaseArchive(root: string, destination: string) {
  const {descriptor, files} = await readDistribution(root);
  // Preserve the original ZIP's root-level JS entry for existing download instructions.
  files.set(descriptor.bundle.file, files.get(`dist/${descriptor.bundle.file}`)!);
  const output = path.resolve(destination);
  await mkdir(path.dirname(output), {recursive: true});
  const temporary = await mkdtemp(path.join(path.dirname(output), '.extension-release-'));
  const staging = path.join(temporary, 'files');
  try {
    await mkdir(staging);
    for (const [file, bytes] of files) {
      const target = path.join(staging, file);
      await mkdir(path.dirname(target), {recursive: true});
      await writeFile(target, bytes);
      await chmod(target, 0o644);
      const timestamp = new Date('1980-01-01T00:00:00Z');
      await utimes(target, timestamp, timestamp);
    }
    const archive = path.join(temporary, 'release.zip');
    await run('zip', ['-X', '-q', archive, ...[...files.keys()].sort()], {
      cwd: staging, env: {...process.env, TZ: 'UTC'}
    });
    await rename(archive, output);
  } finally {
    await rm(temporary, {recursive: true, force: true});
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await prepareReleaseArchive(fileURLToPath(new URL('..', import.meta.url)),
    process.argv[2] ?? 'turbowarp-extension.zip');
}
