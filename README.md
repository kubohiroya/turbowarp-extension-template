# TurboWarp-Extension-Template

<img src="assets/block-icon.svg" alt="" width="48" height="48">

English | [日本語](README.ja.md)

A reusable TypeScript template for developing, testing, building, and releasing TurboWarp extensions with Vite.

## User guide

Create a repository from this template, replace the package and extension metadata, implement blocks in `src/extension.ts`, and keep generated artifacts checked in.

The template package is version-pinned when it is used as a reference:

```bash
pnpm add --save-exact @kubohiroya/turbowarp-extension-template@0.6.0
```

## What it does

- builds a single TurboWarp-compatible JavaScript extension file;
- emits a deterministic `dist/extension-manifest.json` API contract;
- generates the README block reference from `src/block-definitions.json`;
- verifies source, documentation, generated `dist/` output, repository policy, and npm package contents in one check.

## Requirements and safety

- Node.js 24 or newer;
- pnpm through Corepack;
- TurboWarp's unsandboxed extension option only when your extension metadata sets `unsandboxed: true`.

Only load generated extension code that you trust. Unsandboxed extensions run with browser page access.

## Installation

```bash
npm install --global corepack@latest
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

## TurboWarp Plus conventions

Repositories in the [TurboWarp Plus family](https://kubohiroya.github.io/turbowarp-plus-packages/)
are read by the family dashboard as well as by people, so the opening of each
README and the handling of the block icon are the same everywhere.

### README

Both READMEs open the same way:

```markdown
# TurboWarp-<Extension-Name>

<img src="assets/block-icon.svg" alt="" width="48" height="48">

English | [日本語](README.ja.md)

<One paragraph saying what the extension does.>
```

- The canonical English file is `README.md` and the Japanese one is `README.ja.md`. Do not create `README_ja.md`.
- The language switcher names both languages and links only to the other one: `English | [日本語](README.ja.md)` in `README.md`, and `[English](README.md) | 日本語` in `README.ja.md`.
- The first paragraph under the H1 is the package summary, written in that file's own language. The dashboard shows it in the matching column and skips the icon and the switcher above it. Keep it prose: a badge row, a list or a table in that position leaves the package with no summary to show.
- Do not open the Japanese paragraph with `@kubohiroya/<package> は、`. The dashboard row already carries the package name, and the dashboard strips that opening.
- A repository with no `README.ja.md` is listed with its English summary in both languages, so write the Japanese paragraph even when the rest of the Japanese README stays short.

### Block icon

- `assets/block-icon.svg` is committed and shows the same drawing as `blockIconURI` in `src/config.ts`. `pnpm run repo:check` decodes the URI and compares the two.
- `blockIconURI` stays a self-contained `data:image/svg+xml;base64,...` URI, because the extension loads as a single file. GitHub does not render a `data:` URI in `<img src>` and the dashboard reads the committed file, which is why both exist.
- The file is a plain drawing. The dashboard inlines it so that it takes the reader's colour scheme, and it refuses `<script>`, `<foreignObject>`, event-handler attributes and `javascript:` URLs instead of rewriting them.
- `package.json` `files` includes `assets/`, so the icon also renders in the README on npm.

### Published documentation

`docs/index.html` carries the shared family header:

```html
<script type="module"
        src="https://kubohiroya.github.io/turbowarp-plus-site-header/dist/auto.js"></script>
```

It inserts itself in a shadow root, so the page's own stylesheet and the header
cannot reach each other, and a change to the header arrives without editing this
repository again. The page also declares `color-scheme: light dark` and follows
the reader's preference: the dashboard screenshots every site in both schemes,
and a light-only page reads as a hole in a dark table.

## Checklist for a new extension

`pnpm run check` decides everything a check can decide. These are the ones it
cannot, and they are easier to settle before the first release than after.

**Identity, before anyone saves a project**

- [ ] `extensionConfig.id` is the final extension ID. Every saved project stores it, so changing it later needs a documented migration rather than a new build.
- [ ] Opcodes, argument IDs and argument types read the way they should stay. They are stored in projects too, and `dist/extension-manifest.json` records them as the API contract.
- [ ] The product name hyphenates every word (`TurboWarp-Asset-Manager`), and the README H1, `repo-policy.json` `productName`, `src/config.ts` `name` and the npm package name agree.
- [ ] `src/config.ts` `slug` gives the bundle name you want users to download; it appears in the README, on the CDN and in every install instruction.

**Blocks**

- [ ] Blocks live only in `src/block-definitions.json`. The README reference and the manifest are generated from it; hand-edited copies drift.
- [ ] User-visible text goes through `Scratch.translate()`, while identifiers and stored values stay language-independent.
- [ ] Each block returns a valid value or fails predictably, including on project stop, project reload and invalid input. Document those cases in the README.
- [ ] `unsandboxed` is `true` only when a browser API actually requires it, and the README says what requires it.

**Documentation and icon**

- [ ] The first paragraph of each README is the summary the dashboard will show, in that file's language.
- [ ] The block icon is a recognizable mark for this extension, not the template's three coloured blocks, and `assets/block-icon.svg` and `blockIconURI` carry that same drawing.
- [ ] GitHub Pages is enabled through the API, `docs/index.html` documents every registered block with stable `#block-<opcode>` anchors, and `docsURI` points at the live URL. See [the required procedure](docs/github-pages-setup.ja.md).
- [ ] `repo-policy.json` records this repository's own values, and any genuine difference is an explicit exception rather than a weakened check.

**Before publishing**

- [ ] `dist/` is committed and reproducible, so users install the extension without Node.js.
- [ ] Version-pinned install examples in both READMEs match `package.json`.
- [ ] `npm pack --dry-run` contains the bundle, the manifest, both READMEs, `LICENSE` and `assets/`, and nothing unreviewed.
- [ ] The repository is listed in [`catalog.yaml`](https://github.com/kubohiroya/turbowarp-plus-packages/blob/main/catalog.yaml) of the family dashboard, with `npm: false` when it is deliberately not an npm package.

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
