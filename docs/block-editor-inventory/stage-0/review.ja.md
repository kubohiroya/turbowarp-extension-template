# 5件の指摘への反映と再レビュー

2026-10-18の設計スナップショット。[公開範囲と時点の注意](README.ja.md#このスナップショットの読み方)を参照。

2026年10月18日 日本時間。[段階0設計](README.ja.md)・[全件データ](inventory.json)・[内部項目一覧](nested-fields.ja.md)が対象。今回の変更は設計資料のみ。下記の受け入れ基準は後続実装の条件であり、UIや互換codecの動作確認を完了したという意味ではない。

## 指摘・反映箇所・依存

| ID / 元の優先度 | 対象 | 修正した設計 | 依存と完成段階 |
|---|---|---|---|
| R1 / P1 | A-Frame `loadTemplate.SOURCE` | Schemaの直接再利用を`compose-fixed`へ変更。受入契約の正本は現行parser、既存の厳しいJSON Schemaは参照資料。空id/type、重複class、配列/object属性を保持する互換Schema/codecを計画。自動移行・runtime厳格化なし | A・B・Gで互換基盤を段階1/2、D・Eを含む内部候補まで揃うのは段階4 |
| R2 / P1 | Bubble `defineBubbleStyle.TEXT_STYLE` | Asset Manager runtime textStyle providerを削除し、有効なBubble text capabilityのstyle providerへ接続。注入/既存SVG Text/独立既定compositionを区別 | D・Eとcapability identity付きread port、段階4 |
| R3 / P2 | 配置JSON等の内部ID・名前 | root引数とは別の79規則を20引数の131箇所へ展開。JSON pointer風path、variant、再帰、候補context、定義/参照、正本を記録し親依存を再計算 | A・B・Gを先行。候補はD・E、親フォーム完成は段階4。固定enumは段階3 |
| R4 / P2 | asset-manager/cache `setLoadingCostumes.NAMES` | 重複なし順序付きUIを新分類。空/重複を除いた先頭出現順が論理リスト。変更なしsourceを保持し、編集後は一意な順序を保存 | A・B・D・E・G、段階6。blink/lip-sync等の反復可能リストは既存分類を維持 |
| R5 / P2 | WebRTC・QR pairing・motion-captureのpeer引数 | `webrtc-peer-alias`、`pairing-local-peer`、`pairing-remote-peer`、`pose-source-peer`の4providerへ分離。IDの構文、空値、session/roleを所有側へ対応付け | A・B・D・E、段階4。任意ネットワーク接続やpose開始は不要 |

ブロック865件・入力引数943件、派生42拡張の862ブロック・940引数は維持した。②8引数・③6引数と混在7ブロックの区分も維持した。候補providerは55→60、入力スロットUIは既存候補＋新規入力316→321、資源参照103→98、順序付き20→18、重複なし順序付き0→2となる。内部項目は入力引数に加算しない。

## 実装時の具体的な受け入れ基準

| ID | 最小のfixtureと期待する結果 |
|---|---|
| R1 | `{"id":""}`、`{"type":""}`、`{"classes":["actor","actor"]}`、`{"class":["actor","actor"]}`、`{"attributes":{"position":[0,1,2]}}`、`{"data":{"custom":{"v":1}}}`とその再帰childを表示・保存できる。変更なし保存でsourceの実バイト列と履歴を維持。別の項目を編集しても未編集値の型・重複・空値を保持。`[]`、未知ノードキー、不正children、空白だけのrecordキーを現行通り拒否。従来実行で保存後のデータを読める |
| R2 | 注入text capability、既存SVG Text、既定compositionを切り替え、対応するstyle候補だけが表示される。同名のAsset Manager runtime textStyleを混ぜない。SVG Text候補は同じregistryの場合だけ共有。read portがなくても直接入力と旧値保持ができる。候補取得でstyle登録/描画/新composition生成を起動しない |
| R3 | `defineReference.REFERENCE_JSON.referenceId`と`points[].id`を定義候補へ、`OBSERVATION_JSON.referenceId/cameraId/intrinsicProfileId/imagePoints[].id`を各contextの参照候補へ反映。異なるreferenceの点、別camera/形式のprofileを混ぜない。kind/measuredByを既存enumで選択。profile JSONとROS YAMLは元variantのpathだけを編集し自動移行しない。再帰node/rigイベント/performance performerも規則通り。const/required/数値範囲は所有Schemaから生成し、Reporterは実行しない。親引数と内部項目の保存を1 transactionで扱う |
| R4 | `a,a,b`の論理リストは`[a,b]`で2番目が`b`。` b , a , b, ,`は`[b,a]`で2番目が`a`。変更なし保存では元の区切り/空白/重複を含むsourceを変更しない。編集済みリストの並べ替え、空リスト、Undo/Redoが従来の解釈と一致。blink/lip-syncで同じ資源を反復するケースは削らない |
| R5 | 同じ文字列を4roleに与えても候補索引を無条件統合しない。Pose開始のPEER_IDはネットワークpeer未作成でも正しい構文なら入力可能。QR answerのLOCAL_PEER空文字はofferから採用する指定として維持。QR remote IDから接続先aliasへの既存の明示経路は保持。WebRTC envelope.fromのlocalIdを別名やpose IDへ勝手に同期しない。`*`はsendEvent/broadcastNetworkMessageに限り全接続先指定として扱う |

## 再レビューで確認した根拠

- R1: [A-Frameの現行parser](https://github.com/kubohiroya/turbowarp-aframe/blob/8d05ee87a17ef230afa0f01b31b98282f71996a1/src/extension.ts#L1236)と[既存Schema](https://github.com/kubohiroya/turbowarp-aframe/blob/8d05ee87a17ef230afa0f01b31b98282f71996a1/schemas/aframe-template.schema.json)を比較した。現行ソースから純粋なvalidatorだけを抽出し、空id・重複classes・配列属性・object data・再帰childの5入力がruntimeで受理され、既存Schemaでは拒否されることを再現した。非object・未知キー・不正children・空白recordキーの4入力はruntimeで拒否された。
- R2: [Bubbleの既定capability](https://github.com/kubohiroya/turbowarp-bubble/blob/ad5b008e89f95c0182977f3e2e77d58fc2041b16/src/turbowarp-adapter.ts#L324)、[有効capabilityの選択](https://github.com/kubohiroya/turbowarp-bubble/blob/ad5b008e89f95c0182977f3e2e77d58fc2041b16/src/turbowarp-adapter.ts#L1370)とcompositionのstyleName参照を再照合した。候補の所有元にAsset Manager runtime textStyleが残っていないこと、同一SVG Text registryに限る条件付き固定値収集を確認した。
- R3: [配置基準Schema](https://github.com/kubohiroya/turbowarp-time-space-sync/blob/28ce8bfe1e875c378f4100710ed1e41170962ce5/schemas/placement-reference-v1.schema.json)、[配置観測Schema](https://github.com/kubohiroya/turbowarp-time-space-sync/blob/28ce8bfe1e875c378f4100710ed1e41170962ce5/schemas/placement-observation-v1.schema.json)、profile各形式のparser、scene/AR Schema、TypeBox protocol定義、avatar-rig型を照合した。79規則と131適用、親への依存・段階の合算、providerからの逆引きを確認した。うち71規則のpathは既存Schema上で存在を検証し、固定Schema未作成とROS形式の8規則は所有parser/型と照合した。schema由来の一般UIと候補/variantの上書きを区別し、任意JSONへ名前の意味を推測して適用していない。
- R4: 両拡張の[setLoadingCostumesとloadingCostumeAt](https://github.com/kubohiroya/turbowarp-asset-manager/blob/19d16320d91287319f2c39ec09a08e0dda67ed40/src/extension.ts#L902)を純粋な抽出メソッドで比較し、各3入力、計6入力で一意化・先頭順・2番目取得・空リストを確認した。2引数だけが新UI分類に変わり、他の反復リストが維持されることを確認した。
- R5: [QR pairing facade](https://github.com/kubohiroya/turbowarp-webrtc-qrcode-pairing/blob/afc54cc1317908933f73a2d826e578e5d0ec3132/src/extension.ts#L82)、[controllerのlocal/remote用途](https://github.com/kubohiroya/turbowarp-webrtc-qrcode-pairing/blob/afc54cc1317908933f73a2d826e578e5d0ec3132/src/pairing/controller.ts#L125)、[Pose開始時のID制約](https://github.com/kubohiroya/turbowarp-realtime-motion-capture/blob/213cbd39ff0c9111d8dff04713eb4baf627da577/src/pose/controller.ts#L480)、[WebRTC送信元のlocalId](https://github.com/kubohiroya/turbowarp-webrtc/blob/18ed3b34a49b3c1828ce651a04a4a593b3fe0e99/src/manual-peer-session.ts#L378)を照合した。トップレベルの30引数が4roleへ分かれ、JSON内のpose-source参照と他roleが混ざっていないことを確認した。

純粋抽出による15入力の結果は[レビュー根拠データ](review-evidence.json)に保存した。拡張をimportしてconstructorを実行する方法は使っていない。資料構造、件数、全ブロック宣言、source SHA-256、リンクの検証は[棚卸し検証記録](validation.ja.md)を参照する。

再レビュー時には、記録した240根拠ファイルのSHA-256を照合した。また、`scratch-gui`のsnapshot外の表示関連ファイルに別のローカル差分を検出した。今回根拠にしたhost/service/feature-flagは同一であり、別差分は変更していない。その品質評価は今回のレビュー対象外とし、後続実装でGUI baselineの再確認を必要とする。

## 判定と残る実装条件

指摘5件について、設計上の修正と一覧・集計・依存・受け入れ基準の整合を再確認した。今回照合したローカルソースと対象範囲では、追加の修正必須事項は見つからなかった。既存の候補read portがすべて実装済みという判定ではない。具体的な互換Schema、source保持codec、context別provider、GUI transactionは後続実装で上記fixtureを使って確認する。

②③は別タスクとして設計上の分離を維持する。ここで記録した再レビューは実装やSchema実ファイルの作成を対象としていない。今回の文書公開はIssue #27で管理する。


240根拠ファイルの確認と15入力の結果は段階0再レビュー当時の記録であり、今回の公開時に実行し直した結果ではない。後続の正本分類の訂正を反映した保存版では`inventory.json.sources`は293件。公開資料の整合確認と、当時の実行検証は[検証記録](validation.ja.md)で区別する。
