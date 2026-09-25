# shardian (PHP)

Create sharded path strings from filenames.

> **Source of truth:** [`b4moss/shardian`](https://github.com/b4moss/shardian) (`packages/php`)  
> **Packagist mirror:** [`b4moss/shardian-php`](https://github.com/b4moss/shardian-php) (CD-updated; do not edit by hand)

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

Full contract and tests live in the monorepo: `docs/specs/path-api.md`, `docs/tests/shardian-php.md`.

## License

MIT
