import {deepStrictEqual, ok} from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {
  DISTRIBUTION_DESCRIPTOR, assertDistributionApi, parseExtensionDistribution
} from '@kubohiroya/turbowarp-extension-manifest/distribution';
import {readPackageResourceDeclaration} from '@kubohiroya/turbowarp-extension-manifest/resources';

/** Read static distribution data without importing publisher configuration or code. */
export async function readDistribution(root: string) {
  const files = new Map<string, Buffer>();
  const read = async (file: string) => {
    const bytes = await readFile(path.join(root, file));
    files.set(file, bytes);
    return bytes;
  };
  const metadata = JSON.parse((await read('package.json')).toString('utf8'));
  const license = await read('LICENSE');
  ok(license.toString('utf8').trim(), 'Distribution LICENSE must not be empty');
  const descriptor = parseExtensionDistribution(JSON.parse(
    (await read(`dist/${DISTRIBUTION_DESCRIPTOR}`)).toString('utf8')
  ));
  deepStrictEqual(
    [descriptor.package, descriptor.version, descriptor.license, descriptor.resources],
    [metadata.name, metadata.version, metadata.license, readPackageResourceDeclaration(metadata)],
    'Distribution metadata must match package.json'
  );
  for (const artifact of [descriptor.bundle, descriptor.api]) {
    const bytes = await read(`dist/${artifact.file}`);
    deepStrictEqual(
      {size: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex')},
      {size: artifact.size, sha256: artifact.sha256},
      `Distribution artifact does not match its descriptor: ${artifact.file}`
    );
  }
  assertDistributionApi(descriptor, JSON.parse(files.get(`dist/${descriptor.api.file}`)!.toString('utf8')));
  return {descriptor, files};
}

export function assertSameDistribution(expected: Map<string, Buffer>, actual: Map<string, Buffer>) {
  deepStrictEqual([...actual.keys()].sort(), [...expected.keys()].sort());
  for (const [file, bytes] of expected) {
    deepStrictEqual(actual.get(file), bytes, `Distribution bytes differ: ${file}`);
  }
}
