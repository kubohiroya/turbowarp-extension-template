# Architecture

## Overview

The template separates extension behavior from build infrastructure.

```text
TypeScript source
  -> Vite
  -> vite-plugin-turbowarp-extension
  -> one TurboWarp-compatible JavaScript file
```

## Project layers

### `src/`

Contains extension metadata, block definitions, runtime behavior, and local type declarations.

### `tests/`

Contains behavior-focused unit tests. Tests should verify extension semantics rather than generated formatting.

### Vite configuration

Configures the entry point and delegates TurboWarp-specific output handling to `vite-plugin-turbowarp-extension`.

### GitHub Actions

Runs type checking, linting, tests, and the production build. Release automation publishes the generated JavaScript artifact.

## Boundaries

The template must remain generic. Extension-specific APIs, domain logic, assets, and documentation belong in repositories created from the template.

## Output contract

A successful build produces one readable, non-minified JavaScript file with TurboWarp metadata, one registration call, no imports or exports, and the standard `(function (Scratch) { ... })(Scratch);` wrapper.