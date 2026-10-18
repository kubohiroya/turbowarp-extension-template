# 派生拡張のGitHub Pages・ブロック文書の必須手順

turbowarp-extension-template由来の拡張は、Pages設定、公開コンテンツ、TurboWarpからの参照のすべてを必須とする。設定だけで完了としない。

## リポジトリの作成・棚卸し時

1. Git remoteのowner/name、既定ブランチ完全SHA、操作権限、Pages設定をAPIで取得する。名前変更がある場合はlocal名から推測せずoriginの実体を使う。
2. `has_pages:false`かつ権限を確認した`GET /repos/{owner}/{repo}/pages`が404であれば、**必ずAPIで**`POST /repos/{owner}/{repo}/pages`、body `{"build_type":"workflow"}`を実行する。手動設定の案内だけで完了にしない。既に設定済みならその設定を保持し、再POSTしない。
3. 設定直前に既存Pages workflowの全refの最新attemptをページングして調べ、未完了・不明が0であることを確認する。設定前後にHEAD、通常CI、既存run一覧、workflow stateを保存する。進行中runの終了を待ち、暗黙のcancelはしない。
4. 設定後に`has_pages:true`、Pages GET200、`build_type:workflow`を確認し、API応答と時刻を保存する。403／権限不足／取得不明を未設定と誤認しない。実行不能なら理由を記録し、必須項目を未達として残す。

APIでの設定は外部変更である。対象・操作についてのユーザーの明示承認が必要で、この文書だけを将来の任意repositoryへの包括的な公開許可として使わない。現在の一括整備はユーザーが対象の未設定リポジトリについて設定とコンテンツ準備・公開を明示指示した範囲で実施する。

通常CIや入口HTMLが未整備でもPages初期設定の未達を放置しない。ただし、その場合は「設定済み／公開準備未完了」と記録し、公開の受け入れを済ませたとは扱わない。設定はコンテンツを自動で作成しない。

## 公開する内容とdocsURI

- 公開rootに入口HTMLを設け、当該拡張の名称と用途を明示する。既存の詳しい説明や多言語ページを保持する。
- 現在の公開対象commitで登録する全ブロックを網羅する。JSON定義のほか、getInfo内で追加するブロック、互換用の非表示ブロック、任意機能で有効になるブロックも説明する。区切り・見出しはブロック数に含めない。
- 各ブロックの表示テキスト、動作説明、引数・型・既定値・メニューを実装または同commitの既存文書と照合する。実装していない将来機能を利用可能と記載しない。
- 各opcodeに固定アンカー`#block-<opcode>`を設け、目次から到達できるようにする。全ブロックのURL対応を検証記録に残す。
- TurboWarp標準の`getInfo().docsURI`を、当該Pagesの全ブロック説明へ到達できるURLに結びつける。`docUrl`という未対応プロパティを置いただけで済ませない。本作業ではユーザー確認済みの「標準docsURI＋各ブロックの固定アンカー」を使う。
- docsURIを追加・変更した場合はsourceと配信用distを揃え、型検査・影響する既存テスト・buildで確認する。opcode、引数、保存データ、既存API、feature flagの既定値を変えない。

[TurboWarp公式API](https://docs.turbowarp.org/development/extensions/assorted-apis)のdocsURIは拡張のブロック一覧に文書を開くボタンを追加する。個々の説明はその公開ページの固定アンカーから参照する。

## 公開前・公開後の受け入れ

1. 公開内容をローカルで準備し、全opcode／アンカー／引数の網羅とHTMLのリンク・表示を確認する。既存の公開workflowがない場合はdocsを配信する最小workflowを用意する。正常に公開している既存のbranch型Pagesを無用に移行しない。
2. 対象repo、remote URL、branch、mainの完全SHA、差分、公開する文面・ファイルを確認する。公開対象の承認範囲でcommit／push／deployを行う。必要なCIとartifact検証が完了する前に自動deployされる場合は、対象Pages workflowのみを別途承認された範囲で抑止し、通常CIは継続する。
3. Runtimeの公開は同SHAの通常CIと新実tarballのHTML／exports／4生成物／依存実解決／SHA-256／SHA-512を確認する。dry-runを実tarballの代わりにしない。旧archiveを保持し、新hashはpack対象外に保存する。
4. 公開対象SHAのconfigure／upload／deploy成功、Pages artifact rootの入口、実deploymentのSHAを確認する。既存branch型Pagesは対応するbuild commitを確認する。
5. docsURIの実URLをHTTPで取得し、200、正しい拡張名、全ブロック説明の本文、全固定アンカー・内部リンクを確認する。設定API200や空のトップページだけで完了としない。実際に配信されたHTMLと検証済みコンテンツの対応をhashまたは該当本文で検証する。
6. owner/repo、完全SHA、CI／Pages run ID・attempt・URL、公開URL、ブロックURL一覧、公開前後の確認時刻を記録する。過去の404、旧文書、旧artifactと検証記録は保持する。

CI／内容検証に失敗した場合は公開へ進まず修正する。既に抑止したworkflowは条件未達で自動解除しない。切戻しが必要な場合は承認対象を確認し、旧文書・旧commitを使って復旧する。npm公開、tag作成、version変更はPages整備の必須手順には含まない。
