# Style Guide

## TypeScript

- Use strict TypeScript settings.
- Avoid `any`; model external APIs with narrow interfaces.
- Prefer explicit public return types.
- Keep functions focused and side effects visible.

## Naming

- PascalCase for classes and interfaces.
- camelCase for functions and variables.
- UPPER_CASE for true constants.
- Preserve stable extension IDs, opcodes, and argument IDs.

## Extension definitions

Keep metadata, block definitions, runtime behavior, and helper functions clearly separated. User-visible strings must use `Scratch.translate()`; internal values must remain language-independent.

## Errors

Fail explicitly for invalid development configuration. Runtime blocks should return valid values or reject predictably rather than fail silently.

## Formatting and tests

Use the configured Prettier and ESLint rules. Add regression tests for bug fixes and tests for public behavior when changing examples or tooling.

## Dependencies

Prefer platform APIs and existing project tools. Every new dependency must have a clear maintenance benefit.