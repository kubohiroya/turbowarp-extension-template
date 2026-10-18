# Template編集サンプルの撤去と互換性

Templateの旧Git版にあったサンプルの公開opcode・Schema・公開型の撤去は、その旧Git版を使うconsumerには非互換変更です。npm公開済み0.4.0のtarballは既にhelloブロックのみで、sceneJson/noteYamlや専用公開APIを含まないことを確認しました。Git途中版との非互換性と、npm0.4.0からの更新を区別します。公開状態はnpm registryと対応PRを正本とし、この移行説明だけで公開済みとは扱いません。

## 撤去対象

- 公開opcodeとmethodの`sceneJson` / `noteYaml`。恒久aliasや代替の標準JSON/YAMLブロックは追加しません。
- `scene-properties.schema.json` / `note-properties.schema.json`、サンプル登録処理とその専用lifecycle（initializeBlockEditors / dispose）。
- `src/block-editors.ts`由来の`SchemaBlockEditorDefinition` / `SchemaBlockEditorApi`、`./editor-schema`、`ExampleContract`、`exampleSchemaBundles`、`decodeExampleSource` / `validateExampleSource`。
- `build:editor`、`test:block-editor-host`、`tsconfig.editor.json`、`lib-editor`配布物。サンプル配布のため追加された`exports`定義とGit配布用`prepare`も撤去し、通常の`vite build`を維持します。
- これら専用だった`yaml`と共通エディタへの直接依存・Git依存build許可。Viteのoptional peer依存として残る間接`yaml`は同じ版のまま維持します。

未公開の途中案にあった`jsonDocument` / `yamlDocument`と`example-document.schema.json`もTemplateには残しません。編集サンプルは共通エディタのexamples・テストで独立して検証します。拡張manifestの契約は引き続き`@kubohiroya/turbowarp-extension-manifest@0.2.0`が所有し、TemplateにはSchemaをコピーしません。READMEの所有元への参照を修正します。

## 利用者への影響

拡張ID、`hello.NAME`、build/manifest生成、PagesとdocsURIは維持します。旧opcodeを保存した.sb3、旧型や`./editor-schema`をimportするconsumer、削除されたscriptを実行するCIは対応が必要です。過去の.sb3や派生拡張を無断で書き換えません。

旧版が必要なら[固定commitのbundle](https://raw.githubusercontent.com/kubohiroya/turbowarp-extension-template/033ae362af3d4ae28af122f143dd9831fff65316/dist/example-extension.js)を、実際の読込方法・拡張IDと合わせて検証して使用してください。旧Schema/APIが必要なpackage consumerは同じ旧commit、または必要なAPIの収録を確認した既存公開版を固定し、Templateの最新版に残っていると仮定しないでください。

今後の移行では、それぞれの実拡張が必要なブロックとSchemaを所有し、プロジェクトを退避して明示的に移行します。Templateの新しいopcodeへの自動置換ではありません。SOURCEの内容を自動変換しません。

Motionの既存`@kubohiroya/turbowarp-extension-template: 0.4.0`など他repoのpinは変更しません。Template由来という関係だけで42拡張を一括変更しません。過去の16契約・1,106テスト・135生成物は当時の記録のまま保持します。npm0.4.0から0.4.1への更新は文書・履歴案内の修正であり、旧APIのnpm提供を終了する版ではありません。0.4.1の公開前には安定版用の全検証・配布実体・CIを確認します。公開管理は[Issue #32](https://github.com/kubohiroya/turbowarp-extension-template/issues/32)で行います。
