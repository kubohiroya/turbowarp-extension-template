# 段階1: 参考scene/note契約

追跡: https://github.com/kubohiroya/turbowarp-extension-template/issues/29 。共通親はextension-data-editor #18。

`./editor-schema`はexampleSchemaBundles.scene/note、decodeExampleSource、validateExampleSourceを公開する。正本は既存schemas/scene-properties.schema.jsonとnote-properties.schema.jsonで、draft-07を明示する。JSON/YAMLのsource・raw data・formatを保持し、defaultを挿入しない。

追加のowner意味条件はない。既存フォームの構造条件をheadlessで検証するための入口であり、通常のsceneJson/noteYaml reporterがsourceを返す動作を狭めない。既存block-editors登録とUI設定は変更しない。新しい拡張editor登録やbindingは追加しない。

確認: 型検査、新adapterと既存登録/extensionの15テスト、既存Vite＋独立JS/型/resource emit、srcなしDOM/Reactなしisolated importとskipLibCheck:falseのconsumer型検査が成功。既存JSON/YAML fixtureの受理、追加データ保持、不正構造/形式の拒否、source不変を確認した。

共通型/検証依存を検証済みGit commit a1ab4f4f5b384eef08ef26e544186ee9d8ad4543へ固定する。npm publishやGUIの依存変更は含めない。既定OFFのGUIフラグは保持し、新pure入口の利用停止/本Issueのcommit revertでrollbackできる。保存済みsourceの移行は不要。段階2以降のbinding・候補UI、Schema自体や任意Schemaによるフォームは後段。

## S1-5の最終確認

対象は合計15ケース（増分検証を含む）。srcを除いた実packageでReact不在・DOM/VM/通信globalアクセス0、skipLibCheck:falseの型検査を確認し、独立生成4ファイルを再emitと全SHA-256照合した。16契約の横断fixtureと依存artifact照合の記録は共通repoのschema-stage1-*.jsonを参照。既存生成基準は保持する。
