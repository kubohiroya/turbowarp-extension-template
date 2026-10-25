# Design Principles

1. **TypeScript is the source language.** Runtime JavaScript and API metadata are
   generated artifacts that remain checked in and reproducible.
2. **Build infrastructure is separate from runtime behavior.** Vite and its plugins
   own bundling, wrapping, and manifest generation; extension code owns block behavior.
3. **Each definition has one source of truth.** `src/config.ts` owns extension metadata
   and `src/block-definitions.json` owns the canonical block contract and reference text.
4. **Saved-project compatibility is explicit.** Extension IDs, opcodes, argument IDs
   and types, block types, and menu references are compatibility contracts. Document
   migrations rather than silently changing them.
5. **User-visible text is localizable.** Use `Scratch.translate()` while keeping
   identifiers and stored values language-independent.
6. **Optional editing remains optional.** Schema-driven JSON/YAML forms enhance a
   compatible host. Stock TurboWarp and hosts without the editor API retain ordinary
   registration and execution; the host's editing feature remains opt-in.
7. **The template stays generic.** Reusable infrastructure and small examples belong
   here. Domain-specific behavior belongs in projects created from the template.
8. **Outputs stay reviewable.** Build one non-minified TurboWarp JavaScript bundle
   plus the separate deterministic API manifest. Keep the standard Scratch wrapper,
   one registration call, and no runtime imports or exports in the standalone bundle.
   The separate `lib-module/` entry preserves imports for integrated builders and
   performs no automatic registration.
9. **Verification follows the changed contract.** Use focused local checks and
   behavior tests, generated-output drift detection, and the complete CI/release
   checks described in the [contribution guide](CONTRIBUTING.md).
10. **Dependencies and conventions serve maintainability.** Prefer existing tools,
    minimize dependencies, and keep generated code suitable for review and potential
    contribution to the TurboWarp Extension Gallery.

See the [architecture](docs/architecture.md) for the output contract and ownership
boundaries, and the [style guide](STYLE_GUIDE.md) for source conventions.
