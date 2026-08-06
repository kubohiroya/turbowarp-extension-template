# TurboWarp Extension Template

[English](README.md)

Viteを使ってTurboWarp拡張機能を開発、テスト、ビルド、リリースするための再利用可能なTypeScriptテンプレートです。

## ビルドの流れ

```text
TypeScriptソース
  -> Vite
  -> vite-plugin-turbowarp-extension
  -> dist/<extension-name>.js

拡張機能設定 + ブロック定義
  -> extension manifestプラグイン
  -> dist/extension-manifest.json
```

生成されるJavaScriptは、Extension Galleryメタデータと標準の`(function (Scratch) { ... })(Scratch);`ラッパーを含む、単一の非minify TurboWarp拡張ファイルです。

## サンプルブロック

### `hello [NAME]`

指定した名前を使って、ローカライズされた挨拶を返します。

| 項目 | 値 |
|---|---|
| 種類 | Reporter |
| Opcode | `hello` |
| `NAME` | String、既定値: `world` |

## はじめに

1. このテンプレートからリポジトリを作成します。
2. `package.json`のパッケージ名を更新します。
3. `src/config.ts`のメタデータを編集します。
4. `src/block-definitions.json`にブロックを定義します。
5. `src/extension.ts`に実行時の動作を実装します。
6. ブロック定義を変更したら`npm run docs`を実行します。
7. テストと手書きのドキュメントを更新します。

```bash
npm install
npm run check
```

開発中に継続して再ビルドする場合:

```bash
npm run dev
```

## プロジェクト構成

- `src/config.ts`: 拡張機能のメタデータ
- `src/block-definitions.json`: 拡張機能とREADME生成の両方で使う正規のブロックメタデータ
- `src/extension.ts`: 拡張機能の実装
- `src/extension-manifest.ts`: 正規のmanifest生成処理とVite出力プラグイン
- `src/index.ts`: 拡張機能を登録するエントリーポイント
- `src/globals.d.ts`: プロジェクトが使うScratch APIの型宣言
- `schemas/extension-manifest.schema.json`: 生成されるAPI契約のJSON Schema
- `scripts/generate-readme.mjs`: READMEの自動生成ブロック節を更新するスクリプト
- `tests/`: ユニットテスト
- `vite.config.ts`: TurboWarp互換のViteビルド設定
- `dist/`: リポジトリで追跡するTurboWarp JavaScriptと拡張機能API manifest

## 拡張機能API manifest

各ビルドは`formatVersion: 1`の`dist/extension-manifest.json`を出力します。このファイルには、拡張機能ID、ブロックのopcodeと種類、引数のIDと種類、メニュー参照が決定的な順序で記録されます。`sb3-toolchain`のようなツールは、埋め込まれた拡張機能の更新やID移行の前に、この契約を比較できます。v1契約については[アーキテクチャ文書](docs/architecture.ja.md)と[JSON Schema](schemas/extension-manifest.schema.json)を参照してください。

実行時コードまたはブロックメタデータを変更したら、追跡されているリリース成果物を再生成して検証します。

```bash
npm run check:dist
```

## 生成ドキュメント

ブロックのドキュメントを再生成するには次を実行します。

```bash
npm run docs
```

`npm run check`は`docs:check`も実行します。`src/block-definitions.json`に対して`README.md`が古い場合、検証は失敗します。英語READMEが生成元に追従したら、この日本語版のサンプルブロック節も同じ意味になるように更新してください。

## 開発依存関係

再現可能なビルドのため、このテンプレートは検証済みで公開済みの`@kubohiroya/vite-plugin-turbowarp-extension`を固定バージョンで指定します。新しいリリースを検証した後、意図的に固定バージョンを更新してください。

## ライセンス

MPL-2.0
