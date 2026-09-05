# パス生成 API（v0.4.0）

- **状態**: 仕様詳細
- **マイルストーン**: `v0.4.0`
- **Issue**: [#26](https://github.com/b4moss/shardian/issues/26)（`includeFileName` 廃止）
- **関連**: [docs/tests/shardian.md](../../tests/shardian.md)、[README.md](../../../README.md)
- **前版**: [plans/v0.3.0/path-api.md](../v0.3.0/path-api.md)

## 目的

`includeFileName` を API から削除する。ディレクトリ部分だけが必要な呼び出しは `splitPathFilename: true` の戻り値で代用する。v0.x のため破壊的変更を許容する。

## スコープ

### やること（Node / `@b4moss/shardian@0.4.0`）

1. **#26** `includeFileName` オプションの削除
2. 文字列戻り値は常に末尾に `fileName` を含む
3. `splitPathFilename: true` の戻り値は常に `{ fullPath, pathOnly, fileNameOnly }`（`fileNameOnly` 欠落形を廃止）
4. docs（plans / tests / README）と型定義を追随

### やらないこと

- Go / PHP 実装
- `includeFileName` の互換レイヤ・非推奨期間
- `splitPathFilename` / `stripHeadSlash` / `insufficientChars` の意味変更（本 Issue の範囲外）
- WARN ロガー差し替え

## 関数契約（#26）

```typescript
type InsufficientChars = 'ignore' | 'warn' | 'throw'

type ShardianOption = {
  dirLetterCount?: number // default: 1
  dirNestDepth?: number // default: 4
  stripHeadSlash?: boolean // default: false
  insufficientChars?: InsufficientChars // default: 'ignore'
  splitPathFilename?: boolean // default: false
  extensionOnlyList?: string[] // default: COMMON_EXTENSIONS 相当
}

type ShardianSplitPath = {
  fullPath: string
  pathOnly: string
  fileNameOnly: string
}

function shardian(fileName: string, option?: ShardianOption): string | ShardianSplitPath
```

- 第1引数名・第2引数の扱いは v0.3.0 と同じ
- **`includeFileName` は存在しない**（渡しても無視せず、型上も受けない）
- v0.3.0 の `ShardianSplitPathDirOnly`（`fileNameOnly` なし）は **削除**

### フィールド

| フィールド | 必須 | デフォルト | 意味 |
|------------|------|------------|------|
| （第1引数）`fileName` | はい | — | ファイル名。パス区切り禁止 |
| `dirLetterCount` | いいえ | `1` | 1 階層あたりの文字数（正の整数） |
| `dirNestDepth` | いいえ | `4` | 階層の深さ（正の整数） |
| `stripHeadSlash` | いいえ | `false` | `true` なら戻り値の先頭 `/` を付けない |
| `insufficientChars` | いいえ | `'ignore'` | 文字不足で深さ未達のとき（v0.3.0 継承） |
| `splitPathFilename` | いいえ | `false` | `true` ならパス分割オブジェクトを返す |
| `extensionOnlyList` | いいえ | `COMMON_EXTENSIONS` | 拡張子のみ判定用リスト（完全置換） |

### 組み立て

切り出しロジックは v0.3.0 と同じ（拡張子は除去せず、Unicode スカラー値単位）。

1. `fileName` 先頭から `dirLetterCount` 文字ずつ、最大 `dirNestDepth` 個
2. 残りが `dirLetterCount` 未満なら停止
3. セグメントを `/` で連結
4. **常に**末尾にファイル名を付与
5. `stripHeadSlash !== true` なら先頭に `/`

#### `stripHeadSlash` とセグメント 0 個

例: `fileName: 'a'`, `dirLetterCount: 2`, `dirNestDepth: 3`

| `stripHeadSlash` | 文字列戻り値 |
|------------------|--------------|
| `false` | `'/a'` |
| `true` | `'a'` |

### `splitPathFilename`

`false`（既定）: `string`（常にファイル名付き）。

`true`:

```typescript
{ fullPath: string; pathOnly: string; fileNameOnly: string }
```

ルール（v0.3.0 継承。`includeFileName` 連動は削除）:

- `pathOnly` は **常に末尾 `/` あり**（セグメントがあるとき。例: `'/a/b/c/d/'`）
- `stripHeadSlash: true` のとき、`fullPath` と `pathOnly` の **両方**から先頭 `/` を外す
- セグメント 0 個の `pathOnly`: `stripHeadSlash: false` → `'/'` ／ `true` → `''`
- `fileNameOnly` は常に入力の `fileName`
- ディレクトリ部分だけ欲しい場合は **`pathOnly` を使う**（旧 `includeFileName: false` の代用）

TypeScript では overload で戻り値型を分岐してよい。

### 常時エラー・`insufficientChars`

v0.3.0 と同じ。本 Issue では変更しない。

## 移行（v0.3.0 → v0.4.0）

```typescript
// v0.3.0: ディレクトリのみ（文字列）
shardian('abc1234.jpg', { includeFileName: false })
// => '/a/b/c/1'

// v0.4.0: split の pathOnly で代用（末尾 `/` あり）
const { pathOnly } = shardian('abc1234.jpg', { splitPathFilename: true })
// pathOnly => '/a/b/c/1/'

// v0.3.0: split + ファイル名なし
shardian('abc1234.jpg', { splitPathFilename: true, includeFileName: false })
// => { fullPath: '/a/b/c/1', pathOnly: '/a/b/c/1/' }

// v0.4.0: 常に fileNameOnly 付き。ディレクトリは pathOnly
shardian('abc1234.jpg', { splitPathFilename: true })
// => { fullPath: '/a/b/c/1/abc1234.jpg', pathOnly: '/a/b/c/1/', fileNameOnly: 'abc1234.jpg' }
```

注意: 旧 `includeFileName: false` の文字列戻り値は末尾 `/` なし。`pathOnly` は末尾 `/` あり。呼び出し側で整形が必要なら `pathOnly` を trim する。

## 作業順

1. 本計画・roadmap・plans 索引を整備
2. `docs/tests/shardian.md` を v0.4.0 向けに更新
3. テスト書き換え（Red）→ 実装（Green）
4. `package.json` version `0.4.0`
5. README を追随
6. 実装後: 本ファイルを `docs/specs/` へ移す（charter どおり）

## 受け入れ条件

### #26

- [ ] `ShardianOption` に `includeFileName` がない
- [ ] 文字列戻り値は常にファイル名付き
- [ ] `splitPathFilename: true` は常に `{ fullPath, pathOnly, fileNameOnly }`
- [ ] `ShardianSplitPathDirOnly` 相当の型・振る舞いがない
- [ ] docs（plans / tests / README）を更新
- [ ] 移行例どおり `pathOnly` でディレクトリ部分を取得できる

----

以上
