# Distribution and development builds

[日本語](distribution.ja.md) · [Issue #56](https://github.com/kubohiroya/turbowarp-extension-template/issues/56)

## Layout and canonical inputs

Any author and npm scope can use this template without catalog registration or fork ancestry.
`@kubohiroya/turbowarp-extension-manifest` owns the shared contract and parsers; Template owns generation and distribution.

The repository, npm tarball under `package/`, and Release ZIP use the same paths:

| Artifact | Path |
| --- | --- |
| Package identity, version and resource declaration | `package.json` |
| License text | `LICENSE` |
| Distribution descriptor | `dist/extension-package.json` |
| Block API manifest | `dist/extension-manifest.json` |
| JavaScript | `dist/` plus the descriptor's `bundle.file` |

Artifact filenames in the descriptor are basenames relative to its own directory. Never infer
the JS entry from the package name. Resources originate in `package.json` under
`turbowarpExtension.resourceDeclaration` and are embedded unchanged in the descriptor.
Edit metadata in `src/extension-config.json` and blocks in `src/block-definitions.json`.

The ZIP also keeps an identical root-level JS entry for existing download instructions.
Individual Release assets include the JS, descriptor, API manifest, LICENSE and npm tarball.
The ZIP excludes development completion records, source maps and unrelated working files.
Source inclusion in npm is explicit through `package.json.files`; this template includes `src/`.

## Local verification and Release

```bash
pnpm run build
pnpm run check:distribution
pnpm run release:archive  # Create turbowarp-extension.zip locally
```

Verification creates and extracts actual archives locally, then compares package.json, LICENSE,
descriptor, JS and API manifest bytes with the repository. It also checks artifact sizes and
SHA-256 digests, the API ID, and package version, license and resource consistency. Missing or
changed artifacts fail verification. npm lifecycle scripts are disabled. ZIP file order, times
and modes are fixed so repeated builds in the same environment produce the same archive.
Integrity is not proof of safe code or a permission grant.

The Release workflow checks distribution parity before creating its ZIP with the same generator.
Never overwrite published versions, tags or assets. Consumers can roll back to the previous exact
version; revert Template changes and publish a new version when needed. Standalone JS and the
module entry remain available.

## Desktop development sessions

`extension-build.json` declares fixed-profile inputs as static JSON. A compatible host reads it
through the shared parser and chooses a host-owned recipe. Template's own build uses its Vite
configuration; a consuming host need not import/evaluate publisher config, scripts or
`src/config.ts` to discover metadata. Use a source snapshot containing the declared lockfile.
Configurations requiring custom plugins, lifecycle scripts or native builds are outside the
fixed profile and must not silently fall back to arbitrary code execution. The host owns build
isolation and execution approval.

1. Run `pnpm run typecheck` for TS diagnostics with file and line positions, then start `pnpm dev`.
2. Start a local development session in a compatible Desktop host, watching this build's `dist/`.
3. Edit TS. After writing JS, API manifest and the development source map, the build finalizes
   `extension-development.json` through an atomic rename.
4. The host reads every referenced file, checks its SHA-256, and verifies that the completion
   record did not change during the read. Existence and timestamps alone do not prove completion.
   On mismatches, partial writes or failed builds, retain the previous verified result.
5. Execute the updated blocks. A compatible host maps generated JS positions to TS using the
   verified map. Maps exclude source text and retain only project-relative `src/` paths.

Restart watch after changes to metadata, blocks or package.json. Production `pnpm build` omits
maps. Desktop watch, TS mapping, approval counts and host-recipe runtime parity require separate
integration verification in the host; the archive check does not establish those results.
Web consumes published artifacts and does not start source builds or local development sessions.

See the [verification record (Japanese)](distribution-validation.ja.md) for measured results and pending integration checks.
