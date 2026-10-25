# TurboWarp-Extension-Template

<img src="assets/block-icon.svg" alt="" width="48" height="48">

[日本語](README.ja.md)

A reusable TypeScript template for developing, testing, building, and releasing TurboWarp extensions with Vite.

## User guide

Create a repository from this template, replace the package and extension metadata, implement blocks in `src/extension.ts`, and keep generated artifacts checked in.

The template package is version-pinned when it is used as a reference:

```bash
pnpm add --save-exact @kubohiroya/turbowarp-extension-template@0.5.0
```

## What it does

- builds a single TurboWarp-compatible JavaScript extension file;
- emits a deterministic `dist/extension-manifest.json` API contract;
- generates the README block reference from `src/block-definitions.json`;
- verifies source, documentation, generated `dist/` output, repository policy, and npm package contents in one check.

## Requirements and safety

- Node.js 22 or newer;
- pnpm through Corepack;
- TurboWarp's unsandboxed extension option only when your extension metadata sets `unsandboxed: true`.

Only load generated extension code that you trust. Unsandboxed extensions run with browser page access.

## Installation

```bash
corepack enable
pnpm install --frozen-lockfile
```

## Quick start

1. Create a repository from this template.
2. Update `package.json` metadata and `repo-policy.json`.
3. Edit `src/config.ts`.
4. Define blocks in `src/block-definitions.json`.
5. Implement runtime behavior in `src/extension.ts`.
6. Run `pnpm run docs`.
7. Run `pnpm run check`.

For continuous rebuilding during development:

```bash
pnpm run dev
```

## Block reference

<!-- BEGIN GENERATED BLOCKS -->

### `hello [NAME]`

Returns a localized greeting for the supplied name.

| Property | Value |
|---|---|
| Type | Reporter |
| Opcode | `hello` |
| `NAME` | String, default: `world` |

<!-- END GENERATED BLOCKS -->

## Important behavior

```text
TypeScript source
  -> Vite
  -> vite-plugin-turbowarp-extension
  -> dist/<extension-name>.js

Extension config + block definitions
  -> extension manifest plugin
  -> dist/extension-manifest.json
```

The generated JavaScript is a single, non-minified TurboWarp extension file with Extension Gallery metadata and the standard `(function (Scratch) { ... })(Scratch);` wrapper.

Each build emits `dist/extension-manifest.json` with `formatVersion: 1`. It records the extension ID, block opcodes and types, argument IDs and types, and menu references in a deterministic order. Tools such as `sb3-toolchain` can compare this contract before updating an embedded extension or migrating its ID. See [the architecture document](docs/architecture.md) and the [JSON Schema](https://github.com/kubohiroya/turbowarp-extension-manifest/blob/main/schemas/extension-manifest.schema.json) for the v1 contract.

## Integrated-build module API

`pnpm run build` also emits dependency-preserving JavaScript and declarations in
`lib-module/`. After building this source, a package consumer can use:

```ts
import {bundleModuleMetadata, createExtension, type ScratchApi}
  from '@kubohiroya/turbowarp-extension-template/bundle-module';

function createMember(memberScratch: ScratchApi) {
  return createExtension(memberScratch);
}
```

`bundleModuleMetadata` is frozen and declares `formatVersion: 1`, the original
extension `id`, and `unsandboxed` (`required`, `optional`, or `not-needed`). This is
the module-entry contract, separate from the block API manifest. The host checks
the version, ID and sandbox requirement before calling the factory.

Importing this entry does not access global `Scratch`, `window` or `document`,
create an extension, register it, or connect listeners. Each explicit
`createExtension(memberScratch)` call returns a new instance using that host for
all later casts, translations and block metadata. The factory does not register
or cache the instance; the caller controls its lifetime and registration. The
standalone `src/index.ts` uses the same factory and registers exactly once.

Owners adding editors or runtime services must inject the same member host into
those helpers, initialize them once per created instance, and retain their
disposal behavior. Do not initialize services at module scope. Owners can copy
the structural types in `src/runtime-api.ts`; adopting this contract does not
require a runtime dependency on the template package.

`pnpm run build:module` uses TypeScript rather than a bundler, retaining the
module graph and dependency imports such as `import ... from 'yaml'`. A future
integrated build can resolve those imports to one compatible library copy. This
template change does not enable module builds in sb3-toolchain or share libraries
between existing standalone files. That integration is tracked in
[sb3-toolchain #65](https://github.com/kubohiroya/sb3-toolchain/issues/65).

`pnpm run check:module` packs the actual package, installs it in a clean consumer,
and checks import isolation, public types and parity with the standalone file.
Existing deep package paths remain available. To roll back to standalone use,
keep loading `dist/example-extension.js`; no stored IDs, opcodes, startup flags
or saved data change.

## Compatibility

Block-editor integration is optional. This template does not ship data-editing sample blocks, schemas, or a dedicated editor API. See the [integration guide](docs/block-editors.md) and the [breaking-change migration notes](docs/template-examples-migration.ja.md).

The canonical README is `README.md`. Japanese documentation uses `README.ja.md`; new repositories should not create `README_ja.md`.

Repository-level differences belong in `repo-policy.json`. Use policy exceptions for upstream forks, mixed-license content, legacy package names, or third-party bundles instead of weakening checks silently.

The [stage 0 inventory and design snapshot](docs/block-editor-inventory/stage-0/README.ja.md) (Japanese, captured 2026-10-18) classifies blocks across 43 repositories; it does not report current implementation status.

## Development

See the [contribution guide](CONTRIBUTING.md), [style guide](STYLE_GUIDE.md), and
[design principles](DESIGN_PRINCIPLES.md) for the project workflow and conventions.

```bash
pnpm run check
```

The check runs type checking, linting, tests, generated README validation, `dist/` and `lib-module/` reproducibility, a packed module consumer check, repository policy validation, and an npm package dry run.

## Release

Keep `package.json` as the version source of truth. Before publishing, run:

```bash
pnpm run check
npm pack --dry-run --ignore-scripts
```

Release artifacts include `dist/example-extension.js`, `dist/extension-manifest.json`, `lib-module/`, `README.md`, `README.ja.md`, and `LICENSE`.

## License

SPDX-License-Identifier: MPL-2.0
