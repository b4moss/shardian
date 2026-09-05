# パス生成 API（v0.2.0）

- **状態**: 出荷済み・現行ではない（`@b4moss/shardian@0.2.0`）
- **マイルストーン**: `v0.2.0`
- **Issue**: [#7](https://github.com/b4moss/shardian/issues/7)
- **関連**: 前版 [path-api-v0.1.0.md](./path-api-v0.1.0.md)、後継 [path-api-v0.3.0.md](./path-api-v0.3.0.md)。現行は [../../specs/path-api.md](../../specs/path-api.md)

## 目的

ファイル名からシャード階層パスを生成する。v0.1.0 の切り捨てロジックは維持し、呼び出し契約をオブジェクト化し、短いファイル名時の通知を選択可能にする。

## 関数契約

```typescript
type InsufficientChars = 'ignore' | 'warn' | 'throw'

type ShardianOption = {
  fileName: string
  dirLetterCount: number
  dirNestDepth: number
  includeFileName?: boolean // default: true
  insufficientChars?: InsufficientChars // default: 'ignore'
}

function shardian(options: ShardianOption): string
```

| フィールド | 必須 | デフォルト | 意味 |
|------------|------|------------|------|
| `fileName` | はい | — | ファイル名（拡張子込み）。パス区切り禁止 |
| `dirLetterCount` | はい | — | 1 階層あたりの文字数（正の整数） |
| `dirNestDepth` | はい | — | 階層の深さ（正の整数） |
| `includeFileName` | いいえ | `true` | 末尾に `fileName` を付けるか |
| `insufficientChars` | いいえ | `'ignore'` | 文字不足で深さ未達のときの扱い |

戻り値は常に `/` 始まり。位置引数 API は廃止。

### 文字の数え方

- 拡張子は除去しない
- 1 文字 = Unicode スカラー値（JS code point）

### 組み立て

1. `fileName` 先頭から `dirLetterCount` 文字ずつ切り出し、最大 `dirNestDepth` 個
2. 残りが `dirLetterCount` 未満なら切り出し停止
3. セグメントを `/` で連結し先頭に `/`
4. `includeFileName !== false` なら末尾に `/` + `fileName`（セグメント 0 個なら `/${fileName}`）
5. `includeFileName === false` かつセグメント 0 個なら `'/'`

### `insufficientChars`（深さ未達時のみ）

実際のセグメント数 `< dirNestDepth` のとき:

| 値 | 振る舞い |
|----|----------|
| `'ignore'` | 切り捨てパスを返すだけ |
| `'warn'` | `console.warn` のうえ返す |
| `'throw'` | エラーを投げる（返さない） |

### 常にエラー（オプション対象外）

- `fileName === ''`
- `fileName` に `/` または `\`
- `dirLetterCount < 1`
- `dirNestDepth < 1`

## 移行（v0.1.0 → v0.2.0）

```typescript
// v0.1.0
shardian('abc1234.jpg', 1, 4, true)

// v0.2.0
shardian({
  fileName: 'abc1234.jpg',
  dirLetterCount: 1,
  dirNestDepth: 4,
})
```

旧既定（短い名前で常に WARN）が必要な呼び出しは `insufficientChars: 'warn'` を明示する。

----

以上
