# shardian テスト仕様

対象: `shardian(fileName, segmentLength, depth, includeFileName)`  
仕様: [plans/v0.1.0/path-api.md](../plans/v0.1.0/path-api.md)

Node / Go で同じ期待値とする。

---

### shardian

- ファイル名先頭から `segmentLength` 文字 × 最大 `depth` 段のディレクトリを組む
- 先頭は常に `/`
- `includeFileName` が真なら末尾にファイル名を付与する
- 文字不足時は可能な段だけ組み、WARN を出して返す
- `/` または `\` を含むファイル名はエラー

#### テスト：正常系

- `shardian('abc1234.jpg', 1, 4, true)` → `'/a/b/c/1/abc1234.jpg'`（WARN なし）
- `shardian('abc1234.jpg', 1, 4, false)` → `'/a/b/c/1'`（WARN なし）
- `shardian('abcdef', 2, 2, true)` → `'/ab/cd/abcdef'`（WARN なし）

#### テスト: 異常系

- `fileName` が `''` → エラー
- `fileName` に `/` を含む（例: `'dir/a.jpg'`）→ エラー
- `fileName` に `\` を含む → エラー
- `segmentLength` が `0` 以下 → エラー
- `depth` が `0` 以下 → エラー

#### テスト：短いファイル名（WARN）

- `shardian('ab', 1, 4, true)` → `'/a/b/ab'` かつ WARN
- `shardian('ab', 1, 4, false)` → `'/a/b'` かつ WARN
- `shardian('abc', 2, 3, true)` → `'/ab/abc'` かつ WARN
- `shardian('a', 2, 3, true)` → `'/a'` かつ WARN（セグメント 0）

----

以上
