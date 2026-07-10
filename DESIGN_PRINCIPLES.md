# Design Principles

1. **TypeScript is the source language.** JavaScript is a generated runtime artifact.
2. **Generated JavaScript is the deliverable.** It must load directly in TurboWarp.
3. **Build logic stays outside extension logic.** TurboWarp-specific wrapping and validation belong in the Vite plugin.
4. **User-visible text is localizable.** Use `Scratch.translate()` and keep identifiers language-independent.
5. **Public APIs are stable.** Extension IDs, opcodes, argument IDs, argument types, and block types are compatibility contracts.
6. **The template stays generic.** Domain-specific behavior belongs in generated projects.
7. **Output stays reviewable.** Minification is disabled and builds should be deterministic.
8. **Testing is preferred over assumptions.** Changes should be validated by automated checks.
9. **Dependencies are minimized.** Tooling should reduce complexity rather than hide it.
10. **Official contribution remains possible.** Generated code should follow TurboWarp Extension Gallery conventions where practical.

The goal is not only to produce working JavaScript, but to produce extensions that remain understandable and maintainable.