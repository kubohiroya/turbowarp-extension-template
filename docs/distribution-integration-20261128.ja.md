# Issue #56 の導入・開発ループ追加検証

実施日: 2026-11-28 JST。前回の[配布検証記録](distribution-validation.ja.md)で残した項目について、
公開済み Template 0.13.0 と、PR #61 を取り込んだ main `abbfb9e939d3d34f824540c81c1d6b276c5af103`
を確認しました。画面表示・OS 入力・フォーカス操作は行わず、ブラウザーは全て headless で実行しました。

## 公開済み成果物の取得と Web への導入

`@kubohiroya/turbowarp-extension-template@0.13.0` と
[GitHub Release v0.13.0](https://github.com/kubohiroya/turbowarp-extension-template/releases/tag/v0.13.0)
を実際に取得しました。

- npm tarball と Release 添付 tarball は SHA-256
  `f068d22d999439035f27d3d716b7fc02e332394b3c0aa62525734a8570a67b54` で完全一致しました。
- 公開済み sb3-toolchain 0.31.1 の `resolvePublishedExtension` により、npm integrity、Release の
  asset ID・hash、確定 source commit を検証しました。[取得記録](validation/published-extension-0.13.0-20261128.json)
  に、自己申告 metadata と区別した取得元 lock を保存しています。
- 公開済み ZIP は JS 1 ファイルのみでした。PR #61 の ZIP 修正はまだ公開されていません。

[公開 Web Editor](https://kubohiroya.github.io/turbowarp-plus-editor/) の検証対象は以下です。
検証前後の `build-info.json` はバイト一致しました。

| 対象 | リビジョン・版 |
| --- | --- |
| Editor site | `25655d487b20630f77f61cc2397991e25f9bbe55` |
| Scratch GUI | `60b87e2f2503206847f509285aa4de3cee3670c7` |
| Scratch VM | `88a2c06e9deb3dd652c52c20daf4f728b387d41d` |
| Loader | `0.16.3` |
| Security dialog | `0.14.3` |

同じ Editor commit の `test/e2e/extension-loader/published-distribution.spec.cts` を基に、
カタログ応答を空にした状態で npm と Release の導入経路を各 1 件確認しました。
取得確認だけでは登録されず、利用者の許可後に sandbox iframe が 1 個作られ、保存情報は
`execution: sandboxed`・`embedded-file`・`version: 0.13.0` になり、実際の Scratch ブロックが
`Hello, Scratch!` を返しました。npm は 2.7 秒、Release は 3.3 秒で成功しました。

公式テストの入力欄名は現行 UI とずれており、最初は locator 待ちで timeout しました。
検証用コピーだけで入力欄の名前を `/^npm パッケージまたは GitHub/u` に対応させました。
製品コード・Editor の作業ソースは変更していません。また macOS の single-process Chromium は
次の context 作成時に終了したため、Release 経路だけを独立プロセスで再実行して成功しました。
元の失敗を「全テスト成功」とは扱わず、成功した経路を分けて記録しています。

## Desktop の外部 watch・ブロック実行・TS 診断

インストール済み Desktop 1.19.0 の ASAR を検証用ディレクトリへ展開し、実 renderer と IPC を使用しました。
このビルドは[公開済み開発版 v1.19.0-dev.c23e4fe](https://github.com/kubohiroya/turbowarp-plus-desktop/releases/tag/v1.19.0-dev.c23e4fe)
と同じ source revision です。安定版や最新 Editor を組み込んだビルドの結果とは区別します。
公開済みの利用環境との互換性確認を目的に、意図してその固定版を使用しました。

| 対象 | リビジョン |
| --- | --- |
| Desktop source / build-info | `c23e4fe3e8c760705d79455c94ffe7885f2a7c2d`、dirty=false |
| Desktop の Editor pin / build-info / テスト checkout | `cd135d8a668a5843d59ed84707419e20c4f7d630` |
| GUI / VM | 上の Web 検証と同じ |

Desktop の同じ commit にある `test/local-extension-development.browser.js` を使用し、
source map と runtime diagnostic の検査を有効にして 1 件成功しました。

- 2 つの開発フォルダを個別に承認し、同じ作品内で監視・停止・再開できる。
- 実際の Vite watch で TS を変更すると、自動反映後に同じ Scratch の assertion が
  `Wrong, Scratch!` の失敗から `Hello, Scratch!` の成功へ変わる。
- 構文エラーでは旧正常版を維持し、修正後に反映を再開する。
- 実行時例外が、適用中の source map により `src/extension.ts:37:43` へ逆引きされる。
- 互換でない opcode の変更を拒否し、修正後に正常版へ戻る。未保存の作品変数を保持する。
- TS 書き込みから更新検出までの 1 回の測定値は 1050 ms。テスト全体は約 8.7 秒。

実行条件は次の通りです。`DESKTOP_SOURCE` は配布物の build-info と同じ commit の checkout、
`APP_SOURCE` はその ASAR の展開先、`EDITOR_SOURCE` は上の固定 Editor checkout です。

```sh
cd "$DESKTOP_SOURCE"
TW_PLUS_EDITOR_SOURCE="$EDITOR_SOURCE" \
TW_PLUS_EXTENSION_TEMPLATE_ROOT="$TEMPLATE_SOURCE" \
TW_PLUS_TEST_EXTENSION_JS="$TEST_EXTENSION_JS" \
TW_PLUS_DESKTOP_APP_SOURCE="$APP_SOURCE" \
TW_PLUS_EXPECT_DEVELOPMENT_SOURCE_MAP=1 \
TW_PLUS_EXPECT_RUNTIME_DIAGNOSTIC=1 \
node --test test/local-extension-development.browser.js
```

テスト拡張の JS は SHA-256
`7f6541ce906594cde7d02498c65e8a800f0c194a924d288f9de4d702e738d868` と一致しました。
外部アクセスのあるカタログは fixture 応答に置き換え、renderer は ASAR からローカルで配信しました。

別途、最新 Desktop main `d3a1fb6fd99c3630a1437f503d0ffeba67b9b5bf` の
`local-extension-development.test.js` と `local-extension-source-build.test.js` は 9 件成功、2 件 skip でした。
skip は専用 compiler payload・Electron 実行環境を要する検査です。内蔵コンパイラーの OS 隔離や
最新版 Desktop の source watch を本検証で確認したとは扱いません。

## 0.13.1 候補と残る公開後確認

PR #61 の ZIP・LICENSE 配布修正を含む 0.13.1 をローカルで準備しました。
版の更新では JS と API manifest のバイト列を変更せず、descriptor の version と README の例を更新します。
リリース候補に対する `pnpm run check` は成功しました。型検査・lint・Vitest 25 件・生成文書と
生成物の差分・module consumer・実 npm/ZIP の整合・repository policy・package dry-run・サンプル 8 件を含みます。
公開後は新しい npm・Release・ZIP を再取得して照合する必要があります。
0.13.1 の push・PR・merge・tag・Release・npm publish は、この検証の実行には含めていません。
Issue #56 は公開後確認まで open とし、公開済み 0.13.0 の成果物は変更しません。
切り戻しは利用側で 0.13.0 に固定し、source・作品・既存公開物を保持します。
