# パス生成 API

- **状態**: 出荷済み（`@b4moss/shardian@0.4.0`）
- **マイルストーン**: `v0.4.0`
- **関連**: [docs/tests/shardian.md](../tests/shardian.md)、[README.md](../../README.md)
- **前版**: [path-api-v0.3.0.md](../_archived/specs/path-api-v0.3.0.md)

## 目的

ファイル名の先頭から、指定した文字数・深さでシャード階層パスを組み立てる。

## 関数契約

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

- 第1引数名は **`fileName`**（パス区切りを含まないファイル名）
- 第2引数は **`option?: ShardianOption`**。省略または `undefined` で全デフォルト。`null` は受けない
- 公開定数 **`COMMON_EXTENSIONS`**（ドット付き拡張子の配列）をエクスポートする
- `includeFileName` は存在しない

### フィールド

| フィールド | 必須 | デフォルト | 意味 |
|------------|------|------------|------|
| （第1引数）`fileName` | はい | — | ファイル名。パス区切り禁止 |
| `dirLetterCount` | いいえ | `1` | 1 階層あたりの文字数（正の整数） |
| `dirNestDepth` | いいえ | `4` | 階層の深さ（正の整数） |
| `stripHeadSlash` | いいえ | `false` | `true` なら戻り値の先頭 `/` を付けない |
| `insufficientChars` | いいえ | `'ignore'` | 文字不足で深さ未達のときの扱い |
| `splitPathFilename` | いいえ | `false` | `true` ならパス分割オブジェクトを返す |
| `extensionOnlyList` | いいえ | `COMMON_EXTENSIONS` | 拡張子のみ判定用リスト（完全置換） |

### 文字の数え方

- 拡張子は除去しない。`fileName` 全体を対象にする
- 1 文字 = Unicode スカラー値（JS code point）

### 組み立て

1. `fileName` 先頭から `dirLetterCount` 文字ずつ切り出し、最大 `dirNestDepth` 個
2. 残りが `dirLetterCount` 未満なら切り出し停止
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

ルール:

- `pathOnly` は **常に末尾 `/` あり**（セグメントがあるとき。例: `'/a/b/c/d/'`）
- `stripHeadSlash: true` のとき、`fullPath` と `pathOnly` の **両方**から先頭 `/` を外す
- セグメント 0 個の `pathOnly`: `stripHeadSlash: false` → `'/'` ／ `true` → `''`
- `fileNameOnly` は常に入力の `fileName`
- ディレクトリ部分だけ欲しい場合は **`pathOnly` を使う**

TypeScript では overload で戻り値型を分岐してよい。

### `insufficientChars`（深さ未達時のみ）

実際のセグメント数 `< dirNestDepth` のとき:

| 値 | 振る舞い |
|----|----------|
| `'ignore'` | 切り捨てパスを返すだけ |
| `'warn'` | `console.warn` のうえ返す |
| `'throw'` | エラーを投げる（返さない） |

深さに届いているときは何もしない。

### 常時エラー（`insufficientChars` 非連動）

| 条件 | 理由 |
|------|------|
| `fileName === ''` | 対象がない |
| `fileName` が `'.'` / `'..'` / `'./'` / `'../'` | 相対参照として不正 |
| `fileName` に `/` または `\` を含む | パス入力は禁止 |
| `dirLetterCount < 1` / `dirNestDepth < 1` | 階層幅・深さとして不正 |
| 拡張子のみ（下記） | ファイル名として不正 |
| `extensionOnlyList` の要素が先頭 `.` 欠落 | リスト形式不正 |

#### 拡張子のみ

判定: `fileName` が、判定用リストのいずれかの要素と **大小無視の完全一致**。

- 例: リストに `'.jpg'` があるとき `.jpg` / `.JPG` → エラー
- `.gitignore` はリストに無ければ通す（dotfile を先頭 `.` だけでは落とさない）
- `.tar.gz` はリストに `'.tar.gz'` があれば完全一致でエラー

#### `COMMON_EXTENSIONS` / `extensionOnlyList`

- `COMMON_EXTENSIONS`: 公開定数。要素はドットあり（例: `'.jpg'`）。Web / メディア寄り一式
- `extensionOnlyList` 指定時は **デフォルトを完全置換**
- **`[]`（空配列）は未指定扱い**し、`COMMON_EXTENSIONS` にフォールバック
- リスト検証は **常に `shardian` 呼び出し時**

## 非責務

- 実ディレクトリの作成・存在確認
- ハッシュ化・正規化（NFC 等）の強制
- WARN ロガー差し替え

## 移行（v0.3.0 → v0.4.0）

```typescript
// v0.3.0: ディレクトリのみ（文字列）
shardian('abc1234.jpg', { includeFileName: false })
// => '/a/b/c/1'

// v0.4.0: split の pathOnly で代用（末尾 `/` あり）
const { pathOnly } = shardian('abc1234.jpg', { splitPathFilename: true })
// pathOnly => '/a/b/c/1/'
```

旧 `includeFileName: false` の文字列戻り値は末尾 `/` なし。`pathOnly` は末尾 `/` あり。

----

以上
