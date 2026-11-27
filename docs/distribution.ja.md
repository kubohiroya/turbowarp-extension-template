# 配布と開発ビルド

[English](distribution.md) · [Issue #56](https://github.com/kubohiroya/turbowarp-extension-template/issues/56)

## 配布物の配置と正本

作者・npm スコープ・Plus カタログへの登録・fork 履歴は導入条件にしません。
共通契約の型と検証は `@kubohiroya/turbowarp-extension-manifest` が所有し、Template は生成と配布を担当します。

| 配布物 | リポジトリ | npm tarball の `package/` 以下 | Release ZIP 以下 |
| --- | --- | --- | --- |
| package 名・版・リソース宣言 | `package.json` | `package.json` | `package.json` |
| ライセンス本文 | `LICENSE` | `LICENSE` | `LICENSE` |
| 配布 descriptor | `dist/extension-package.json` | 同左 | 同左 |
| API manifest | `dist/extension-manifest.json` | 同左 | 同左 |
| JavaScript | descriptor の `bundle.file` を `dist/` に置く | 同左 | 同左 |

descriptor の `bundle.file` と `api.file` は descriptor 自身のディレクトリを基準にした basename です。
package 名から JS の名前を推測しません。リソース宣言は `package.json` の
`turbowarpExtension.resourceDeclaration` を正本とし、descriptor に同じ内容を埋め込みます。
設定は `src/extension-config.json`、ブロック定義は `src/block-definitions.json` を編集します。

Release ZIP は従来の利用手順のために同じ JS を ZIP 直下にも残します。
Release の個別添付物には JS・descriptor・API manifest・LICENSE と npm tarball があります。
開発用完成通知・ソースマップ・その他の作業ファイルは ZIP へコピーしません。
npm のソース同梱範囲は `package.json.files` に明示します。このテンプレートは `src/` を含めます。

## ローカル検証と Release

```bash
pnpm run build
pnpm run check:distribution
pnpm run release:archive  # turbowarp-extension.zip をローカル生成
```

検査はローカルで npm tarball と ZIP を生成・展開し、package.json・LICENSE・descriptor・JS・API manifest の
バイト列をリポジトリと照合します。JS と API のサイズ・SHA-256、API の拡張 ID、package の版・license・
リソース宣言の整合も検査します。配布漏れや内容のずれで失敗し、npm の lifecycle scripts は実行しません。
ZIP のファイル順・時刻・mode は固定し、同じ環境で同じ内容を再生成しても ZIP が変わらないようにします。
ハッシュ一致はコードの安全性や権限付与の証明ではありません。

Release workflow はこの検査が成功してから、同じ生成処理で ZIP を作成します。
公開済み版・タグ・添付物は上書きしません。切り戻しは利用側で前の固定版を選び、
Template の変更は revert して新しい版として配布します。従来の単体 JS と module 入口を維持します。

## Desktop の開発セッション

`extension-build.json` は固定 profile の入力を静的 JSON で宣言します。対応ホストは共有 parser でこれを読み、
ホスト所有の標準レシピを選びます。Template の自己ビルドでは自分の Vite 設定を使いますが、
導入側が metadata のために外部の `src/config.ts`・Vite 設定・package scripts を import/eval する必要はありません。
宣言された lockfile を含むソース snapshot を使用します。custom plugin・lifecycle・native build が必要な構成は
固定 profile の対象外として扱い、任意コード実行へ自動で切り替えません。ビルドの隔離と実行承認はホスト側の責務です。

1. `pnpm run typecheck` で TS のファイル・行番号付き診断を確認し、`pnpm dev` を開始します。
2. 対応 Desktop でローカル開発セッションを開始し、監視対象をこのビルドの `dist/` にします。
3. TS を変更します。JS・API manifest・開発用ソースマップの出力後、`extension-development.json` が
   一時ファイルからの rename で最後に確定します。
4. ホストは通知中の全ファイルを読み、SHA-256 が一致し、読み取り前後で通知内容が同じ場合だけ同じ世代として採用します。
   ファイルの存在や変更時刻だけで完成と判定しません。不一致・途中書き込み・ビルド失敗を反映せず、直前の検証済み結果を保持します。
5. 反映後にブロックを実行します。対応ホストは検証した source map で生成 JS の位置を TS へ逆引きします。
   map はソース本文を含まず、プロジェクト内の `src/` 相対パスだけを保持します。

設定・ブロック定義・package.json を変更した場合は watch を再起動します。
通常の `pnpm build` は map を生成しません。Desktop の監視・TS 逆引き・承認回数と、
ホスト所有レシピとの実行互換性の製品統合検証は、Template のアーカイブ検査とは別に対応ホストで実施します。
Web は公開済み成果物だけを扱い、ソースビルドやローカル開発セッションを開始しません。

現時点の実測と未確認項目は[配布検証記録](distribution-validation.ja.md)を参照してください。
