# shardian (PHP)

Create sharded path strings from filenames.

```php
use function B4moss\Shardian\shardian;
use function B4moss\Shardian\shardianSplit;

$path = shardian('abc1234.jpg');
// => '/a/b/c/1/abc1234.jpg'

$path = shardian('abc1234.jpg', ['stripHeadSlash' => true]);
// => 'a/b/c/1/abc1234.jpg'

$split = shardianSplit('abc1234.jpg');
// $split->pathOnly => '/a/b/c/1/'
```

```bash
composer require b4moss/shardian
```

See the repository root README and `docs/specs/path-api.md` for the full contract.
PHP test cases: `docs/tests/shardian-php.md`.

## License

MIT
