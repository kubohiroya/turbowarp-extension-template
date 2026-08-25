# TurboWarp-Extension-Template

[English](README.md)

ViteでTurboWarp拡張機能を開発、テスト、ビルド、リリースするための再利用可能なTypeScriptテンプレートです。

## 利用者ガイド

このテンプレートからリポジトリを作成し、packageと拡張機能metadataを置き換え、`src/extension.ts`でブロックを実装し、生成済みartifactをコミットします。

参照用にtemplate packageを使う場合はversionを固定します。

```bash
pnpm add --save-exact @kubohiroya/turbowarp-extension-template@0.2.0
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

各ビルドは`formatVersion: 1`の`dist/extension-manifest.json`を出力します。このファイルには、拡張機能ID、ブロックopcodeと種類、引数IDと種類、メニュー参照が決定的な順序で記録されます。`sb3-toolchain`のようなツールは、埋め込み拡張機能の更新やID移行前にこの契約を比較できます。v1契約については[アーキテクチャ文書](docs/architecture.ja.md)と[JSON Schema](schemas/extension-manifest.schema.json)を参照してください。

## 互換性

canonical READMEは`README.md`です。日本語ドキュメントは`README.ja.md`を使います。新規リポジトリでは`README_ja.md`を作成しません。

リポジトリ固有の差分は`repo-policy.json`に記録します。upstream fork、mixed-license content、legacy package name、third-party bundleは、検査を弱めるのではなくpolicy例外として表現します。

## 開発

```bash
pnpm run check
```

このcheckは型検査、lint、test、生成README検証、`dist/`再現性、repository policy検証、npm package dry-runを実行します。

## リリース

`package.json`をversionの正本にします。公開前に次を実行します。

```bash
pnpm run check
npm pack --dry-run --ignore-scripts
```

release artifactには`dist/example-extension.js`、`dist/extension-manifest.json`、`README.md`、`README.ja.md`、`LICENSE`を含めます。

## ライセンス

SPDX-License-Identifier: MPL-2.0
