# shardian テスト仕様

- **対象マイルストーン**: `v0.2.0`（Node.js / `@b4moss/shardian`）
- **対象ロジック**: `shardian(options: ShardianOption)`
- **機能仕様**: [plans/v0.2.0/path-api.md](../plans/v0.2.0/path-api.md)

文字は Unicode スカラー値（code point）単位。

---

### shardian

- オプションオブジェクトから、先頭 `dirLetterCount` 文字 × 最大 `dirNestDepth` 段のディレクトリを組む
- 戻り値の先頭は常に `/`
- `includeFileName` 省略時は `true`（末尾にファイル名）
- 文字不足時は切れる範囲だけでパスを返す
- `insufficientChars` 省略時は `'ignore'`（warn / throw しない）
- 空文字・`/`・`\`・不正なカウントは常にエラー

#### テスト：正常系

- `shardian({ fileName: 'abc1234.jpg', dirLetterCount: 1, dirNestDepth: 4 })` → `'/a/b/c/1/abc1234.jpg'`（WARN なし）
- `shardian({ fileName: 'abc1234.jpg', dirLetterCount: 1, dirNestDepth: 4, includeFileName: false })` → `'/a/b/c/1'`（WARN なし）
- `shardian({ fileName: 'abcdef', dirLetterCount: 2, dirNestDepth: 2 })` → `'/ab/cd/abcdef'`（WARN なし）
- `shardian({ fileName: 'ab', dirLetterCount: 1, dirNestDepth: 4 })` → `'/a/b/ab'`（WARN なし・デフォルト ignore）
- `shardian({ fileName: 'ab', dirLetterCount: 1, dirNestDepth: 4, insufficientChars: 'warn' })` → `'/a/b/ab'` かつ WARN
- `shardian({ fileName: 'a', dirLetterCount: 2, dirNestDepth: 3, insufficientChars: 'ignore' })` → `'/a'`（WARN なし）

#### テスト: 異常系

- `fileName: ''` → エラー
- `fileName: 'dir/a.jpg'` → エラー
- `fileName: 'dir\\a.jpg'` → エラー
- `dirLetterCount: 0` → エラー
- `dirNestDepth: 0` → エラー
- `fileName: 'ab', dirLetterCount: 1, dirNestDepth: 4, insufficientChars: 'throw'` → エラー（深さ未達）

----

以上
