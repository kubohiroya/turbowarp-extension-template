import {access, readFile} from 'node:fs/promises';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';

interface PackageMetadata {
  name: string;
  version: string;
  description?: string;
  author?: string;
  license?: string;
  homepage?: string;
  packageManager?: string;
  engines?: {node?: string};
  repository?: {url?: string};
  bugs?: {url?: string};
  files?: string[];
  scripts?: Record<string, string>;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
}

interface RepoPolicy {
  schemaVersion: number;
  productName: string;
  packageType: string;
  licensePolicy: string;
  readmeLanguages: string[];
  canonicalReadme: string;
  localizedReadmes: {
    ja: string;
  };
  blockIcon: string;
  sharedSiteHeader: string;
  node: {
    minimum: string;
  };
  packageManager: string;
  requiredFiles: string[];
  exceptions: {
    upstreamFork: boolean;
    mixedContentLicenses: boolean;
    legacyPackageName: boolean;
    thirdPartyBundle: boolean;
  };
  migrationChecklist: string[];
}

interface PackResult {
  version: string;
  files: {path: string}[];
}

const execFileAsync = promisify(execFile);
const errors: string[] = [];

const packageMetadata = JSON.parse(await readFile('package.json', 'utf8')) as PackageMetadata;
const policy = JSON.parse(await readFile('repo-policy.json', 'utf8')) as RepoPolicy;
const readme = await readFile(policy.canonicalReadme, 'utf8');
const readmeJa = await readFile(policy.localizedReadmes.ja, 'utf8');
const license = await readFile('LICENSE', 'utf8');
const config = await readFile('src/config.ts', 'utf8');
const blockIcon = await readFile(policy.blockIcon, 'utf8');
const publishedDocs = await readFile('docs/index.html', 'utf8');

checkPolicy();
checkPackageMetadata();
checkReadmes();
checkFamilyConventions();
checkLicense();
checkGeneratedArtifacts();
await checkPackContents();

if (errors.length > 0) {
  throw new Error(`Repository policy check failed:\n- ${errors.join('\n- ')}`);
}

process.stdout.write('Repository policy is aligned.\n');

function checkPolicy() {
  if (policy.schemaVersion !== 1) errors.push('repo-policy.json schemaVersion must be 1');
  if (policy.productName !== 'TurboWarp-Extension-Template') {
    errors.push('repo-policy.json productName must match README.md H1');
  }
  if (policy.licensePolicy !== 'mpl-2.0') {
    errors.push('repo-policy.json licensePolicy must be mpl-2.0');
  }
  if (policy.packageManager !== 'pnpm') {
    errors.push('repo-policy.json packageManager must be pnpm');
  }
  if (!Array.isArray(policy.migrationChecklist) || policy.migrationChecklist.length === 0) {
    errors.push('repo-policy.json must include a migration checklist');
  }
}

function checkPackageMetadata() {
  const requiredStrings = ['description', 'author', 'license', 'homepage', 'packageManager'] as const;
  for (const key of requiredStrings) {
    const value = packageMetadata[key];
    if (typeof value !== 'string' || value.trim().length === 0) {
      errors.push(`package.json ${key} must be a non-empty string`);
    }
  }
  if (packageMetadata.license !== 'MPL-2.0') errors.push('package.json license must be MPL-2.0');
  if (!packageMetadata.packageManager?.startsWith('pnpm@')) {
    errors.push('package.json packageManager must pin pnpm exactly');
  }
  if (packageMetadata.engines?.node !== '>=22.18.0') {
    errors.push('package.json engines.node must be >=22.18.0');
  }
  if (packageMetadata.repository?.url !== 'git+https://github.com/kubohiroya/turbowarp-extension-template.git') {
    errors.push('package.json repository.url must point to the current repository');
  }
  if (packageMetadata.bugs?.url !== 'https://github.com/kubohiroya/turbowarp-extension-template/issues') {
    errors.push('package.json bugs.url must point to the current issue tracker');
  }
  for (const file of policy.requiredFiles) {
    if (!packageMetadata.files?.includes(file)) {
      errors.push(`package.json files must include ${file}`);
    }
  }
  for (const command of ['docs:check', 'check', 'check:dist']) {
    if (/\bnpm run\b/u.test(packageMetadata.scripts?.[command] ?? '')) {
      errors.push(`package.json ${command} must use pnpm run`);
    }
  }
}

function checkReadmes() {
  if (!readme.startsWith(`# ${policy.productName}\n`)) {
    errors.push('README.md H1 must match repo-policy.json productName');
  }
  if (!readme.includes('[日本語](README.ja.md)')) {
    errors.push('README.md must link to README.ja.md');
  }
  if (!readme.includes('## What it does')) errors.push('README.md must include What it does');
  if (!readme.includes('## Requirements and safety')) {
    errors.push('README.md must include Requirements and safety');
  }
  if (!readme.includes('## Block reference')) {
    errors.push('README.md generated block section heading must be Block reference');
  }
  if ((readme.match(/<!-- BEGIN GENERATED BLOCKS -->/g) ?? []).length !== 1) {
    errors.push('README.md must contain exactly one generated block start marker');
  }
  if ((readme.match(/<!-- END GENERATED BLOCKS -->/g) ?? []).length !== 1) {
    errors.push('README.md must contain exactly one generated block end marker');
  }
  if (!readme.includes(`${packageMetadata.name}@${packageMetadata.version}`)) {
    errors.push('README.md must include a version-pinned package example');
  }
  if (!readme.includes('MPL-2.0')) errors.push('README.md License section must include MPL-2.0');
  if (!readmeJa.startsWith('# TurboWarp-Extension-Template\n')) {
    errors.push('README.ja.md must mirror the product H1');
  }
}

/**
 * The conventions shared across the TurboWarp Plus family.
 *
 * The family dashboard reads these repositories as well as people do: it takes
 * each package's summary from the first paragraph of the README in the matching
 * language, and the mark beside the package name from the committed block icon.
 * A repository that drifts from the shape below still builds, so nothing but a
 * check catches it.
 */
function checkFamilyConventions() {
  // Only the opening counts. Both READMEs quote the switcher and the icon
  // further down while documenting this very convention.
  if (!opening(readme).includes('English | [日本語](README.ja.md)')) {
    errors.push('README.md must open with the language switcher English | [日本語](README.ja.md)');
  }
  if (!opening(readmeJa).includes('[English](README.md) | 日本語')) {
    errors.push('README.ja.md must open with the language switcher [English](README.md) | 日本語');
  }

  for (const [name, markdown] of [
    [policy.canonicalReadme, readme],
    [policy.localizedReadmes.ja, readmeJa]
  ] as const) {
    if (!opening(markdown).includes(`<img src="${policy.blockIcon}"`)) {
      errors.push(`${name} must show ${policy.blockIcon} under the title`);
    }
    if (!summaryParagraph(markdown)) {
      errors.push(`${name} must open with one paragraph of prose for the package list`);
    }
  }

  if (!packageMetadata.files?.includes('assets/')) {
    errors.push('package.json files must include assets/ so the block icon ships with the package');
  }

  if (!blockIcon.trimStart().startsWith('<svg')) {
    errors.push(`${policy.blockIcon} must be a plain SVG document`);
  }
  if (!/viewBox=/u.test(blockIcon)) {
    errors.push(`${policy.blockIcon} must declare a viewBox so it scales with its container`);
  }
  if (/<script|<foreignObject|\son\w+\s*=|javascript:/iu.test(blockIcon)) {
    errors.push(
      `${policy.blockIcon} must contain no script, foreignObject, event handler or javascript: URL; the package list inlines it and refuses anything else`
    );
  }
  if (blockIcon.trim() !== decodeBlockIconURI()) {
    errors.push(`${policy.blockIcon} must show the same drawing as blockIconURI in src/config.ts`);
  }

  if (!publishedDocs.includes(policy.sharedSiteHeader)) {
    errors.push(`docs/index.html must load the shared family header ${policy.sharedSiteHeader}`);
  }
  if (!publishedDocs.includes('color-scheme:light dark') &&
      !publishedDocs.includes('color-scheme: light dark')) {
    errors.push('docs/index.html must declare color-scheme: light dark and follow the reader\'s preference');
  }
}

/** Everything between the product H1 and the first section heading. */
function opening(markdown: string): string {
  const lines = markdown.split('\n');
  const start = lines.findIndex((line) => /^#\s/u.test(line)) + 1;
  const rest = lines.slice(start);
  const end = rest.findIndex((line) => /^##\s/u.test(line));
  return (end === -1 ? rest : rest.slice(0, end)).join('\n');
}

/** The SVG that `blockIconURI` carries, so the file and the block can be compared. */
function decodeBlockIconURI(): string {
  const match = config.match(/'data:image\/svg\+xml;base64,([A-Za-z0-9+/=]+)'/u);
  if (!match?.[1]) {
    errors.push('src/config.ts blockIconURI must be a self-contained data:image/svg+xml;base64 URI');
    return '';
  }
  return Buffer.from(match[1], 'base64').toString('utf8').trim();
}

/**
 * The first paragraph under the opening heading: what the package list shows as
 * this package's summary in the language of that file.
 *
 * The icon and the language switcher sit above it and are skipped, the same way
 * the dashboard skips them. A list, table or badge row in that position leaves
 * the package with no summary at all, which is what this detects.
 */
function summaryParagraph(markdown: string): string | null {
  const heading = /^#{1,6}\s/u;
  const skipped = [/^!?\[!\[/u, /^<!--/u, /^<\/?[a-z]/iu, /^[-*+]\s/u, /^\d+\.\s/u, /^>/u, /^\|/u, /^```/u];
  const navOnly = /^(english|日本語|ja|en|[|·・\s])+$/iu;
  const lines = markdown.split('\n');
  const collected: string[] = [];

  for (let index = lines.findIndex((line) => heading.test(line.trim())) + 1; index < lines.length; index += 1) {
    const line = lines[index]?.trim() ?? '';
    if (heading.test(line)) break;
    if (!line) {
      if (collected.length > 0) break;
      continue;
    }
    if (collected.length === 0) {
      if (skipped.some((pattern) => pattern.test(line))) continue;
      const plain = line.replace(/\[([^\]]*)\]\([^)]*\)/gu, '$1').replace(/[*_`]/gu, '').trim();
      if (!plain || navOnly.test(plain)) continue;
    }
    collected.push(line);
  }

  const text = collected.join(' ').trim();
  return text.length >= 8 ? text : null;
}

function checkLicense() {
  if (!license.startsWith('Mozilla Public License Version 2.0\n==================================')) {
    errors.push('LICENSE must contain the Mozilla Public License Version 2.0 full text');
  }
  if (!license.includes('Exhibit A - Source Code Form License Notice')) {
    errors.push('LICENSE must include the MPL-2.0 Exhibit A text');
  }
  if (!config.includes("license: 'MPL-2.0'")) {
    errors.push('src/config.ts must expose MPL-2.0 bundle metadata');
  }
}

function checkGeneratedArtifacts() {
  const expectedBundle = `dist/${extractConfigValue('slug')}.js`;
  if (!packageMetadata.files?.includes('dist/')) errors.push('package.json files must include dist/');
  if (!readme.includes(expectedBundle)) errors.push(`README.md must document ${expectedBundle}`);
}

async function checkPackContents() {
  const {stdout} = await execFileAsync('npm', [
    'pack', '--dry-run', '--ignore-scripts', '--foreground-scripts=false', '--json'
  ]);
  const [pack] = JSON.parse(stdout) as PackResult[];
  if (!pack) {
    errors.push('npm pack must report a package');
    return;
  }
  const files = new Set(pack.files.map((file) => file.path));
  for (const file of policy.requiredFiles) {
    if (!files.has(file)) errors.push(`npm pack must include ${file}`);
  }
  if (!files.has('dist/example-extension.js')) {
    errors.push('npm pack must include the generated extension bundle');
  }
  if (!files.has(policy.blockIcon)) {
    errors.push(`npm pack must include ${policy.blockIcon}`);
  }
  await access('pnpm-lock.yaml');
}

function extractConfigValue(key: string): string {
  const match = config.match(new RegExp(`${key}: '([^']+)'`));
  if (!match?.[1]) throw new Error(`src/config.ts must define ${key}`);
  return match[1];
}
