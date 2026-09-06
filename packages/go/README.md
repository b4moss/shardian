# shardian (Go)

Create sharded path strings from filenames.

```go
import shardian "github.com/b4moss/shardian/packages/go"

path, err := shardian.Shardian("abc1234.jpg", nil)
// path => "/a/b/c/1/abc1234.jpg"

path, err = shardian.Shardian("abc1234.jpg", &shardian.Option{
	StripHeadSlash: true,
})
// path => "a/b/c/1/abc1234.jpg"

split, err := shardian.ShardianSplit("abc1234.jpg", nil)
// split.PathOnly => "/a/b/c/1/"
```

See the repository root README and `docs/specs/path-api.md` for the full contract.
Go test cases: `docs/tests/shardian-go.md`.

## License

MIT
