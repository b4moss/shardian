# shardian テスト仕様（PHP）

- **対象マイルストーン**: `v0.4.0` 契約（PHP / `b4moss/shardian` / `packages/php`）
- **対象ロジック**: `shardian(string $fileName, ?array $option = null): string` / `shardianSplit(string $fileName, ?array $option = null): SplitPath`
- **機能仕様**: [specs/path-api.md](../specs/path-api.md)
- **Node 版テスト仕様**: [shardian.md](./shardian.md)（ケース対応は同一）
- **Go 版テスト仕様**: [shardian-go.md](./shardian-go.md)（ケース対応は同一）

文字は Unicode スカラー値（PHP の UTF-8 コードポイント / JS の code point）単位。

Node の `splitPathFilename: true` は PHP では **`shardianSplit`** に写す。`warn` は `trigger_error(..., E_USER_WARNING)`。エラーは `InvalidArgumentException` を投げる。

名前空間は `B4moss\Shardian`。オプションは連想配列（キーは camelCase）。未指定キーはデフォルト。

---

### shardian / shardianSplit

- 第1引数 `fileName` と任意の第2引数 `$option` から、先頭 `dirLetterCount` 文字 × 最大 `dirNestDepth` 段のディレクトリを組む
- `$option` が `null` または省略のとき全デフォルト（`dirLetterCount: 1`, `dirNestDepth: 4`, `insufficientChars: "ignore"`, `stripHeadSlash: false`）
- `shardian` の文字列戻り値は **常に**末尾にファイル名を含む（`includeFileName` は存在しない）
- `stripHeadSlash` 省略（`false`）時は先頭 `/` 付き。`true` なら先頭 `/` なし
- 文字不足時は切れる範囲だけでパスを返す
- `insufficientChars` 省略時は `"ignore"`（warn / error しない）
- `shardianSplit` は常に `SplitPath`（`fullPath`, `pathOnly`, `fileNameOnly`）を返す。ディレクトリ部分だけ欲しい場合は `pathOnly` を使う
- 空文字・パス区切り・`.` / `..` / `./` / `../`・拡張子のみ・不正なカウント・不正な拡張子リストは常に例外（`insufficientChars` 非連動）

#### テスト：正常系

- `shardian('abc1234.jpg')` → `'/a/b/c/1/abc1234.jpg'`（WARN なし）
- `shardian('abcdef', ['dirLetterCount' => 2, 'dirNestDepth' => 2])` → `'/ab/cd/abcdef'`（WARN なし）
- `shardian('abc1234.jpg', ['stripHeadSlash' => true])` → `'a/b/c/1/abc1234.jpg'`（WARN なし）
- `shardianSplit('abc1234.jpg')` → `SplitPath{fullPath: '/a/b/c/1/abc1234.jpg', pathOnly: '/a/b/c/1/', fileNameOnly: 'abc1234.jpg'}`（WARN なし）
- `shardianSplit('abc1234.jpg', ['stripHeadSlash' => true])` → `SplitPath{fullPath: 'a/b/c/1/abc1234.jpg', pathOnly: 'a/b/c/1/', fileNameOnly: 'abc1234.jpg'}`
- `shardian('a', ['dirLetterCount' => 2, 'dirNestDepth' => 3])` → `'/a'`（セグメント 0・WARN なし）
- `shardian('a', ['dirLetterCount' => 2, 'dirNestDepth' => 3, 'stripHeadSlash' => true])` → `'a'`
- `shardianSplit('a', ['dirLetterCount' => 2, 'dirNestDepth' => 3])` → `SplitPath{fullPath: '/a', pathOnly: '/', fileNameOnly: 'a'}`
- `shardianSplit('a', ['dirLetterCount' => 2, 'dirNestDepth' => 3, 'stripHeadSlash' => true])` → `SplitPath{fullPath: 'a', pathOnly: '', fileNameOnly: 'a'}`
- `shardian('ab', ['dirLetterCount' => 1, 'dirNestDepth' => 4])` → `'/a/b/ab'`（WARN なし・デフォルト ignore）
- `shardian('ab', ['dirLetterCount' => 1, 'dirNestDepth' => 4, 'insufficientChars' => 'warn'])` → `'/a/b/ab'` かつ WARN（`E_USER_WARNING`）
- `shardian('.gitignore')` → `'/./g/i/t/.gitignore'`（dotfile・拡張子のみ判定の対象外・WARN なし）
- `shardian('.jpg', ['extensionOnlyList' => ['.custom']])` → `'/./j/p/g/.jpg'`（リスト完全置換・`.jpg` は対象外）

#### テスト: 異常系

- `shardian('')` → `InvalidArgumentException`
- `shardian('dir/a.jpg')` → `InvalidArgumentException`
- `shardian('dir\\a.jpg')` → `InvalidArgumentException`
- `shardian('abc.jpg', ['dirLetterCount' => 0])` → `InvalidArgumentException`
- `shardian('abc.jpg', ['dirNestDepth' => 0])` → `InvalidArgumentException`
- `shardian('ab', ['dirLetterCount' => 1, 'dirNestDepth' => 4, 'insufficientChars' => 'throw'])` → `InvalidArgumentException`（深さ未達）
- `shardian('.')` → `InvalidArgumentException`
- `shardian('..')` → `InvalidArgumentException`
- `shardian('./')` → `InvalidArgumentException`
- `shardian('../')` → `InvalidArgumentException`
- `shardian('.jpg')` → `InvalidArgumentException`（`COMMON_EXTENSIONS` に含まれる拡張子のみ）
- `shardian('.JPG')` → `InvalidArgumentException`（大小無視）
- `shardian('.custom', ['extensionOnlyList' => ['.custom']])` → `InvalidArgumentException`
- `shardian('.jpg', ['extensionOnlyList' => []])` → `InvalidArgumentException`（空配列は `COMMON_EXTENSIONS` へフォールバック）
- `shardian('a.jpg', ['extensionOnlyList' => ['jpg']])` → `InvalidArgumentException`（リスト要素の先頭 `.` 欠落）

----

以上
