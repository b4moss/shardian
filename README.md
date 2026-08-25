# shardian
Create sharded path library

## 機能

ハッシュ階層ディレクトリを作るヘルパ

```javascript
const fileName = 'abc1234.jpg'
const path = shardian(fileName, 1, 4, true)

console.path(path)

// output: '/a/b/c/1/abc1234.jpg'
```

## 対象言語

- Node.js(Bun, Deno互換): npmで配信
- Go

## License

MIT License

----

以上 