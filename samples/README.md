# 実行できるサンプルの保守

`hello-world.sb3`は、緑の旗で`hello [NAME]`ブロックを実行し、
`Greeting`変数に`Hello, world!`を表示します。名前を変えると結果も変わります。

## ファイル構成

- `manifest.json`: PagesのURL、拡張ID・JSパス・sandbox条件、サンプル名と期待結果。
- `<name>/project.json`: Scratch 3の編集可能なプロジェクト。変数・リストは初期状態を保存します。
- `<name>/backdrop.svg`: 自作の説明用背景。外部の素材は不要です。
- `<name>.sb3`: 上記から生成してコミットする配布ファイル。

リポジトリ指定のNode.js（`.nvmrc`）で、追加パッケージなしに実行できます。

```bash
node scripts/build-samples.mjs          # pnpm run samples:build
node scripts/build-samples.mjs --check  # pnpm run samples:check
node scripts/prepare-pages.mjs         # pnpm run pages:build
```

`project.json`の`costumes[].md5ext`は、ソースディレクトリ内の素材ファイル名です。
生成時に素材のMD5とScratch標準のファイル名へ変換し、`extensions`と`extensionURLs`を
設定します。ZIP内の日時を固定するため、同じ入力から同じバイト列を生成します。
`--check`はディスクへ書き込まず、opcode・参照・拡張IDとコミット済みSB3を検査します。
拡張JSを更新した場合も、`samples:build`でSB3を再生成して差分を確認します。

## サンドボックスなしの実行

`extension.unsandboxed: true`の場合、コミット済みの拡張JSを`data:` URLとしてSB3へ
同梱します。TurboWarp公式Editorは、任意のHTTPS URLを参照するプロジェクトには
サンドボックスなしの選択肢を出しません。同梱した拡張では、通常の確認画面で
利用者自身がサンドボックスなしの実行を選択できます。自動で許可する処理はありません。

`extension.unsandboxed: false`の場合は、Pages上の拡張JSのHTTPS URLを記録します。
このテンプレートの`hello`はsandbox互換なので`false`です。拡張の確認画面で
**Allow**し、緑の旗を押してください。JS取得にはインターネット接続が必要です。

## 新しい拡張へ適用する手順

1. `src/config.ts`と`src/block-definitions.json`で拡張ID・slug・ブロックを確定します。
2. `samples/manifest.json`の`baseURL`・`extension.id`・`extension.bundle`・
   `extension.unsandboxed`を実際の値に合わせます。IDは生成済みJSのヘッダーとも検査します。
3. `hello-world`ディレクトリを内容に合う名前に変更し、実際の拡張ブロックを使う
   `project.json`・説明用背景・`manifest.json`のサンプル名と期待結果を編集します。
4. 拡張をビルドしてから`pnpm run samples:build`を実行し、SB3もコミットします。
5. 日英READMEと`docs/index.html`のEditorリンク・ダウンロード・期待結果を更新します。
6. `pnpm run samples:check`と`pnpm run pages:build`を実行します。
7. 公開後、新しいブラウザセッションで権限確認・緑の旗・停止・再実行を確認します。

サンプル追加時は`manifest.json`の`samples`へ追記し、同名のディレクトリに元データを
用意します。カメラ・API・外部サービスを使う場合は、必要な資源と準備をREADMEに記載し、
秘密情報や個人情報をSB3に保存しません。`hello-world`は新しい機能を実証するデモへ置き換えます。

## PagesとREADMEの約束

`pages:build`は`_site/`へ`docs/`・`dist/`・登録されたSB3を集めます。
Pages workflowはこれを公開します。元データやビルド用スクリプトは配信物へコピーしません。

Editorリンクは`https://turbowarp.org/editor?project_url=`に
`<baseURL>samples/<name>.sb3`をURLエンコードして付けます。
READMEと日英ガイドにはEditorリンク・直接ダウンロード・実行操作・期待結果を記載します。
任意の外部URLからの取得にはCORSが必要で、GitHub Pagesは対応しています。
[TurboWarp公式仕様](https://docs.turbowarp.org/url-parameters)を参照してください。

公開後はSB3とJSがHTTP 200で取得できることに加え、権限確認から緑の旗までを
新しいブラウザセッションで確認してください。切戻しはリンクとサンプル配信追加のrevertです。
