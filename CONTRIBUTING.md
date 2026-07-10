# Contributing

Thank you for contributing to the TurboWarp Extension Template.

## Development workflow

1. Fork the repository.
2. Create a focused feature branch.
3. Update the TypeScript source, tooling, or documentation.
4. Add or update tests.
5. Run all checks locally.
6. Open a pull request.

```bash
npm install
npm run check
```

All pull requests must pass TypeScript type checking, ESLint, Vitest, and the Vite build.

## Scope

This repository provides reusable project structure and examples. Extension-specific behavior does not belong here.

## Localization

All user-visible strings in the example extension must use `Scratch.translate()`.

## Compatibility

Changes should preserve the template's documented file layout, build commands, and generated output contract unless a breaking change is clearly announced.

## Pull requests

Keep pull requests small and explain the motivation, implementation, compatibility impact, and testing performed.