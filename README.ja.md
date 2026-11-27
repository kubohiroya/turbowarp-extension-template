# TurboWarp-Extension-Template

<img src="assets/block-icon.svg" alt="" width="48" height="48">

[English](README.md) | 日本語

ViteでTurboWarp拡張機能を開発、テスト、ビルド、リリースするための再利用可能なTypeScriptテンプレートです。

## 利用者ガイド

このテンプレートからリポジトリを作成し、packageと拡張機能metadataを置き換え、`src/extension.ts`でブロックを実装し、生成済みartifactをコミットします。

参照用にtemplate packageを使う場合はversionを固定します。

```bash
pnpm add --save-exact @kubohiroya/turbowarp-extension-template@0.13.0
```

## できること

- TurboWarp互換の単一JavaScript拡張ファイルをビルドします。
- 決定的な`dist/extension-manifest.json` API契約を出力します。
- JavaScriptとAPI manifestの出力後に、拡張IDと両ファイルのSHA-256を記録した`dist/extension-development.json`を確定します。TurboWarp Plus Desktopはこの情報を使い、選択したローカル開発フォルダーから`pnpm dev`による再ビルドも含めて完成した成果物を取り込みます。
- `src/block-definitions.json`からREADMEのブロック参照を生成します。
- source、document、生成済み`dist/`、repository policy、npm package内容を一括検査します。

## 実行できるサンプル

[**TurboWarp EditorでHello Worldを開く**](https://turbowarp.org/editor?project_url=https%3A%2F%2Fkubohiroya.github.io%2Fturbowarp-extension-template%2Fsamples%2Fhello-world.sb3) · [SB3をダウンロード](https://kubohiroya.github.io/turbowarp-extension-template/samples/hello-world.sb3)

機能拡張の読み込みを許可して緑の旗を押すと、`hello [world]`の結果を
`Greeting`変数に`Hello, world!`と表示します。
ブロックの名前を変更して再実行できます。
このサンプルはsandbox互換で、拡張JSをGitHub Pagesから取得します。

このテンプレートから作る拡張には、実際の提供ブロックを使った最小デモを
`samples/<内容を表す名前>.sb3`として添付します。日英READMEとPagesガイドに
Editorで開くリンク・ダウンロード・実行手順・期待結果を記載し、挨拶のサンプルは
その拡張の機能を実証する内容に置き換えます。

```bash
pnpm run samples:build  # 元データ・拡張JSの更新後にSB3を再生成
pnpm run samples:check  # 生成差分・ブロック参照・opcodeとツールの検証
pnpm run pages:build    # docs・dist・SB3を_site/へ集約
```

`samples/manifest.json`にPages URL・拡張ID・JSパス・sandbox条件・期待結果を設定し、
`samples/<name>/`に編集可能な元データを保存します。サンドボックスなしで動く拡張は
`extension.unsandboxed: true`とし、コミット済みJSをSB3へ同梱して通常の同意画面を
表示します。[適用手順と保守方法](samples/README.md)を参照してください。

npm tarball と GitHub Release に同じ `dist/extension-package.json` と、そこから参照する
JavaScript・API manifest、`LICENSE`、リソース宣言が入ります。
`pnpm run check:distribution` は実際の npm tarball と Release ZIP を展開し、リポジトリと照合します。
タグを付ける前にビルド後の配布ファイルをコミットします。
Web Editor は GitHub の確定コミットからブラウザーで取得し、Release の添付物が報告する
SHA-256 と一致したファイルを使います。

ソースリポジトリの `extension-build.json` は、ホストが使う標準ビルドの入口と入力ファイルを宣言します。
拡張の設定は `src/extension-config.json` だけを編集します。TypeScript の設定入口はこの JSON を参照します。
ホストの標準レシピには npm のインストールやリポジトリ側の設定コードの実行を要求しません。
ソースから扱うには、宣言中の lockfile も揃ったリポジトリのスナップショットを使います。
`pnpm dev` の実行中に設定・ブロック定義・package.json を変更した場合はビルドを再起動します。対応するビルドプラグインを使用している場合、開発ビルドは元のソース本文を含まないソースマップを生成し、ファイル名と SHA-256 を `extension-development.json` に記録します。通常の `pnpm build` は開発用ソースマップを生成しません。
[配布・開発時の契約](docs/distribution.ja.md)に配置と完成ビルドの確認手順を記載しています。

独自拡張の作者名・npm スコープは自由です。TurboWarp Plus のカタログ登録や fork 履歴は導入条件ではありません。

## 要件と安全性

- Node.js 24以上
- Corepack経由のpnpm
- `unsandboxed: true`を設定した拡張機能ではTurboWarpのunsandboxed extension option

信頼できる生成済み拡張コードだけを読み込んでください。unsandboxed extensionはブラウザページへアクセスできます。

## インストール

```bash
npm install --global corepack@latest
corepack enable
pnpm install --frozen-lockfile
```

## クイックスタート

1. このテンプレートからリポジトリを作成します。
2. `package.json` metadataと`repo-policy.json`を更新します。
3. `src/extension-config.json`を編集します。
4. `src/block-definitions.json`にブロックを定義します。
5. `src/extension.ts`に実行時の動作を実装します。
6. `pnpm run docs`を実行します。
7. `pnpm run check`を実行します。

開発中に継続ビルドする場合:

```bash
pnpm run dev
```

## TurboWarp Plus 共通の約束事

[TurboWarp Plus ファミリー](https://kubohiroya.github.io/turbowarp-plus-packages/)の
リポジトリは、人だけでなくファミリーのダッシュボードからも読まれます。そのため
READMEの冒頭とブロックアイコンの扱いは、どのリポジトリでも同じ形にします。

### README

英語版・日本語版のどちらも、冒頭は次の形です。

```markdown
# TurboWarp-<Extension-Name>

<img src="assets/block-icon.svg" alt="" width="48" height="48">

English | [日本語](README.ja.md)

<この機能拡張が何をするかを1段落で書く。>
```

- 正本の英語ファイルは`README.md`、日本語は`README.ja.md`です。`README_ja.md`は作成しません。
- 言語切り替え行は両言語を並べ、他方だけをリンクにします。`README.md`では`English | [日本語](README.ja.md)`、`README.ja.md`では`[English](README.md) | 日本語`です。
- H1直下の最初の段落が、そのファイルの言語で書いたパッケージの説明文です。ダッシュボードはこれを対応する言語の列に表示し、その上のアイコン行と切り替え行は読み飛ばします。ここは散文にします。バッジ行・箇条書き・表を置くと、そのパッケージには表示できる説明文が無くなります。
- 日本語の段落を`@kubohiroya/<package> は、`で始めません。ダッシュボードの行にはすでにパッケージ名があり、その書き出しは落とされます。
- `README.ja.md`が無いリポジトリは、両言語とも英語の説明文で一覧に出ます。日本語版の残りが短くても、この段落だけは書きます。

### ブロックアイコン

- `assets/block-icon.svg`をコミットし、`src/extension-config.json`の`blockIconURI`と同じ図柄にします。`pnpm run repo:check`がURIをデコードして両者を比較します。
- `blockIconURI`は自己完結した`data:image/svg+xml;base64,...`のままにします。機能拡張は単一ファイルとして読み込まれるためです。GitHubは`<img src>`の`data:`URIを描画せず、ダッシュボードはコミットされたファイルを読みます。両方が必要な理由はこれです。
- ファイルは純粋な図形だけにします。ダッシュボードは読者の配色に追従させるためにSVGをインライン展開し、`<script>`・`<foreignObject>`・イベントハンドラ属性・`javascript:`URLは書き換えずに拒否します。
- `package.json`の`files`に`assets/`を含めます。npm上のREADMEでもアイコンが表示されます。

### 公開ドキュメント

`docs/index.html`はファミリー共通ヘッダーを読み込みます。

```html
<script type="module"
        src="https://kubohiroya.github.io/turbowarp-plus-site-header/dist/auto.js"></script>
```

ヘッダーはshadow root内へ自分を挿入するため、ページ側のスタイルシートと互いに
干渉しません。ヘッダーの変更は、このリポジトリを再び編集しなくても反映されます。
ページは`color-scheme: light dark`を宣言し、読者の設定に追従させます。
ダッシュボードは各サイトをライトとダークの両方で撮影するため、ライト専用の
ページは暗い表の中で穴のように見えます。

## 機能拡張をつくるときのチェックリスト

検査で決められることは`pnpm run check`が決めます。以下は検査では決められず、
最初のリリース後よりも前に片付けたほうが楽な項目です。

**識別子（誰かがプロジェクトを保存する前に決める）**

- [ ] `src/extension-config.json` の `id`は最終的な拡張IDになっている。保存された全プロジェクトがこのIDを記録するため、後からの変更にはビルドのやり直しではなくmigrationの明示が必要です。
- [ ] opcode・引数ID・引数型が、そのまま維持できる名前になっている。これらもプロジェクトに保存され、`dist/extension-manifest.json`がAPI契約として記録します。
- [ ] 製品名は全ての構成語をハイフンで連結している（`TurboWarp-Asset-Manager`）。READMEのH1、`repo-policy.json`の`productName`、`src/extension-config.json`の`name`、npmパッケージ名が一致している。
- [ ] `src/extension-config.json`の`slug`が、利用者にダウンロードさせたいバンドル名になっている。README・CDN・あらゆるインストール手順に現れます。

**ブロック**

- [ ] ブロックの定義は`src/block-definitions.json`だけにある。READMEのブロック参照とmanifestはそこから生成され、手書きの写しは必ずずれます。
- [ ] 利用者に見える文字列は`Scratch.translate()`を通し、識別子と保存値は言語に依存させない。
- [ ] 各ブロックが有効な値を返すか、予測可能な形で失敗する。プロジェクト停止時・再読込時・無効な入力時の動作を含め、READMEに書く。
- [ ] `unsandboxed`を`true`にするのは、実際にbrowser APIがそれを要求する場合だけ。何が要求しているのかをREADMEに書く。

**ドキュメントとアイコン**

- [ ] 各READMEの最初の段落が、そのファイルの言語で書かれた、ダッシュボードに出る説明文になっている。
- [ ] ブロックアイコンがこの機能拡張を表す図柄になっている（テンプレートの3色ブロックのままにしない）。`assets/block-icon.svg`と`blockIconURI`が同じ図柄である。
- [ ] GitHub PagesをAPIで有効化し、`docs/index.html`が全登録ブロックを`#block-<opcode>`の固定アンカー付きで説明し、`docsURI`が実URLを指している。[必須手順](docs/github-pages-setup.ja.md)を参照。
- [ ] `repo-policy.json`がこのリポジトリ自身の値を記録している。実際の差異は検査を弱めるのではなく、明示的な例外として表現する。

**公開前**

- [ ] `dist/`をコミットし、再現可能にしている。利用者はNode.jsなしで機能拡張を読み込めます。
- [ ] 両READMEのversion固定インストール例が`package.json`と一致している。
- [ ] `npm pack --dry-run`の内容にバンドル・manifest・両README・`LICENSE`・`assets/`が含まれ、未検証のファイルが入っていない。
- [ ] ファミリーのダッシュボードへ掲載したい場合のみ、任意で[`catalog.yaml`](https://github.com/kubohiroya/turbowarp-plus-packages/blob/main/catalog.yaml)へ登録する。npmパッケージにしない場合は`npm: false`にする。独自拡張の導入にこの登録は不要です。

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

## リソース利用の宣言

公開前に `package.json` の `turbowarpExtension.resourceDeclaration` を確認してください。挨拶だけの雛形は空配列です。カメラ・マイク・ネットワーク・Bluetooth・USB・ブラウザ内の永続保存・選択したファイル・音声出力を加えるときは、共有・間接利用も含めて更新し、空配列のままにしないでください。用途、利用条件、通信方向・内容を日英で記録し、同梱CLIや別アプリの動作とは分けます。`@kubohiroya/turbowarp-extension-manifest/resources`（0.6.0以降）の `readPackageResourceDeclaration` で検証できます。同じ宣言が追加画面・Plusダッシュボード・作品を開くときの確認に表示されます。ブラウザの許可を付与するものではありません。[共通契約](https://github.com/kubohiroya/turbowarp-extension-manifest#リソース利用の宣言)も参照してください。
