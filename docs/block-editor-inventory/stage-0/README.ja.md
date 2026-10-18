# 拡張ブロックの固定Schema編集に向けた段階0設計

2026年10月18日 日本時間。5件のレビュー指摘と、その後の正本・分類の訂正を反映した設計資料の保存版。

テンプレートを土台とする42拡張の862ブロック・940引数について、編集データの契約、UI、候補取得元、共通基盤への依存を引数単位で分類した。テンプレート自体の3ブロック・3引数は参考として別枠で収録し、全件データは43リポジトリ・865ブロック・943引数となる。

①は既存Schemaの再利用、新しい固定Schema、既知の固定unionと条件分岐、および構造を変えない候補補完を対象とする。②のSchema自体の編集、③の利用者指定Schemaからのフォーム生成は分離する。段階0で確定するのは対象と設計上の分類であり、追加Schema・provider・adapterの実装や承認済みの公開計画を意味しない。

## このスナップショットの読み方

2026-10-18に完成済みの棚卸し・分類・設計レビューを切り出した資料。本文の「現在」「未作成」「予定」、リポジトリ名・パッケージ版・ソース行は採取時点の意味で、最新のAPIや実装状況の案内ではない。通常の利用手順は[ブロック編集ガイド](../../block-editors.ja.md)を参照する。段階1以降の受け入れ基準は将来の設計条件であり、完了を表さない。

原本の未追跡資料は別作業で更新されているため、独立した`stage-0/`へ保存した。段階1の進捗、S1-1実装記録、baseline、差分パッチは公開対象外。正本の分類とconsumer検証の整理は完成済みのカタログへ反映し、後続実装の成功記録は含めない。

ソースの内容が採取SHA-256と一致し、記録したコミットをローカルの`origin`追跡参照で確認できた場合だけGitHubのコミット固定リンクにした。それ以外は「採取時のローカル根拠」としてパスを記載する。コミットの公開確認は追跡参照に基づくもので、現在のHTTP到達性や全リポジトリの実行検証を保証しない。採取時のローカル変更を含む根拠もある。

## レビューする資料

| 資料 | 内容 |
|---|---|
| [全ブロック一覧](blocks.ja.md) | 865件。opcode、区分、引数ごとのUI、正本、依存、段階、非表示・フラグ条件 |
| [全引数一覧](arguments.ja.md) | 943件。①②③、Schemaの正本または新設根拠、候補取得元、保存条件・例外 |
| [Schema正本と候補取得元](catalog.ja.md) | 25の構造Schema契約と60の候補provider。既存・新設・固定合成を区別 |
| [機械可読の全件データ](inventory.json) | 完全opcode、型、初期値、JSON pointer、ソース行、採取時のgit状態、SHA-256を含む |
| [JSON/YAML内部項目](nested-fields.ja.md) | 79規則を20引数内の131箇所へ適用。path、variant、候補、依存を明示 |
| [修正と再レビュー](review.ja.md) | 指摘5件の修正内容、根拠、再確認結果、実装時の受け入れ基準 |
| [棚卸し検証記録](validation.ja.md) | カバレッジ、重複、参照、分類集計、ソースの同一性を確認した結果 |

全件データと読み物の表は同じ分類データから作成した。分類の根拠は採取時のローカルソースで、`new-fixed`の予定パスにファイルはまだ存在しない。実装時はその正本から具体的なrequired・範囲・追加プロパティ等を定義し、所有parserとの一致を対象fixtureで確認する。

## 対象範囲と集計

対象は前段の計画で扱った `/Users/hiroya/Dev/turbowarp-*` の直下checkoutのうち、`src/block-definitions.json`と`src/extension.ts`を持つ42拡張、および参考テンプレートとする。GitHubアカウント全体や別の場所にあるcheckoutまで含めた全数調査ではない。

JSONの定義に加え、実際の`getInfo()`、コード中の定義追加、menu、フラグによるfilterを確認した。フラグOFF・palette非表示の定義も対象とし、接続状態・runtime状態によって表示されないからといって一覧から落とさない。セパレーターはブロックに数えない。表の順序はpaletteの表示順を表さない。

| 集計 | 派生42拡張 | 参考テンプレート | 合計 |
|---|---:|---:|---:|
| ブロック | 862 | 3 | 865 |
| 引数 | 940 | 3 | 943 |
| ①だけを持つブロック | 546 | 3 | 549 |
| ①と②③が混在するブロック | 7 | 0 | 7 |
| ②③だけを持つブロック | 2 | 0 | 2 |
| 編集引数のないブロック | 307 | 0 | 307 |
| ①の引数 | 926 | 3 | 929 |
| ②へ分離する引数 | 8 | 0 | 8 |
| ③へ分離する引数 | 6 | 0 | 6 |

したがって①の編集項目を1つ以上持つ派生ブロックは553件。これは定義上の対象数であり、接続Reporterや読み取り専用workspaceを含む全インスタンスを編集可能にする件数ではない。

静的JSONの847派生ブロックに、`asset-manager`と`asset-cache`の各7件、`async-input`の1件を加えて862件になる。追加15件の識別子・ソース行も全件データに含めた。`http-server-cloudflare`のセパレーターは除外した。

### UIと内部項目の再集計

| UI | 入力スロット数 |
|---|---:|
| 固定構造フォーム＋ソース | 29 |
| 固定選択 | 63 |
| 既存候補＋新規入力 | 321 |
| 既存資源参照＋直接入力 | 98 |
| 数値入力 | 130 |
| 文字列入力 | 78 |
| 複数行入力 | 101 |
| 構文付きソース入力 | 23 |
| 順序付き反復入力 | 18 |
| 真偽値 | 5 |
| 環境依存の候補選択 | 6 |
| 固定条件で切替 | 7 |
| 重複なし・順序付き反復入力 | 2 |
| 実行時handle/内部fragmentの文字列保持 | 35 |
| 重複なし複数選択 | 2 |
| 汎用JSONツリー＋ソース | 9 |
| ② Schema定義編集 | 8 |
| ③ Schema依存のデータ編集 | 6 |
| 色入力 | 2 |

入力スロット合計943件（①929、②8、③6）。旧集計から既存資源参照103→98、既存候補＋新規入力316→321、順序付き反復20→18、重複なし順序付き0→2に変更した。Schema契約は25件のまま、候補providerは55→60件。Bubbleのprovider置換、peerの1→4分割、profile/基準点providerの追加を反映した。

JSON/YAML内部は79規則を20引数内の131箇所へ展開し、候補入力108・固定選択4・通常文字列19に分類した。これらは入力スロット数へ加算しない。内部項目の依存と段階を親引数・ブロックへ合算したため、配置JSONやA-Frame等のフォーム完成は段階4になる。

Schema契約の内訳は、既存再利用2・生成Schema再利用7・固定合成7・新規固定9。配置2契約もSpec由来の生成物であるため、既存再利用4/生成再利用5から区分を訂正した。段階1の対象16と後段9の総数は変わらない。

Schemaの共有とconsumer固有の入力条件を区別し、7検証profileをmotionの10引数へ対応付けた。全ブロック/引数表から[検証カタログ](catalog.ja.md#ブロック固有の入力検証)へ参照できる。これは入力数やUI数に加算しない。

### リポジトリ別の件数

| 拡張 | ブロック | 引数 | ①を持つブロック | ②③のみ | 引数なし |
|---|---:|---:|---:|---:|---:|
| [turbowarp-3d-scene-runtime](blocks.ja.md#turbowarp-3d-scene-runtime) | 5 | 1 | 1 | 0 | 4 |
| [turbowarp-aframe](blocks.ja.md#turbowarp-aframe) | 36 | 96 | 34 | 0 | 2 |
| [turbowarp-ar](blocks.ja.md#turbowarp-ar) | 16 | 25 | 13 | 0 | 3 |
| [turbowarp-asset-cache](blocks.ja.md#turbowarp-asset-cache) | 31 | 33 | 22 | 0 | 9 |
| [turbowarp-asset-manager](blocks.ja.md#turbowarp-asset-manager) | 31 | 33 | 22 | 0 | 9 |
| [turbowarp-async-input](blocks.ja.md#turbowarp-async-input) | 12 | 21 | 8 | 0 | 4 |
| [turbowarp-binary-data](blocks.ja.md#turbowarp-binary-data) | 6 | 8 | 6 | 0 | 0 |
| [turbowarp-bubble](blocks.ja.md#turbowarp-bubble) | 33 | 77 | 31 | 0 | 2 |
| [turbowarp-camera-calibration](blocks.ja.md#turbowarp-camera-calibration) | 29 | 41 | 28 | 0 | 1 |
| [turbowarp-camera-source](blocks.ja.md#turbowarp-camera-source) | 41 | 38 | 35 | 0 | 6 |
| [turbowarp-diagnostic-overlay](blocks.ja.md#turbowarp-diagnostic-overlay) | 6 | 5 | 3 | 0 | 3 |
| [turbowarp-document-data](blocks.ja.md#turbowarp-document-data) | 8 | 14 | 8 | 0 | 0 |
| [turbowarp-extended-notification](blocks.ja.md#turbowarp-extended-notification) | 5 | 7 | 5 | 0 | 0 |
| [turbowarp-extension-template](blocks.ja.md#turbowarp-extension-template) | 3 | 3 | 3 | 0 | 0 |
| [turbowarp-html](blocks.ja.md#turbowarp-html) | 44 | 57 | 41 | 0 | 3 |
| [turbowarp-http-server](blocks.ja.md#turbowarp-http-server) | 57 | 54 | 35 | 0 | 22 |
| [turbowarp-http-server-cloudflare](blocks.ja.md#turbowarp-http-server-cloudflare) | 9 | 22 | 9 | 0 | 0 |
| [turbowarp-http-server-jotai](blocks.ja.md#turbowarp-http-server-jotai) | 7 | 8 | 5 | 0 | 2 |
| [turbowarp-http-server-react](blocks.ja.md#turbowarp-http-server-react) | 4 | 8 | 3 | 0 | 1 |
| [turbowarp-jsqr](blocks.ja.md#turbowarp-jsqr) | 3 | 5 | 2 | 0 | 1 |
| [turbowarp-kvs](blocks.ja.md#turbowarp-kvs) | 5 | 10 | 5 | 0 | 0 |
| [turbowarp-markdown](blocks.ja.md#turbowarp-markdown) | 19 | 21 | 17 | 0 | 2 |
| [turbowarp-named-data](blocks.ja.md#turbowarp-named-data) | 1 | 0 | 0 | 0 | 1 |
| [turbowarp-named-functions](blocks.ja.md#turbowarp-named-functions) | 11 | 15 | 9 | 0 | 2 |
| [turbowarp-openai-realtime-api](blocks.ja.md#turbowarp-openai-realtime-api) | 25 | 16 | 13 | 0 | 12 |
| [turbowarp-photogrammetry](blocks.ja.md#turbowarp-photogrammetry) | 1 | 1 | 1 | 0 | 0 |
| [turbowarp-qr-display](blocks.ja.md#turbowarp-qr-display) | 6 | 5 | 2 | 0 | 4 |
| [turbowarp-realtime-motion-capture](blocks.ja.md#turbowarp-realtime-motion-capture) | 103 | 54 | 32 | 0 | 71 |
| [turbowarp-runtime-expression](blocks.ja.md#turbowarp-runtime-expression) | 4 | 8 | 4 | 0 | 0 |
| [turbowarp-sesame](blocks.ja.md#turbowarp-sesame) | 18 | 13 | 7 | 0 | 11 |
| [turbowarp-structured-data](blocks.ja.md#turbowarp-structured-data) | 18 | 34 | 15 | 0 | 3 |
| [turbowarp-svg-text](blocks.ja.md#turbowarp-svg-text) | 2 | 8 | 2 | 0 | 0 |
| [turbowarp-teachable-machine](blocks.ja.md#turbowarp-teachable-machine) | 48 | 26 | 18 | 0 | 30 |
| [turbowarp-text-lines](blocks.ja.md#turbowarp-text-lines) | 3 | 5 | 3 | 0 | 0 |
| [turbowarp-time-space-sync](blocks.ja.md#turbowarp-time-space-sync) | 44 | 18 | 11 | 0 | 33 |
| [turbowarp-title-menu](blocks.ja.md#turbowarp-title-menu) | 14 | 5 | 3 | 0 | 11 |
| [turbowarp-visual-tracking](blocks.ja.md#turbowarp-visual-tracking) | 1 | 1 | 1 | 0 | 0 |
| [turbowarp-voice-chat](blocks.ja.md#turbowarp-voice-chat) | 33 | 20 | 15 | 0 | 18 |
| [turbowarp-web-speech](blocks.ja.md#turbowarp-web-speech) | 21 | 8 | 8 | 0 | 13 |
| [turbowarp-webrtc](blocks.ja.md#turbowarp-webrtc) | 48 | 56 | 32 | 0 | 16 |
| [turbowarp-webrtc-qrcode-pairing](blocks.ja.md#turbowarp-webrtc-qrcode-pairing) | 31 | 39 | 30 | 0 | 1 |
| [turbowarp-webusb-pasori](blocks.ja.md#turbowarp-webusb-pasori) | 5 | 7 | 4 | 0 | 1 |
| [turbowarp-yaml-json](blocks.ja.md#turbowarp-yaml-json) | 18 | 17 | 10 | 2 | 6 |

### 独立ブロックとして数えないリポジトリ

以下は対象を黙って省略したものではなく、ブロック定義の所有元とは別の役割として扱う。`kamishibai-app`等が埋め込む生成済み拡張は元の所有リポジトリで一度数える。アプリ固有のAction Contextや生成ブロックなど、このテンプレート由来の42拡張とは別契約のブロックは今回に含めない。

- 共通基盤・型・Schemaの所有元: `turbowarp-block-editor`, `turbowarp-extension-manifest`, `turbowarp-runtime-host`, `turbowarp-scene-graph`, `turbowarp-scene-graph-plan`。
- DSL・構築・プレビューのライブラリ: `turbowarp-3d-schene-graph-dsl`, `turbowarp-app-shell`, `turbowarp-local-preview`, `turbowarp-preview-runtime`, `turbowarp-sb3-app-source`。
- アプリ・テンプレート・文書・サンプル: `turbowarp-app-template`, `turbowarp-camera-calibration-app`, `turbowarp-kamishibai-app`, `turbowarp-kamishibai-docs`, `turbowarp-kamishibai-samples`, `turbowarp-photogrammetry-app`, `turbowarp-realtime-motion-capture-app`, `turbowarp-time-space-sync-app`, `turbowarp-webrtc-qrcode-pairing-app`。

`scratch-gui`はブロック数に加えず、保存先のホストとして調査した。別worktree・生成bundleのコピーも二重計上しない。`photogrammetry`と`visual-tracking`は現状の`hello`だけを記録し、名称から将来の機能を推測してブロックを作らない。参考テンプレートのscene/noteサンプルは各派生拡張へ一律追加しない。

## ①の分類と保存契約

| 分類 | UIとSchema | 決定した扱い |
|---|---|---|
| 自由入力 | 固定のstring/number/boolean等 | 所有側の変換・空値・範囲が正本。初期値から必須やenumを推測しない |
| 固定選択 | enum、radio、select | canonical保存値と翻訳ラベルを分離。既存alias/fallbackを黙って書換えない |
| 名前の定義・参照 | string制約＋検索付きコンボボックス | 候補は補助情報。新規入力・前方参照・外部で定義される名前を保持 |
| 資源の参照 | 固定の識別子制約＋資源候補 | 型・scope・namespaceを区別。選択だけで資源を作成しない |
| 環境依存の選択 | 型を固定して候補を非同期更新 | 未接続・未ロード・候補消失でも値を消さず、フォームが機器を起動しない |
| 固定の条件分岐 | 固定Schemaのif/then等＋widget | `setTextStyle`、歪みモデル、Bubble trigger。任意Schemaの読込とは別 |
| 集合 | 重複なしの複数選択 | scene-sourceのclasses（uniqueItems）、keypoint集合など。A-Frame loadTemplateの重複classesとは区別。元契約が集合である場合だけ重複を除く |
| 重複なし順序付きリスト | 並べ替え可能・一意の反復行 | setLoadingCostumesの先頭出現順を維持。空・重複は所有側の解釈に合わせる。変更なしsourceは保持 |
| 順序付きリスト | 並べ替え可能な反復行 | フレーム順序・同じ資源の再使用・資源と時間の対応を維持 |
| ソース・handle | string Schema＋構文補助/そのまま入力 | 内部fragment、promise、runtime builder handleを通常JSONだと決めつけない |
| 任意JSON | 固定の再帰JSON value/object Schema | 型・配列・任意キーの汎用編集。利用者指定Schemaに基づく専用フォームは③ |

`inventory.json`の`ui_categories`は上記を19種類の具体的widgetへ分ける。`schema.status`、`candidate_sources`、`dependencies`は全引数に存在する。候補不要な自由入力も空配列として明示した。

### Schemaの正本

機械可読データも正本・生成物・参照用Schema・生成処理を分ける。`authority`は役割付きの根拠一覧とし、A-Frameの公開Schemaは参照用へ分類する。詳細は[カタログ](catalog.ja.md)を参照する。

- 既存JSON Schemaが入力契約を表す場合は再利用する。A-Frameは現行parserとの不一致があるため、下記の互換adapterを先行条件とする。manifest、compiler/deploy IR、出力専用Schemaを名前だけで編集データへ流用しない。
- time-space-syncの配置契約は`placement.ts`のSpecが正本で、`spec.ts`の`toJsonSchema`と`publishedContracts`からJSONを生成する。読み取り専用の`schemas:check`でmetadataを含む全文一致を確認し、生成JSONだけを修正しない。
- TypeBoxで所有するmotion-captureの契約は`src/protocol/schemas.ts`が正本で、`schemas/*.json`は生成物として扱う。
- 固定Schemaが存在しない通常引数は、そのブロックの引数宣言と実装を新設根拠とし、予定の`schemas/block-editor-arguments.schema.json`へopcode別に定義する。現時点でJSON Schemaが完成しているという意味ではない。
- 具体的な構造Schemaの正本・合成先は[カタログ](catalog.ja.md)を参照する。新しい同義コピーを各consumerに増やさない。
- 現在Schemaを持たないstringを、JSONらしい初期値だけを理由にobject Schemaへ狭めない。`aframe.emitEvent.DATA`と`http-server.respondWithJson.BODY`は実装上任意文字列で、構文補助に留める。

### 名前の候補と新規作成

Scratch broadcast、拡張通知、WebRTCイベント、A-Frameイベントは別の名前集合である。BubbleのMESSAGEは表示本文なのでメッセージ名の索引に入れない。吹き出しstyle、SVG Text style、runtime textStyleも所有元を区別する。Bubble TEXT_STYLEは現在のtext capabilityのstyle名で、注入capability・既存SVG Text・既定の独立compositionを接続先に応じて区別する。同じSVG Text registryを利用する場合だけ候補を共有し、Asset Manager runtime textStyleは参照しない。

定義ブロック・参照ブロックの固定値を安全に収集し、取得できる所有側のread APIから候補を補う。静的な記述の候補は実行済み・登録済みを意味しない。候補源がprivate registryだけの場合は所有側へ専用read portを追加し、ブロック実行で候補を作らない。provider一覧の`static_literal_sites`に引数スロットの収集対象を記録した。JSON/YAML内部は`nested_field_templates`と各引数の`nested_fields`へ記録し、providerの`nested_literal_sites`から逆引きできる。[内部項目一覧](nested-fields.ja.md)にはpointer、variant、再帰走査、候補context、定義/参照、依存と段階を示す。固定literalだけを所有codecで解析し、Reporterや不正sourceを実行しない。通常の数値・enum等はSchemaから生成し、任意JSONのキー名から名前集合を推測しない。

新規名をフォームへ入力した時点では下書きだけを変える。通常の名前は保存で引数へ反映し、そのブロックの将来の実行が定義・登録を行う。Scratch broadcast名簿も新設する場合だけ、名簿登録と引数変更を1 transactionに含める。メッセージ名の変更はほかのブロックの一括リネームを意味しない。

候補はregistryの存在や実行順を証明しないため、候補にないという理由だけで保存を拒否しない。文字種・識別子構文など所有側で固定された制約は別に検証する。実行時の参照先の存在確認は、編集時の候補補完と分ける。

### 資源と環境に関する例外

- `asset-manager`と`asset-cache`は別のextension ID・registry・DBである。UI部品を共用しても候補を無条件に統合しない。
- `setSpriteSkin.SPRITE`等のsprite名、`respondWithNamedBody.TARGET_ID`のtarget ID、`text-lines.LIST`のlist IDを取り違えない。`prepareLoadingAssets.LIST`は名前で参照する別契約。
- `setLoadingCostumes.NAMES`はnormalizeName後の非空・一意のリストで、最初の出現順を持つ。重複なし順序付きUIを使い、変更なし保存で元文字列を維持する。blink/lip-sync/continue frameは重複を許す別の順序付きリスト。`startActorLoop.DURATIONS`は資源数と対応し、`startActorSequence.DURATIONS`は1値という既存仕様を保持する。
- `camera-source.CAMERA_ID`は利用者の論理名、DEVICE_IDは実機。フォームからカメラ・Bluetooth・USB・ネットワークの接続処理を起動しない。
- VRM表情・ボーンは対象モデルの既存資源。未知の名前を入力してもボーンや表情は作成されない。複数selector一致時の候補を単一モデルの有効性と混同しない。
- `web-speech`はvoice.nameを保存し、空文字が既定音声。ブラウザ差で候補が消失しても旧値を保持する。
- フォント・言語・モデル名・Sesameの状態field・HTML名・A-Frame属性は、例示menuを閉じたenumへ変えない。Bubble placementも方向aliasだけでなく角度を許すため補完付き入力とする。
- `async-input`のKEY_IDはKeyboardEvent.code、通知拡張のKEYは別のキー名規約。Temporary Variablesのruntime変数はScratchの変数とは別の名前集合。

WebRTCの接続先alias、QR pairingの自分/相手protocol ID、PoseFrame2Dのsource peerIdは別providerに分ける。pairingのremote IDが接続先aliasへ渡る経路は明示対応として扱い、自分側IDやWebRTC envelope.fromのlocalIdとの同一性は推測しない。`startAnswerPairing.LOCAL_PEER`の空文字（offerから名前を採用）と、送信ブロック限定の`*`を保持する。

### A-Frameの互換性方針

`loadTemplate.SOURCE`は既存データの互換性を維持する。受け入れ契約の正本は現行`parseTemplate/validateTemplateNode`である。既存`aframe-template.schema.json`は空文字、classの重複、属性値の配列/objectについて実装より厳しく、そのまま保存の必須ゲートにしない。Schema契約を`reuse`から`compose-fixed`へ変更し、現行parserに合わせた固定の互換Schema/codecを新設する計画とする。既存runtimeと公開Schemaの厳格化・データ自動移行は今回に含めない。

`{"id":""}`、`{"classes":["actor","actor"]}`、`{"attributes":{"position":[0,1,2]}}`、data内のobjectを編集可能な状態で保持する。未編集値をString化したり重複を削ったりせず、変更なし保存は元sourceのバイト列を維持する。未知ノードキー、非objectノード、不正children、空白だけのrecordキー等の現行拒否条件も維持する。再帰childにも同じ基準を適用する。

### 固定構造でも専用adapterが必要な例外

1. `3d-scene-runtime.applyScene.SOURCE`はbare sceneと`{scene3d,ar}`、空文字のno-opを受け取る。scene-graphの複数ファイルrefを同梱し、外側の形状を保持する固定adapterを使う。
2. カメラは`twcs/camera-intrinsics`、`camerasource/camera-intrinsics`、旧`twrmc/camera-calibration`を同一Schemaとして扱わない。Camera Source/CalibrationはROS camera_info YAMLも読むため、JSONをYAMLへ直列化するだけでは既存契約を維持できない。形式ごとの固定Schema/codecと、保存だけで移行しない規則を必要とする。
3. motion-captureの校正importは起動時delegateの有無で所有契約が変わる。これは既知の固定adapter選択で扱う。delegateの`validateProfile()`が登録処理を含む経路は、エディターの検証として呼ばない。純粋な所有validatorを使う。
4. protocolJsonValid/decode/encodeは既知の5種6版、bufferPoseFrame2Dは既知の2版の固定union。利用者がSchemaを定義する③ではない。avatar適用のPoseFrame2Dは現行v1を使い、fusion入力と区別する。
5. `time-space-sync.setCameraModel.MODEL_JSON`はintrinsicsとdistortionを持つ独自固定構造。カメラプロファイル全体やintrinsics単体のSchemaを流用しない。
6. `http-server`のログ入力は任意JSONに加えtext fallback、ログ一覧は単一値も受け取る。推奨のmethod/path/statusを必須項目にしない。
7. `http-server-cloudflare`のWorker IRはcompiler manifest等と別。HANDLERSが配列だけでなく単一handlerも受け取る入力契約を保持する。
8. `named-functions`のpromiseとHTTP builderのhandleは実行時トークン。文字列の固定編集に留め、選択だけで実体を生成しない。HTML/Markdown/YAML-JSONの内部fragmentも現行のencodingと空値を保持する。

## 共通基盤の変更と依存関係

| ID | 所有 | 変更する契約 | 依存 |
|---|---|---|---|
| A | block-editorと所有拡張 | draft-07/2020-12、同梱ref、consumer別純粋追加検証、生成正本の同一性、現行parserとの互換性ゲート | 所有Schemaと現行受入契約の照合。A-Frameの厳格な既存Schemaを直接適用しない |
| B | block-editorと各拡張 | 1 opcodeの1フォームに複数引数をbinding。固定選択・ソース・部分適用 | A |
| C | scratch-gui | 数値・色・既存menu等のfield/shadowを安全に読む・保存する | B |
| D | block-editorとscratch-gui | 型を変えないscope/context付き候補provider、検索・新規入力、JSON内部path binding | B |
| E | 各所有拡張とGUI | 引数と固定JSON/YAML内部の定義/参照収集、capability/role/reference/camera別read port、更新通知 | D |
| F | scratch-gui | Scratch broadcast名簿登録と引数変更をまとめるtransaction | C・D |
| G | 所有パッケージとbinding | 複数形式、配列の順序/重複規則、変更なしsource保持、固定variant/再帰pathのcodec | A・B、所有parser |
| H | 所有read portとGUI | 実機・VRM・音声の非同期候補、失効、下書き保護 | D・E |

各ブロック・引数の表の依存は直接必要な契約で、上表にある推移的依存も必要になる。外部資源を使用する拡張の実行時依存は各repositoryの`dependency_packages`と正本カタログで追える。候補を得るために実行時依存をロード・起動することはしない。

Gは段階1のref/形式判定、段階2のsource保持、段階4のliteral内部path収集、段階6の配列codecへ分けて導入する。表のG依存はその項目に必要な部分を指し、段階2/4を段階6の完了待ちにはしない。

段階1は16契約のheadless検証、方言/ref/再帰の合成RJSF smoke、既存templateの回帰、9 repoのpure入口配布まで。owner形式のread/encode、ROS/variant/空sourceの保存は段階2でbindingする。既存の非同期`validateData`は保存時専用を維持し、新同期owner検証だけを同じconsumer/contextでlive/save共通化する。

### ホストで維持する境界

採取時の`turbowarp-block-editor/src/turbowarp/host.js`（旧GUI hostの移設先）は通常の未検証text shadowだけを編集対象にしている。Schemaフォーム側を増やすだけでは数値・menu等を保存できないので、Cを先行させる。menuをtextへ変換して対応したことにせず、`acceptReporters:false`のhat照合も維持する。

接続Reporter、接続変更を必要とする入力、flyout、read-only workspaceは保存対象外。BOOLEAN宣言でも固定値を保持できる既存形状がないインスタンスは参照専用とし、true/falseのために新しいReporterを接続しない。数値の文字列表現、string型のtrue/false、色、空値も元の格納型にbindingする。

複数引数・新規broadcast名の適用は1回のUndo/Redoにまとめ、実書込境界で競合を再確認する。部分失敗で元値・接続・dirty・履歴を戻す。対象外フィールド、②③の項目、未編集の追加プロパティを保存時に欠落させない。

フラグは既存の`scratch-gui/src/lib/tw-feature-flags.js`の`blockEditorDialogs`に一本化し、起動時固定・既定OFFを維持する。現在の拡張側のfeature flagや非表示指定も保持する。対応GUIでの編集はunsandboxed読込とAPIの存在を前提とし、各拡張の既存sandbox設定を一律変更しない。通常TurboWarp、API不在、非対応ホストでは従来の登録・実行を継続する。共通APIの対応版は実装時にsource commitまたは検証済み依存版で固定し、apiVersionだけで能力を推測しない。

## 段階ごとの受け入れ基準

| 段階 | 対象と依存 | 受け入れ基準 |
|---|---|---|
| 0 棚卸し | 本文・全件表・source snapshot | 全42拡張＋参考テンプレート、JSONとコード追加、全引数を重複なく収録。区分・UI・正本/新設根拠・候補/不要・依存・非表示条件を記録。②③を引数単位で分離。内部path/variantと親依存、79規則/131適用、60providerを照合し、5件の再レビュー結果を記録。ローカル資料の整合性を確認 |
| 1 Schema基盤 | A、Gの参照/形式部分 | 両方言と同梱refを検証。未知ref・不正Schemaを診断。16契約のconsumer別pure入力検証、生成全文一致、合成RJSF smokeと既存回帰、9 repoの生成package入口が通る。A-Frameの現行受理/拒否を維持。入力を変更せず、runtime状態を保存条件へ混ぜない。owner16フォームの完成は段階2以降 |
| 2 固定フォーム | B・Gの保存部分、先行する診断・固定項目等 | ownerのraw read/encodeとpure検証をsession単位でbindingし、ROS/bare/wrapper/空source/variantを保持。保存前は最新contextで再検証。読込・変更・保存・再編集が成功。invalidを拒否し、Cancel・変更なし保存で値や履歴を変えない。追加プロパティ・旧版・文字列契約を維持。A-Frameの未編集値はString化/正規化しない。内部候補を含むフォームの完成は段階4に依存 |
| 3 固定選択と条件分岐 | C、固定enum・数値・色・menu | 表示ラベルと保存値が対応。既存hatとalias/fallbackを維持。型・空値・リセット・複数引数の保存を検証。Unsupportedな形状を拒否 |
| 4 名前の候補 | D・E、通知・style・action等 | 未実行定義と参照の固定値を候補化。Bubbleの有効capability、peerのrole、配置reference/point、camera/profile、再帰nodeを区別。親引数の依存にD/E/Gを含む。79の内部適用規則と131箇所を照合。候補外・外部由来・前方参照を保持。取得だけで実行/登録しない |
| 5 Scratch名の登録 | F、async-input/jsqr/webusb-pasori/runtime-expression | 新規broadcast名と引数を原子的に保存。Cancelで名簿を変更しない。Undo/Redoで両方を復元。衝突・途中失敗・同名再利用を確認 |
| 6 資源と環境と配列 | G・H、camera/VRM/voice/assets等 | 未接続・候補消失・遅い応答でも下書き保持。環境を勝手に起動しない。反復可能配列の重複・順序・個数対応と、setLoadingCostumesの一意/先頭順をそれぞれ保持。a,a,bは論理リストa,bで2番目b、b,aへの並べ替えも有効。変更なしsourceは保持 |
| 7 展開と統合 | 各対象の前段依存 | 全①項目の対象テスト、登録/再初期化/解除、API不在を確認。代表例で実GUIのSave/Cancel/Undo/Redo、JSON/YAMLの.sb3保存・別画面再読込・再編集、flag OFFの通常実行を確認 |

段階は引数単位で適用できる。全件表のブロックの段階はそのブロックの①項目をすべて揃える段階であり、前段の固定項目だけを先に実装することを妨げない。共通契約の確定後に各所有拡張を小粒PRで進める。必要な型検査・変更対象テスト・buildに限定し、前提を維持している検証結果は再利用する。安定版リリース向けの全体検証は別段階。

ロールバックはURLから`blockEditorDialogs=1`を外して再読込する。保存済みの引数が従来の実行で読める契約を保つ。既定ON化は今回の計画外。

5件の具体的fixture・反映箇所・再レビュー結果は[修正と再レビュー](review.ja.md)に記録した。これらは将来の実装DoDであり、エディターが実装済みであることを示すものではない。


## ②③への分離

| 別タスク | 拡張 | ブロックと引数 | 依存 |
|---|---|---|---|
| ② Schema自体 | `turbowarp-named-functions` | `defineFunction.SCHEMA` | T2 |
| ② Schema自体 | `turbowarp-named-functions` | `defineFunction.RETURNS` | T2 |
| ③ データフォーム | `turbowarp-named-functions` | `callFunction.ARGS` | T3 |
| ③ データフォーム | `turbowarp-named-functions` | `startFunction.ARGS` | T3 |
| ② Schema自体 | `turbowarp-openai-realtime-api` | `defineFunction.SCHEMA` | T2 |
| ③ データフォーム | `turbowarp-structured-data` | `parseJsonWithSchema.TEXT` | T3 |
| ② Schema自体 | `turbowarp-structured-data` | `parseJsonWithSchema.SCHEMA` | T2 |
| ③ データフォーム | `turbowarp-structured-data` | `parseYamlWithSchema.TEXT` | T3 |
| ② Schema自体 | `turbowarp-structured-data` | `parseYamlWithSchema.SCHEMA` | T2 |
| ② Schema自体 | `turbowarp-voice-chat` | `defineFunction.SCHEMA` | T2 |
| ② Schema自体 | `turbowarp-yaml-json` | `validateSchema.SCHEMA` | T2 |
| ③ データフォーム | `turbowarp-yaml-json` | `validateSchema.FRAGMENT` | T3 |
| ② Schema自体 | `turbowarp-yaml-json` | `isValidSchema.SCHEMA` | T2 |
| ③ データフォーム | `turbowarp-yaml-json` | `isValidSchema.FRAGMENT` | T3 |

②は各所有validatorの対応subset、メタSchema、任意keywordの扱いを確定してから実装する。③は同じブロックのSCHEMA、呼出先の引数Schema等を解決する追加契約を必要とし、名前候補providerで代用しない。共通の方言・保存基盤は①と共有できるが、①の完了条件に②③を入れない。

次の機能も③側の追加機能とするが、①の文字列・汎用JSON編集は先行できる。

- `named-functions`、`openai-realtime-api`、`voice-chat`の`functionArgument.PATH`のSchema依存補完、および`returnValue.VALUE`の戻り値Schemaフォーム。
- `structured-data`のpath補完、`setJsonAtPath.VALUE`をbound schema/pathに合わせるフォーム。
- `http-server-react`の`reactIsland/Html.PROPS_JSON`をcomponent固有Schemaで編集するフォーム。①は任意JSON objectまで。
- A-Frameの任意componentに対する`setAttribute.VALUE`のSchema解決。①は属性名補完と文字列編集まで。

混在7ブロックでは、①の項目だけをpatchし、②③の値を保持する。既存の通常編集は残す。②③だけの`yaml-json.validateSchema/isValidSchema`には①の専用フォームを登録しない。

## レビューと後続実装への引継ぎ

レビューでは、対象外/分離の妥当性、名前集合とscope、既存Schemaの正本、表現を変えないcodec、所有側read port、menu/hatとtransactionの境界を確認する。具体的なSchema記述・widgetの見た目・public API名は後続実装のレビュー対象とする。

`named-functions`と`structured-data`には棚卸し開始時点で未コミット変更があった。本文と全件データはそのローカルソースを根拠にし、公開済み・マージ済みの契約とは断定しない。HEADに加えて実際に使った293ファイルのSHA-256を記録した。実装前にsnapshotとの差分を確認し、契約が変わった項目だけ再棚卸しする。既存の他作業は変更しない。

再レビュー時に`scratch-gui`の表示関連へ別の未コミット差分が加わっていた。段階0再レビュー当時はhost/service/feature-flag根拠ファイルのSHA一致を確認した。別差分は変更せず、`inventory.json.rereview.concurrent_workspace_changes`に状態を記録した。実装前にGUI baselineを再確認する。

今回の公開は[Issue #27](https://github.com/kubohiroya/turbowarp-extension-template/issues/27)で管理する段階0の文書保存に限る。段階1以降の進捗・baseline・実装検証記録は含めない。後続実装では関連GitHub Issuesに担当・ブランチ・依存・DoD・ロールバック・start/done/blockedを記録する。
