import {deepStrictEqual, ok} from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {
  DISTRIBUTION_DESCRIPTOR, assertDistributionPackage, parseExtensionDistribution, verifyExtensionDistribution
} from '@kubohiroya/turbowarp-extension-manifest/distribution';

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
  assertDistributionPackage(descriptor, metadata);
  const bundle = await read(`dist/${descriptor.bundle.file}`);
  const api = await read(`dist/${descriptor.api.file}`);
  await verifyExtensionDistribution(descriptor, {bundle, api});
  return {descriptor, files};
}

export function assertSameDistribution(expected: Map<string, Buffer>, actual: Map<string, Buffer>) {
  deepStrictEqual([...actual.keys()].sort(), [...expected.keys()].sort());
  for (const [file, bytes] of expected) {
    deepStrictEqual(actual.get(file), bytes, `Distribution bytes differ: ${file}`);
  }
}
