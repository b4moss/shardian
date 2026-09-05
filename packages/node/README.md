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

const { pathOnly } = shardian('abc1234.jpg', { splitPathFilename: true })
// pathOnly => '/a/b/c/1/'
```

See the repository root README and `docs/specs/path-api.md` for the full contract.

## License

MIT
