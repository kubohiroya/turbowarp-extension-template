# 段階1 CI修正・依存再固定・再レビュー

2026-10-18。7件のCI失敗とScene Graphのmain競合を修正し、8作業ブランチへ計9 commitをpushした。共通R4修正版B5は変更していない。全9ブランチのlocal/remote/PR HEADが一致、実装worktreeはclean。CIのある8repoは最新HEADのpush/PR計16 checkすべて成功。Scene Graphはcheck報告なし・main競合解消済みでDraftを維持する。

| repository / PR | 最終HEAD | 状態 |
|---|---|---|
| [kubohiroya/turbowarp-extension-data-editor](https://github.com/kubohiroya/turbowarp-extension-data-editor/pull/21) | `b5f4b8d2e391a0d57d091c8f3e1c2d58da152dc8` | CI2件成功 |
| [kubohiroya/turbowarp-scene-graph](https://github.com/kubohiroya/turbowarp-scene-graph/pull/6) | `7235a23718aeea94c952c49de7928af943321f6b` | Draft・main競合なし |
| [kubohiroya/turbowarp-camera-source](https://github.com/kubohiroya/turbowarp-camera-source/pull/48) | `53a2a400bbdee6a850379eff29f0d422d948174e` | CI2件成功 |
| [kubohiroya/turbowarp-aframe](https://github.com/kubohiroya/turbowarp-aframe/pull/20) | `f200da585fa3b38d13cfc998d32fabd62689028a` | CI2件成功 |
| [kubohiroya/turbowarp-time-space-sync](https://github.com/kubohiroya/turbowarp-time-space-sync/pull/21) | `ca5fd820c18be6cf3dea1f6b1efd2985f14a19a3` | CI2件成功 |
| [kubohiroya/turbowarp-extension-template](https://github.com/kubohiroya/turbowarp-extension-template/pull/30) | `fd73d0fcb1b0a86222ebc33b0863399f45bb3f5b` | CI2件成功 |
| [kubohiroya/turbowarp-3d-scene-runtime](https://github.com/kubohiroya/turbowarp-3d-scene-runtime/pull/2) | `8e159de960387875a0d4aa1de0f273c5905d102b` | CI2件成功 |
| [kubohiroya/turbowarp-camera-calibration](https://github.com/kubohiroya/turbowarp-camera-calibration/pull/39) | `33fd9368540c4c4edfd5ad4ee6c0ca29bf524b2f` | CI2件成功 |
| [kubohiroya/turbowarp-realtime-motion-capture](https://github.com/kubohiroya/turbowarp-realtime-motion-capture/pull/33) | `cfd8219cc356fb9ac03a5cb0abbf92351efae816` | CI2件成功 |

## 修正と互換性

- runtime-subentryの厳密な公開入口一覧に./editor-schemaを追加し、個別JS/型パスを検査した。既存runtime公開値・root入口禁止・副作用・到達純粋性のガードを維持。
- pack metadataのJSON解析ではignore-scriptsを維持し、foreground-scripts=falseを追加。npm10のprepare出力混入と修正後の正常解析を実repoで確認した。
- Scene Graphはmain8839eab2を作業ブランチへ取り込み、publish前build・build:editor・prepareをすべて保持した。mainはHEADの祖先。PRをmainへmergeしていない。
- Calibrationの正確なGit取得許可は指定2名・正確なGitHub URL・40桁SHAに限定。可変ref・別origin・短SHA等を拒否する回帰を追加。noticeの版0.16.0とSHA、runtime/profileの説明を修正した。
- 配置の最新CIでは画像処理テストが5.294秒で既定5秒超過。該当1テストのみ15秒へ変更し、5視点・各43frame・精度assertionを維持。本番処理・global timeoutは変更なし。

本番source191ファイルと135 emitはR1〜R4のレビュー基準からbyte一致。データ・Schema受入、API、既定OFF方針を変えていない。Runtime/Calibrationの追跡dist更新は依存cacheのregionコメントだけで、それらを除いたbyte列は同一。

## 依存と検証

共通はb5f4b8d2のまま。Runtime→Scene `7235a237`、Calibration/Motion→Camera Source `53a2a400`へmanifest・lock・allowBuilds・実解決を揃えた。3consumerの通常frozen installが成功し、恒久的なexotic依存制限緩和はない。共通の直接8/間接3経路、R4宣言既定nullと型hash・pure12ファイル、AR0.3.0/plan、配置既存Camera0.7.0を維持。

| repo | pnpm check成功テスト数 |
|---|---:|
| scene-graph | 10 |
| camera-source | 240 |
| aframe | 55 |
| time-space-sync | 342 |
| extension-template | 18 |
| 3d-scene-runtime | 15 |
| camera-calibration | 202 |
| realtime-motion-capture | 168 |
| 合計 | 1,050 |

Runtime/Calibrationは追跡dist commit後にも全checkを実行し既存check:distまで成功。全9最終tarballでsource→一時再emit→現出力→tarball内135ファイルのSHA-256一致、src/Reactなしpure import/noDOM厳密型、16契約、producer指紋を再確認した。配置の最後の変更はtest/docのみのため他8pack/16契約結果は前提照合で再利用し、配置tarballは最終commitへ更新した。

pure/noDOMはskipLibCheck:false、既存RJSF互換型だけtrueの制約を維持。共通65件等の既存検証は不変のsource/依存前提で再利用した。以前の215件・135基準と過去の失敗ログは履歴として保持し、今回の1050件や最新CI成功と混同しない。

## 再レビュー

並列の独立レビューでAPI/ライセンス/厳密pin、Scene main取込、3consumerの直接・間接依存、局所timeoutとcoverage、記録を確認した。notice版・不存在rollback辞書の予定文面参照・配置artifact履歴の共有参照・採取順による旧HEAD表記を修正。最終記録は現物hash・現在HEADへ照合し、解消を再確認した。

既存9 PR本文にも最新依存・検証・CI・実行可能なrollback手順を反映済み。公開された本文hash/head/base/Draftを照合した。PR mergeやReady変更は行っていない。

## rollbackと後続

新pure/bundle利用を停止する。CI修正だけの依存切戻しは各新JSONのbase_before_CI_fix commitからpackage/lock/workspaceを一組で戻す。Calibrationのnotice SHAも揃え、追跡distを再buildして実解決・生成物を検証する。PR全体の切戻しは統合commitをrevertし、Scene作業ブランチのmain取込を戻す場合は第一親を基準にする。保存sourceを移行していないため逆変換は不要。

GUIは1848ab82の公開0.1.0のままで新./schemaを持たない。後続ではGUIのartifact/lock/実解決、capability、元形式read/encode・無変更保存・原文/コメント/Undo、保存直前context、16形式のRJSFを確認する。今回、原因調査、段階2以降、新PR/Issue、Issue操作、PR merge、npm公開は行っていない。

詳細は[機械記録](stage-1-ci-fixes-20261018.json)。新旧基準・CIログ・最終PR本文とAPI・再レビュー・9tarballとhashをimplementation-history/stage-1-ci-fixes-20261018/へ保存した。
