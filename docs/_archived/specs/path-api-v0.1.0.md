# パス生成 API（v0.1.0）

- **状態**: 出荷済み・現行ではない（`@b4moss/shardian@0.1.0`）
- **マイルストーン**: `v0.1.0`
- **関連**: 後継は [path-api-v0.2.0.md](./path-api-v0.2.0.md)。現行は [../../specs/path-api.md](../../specs/path-api.md)

## 目的

ファイル名の先頭から、指定した文字数・深さでシャード階層パスを組み立てる。

## 関数契約

概念シグネチャ（言語ごとに慣用へ写す）:

```text
shardian(fileName, segmentLength, depth, includeFileName) -> path
```

| 引数 | 型の意図 | 意味 |
|------|----------|------|
| `fileName` | 文字列 | ファイル名（拡張子込み）。パス区切りを含まない |
| `segmentLength` | 正の整数 | 1 階層あたりの文字数 |
| `depth` | 正の整数 | 作りたい階層の深さ |
| `includeFileName` | 真偽 | 末尾に `fileName` を付けるか |

戻り値は常に `/` 始まりのパス文字列。

### 文字の数え方

- 拡張子は除去しない。`fileName` 全体を対象にする
- 1 文字は Unicode スカラー値（JS の code point / Go の rune）とする

### 組み立て

1. `fileName` 先頭から `segmentLength` 文字ずつ切り出し、最大 `depth` 個のセグメントにする
2. セグメントを `/` で連結し、先頭に `/` を付ける
3. `includeFileName === true` なら末尾に `/` + `fileName` を付ける
4. `includeFileName === false` ならディレクトリ部分のみ（セグメントが 0 個なら `'/'`）

例:

```text
shardian('abc1234.jpg', 1, 4, true)  → '/a/b/c/1/abc1234.jpg'
shardian('abc1234.jpg', 1, 4, false) → '/a/b/c/1'
```

## 短いファイル名

必要文字数（おおよそ `segmentLength * depth`）に満たない場合でも **エラーにしない**。

- 残りの文字数が `segmentLength` 未満になった時点で切り出しを止める
- それまでにできたセグメントだけでパスを返す
- 要求深さに届かなかった場合は **WARN** を出す（戻り値は通常どおり返す）

例:

```text
shardian('ab', 1, 4, true)   → '/a/b/ab'   （WARN: 深さ 4 に対し 2）
shardian('ab', 1, 4, false)  → '/a/b'      （WARN）
shardian('a', 2, 3, true)    → '/a'        （WARN: セグメント 0）
shardian('abc', 2, 3, true)  → '/ab/abc'   （WARN: 深さ 3 に対し 1）
```

WARN の出し方:

- Node.js: `console.warn`
- Go: 標準の警告ログ（`log` パッケージ等）。メッセージに要求深さ・実際の深さ・`fileName` が分かること

## エラーにする入力

| 条件 | 理由 |
|------|------|
| `fileName` が空 | 対象がない |
| `fileName` に `/` または `\` を含む | パス入力は禁止 |
| `segmentLength < 1` | 階層幅として不正 |
| `depth < 1` | 深さとして不正 |

## 非責務

- 実ディレクトリの作成・存在確認
- ハッシュ化・正規化（NFC 等）の強制
- WARN の抑止オプション（v0.1.0 では出さない）

----

以上
