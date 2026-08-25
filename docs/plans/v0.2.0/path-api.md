# パス生成 API（v0.2.0）

- **状態**: 仕様詳細
- **マイルストーン**: `v0.2.0`
- **Issue**: [#7](https://github.com/b4moss/shardian/issues/7)
- **関連**: [docs/tests/shardian.md](../../tests/shardian.md)、[README.md](../../../README.md)
- **前版**: [specs/path-api-v0.1.0.md](../../specs/path-api-v0.1.0.md)

## 目的

ファイル名からシャード階層パスを生成する。v0.1.0 の切り捨てロジックは維持し、呼び出し契約をオブジェクト化し、短いファイル名時の通知を選択可能にする。

## スコープ

### やること（Node / `@b4moss/shardian@0.2.0`）

- 位置引数 API を廃止し、`ShardianOption` のみを公開する
- `insufficientChars: 'ignore' | 'warn' | 'throw'`（デフォルト `'ignore'`）
- 切り捨てパス生成は v0.1.0 と同じ
- docs / テスト仕様 / README を更新する
- `release` CD で npm 公開する

### やらないこと

- Go 実装
- 互換レイヤ（位置引数オーバーロード）
- WARN 以外のロガー差し替え

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

戻り値は常に `/` 始まり。

### 文字の数え方

- 拡張子は除去しない
- 1 文字 = Unicode スカラー値（JS code point）。`dirLetterCount` の letter は code point を指す

### 組み立て

1. `fileName` 先頭から `dirLetterCount` 文字ずつ切り出し、最大 `dirNestDepth` 個
2. 残りが `dirLetterCount` 未満なら切り出し停止（切り捨て）
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

深さに届いているときは何もしない。

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
  // includeFileName: true（省略可）
  // insufficientChars: 'ignore'（省略可。旧既定の WARN が必要なら 'warn'）
})
```

旧既定（短い名前で常に WARN）が必要な呼び出しは `insufficientChars: 'warn'` を明示する。

## 作業順（TDD + charter）

1. docs: 本計画・roadmap・テスト仕様・README（本ブランチ）
2. `dev-v0.2.0` を `develop` から生やす
3. テスト仕様に沿って Red → Green（`packages/node`）
4. `package.json` version `0.2.0`
5. PR → `dev-v0.2.0` → `develop` → `main`
6. `main` に `v0.2.0` タグ
7. `release` へ流して CD publish（Trusted Publisher 前提）
8. 実装後: 本ファイルを `docs/specs/` へ移す

## 受け入れ条件

- [ ] #7 の受け入れを満たす
- [ ] `docs/tests/shardian.md` が Green
- [ ] `@b4moss/shardian@0.2.0` が npm で取得できる
- [ ] 位置引数 API が残っていない

----

以上
