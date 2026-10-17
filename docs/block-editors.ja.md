# JSON Schemaによるブロック編集

[English](block-editors.md)

対象は[Issue #21](https://github.com/kubohiroya/turbowarp-extension-template/issues/21)です。
`Scratch.gui.blockEditors`は改修GUIの追加APIであり、TurboWarp標準の`getInfo()`とは別です。

## 依存・フラグ・起動

先に[turbowarp-block-editor #1](https://github.com/kubohiroya/turbowarp-block-editor/issues/1)のJSON/YAML対応をビルドし、
[scratch-gui #1](https://github.com/kubohiroya/scratch-gui/issues/1)のGUIへ接続します。
共通パッケージは現在未公開の`0.0.0`です。`createSchemaEditor()`が`format`を処理する版を使ってください。
JSON専用の旧版は`format`を無視するため、YAMLには使用できません。
`apiVersion: 1`の一致だけではYAML対応を判定できません。対応する共通API・GUIの組合せを結合テストし、
公開後は検証済みの依存版を固定してください。現在のローカル対応版は[検証記録](block-editors-validation.ja.md)で識別します。
webpack 4のGUIでは、既存のRJSF用Babel変換対象に`yaml`も含めて再ビルドします。

GUIのURLへ`blockEditorDialogs=1`を付け、`dist/example-extension.js`をカスタム拡張として
**unsandboxedで実行する設定で**読み込みます。配置済みブロックの先頭アイコンから編集します。
フラグの正本は`scratch-gui/src/lib/tw-feature-flags.js`です。起動時固定・既定OFFを維持し、
拡張側に第二の有効化フラグは置きません。
通常のブロックはsandboxでも実行できるため、`src/config.ts`の`unsandboxed: false`は変更不要です。
通常のTurboWarp、sandbox実行、フラグOFFでは編集APIがなくても通常の登録・実行を継続します。

## 配置と登録

[追加コメント](https://github.com/kubohiroya/turbowarp-extension-template/issues/21#issuecomment-6235994815)に基づき、
テンプレートから作る各拡張では次の配置を使います。

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

`sceneJson`・`noteYaml`とscene/noteのファイル名はサンプルです。
各拡張の実際のopcode・保存先引数・データ名へ置き換え、他の拡張へ一律に追加しません。
同じデータ構造を両形式で扱う場合はSchemaを1つ共用し、`format`で保存形式を選びます。

| ファイル | 役割 |
|---|---|
| `schemas/scene-properties.schema.json` | JSONサンプルのtitle・duration |
| `schemas/note-properties.schema.json` | YAMLサンプルのtitle・複数行body |
| `src/block-editors.ts` | 静的import、完全なopcode、保存先引数、保存形式、uiSchemaの対応表 |
| `src/globals.d.ts` | オプショナルなGUI APIの型 |
| `src/extension.ts` | 通常実行と編集登録の初期化・解除 |
| `src/index.ts` | 通常の拡張登録後に編集APIへ登録 |
| `tests/fixtures/` | 日本語・引用符・複数行・追加プロパティのJSON/YAML入力例 |

サンプル`sceneJson.SOURCE`と`noteYaml.SOURCE`は通常実行時に文字列をそのまま返すReporterです。
既存の`hello.NAME`の契約・挙動は維持しています。

[`src/block-editors.ts`](../src/block-editors.ts)の対応表は次のとおりです。
`SchemaBlockEditorDefinition`と`SchemaBlockEditorApi`は同ファイルで宣言します。

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

`opcodes`は拡張IDを含む完全な名前です。`argument`は`block-definitions.json`の実在する文字列引数IDへ合わせます。
Schemaは拡張JSへ同梱され、`schemas/`もnpm配布対象です。Viteの既存JSON import経路を使います。
React・RJSF・AJV・JSON/YAML codecはホスト側が提供し、拡張JSには同梱しません。
共通パッケージの公開前は、登録データの部分集合だけを構造的に型定義しています。
共通型が公開されたら型のみのimportへ置き換えられます。

`src/globals.d.ts`では既存の`ScratchApi`へオプショナルな型を追加します。

```ts
interface ScratchApi {
  gui?: {
    readonly blockEditors?: import('./block-editors.js').SchemaBlockEditorApi;
  };
}
```

部分的な登録失敗では今回成功した登録も解除して診断を出し、通常実行を継続します。
解除関数は`ExampleExtension.dispose()`とページ終了へ接続されています。bfcache退避では維持します。
独自に拡張を再読込するホストは、古いインスタンスの`dispose()`を呼んでから登録してください。

## 起動・終了への接続

`src/extension.ts`の既存クラスへ次のメンバーを追加します。
再初期化では編集登録だけを解除し、無関係なリソースの終了処理を呼びません。
他のリソースを持つ拡張では、`dispose()`内の解除を既存の終了処理へ統合してください。

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

`registerBlockEditors`は`./block-editors.js`からimportします。`src/index.ts`では通常登録の後に初期化します。

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

## 検証・トランザクション・Schema

JSON/YAMLを同じJSON互換モデルへdecodeし、同じJSON Schema検証経路を通して指定形式へencodeします。
初期表示・入力時にinvalidならSaveを無効化し、保存時にも再検証します。
共通APIの任意の`validateData(data, snapshot)`で追加の非同期検証も可能です。
その待機中は二重保存・編集・通常の閉じる操作を抑止します。

下書きはセッションが所有し、保存成功時だけホストが文字列引数へ適用します。
保存はUndo/Redo各1回です。Cancel・Escape・閉じる操作で値・dirty・履歴を変更しません。
起動失敗・保存失敗で元データを初期値へ置換しません。
対象の同一性・競合・原子的適用と復元はホストの責務です。拡張からworkspaceへ直接書き込みません。
接続されたReporter、メニュー、独自validator付きフィールド、パレットのブロックは対象外です。

基本方言はdraft-07で、同じSchema内のローカル参照を利用できます。
外部URLの自動取得、`schemaRef`、外部Schema registryは実装していません。
不正Schema・未解決参照は登録時に拒否します。データ所有パッケージがSchemaを公開している場合は再利用します。
Schema本体の例は[scene](../schemas/scene-properties.schema.json)と[note](../schemas/note-properties.schema.json)を参照してください。
編集対象がYAMLでもJSON Schema自体はJSONで記述し、同じデータ構造に別のYAML用Schemaは作りません。
`additionalProperties`はデータ契約に合わせます。この例では`true`で未編集の追加プロパティを保持します。
ここでのSchemaは編集データ用で、実行時検証ブロックや共通パッケージ所有のextension manifest Schemaとは別です。

## YAMLの対応範囲と書式

ホストは`yaml` 2.xで単一のYAML 1.2 core文書を処理します。
対象は文字列キーのmapping、sequence、文字列・有限数値・真偽値・nullです。
重複キー、非文字列キー、独自tag、非有限数値、循環alias、複数文書、YAML 1.1は拒否します。
非循環aliasは制限付きで展開し、merge keyの特別な展開は行いません。
構文エラーや非対応値は診断でき、元の引数は変更しません。

変更なしの保存はコメント・空白を含む元文字列を保持し、不要なUndoを作りません。
データ変更時は再シリアライズし、意味を保持しますが、コメント・キー順・引用符・anchor等の書式保持は保証しません。
Schemaが許可する追加プロパティは、フォームで編集しなくても保持します。

## 検証とロールバック

```sh
pnpm run typecheck
pnpm exec vitest run tests/block-editors.test.ts tests/extension.test.ts tests/extension-manifest.test.ts
pnpm exec eslint src tests/block-editors.test.ts
pnpm run build
BLOCK_EDITOR_PACKAGE_DIR=../turbowarp-block-editor pnpm run test:block-editor-host
pnpm run docs
npm pack --dry-run --ignore-scripts
```

ホスト結合テストはビルド済み共通パッケージを使い、生成JSの実API登録、fixtureの読込・保存・再オープン・不正値・解除を検証します。
同じscene Schemaの定義を`format`だけ変えて登録し、両形式で同じ検証・保存ができることも確認します。
共通側の`test/codec.test.mjs`と`test/schema-editor.test.mjs`はRJSFの実入力・Cancel・非同期検証も確認します。
実ブラウザでは両形式のアイコン、invalid、Save、Cancel、Undo/Redo、`.sb3`の保存・新しい画面での再読込・再編集を確認します。
フラグOFFでも同じ作品を開き、入口が増えず通常実行できることを確認します。
今回の結果は[検証記録](block-editors-validation.ja.md)にまとめています。

ロールバックはURLから`blockEditorDialogs=1`を外して再読込します。
保存済みJSON/YAMLは通常の文字列引数として残り、通常実行に利用できます。
既定ONへの変更と安定版リリース前の全体検証は今回の範囲に含めません。
