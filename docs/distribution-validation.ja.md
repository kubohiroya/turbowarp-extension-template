# Issue #56 の配布検証記録

実施日: 2026-11-27 JST。対象は Template の main
`b4cd60ecf9f2a3094dc446bf1b99dabaeb89517a` を基準とする配布整合修正です。
配布仕様は[配布と開発ビルド](distribution.ja.md)を参照してください。

## 変更範囲と検査結果

Release ZIP に同じ世代の JS・descriptor・API manifest・package.json・LICENSE を含め、
従来の ZIP 直下の JS も維持しました。個別添付物に LICENSE を追加しました。
カタログ掲載を独自拡張の導入条件とする README の記載を修正しました。

- `tests/distribution.test.ts` の 10 件が成功。別作者・別 npm スコープの配布、実アーカイブの整合、
  npm lifecycle 無効化、配布漏れ、同サイズ改変、版・リソース宣言の不一致、開発用ファイルの ZIP 除外、
  同じ環境での ZIP 再生成を確認しました。
- `pnpm run check:distribution` が成功。実 npm tarball と Release ZIP の package.json・LICENSE・
  descriptor・JS・API manifest はリポジトリとバイト一致しました。
- 既存の extension・API manifest・module のテスト 10 件、型検査、変更 TypeScript の lint、
  `check:module`、`repo:check`、生成された dist/lib-module の差分検査が成功しました。

検証環境は macOS、Node.js 26.7.0、pnpm 11.28.8、Vite 8.3.5、Vite 側 Rolldown 1.2.15、
Manifest 0.8.0、Vite extension plugin 0.12.0 です。npm 検査には一時 cache を使用しました。

## 標準レシピとの比較

公開済み `@kubohiroya/sb3-toolchain@0.31.1` の `buildStandardExtension` を使用しました。
追加依存は検証専用ディレクトリへ導入し、Template の依存は変更していません。
入力は `extension-build.json`・package.json・lockfile・src の snapshot のみで、dist を含めていません。
この検証は対応ホストの純粋なビルド API と生成物の比較であり、OS 隔離の安全性を実証するものではありません。

| 項目 | 結果 |
| --- | --- |
| API manifest | バイト一致 |
| 拡張 ID と getInfo のブロック定義 | 一致 |
| 登録回数 | 両方 1 回 |
| sandbox 要求 | 両方 sandboxed |
| hello の実行結果 | 両方 `Hello, Scratch!` |
| 自己ビルド JS SHA-256 | `cc751fb838f60c523b6003b7a960a9b0cafb68146f7f64912951da1e2b630de3` |
| 標準レシピ JS SHA-256 | `6c77149bb4d28879c64bf98c12a9110afba1887bbb5892129e17d68da8b7e0e6` |
| JS バイト一致 | 不一致。実行時契約とは区別して記録 |

標準レシピ側のコンパイラは Rolldown 1.3.3 です。別作者・別 scope 相当の
`@independent-lab/weather` と別 ID・slug にした同じソースでもビルド・登録・ブロック実行が成功しました。
src/config.ts に観測可能な副作用を追加した fixture は、ビルド時に副作用を実行せず処理できました。

## watch の実測と残る受け入れ項目

コピーしたソースで headless の watch を実施し、以下を確認しました。

- TS 変更の前後で完成通知の hash が変わり、通知中の JS・API・source map が全て実ファイルと一致する。
- source map はソース本文を含まず、参照先は `src/` 相対パスまたは `[external]` だけである。
- TS 構文エラーでは TS の位置を含む診断が出て、直前の完成通知が更新されない。修正後は再び完成する。
- 設定 JSON の変更時には再起動要求で止まり、古い metadata を新しい完成結果として通知しない。

最初の sandbox 内実測では macOS の watch が出力まで進みませんでした。同じ fixture を sandbox 外で
再実行すると全項目が成功しました。これは検証環境の制約として記録し、実装不具合とは断定しません。

この差分では Web/Desktop 製品画面の操作、公開済み版の新規導入、Desktop 上の自動反映から TS 位置への
逆引きまでの製品統合検証は行っていません。これらを完了扱いにせず、Issue #56 の受け入れ項目として残します。
公開操作も行っていません。切り戻しは本差分を revert して次版で配布し、利用側は従来の固定版を使用します。

この記録後に行った公開 Web・Desktop の headless 検証は、[2026-11-28 の追加記録](distribution-integration-20261128.ja.md)を参照してください。

## Manifest 0.9.0 の共有 API への接続

2026-11-28 JST、main `abbfb9e9` を基準として Manifest の固定依存を公開済み `0.9.0` に更新しました。
他の依存の解決結果は変更せず、release-age 例外もこの正確な版だけを追加しました。
Vite の descriptor 生成を `createExtensionDistribution` に、repo/npm/Release の検査を
`verifyExtensionDistribution`・`assertDistributionPackage`・`assertDistributionSettings` に接続しました。
source map と開発用完成通知は従来の契約を維持します。

- 配布 14 件・API manifest 2 件・拡張/module 互換 8 件、計 24 件の対象テストが成功しました。
  hash が整合する不完全な API と重複 opcode を `API_MISMATCH` で拒否すること、
  切断した API の `SIZE_MISMATCH`、同サイズ改変の `HASH_MISMATCH`、
  正本と不一致/欠落した resource 宣言の構造化診断、検査中に JS を実行しないことを確認しました。
- 型検査と変更 TypeScript の lint、build、`check:distribution`、`check:module`、`repo:check` が成功しました。
  実 npm tarball と Release ZIP の配布物は repo と byte 一致し、追跡済み `dist/` と `lib-module/` の差分はありません。
- コピーした fixture の headless watch で初回・TS 更新後の完成通知、bundle/API/source map の hash、
  map の相対パスとソース本文の非同梱を確認しました。構文エラー時は直前の完成通知が維持されました。

検証環境は macOS、Node.js 26.7.0、pnpm 11.28.8、Vite 8.3.5、Manifest 0.9.0、
Vite extension plugin 0.12.0 です。module/repo 検査で既定 npm cache の書き込みが sandbox に
拒否されたため、一時 cache を指定して解消しました。キャッシュの所有権変更は行っていません。
今回も Desktop 製品の操作・OS 隔離・公開後導入を確認したとは扱わず、Issue #56 の残項目を維持します。
切り戻しは依存・lockfile・共有 API 接続を本差分の前へ戻し、既存配布物を上書きせず次版で配布します。
