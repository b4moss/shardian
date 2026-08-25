# shardian テスト仕様

- **対象マイルストーン**: `v0.1.0`（Node.js / `@b4moss/shardian`）
- **対象ロジック**: `shardian(fileName, segmentLength, depth, includeFileName)`
- **機能仕様**: [plans/v0.1.0/path-api.md](../plans/v0.1.0/path-api.md)

文字は Unicode スカラー値（code point）単位。WARN は Node では `console.warn`。

---

### shardian

- ファイル名先頭から `segmentLength` 文字ずつ切り出し、最大 `depth` 段のディレクトリを組む
- 戻り値の先頭は常に `/` とする
- `includeFileName` が真なら末尾に元のファイル名を付与する
- 文字が足りない場合は切れる範囲だけでパスを返し、要求深さ未達なら WARN を出す（エラーにはしない）
- 空文字、または `/`・`\` を含むファイル名、不正な `segmentLength` / `depth` はエラーにする

#### テスト：正常系

- `shardian('abc1234.jpg', 1, 4, true)` → `'/a/b/c/1/abc1234.jpg'`（WARN なし）
- `shardian('abc1234.jpg', 1, 4, false)` → `'/a/b/c/1'`（WARN なし）
- `shardian('abcdef', 2, 2, true)` → `'/ab/cd/abcdef'`（WARN なし）
- `shardian('ab', 1, 4, true)` → `'/a/b/ab'` かつ WARN（要求深さ 4、実際 2）
- `shardian('abc', 2, 3, true)` → `'/ab/abc'` かつ WARN（要求深さ 3、実際 1）
- `shardian('a', 2, 3, true)` → `'/a'` かつ WARN（セグメント 0）

#### テスト: 異常系

- `fileName` が `''` → エラー
- `fileName` が `'dir/a.jpg'`（`/` を含む）→ エラー
- `fileName` が `'dir\\a.jpg'`（`\` を含む）→ エラー
- `segmentLength` が `0` → エラー
- `depth` が `0` → エラー

----

以上
