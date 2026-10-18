# 任意のブロック編集機能を追加する場合

Templateは最小の拡張雛形だけを提供します。編集ライブラリの依存、編集画面の登録、サンプル用のeditor-schema公開APIを標準搭載しません。

構造化データの入力が必要な拡張で、その拡張自身がSchemaと受入規則を所有してください。対象引数を選び、必要な場合だけ検証済みの`@kubohiroya/turbowarp-extension-data-editor`依存を追加します。対応する`Scratch.gui.blockEditors`が存在する場合だけ登録し、API不在でも通常実行を継続し、拡張の終了時には自分の登録を解除します。既存データを保持し、保存直前に再検証してください。

JSON/YAMLの実行可能な編集サンプルとテストは[共通エディタのexamples](https://github.com/kubohiroya/turbowarp-extension-data-editor/tree/main/examples)に置きます。サンプルは学習用で、Templateの標準ブロックや本番ownerのSchema契約ではありません。採用する版のAPI文書を確認して利用してください。

GUIの`blockEditorDialogs`は起動時固定・既定OFFです。拡張から有効化しません。Templateのbuild・pack・Pagesもこの機能に依存しません。旧サンプルの撤去は[移行文書](template-examples-migration.ja.md)を参照してください。
