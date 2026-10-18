# Schema正本と候補取得元

2026-10-18の設計スナップショット。[公開範囲と時点の注意](README.ja.md#このスナップショットの読み方)を参照。

[設計と集計](README.ja.md) / [全ブロック](blocks.ja.md) / [全引数](arguments.ja.md)

## Schemaの正本

`reuse`は既存JSON Schema、`reuse-generated`はソース定義から生成されたJSON、`compose-fixed`は既知契約の固定unionまたは形式adapter、`new-fixed`は所有側の型・parserから新設する固定Schemaを示す。予定のパスは未作成。

`authority`は根拠一覧であり、すべてが正本ではない。`canonical_sources`（受入契約の正本）、`generated_files`（生成JSON）、`reference_schema_files`（参照専用）、`generation_sources`（生成処理）を機械可読データでも分離する。A-Frameの公開Schemaは参照専用、現行parserが受入契約の正本。TypeBox/Spec由来のJSONは生成物。19 resourceの内訳は手書き正本7・生成物11・参照用1で、25契約の区分・対象段階は変えない。

### json-value

- 区分: `new-fixed`。入力形式: `json`。
- 正本: [turbowarp-yaml-json/src/yaml-json.ts:19](https://github.com/kubohiroya/turbowarp-yaml-json/blob/a284b6cc45ee1f4f3fc69d769e7a61d085aed611/src/yaml-json.ts#L19)。
- 新設・構成先: `turbowarp-block-editor: JSON互換値用の固定再帰Schema`（計画）。
- 保存契約: 任意JSONの汎用編集。利用者指定Schemaやイベント名から構造を推測しない。

### aframe-template

- 区分: `compose-fixed`。入力形式: `json`。
- 正本: [turbowarp-aframe/src/extension.ts:1236](https://github.com/kubohiroya/turbowarp-aframe/blob/8d05ee87a17ef230afa0f01b31b98282f71996a1/src/extension.ts#L1236), [turbowarp-aframe/src/extension.ts:1242](https://github.com/kubohiroya/turbowarp-aframe/blob/8d05ee87a17ef230afa0f01b31b98282f71996a1/src/extension.ts#L1242), [turbowarp-aframe/src/extension.ts:1285](https://github.com/kubohiroya/turbowarp-aframe/blob/8d05ee87a17ef230afa0f01b31b98282f71996a1/src/extension.ts#L1285), [turbowarp-aframe/src/extension.ts:1308](https://github.com/kubohiroya/turbowarp-aframe/blob/8d05ee87a17ef230afa0f01b31b98282f71996a1/src/extension.ts#L1308)。
- 参照用Schema: [turbowarp-aframe/schemas/aframe-template.schema.json](https://github.com/kubohiroya/turbowarp-aframe/blob/8d05ee87a17ef230afa0f01b31b98282f71996a1/schemas/aframe-template.schema.json)。
- 新設・構成先: `turbowarp-aframe/schemas/block-editor-template-compat.schema.json`（計画）。
- 保存契約: 既存データの互換性を維持する。受入契約の正本は現行parseTemplate/validateTemplateNode。既存JSON Schemaは厳しいため直接の保存ゲートにしない。type/idの空文字、class/classesの重複、attributes/dataの配列・objectを含むJSON値を保持する。recordキーはtrim後非空。未知ノードキー、非objectノード、不正children等の現行拒否条件は維持。フォーム表示/変更なし保存で元sourceのバイト列を維持し、別項目の編集でも未編集の値をString化・正規化しない。既存runtime/schemaの厳格化や自動移行は行わない。

### scene-source

- 区分: `compose-fixed`。入力形式: `json-or-yaml`。
- 正本: `turbowarp-scene-graph/schemas/scene-document.schema.json`（採取時のローカル根拠）, `turbowarp-scene-graph/schemas/scene-node.schema.json`（採取時のローカル根拠）, `turbowarp-scene-graph/schemas/kamishibai-3d-scene-extension.schema.json`（採取時のローカル根拠）, [turbowarp-3d-scene-runtime/src/extension.ts:89](https://github.com/kubohiroya/turbowarp-3d-scene-runtime/blob/aca6edaab457e11f043690c6571ef4c537232148/src/extension.ts#L89)。
- 新設・構成先: `3d-scene-runtime: 固定union adapter`（計画）。
- 保存契約: bare scene、{scene3d,ar}、空文字のno-opを区別。同梱相対ref。

- 純粋検証の間接依存: `3d-scene-runtime → scene-graph 0.2.0 → AR 0.3.0/plan`。参照checkout 0.4.0との同等性は仮定しない。実解決のartifact・版・hashの記録は後続段階の作業資料に分離した。実装時には再確認する。

### diagnostic

- 区分: `new-fixed`。入力形式: `json`。
- 正本: [turbowarp-diagnostic-overlay/src/diagnostic.ts:57](https://github.com/kubohiroya/turbowarp-diagnostic-overlay/blob/a7f516894c2585ae1a195e46f07ac4b9ea842b9a/src/diagnostic.ts#L57)。
- 新設・構成先: `turbowarp-diagnostic-overlay/schemas/diagnostic.schema.json`（計画）。
- 保存契約: 文字数上限・severity・sourceを所有側と整合。追加プロパティの保持方針はparserの正規化と分ける。

### camera-source-profile

- 区分: `compose-fixed`。入力形式: `owner-profile-text`。
- 正本: [turbowarp-camera-source/schemas/camera-intrinsics-v1.json](https://github.com/kubohiroya/turbowarp-camera-source/blob/beece9042d782e30b393a65fcb2d6916589dd063/schemas/camera-intrinsics-v1.json), [turbowarp-camera-source/src/calibration/profile.ts:439](https://github.com/kubohiroya/turbowarp-camera-source/blob/beece9042d782e30b393a65fcb2d6916589dd063/src/calibration/profile.ts#L439), [turbowarp-camera-source/src/calibration/camera-info.ts:133](https://github.com/kubohiroya/turbowarp-camera-source/blob/beece9042d782e30b393a65fcb2d6916589dd063/src/calibration/camera-info.ts#L133), [turbowarp-camera-source/src/calibration/profile-text.ts:16](https://github.com/kubohiroya/turbowarp-camera-source/blob/beece9042d782e30b393a65fcb2d6916589dd063/src/calibration/profile-text.ts#L16)。
- 新設・構成先: `turbowarp-camera-source: 入力variant用Schema/codec`（計画）。
- 保存契約: twcs JSON、legacy twrmc JSON、ROS camera_info YAMLを区別。ROSは同一モデルの単なるYAML表現ではない。

### calibration-profile

- 区分: `compose-fixed`。入力形式: `owner-profile-text`。
- 正本: [turbowarp-camera-calibration/schemas/camera-intrinsics-v1.schema.json](https://github.com/kubohiroya/turbowarp-camera-calibration/blob/ec75f6d07ace3492b0b18b68af2c36594eba4c08/schemas/camera-intrinsics-v1.schema.json), [turbowarp-camera-calibration/src/calibration/profile.ts:149](https://github.com/kubohiroya/turbowarp-camera-calibration/blob/ec75f6d07ace3492b0b18b68af2c36594eba4c08/src/calibration/profile.ts#L149), [turbowarp-camera-source/schemas/camera-intrinsics-v1.json](https://github.com/kubohiroya/turbowarp-camera-source/blob/beece9042d782e30b393a65fcb2d6916589dd063/schemas/camera-intrinsics-v1.json), [turbowarp-camera-source/src/calibration/profile.ts:439](https://github.com/kubohiroya/turbowarp-camera-source/blob/beece9042d782e30b393a65fcb2d6916589dd063/src/calibration/profile.ts#L439), [turbowarp-camera-source/src/calibration/camera-info.ts:133](https://github.com/kubohiroya/turbowarp-camera-source/blob/beece9042d782e30b393a65fcb2d6916589dd063/src/calibration/camera-info.ts#L133), [turbowarp-camera-source/src/calibration/profile-text.ts:16](https://github.com/kubohiroya/turbowarp-camera-source/blob/beece9042d782e30b393a65fcb2d6916589dd063/src/calibration/profile-text.ts#L16)。
- 新設・構成先: `turbowarp-camera-calibration: 入力variant用Schema/codec`（計画）。
- 保存契約: camerasource/camera-intrinsics、twcs、legacy、ROSの固定既知契約。保存だけで旧版を移行しない。

### motion-calibration-import

- 区分: `compose-fixed`。入力形式: `json`。
- 正本: [turbowarp-realtime-motion-capture/src/calibration/controller.ts:188](https://github.com/kubohiroya/turbowarp-realtime-motion-capture/blob/213cbd39ff0c9111d8dff04713eb4baf627da577/src/calibration/controller.ts#L188), [turbowarp-realtime-motion-capture/src/calibration/delegate.ts:95](https://github.com/kubohiroya/turbowarp-realtime-motion-capture/blob/213cbd39ff0c9111d8dff04713eb4baf627da577/src/calibration/delegate.ts#L95), [turbowarp-realtime-motion-capture/src/protocol/schemas.ts:102](https://github.com/kubohiroya/turbowarp-realtime-motion-capture/blob/213cbd39ff0c9111d8dff04713eb4baf627da577/src/protocol/schemas.ts#L102), [turbowarp-camera-source/schemas/camera-intrinsics-v1.json](https://github.com/kubohiroya/turbowarp-camera-source/blob/beece9042d782e30b393a65fcb2d6916589dd063/schemas/camera-intrinsics-v1.json)。
- 新設・構成先: `turbowarp-realtime-motion-capture: delegate別の固定import adapter`（計画）。
- 保存契約: 起動時delegateにより受入契約が異なる。既知契約を固定定義し、純粋検証を利用。実行時validateProfile呼出でregistryへ登録しない。

### motion-calibration

- 区分: `reuse-generated`。入力形式: `json`。
- 正本: [turbowarp-realtime-motion-capture/src/protocol/schemas.ts:102](https://github.com/kubohiroya/turbowarp-realtime-motion-capture/blob/213cbd39ff0c9111d8dff04713eb4baf627da577/src/protocol/schemas.ts#L102)。
- 生成物: [turbowarp-realtime-motion-capture/schemas/camera-calibration-v1.json](https://github.com/kubohiroya/turbowarp-realtime-motion-capture/blob/213cbd39ff0c9111d8dff04713eb4baf627da577/schemas/camera-calibration-v1.json)。
- 保存契約: TypeBox定義が正本、schemas JSONは生成物。意味検証は純粋関数として同梱またはホストへ渡す。 loadFusionCameraCalibrationではprotocol codecに加えてfusion/geometry.tsのcreateCameraModelで純粋な幾何条件を検証する。他consumerのSchemaへこの追加制約を転用しない。

### pose2d

- 区分: `reuse-generated`。入力形式: `json`。
- 正本: [turbowarp-realtime-motion-capture/src/protocol/schemas.ts:126](https://github.com/kubohiroya/turbowarp-realtime-motion-capture/blob/213cbd39ff0c9111d8dff04713eb4baf627da577/src/protocol/schemas.ts#L126)。
- 生成物: [turbowarp-realtime-motion-capture/schemas/pose-frame-2d-v1.json](https://github.com/kubohiroya/turbowarp-realtime-motion-capture/blob/213cbd39ff0c9111d8dff04713eb4baf627da577/schemas/pose-frame-2d-v1.json)。
- 保存契約: TypeBox定義が正本、schemas JSONは生成物。意味検証は純粋関数として同梱またはホストへ渡す。

### pose2d-v2

- 区分: `reuse-generated`。入力形式: `json`。
- 正本: [turbowarp-realtime-motion-capture/src/protocol/schemas.ts:165](https://github.com/kubohiroya/turbowarp-realtime-motion-capture/blob/213cbd39ff0c9111d8dff04713eb4baf627da577/src/protocol/schemas.ts#L165)。
- 生成物: [turbowarp-realtime-motion-capture/schemas/pose-frame-2d-v2.json](https://github.com/kubohiroya/turbowarp-realtime-motion-capture/blob/213cbd39ff0c9111d8dff04713eb4baf627da577/schemas/pose-frame-2d-v2.json)。
- 保存契約: TypeBox定義が正本、schemas JSONは生成物。意味検証は純粋関数として同梱またはホストへ渡す。

### pose3d

- 区分: `reuse-generated`。入力形式: `json`。
- 正本: [turbowarp-realtime-motion-capture/src/protocol/schemas.ts:191](https://github.com/kubohiroya/turbowarp-realtime-motion-capture/blob/213cbd39ff0c9111d8dff04713eb4baf627da577/src/protocol/schemas.ts#L191)。
- 生成物: [turbowarp-realtime-motion-capture/schemas/pose-frame-3d-v1.json](https://github.com/kubohiroya/turbowarp-realtime-motion-capture/blob/213cbd39ff0c9111d8dff04713eb4baf627da577/schemas/pose-frame-3d-v1.json)。
- 保存契約: TypeBox定義が正本、schemas JSONは生成物。意味検証は純粋関数として同梱またはホストへ渡す。

### performance-dsl

- 区分: `reuse-generated`。入力形式: `json`。
- 正本: [turbowarp-realtime-motion-capture/src/protocol/schemas.ts:220](https://github.com/kubohiroya/turbowarp-realtime-motion-capture/blob/213cbd39ff0c9111d8dff04713eb4baf627da577/src/protocol/schemas.ts#L220)。
- 生成物: [turbowarp-realtime-motion-capture/schemas/performance-dsl-v1.json](https://github.com/kubohiroya/turbowarp-realtime-motion-capture/blob/213cbd39ff0c9111d8dff04713eb4baf627da577/schemas/performance-dsl-v1.json)。
- 保存契約: TypeBox定義が正本、schemas JSONは生成物。意味検証は純粋関数として同梱またはホストへ渡す。

### protocol-union

- 区分: `compose-fixed`。入力形式: `json`。
- 正本: [turbowarp-realtime-motion-capture/src/protocol/schemas.ts:246](https://github.com/kubohiroya/turbowarp-realtime-motion-capture/blob/213cbd39ff0c9111d8dff04713eb4baf627da577/src/protocol/schemas.ts#L246), [turbowarp-realtime-motion-capture/src/protocol/codec.ts:44](https://github.com/kubohiroya/turbowarp-realtime-motion-capture/blob/213cbd39ff0c9111d8dff04713eb4baf627da577/src/protocol/codec.ts#L44)。
- 新設・構成先: `turbowarp-realtime-motion-capture: protocolSchemasの固定union`（計画）。
- 保存契約: 5種類6版の既知Schemaのunion。利用者が任意Schemaを注入する③ではない。

### pose2d-union

- 区分: `compose-fixed`。入力形式: `json`。
- 正本: [turbowarp-realtime-motion-capture/src/protocol/schemas.ts:126](https://github.com/kubohiroya/turbowarp-realtime-motion-capture/blob/213cbd39ff0c9111d8dff04713eb4baf627da577/src/protocol/schemas.ts#L126), [turbowarp-realtime-motion-capture/src/protocol/schemas.ts:165](https://github.com/kubohiroya/turbowarp-realtime-motion-capture/blob/213cbd39ff0c9111d8dff04713eb4baf627da577/src/protocol/schemas.ts#L165), [turbowarp-realtime-motion-capture/src/fusion/controller.ts:239](https://github.com/kubohiroya/turbowarp-realtime-motion-capture/blob/213cbd39ff0c9111d8dff04713eb4baf627da577/src/fusion/controller.ts#L239)。
- 生成物: [turbowarp-realtime-motion-capture/schemas/pose-frame-2d-v1.json](https://github.com/kubohiroya/turbowarp-realtime-motion-capture/blob/213cbd39ff0c9111d8dff04713eb4baf627da577/schemas/pose-frame-2d-v1.json), [turbowarp-realtime-motion-capture/schemas/pose-frame-2d-v2.json](https://github.com/kubohiroya/turbowarp-realtime-motion-capture/blob/213cbd39ff0c9111d8dff04713eb4baf627da577/schemas/pose-frame-2d-v2.json)。
- 新設・構成先: `turbowarp-realtime-motion-capture: PoseFrame2D固定union`（計画）。

### avatar-rig

- 区分: `new-fixed`。入力形式: `json`。
- 正本: [turbowarp-realtime-motion-capture/src/avatar/controller.ts:114](https://github.com/kubohiroya/turbowarp-realtime-motion-capture/blob/213cbd39ff0c9111d8dff04713eb4baf627da577/src/avatar/controller.ts#L114), [turbowarp-realtime-motion-capture/src/avatar/types.ts:67](https://github.com/kubohiroya/turbowarp-realtime-motion-capture/blob/213cbd39ff0c9111d8dff04713eb4baf627da577/src/avatar/types.ts#L67)。
- 新設・構成先: `turbowarp-realtime-motion-capture/schemas/avatar-rig.schema.json`（計画）。
- 保存契約: root enum、正のscale、3要素offset、recognitionイベント名。bonesは拒否。

### placement-reference

- 区分: `reuse-generated`。入力形式: `json`。
- 正本: [turbowarp-time-space-sync/src/contracts/placement.ts:144](https://github.com/kubohiroya/turbowarp-time-space-sync/blob/28ce8bfe1e875c378f4100710ed1e41170962ce5/src/contracts/placement.ts#L144), [turbowarp-time-space-sync/src/contracts/spec.ts:281](https://github.com/kubohiroya/turbowarp-time-space-sync/blob/28ce8bfe1e875c378f4100710ed1e41170962ce5/src/contracts/spec.ts#L281), [turbowarp-time-space-sync/src/contracts/index.ts:29](https://github.com/kubohiroya/turbowarp-time-space-sync/blob/28ce8bfe1e875c378f4100710ed1e41170962ce5/src/contracts/index.ts#L29)。
- 生成物: [turbowarp-time-space-sync/schemas/placement-reference-v1.schema.json](https://github.com/kubohiroya/turbowarp-time-space-sync/blob/28ce8bfe1e875c378f4100710ed1e41170962ce5/schemas/placement-reference-v1.schema.json)。
- 生成処理: [turbowarp-time-space-sync/scripts/generate-schemas.ts:46](https://github.com/kubohiroya/turbowarp-time-space-sync/blob/28ce8bfe1e875c378f4100710ed1e41170962ce5/scripts/generate-schemas.ts#L46)。
- 保存契約: Spec descriptorが正本。spec.tsのtoJsonSchemaとpublishedContractsからJSONを生成する。JSONだけを手修正しない。schemas:checkの--check経路で$schema/$id/titleを含む実バイト列を照合し、contracts-schemas.test.tsの部分比較だけで同一性を判定しない。点ID重複等の純粋意味制約はparserを併用する。

### placement-observation

- 区分: `reuse-generated`。入力形式: `json`。
- 正本: [turbowarp-time-space-sync/src/contracts/placement.ts:161](https://github.com/kubohiroya/turbowarp-time-space-sync/blob/28ce8bfe1e875c378f4100710ed1e41170962ce5/src/contracts/placement.ts#L161), [turbowarp-time-space-sync/src/contracts/spec.ts:281](https://github.com/kubohiroya/turbowarp-time-space-sync/blob/28ce8bfe1e875c378f4100710ed1e41170962ce5/src/contracts/spec.ts#L281), [turbowarp-time-space-sync/src/contracts/index.ts:29](https://github.com/kubohiroya/turbowarp-time-space-sync/blob/28ce8bfe1e875c378f4100710ed1e41170962ce5/src/contracts/index.ts#L29)。
- 生成物: [turbowarp-time-space-sync/schemas/placement-observation-v1.schema.json](https://github.com/kubohiroya/turbowarp-time-space-sync/blob/28ce8bfe1e875c378f4100710ed1e41170962ce5/schemas/placement-observation-v1.schema.json)。
- 生成処理: [turbowarp-time-space-sync/scripts/generate-schemas.ts:46](https://github.com/kubohiroya/turbowarp-time-space-sync/blob/28ce8bfe1e875c378f4100710ed1e41170962ce5/scripts/generate-schemas.ts#L46)。
- 保存契約: Spec descriptorが正本。spec.tsのtoJsonSchemaとpublishedContractsからJSONを生成する。JSONだけを手修正しない。schemas:checkの--check経路で$schema/$id/titleを含む実バイト列を照合し、contracts-schemas.test.tsの部分比較だけで同一性を判定しない。点ID重複等の純粋意味制約はparserを併用する。

### placement-camera-model

- 区分: `new-fixed`。入力形式: `json`。
- 正本: [turbowarp-time-space-sync/src/placement/camera-model.ts:155](https://github.com/kubohiroya/turbowarp-time-space-sync/blob/28ce8bfe1e875c378f4100710ed1e41170962ce5/src/placement/camera-model.ts#L155)。
- 新設・構成先: `turbowarp-time-space-sync/schemas/placement-camera-model.schema.json`（計画）。
- 保存契約: intrinsics+distortion必須。Camera Sourceのintrinsics単体と混同しない。

### worker-ir

- 区分: `new-fixed`。入力形式: `json`。
- 正本: [turbowarp-http-server-cloudflare/src/ir.ts:72](https://github.com/kubohiroya/turbowarp-cloudflare-worker/blob/b344fb5ad0cbb287305b8b2b5741bf0ccc083cb8/src/ir.ts#L72)。
- 新設・構成先: `turbowarp-http-server-cloudflare/schemas/worker-ir.schema.json`（計画）。
- 保存契約: compiler/deploy IRやextension manifest Schemaとは別。

### handler-ir

- 区分: `new-fixed`。入力形式: `json`。
- 正本: [turbowarp-http-server-cloudflare/src/ir.ts:46](https://github.com/kubohiroya/turbowarp-cloudflare-worker/blob/b344fb5ad0cbb287305b8b2b5741bf0ccc083cb8/src/ir.ts#L46), [turbowarp-http-server-cloudflare/src/extension.ts:57](https://github.com/kubohiroya/turbowarp-cloudflare-worker/blob/b344fb5ad0cbb287305b8b2b5741bf0ccc083cb8/src/extension.ts#L57)。
- 新設・構成先: `turbowarp-http-server-cloudflare/schemas/handler-input.schema.json`（計画）。
- 保存契約: 配列または単一handlerを受理する既存入力契約を保持。

### protected-routes

- 区分: `new-fixed`。入力形式: `json`。
- 正本: [turbowarp-http-server-cloudflare/src/ir.ts:26](https://github.com/kubohiroya/turbowarp-cloudflare-worker/blob/b344fb5ad0cbb287305b8b2b5741bf0ccc083cb8/src/ir.ts#L26), [turbowarp-http-server-cloudflare/src/ir.ts:140](https://github.com/kubohiroya/turbowarp-cloudflare-worker/blob/b344fb5ad0cbb287305b8b2b5741bf0ccc083cb8/src/ir.ts#L140)。
- 新設・構成先: `turbowarp-http-server-cloudflare/schemas/protected-routes.schema.json`（計画）。

### auth-ir

- 区分: `new-fixed`。入力形式: `json`。
- 正本: [turbowarp-http-server-cloudflare/src/ir.ts:18](https://github.com/kubohiroya/turbowarp-cloudflare-worker/blob/b344fb5ad0cbb287305b8b2b5741bf0ccc083cb8/src/ir.ts#L18)。
- 新設・構成先: `turbowarp-http-server-cloudflare/schemas/auth-ir.schema.json`（計画）。

### react-props

- 区分: `new-fixed`。入力形式: `json`。
- 正本: [turbowarp-http-server-react/src/island.ts:57](https://github.com/kubohiroya/turbowarp-react-islands/blob/ac278da8a1b3e53d3d2473275fb88b9df392f7aa/src/island.ts#L57)。
- 新設・構成先: `turbowarp-http-server-react/schemas/react-props.schema.json`（計画）。
- 保存契約: 任意キーのJSON object。component固有のフォーム生成は③へ分離。

### scene-example

- 区分: `reuse`。入力形式: `json`。
- 正本: [turbowarp-extension-template/schemas/scene-properties.schema.json](https://github.com/kubohiroya/turbowarp-extension-template/blob/1df3c0a05ed3764cc1b3a2a5aa2a2e988463a09c/schemas/scene-properties.schema.json)。

### note-example

- 区分: `reuse`。入力形式: `yaml`。
- 正本: [turbowarp-extension-template/schemas/note-properties.schema.json](https://github.com/kubohiroya/turbowarp-extension-template/blob/1df3c0a05ed3764cc1b3a2a5aa2a2e988463a09c/schemas/note-properties.schema.json)。

## ブロック固有の入力検証

Schemaの共有とconsumerの入力検証を区別する。以下は段階1で用意する同期の純粋検証で、各ownerフォームへのbindingは段階2。runtimeの登録数や開始状態、参照先の存在を保存ゲートへ持ち込まない。

### validation-fusion-calibration

fusion校正の入力検証。

- 正本・照合先: [turbowarp-realtime-motion-capture/src/protocol/codec.ts:44](https://github.com/kubohiroya/turbowarp-realtime-motion-capture/blob/213cbd39ff0c9111d8dff04713eb4baf627da577/src/protocol/codec.ts#L44), [turbowarp-realtime-motion-capture/src/fusion/geometry.ts:14](https://github.com/kubohiroya/turbowarp-realtime-motion-capture/blob/213cbd39ff0c9111d8dff04713eb4baf627da577/src/fusion/geometry.ts#L14), [turbowarp-realtime-motion-capture/src/fusion/controller.ts:206](https://github.com/kubohiroya/turbowarp-realtime-motion-capture/blob/213cbd39ff0c9111d8dff04713eb4baf627da577/src/fusion/controller.ts#L206)。
- 入力条件: protocol JSONのbyte上限・Schema/version・禁止キー検証; twrmc/camera-calibrationに限定; createCameraModelによる正のfx/fy、上三角intrinsic、係数長0/4/5/8、affine/orthonormal外部姿勢。
- 保存ゲートへ含めない実行条件: MAX_FUSION_CAMERAS・既存modelsの登録件数; models登録・controllerの状態変更。
- context: 起動時delegate等の固定設定。runtime/controllerの参照を渡さない。
- 実行と段階: 同期の純粋検証。legacy validateDataの非同期callbackはこの経路へ自動移行しない。 headlessは段階1、形式/bindingは段階2。

### validation-protocol

protocolの5種6版の入力検証。

- 正本・照合先: [turbowarp-realtime-motion-capture/src/protocol/codec.ts:44](https://github.com/kubohiroya/turbowarp-realtime-motion-capture/blob/213cbd39ff0c9111d8dff04713eb4baf627da577/src/protocol/codec.ts#L44)。
- 入力条件: decodeProtocolJsonに一致する構造・byte上限・禁止キー; session-policyのissuedAt/expiresAtと時計の関係。
- 保存ゲートへ含めない実行条件: ProtocolV1Codecの保持状態・decode/encodeの実行。
- context: 検証時刻を注入。起動時delegate等の固定設定。runtime/controllerの参照を渡さない。
- 実行と段階: 同期の純粋検証。legacy validateDataの非同期callbackはこの経路へ自動移行しない。 headlessは段階1、形式/bindingは段階2。

### validation-fusion-pose2d

fusion Pose2D入力の検証。

- 正本・照合先: [turbowarp-realtime-motion-capture/src/protocol/codec.ts:44](https://github.com/kubohiroya/turbowarp-realtime-motion-capture/blob/213cbd39ff0c9111d8dff04713eb4baf627da577/src/protocol/codec.ts#L44), [turbowarp-realtime-motion-capture/src/fusion/controller.ts:239](https://github.com/kubohiroya/turbowarp-realtime-motion-capture/blob/213cbd39ff0c9111d8dff04713eb4baf627da577/src/fusion/controller.ts#L239)。
- 入力条件: decodeProtocolJson＋twrmc/pose-frame-2d v1/v2の固定dispatch。
- 保存ゲートへ含めない実行条件: requireStarted・未登録camera・既存校正との不一致; 重複/遅延frameのdrop・buffer状態・統計更新。
- context: 起動時delegate等の固定設定。runtime/controllerの参照を渡さない。
- 実行と段階: 同期の純粋検証。legacy validateDataの非同期callbackはこの経路へ自動移行しない。 headlessは段階1、形式/bindingは段階2。

### validation-avatar-pose2d

avatar用PoseFrame2Dの入力検証。

- 正本・照合先: [turbowarp-realtime-motion-capture/src/avatar/controller.ts:451](https://github.com/kubohiroya/turbowarp-realtime-motion-capture/blob/213cbd39ff0c9111d8dff04713eb4baf627da577/src/avatar/controller.ts#L451), [turbowarp-realtime-motion-capture/src/avatar/controller.ts:521](https://github.com/kubohiroya/turbowarp-realtime-motion-capture/blob/213cbd39ff0c9111d8dff04713eb4baf627da577/src/avatar/controller.ts#L521)。
- 入力条件: avatarのparseJsonObjectの文字数上限・object条件; PoseFrame2D v1のValue.Check。protocol codecへ一律置換しない。
- 保存ゲートへ含めない実行条件: A-Frame capabilityの存在・avatar binding/selector/loaded状態; 認識confidence・描画・registryの変更。
- context: 起動時delegate等の固定設定。runtime/controllerの参照を渡さない。
- 実行と段階: 同期の純粋検証。legacy validateDataの非同期callbackはこの経路へ自動移行しない。 headlessは段階1、形式/bindingは段階2。

### validation-avatar-pose3d

avatar用PoseFrame3Dの入力検証。

- 正本・照合先: [turbowarp-realtime-motion-capture/src/avatar/controller.ts:440](https://github.com/kubohiroya/turbowarp-realtime-motion-capture/blob/213cbd39ff0c9111d8dff04713eb4baf627da577/src/avatar/controller.ts#L440), [turbowarp-realtime-motion-capture/src/avatar/controller.ts:521](https://github.com/kubohiroya/turbowarp-realtime-motion-capture/blob/213cbd39ff0c9111d8dff04713eb4baf627da577/src/avatar/controller.ts#L521)。
- 入力条件: avatarのparseJsonObjectの文字数上限・object条件; PoseFrame3D v1のValue.Check。protocol codecへ一律置換しない。
- 保存ゲートへ含めない実行条件: A-Frame capabilityの存在・avatar binding/selector/loaded状態; 認識confidence・描画・registryの変更。
- context: 起動時delegate等の固定設定。runtime/controllerの参照を渡さない。
- 実行と段階: 同期の純粋検証。legacy validateDataの非同期callbackはこの経路へ自動移行しない。 headlessは段階1、形式/bindingは段階2。

### validation-performance-dsl

performer palette入力の検証。

- 正本・照合先: [turbowarp-realtime-motion-capture/src/protocol/codec.ts:44](https://github.com/kubohiroya/turbowarp-realtime-motion-capture/blob/213cbd39ff0c9111d8dff04713eb4baf627da577/src/protocol/codec.ts#L44), [turbowarp-realtime-motion-capture/src/fusion/controller.ts:155](https://github.com/kubohiroya/turbowarp-realtime-motion-capture/blob/213cbd39ff0c9111d8dff04713eb4baf627da577/src/fusion/controller.ts#L155), [turbowarp-realtime-motion-capture/src/fusion/glow-stick.ts:58](https://github.com/kubohiroya/turbowarp-realtime-motion-capture/blob/213cbd39ff0c9111d8dff04713eb4baf627da577/src/fusion/glow-stick.ts#L58)。
- 入力条件: decodeProtocolJson＋twrmc/performance-dslに限定; 色の既存入力規則。paletteを変更するメソッドは呼ばず純粋な規則だけ照合。
- 保存ゲートへ含めない実行条件: paletteのclear/set・既存keypointの削除。
- context: 起動時delegate等の固定設定。runtime/controllerの参照を渡さない。
- 実行と段階: 同期の純粋検証。legacy validateDataの非同期callbackはこの経路へ自動移行しない。 headlessは段階1、形式/bindingは段階2。

### validation-motion-import

motion校正importの固定経路。

- 正本・照合先: [turbowarp-realtime-motion-capture/src/calibration/controller.ts:491](https://github.com/kubohiroya/turbowarp-realtime-motion-capture/blob/213cbd39ff0c9111d8dff04713eb4baf627da577/src/calibration/controller.ts#L491), [turbowarp-realtime-motion-capture/src/calibration/delegate.ts:95](https://github.com/kubohiroya/turbowarp-realtime-motion-capture/blob/213cbd39ff0c9111d8dff04713eb4baf627da577/src/calibration/delegate.ts#L95), [turbowarp-camera-source/src/profile.ts](https://github.com/kubohiroya/turbowarp-camera-source/blob/beece9042d782e30b393a65fcb2d6916589dd063/src/profile.ts)。
- 入力条件: delegate OFFは同repoのparseCalibrationProfileに一致; delegate ONはCamera Sourceのpure profile契約に一致; 異なる経路のbyte上限や追加制約を無条件に統合しない。
- 保存ゲートへ含めない実行条件: registerProfile・validateProfileの登録経路・controller cancel/state更新。
- context: 起動時delegate等の固定設定。runtime/controllerの参照を渡さない。
- 実行と段階: 同期の純粋検証。legacy validateDataの非同期callbackはこの経路へ自動移行しない。 headlessは段階1、形式/bindingは段階2。

## 候補の取得元

候補はSchemaのenumと別に扱う。`literal-only`は編集中の引数へ新しい名前を書けることを示し、資源の作成・登録・実行は行わない。`reference-only`は候補選択でも参照先を新設しない。Scratch broadcastだけはプロジェクト名簿を含むtransactionを別途実装する。全providerはこの計画で追加または接続するもので、現状で共通APIが存在するという意味ではない。

### scratch-broadcast

Scratch broadcast名。範囲: `project`。

- 正本・所有側: [turbowarp-async-input/src/extension.ts](https://github.com/kubohiroya/turbowarp-async-input/blob/0f81c2946db6067e212ec55d0020ca2223beb909/src/extension.ts)。
- 読取方法: 専用の読取portを所有側へ追加する。既存公開read APIがある場合だけ再利用する。
- 新規操作: `project-broadcast-transaction`。 定義・参照ブロックの固定値と、取得可能な所有側の読取情報を候補化。実行・登録・fetchしない。
- 固定値の収集箇所 `turbowarp-async-input`: `listenForKeyAndBroadcast.MESSAGE`, `listenForTouchAndBroadcast.MESSAGE`, `listenForActorTouchAndBroadcast.MESSAGE`。
- 固定値の収集箇所 `turbowarp-jsqr`: `waitForQrTextSetRuntimeVarAndBroadcast.MESSAGE`。
- 固定値の収集箇所 `turbowarp-runtime-expression`: `registerConditionalBroadcast.MESSAGE_ON_TRUE`, `registerConditionalBroadcast.MESSAGE_ON_FALSE`。
- 固定値の収集箇所 `turbowarp-webusb-pasori`: `waitForNfcIdmSetRuntimeVarAndBroadcast.MESSAGE`。

### notification

拡張通知名。範囲: `extension-instance`。

- 正本・所有側: [turbowarp-extended-notification/src/extension.ts](https://github.com/kubohiroya/turbowarp-extended-notification/blob/4adae59f40da27f2bef9ccff82348d353e1d2418/src/extension.ts)。
- 読取方法: 専用の読取portを所有側へ追加する。既存公開read APIがある場合だけ再利用する。
- 新規操作: `literal-only`。 定義・参照ブロックの固定値と、取得可能な所有側の読取情報を候補化。実行・登録・fetchしない。
- 固定値の収集箇所 `turbowarp-extended-notification`: `sendNotification.MESSAGE`, `waitForNotification.MESSAGE`, `waitForNotificationOrTimeout.MESSAGE`。

### network-event

WebRTCイベント名。範囲: `project/network`。

- 正本・所有側: [turbowarp-webrtc/src/extension.ts](https://github.com/kubohiroya/turbowarp-webrtc/blob/18ed3b34a49b3c1828ce651a04a4a593b3fe0e99/src/extension.ts)。
- 読取方法: 専用の読取portを所有側へ追加する。既存公開read APIがある場合だけ再利用する。
- 新規操作: `literal-only`。 定義・参照ブロックの固定値と、取得可能な所有側の読取情報を候補化。実行・登録・fetchしない。
- 固定値の収集箇所 `turbowarp-webrtc`: `sendEvent.TYPE`, `broadcastNetworkMessage.MESSAGE`, `whenReceiveNetworkMessage.MESSAGE`。

### runtime-variable

Temporary Variablesのruntime変数名。範囲: `runtime`。

- 正本・所有側: [turbowarp-async-input/src/extension.ts](https://github.com/kubohiroya/turbowarp-async-input/blob/0f81c2946db6067e212ec55d0020ca2223beb909/src/extension.ts), [turbowarp-async-input/src/runtime-variables.ts](https://github.com/kubohiroya/turbowarp-async-input/blob/0f81c2946db6067e212ec55d0020ca2223beb909/src/runtime-variables.ts)。
- 読取方法: 専用の読取portを所有側へ追加する。既存公開read APIがある場合だけ再利用する。
- 新規操作: `literal-only`。 定義・参照ブロックの固定値と、取得可能な所有側の読取情報を候補化。実行・登録・fetchしない。
- 固定値の収集箇所 `turbowarp-async-input`: `listenForKey.RUNTIME_VAR`, `listenForKeyAndBroadcast.RUNTIME_VAR`, `listenForTouch.RUNTIME_VAR`, `listenForTouchAndBroadcast.RUNTIME_VAR`, `listenForPose.RUNTIME_VAR`, `listenForActorTouchAndBroadcast.RUNTIME_VAR`。
- 固定値の収集箇所 `turbowarp-jsqr`: `waitForQrTextSetRuntimeVar.RUNTIME_VAR`, `waitForQrTextSetRuntimeVarAndBroadcast.RUNTIME_VAR`。
- 固定値の収集箇所 `turbowarp-webusb-pasori`: `waitForNfcIdmSetRuntimeVar.RUNTIME_VAR`, `waitForNfcIdmSetRuntimeVarAndBroadcast.RUNTIME_VAR`。

### pose-class

認識クラス名。範囲: `selected-model`。

- 正本・所有側: [turbowarp-teachable-machine/src/extension.ts](https://github.com/kubohiroya/turbowarp-teachable-machine/blob/fb49f2172aa22ee0c61a8132a44591d62bdda04b/src/extension.ts)。
- 読取方法: 専用の読取portを所有側へ追加する。既存公開read APIがある場合だけ再利用する。
- 新規操作: `literal-only`。 定義・参照ブロックの固定値と、取得可能な所有側の読取情報を候補化。実行・登録・fetchしない。
- 固定値の収集箇所 `turbowarp-async-input`: `listenForPose.POSE_NAME`, `stopListeningForPose.POSE_NAME`。
- 固定値の収集箇所 `turbowarp-teachable-machine`: `poseScoreReporter.NAME`, `accumulatedPoseScoreReporter.NAME`, `isPose.NAME`, `isPoseWithThreshold.NAME`。

### bubble-style

吹き出しスタイル名。範囲: `extension-instance`。

- 正本・所有側: [turbowarp-bubble/src/extension.ts](https://github.com/kubohiroya/turbowarp-bubble/blob/ad5b008e89f95c0182977f3e2e77d58fc2041b16/src/extension.ts)。
- 読取方法: 専用の読取portを所有側へ追加する。既存公開read APIがある場合だけ再利用する。
- 新規操作: `literal-only`。 定義・参照ブロックの固定値と、取得可能な所有側の読取情報を候補化。実行・登録・fetchしない。
- 固定値の収集箇所 `turbowarp-bubble`: `defineBubbleStyle.STYLE`, `setBubblePlacement.STYLE`, `setPortraitBase.STYLE`, `setPortraitLayout.STYLE`, `setBubbleDistance.STYLE`, `setBubbleVisualStyle.STYLE`, `setBubbleTailLength.STYLE`, `setBubbleOffset.STYLE`, `setBlinkFrames.STYLE`, `setLipSyncFrames.STYLE`, `setContinueFrames.STYLE`, `setBubbleReveal.STYLE`, `setBubbleWordDelimiters.STYLE`, `setBubbleRevealSound.STYLE`, `setBubbleVoice.STYLE`, `setBubbleShowAnimation.STYLE`, `setBubbleHideAnimation.STYLE`, `showWithBubbleStyle.STYLE`, `sayWithBubbleStyle.STYLE`, `thinkWithBubbleStyle.STYLE`。

### bubble-policy

吹き出し終了ポリシー名。範囲: `extension-instance`。

- 正本・所有側: [turbowarp-bubble/src/extension.ts](https://github.com/kubohiroya/turbowarp-bubble/blob/ad5b008e89f95c0182977f3e2e77d58fc2041b16/src/extension.ts)。
- 読取方法: 専用の読取portを所有側へ追加する。既存公開read APIがある場合だけ再利用する。
- 新規操作: `literal-only`。 定義・参照ブロックの固定値と、取得可能な所有側の読取情報を候補化。実行・登録・fetchしない。
- 固定値の収集箇所 `turbowarp-bubble`: `defineBubbleClosePolicy.POLICY`, `waitAndCloseBubbleWithPolicy.POLICY`。

### svg-style

SVG Textスタイル名。範囲: `extension-instance`。

- 正本・所有側: [turbowarp-svg-text/src/extension.ts](https://github.com/kubohiroya/turbowarp-svg-text/blob/73a7de1bcc09245377fff91a17b4fbca2bd18362/src/extension.ts)。
- 読取方法: 専用の読取portを所有側へ追加する。既存公開read APIがある場合だけ再利用する。
- 新規操作: `literal-only`。 定義・参照ブロックの固定値と、取得可能な所有側の読取情報を候補化。実行・登録・fetchしない。
- 固定値の収集箇所 `turbowarp-svg-text`: `defineStyle.STYLE`, `setText.STYLE`。

### menu-action

アプリメニューのアクションID。範囲: `extension-instance`。

- 正本・所有側: [turbowarp-title-menu/src/extension.ts](https://github.com/kubohiroya/turbowarp-title-menu/blob/04b099a2f8c35596d88e9f85ee430e95a2c66dfc/src/extension.ts)。
- 読取方法: 現行のmenuActionItems/getLists/voiceMenuの該当する読取処理を再利用する。
- 新規操作: `literal-only`。 定義・参照ブロックの固定値と、取得可能な所有側の読取情報を候補化。実行・登録・fetchしない。
- 固定値の収集箇所 `turbowarp-title-menu`: `addAppMenuAction.ACTION`, `setAppMenuActionEnabled.ACTION`, `whenAppMenuActionSelected.ACTION`。

### structured-name

構造化データ名。範囲: `target-local`。

- 正本・所有側: `turbowarp-structured-data/src/extension.ts`（採取時のローカル根拠）。
- 読取方法: 専用の読取portを所有側へ追加する。既存公開read APIがある場合だけ再利用する。
- 新規操作: `literal-only`。 定義・参照ブロックの固定値と、取得可能な所有側の読取情報を候補化。実行・登録・fetchしない。
- 固定値の収集箇所 `turbowarp-structured-data`: `parseJson.NAME`, `parseYaml.NAME`, `parseJsonWithSchema.NAME`, `parseYamlWithSchema.NAME`, `toJson.NAME`, `toYaml.NAME`, `hasStructuredData.NAME`, `deleteStructuredData.NAME`, `getJsonAtPath.NAME`, `hasPath.NAME`, `setJsonAtPath.NAME`, `deleteAtPath.NAME`, `keysAtPath.NAME`, `lengthAtPath.NAME`, `forEachAtPath.NAME`。

### document-name

文書名。範囲: `target-local`。

- 正本・所有側: [turbowarp-document-data/src/extension.ts](https://github.com/kubohiroya/turbowarp-document-data/blob/6b715665bcfc62749f000c3eed215abfc73a8cbd/src/extension.ts)。
- 読取方法: 専用の読取portを所有側へ追加する。既存公開read APIがある場合だけ再利用する。
- 新規操作: `literal-only`。 定義・参照ブロックの固定値と、取得可能な所有側の読取情報を候補化。実行・登録・fetchしない。
- 固定値の収集箇所 `turbowarp-document-data`: `parseHtml.NAME`, `parseMarkdown.NAME`, `hasDocument.NAME`, `deleteDocument.NAME`, `documentKind.NAME`, `getDocumentText.NAME`, `replaceDocumentText.NAME`, `serializeDocument.NAME`。

### binary-name

バイナリデータ名。範囲: `target-local`。

- 正本・所有側: [turbowarp-binary-data/src/extension.ts](https://github.com/kubohiroya/turbowarp-binary-data/blob/27144293b6195aabfcc251c3537da492cd934783/src/extension.ts)。
- 読取方法: 専用の読取portを所有側へ追加する。既存公開read APIがある場合だけ再利用する。
- 新規操作: `literal-only`。 定義・参照ブロックの固定値と、取得可能な所有側の読取情報を候補化。実行・登録・fetchしない。
- 固定値の収集箇所 `turbowarp-binary-data`: `createUtf8.NAME`, `hasBinary.NAME`, `deleteBinary.NAME`, `mimeType.NAME`, `byteLength.NAME`, `sha256.NAME`。

### kvs-namespace

KVS namespace。範囲: `storage namespace`。

- 正本・所有側: [turbowarp-kvs/src/extension.ts](https://github.com/kubohiroya/turbowarp-kvs/blob/78fe4fbb71c21fa3c4840a2c1d9ab45a0e99e8ac/src/extension.ts)。
- 読取方法: 専用の読取portを所有側へ追加する。既存公開read APIがある場合だけ再利用する。
- 新規操作: `literal-only`。 定義・参照ブロックの固定値と、取得可能な所有側の読取情報を候補化。実行・登録・fetchしない。
- 固定値の収集箇所 `turbowarp-kvs`: `setValue.NAMESPACE`, `getValue.NAMESPACE`, `hasKey.NAMESPACE`, `deleteKey.NAMESPACE`, `listKeys.NAMESPACE`。

### kvs-key

KVSキー。範囲: `selected namespace`。

- 正本・所有側: [turbowarp-kvs/src/extension.ts](https://github.com/kubohiroya/turbowarp-kvs/blob/78fe4fbb71c21fa3c4840a2c1d9ab45a0e99e8ac/src/extension.ts)。
- 読取方法: 専用の読取portを所有側へ追加する。既存公開read APIがある場合だけ再利用する。
- 新規操作: `literal-only`。 定義・参照ブロックの固定値と、取得可能な所有側の読取情報を候補化。実行・登録・fetchしない。
- 固定値の収集箇所 `turbowarp-kvs`: `setValue.KEY`, `getValue.KEY`, `hasKey.KEY`, `deleteKey.KEY`。

### asset

アセット名。範囲: `asset-manager or asset-cache instance`。

- 正本・所有側: [turbowarp-asset-manager/src/extension.ts](https://github.com/kubohiroya/turbowarp-asset-manager/blob/19d16320d91287319f2c39ec09a08e0dda67ed40/src/extension.ts)。
- 読取方法: 専用の読取portを所有側へ追加する。既存公開read APIがある場合だけ再利用する。
- 新規操作: `literal-only`。 定義・参照ブロックの固定値と、取得可能な所有側の読取情報を候補化。実行・登録・fetchしない。
- 固定値の収集箇所 `turbowarp-asset-cache`: `registerAsset.NAME`, `loadAsset.NAME`, `deleteMemoryAsset.NAME`, `deleteCachedAsset.NAME`, `isLoaded.NAME`, `setTextValue.NAME`, `setTextStyle.NAME`, `setThisSpriteSkin.NAME`, `setSpriteSkin.NAME`, `startActorLoop.ASSETS`, `startActorSequence.ASSETS`, `setStageSkin.NAME`, `playSound.NAME`, `playSoundUntilDone.NAME`, `stopSound.NAME`, `getAssetMimeType.NAME`, `validateProjectAssetAddress.NAME`, `setLoadingBackdrop.NAME`, `setLoadingCostumes.NAMES`。
- 固定値の収集箇所 `turbowarp-asset-manager`: `registerAsset.NAME`, `loadAsset.NAME`, `deleteMemoryAsset.NAME`, `deleteCachedAsset.NAME`, `isLoaded.NAME`, `setTextValue.NAME`, `setTextStyle.NAME`, `setThisSpriteSkin.NAME`, `setSpriteSkin.NAME`, `startActorLoop.ASSETS`, `startActorSequence.ASSETS`, `setStageSkin.NAME`, `playSound.NAME`, `playSoundUntilDone.NAME`, `stopSound.NAME`, `getAssetMimeType.NAME`, `validateProjectAssetAddress.NAME`, `setLoadingBackdrop.NAME`, `setLoadingCostumes.NAMES`。
- 固定値の収集箇所 `turbowarp-bubble`: `setPortraitBase.ASSET`, `setBlinkFrames.ASSETS`, `setLipSyncFrames.ASSETS`, `setContinueFrames.ASSETS`, `setBubbleRevealSound.ASSET`, `setBubbleVoice.ASSET`。

### scene-template

3Dテンプレート名。範囲: `aframe instance`。

- 正本・所有側: [turbowarp-aframe/src/extension.ts](https://github.com/kubohiroya/turbowarp-aframe/blob/8d05ee87a17ef230afa0f01b31b98282f71996a1/src/extension.ts)。
- 読取方法: 専用の読取portを所有側へ追加する。既存公開read APIがある場合だけ再利用する。
- 新規操作: `literal-only`。 定義・参照ブロックの固定値と、取得可能な所有側の読取情報を候補化。実行・登録・fetchしない。
- 固定値の収集箇所 `turbowarp-aframe`: `loadTemplate.ID`, `createFromTemplate.TEMPLATE`。

### scene-node

3DノードID。範囲: `aframe instance`。

- 正本・所有側: [turbowarp-aframe/src/extension.ts](https://github.com/kubohiroya/turbowarp-aframe/blob/8d05ee87a17ef230afa0f01b31b98282f71996a1/src/extension.ts)。
- 読取方法: 専用の読取portを所有側へ追加する。既存公開read APIがある場合だけ再利用する。
- 新規操作: `literal-only`。 定義・参照ブロックの固定値と、取得可能な所有側の読取情報を候補化。実行・登録・fetchしない。
- 固定値の収集箇所 `turbowarp-aframe`: `createNode.ID`, `createFromTemplate.INSTANCE`。
- JSON/YAML内部の収集箇所: 3件。[内部項目一覧](nested-fields.ja.md)のprovider=`scene-node`を参照。

### scene-selector

3Dセレクター。範囲: `aframe instance`。

- 正本・所有側: [turbowarp-aframe/src/extension.ts](https://github.com/kubohiroya/turbowarp-aframe/blob/8d05ee87a17ef230afa0f01b31b98282f71996a1/src/extension.ts)。
- 読取方法: 専用の読取portを所有側へ追加する。既存公開read APIがある場合だけ再利用する。
- 新規操作: `literal-only`。 定義・参照ブロックの固定値と、取得可能な所有側の読取情報を候補化。実行・登録・fetchしない。
- 固定値の収集箇所 `turbowarp-aframe`: `createNode.PARENT`, `createFromTemplate.PARENT`, `setPosition.SELECTOR`, `moveBy.SELECTOR`, `setRotation.SELECTOR`, `addClass.SELECTOR`, `setData.SELECTOR`, `setAttribute.SELECTOR`, `deleteSelector.SELECTOR`, `countSelector.SELECTOR`, `emitEvent.SELECTOR`, `whenEventOnSelector.SELECTOR`, `playAnimationClip.SELECTOR`, `stopAnimationClip.SELECTOR`, `pauseAnimationClip.SELECTOR`, `resumeAnimationClip.SELECTOR`, `setAnimationTimeScale.SELECTOR`, `isAnimationClipPlaying.SELECTOR`, `loadVrm.SELECTOR`, `setVrmBoneRotation.SELECTOR`, `vrmBoneNames.SELECTOR`, `setVrmExpression.SELECTOR`, `vrmExpressionNames.SELECTOR`, `vrmState.SELECTOR`。
- 固定値の収集箇所 `turbowarp-ar`: `attachSelectorToARTarget.SELECTOR`, `detachSelectorFromARTarget.SELECTOR`。
- 固定値の収集箇所 `turbowarp-realtime-motion-capture`: `bindAvatarPerson.PARENT`。
- JSON/YAML内部の収集箇所: 1件。[内部項目一覧](nested-fields.ja.md)のprovider=`scene-selector`を参照。

### scene-class

3Dクラス名。範囲: `aframe instance`。

- 正本・所有側: [turbowarp-aframe/src/extension.ts](https://github.com/kubohiroya/turbowarp-aframe/blob/8d05ee87a17ef230afa0f01b31b98282f71996a1/src/extension.ts)。
- 読取方法: 専用の読取portを所有側へ追加する。既存公開read APIがある場合だけ再利用する。
- 新規操作: `literal-only`。 定義・参照ブロックの固定値と、取得可能な所有側の読取情報を候補化。実行・登録・fetchしない。
- 固定値の収集箇所 `turbowarp-aframe`: `addClass.CLASS`。
- JSON/YAML内部の収集箇所: 6件。[内部項目一覧](nested-fields.ja.md)のprovider=`scene-class`を参照。

### scene-event

A-Frameイベント名。範囲: `aframe instance`。

- 正本・所有側: [turbowarp-aframe/src/extension.ts](https://github.com/kubohiroya/turbowarp-aframe/blob/8d05ee87a17ef230afa0f01b31b98282f71996a1/src/extension.ts)。
- 読取方法: 専用の読取portを所有側へ追加する。既存公開read APIがある場合だけ再利用する。
- 新規操作: `literal-only`。 定義・参照ブロックの固定値と、取得可能な所有側の読取情報を候補化。実行・登録・fetchしない。
- 固定値の収集箇所 `turbowarp-aframe`: `emitEvent.TYPE`, `whenEventOnSelector.TYPE`。
- JSON/YAML内部の収集箇所: 2件。[内部項目一覧](nested-fields.ja.md)のprovider=`scene-event`を参照。

### animation-clip

3Dアニメーションクリップ名。範囲: `aframe instance`。

- 正本・所有側: [turbowarp-aframe/src/extension.ts](https://github.com/kubohiroya/turbowarp-aframe/blob/8d05ee87a17ef230afa0f01b31b98282f71996a1/src/extension.ts)。
- 読取方法: 専用の読取portを所有側へ追加する。既存公開read APIがある場合だけ再利用する。
- 新規操作: `literal-only`。 定義・参照ブロックの固定値と、取得可能な所有側の読取情報を候補化。実行・登録・fetchしない。
- 固定値の収集箇所 `turbowarp-aframe`: `createAnimationClip.NAME`, `deleteAnimationClip.NAME`, `addVectorKeyframeTrack.CLIP`, `addQuaternionKeyframeTrack.CLIP`, `addEulerRotationKeyframeTrack.CLIP`, `addPositionKeyframe.CLIP`, `addScaleKeyframe.CLIP`, `addEulerRotationKeyframe.CLIP`, `playAnimationClip.CLIP`, `stopAnimationClip.CLIP`, `pauseAnimationClip.CLIP`, `resumeAnimationClip.CLIP`, `setAnimationTimeScale.CLIP`, `isAnimationClipPlaying.CLIP`。

### ar-target

ARターゲットID。範囲: `ar instance`。

- 正本・所有側: [turbowarp-ar/src/extension.ts](https://github.com/kubohiroya/turbowarp-ar/blob/726e25260f298c0621d5b58243268e94cec549be/src/extension.ts)。
- 読取方法: 専用の読取portを所有側へ追加する。既存公開read APIがある場合だけ再利用する。
- 新規操作: `literal-only`。 定義・参照ブロックの固定値と、取得可能な所有側の読取情報を候補化。実行・登録・fetchしない。
- 固定値の収集箇所 `turbowarp-ar`: `defineARTarget.TARGET_ID`, `setARTargetVisible.TARGET_ID`, `setARTargetPosition.TARGET_ID`, `setARTargetRotation.TARGET_ID`, `isARTargetVisible.TARGET_ID`, `arTargetConfidence.TARGET_ID`, `arTargetPosition.TARGET_ID`, `arTargetRotation.TARGET_ID`, `whenARTargetFound.TARGET_ID`, `whenARTargetLost.TARGET_ID`, `attachSelectorToARTarget.TARGET_ID`。
- JSON/YAML内部の収集箇所: 1件。[内部項目一覧](nested-fields.ja.md)のprovider=`ar-target`を参照。

### camera

論理カメラID。範囲: `project/camera-source`。

- 正本・所有側: [turbowarp-camera-source/src/extension.ts](https://github.com/kubohiroya/turbowarp-camera-source/blob/beece9042d782e30b393a65fcb2d6916589dd063/src/extension.ts)。
- 読取方法: 専用の読取portを所有側へ追加する。既存公開read APIがある場合だけ再利用する。
- 新規操作: `literal-only`。 定義・参照ブロックの固定値と、取得可能な所有側の読取情報を候補化。実行・登録・fetchしない。
- 固定値の収集箇所 `turbowarp-ar`: `createARScene.CAMERA_ID`。
- 固定値の収集箇所 `turbowarp-camera-calibration`: `startCameraCalibration.CAMERA_ID`, `addCameraCalibrationSample.CAMERA_ID`, `startAutomaticCameraCalibration.CAMERA_ID`, `stopAutomaticCameraCalibration.CAMERA_ID`, `automaticCameraCalibration.CAMERA_ID`, `cameraCalibrationGuidance.CAMERA_ID`, `cameraCalibrationNovelty.CAMERA_ID`, `cameraCalibrationTiltDirection.CAMERA_ID`, `cameraCalibrationProgress.CAMERA_ID`, `solveCameraCalibration.CAMERA_ID`, `cancelCameraCalibration.CAMERA_ID`, `cleanupCameraCalibration.CAMERA_ID`, `publishCameraCalibration.CAMERA_ID`, `measureCameraBoardPose.CAMERA_ID`, `importCameraCalibration.CAMERA_ID`, `cameraCalibrationJsonValid.CAMERA_ID`, `cameraCalibrationReady.CAMERA_ID`, `cameraCalibrationState.CAMERA_ID`, `cameraCalibrationSampleCount.CAMERA_ID`, `cameraCalibrationSampleQuality.CAMERA_ID`, `cameraCalibrationReprojectionError.CAMERA_ID`, `cameraCalibrationPoseSpread.CAMERA_ID`, `cameraCalibrationHoldoutErrorPx.CAMERA_ID`, `cameraCalibrationHoldoutSampleCount.CAMERA_ID`, `cameraCalibrationErrorCode.CAMERA_ID`, `cameraCalibrationError.CAMERA_ID`, `cameraCalibrationJson.CAMERA_ID`, `cameraBoardPoseJson.CAMERA_ID`。
- 固定値の収集箇所 `turbowarp-camera-source`: `startSharedCamera.CAMERA_ID`, `startRequestedSharedCamera.CAMERA_ID`, `startSharedCameraFromCameraButton.CAMERA_ID`, `hideCameraButton.CAMERA_ID`, `stopSharedCamera.CAMERA_ID`, `isCameraRunning.CAMERA_ID`, `cameraErrorCode.CAMERA_ID`, `cameraError.CAMERA_ID`, `cameraDeviceIdReporter.CAMERA_ID`, `showCameraPreview.CAMERA_ID`, `hideCameraPreview.CAMERA_ID`, `cameraFrameWidth.CAMERA_ID`, `cameraFrameHeight.CAMERA_ID`, `cameraFrameRate.CAMERA_ID`, `registerCameraProfileAs.CAMERA_ID`, `forgetCameraProfile.CAMERA_ID`, `cameraProfileRegistered.CAMERA_ID`, `cameraProfileJson.CAMERA_ID`, `cameraProfileYaml.CAMERA_ID`, `cameraProfileCompatibility.CAMERA_ID`, `cameraProfileCompatibilityDetail.CAMERA_ID`, `cameraProfileAdaptation.CAMERA_ID`, `cameraProfileIntrinsicsJson.CAMERA_ID`, `cameraConditionsJson.CAMERA_ID`, `cameraConditionsGeneration.CAMERA_ID`, `saveCameraProfile.CAMERA_ID`, `restoreStoredCameraProfile.CAMERA_ID`, `restoreStoredCameraProfileForDevice.CAMERA_ID`, `bindCameraProfileToDevice.CAMERA_ID`, `cameraProfileOnDevice.CAMERA_ID`, `storedCameraProfileResult.CAMERA_ID`, `storedCameraProfileDetail.CAMERA_ID`。
- 固定値の収集箇所 `turbowarp-jsqr`: `waitForQrTextSetRuntimeVar.CAMERA_ID`, `waitForQrTextSetRuntimeVarAndBroadcast.CAMERA_ID`。
- 固定値の収集箇所 `turbowarp-realtime-motion-capture`: `startWebGpuMoveNetMultiPose.CAMERA_ID`, `startPoseCamera.CAMERA_ID`, `inferPoseCameraAtFrameTime.CAMERA_ID`, `stopPoseCamera.CAMERA_ID`, `poseCameraFrame2D.CAMERA_ID`, `poseCameraStatusJson.CAMERA_ID`, `startCameraCalibration.CAMERA_ID`, `startFrameSyncDecoder.CAMERA_ID`。
- 固定値の収集箇所 `turbowarp-time-space-sync`: `startOpticalTimeDecoder.CAMERA_ID`, `setCameraModel.CAMERA_ID`, `cameraModelJson.CAMERA_ID`, `placementReprojectionRms.CAMERA_ID`。
- 固定値の収集箇所 `turbowarp-webrtc-qrcode-pairing`: `scanPairingQrFromCamera.CAMERA_ID`。
- JSON/YAML内部の収集箇所: 36件。[内部項目一覧](nested-fields.ja.md)のprovider=`camera`を参照。

### calibration

校正ID。範囲: `camera/profile`。

- 正本・所有側: [turbowarp-camera-calibration/src/extension.ts](https://github.com/kubohiroya/turbowarp-camera-calibration/blob/ec75f6d07ace3492b0b18b68af2c36594eba4c08/src/extension.ts)。
- 読取方法: 専用の読取portを所有側へ追加する。既存公開read APIがある場合だけ再利用する。
- 新規操作: `literal-only`。 定義・参照ブロックの固定値と、取得可能な所有側の読取情報を候補化。実行・登録・fetchしない。
- 固定値の収集箇所 `turbowarp-camera-calibration`: `startCameraCalibration.CALIBRATION_ID`。
- 固定値の収集箇所 `turbowarp-realtime-motion-capture`: `startWebGpuMoveNetMultiPose.CALIBRATION_ID`, `startPoseCamera.CALIBRATION_ID`, `startCameraCalibration.CALIBRATION_ID`。
- JSON/YAML内部の収集箇所: 12件。[内部項目一覧](nested-fields.ja.md)のprovider=`calibration`を参照。

### channel

WebRTC channel名。範囲: `peer/channel`。

- 正本・所有側: [turbowarp-webrtc/src/extension.ts](https://github.com/kubohiroya/turbowarp-webrtc/blob/18ed3b34a49b3c1828ce651a04a4a593b3fe0e99/src/extension.ts)。
- 読取方法: 専用の読取portを所有側へ追加する。既存公開read APIがある場合だけ再利用する。
- 新規操作: `literal-only`。 定義・参照ブロックの固定値と、取得可能な所有側の読取情報を候補化。実行・登録・fetchしない。
- 固定値の収集箇所 `turbowarp-webrtc`: `sendEvent.CHANNEL`, `configureLatestDataChannel.CHANNEL`, `sendLatestData.CHANNEL`, `latestDataBufferedAmount.CHANNEL`, `latestDataSentCount.CHANNEL`, `latestDataDroppedCount.CHANNEL`, `latestDataChannelState.CHANNEL`, `broadcastNetworkMessage.CHANNEL`。

### pairing-session

QRペアリングセッション名。範囲: `pairing instance`。

- 正本・所有側: [turbowarp-webrtc-qrcode-pairing/src/extension.ts](https://github.com/kubohiroya/turbowarp-webrtc-qrcode-pairing/blob/afc54cc1317908933f73a2d826e578e5d0ec3132/src/extension.ts)。
- 読取方法: 専用の読取portを所有側へ追加する。既存公開read APIがある場合だけ再利用する。
- 新規操作: `literal-only`。 定義・参照ブロックの固定値と、取得可能な所有側の読取情報を候補化。実行・登録・fetchしない。
- 固定値の収集箇所 `turbowarp-webrtc-qrcode-pairing`: `startOfferPairing.SESSION`, `startAnswerPairing.SESSION`, `ingestPairingQrText.SESSION`, `scanPairingQrFromCamera.SESSION`, `pairingReceivedParts.SESSION`, `pairingRequiredParts.SESSION`, `pairingMissingParts.SESSION`, `pairingReadCount.SESSION`, `pairingLastRead.SESSION`, `pairingLastReadDetail.SESSION`, `showPairingQrPart.SESSION`, `showNextPairingQrPart.SESSION`, `pairingQrPartCount.SESSION`, `pairingQrCurrentPart.SESSION`, `pairingQrPartSvg.SESSION`, `pairingQrPartDataUri.SESSION`, `endPairingQrDisplay.SESSION`, `pairingPhase.SESSION`, `pairingConnectionState.SESSION`, `isPairingConnected.SESSION`, `waitUntilPairingConnected.SESSION`, `pairingError.SESSION`, `pairingErrorMessage.SESSION`, `pairingLocalPeer.SESSION`, `pairingRemotePeer.SESSION`, `pairingExchangeId.SESSION`, `pairingRemainingSeconds.SESSION`, `cancelPairing.SESSION`, `retryPairing.SESSION`, `setPairingTimeout.SESSION`。

### reference

配置基準ID。範囲: `time-space-sync instance`。

- 正本・所有側: [turbowarp-time-space-sync/src/extension.ts](https://github.com/kubohiroya/turbowarp-time-space-sync/blob/28ce8bfe1e875c378f4100710ed1e41170962ce5/src/extension.ts)。
- 読取方法: 専用の読取portを所有側へ追加する。既存公開read APIがある場合だけ再利用する。
- 新規操作: `literal-only`。 定義・参照ブロックの固定値と、取得可能な所有側の読取情報を候補化。実行・登録・fetchしない。
- 固定値の収集箇所 `turbowarp-time-space-sync`: `startOpticalTimeDecoder.REFERENCE_ID`, `patternReferenceJson.REFERENCE_ID`。
- JSON/YAML内部の収集箇所: 2件。[内部項目一覧](nested-fields.ja.md)のprovider=`reference`を参照。

### rig

配置rig名。範囲: `time-space-sync instance`。

- 正本・所有側: [turbowarp-time-space-sync/src/extension.ts](https://github.com/kubohiroya/turbowarp-time-space-sync/blob/28ce8bfe1e875c378f4100710ed1e41170962ce5/src/extension.ts)。
- 読取方法: 専用の読取portを所有側へ追加する。既存公開read APIがある場合だけ再利用する。
- 新規操作: `literal-only`。 定義・参照ブロックの固定値と、取得可能な所有側の読取情報を候補化。実行・登録・fetchしない。
- 固定値の収集箇所 `turbowarp-time-space-sync`: `solvePlacement.RIG_ID`。

### performer

パフォーマー名。範囲: `motion-capture instance`。

- 正本・所有側: [turbowarp-realtime-motion-capture/src/extension.ts](https://github.com/kubohiroya/turbowarp-realtime-motion-capture/blob/213cbd39ff0c9111d8dff04713eb4baf627da577/src/extension.ts)。
- 読取方法: 専用の読取portを所有側へ追加する。既存公開read APIがある場合だけ再利用する。
- 新規操作: `literal-only`。 定義・参照ブロックの固定値と、取得可能な所有側の読取情報を候補化。実行・登録・fetchしない。
- 固定値の収集箇所 `turbowarp-realtime-motion-capture`: `bindAvatarPerson.PERSON_ID`, `unbindAvatarPerson.PERSON_ID`, `setAvatarExpression.PERSON_ID`, `avatarExpressionNames.PERSON_ID`, `setPerformerGlowStick.PERFORMER_ID`。
- JSON/YAML内部の収集箇所: 8件。[内部項目一覧](nested-fields.ja.md)のprovider=`performer`を参照。

### avatar-asset

アバターアセット名。範囲: `motion-capture instance`。

- 正本・所有側: [turbowarp-realtime-motion-capture/src/extension.ts](https://github.com/kubohiroya/turbowarp-realtime-motion-capture/blob/213cbd39ff0c9111d8dff04713eb4baf627da577/src/extension.ts)。
- 読取方法: 専用の読取portを所有側へ追加する。既存公開read APIがある場合だけ再利用する。
- 新規操作: `literal-only`。 定義・参照ブロックの固定値と、取得可能な所有側の読取情報を候補化。実行・登録・fetchしない。
- 固定値の収集箇所 `turbowarp-realtime-motion-capture`: `registerAvatarAsset.ASSET_ID`, `bindAvatarPerson.ASSET_ID`。
- JSON/YAML内部の収集箇所: 4件。[内部項目一覧](nested-fields.ja.md)のprovider=`avatar-asset`を参照。

### avatar-instance

アバターインスタンス名。範囲: `motion-capture instance`。

- 正本・所有側: [turbowarp-realtime-motion-capture/src/extension.ts](https://github.com/kubohiroya/turbowarp-realtime-motion-capture/blob/213cbd39ff0c9111d8dff04713eb4baf627da577/src/extension.ts)。
- 読取方法: 専用の読取portを所有側へ追加する。既存公開read APIがある場合だけ再利用する。
- 新規操作: `literal-only`。 定義・参照ブロックの固定値と、取得可能な所有側の読取情報を候補化。実行・登録・fetchしない。
- 固定値の収集箇所 `turbowarp-realtime-motion-capture`: `bindAvatarPerson.INSTANCE_ID`。

### function

関数名。範囲: `project function definitions`。

- 正本・所有側: [turbowarp-named-functions/src/extension.ts](https://github.com/kubohiroya/turbowarp-named-functions/blob/7447cf952b9df2fbf42540fd8042af43afed64ad/src/extension.ts)。
- 読取方法: 専用の読取portを所有側へ追加する。既存公開read APIがある場合だけ再利用する。
- 新規操作: `literal-only`。 定義・参照ブロックの固定値と、取得可能な所有側の読取情報を候補化。実行・登録・fetchしない。
- 固定値の収集箇所 `turbowarp-named-functions`: `defineFunction.NAME`, `callFunction.NAME`, `startFunction.NAME`, `isDefined.NAME`。
- 固定値の収集箇所 `turbowarp-openai-realtime-api`: `defineFunction.NAME`。
- 固定値の収集箇所 `turbowarp-voice-chat`: `defineFunction.NAME`。

### atom

Jotai atom名。範囲: `bridge plan`。

- 正本・所有側: [turbowarp-http-server-jotai/src/extension.ts](https://github.com/kubohiroya/turbowarp-jotai-adapter/blob/e36977caba408351824e4e99fcc14c7d330759e8/src/extension.ts)。
- 読取方法: 専用の読取portを所有側へ追加する。既存公開read APIがある場合だけ再利用する。
- 新規操作: `literal-only`。 定義・参照ブロックの固定値と、取得可能な所有側の読取情報を候補化。実行・登録・fetchしない。
- 固定値の収集箇所 `turbowarp-http-server-jotai`: `defineAtom.ATOM`, `setAtomValue.ATOM`, `atomValueJson.ATOM`, `createSetActionJson.ATOM`。

### react-component

React component名。範囲: `component registry`。

- 正本・所有側: [turbowarp-http-server-react/src/extension.ts](https://github.com/kubohiroya/turbowarp-react-islands/blob/ac278da8a1b3e53d3d2473275fb88b9df392f7aa/src/extension.ts)。
- 読取方法: 専用の読取portを所有側へ追加する。既存公開read APIがある場合だけ再利用する。
- 新規操作: `literal-only`。 定義・参照ブロックの固定値と、取得可能な所有側の読取情報を候補化。実行・登録・fetchしない。
- 固定値の収集箇所 `turbowarp-http-server-react`: `registerComponent.COMPONENT`, `reactIsland.COMPONENT`, `reactIslandHtml.COMPONENT`。

### handler-variable

HTTP handler変数名。範囲: `request-local`。

- 正本・所有側: [turbowarp-http-server/src/extension.ts](https://github.com/kubohiroya/turbowarp-http-server/blob/01cf3f5de90c3e24b70dbe669e73fe3f8df0c4ec/src/extension.ts)。
- 読取方法: 専用の読取portを所有側へ追加する。既存公開read APIがある場合だけ再利用する。
- 新規操作: `literal-only`。 定義・参照ブロックの固定値と、取得可能な所有側の読取情報を候補化。実行・登録・fetchしない。
- 固定値の収集箇所 `turbowarp-http-server`: `setHandlerVariable.NAME`, `changeHandlerVariable.NAME`, `handlerVariable.NAME`, `handlerVariableExists.NAME`, `deleteHandlerVariable.NAME`。

### watcher

条件監視ID。範囲: `runtime-expression instance`。

- 正本・所有側: [turbowarp-runtime-expression/src/extension.ts](https://github.com/kubohiroya/turbowarp-runtime-expression/blob/71e9bce2c58b958ffbf34a3219115301d293cdb3/src/extension.ts)。
- 読取方法: 専用の読取portを所有側へ追加する。既存公開read APIがある場合だけ再利用する。
- 新規操作: `literal-only`。 定義・参照ブロックの固定値と、取得可能な所有側の読取情報を候補化。実行・登録・fetchしない。
- 固定値の収集箇所 `turbowarp-runtime-expression`: `registerConditionalBroadcast.ID`, `unregisterConditionalBroadcast.ID`。

### reader

PaSoRi reader名。範囲: `pasori instance`。

- 正本・所有側: [turbowarp-webusb-pasori/src/extension.ts](https://github.com/kubohiroya/turbowarp-webusb-pasori/blob/8dafe5ff12c00ae836e0cd4dc4a42b842d09c636/src/extension.ts)。
- 読取方法: 専用の読取portを所有側へ追加する。既存公開read APIがある場合だけ再利用する。
- 新規操作: `literal-only`。 定義・参照ブロックの固定値と、取得可能な所有側の読取情報を候補化。実行・登録・fetchしない。
- 固定値の収集箇所 `turbowarp-webusb-pasori`: `connectPasoriBlock.READER_ID`, `waitForNfcIdmSetRuntimeVar.READER_ID`, `waitForNfcIdmSetRuntimeVarAndBroadcast.READER_ID`, `lastIdmReporter.READER_ID`。

### device-alias

Sesameデバイスalias。範囲: `relay/keyholder`。

- 正本・所有側: [turbowarp-sesame/src/extension.ts](https://github.com/kubohiroya/turbowarp-sesame/blob/9bd14210aeb11fb1d4e36d02124916ab29d715ca/src/extension.ts)。
- 読取方法: 専用の読取portを所有側へ追加する。既存公開read APIがある場合だけ再利用する。
- 新規操作: `literal-only`。 定義・参照ブロックの固定値と、取得可能な所有側の読取情報を候補化。実行・登録・fetchしない。
- 固定値の収集箇所 `turbowarp-sesame`: `configureRelay.DEVICE_ALIAS`, `configureBluetooth.DEVICE_ALIAS`。

### scratch-target

Scratchターゲット。範囲: `project`。

- 正本・所有側: [turbowarp-asset-manager/src/extension.ts](https://github.com/kubohiroya/turbowarp-asset-manager/blob/19d16320d91287319f2c39ec09a08e0dda67ed40/src/extension.ts)。
- 読取方法: 専用の読取portを所有側へ追加する。既存公開read APIがある場合だけ再利用する。
- 新規操作: `reference-only`。 sprite名とtarget IDを取り違えない。
- 固定値の収集箇所 `turbowarp-asset-cache`: `setSpriteSkin.SPRITE`, `startActorLoop.ACTOR`, `startActorSequence.ACTOR`, `stopActorAnimation.ACTOR`。
- 固定値の収集箇所 `turbowarp-asset-manager`: `setSpriteSkin.SPRITE`, `startActorLoop.ACTOR`, `startActorSequence.ACTOR`, `stopActorAnimation.ACTOR`。
- 固定値の収集箇所 `turbowarp-async-input`: `listenForActorTouchAndBroadcast.ACTOR`。
- 固定値の収集箇所 `turbowarp-http-server`: `respondWithNamedBody.TARGET_ID`。

### scratch-list

Scratchリスト。範囲: `stage + editing target`。

- 正本・所有側: [turbowarp-text-lines/src/extension.ts:34](https://github.com/kubohiroya/turbowarp-text-lines/blob/2989214a615caf6a1b8206285189db958f3008f6/src/extension.ts#L34)。
- 読取方法: 現行のmenuActionItems/getLists/voiceMenuの該当する読取処理を再利用する。
- 新規操作: `reference-only`。 保存値はlist ID。既存の名前による参照も保持。新しいリストの作成は今回の範囲外。
- 固定値の収集箇所 `turbowarp-asset-cache`: `prepareLoadingAssets.LIST`。
- 固定値の収集箇所 `turbowarp-asset-manager`: `prepareLoadingAssets.LIST`。
- 固定値の収集箇所 `turbowarp-text-lines`: `writeLinesToList.LIST`。

### asset-address

プロジェクト資源アドレス。範囲: `project`。

- 正本・所有側: [turbowarp-asset-manager/src/extension.ts:286](https://github.com/kubohiroya/turbowarp-asset-manager/blob/19d16320d91287319f2c39ec09a08e0dda67ed40/src/extension.ts#L286)。
- 読取方法: 専用の読取portを所有側へ追加する。既存公開read APIがある場合だけ再利用する。
- 新規操作: `reference-only`。 costume/backdrop/sound/text/cache/URLを分ける。候補選択でfetchや登録は行わない。
- 固定値の収集箇所 `turbowarp-asset-cache`: `registerAsset.RESOURCE_ID`, `validateProjectAssetAddress.RESOURCE_ID`。
- 固定値の収集箇所 `turbowarp-asset-manager`: `registerAsset.RESOURCE_ID`, `validateProjectAssetAddress.RESOURCE_ID`。

### camera-device

実機カメラ。範囲: `browser devices`。

- 正本・所有側: [turbowarp-camera-source/src/extension.ts:497](https://github.com/kubohiroya/turbowarp-camera-source/blob/beece9042d782e30b393a65fcb2d6916589dd063/src/extension.ts#L497)。
- 読取方法: 専用の読取portを所有側へ追加する。既存公開read APIがある場合だけ再利用する。
- 新規操作: `reference-only`。 既存の列挙結果のみ利用。フォームを開いて権限要求・カメラ起動しない。
- 固定値の収集箇所 `turbowarp-camera-source`: `startSharedCamera.DEVICE_ID`。
- 固定値の収集箇所 `turbowarp-teachable-machine`: `setCameraSelection.CAMERA`。

### vrm-bone

VRMボーン。範囲: `selected avatar`。

- 正本・所有側: [turbowarp-aframe/src/vrm.ts:114](https://github.com/kubohiroya/turbowarp-aframe/blob/8d05ee87a17ef230afa0f01b31b98282f71996a1/src/vrm.ts#L114)。
- 読取方法: 専用の読取portを所有側へ追加する。既存公開read APIがある場合だけ再利用する。
- 新規操作: `reference-only`。
- 固定値の収集箇所 `turbowarp-aframe`: `setVrmBoneRotation.BONE`。

### vrm-expression

VRM表情。範囲: `selected avatar`。

- 正本・所有側: [turbowarp-aframe/src/vrm.ts:109](https://github.com/kubohiroya/turbowarp-aframe/blob/8d05ee87a17ef230afa0f01b31b98282f71996a1/src/vrm.ts#L109)。
- 読取方法: 専用の読取portを所有側へ追加する。既存公開read APIがある場合だけ再利用する。
- 新規操作: `reference-only`。
- 固定値の収集箇所 `turbowarp-aframe`: `setVrmExpression.NAME`。
- 固定値の収集箇所 `turbowarp-realtime-motion-capture`: `setAvatarExpression.NAME`。

### speech-voice

ブラウザ音声。範囲: `browser voices`。

- 正本・所有側: [turbowarp-web-speech/src/extension.ts:81](https://github.com/kubohiroya/turbowarp-web-speech/blob/fcfa3500b18af55f61b5bc8c09172952e32898a7/src/extension.ts#L81)。
- 読取方法: 現行のmenuActionItems/getLists/voiceMenuの該当する読取処理を再利用する。
- 新規操作: `reference-only`。 既定音声は空文字列。保存値は現行voice.name。
- 固定値の収集箇所 `turbowarp-web-speech`: `setSpeechVoice.VOICE`。

### http-header

HTTPヘッダー名。範囲: `request/response`。

- 正本・所有側: [turbowarp-http-server/src/extension.ts:197](https://github.com/kubohiroya/turbowarp-http-server/blob/01cf3f5de90c3e24b70dbe669e73fe3f8df0c4ec/src/extension.ts#L197)。
- 読取方法: 専用の読取portを所有側へ追加する。既存公開read APIがある場合だけ再利用する。
- 新規操作: `literal-only`。 既知のヘッダーは候補。独自ヘッダーを禁止しない。
- 固定値の収集箇所 `turbowarp-http-server`: `requestHeader.NAME`, `setResponseHeader.NAME`, `removeResponseHeader.NAME`, `responseHeader.NAME`。

### html-name

HTMLタグ・属性名。範囲: `fixed vocabulary + custom names`。

- 正本・所有側: [turbowarp-html/src/html.ts](https://github.com/kubohiroya/turbowarp-html/blob/033f74475b50dae8ff3072e2c73450aac0271b2c/src/html.ts)。
- 読取方法: 固定候補を所有側の定義から取得する。
- 新規操作: `literal-only`。 文法・禁止タグ等は所有側のvalidatorが正本。候補を閉じたenumにしない。
- 固定値の収集箇所 `turbowarp-html`: `element.TAG`, `withAttribute.NAME`。
- 固定値の収集箇所 `turbowarp-http-server`: `newHtmlElement.TAG`, `htmlSetAttribute.NAME`。

### aframe-attribute

A-Frame属性名。範囲: `known vocabulary + custom components`。

- 正本・所有側: [turbowarp-aframe/src/extension.ts:184](https://github.com/kubohiroya/turbowarp-aframe/blob/8d05ee87a17ef230afa0f01b31b98282f71996a1/src/extension.ts#L184)。
- 読取方法: 固定候補を所有側の定義から取得する。
- 新規操作: `literal-only`。
- 固定値の収集箇所 `turbowarp-aframe`: `setAttribute.NAME`。
- JSON/YAML内部の収集箇所: 3件。[内部項目一覧](nested-fields.ja.md)のprovider=`aframe-attribute`を参照。

### font

フォント名。範囲: `known examples + free input`。

- 正本・所有側: [turbowarp-asset-manager/src/text-style.ts:51](https://github.com/kubohiroya/turbowarp-asset-manager/blob/19d16320d91287319f2c39ec09a08e0dda67ed40/src/text-style.ts#L51)。
- 読取方法: 固定候補を所有側の定義から取得する。
- 新規操作: `literal-only`。 候補外のフォントを拒否しない。
- 固定値の収集箇所 `turbowarp-svg-text`: `defineStyle.FONT`。

### key

キー名。範囲: `owner key naming convention`。

- 正本・所有側: [turbowarp-extended-notification/src/extension.ts:29](https://github.com/kubohiroya/turbowarp-extended-notification/blob/4adae59f40da27f2bef9ccff82348d353e1d2418/src/extension.ts#L29), [turbowarp-async-input/src/extension.ts:199](https://github.com/kubohiroya/turbowarp-async-input/blob/0f81c2946db6067e212ec55d0020ca2223beb909/src/extension.ts#L199)。
- 読取方法: 固定候補を所有側の定義から取得する。
- 新規操作: `literal-only`。 KeyboardEvent.codeとScratch風key名は別の候補集合。
- 固定値の収集箇所 `turbowarp-async-input`: `listenForKey.KEY_ID`, `listenForKeyAndBroadcast.KEY_ID`, `stopListeningForKey.KEY_ID`。
- 固定値の収集箇所 `turbowarp-extended-notification`: `waitForKey.KEY`, `waitForKeyOrTimeout.KEY`。

### open-language

言語コード。範囲: `owner language menu`。

- 正本・所有側: [turbowarp-web-speech/src/block-definitions.json](https://github.com/kubohiroya/turbowarp-web-speech/blob/fcfa3500b18af55f61b5bc8c09172952e32898a7/src/block-definitions.json)。
- 読取方法: 固定候補を所有側の定義から取得する。
- 新規操作: `literal-only`。 メニューは例示。任意の対応言語コードを保持。
- 固定値の収集箇所 `turbowarp-voice-chat`: `setLanguage.LANG`。
- 固定値の収集箇所 `turbowarp-web-speech`: `setRecognitionLanguage.LANG`, `setSpeechLanguage.LANG`。

### open-model

モデル名・音声名。範囲: `owner menu`。

- 正本・所有側: [turbowarp-openai-realtime-api/src/block-definitions.json](https://github.com/kubohiroya/turbowarp-openai-realtime-api/blob/41eaacac172f2b3cd3f026cf3112d967ee4642ce/src/block-definitions.json)。
- 読取方法: 固定候補を所有側の定義から取得する。
- 新規操作: `literal-only`。 掲載候補をAPI全体の閉じた仕様とは扱わない。
- 固定値の収集箇所 `turbowarp-openai-realtime-api`: `setVoice.VOICE`, `setModel.MODEL`。
- 固定値の収集箇所 `turbowarp-voice-chat`: `setModel.MODEL`, `setRealtimeVoice.VOICE`。

### sesame-status

Sesame状態フィールド名。範囲: `transport status`。

- 正本・所有側: [turbowarp-sesame/src/extension.ts:251](https://github.com/kubohiroya/turbowarp-sesame/blob/9bd14210aeb11fb1d4e36d02124916ab29d715ca/src/extension.ts#L251)。
- 読取方法: 固定候補を所有側の定義から取得する。
- 新規操作: `literal-only`。 menuは既知例。transportが返す独自fieldも参照できる。
- 固定値の収集箇所 `turbowarp-sesame`: `getStatusField.FIELD`。

### bubble-text-style

Bubbleが実際に使用するtext capabilityのstyle名。範囲: `active Bubble instance + selected backend + capability identity`。

- 正本・所有側: [turbowarp-bubble/src/turbowarp-adapter.ts:1367](https://github.com/kubohiroya/turbowarp-bubble/blob/ad5b008e89f95c0182977f3e2e77d58fc2041b16/src/turbowarp-adapter.ts#L1367), [turbowarp-bubble/src/turbowarp-adapter.ts:324](https://github.com/kubohiroya/turbowarp-bubble/blob/ad5b008e89f95c0182977f3e2e77d58fc2041b16/src/turbowarp-adapter.ts#L324), [turbowarp-bubble/src/turbowarp-adapter.ts:343](https://github.com/kubohiroya/turbowarp-bubble/blob/ad5b008e89f95c0182977f3e2e77d58fc2041b16/src/turbowarp-adapter.ts#L343), [turbowarp-bubble/src/composition.ts:1113](https://github.com/kubohiroya/turbowarp-bubble/blob/ad5b008e89f95c0182977f3e2e77d58fc2041b16/src/composition.ts#L1113), [turbowarp-svg-text/src/extension.ts:155](https://github.com/kubohiroya/turbowarp-svg-text/blob/73a7de1bcc09245377fff91a17b4fbca2bd18362/src/extension.ts#L155)。
- 読取方法: 有効なtext/overlay capabilityにscope付きstyle名read portを追加。既存instanceのsnapshotだけを読む。portのない注入capabilityは候補なしの直接入力。
- 新規操作: `literal-only`。 注入capability、既存SVG Text、既定の独立compositionを区別。Asset Managerのruntime textStyleを候補化しない。SVG Textと同じregistryを使う場合だけdefineStyleの固定値を補助候補にする。既定styleの遅延登録をフォーム表示で起動しない。
- 固定値の収集箇所 `turbowarp-bubble`: `defineBubbleStyle.TEXT_STYLE`。
- 条件付き固定値 `turbowarp-svg-text.defineStyle.STYLE`: active Bubble text capabilityが同じSVG Text registryを参照する場合だけ。

### webrtc-peer-alias

WebRTC接続先のローカルな別名。範囲: `WebRTC session instance / remote connection map`。

- 正本・所有側: [turbowarp-webrtc/src/extension.ts:322](https://github.com/kubohiroya/turbowarp-webrtc/blob/18ed3b34a49b3c1828ce651a04a4a593b3fe0e99/src/extension.ts#L322), [turbowarp-webrtc/src/manual-peer-session.ts:378](https://github.com/kubohiroya/turbowarp-webrtc/blob/18ed3b34a49b3c1828ce651a04a4a593b3fe0e99/src/manual-peer-session.ts#L378)。
- 読取方法: 既存sessionの接続先キーを専用read portで取得。未実行createOffer/acceptOfferの固定値は予定名として区別する。
- 新規操作: `literal-only`。 remote aliasと送信envelope.fromのlocalIdは別。空値の既存fallbackを維持。*はsendEvent/broadcastNetworkMessageだけの全接続先指定で、通常の接続名候補にしない。
- 固定値の収集箇所 `turbowarp-realtime-motion-capture`: `prepareOfferQr.PEER`, `createAndShowOfferQr.PEER`。
- 固定値の収集箇所 `turbowarp-webrtc`: `createOffer.PEER`, `getOffer.PEER`, `acceptOffer.PEER`, `getAnswer.PEER`, `acceptAnswer.PEER`, `sendEvent.PEER`, `configureLatestDataChannel.PEER`, `sendLatestData.PEER`, `latestDataBufferedAmount.PEER`, `latestDataSentCount.PEER`, `latestDataDroppedCount.PEER`, `latestDataChannelState.PEER`, `broadcastNetworkMessage.PEER`, `connectionState.PEER`, `closePeer.PEER`, `syncClock.PEER`, `clockOffset.PEER`, `clockRoundTrip.PEER`, `clockUncertainty.PEER`, `peerTime.PEER`, `frameLatency.PEER`, `recordFrameSyncSample.PEER`, `sendFrameSyncReport.PEER`。

### pairing-local-peer

QRペアリングの自分側protocol peer ID。範囲: `pairing instance + SESSION + local role`。

- 正本・所有側: [turbowarp-webrtc-qrcode-pairing/src/extension.ts:82](https://github.com/kubohiroya/turbowarp-webrtc-qrcode-pairing/blob/afc54cc1317908933f73a2d826e578e5d0ec3132/src/extension.ts#L82), [turbowarp-webrtc-qrcode-pairing/src/pairing/controller.ts:157](https://github.com/kubohiroya/turbowarp-webrtc-qrcode-pairing/blob/afc54cc1317908933f73a2d826e578e5d0ec3132/src/pairing/controller.ts#L157), [turbowarp-webrtc-qrcode-pairing/src/qr/message.ts:175](https://github.com/kubohiroya/turbowarp-webrtc-qrcode-pairing/blob/afc54cc1317908933f73a2d826e578e5d0ec3132/src/qr/message.ts#L175)。
- 読取方法: 同じsession/roleの固定値と既存pairing progressのlocalPeerIdだけを読む。
- 新規操作: `literal-only`。 startOfferPairingでは非空ID。startAnswerPairing.LOCAL_PEERの空文字は受信offerから自分の名前を採用する指定。入力保存で他roleやWebRTC localIdを変更しない。
- 固定値の収集箇所 `turbowarp-webrtc-qrcode-pairing`: `startOfferPairing.LOCAL_PEER`, `startAnswerPairing.LOCAL_PEER`。

### pairing-remote-peer

QRペアリングの相手側protocol peer ID。範囲: `pairing instance + SESSION + remote role`。

- 正本・所有側: [turbowarp-webrtc-qrcode-pairing/src/pairing/controller.ts:125](https://github.com/kubohiroya/turbowarp-webrtc-qrcode-pairing/blob/afc54cc1317908933f73a2d826e578e5d0ec3132/src/pairing/controller.ts#L125), [turbowarp-webrtc-qrcode-pairing/src/pairing/controller.ts:663](https://github.com/kubohiroya/turbowarp-webrtc-qrcode-pairing/blob/afc54cc1317908933f73a2d826e578e5d0ec3132/src/pairing/controller.ts#L663), [turbowarp-webrtc-qrcode-pairing/src/qr/message.ts:175](https://github.com/kubohiroya/turbowarp-webrtc-qrcode-pairing/blob/afc54cc1317908933f73a2d826e578e5d0ec3132/src/qr/message.ts#L175)。
- 読取方法: 同じsessionのremotePeerIdと対応する固定値。
- 新規操作: `literal-only`。 pairingが明示的にWebRTC接続先aliasへ渡す値である。ローカルID・姿勢source ID・無関係な接続名との自動統合/同期はしない。
- 固定値の収集箇所 `turbowarp-webrtc-qrcode-pairing`: `startOfferPairing.REMOTE_PEER`。

### pose-source-peer

姿勢フレームを生成するsource peer ID。範囲: `pose camera/session policy context`。

- 正本・所有側: [turbowarp-realtime-motion-capture/src/pose/controller.ts:480](https://github.com/kubohiroya/turbowarp-realtime-motion-capture/blob/213cbd39ff0c9111d8dff04713eb4baf627da577/src/pose/controller.ts#L480), [turbowarp-realtime-motion-capture/src/pose/pose-frame.ts:12](https://github.com/kubohiroya/turbowarp-realtime-motion-capture/blob/213cbd39ff0c9111d8dff04713eb4baf627da577/src/pose/pose-frame.ts#L12), [turbowarp-realtime-motion-capture/src/protocol/schemas.ts:78](https://github.com/kubohiroya/turbowarp-realtime-motion-capture/blob/213cbd39ff0c9111d8dff04713eb4baf627da577/src/protocol/schemas.ts#L78)。
- 読取方法: pose開始引数・既存pose source設定・対応する固定protocol JSONからscope付きで取得。
- 新規操作: `literal-only`。 trim後^[A-Za-z0-9._-]{1,64}$。PoseFrame2D.peerIdの出所。ネットワーク接続の存在は要求しない。WebRTC別名やpairing IDとの対応は利用側が明示するまで推測しない。
- 固定値の収集箇所 `turbowarp-realtime-motion-capture`: `startWebGpuMoveNetMultiPose.PEER_ID`, `startPoseCamera.PEER_ID`。
- JSON/YAML内部の収集箇所: 8件。[内部項目一覧](nested-fields.ja.md)のprovider=`pose-source-peer`を参照。

### intrinsic-profile

配置観測が参照するintrinsic profile ID。範囲: `camera + profile format/owner + selected camera model`。

- 正本・所有側: [turbowarp-camera-source/src/calibration/profile.ts:405](https://github.com/kubohiroya/turbowarp-camera-source/blob/beece9042d782e30b393a65fcb2d6916589dd063/src/calibration/profile.ts#L405), [turbowarp-camera-calibration/src/calibration/profile.ts:218](https://github.com/kubohiroya/turbowarp-camera-calibration/blob/ec75f6d07ace3492b0b18b68af2c36594eba4c08/src/calibration/profile.ts#L218), [turbowarp-time-space-sync/src/extension.ts:452](https://github.com/kubohiroya/turbowarp-time-space-sync/blob/28ce8bfe1e875c378f4100710ed1e41170962ce5/src/extension.ts#L452), [turbowarp-time-space-sync/src/placement/solve.ts:103](https://github.com/kubohiroya/turbowarp-time-space-sync/blob/28ce8bfe1e875c378f4100710ed1e41170962ce5/src/placement/solve.ts#L103)。
- 読取方法: 既存camera profile/modelの読取portと固定JSONの定義/参照を収集。cameraIdと形式をcontextに含める。
- 新規操作: `literal-only`。 profileId、calibrationId、ROS拡張内profileIdは所有codecの明示対応だけを使う。単なるID文字列一致で別形式を同一profileにしない。source実行による登録を行わない。
- ネストしたデータ、補助候補、または後続providerの共通定義。個々の適用箇所はSchemaカタログ・設計本文を参照。
- JSON/YAML内部の収集箇所: 20件。[内部項目一覧](nested-fields.ja.md)のprovider=`intrinsic-profile`を参照。

### reference-point

配置基準内の点ID。範囲: `time-space-sync instance + selected referenceId`。

- 正本・所有側: [turbowarp-time-space-sync/schemas/placement-reference-v1.schema.json](https://github.com/kubohiroya/turbowarp-time-space-sync/blob/28ce8bfe1e875c378f4100710ed1e41170962ce5/schemas/placement-reference-v1.schema.json), [turbowarp-time-space-sync/schemas/placement-observation-v1.schema.json](https://github.com/kubohiroya/turbowarp-time-space-sync/blob/28ce8bfe1e875c378f4100710ed1e41170962ce5/schemas/placement-observation-v1.schema.json), [turbowarp-time-space-sync/src/placement/reference.ts:70](https://github.com/kubohiroya/turbowarp-time-space-sync/blob/28ce8bfe1e875c378f4100710ed1e41170962ce5/src/placement/reference.ts#L70)。
- 読取方法: 同じreferenceIdのREFERENCE_JSON.points[].idと既存reference snapshotから取得。編集中referenceの点も下書き候補にできる。
- 新規操作: `literal-only`。 referenceIdで候補を絞り、別基準の点を混ぜない。未登録/候補外のIDも所有Schemaに適合すれば入力可能。
- ネストしたデータ、補助候補、または後続providerの共通定義。個々の適用箇所はSchemaカタログ・設計本文を参照。
- JSON/YAML内部の収集箇所: 2件。[内部項目一覧](nested-fields.ja.md)のprovider=`reference-point`を参照。
