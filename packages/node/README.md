# @b4moss/shardian

Create sharded path strings from filenames.

```js
import { shardian } from '@b4moss/shardian'

shardian('abc1234.jpg')
// => '/a/b/c/1/abc1234.jpg'

shardian('abc1234.jpg', {
  dirLetterCount: 1,
  dirNestDepth: 4,
  stripHeadSlash: true,
})
// => 'a/b/c/1/abc1234.jpg'
```

See the repository root README and `docs/` for the full contract.

## License

MIT
