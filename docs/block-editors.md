# JSON Schema block editors

[日本語](block-editors.ja.md)

This implements [Issue #21](https://github.com/kubohiroya/turbowarp-extension-template/issues/21).
`Scratch.gui.blockEditors` is an additional API from the modified GUI, separate from standard `getInfo()`.

## Host prerequisites

Build the JSON/YAML implementation of [turbowarp-block-editor #1](https://github.com/kubohiroya/turbowarp-block-editor/issues/1)
before building [scratch-gui #1](https://github.com/kubohiroya/scratch-gui/issues/1).
The shared package is currently private, version `0.0.0`. Use a build whose `createSchemaEditor()` handles `format`;
the old JSON-only implementation ignores that property. The webpack 4 GUI must include `yaml` in its RJSF Babel rule.
An `apiVersion: 1` match alone does not establish YAML support. Test the host/GUI combination and pin compatible versions when published.
The [validation record](block-editors-validation.ja.md) identifies the current local combination.

Start the modified GUI with `blockEditorDialogs=1` and load `dist/example-extension.js` with the **run without sandbox** option.
The startup flag remains OFF by default in `scratch-gui/src/lib/tw-feature-flags.js`; no second flag is added.
The template keeps `unsandboxed: false` because its ordinary blocks also work in a sandbox.
Stock TurboWarp, sandbox execution and a GUI with the flag OFF register and run ordinary blocks without the editor API.

## Files and registration

Use the layout from the [issue comment](https://github.com/kubohiroya/turbowarp-extension-template/issues/21#issuecomment-6235994815)
for extensions created from this template:

```text
turbowarp-<extension>/
├── schemas/
│   ├── scene-properties.schema.json
│   └── note-properties.schema.json
├── src/
│   ├── config.ts
│   ├── block-definitions.json
│   ├── block-editors.ts
│   ├── globals.d.ts
│   ├── extension.ts
│   └── index.ts
├── tests/
│   ├── block-editors.test.ts
│   └── fixtures/
│       ├── scene.json
│       └── note.yaml
├── docs/
│   ├── block-editors.ja.md
│   └── block-editors.md
├── vite.config.ts
└── package.json
```

Scene/note names and opcodes are samples: replace them with the extension's actual data, opcodes and destination arguments.
They are not additions to every extension. When both formats store the same data structure, share one schema and select serialization with `format`.

| File | Purpose |
|---|---|
| `schemas/scene-properties.schema.json` | JSON title and bounded duration |
| `schemas/note-properties.schema.json` | YAML title and multiline body |
| `src/block-editors.ts` | Static imports, complete opcodes, destination arguments, formats and uiSchema |
| `src/globals.d.ts` | Optional GUI API type |
| `src/extension.ts` | Ordinary execution, editor initialization and cleanup |
| `src/index.ts` | Editor registration after ordinary extension registration |
| `tests/fixtures/` | Japanese text, quotes, multiline text and additional properties |

`sceneJson` and `noteYaml` return their `SOURCE` string unchanged. The existing `hello.NAME` contract is preserved.
Click the leading icon of a placed block to edit it.

[`src/block-editors.ts`](../src/block-editors.ts) declares the structural API types and this mapping:

```ts
import {extensionConfig} from './config.js';
import sceneSchema from '../schemas/scene-properties.schema.json';
import noteSchema from '../schemas/note-properties.schema.json';

export const blockEditorDefinitions: readonly SchemaBlockEditorDefinition[] = [
  {
    apiVersion: 1,
    extensionId: extensionConfig.id,
    editorId: 'scene-properties',
    opcodes: [`${extensionConfig.id}_sceneJson`],
    argument: 'SOURCE',
    format: 'json',
    schema: sceneSchema,
    uiSchema: {'ui:order': ['title', 'duration', '*']}
  },
  {
    apiVersion: 1,
    extensionId: extensionConfig.id,
    editorId: 'note-properties',
    opcodes: [`${extensionConfig.id}_noteYaml`],
    argument: 'SOURCE',
    format: 'yaml',
    schema: noteSchema,
    uiSchema: {body: {'ui:widget': 'textarea'}, 'ui:order': ['title', 'body', '*']}
  }
];
```

Use complete opcodes including the extension ID and an existing string argument ID from `block-definitions.json`.
Schemas use the existing Vite JSON import path, are bundled into the extension JS and included in the npm package.
React, RJSF, AJV and codecs remain in the host. Until shared types are published, the template declares a structural subset of registration data.
Partial registration failure removes this call's successful registrations, reports the error and preserves ordinary execution.
Cleanup connects to `ExampleExtension.dispose()` and page exit; bfcache restores retain registrations.
A host that explicitly reloads extensions must dispose the old instance first.

Add the optional API to the existing `ScratchApi` in `src/globals.d.ts`:

```ts
interface ScratchApi {
  gui?: {
    readonly blockEditors?: import('./block-editors.js').SchemaBlockEditorApi;
  };
}
```

## Initialization and cleanup

Import `registerBlockEditors` from `./block-editors.js` and add these members to the existing extension class.
Reinitialization releases only editor registrations. Integrate final disposal with any existing resource cleanup.

```ts
private unregisterBlockEditors: () => void = () => {};

public initializeBlockEditors(): void {
  this.unregisterBlockEditors();
  this.unregisterBlockEditors = registerBlockEditors(Scratch);
}

public dispose(): void {
  this.unregisterBlockEditors();
}
```

In `src/index.ts`, initialize after ordinary registration:

```ts
const extension = new ExampleExtension();
Scratch.extensions.register(extension);
extension.initializeBlockEditors();

if (typeof window !== 'undefined') {
  window.addEventListener('pagehide', (event) => {
    if (!event.persisted) extension.dispose();
  });
}
```

## Validation and persistence

Both formats decode to the same JSON-compatible model, use the same schema validation path and encode to the selected format.
Initial/live validation disables invalid Save; saving independently validates again.
The shared API accepts optional asynchronous `validateData(data, snapshot)` business validation.
Editing, duplicate saving and ordinary closing are blocked while it runs.
Drafts belong to the session. Only successful Save changes the string through the host transaction with one Undo/Redo step.
Cancel, Escape and closing leave values, dirty state and history unchanged. Invalid source is never silently replaced with defaults.
Identity, conflicts, atomic application and rollback belong to the host; extensions must not write to the workspace directly.
Connected reporters, menus, custom field validators and palette blocks are outside the initial scope.

The supported dialect is draft-07 with references within the same schema.
Invalid schemas and unresolved references fail registration. External fetching, `schemaRef` and external schema registries are unsupported.
Reuse schemas exported by data-owning packages. These editor schemas are separate from runtime validation blocks and the shared manifest schema.
See the [scene](../schemas/scene-properties.schema.json) and [note](../schemas/note-properties.schema.json) schema examples.
JSON Schema itself remains JSON for YAML source; a second schema for the same structure is unnecessary.
Choose `additionalProperties` according to the data contract; these samples use `true` to retain unedited properties.

## YAML support

The host uses `yaml` 2.x for a single YAML 1.2 core document with string mapping keys and JSON-compatible values.
Duplicate/non-string keys, custom tags, non-finite numbers, cyclic aliases, multiple documents and YAML 1.1 are rejected without changing source.
Non-cyclic aliases expand with a limit; merge keys receive no special expansion.
Unchanged data retains the exact source, including comments and whitespace, without a commit.
Changed data is serialized again: meaning is retained, while comments, key order, quoting and anchors are not guaranteed to survive.
Unedited additional properties are retained when allowed by the schema.

## Verification and rollback

```sh
pnpm run typecheck
pnpm exec vitest run tests/block-editors.test.ts tests/extension.test.ts tests/extension-manifest.test.ts
pnpm exec eslint src tests/block-editors.test.ts
pnpm run build
BLOCK_EDITOR_PACKAGE_DIR=../turbowarp-block-editor pnpm run test:block-editor-host
pnpm run docs
npm pack --dry-run --ignore-scripts
```

The opt-in contract test uses the built shared package and actual extension bundle.
It also registers the same scene schema with only `format` changed, checking validation and persistence in both formats.
Host codec/schema tests additionally cover RJSF input, cancellation and asynchronous validation.
In a browser, check icon entry, invalid Save, successful Save, Cancel and one-step Undo/Redo for both formats.
Export an `.sb3`, reload it in a fresh page and reopen/edit both forms. Repeat with the flag OFF and confirm ordinary execution.
See the [Japanese validation record](block-editors-validation.ja.md) for results and limitations.

To roll back, remove `blockEditorDialogs=1` and reload. Saved JSON/YAML remains an ordinary string usable during normal execution.
Enabling the flag by default and full stable-release validation are separate work.
