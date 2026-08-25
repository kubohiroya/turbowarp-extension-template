# TurboWarp-Extension-Template

[日本語](README.ja.md)

A reusable TypeScript template for developing, testing, building, and releasing TurboWarp extensions with Vite.

## User guide

Create a repository from this template, replace the package and extension metadata, implement blocks in `src/extension.ts`, and keep generated artifacts checked in.

The template package is version-pinned when it is used as a reference:

```bash
pnpm add --save-exact @kubohiroya/turbowarp-extension-template@0.2.0
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

Each build emits `dist/extension-manifest.json` with `formatVersion: 1`. It records the extension ID, block opcodes and types, argument IDs and types, and menu references in a deterministic order. Tools such as `sb3-toolchain` can compare this contract before updating an embedded extension or migrating its ID. See [the architecture document](docs/architecture.md) and the [JSON Schema](schemas/extension-manifest.schema.json) for the v1 contract.

## Compatibility

The canonical README is `README.md`. Japanese documentation uses `README.ja.md`; new repositories should not create `README_ja.md`.

Repository-level differences belong in `repo-policy.json`. Use policy exceptions for upstream forks, mixed-license content, legacy package names, or third-party bundles instead of weakening checks silently.

## Development

```bash
pnpm run check
```

The check runs type checking, linting, tests, generated README validation, `dist/` reproducibility, repository policy validation, and an npm package dry run.

## Release

Keep `package.json` as the version source of truth. Before publishing, run:

```bash
pnpm run check
npm pack --dry-run --ignore-scripts
```

Release artifacts include `dist/example-extension.js`, `dist/extension-manifest.json`, `README.md`, `README.ja.md`, and `LICENSE`.

## License

SPDX-License-Identifier: MPL-2.0
