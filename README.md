# shardian

Create sharded path library

ファイル名からシャード階層（プレフィックス分割）のパス文字列を生成するヘルパーです。  
I/O・ハッシュ計算・保存処理は行いません。責務はパス生成のみです。

## 機能

```javascript
import { shardian } from '@b4moss/shardian'

const path = shardian({
  fileName: 'abc1234.jpg',
  dirLetterCount: 1,
  dirNestDepth: 4,
})

console.log(path)
// => '/a/b/c/1/abc1234.jpg'
```

### オプション

| フィールド | 必須 | デフォルト | 意味 |
| --- | --- | --- | --- |
| `fileName` | はい | — | ファイル名（拡張子込み） |
| `dirLetterCount` | はい | — | 1 階層あたりの文字数 |
| `dirNestDepth` | はい | — | 階層の深さ |
| `includeFileName` | いいえ | `true` | 末尾にファイル名を含めるか |
| `insufficientChars` | いいえ | `'ignore'` | 文字不足時: `'ignore'` / `'warn'` / `'throw'` |

- 先頭の `/` は常に付きます
- `includeFileName: false` の例: `'/a/b/c/1'`

### ルール

- **拡張子**: ファイル名の一部として扱う（除去しない）
- **パス入力**: 許可しない。`/` または `\` を含むファイル名はエラー
- **短いファイル名**: 切れる範囲だけでパスを作る。通知は `insufficientChars` で選ぶ（デフォルトは何も出さない）

```javascript
shardian({ fileName: 'abc1234.jpg', dirLetterCount: 1, dirNestDepth: 4 })
// => '/a/b/c/1/abc1234.jpg'

shardian({ fileName: 'ab', dirLetterCount: 1, dirNestDepth: 4 })
// => '/a/b/ab'（warn なし）

shardian({
  fileName: 'ab',
  dirLetterCount: 1,
  dirNestDepth: 4,
  insufficientChars: 'warn',
})
// => '/a/b/ab' + console.warn

shardian({ fileName: 'dir/abc1234.jpg', dirLetterCount: 1, dirNestDepth: 4 })
// Error
```

詳細は `docs/main.md` および `docs/plans/v0.2.0/path-api.md`。

## 対象言語

- Node.js（Bun, Deno 互換）: npm で配信（`@b4moss/shardian`）
- Go（予定）

## License

MIT License
