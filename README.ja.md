# TurboWarp-Extension-Template

[English](README.md)

ViteでTurboWarp拡張機能を開発、テスト、ビルド、リリースするための再利用可能なTypeScriptテンプレートです。

## 利用者ガイド

このテンプレートからリポジトリを作成し、packageと拡張機能metadataを置き換え、`src/extension.ts`でブロックを実装し、生成済みartifactをコミットします。

参照用にtemplate packageを使う場合はversionを固定します。

```bash
pnpm add --save-exact @kubohiroya/turbowarp-extension-template@0.5.0
```

## できること

- TurboWarp互換の単一JavaScript拡張ファイルをビルドします。
- 決定的な`dist/extension-manifest.json` API契約を出力します。
- `src/block-definitions.json`からREADMEのブロック参照を生成します。
- source、document、生成済み`dist/`、repository policy、npm package内容を一括検査します。

## 要件と安全性

- Node.js 22以上
- Corepack経由のpnpm
- `unsandboxed: true`を設定した拡張機能ではTurboWarpのunsandboxed extension option

信頼できる生成済み拡張コードだけを読み込んでください。unsandboxed extensionはブラウザページへアクセスできます。

## インストール

```bash
corepack enable
pnpm install --frozen-lockfile
```

## クイックスタート

1. このテンプレートからリポジトリを作成します。
2. `package.json` metadataと`repo-policy.json`を更新します。
3. `src/config.ts`を編集します。
4. `src/block-definitions.json`にブロックを定義します。
5. `src/extension.ts`に実行時の動作を実装します。
6. `pnpm run docs`を実行します。
7. `pnpm run check`を実行します。

開発中に継続ビルドする場合:

```bash
pnpm run dev
```

## ブロック参照

### `hello [NAME]`

指定された名前へのローカライズ可能な挨拶を返します。

| Property | Value |
|---|---|
| Type | Reporter |
| Opcode | `hello` |
| `NAME` | String, default: `world` |

## 重要な動作

```text
TypeScript source
  -> Vite
  -> vite-plugin-turbowarp-extension
  -> dist/<extension-name>.js

Extension config + block definitions
  -> extension manifest plugin
  -> dist/extension-manifest.json
```

生成されるJavaScriptは、Extension Gallery metadataと標準の`(function (Scratch) { ... })(Scratch);` wrapperを持つ、単一の非minify TurboWarp拡張ファイルです。

各ビルドは`formatVersion: 1`の`dist/extension-manifest.json`を出力します。このファイルには、拡張機能ID、ブロックopcodeと種類、引数IDと種類、メニュー参照が決定的な順序で記録されます。`sb3-toolchain`のようなツールは、埋め込み拡張機能の更新やID移行前にこの契約を比較できます。v1契約については[アーキテクチャ文書](docs/architecture.ja.md)と[JSON Schema](https://github.com/kubohiroya/turbowarp-extension-manifest/blob/main/schemas/extension-manifest.schema.json)を参照してください。

## 統合ビルド用module API

`pnpm run build`は、依存を内包しないJavaScriptと型宣言を`lib-module/`にも生成します。
このソースをビルドしたpackageでは、次の入口を利用できます。

```ts
import {bundleModuleMetadata, createExtension, type ScratchApi}
  from '@kubohiroya/turbowarp-extension-template/bundle-module';

function createMember(memberScratch: ScratchApi) {
  return createExtension(memberScratch);
}
```

`bundleModuleMetadata`は凍結されたmetadataで、`formatVersion: 1`、元の拡張IDである
`id`、`unsandboxed`（`required` / `optional` / `not-needed`）を宣言します。
これはブロックAPI manifestとは別のmodule入口の契約です。hostはfactoryを呼ぶ前に
version・ID・sandbox条件を検査します。

import時はglobal `Scratch`・`window`・`document`を参照せず、instance生成・拡張登録・
listener接続を行いません。明示的な`createExtension(memberScratch)`呼び出しごとに
新しいinstanceを返し、その後のCast・翻訳・ブロックmetadataも渡されたhostを使います。
factoryはinstanceを登録・cacheせず、呼出側が寿命と登録を管理します。
単体版の`src/index.ts`も同じfactoryを使い、登録は1回です。

編集機能やruntime serviceを追加するownerは、補助処理にも同じmember用hostを渡し、
instanceごとに1回初期化して既存のdispose処理を維持します。moduleのトップレベルで
serviceを起動しません。`src/runtime-api.ts`の構造的な型をコピーして採用でき、
template packageへのruntime依存は不要です。

`pnpm run build:module`はbundlerを使わずTypeScriptで変換するため、module graphと
`import ... from 'yaml'`等の依存importを保持します。後続の統合ビルドで互換な依存を
1組へ解決できます。今回のtemplate変更だけで既存の単体JS間の共有やsb3-toolchainの
module方式が有効になるわけではありません。後続は
[sb3-toolchain #65](https://github.com/kubohiroya/sb3-toolchain/issues/65)で追跡します。

`pnpm run check:module`は実packageをpackし、新規consumerへinstallしてimport時の
副作用・公開型・単体JSとの動作一致を検証します。既存のpackage内の深いpathも維持します。
単体方式への切戻しは従来どおり`dist/example-extension.js`を読み込みます。
保存済みID・opcode・起動フラグ・データ形式は変更しません。

## 互換性

ブロック編集は任意の追加機能です。Templateはデータ編集のサンプルブロック・専用Schema・専用公開APIを標準搭載しません。必要な拡張だけが[導入ガイド](docs/block-editors.ja.md)に従って追加してください。撤去した旧APIへの影響は[移行文書](docs/template-examples-migration.ja.md)を参照してください。

canonical READMEは`README.md`です。日本語ドキュメントは`README.ja.md`を使います。新規リポジトリでは`README_ja.md`を作成しません。

リポジトリ固有の差分は`repo-policy.json`に記録します。upstream fork、mixed-license content、legacy package name、third-party bundleは、検査を弱めるのではなくpolicy例外として表現します。

43リポジトリのブロック分類は[段階0の棚卸し・設計スナップショット](docs/block-editor-inventory/stage-0/README.ja.md)（2026-10-18採取）に保存しています。現在の実装状況を示す資料ではありません。

## 開発

開発手順と規約は、英語の[貢献ガイド](CONTRIBUTING.md)・[スタイルガイド](STYLE_GUIDE.md)・[設計原則](DESIGN_PRINCIPLES.md)を参照してください。

```bash
pnpm run check
```

このcheckは型検査、lint、test、生成README検証、`dist/`と`lib-module/`の再現性、実packageのmodule consumer検証、repository policy検証、npm package dry-runを実行します。

## リリース

`package.json`をversionの正本にします。公開前に次を実行します。

```bash
pnpm run check
npm pack --dry-run --ignore-scripts
```

release artifactには`dist/example-extension.js`、`dist/extension-manifest.json`、`lib-module/`、`README.md`、`README.ja.md`、`LICENSE`を含めます。

## ライセンス

SPDX-License-Identifier: MPL-2.0
