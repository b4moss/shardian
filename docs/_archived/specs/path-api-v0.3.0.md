# パス生成 API（v0.3.0）

- **状態**: 出荷済み・現行ではない（`@b4moss/shardian@0.3.0`）
- **マイルストーン**: `v0.3.0`
- **Issue**: [#19](https://github.com/b4moss/shardian/issues/19)（引数見直し）→ [#20](https://github.com/b4moss/shardian/issues/20)（異常系）
- **関連**: 前版 [path-api-v0.2.0.md](./path-api-v0.2.0.md)。現行は [../../specs/path-api.md](../../specs/path-api.md)（v0.4.0 で `includeFileName` 廃止）

## 目的

呼び出し契約を「第1引数 = ファイル名、第2引数 = オプション」に再設計し、デフォルト省略・出力整形・戻り値分割を追加する。続けて、ファイル名として不正な入力を常時エラーにする。

## 関数契約

```typescript
type InsufficientChars = 'ignore' | 'warn' | 'throw'

type ShardianOption = {
  dirLetterCount?: number // default: 1
  dirNestDepth?: number // default: 4
  stripHeadSlash?: boolean // default: false
  includeFileName?: boolean // default: true
  insufficientChars?: InsufficientChars // default: 'ignore'
  splitPathFilename?: boolean // default: false
  extensionOnlyList?: string[] // default: COMMON_EXTENSIONS 相当
}

type ShardianSplitPath = {
  fullPath: string
  pathOnly: string
  fileNameOnly: string
}

type ShardianSplitPathDirOnly = {
  fullPath: string
  pathOnly: string
}

function shardian(fileName: string, option?: ShardianOption): string | ShardianSplitPath | ShardianSplitPathDirOnly
```

- 第1引数名は **`fileName`**
- 第2引数は **`option?: ShardianOption`**。省略または `undefined` で全デフォルト
- v0.2.0 の `shardian({ fileName, ... })` は廃止
- 公開定数 **`COMMON_EXTENSIONS`** をエクスポート

### フィールド

| フィールド | 必須 | デフォルト | 意味 |
|------------|------|------------|------|
| （第1引数）`fileName` | はい | — | ファイル名。パス区切り禁止 |
| `dirLetterCount` | いいえ | `1` | 1 階層あたりの文字数 |
| `dirNestDepth` | いいえ | `4` | 階層の深さ |
| `stripHeadSlash` | いいえ | `false` | `true` なら先頭 `/` を付けない |
| `includeFileName` | いいえ | `true` | 末尾に `fileName` を付けるか |
| `insufficientChars` | いいえ | `'ignore'` | 文字不足で深さ未達のとき |
| `splitPathFilename` | いいえ | `false` | `true` ならパス分割オブジェクトを返す |
| `extensionOnlyList` | いいえ | `COMMON_EXTENSIONS` | 拡張子のみ判定用リスト（完全置換） |

### 組み立て

1. `fileName` 先頭から `dirLetterCount` 文字ずつ、最大 `dirNestDepth` 個
2. 残りが `dirLetterCount` 未満なら停止
3. セグメントを `/` で連結
4. `includeFileName !== false` なら末尾にファイル名を付与
5. `stripHeadSlash !== true` なら先頭に `/`（セグメント 0 個かつファイル名なしなら `'/'`）

#### `stripHeadSlash` とセグメント 0 個

| `stripHeadSlash` | `includeFileName` | 文字列戻り値 |
|------------------|-------------------|--------------|
| `false` | `true` | `'/a'` |
| `false` | `false` | `'/'` |
| `true` | `true` | `'a'` |
| `true` | `false` | `''` |

（例: `fileName: 'a'`, `dirLetterCount: 2`, `dirNestDepth: 3`）

### `splitPathFilename`

- `false`: `string`
- `true` かつ `includeFileName !== false`: `{ fullPath, pathOnly, fileNameOnly }`
- `true` かつ `includeFileName === false`: `{ fullPath, pathOnly }`（`fileNameOnly` なし）

`pathOnly` はセグメントがあるとき常に末尾 `/` あり。`stripHeadSlash: true` なら `fullPath` / `pathOnly` の両方から先頭 `/` を外す。

### `insufficientChars`

v0.2.0 と同じ（`'ignore'` / `'warn'` / `'throw'`）。

### 常時エラー

- `fileName === ''`
- `'.'` / `'..'` / `'./'` / `'../'`
- `/` または `\` を含む
- `dirLetterCount < 1` / `dirNestDepth < 1`
- 拡張子のみ（`COMMON_EXTENSIONS` または `extensionOnlyList` と大小無視の完全一致）
- `extensionOnlyList` 要素の先頭 `.` 欠落
- 空の `extensionOnlyList` は `COMMON_EXTENSIONS` へフォールバック

## 移行（v0.2.0 → v0.3.0）

```typescript
// v0.2.0
shardian({ fileName: 'abc1234.jpg', dirLetterCount: 1, dirNestDepth: 4 })

// v0.3.0
shardian('abc1234.jpg', { dirLetterCount: 1, dirNestDepth: 4 })
```

----

以上
