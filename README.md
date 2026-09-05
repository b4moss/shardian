# shardian

[![CI](https://github.com/b4moss/shardian/actions/workflows/ci.yml/badge.svg)](https://github.com/b4moss/shardian/actions/workflows/ci.yml)
[![Coverage](https://img.shields.io/codecov/c/github/b4moss/shardian)](https://codecov.io/gh/b4moss/shardian)
[![npm](https://img.shields.io/npm/v/@b4moss/shardian)](https://www.npmjs.com/package/@b4moss/shardian)
[![Release](https://img.shields.io/github/v/release/b4moss/shardian)](https://github.com/b4moss/shardian/releases)
[![License](https://img.shields.io/github/license/b4moss/shardian)](https://github.com/b4moss/shardian/blob/main/LICENSE)
[![OpenSSF Scorecard](https://api.securityscorecards.dev/projects/github.com/b4moss/shardian/badge)](https://securityscorecards.dev/viewer/?uri=github.com/b4moss/shardian)

Create sharded path strings from filenames.

This library only builds path strings from a filename prefix. It does not perform I/O, hashing, or persistence.

## Usage

```javascript
import { shardian } from '@b4moss/shardian'

const path = shardian('abc1234.jpg')

console.log(path)
// => '/a/b/c/1/abc1234.jpg'
```

### Options

| Field | Required | Default | Meaning |
| --- | --- | --- | --- |
| (`fileName` as 1st arg) | yes | — | Filename including extension |
| `dirLetterCount` | no | `1` | Characters per directory level |
| `dirNestDepth` | no | `4` | Nesting depth |
| `stripHeadSlash` | no | `false` | When `true`, omit the leading `/` |
| `splitPathFilename` | no | `false` | When `true`, return a split path object |
| `insufficientChars` | no | `'ignore'` | On short names: `'ignore'` / `'warn'` / `'throw'` |
| `extensionOnlyList` | no | `COMMON_EXTENSIONS` | Full replacement list for extension-only checks (`[]` falls back to default) |

- The string return value always includes the filename at the end
- For the directory part only, use `pathOnly` from `splitPathFilename: true` (e.g. `'/a/b/c/1/'`)
- `stripHeadSlash: true` example: `'a/b/c/1/abc1234.jpg'`

### Rules

- **Extension**: Kept as part of the filename (never stripped)
- **Path input**: Not allowed. Filenames containing `/` or `\` throw
- **Relative refs**: `.` / `..` / `./` / `../` throw
- **Extension-only**: Throws when the name case-insensitively equals an entry in `COMMON_EXTENSIONS` (or `extensionOnlyList`)
- **Short filenames**: Build from what fits. Notification is controlled by `insufficientChars` (default: silent)

```javascript
shardian('abc1234.jpg')
// => '/a/b/c/1/abc1234.jpg'

shardian('ab', { dirLetterCount: 1, dirNestDepth: 4 })
// => '/a/b/ab' (no warn)

shardian('ab', {
  dirLetterCount: 1,
  dirNestDepth: 4,
  insufficientChars: 'warn',
})
// => '/a/b/ab' + console.warn

const { pathOnly } = shardian('abc1234.jpg', { splitPathFilename: true })
// pathOnly => '/a/b/c/1/'

shardian('dir/abc1234.jpg')
// Error

shardian('.jpg')
// Error
```

Full contract: [`docs/specs/path-api.md`](docs/specs/path-api.md). Hub: [`docs/main.md`](docs/main.md).

## Supported runtimes

- Node.js (Bun / Deno compatible): published on npm as `@b4moss/shardian`
- Go / PHP: planned

## License

MIT License
