# 段階1の全check件数訂正と依存再固定

2026-10-18。Scene Graphの全check成功ログは66件で、10件という記録は対象テスト群との混同だった。8owner合計は1,106件へ訂正した。[訂正前の原文とSHA-256](history/stage1-counts-before-20261018/snapshot.json)を保持し、以前の対象10件・215件等の部分集合の検証は変更しない。

| repo | 全check成功テスト数 |
|---|---:|
| scene-graph | 66 |
| camera-source | 240 |
| aframe | 55 |
| time-space-sync | 342 |
| extension-template | 18 |
| 3d-scene-runtime | 15 |
| camera-calibration | 202 |
| realtime-motion-capture | 168 |
| 合計 | 1,106 |

共通R4 B5・Camera Source 53a2a400は不変。Sceneの件数訂正commit `5cb8b7787040f55d968c2e2aa384653e8c6abed5` をRuntimeのmanifest・lock・allowBuilds・実解決へ揃えた。Schema・API・入力・135生成物を変更せず、集計を成功ログと一致させる作業である。

この文書は件数と検証前提のsnapshot。自身のcommit SHAを埋め込む循環を避け、最終HEAD・postcommit検証・現在のCIは既存9 PRとcoordinatorの新しい記録へ対応付ける。Runtimeでは追跡distをcommit後に既存check:distを確認する。残る7repoの成功ログは不変のsource/依存前提で再利用し、件数訂正だけを理由に全件を再実行しない。

[機械記録](stage1-count-correction-20261018.json)に9 PRと依存/役割を記録した。ロールバックは今回の変更前commitのpackage・lock・workspaceを一組で戻し、関連notice SHA・実解決・再buildしたdistを照合する。sourceを移行していないため逆変換不要。

後続ではGUIの修正版artifact/lock/実解決・capability、元形式read/encode、無変更保存の原文/コメント/Undo、保存直前context、16owner形式のRJSF範囲を確認する。GUIは公開0.1.0のままで、新./schemaをまだ持たない。段階2以降・PR merge・npm公開は行っていない。
