# shardian テスト仕様

- **対象マイルストーン**: `v0.3.0`（Node.js / `@b4moss/shardian`）
- **対象ロジック**: `shardian(fileName: string, option?: ShardianOption)`
- **機能仕様**: [plans/v0.3.0/path-api.md](../plans/v0.3.0/path-api.md)

文字は Unicode スカラー値（code point）単位。

---

### shardian

- 第1引数 `fileName` と任意の第2引数 `option` から、先頭 `dirLetterCount` 文字 × 最大 `dirNestDepth` 段のディレクトリを組む
- `option` 省略時は全デフォルト（`dirLetterCount: 1`, `dirNestDepth: 4`, `includeFileName: true`, `insufficientChars: 'ignore'`, `stripHeadSlash: false`, `splitPathFilename: false`）
- `stripHeadSlash` 省略時は先頭 `/` 付き。`true` なら先頭 `/` なし
- `includeFileName` 省略時は `true`（末尾にファイル名）
- 文字不足時は切れる範囲だけでパスを返す
- `insufficientChars` 省略時は `'ignore'`（warn / throw しない）
- `splitPathFilename: true` のときオブジェクトを返す（`includeFileName: false` なら `fileNameOnly` なし）
- 空文字・パス区切り・`.` / `..` / `./` / `../`・拡張子のみ・不正なカウント・不正な拡張子リストは常にエラー（`insufficientChars` 非連動）

#### テスト：正常系

- `shardian('abc1234.jpg')` → `'/a/b/c/1/abc1234.jpg'`（WARN なし）
- `shardian('abc1234.jpg', { includeFileName: false })` → `'/a/b/c/1'`（WARN なし）
- `shardian('abcdef', { dirLetterCount: 2, dirNestDepth: 2 })` → `'/ab/cd/abcdef'`（WARN なし）
- `shardian('abc1234.jpg', { stripHeadSlash: true })` → `'a/b/c/1/abc1234.jpg'`（WARN なし）
- `shardian('abc1234.jpg', { splitPathFilename: true })` → `{ fullPath: '/a/b/c/1/abc1234.jpg', pathOnly: '/a/b/c/1/', fileNameOnly: 'abc1234.jpg' }`（WARN なし）
- `shardian('abc1234.jpg', { splitPathFilename: true, includeFileName: false })` → `{ fullPath: '/a/b/c/1', pathOnly: '/a/b/c/1/' }`（`fileNameOnly` なし・WARN なし）
- `shardian('abc1234.jpg', { splitPathFilename: true, stripHeadSlash: true })` → `{ fullPath: 'a/b/c/1/abc1234.jpg', pathOnly: 'a/b/c/1/', fileNameOnly: 'abc1234.jpg' }`
- `shardian('a', { dirLetterCount: 2, dirNestDepth: 3 })` → `'/a'`（セグメント 0・WARN なし）
- `shardian('a', { dirLetterCount: 2, dirNestDepth: 3, stripHeadSlash: true })` → `'a'`
- `shardian('a', { dirLetterCount: 2, dirNestDepth: 3, includeFileName: false, stripHeadSlash: true })` → `''`
- `shardian('a', { dirLetterCount: 2, dirNestDepth: 3, splitPathFilename: true })` → `{ fullPath: '/a', pathOnly: '/', fileNameOnly: 'a' }`
- `shardian('a', { dirLetterCount: 2, dirNestDepth: 3, splitPathFilename: true, stripHeadSlash: true })` → `{ fullPath: 'a', pathOnly: '', fileNameOnly: 'a' }`
- `shardian('ab', { dirLetterCount: 1, dirNestDepth: 4 })` → `'/a/b/ab'`（WARN なし・デフォルト ignore）
- `shardian('ab', { dirLetterCount: 1, dirNestDepth: 4, insufficientChars: 'warn' })` → `'/a/b/ab'` かつ WARN
- `shardian('.gitignore')` → `'/./g/i/t/.gitignore'`（dotfile・拡張子のみ判定の対象外・WARN なし）

#### テスト: 異常系

- `shardian('')` → エラー
- `shardian('dir/a.jpg')` → エラー
- `shardian('dir\\a.jpg')` → エラー
- `shardian('abc.jpg', { dirLetterCount: 0 })` → エラー
- `shardian('abc.jpg', { dirNestDepth: 0 })` → エラー
- `shardian('ab', { dirLetterCount: 1, dirNestDepth: 4, insufficientChars: 'throw' })` → エラー（深さ未達）
- `shardian('.')` → エラー
- `shardian('..')` → エラー
- `shardian('./')` → エラー
- `shardian('../')` → エラー
- `shardian('.jpg')` → エラー（`COMMON_EXTENSIONS` に含まれる拡張子のみ）
- `shardian('.JPG')` → エラー（大小無視）
- `shardian('.jpg', { extensionOnlyList: ['.custom'] })` → 通る（リスト完全置換・`.jpg` は対象外）
- `shardian('.custom', { extensionOnlyList: ['.custom'] })` → エラー
- `shardian('.jpg', { extensionOnlyList: [] })` → エラー（空配列は `COMMON_EXTENSIONS` へフォールバック）
- `shardian('a.jpg', { extensionOnlyList: ['jpg'] })` → エラー（リスト要素の先頭 `.` 欠落）

----

以上
