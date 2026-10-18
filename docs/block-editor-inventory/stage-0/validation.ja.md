# 段階0スナップショットの公開整合確認

2026-10-18 日本時間。[段階0設計](README.ja.md)と[全件データ](inventory.json)を対象とする。文書公開は[Issue #27](https://github.com/kubohiroya/turbowarp-extension-template/issues/27)で管理する。

## 今回確認する範囲

元の未追跡資料から完成済みの棚卸し・分類・再レビューを読み取り、独立した`stage-0/`へ保存した。入力8ファイルのSHA-256は`inventory.json.publication.input_sha256`に記録した。段階1の進捗overlay、S1-1実装記録、baseline、実装履歴、差分パッチは含めない。原本や各リポジトリの実装は変更していない。

以下は公開データを読み取る一時的なPython検査による照合結果。既存の実装テストを再実行した件数ではない。JSONと表の整合確認に加え、本文で分類の意味・将来の依存・実装時の受け入れ条件をレビューした。

| 確認項目 | 照合結果 |
|---|---|
| 対象と一意性 | 43リポジトリ、865完全opcode、943引数。リポジトリ内opcode・ブロック内引数に重複なし |
| 派生拡張と参考テンプレート | 42拡張862ブロック・940引数、テンプレート3ブロック・3引数 |
| 区分とUI | ブロック区分・引数区分・全19UIの再集計が`summary`と一致。①929、②8、③6引数 |
| Schema契約 | 25件。`new-fixed`9、`compose-fixed`7、`reuse-generated`7、`reuse`2。各引数のcatalog参照を照合 |
| 候補provider | 60件。引数のprovider参照、固定値収集429箇所・内部項目108箇所の逆引き、context別収集1箇所の対象引数を照合 |
| 内部項目 | 79規則・20引数内131適用。規則ID、Schema、provider、親への依存・段階を照合。UIはsuggest108、enum4、text19 |
| consumer検証 | 7profile・10適用。引数とブロックの検証参照、およびカタログ節を照合 |
| 全件表 | JSONとブロック表865行・引数表943行のリポジトリ/opcode/引数の順序が一致。内部項目表79規則のIDも一致 |
| ローカルリンク | 公開資料内と両READMEの新しい導線について相対リンク先の存在、Markdown見出しのanchorを764箇所で照合 |
| 公開範囲 | 除外したbaseline・実装記録へのリンクや`stage_1_plan`への依存を除去。将来の段階・DoDは設計として維持 |

## ソースの参照方針

`inventory.json.sources`の293件は棚卸し時点のパスとSHA-256であり、現在のcheckoutの同一性を主張しない。後続作業で削除・移設・改名されたファイルもあり、版・HEAD・ローカル差分のメタデータは歴史的な記録である。

Markdownから参照するファイルでは、記録されたHEADのGit blobが採取SHA-256と一致し、そのコミットがローカルの`origin`追跡参照に含まれる場合だけGitHubのコミット固定リンクを作成した。137ファイル・3,258箇所が該当する。これは記録した公開コミットのローカル証跡を使う検査であり、全リンクの現在のHTTP到達性を確認したものではない。

次の5ファイル・124箇所は内容一致を確認できる公開コミットがなく、ソースパス・行番号を「採取時のローカル根拠」として記載した。未コミットの内容をHEADの内容としてリンクしていない。

- `turbowarp-scene-graph/schemas/kamishibai-3d-scene-extension.schema.json`
- `turbowarp-scene-graph/schemas/scene-document.schema.json`
- `turbowarp-scene-graph/schemas/scene-node.schema.json`
- `turbowarp-structured-data/src/block-definitions.json`
- `turbowarp-structured-data/src/extension.ts`

これらの内容を独立に再現するには当時のローカル根拠が必要である。実装を始める際は現在の正本・公開版・差分を確認し、必要な項目だけ棚卸しを更新する。

## 当時のレビューと今回の公開確認の違い

[再レビュー](review.ja.md)のR1〜R5は設計上の指摘への反映記録。段階0再レビュー当時に240根拠ファイル、71の既存Schema path、8の所有parser/型の規則を確認した記録を保持した。その後の正本・分類の訂正を反映した本スナップショットの根拠一覧は293件であり、240件の確認を293件の実行検証へ読み替えない。

[レビュー根拠データ](review-evidence.json)には当時の純粋抽出によるA-Frame 9入力、loadingCostumes 6入力、計15入力の結果を保持した。今回の公開確認ではその記録の件数を照合した。所有parserの再実行、43リポジトリのbuild・test、候補取得、GUIのSave/Cancel/Undo/Redo、JSON/YAMLの保存・再読込は今回の文書整合確認の対象外である。これらの必要な検証は[段階ごとの受け入れ基準](README.ja.md#段階ごとの受け入れ基準)に残している。

## リポジトリの確認とロールバック

READMEの生成領域は`pnpm run docs:check`、パッケージ方針は`pnpm run repo:check`で確認し、いずれも成功した。`git diff --cached --check`も成功した。PRの既存CIが成功してからmainへSquash & Mergeし、main CIと既存Pages配信をIssue #27で確認する。コードやフィーチャーフラグの変更はない。

切り戻す場合は今回の文書追加と両READMEの導線をrevertする。元の未追跡文書と、他作業の実装・baselineは保持する。
