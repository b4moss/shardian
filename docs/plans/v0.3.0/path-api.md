# パス生成 API（v0.3.0）

- **状態**: 仕様詳細
- **マイルストーン**: `v0.3.0`
- **Issue**: [#19](https://github.com/b4moss/shardian/issues/19)（引数見直し）→ [#20](https://github.com/b4moss/shardian/issues/20)（異常系）
- **関連**: [docs/tests/shardian.md](../../tests/shardian.md)、[README.md](../../../README.md)
- **前版**: [plans/v0.2.0/path-api.md](../v0.2.0/path-api.md)

## 目的

呼び出し契約を「第1引数 = ファイル名、第2引数 = オプション」に再設計し、デフォルト省略・出力整形・戻り値分割を追加する。続けて、ファイル名として不正な入力を常時エラーにする。

## スコープ

### やること（Node / `@b4moss/shardian@0.3.0`）

1. **#19** 新シグネチャとオプション既定値、`stripHeadSlash` / `splitPathFilename`
2. **#20**（#19 の後）常時エラー検証と `COMMON_EXTENSIONS` / `extensionOnlyList`

### やらないこと

- Go / PHP 実装
- v0.2.0 単一オブジェクト API の互換レイヤ
- `insufficientChars` のリネーム（名称・値は v0.2.0 を継承）
- WARN ロガー差し替え

### 実装順

同一マイルストーン内で **#19 → #20**。

## 関数契約（#19）

```typescript
type InsufficientChars = 'ignore' | 'warn' | 'throw'

type ShardianOption = {
  dirLetterCount?: number // default: 1
  dirNestDepth?: number // default: 4
  stripHeadSlash?: boolean // default: false
  includeFileName?: boolean // default: true
  insufficientChars?: InsufficientChars // default: 'ignore'
  splitPathFilename?: boolean // default: false
  extensionOnlyList?: string[] // #20。default: COMMON_EXTENSIONS 相当
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

- 第1引数名は **`fileName`**（パス区切りを含まないファイル名）
- 第2引数は **`option?: ShardianOption`**。省略または `undefined` で全デフォルト。`null` は受けない
- v0.2.0 の `shardian({ fileName, ... })` は **完全削除**

### フィールド

| フィールド | 必須 | デフォルト | 意味 |
|------------|------|------------|------|
| （第1引数）`fileName` | はい | — | ファイル名。パス区切り禁止 |
| `dirLetterCount` | いいえ | `1` | 1 階層あたりの文字数（正の整数） |
| `dirNestDepth` | いいえ | `4` | 階層の深さ（正の整数） |
| `stripHeadSlash` | いいえ | `false` | `true` なら戻り値の先頭 `/` を付けない |
| `includeFileName` | いいえ | `true` | 末尾に `fileName` を付けるか |
| `insufficientChars` | いいえ | `'ignore'` | 文字不足で深さ未達のとき（v0.2.0 継承） |
| `splitPathFilename` | いいえ | `false` | `true` ならパス分割オブジェクトを返す |
| `extensionOnlyList` | いいえ | `COMMON_EXTENSIONS` | #20。拡張子のみ判定用リスト（完全置換） |

### 組み立て（#19）

切り出しロジックは v0.2.0 と同じ（拡張子は除去せず、Unicode スカラー値単位）。

1. `fileName` 先頭から `dirLetterCount` 文字ずつ、最大 `dirNestDepth` 個
2. 残りが `dirLetterCount` 未満なら停止
3. セグメントを `/` で連結
4. `includeFileName !== false` なら末尾にファイル名を付与
5. `stripHeadSlash !== true` なら先頭に `/`（セグメント 0 個かつファイル名なしなら `'/'`）

#### `stripHeadSlash` とセグメント 0 個

例: `fileName: 'a'`, `dirLetterCount: 2`, `dirNestDepth: 3`

| `stripHeadSlash` | `includeFileName` | 文字列戻り値 |
|------------------|-------------------|--------------|
| `false` | `true` | `'/a'` |
| `false` | `false` | `'/'` |
| `true` | `true` | `'a'` |
| `true` | `false` | `''` |

### `splitPathFilename`

`false`（既定）: 従来どおり `string`。

`true` かつ `includeFileName !== false`:

```typescript
{ fullPath: string; pathOnly: string; fileNameOnly: string }
```

`true` かつ `includeFileName === false`:

```typescript
{ fullPath: string; pathOnly: string } // fileNameOnly フィールドなし
```

ルール:

- `pathOnly` は **常に末尾 `/` あり**（セグメントがあるとき。例: `'/a/b/c/d/'`）
- `stripHeadSlash: true` のとき、`fullPath` と `pathOnly` の **両方**から先頭 `/` を外す（例: `pathOnly: 'a/b/c/d/'`）
- セグメント 0 個の `pathOnly`: `stripHeadSlash: false` → `'/'` ／ `true` → `''`
- `fileNameOnly` を返す場合は、常に入力の `fileName`（パス組み立てに使った名前）

TypeScript では overload で戻り値型を分岐してよい。

### `insufficientChars`

v0.2.0 と同じ。実際のセグメント数 `< dirNestDepth` のときのみ:

| 値 | 振る舞い |
|----|----------|
| `'ignore'` | 切り捨てパスを返すだけ |
| `'warn'` | `console.warn` のうえ返す |
| `'throw'` | エラーを投げる |

名称は `insufficientChars` のまま。`'suppress'` 等へのリネームはしない。

## 常時エラー（#19 共通 + #20）

`insufficientChars` とは **独立**。常に例外を投げる。

### #19 時点から残すもの（v0.2.0 相当）

- `fileName === ''`
- `fileName` に `/` または `\` を含む（下記の明示ケース以外も含む）
- `dirLetterCount < 1` / `dirNestDepth < 1`

### #20 で追加するもの

#### 相対参照として不正

次は明示的に常時エラー（ファイルではない）:

- `'.'`
- `'..'`
- `'./'`
- `'../'`

`./` / `../` は区切り文字を含むため既存ルールでも落ちうるが、**意図を docs / テストで明示**する。

#### 拡張子しかないファイル名

判定: `fileName` が、判定用リストのいずれかの要素と **大小無視の完全一致**。

- 例: リストに `'.jpg'` があるとき `.jpg` / `.JPG` → エラー
- `.gitignore` はリストに無ければ通す（dotfile を先頭 `.` だけでは落とさない）
- `.tar.gz` はリストに `'.tar.gz'` があれば完全一致でエラー。無ければ通す（末尾マッチ等はしない）

#### `COMMON_EXTENSIONS`

- 公開定数名: **`COMMON_EXTENSIONS`**
- 要素形式: **ドットあり**（例: `'.jpg'`）
- 初回範囲: **広め**（アーカイブ・コード・フォント等も含む Web/メディア寄り一式）
- option 未指定時の既定リストとして使う

#### `extensionOnlyList`

- 指定時は **デフォルトを完全置換**
- **`[]`（空配列）は未指定扱い**し、`COMMON_EXTENSIONS` にフォールバック
- リストの各要素は先頭が `.` であること。1 つでも欠ければエラー

#### リストバリデーションのタイミング

- **常に `shardian` 呼び出し時**（デフォルト利用時も、ユーザー指定時も）
- モジュール初期化時専用の検証には依存しない（呼び出し時に担保）

## 移行（v0.2.0 → v0.3.0）

```typescript
// v0.2.0
shardian({
  fileName: 'abc1234.jpg',
  dirLetterCount: 1,
  dirNestDepth: 4,
})

// v0.3.0
shardian('abc1234.jpg', {
  dirLetterCount: 1,
  dirNestDepth: 4,
})

// デフォルトのみ
shardian('abc1234.jpg')
// => '/a/b/c/1/abc1234.jpg'
```

## 作業順

1. 本計画・roadmap・plans 索引を整備（本ブランチ）
2. Issue #19 / #20 に本ファイルへのリンクを貼る
3. 実装時: `docs/tests/shardian.md` を v0.3.0 向けに更新してから Red → Green
4. `package.json` version `0.3.0`
5. #19 実装 → #20 実装
6. 実装後: 本ファイルを `docs/specs/` へ移す（charter どおり）

## 受け入れ条件

### #19

- [ ] `shardian(fileName, option?)` のみ公開（旧オブジェクト単一引数 API なし）
- [ ] オプション省略時の既定値が仕様どおり
- [ ] `stripHeadSlash` / `splitPathFilename` / `includeFileName` の組み合わせが仕様表どおり
- [ ] `insufficientChars` 名称・値が v0.2.0 から継続
- [ ] docs（plans / tests / README）を更新

### #20

- [ ] `'.'` / `'..'` / `'./'` / `'../'` が常時エラー
- [ ] `COMMON_EXTENSIONS` をエクスポート
- [ ] `extensionOnlyList` で完全置換（空配列はデフォルトへフォールバック）
- [ ] リスト要素の先頭 `.` 欠落は呼び出し時エラー
- [ ] 拡張子のみ（大小無視・完全一致）は `insufficientChars` 非連動の常時エラー

----

以上
