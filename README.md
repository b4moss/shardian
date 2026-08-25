# shardian

Create sharded path library

ファイル名からシャード階層（プレフィックス分割）のパス文字列を生成するヘルパーです。  
I/O・ハッシュ計算・保存処理は行いません。責務はパス生成のみです。

## 機能

```javascript
const fileName = 'abc1234.jpg'
const path = shardian(fileName, 1, 4, true)

console.log(path)

// output: '/a/b/c/1/abc1234.jpg'
```

### 引数

| 引数 | 例 | 意味 |
| --- | --- | --- |
| 1 | `'abc1234.jpg'` | ファイル名 |
| 2 | `1` | 1階層あたりの文字数 |
| 3 | `4` | 階層の深さ |
| 4 | `true` | 末尾にファイル名を含めるか |

- 先頭の `/` は常に付きます
- 第4引数が `false` の場合: `'/a/b/c/1'`

### ルール

- **拡張子**: ファイル名の一部として扱う（除去しない）
- **パス入力**: 許可しない。`/` または `\` を含むファイル名はエラー
- **短いファイル名**: 指定深さに足りなくてもエラーにしない。切れる範囲だけでパスを作り、WARN を出す

```javascript
shardian('abc1234.jpg', 1, 4, true)      // OK → '/a/b/c/1/abc1234.jpg'
shardian('ab', 1, 4, true)               // OK → '/a/b/ab'（WARN）
shardian('dir/abc1234.jpg', 1, 4, true)  // Error
```

詳細は `docs/main.md` および `docs/plans/v0.1.0/path-api.md`。

## 対象言語

- Node.js（Bun, Deno 互換）: npm で配信
- Go

## License

MIT License
