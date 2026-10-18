# Contributing

This repository provides reusable structure and examples for TurboWarp extensions.
Keep domain-specific behavior in repositories created from the template.

## Setup

Use Node.js 22.18.0 or newer and the pnpm version pinned in `package.json`.

```bash
corepack enable
pnpm install --frozen-lockfile
```

See the [README](README.md) for building and loading the example extension.

## Development workflow

1. Track the task in a GitHub Issue. Record the scope, branch, dependencies,
   acceptance criteria, and rollback procedure.
2. Create a focused branch such as `docs/template/project-guides` or
   `fix/template/localized-greeting`.
3. Update the source, tooling, or documentation and keep the change small.
4. Run checks for the affected behavior and boundaries. Add regression coverage
   for behavior changes; documentation-only changes need content and link checks.
5. Link the Issue in the pull request and describe the resulting behavior,
   compatibility impact, and verification performed.

Record `start`, `done`, and `blocked` updates in the Issue as work progresses.
Use Conventional Commits and normally Squash & Merge completed pull requests.

## Validation

Choose local checks that match the change. For example, a behavior change to the
example extension can be checked with:

```bash
pnpm exec vitest run tests/extension.test.ts
pnpm run typecheck
```

Run ESLint for changed TypeScript files. When block definitions or their text change,
run `pnpm run docs` and commit the generated README section. When runtime code or
build inputs change, rebuild and commit the corresponding `dist/` artifacts.
See [drift detection](docs/architecture.md#drift-detection).

CI runs `pnpm run check`: type checking, ESLint, Vitest, generated README validation,
bundle/manifest reproducibility, repository policy, and a package dry run. Local
checks for a small change can remain focused; run the complete check before a release.

## Compatibility and documentation

- Localize user-visible text with `Scratch.translate()`. Preserve extension IDs,
  opcodes, argument IDs, and menu references used by saved projects.
- Keep ordinary registration and execution working when the optional block-editor
  API is unavailable. See the [block-editor guide](docs/block-editors.md).
- Keep `package.json`, `repo-policy.json`, source metadata, and `LICENSE` aligned.
- `README.md` is the canonical English entrypoint. Update `README.ja.md` and paired
  documents when changing content they share. Keep links outside the generated
  block-reference markers unless they are part of that reference.

Consult the [architecture](docs/architecture.md), [style guide](STYLE_GUIDE.md), and
[design principles](DESIGN_PRINCIPLES.md) when choosing where a change belongs.

## Required GitHub Pages documentation

Every extension derived from this template must have GitHub Pages enabled. When
the site is unset, configure it through the Pages API with `build_type: workflow`;
do not leave it as a manual setup reminder. Preserve an existing publishing source.
Prepare and publish documentation for every registered block, including hidden
compatibility blocks and optional blocks, with stable `#block-<opcode>` anchors.
The extension's standard `getInfo().docsURI` must open that published documentation.
Verify the actual URL, content, block coverage, links, and deployment commit after
publishing. Site configuration alone does not complete this requirement.

Remote settings and publication require explicit authorization for the target and
operation. Follow the [required Pages procedure](docs/github-pages-setup.ja.md) for
API checks, validation, deployment, evidence retention, and rollback.
