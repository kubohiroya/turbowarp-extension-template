# Style Guide

## TypeScript

- Follow `tsconfig.json`, including strict checking, unchecked index access, and
  exact optional properties.
- Avoid `any`; describe the Scratch boundary with narrow interfaces in
  `src/runtime-api.ts` (with `src/globals.d.ts` only declaring the standalone
  global) and model optional capabilities explicitly.
- Use clear types at public boundaries. Keep functions focused and side effects visible.
- Follow existing ESM import conventions and the configured ESLint rules in
  `eslint.config.ts`.

## Names and definitions

Use PascalCase for classes and interfaces and camelCase for functions and variables.
Follow nearby code for constants. Preserve saved-project identifiers when refactoring.

Keep metadata in `src/config.ts`, canonical blocks in `src/block-definitions.json`,
and runtime behavior in `src/extension.ts`. The same block definitions drive the
README reference and extension manifest; avoid hand-maintained copies.

Use `Scratch.translate()` for user-visible text. Internal values and identifiers
remain language-independent. Write code comments in English and explain constraints
or intent that the code itself does not make clear.

## Errors and compatibility

Fail clearly for invalid development configuration. Runtime blocks should return
valid values or reject predictably. An unavailable optional host API must preserve
ordinary registration and execution.

Follow the existing file's formatting. Use the configured ESLint checks for source
changes and behavior-focused tests for changed contracts or bug fixes. Do not edit
`dist/` or the generated README block reference by hand; regenerate them from source.

## Dependencies

Prefer platform APIs and existing tools. Explain the maintenance benefit of a new
dependency and keep required exact pins and `pnpm-lock.yaml` in sync.

See the [contribution workflow](CONTRIBUTING.md) for validation and review.
