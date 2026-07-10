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

## Getting started

1. Create a repository from this template.
2. Update the package name in `package.json`.
3. Edit the metadata in `src/config.ts`.
4. Implement the extension in `src/extension.ts`.
5. Update the tests and documentation.

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
- `src/extension.ts`: extension implementation
- `src/index.ts`: extension registration entry point
- `src/globals.d.ts`: Scratch API declarations used by the project
- `tests/`: unit tests
- `vite.config.ts`: TurboWarp-compatible Vite build configuration
- `dist/`: generated JavaScript for TurboWarp

## Development dependency

Until `@kubohiroya/vite-plugin-turbowarp-extension` is published to npm, this template pins a tested Git commit of the plugin. Replace the Git dependency with a normal semantic version after publication.

## License

MPL-2.0
