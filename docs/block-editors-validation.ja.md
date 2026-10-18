# Issue #21の検証記録

日付: 2026-10-18（日本時間）。対象: [テンプレート #21](https://github.com/kubohiroya/turbowarp-extension-template/issues/21)。
初回ローカル実装・検証、公開後のCI統合確認、改名後のnpm配布物の確認を区別して記録しています。

## 現在の公開版と改名後の確認

[参照更新 #25](https://github.com/kubohiroya/turbowarp-extension-template/issues/25)で、現行ガイド・結合テストの案内を新名へ更新しました。
共通基盤は`@kubohiroya/turbowarp-extension-data-editor@0.1.0`、公開元は`9e041e5278a1ea70146a76c10732d1401955a12a`です。
scratch-guiのdevelopと公開GUIはこのnpm版を固定して使用します。現在の再現手順は[日英ガイド](block-editors.ja.md)を参照してください。

今回の確認では、npm配布物とReact/ReactDOM 16.14.0を隔離インストールし、生成した拡張JSによるJSON/YAML結合テスト2件が成功しました。
テンプレートのビルドと`tests/block-editors.test.ts`の10件も成功しています。
最初の単独インストールではReactDOM peerがなくRJSF入口を読み込めなかったため、日英の再現手順へ両peerの明示インストールを追加して解消しました。

以下の未公開`0.0.0`、ブランチ、SHA、件数は当時の結果です。現在の公開版を指す値に置換せず、初回の検証記録として保持します。

## CI統合時の対応版

- 共通API基盤: [PR #3](https://github.com/kubohiroya/turbowarp-extension-data-editor/pull/3)。CI追加後の型検査・ビルド・29テストが成功し、mainへ統合済み。
- JSON/YAML対応: [PR #4](https://github.com/kubohiroya/turbowarp-extension-data-editor/pull/4)。型検査・ビルド・38テストが成功し、mainへ統合済み。対応コミットは`2f45521fdac9bd3759525d6a50369ebdb355805a`。
- GUI基盤: [PR #3](https://github.com/kubohiroya/scratch-gui/pull/3)。共通APIの固定取得と専用エディター17テストをCIへ接続し、成功確認後にdevelopへ統合済み。
- GUIのYAML対応: [PR #5](https://github.com/kubohiroya/scratch-gui/pull/5)。検証対象headは`86f5b75d9b8077224dcc1dde098328172dbe5b51`。通常CIとPagesの両方で上記のマージ済み共通APIを固定参照。

当時は共通APIのソースを公開済みで、npmパッケージは実験的な未公開`0.0.0`を維持していました。
以降のブランチ名・ハッシュ・未pushの記述は初回ローカル検証時点の記録です。

## ブランチと依存順序

| リポジトリ | ブランチ | 変更 |
|---|---|---|
| turbowarp-extension-data-editor | `feat/editor/session-contract` | format契約、JSON/YAML codec、保存、境界テスト |
| turbowarp-extension-template | `feat/template/schema-block-editors` | 静的Schema、JSON/YAMLサンプル、登録・解除、配布・文書 |
| scratch-gui | `feat/site/github-pages`（既存作業ブランチ） | webpackの既存Babel対象へyamlを加える1行 |

直列: 共通APIのJSON/YAML対応をビルド → GUIを再ビルド → 拡張JSを読み込んで統合確認。
テンプレートとGUIは、今回の共通API修正を含むビルドを必要とします。
当時の共通APIは未公開の`0.0.0`のため、当時の記録では公開済みの依存版として扱っていません。

`apiVersion: 1`だけではJSON専用の旧版を区別できないため、今回の対応版を次で識別します。
共通側の基点コミットは`5e8b76d2834be2d699737b6c8b4a0a9990796f92`、
GUI側は`05501106a6d867382e37cf6f7564407df28a106f`で、いずれもローカル差分を含みます。
共通側は`yaml` 2.9.1とRJSF 5.24.13を使用しています。

| 対応版 | 指定順のソースファイル | SHA-256 |
|---|---|---|
| 共通API | `src/rjsf.ts`, `src/codec.ts`, `package.json`, `pnpm-lock.yaml` | `ad5a3512ed9ebe92596cfd02f9cc3b237a5e5079ee80481e753fc8e60bb971f7` |
| GUI | `src/lib/tw-block-editor-service.js`, `webpack.config.js` | `8e48673d014fd7059c2e60bce55d0a0a06993b96c172e86c19e74a42e5f7f49c` |

各ハッシュは、指定順にUTF-8の相対パス・NUL・ファイル内容・NULを連結して計算しています。
公開された版を導入する際はこの作業コピーへの依存を置き換え、JSON/YAML結合テスト後に依存版を固定します。

## 受け入れ結果

- [x] `schemas/`の異なるSchemaを静的importし、完全なopcodeと`SOURCE`を対応づける。
- [x] 既存`hello.NAME`を維持し、JSON/YAMLの文字列をそのまま返す2ブロックを追加する。
- [x] JSON/YAML両方の読込・編集・保存・再オープンを実共通APIと生成済みJSの結合テストで確認する。
- [x] required・型・範囲の検証を通し、invalidはSave無効、直接の保存経路でも拒否する。
- [x] RJSFの入力、Cancel、非同期検証中の編集・二重保存・終了の抑止、登録解除、API不在を対象テストで確認する。
- [x] 実ブラウザで両サンプルの既存アイコンからフォームを開く。
- [x] 編集中は元文字列・VM・Undoを変更せず、保存はUndo/Redo各1回。イベント反映後のVMと画面の一致を確認する。
- [x] Cancel後の値とUndo/Redoスタックが変わらない。
- [x] 両形式を含む`.sb3`を生成・ダウンロードし、新しいページへ再読込してフォーム表示と再編集を確認する。
- [x] フラグOFFの新しいページで同じ`.sb3`を読み込み、API不在・入口0個・既存helloと両Reporterの通常実行を確認する。
- [x] 型検査・限定lint・ビルドとnpm pack dry-runでSchema配布を確認する。
- [x] 方言・参照・YAML書式保持の制約とロールバックを文書化する。
- [x] 追加コメントの配置・fixture名を合わせ、同一Schemaを両形式で共用できることを確認する。
- [x] 再初期化では編集登録だけを解除し、無関係な拡張リソースを破棄しないことを確認する。

## 自動検証

初回実装時はテンプレートの型検査、変更ソースとテストのlint、Vitest 14件、実ホストとの結合テスト1件を確認しました。
共通側は型検査とビルド、`test/codec.test.mjs`と`test/schema-editor.test.mjs`の16件を対象とします。
共通テストにはYAML構文エラー、非対応値、未編集プロパティ、変更なしの保存、非同期検証が含まれます。
GUIはyamlのBabel変換を含む開発webpackのコンパイル成功を確認しました。
安定版リリース向けの全体検証は実行対象に含めていません。

### 追加コメントの反映後

[追加コメント](https://github.com/kubohiroya/turbowarp-extension-template/issues/21#issuecomment-6235994815)に合わせ、
fixtureを`scene.json`と`note.yaml`へ改名し、日英ガイドに配置図・対応表・初期化と終了の具体例を追加しました。
`ScratchApi.gui.blockEditors`は読み取り専用の任意プロパティとし、共通型公開後の型import移行方針を維持しています。
既存拡張への移植時に無関係な資源を破棄しないよう、再初期化では`dispose()`全体を呼ばず編集登録だけを解除します。

型検査、変更ソースとテストの限定lint、`tests/block-editors.test.ts`の10件、ビルド、実ホスト結合テスト2件が成功しました。
追加テストでは再初期化と既存終了処理の分離、同じscene Schemaを`format`だけ変えて登録した際の両形式での保存・不正値拒否を確認しました。
fixtureの内容とJSON/YAML保存経路は維持しているため、前回の共通側テストとGUI/.sb3検証の結果を使用し、再実行していません。

## 実ブラウザと.sb3

GUI: `http://localhost:8001/editor.html?blockEditorDialogs=1`。
拡張: `http://localhost:8766/dist/example-extension.js`をunsandboxedで実行。
入力は現在の`tests/fixtures/scene.json`と`tests/fixtures/note.yaml`と同じ内容を使いました。
初回の検証時のファイル名は`scene-properties.json`と`note-properties.yaml`で、追記反映時に内容を変えず改名しています。

JSONはtitleを`保存「秋」 & "JSON"`、durationを7へ変更しました。
YAMLはtitleを`保存「秋」 & "YAML"`、bodyを`更新した一行目 "引用"\n二行目\n`へ変更しました。
どちらも追加の`metadata: {keep: true}`を保持しました。
JSONのduration=0、YAMLの空titleでSaveが無効になることを確認しました。
Undoスタックは保存ごとに1件増え、Undo/Redo各1回で元値と保存値を往復しました。

`vm.saveProjectSb3()`のBlobをダウンロードした検証ファイル:

- ローカルパス: `.playwright-mcp/issue21-json-yaml.sb3`（git無視対象）
- サイズ: 2806 bytes
- SHA-256: `5a5d5b877bd18f1d320de2a6f85c05e1349d948ec88d4aff28eda770cb4b6450`

ZIP内の`project.json`では、両値は通常のtext shadowの文字列として保存されています。
トップレベルは`targets`、`monitors`、`extensions`、`extensionURLs`、`meta`のみで、
ブロックにもSchema・下書き・セッション情報の追加キーはありません。
新しいページの`vm.loadProject()`へダウンロード済みのファイルをそのまま渡し、拡張URLから再登録できました。
JSONのtitle・duration=7とYAMLのtitle・複数行bodyをフォームで確認し、JSONは9へ、YAMLはbodyを再編集して保存できました。

フラグOFFの別ページでは編集APIがなく、編集アイコンは0個でした。
同じファイルから保存値を保持し、VMの通常ブロック経路で`hello`は`Hello, TurboWarp!`、
両サンプルは保存済み文字列そのものを返しました。
API不在での標準TurboWarp相当の登録・実行は自動テストでも確認しています。

OSのファイル選択、実際の標準TurboWarpサイト、全テーマ・翻訳・全対応環境の検証は実施していません。
ブラウザ試験用のsandbox選択は、ローカルサンプルだけをunsandboxedで読み込む設定として行いました。
アプリの権限設定やフラグの既定値は変更していません。

## 運用ログと切戻し

- start: Issue #21と依存Issue・ローカルのJSON専用APIを確認。
- start: ユーザー承認を受け、共通側のJSON/YAML対応とGUIのBabel対象1行変更を追加。
- blocked（解消済み）: 初回型検査のテスト用Cast不足と限定lintのNode組込名を修正。
- blocked（解消済み）: npm cacheの書込制限を避け、`--cache /tmp/issue21-npm-cache`でpack dry-run成功。
- done: 上記の限定検証とGUI/.sb3確認。実装は未コミット・未pushで、Issue更新・PR作成は未実行。
- start: 追加コメントの配置・登録例・移植時の終了処理の注意点を既存実装と照合。
- done: fixture名・型・再初期化を調整し、ガイドと対応版の識別情報を追記。変更範囲のテスト10件・結合テスト2件・型検査・lint・ビルドが成功。外部更新は未実行。
- done: 公開前の差分確認で、YAML複数行記号がREADMEの表を分割しないよう生成時のパイプ文字エスケープを追加。限定lint・型検査と生成結果の再現性を確認。

切戻しは`blockEditorDialogs=1`をURLから外して再読込します。
保存済みJSON/YAMLは通常の文字列引数として残ります。ホスト単一フラグは既定OFFのままです。
外部へのIssue記録・公開は、対象と操作に対する別途の承認後に行います。
