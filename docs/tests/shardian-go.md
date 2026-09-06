# shardian テスト仕様（Go）

- **対象マイルストーン**: `v0.4.0` 契約（Go / `github.com/b4moss/shardian/packages/go`）
- **対象ロジック**: `Shardian(fileName string, opt *Option) (string, error)` / `ShardianSplit(fileName string, opt *Option) (SplitPath, error)`
- **機能仕様**: [specs/path-api.md](../specs/path-api.md)
- **Node 版テスト仕様**: [shardian.md](./shardian.md)（ケース対応は同一）

文字は Unicode スカラー値（Go の `rune` / JS の code point）単位。

Node の `splitPathFilename: true` は Go では **`ShardianSplit`** に写す。`warn` は標準 `log` パッケージ。エラーは戻り値の `error`（panic しない）。

---

### Shardian / ShardianSplit

- 第1引数 `fileName` と任意の第2引数 `opt` から、先頭 `DirLetterCount` 文字 × 最大 `DirNestDepth` 段のディレクトリを組む
- `opt` が `nil` のとき全デフォルト（`DirLetterCount: 1`, `DirNestDepth: 4`, `InsufficientChars: "ignore"`, `StripHeadSlash: false`）
- `Shardian` の文字列戻り値は **常に**末尾にファイル名を含む（`includeFileName` は存在しない）
- `StripHeadSlash` 省略（`false`）時は先頭 `/` 付き。`true` なら先頭 `/` なし
- 文字不足時は切れる範囲だけでパスを返す
- `InsufficientChars` 省略時は `"ignore"`（warn / error しない）
- `ShardianSplit` は常に `SplitPath{ FullPath, PathOnly, FileNameOnly }` を返す。ディレクトリ部分だけ欲しい場合は `PathOnly` を使う
- 空文字・パス区切り・`.` / `..` / `./` / `../`・拡張子のみ・不正なカウント・不正な拡張子リストは常にエラー（`InsufficientChars` 非連動）

#### テスト：正常系

- `Shardian("abc1234.jpg", nil)` → `"/a/b/c/1/abc1234.jpg"`（WARN なし）
- `Shardian("abcdef", &Option{DirLetterCount: p(2), DirNestDepth: p(2)})` → `"/ab/cd/abcdef"`（WARN なし）
- `Shardian("abc1234.jpg", &Option{StripHeadSlash: true})` → `"a/b/c/1/abc1234.jpg"`（WARN なし）
- `ShardianSplit("abc1234.jpg", nil)` → `{FullPath: "/a/b/c/1/abc1234.jpg", PathOnly: "/a/b/c/1/", FileNameOnly: "abc1234.jpg"}`（WARN なし）
- `ShardianSplit("abc1234.jpg", &Option{StripHeadSlash: true})` → `{FullPath: "a/b/c/1/abc1234.jpg", PathOnly: "a/b/c/1/", FileNameOnly: "abc1234.jpg"}`
- `Shardian("a", &Option{DirLetterCount: p(2), DirNestDepth: p(3)})` → `"/a"`（セグメント 0・WARN なし）
- `Shardian("a", &Option{DirLetterCount: p(2), DirNestDepth: p(3), StripHeadSlash: true})` → `"a"`
- `ShardianSplit("a", &Option{DirLetterCount: p(2), DirNestDepth: p(3)})` → `{FullPath: "/a", PathOnly: "/", FileNameOnly: "a"}`
- `ShardianSplit("a", &Option{DirLetterCount: p(2), DirNestDepth: p(3), StripHeadSlash: true})` → `{FullPath: "a", PathOnly: "", FileNameOnly: "a"}`
- `Shardian("ab", &Option{DirLetterCount: p(1), DirNestDepth: p(4)})` → `"/a/b/ab"`（WARN なし・デフォルト ignore）
- `Shardian("ab", &Option{DirLetterCount: p(1), DirNestDepth: p(4), InsufficientChars: "warn"})` → `"/a/b/ab"` かつ WARN（`log`）
- `Shardian(".gitignore", nil)` → `"/./g/i/t/.gitignore"`（dotfile・拡張子のみ判定の対象外・WARN なし）
- `Shardian(".jpg", &Option{ExtensionOnlyList: []string{".custom"}})` → `"/./j/p/g/.jpg"`（リスト完全置換・`.jpg` は対象外）

`p(n)` は `*int` へのヘルパー（ゼロ値と「未指定」を区別するため）。

#### テスト: 異常系

- `Shardian("", nil)` → エラー
- `Shardian("dir/a.jpg", nil)` → エラー
- `Shardian("dir\\a.jpg", nil)` → エラー
- `Shardian("abc.jpg", &Option{DirLetterCount: p(0)})` → エラー
- `Shardian("abc.jpg", &Option{DirNestDepth: p(0)})` → エラー
- `Shardian("ab", &Option{DirLetterCount: p(1), DirNestDepth: p(4), InsufficientChars: "throw"})` → エラー（深さ未達）
- `Shardian(".", nil)` → エラー
- `Shardian("..", nil)` → エラー
- `Shardian("./", nil)` → エラー
- `Shardian("../", nil)` → エラー
- `Shardian(".jpg", nil)` → エラー（`CommonExtensions` に含まれる拡張子のみ）
- `Shardian(".JPG", nil)` → エラー（大小無視）
- `Shardian(".custom", &Option{ExtensionOnlyList: []string{".custom"}})` → エラー
- `Shardian(".jpg", &Option{ExtensionOnlyList: []string{}})` → エラー（空スライスは `CommonExtensions` へフォールバック）
- `Shardian("a.jpg", &Option{ExtensionOnlyList: []string{"jpg"}})` → エラー（リスト要素の先頭 `.` 欠落）

----

以上
