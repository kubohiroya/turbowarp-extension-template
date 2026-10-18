# アーキテクチャ

[English](architecture.md)

## 構成と担当境界

このテンプレートは実行時の動作とビルド基盤を分離します。

- `src/config.ts`は拡張機能metadata、`src/block-definitions.json`はブロック定義と参照文面の正本です。
- `src/extension.ts`は実行時の動作、`src/index.ts`は登録、`src/globals.d.ts`はScratch境界の型宣言を担当します。
- ブロック編集のサンプルとテストは共通エディタが所有し、Templateには編集依存・Schema・登録・専用公開APIを搭載しません。対応する編集APIがなくても通常実行を維持します。
- `vite.config.ts`はJavaScript出力を拡張機能プラグインへ、API metadataをmanifestプラグインへ委譲します。
- `scripts/`は文書生成、repository policyと生成物の差分検査を担当し、`tests/`は動作と互換性契約を検証します。
- GitHub Actionsは`package.json`の検査を実行し、文書用workflowは`docs/`をPagesへ配信します。

再利用可能な構成と小さなサンプルをテンプレートに置き、用途固有のAPI・asset・動作はテンプレートから作成したリポジトリに置きます。
英語の[貢献ガイド](../CONTRIBUTING.md)・[スタイルガイド](../STYLE_GUIDE.md)・[設計原則](../DESIGN_PRINCIPLES.md)も参照してください。

## ビルド出力

このプロジェクトは実行時の動作と互換性メタデータを分離し、リポジトリに保存された同じソース定義から両方を生成します。

```text
src/index.ts + src/extension.ts
  -> vite-plugin-turbowarp-extension
  -> dist/<extension>.js

src/config.ts + src/block-definitions.json
  -> extension-api-manifest Viteプラグイン
  -> dist/extension-manifest.json
```

JavaScriptバンドルは非minifyの読みやすい形式で、TurboWarp metadata、登録呼び出し1回、標準の`(function (Scratch) { ... })(Scratch);` wrapperを持ち、実行時のimport/exportは含みません。manifestは別の生成物です。

manifestプラグインはViteのビルド後フェーズで実行されます。これにより、JavaScriptプラグインの単一出力検証を維持しながら、TurboWarpバンドルの完成後にだけmanifestを追加します。

## 拡張機能API manifest v1

この契約は[`@kubohiroya/turbowarp-extension-manifest`](https://github.com/kubohiroya/turbowarp-extension-manifest)が所有します。同packageの`schemas/extension-manifest.schema.json`が規範となるJSON Schemaであり、`createExtensionManifest`が唯一の生成器です。`formatVersion`は`1`で、互換性のないmanifest形式を導入するときはpackage側で変更します。このテンプレートは自前のコピーを持たずに同packageをexact pinするため、テンプレートから作成したリポジトリは、ずれうるコピーではなく一つの契約を引き継ぎます。

v1契約は次の情報を含みます。

- TurboWarp拡張機能のID
- 各ブロックのopcodeとブロック種類
- 各引数のID、引数種類、任意のメニュー参照
- 各メニューのIDとReporterブロックを受け付けるかどうか

ブロック、引数、メニューは、シリアライズ前に識別子で並べ替えられます。テキスト、説明、既定値、静的メニュー項目は、保存済みプロジェクトのAPI参照を識別しないため、意図的に除外しています。そのため互換性チェッカーは、API変更とドキュメントまたはローカライズの変更を区別できます。

## 差分の検出

`dist/`はリリース成果物としてコミットされます。`npm run check:dist`は両方のファイルを再ビルドし、`dist/`配下に変更、削除、未追跡ファイルがある場合に失敗します。これにより、ローカル検証とCIの両方でmanifestとバンドルの差分を検出できます。
