> **履歴資料：旧サンプル撤去前の採取記録**
>
> 以下の「現在」「現行」、API・依存pin・テスト・再現手順は、旧サンプル撤去前の各採取時点を指します。現行Templateは `sceneJson` / `noteYaml`、サンプルSchema、`./editor-schema`、編集用の公開API・専用依存を提供しません。本文の旧値・検証結果は履歴として保持しています。
>
> 現行の構成と互換性への影響は[旧サンプルの撤去・移行文書](template-examples-migration.ja.md)、任意の編集機能を導入する場合は[現行ガイド](block-editors.ja.md)を参照してください。

> 現在のCI修正・依存artifactの検証は [editor-schema-ci-fix-20261018.ja.md](editor-schema-ci-fix-20261018.ja.md) / [JSON](editor-schema-ci-fix-20261018.json) を参照。以下の旧pin・検証結果は採取時の履歴として保持する。

# 段階1: 参考scene/note契約

> 現在のGit依存固定・実解決・検証結果は[editor-schema-publication.ja.md](editor-schema-publication.ja.md)と同名JSONを参照。以下は依存更新前の採取履歴として保持する。

> 2026-10-18レビューR2修正追補: 現在はHEADに対するローカル未コミット差分。関連16テストと新しいsource/emit hashをeditor-schema-verification.jsonへ反映した。下記の従来結果は履歴として保持する。

形式不正時のscopeはown data descriptorだけからconsumerIdを取得する。JSON/YAML両方でgetter/null/undefined contextを渡してもgetterを実行せず、生例外やその文面を返さない。元sourceを保持し、復号成功後の不正contextは共通guardで拒否する回帰を追加した。

追跡: https://github.com/kubohiroya/turbowarp-extension-template/issues/29 。共通親はextension-data-editor #18。

`./editor-schema`はexampleSchemaBundles.scene/note、decodeExampleSource、validateExampleSourceを公開する。正本は既存schemas/scene-properties.schema.jsonとnote-properties.schema.jsonで、draft-07を明示する。JSON/YAMLのsource・raw data・formatを保持し、defaultを挿入しない。

追加のowner意味条件はない。既存フォームの構造条件をheadlessで検証するための入口であり、通常のsceneJson/noteYaml reporterがsourceを返す動作を狭めない。既存block-editors登録とUI設定は変更しない。新しい拡張editor登録やbindingは追加しない。

確認: 型検査、新adapterと既存登録/extensionの15テスト、既存Vite＋独立JS/型/resource emit、srcなしDOM/Reactなしisolated importとskipLibCheck:falseのconsumer型検査が成功。既存JSON/YAML fixtureの受理、追加データ保持、不正構造/形式の拒否、source不変を確認した。

共通型/検証依存を検証済みGit commit a1ab4f4f5b384eef08ef26e544186ee9d8ad4543へ固定する。npm publishやGUIの依存変更は含めない。既定OFFのGUIフラグは保持し、新pure入口の利用停止/本Issueのcommit revertでrollbackできる。保存済みsourceの移行は不要。段階2以降のbinding・候補UI、Schema自体や任意Schemaによるフォームは後段。

## S1-5の最終確認

対象は合計15ケース（増分検証を含む）。srcを除いた実packageでReact不在・DOM/VM/通信globalアクセス0、skipLibCheck:falseの型検査を確認し、独立生成4ファイルを再emitと全SHA-256照合した。16契約の横断fixtureと依存artifact照合の記録は共通repoのschema-stage1-*.jsonを参照。既存生成基準は保持する。
