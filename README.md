# shardian

[![CI](https://github.com/b4moss/shardian/actions/workflows/ci.yml/badge.svg)](https://github.com/b4moss/shardian/actions/workflows/ci.yml)
[![Coverage](https://img.shields.io/codecov/c/github/b4moss/shardian)](https://codecov.io/gh/b4moss/shardian)
[![npm](https://img.shields.io/npm/v/@b4moss/shardian)](https://www.npmjs.com/package/@b4moss/shardian)
[![Release](https://img.shields.io/github/v/release/b4moss/shardian)](https://github.com/b4moss/shardian/releases)
[![License](https://img.shields.io/github/license/b4moss/shardian)](https://github.com/b4moss/shardian/blob/main/LICENSE)
[![OpenSSF Scorecard](https://api.securityscorecards.dev/projects/github.com/b4moss/shardian/badge)](https://securityscorecards.dev/viewer/?uri=github.com/b4moss/shardian)

Create sharded path library

ファイル名からシャード階層（プレフィックス分割）のパス文字列を生成するヘルパーです。  
I/O・ハッシュ計算・保存処理は行いません。責務はパス生成のみです。

## 機能

```javascript
import { shardian } from '@b4moss/shardian'

const path = shardian('abc1234.jpg')

console.log(path)
// => '/a/b/c/1/abc1234.jpg'
```

### オプション

| フィールド | 必須 | デフォルト | 意味 |
| --- | --- | --- | --- |
| （第1引数）`fileName` | はい | — | ファイル名（拡張子込み） |
| `dirLetterCount` | いいえ | `1` | 1 階層あたりの文字数 |
| `dirNestDepth` | いいえ | `4` | 階層の深さ |
| `stripHeadSlash` | いいえ | `false` | `true` なら先頭 `/` を付けない |
| `splitPathFilename` | いいえ | `false` | `true` ならパス分割オブジェクトを返す |
| `insufficientChars` | いいえ | `'ignore'` | 文字不足時: `'ignore'` / `'warn'` / `'throw'` |
| `extensionOnlyList` | いいえ | `COMMON_EXTENSIONS` | 拡張子のみ判定リスト（完全置換。`[]` はデフォルトへフォールバック） |

- 文字列戻り値は常に末尾にファイル名を含む
- ディレクトリ部分だけ欲しい場合: `splitPathFilename: true` の `pathOnly`（例: `'/a/b/c/1/'`）
- `stripHeadSlash: true` の例: `'a/b/c/1/abc1234.jpg'`

### ルール

- **拡張子**: ファイル名の一部として扱う（除去しない）
- **パス入力**: 許可しない。`/` または `\` を含むファイル名はエラー
- **相対参照**: `.` / `..` / `./` / `../` はエラー
- **拡張子のみ**: `COMMON_EXTENSIONS`（または `extensionOnlyList`）と大小無視で完全一致したらエラー
- **短いファイル名**: 切れる範囲だけでパスを作る。通知は `insufficientChars` で選ぶ（デフォルトは何も出さない）

```javascript
shardian('abc1234.jpg')
// => '/a/b/c/1/abc1234.jpg'

shardian('ab', { dirLetterCount: 1, dirNestDepth: 4 })
// => '/a/b/ab'（warn なし）

shardian('ab', {
  dirLetterCount: 1,
  dirNestDepth: 4,
  insufficientChars: 'warn',
})
// => '/a/b/ab' + console.warn

shardian('dir/abc1234.jpg')
// Error

shardian('.jpg')
// Error
```

詳細は `docs/main.md` および `docs/plans/v0.4.0/path-api.md`。

## 対象言語

- Node.js（Bun, Deno 互換）: npm で配信（`@b4moss/shardian`）
- Go（予定）

## License

MIT License
