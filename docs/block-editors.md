# Optional block-editor integration

The template only provides the minimal extension scaffold. It does not install editor libraries, register editor bodies, or expose editor-schema sample APIs.

If your extension needs structured input, define its schema and acceptance rules in that extension. Choose the block inputs that need editing, add a verified `@kubohiroya/turbowarp-extension-data-editor` dependency when needed, and register only when the GUI provides a supported `Scratch.gui.blockEditors` capability. Ordinary execution must work when the API is absent. Preserve stored data, revalidate before saving, and release registrations with your extension lifecycle.

Runnable editing examples and their tests belong to [the shared editor repository](https://github.com/kubohiroya/turbowarp-extension-data-editor/tree/main/examples), including the JSON/YAML document example. They are optional teaching code, not template blocks or production schema contracts. Read the corresponding package version's API documentation before adopting one.

The GUI's `blockEditorDialogs` option is off by default and fixed at startup. Do not turn it on from the extension. Template build, package creation and Pages do not depend on this feature.

See [the migration notes](template-examples-migration.ja.md) for the removal of earlier sample opcodes and exports.
