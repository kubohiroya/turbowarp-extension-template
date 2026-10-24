# アーキテクチャ

[English](architecture.md)

## 構成と担当境界

このテンプレートは実行時の動作とビルド基盤を分離します。

- `src/config.ts`は拡張機能metadata、`src/block-definitions.json`はブロック定義と参照文面の正本です。
- `src/extension.ts`は注入されたhostを使う実行時の動作、`src/bundle-module.ts`はfactoryと静的metadataを担当します。`src/runtime-api.ts`はhostの構造的な型を公開し、`src/globals.d.ts`は単体版の`src/index.ts`が登録時に使うglobal Scratchを宣言します。
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

src/bundle-module.ts + imported modules
  -> TypeScript (tsconfig.module.json、bundleしない)
  -> lib-module/*.js + *.d.ts + imported JSON
```

JavaScriptバンドルは非minifyの読みやすい形式で、TurboWarp metadata、登録呼び出し1回、標準の`(function (Scratch) { ... })(Scratch);` wrapperを持ち、実行時のimport/exportは含みません。manifestは別の生成物です。

manifestプラグインはViteのビルド後フェーズで実行されます。これにより、JavaScriptプラグインの単一出力検証を維持しながら、TurboWarpバンドルの完成後にだけmanifestを追加します。

任意の`./bundle-module` package exportは依存を内包しないESMと型を指します。
import時はhost参照や拡張の起動を行いません。`createExtension(memberScratch)`は登録せず
新しいinstanceを生成します。統合hostが`bundleModuleMetadata`を検査し、登録と寿命を管理します。
単体entryも同じfactoryを使います。[module API契約](../README.ja.md#統合ビルド用module-api)を参照してください。

## 拡張機能API manifest v1

この契約は[`@kubohiroya/turbowarp-extension-manifest`](https://github.com/kubohiroya/turbowarp-extension-manifest)が所有します。同packageの`schemas/extension-manifest.schema.json`が規範となるJSON Schemaであり、`createExtensionManifest`が唯一の生成器です。`formatVersion`は`1`で、互換性のないmanifest形式を導入するときはpackage側で変更します。このテンプレートは自前のコピーを持たずに同packageをexact pinするため、テンプレートから作成したリポジトリは、ずれうるコピーではなく一つの契約を引き継ぎます。

v1契約は次の情報を含みます。

- TurboWarp拡張機能のID
- 各ブロックのopcodeとブロック種類
- 各引数のID、引数種類、任意のメニュー参照
- 各メニューのIDとReporterブロックを受け付けるかどうか

ブロック、引数、メニューは、シリアライズ前に識別子で並べ替えられます。テキスト、説明、既定値、静的メニュー項目は、保存済みプロジェクトのAPI参照を識別しないため、意図的に除外しています。そのため互換性チェッカーは、API変更とドキュメントまたはローカライズの変更を区別できます。

## 差分の検出

`dist/`と`lib-module/`を生成物としてコミットします。`pnpm run check:dist`は両方を再生成し、どちらかに変更・削除・未追跡ファイルがある場合に失敗します。`pnpm run check:module`は実tarballの入口・公開型・単体動作を独立consumerで検証します。
