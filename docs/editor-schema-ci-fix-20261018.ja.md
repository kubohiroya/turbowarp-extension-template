> **履歴資料：旧サンプル撤去前の採取記録**
>
> 以下の「現在」「現行」、API・依存pin・テスト・再現手順は、旧サンプル撤去前の各採取時点を指します。現行Templateは `sceneJson` / `noteYaml`、サンプルSchema、`./editor-schema`、編集用の公開API・専用依存を提供しません。本文の旧値・検証結果は履歴として保持しています。
>
> 現行の構成と互換性への影響は[旧サンプルの撤去・移行文書](template-examples-migration.ja.md)、任意の編集機能を導入する場合は[現行ガイド](block-editors.ja.md)を参照してください。

# 段階1: pack 検査の CI 修正（2026-10-18）

## 変更と互換性

`extension-template` の `scripts/check-repo.ts` にある `npm pack --dry-run --ignore-scripts --json` 呼び出しへ `--foreground-scripts=false` を追加した。CI の npm 10.9.8 で lifecycle の stdout が JSON 出力へ混入し、`JSON.parse(stdout)` が失敗する問題への修正である。明示的な CLI 設定により JSON を機械可読に保つ。`--dry-run`・`--ignore-scripts` と既存の梱包内容検査は維持する。

公開 API、JSON Schema、データの読み書き、既存の梱包対象は変更しない。段階2以降の UI 実装、merge、npm 公開は対象外である。依存 artifact 更新後の SHA、pin・lock・実解決、全体の生成物照合は集約した検証記録で対応付ける。この文書の単体検証は依存更新前の共通 `b5f4b8d2e391a0d57d091c8f3e1c2d58da152dc8` と既存 producer pin に対する結果である。

## 検証と受け入れ基準

- `PATH=/tmp/schema-stage1-bin:$PATH npm_config_cache=/tmp/schema-stage1-npm-cache corepack pnpm run check` が終了コード 0。18 テスト成功。typecheck、lint、docs、build と dist、repository policy、pack の検査が成功した。
- Node 26.7.0、npm 11.19.0、packageManager 指定の pnpm 11.11.0 を使用した。
- 子プロセスの `npm` を npm 10.9.8（Node 22.16.0）へ切り替えた `pnpm run repo:check` も終了コード 0。梱包 JSON の parse と既存 policy の全検査が成功した。
- 検査後、追跡済み生成物・既存データ・公開 API に差分がないことを確認した。

| ログ | SHA-256 |
|---|---|
| `extension-template-check.log` | `2132450fb8b8421386fdf6de8d9d81aeac6fcab696c757cca8f5913821a8884b` |
| `extension-template-repo-npm10.log` | `6b0c5217e10070716f2a27162d456c7a39f0d7ecb02420ead4c9713a6a5672cf` |

採取先は `/tmp/schema-stage1-ci-fix-20261018/`。当日の検証時点のログであり、依存 pin 更新後の検証は集約記録を参照する。

## ロールバック

問題が起きた場合、この修正 commit を revert して `--foreground-scripts=false` の追加を戻す。データ形式・公開 API・梱包対象への変更がないため、データ変換は不要である。依存 artifact を同時に戻す場合は集約記録の旧 pin に manifest と lock を揃え、frozen install・実解決・pack 検査を確認する。段階1の UI 登録は既定 OFF のまま保持する。
