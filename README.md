# TurboWarp Extension Template

A reusable TypeScript template for developing, testing, building, and releasing TurboWarp extensions with Vite.

## Build workflow

```text
TypeScript source
  -> Vite
  -> vite-plugin-turbowarp-extension
  -> dist/<extension-name>.js
```

The generated JavaScript is a single, non-minified TurboWarp extension file with Extension Gallery metadata and the standard `(function (Scratch) { ... })(Scratch);` wrapper.

## Example blocks

<!-- BEGIN GENERATED BLOCKS -->

### `hello [NAME]`

Returns a localized greeting for the supplied name.

| Property | Value |
|---|---|
| Type | Reporter |
| Opcode | `hello` |
| `NAME` | String, default: `world` |

<!-- END GENERATED BLOCKS -->

## Getting started

1. Create a repository from this template.
2. Update the package name in `package.json`.
3. Edit the metadata in `src/config.ts`.
4. Define blocks in `src/block-definitions.json`.
5. Implement their runtime behavior in `src/extension.ts`.
6. Run `npm run docs` after changing block definitions.
7. Update the tests and handwritten documentation.

```bash
npm install
npm run check
```

For continuous rebuilding during development:

```bash
npm run dev
```

## Project structure

- `src/config.ts`: extension metadata
- `src/block-definitions.json`: canonical block metadata used by both the extension and README generator
- `src/extension.ts`: extension implementation
- `src/index.ts`: extension registration entry point
- `src/globals.d.ts`: Scratch API declarations used by the project
- `scripts/generate-readme.mjs`: updates the generated README block section
- `tests/`: unit tests
- `vite.config.ts`: TurboWarp-compatible Vite build configuration
- `dist/`: generated JavaScript for TurboWarp

## Generated documentation

Regenerate block documentation with:

```bash
npm run docs
```

`npm run check` also runs `docs:check`, which fails if `README.md` is out of date with `src/block-definitions.json`.

## Development dependency

This template pins a tested, published version of `@kubohiroya/vite-plugin-turbowarp-extension` for reproducible builds. Update the pinned version intentionally after validating each new release.

## License

MPL-2.0
