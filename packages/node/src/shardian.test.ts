import assert from 'node:assert/strict'
import { mock, test } from 'node:test'
import { COMMON_EXTENSIONS, shardian } from './shardian.js'

test('shardian: normal cases', async (t) => {
  await t.test('builds full path with defaults and no warn', () => {
    const warn = mock.method(console, 'warn', () => {})
    assert.equal(shardian('abc1234.jpg'), '/a/b/c/1/abc1234.jpg')
    assert.equal(warn.mock.callCount(), 0)
    warn.mock.restore()
  })

  await t.test('builds two-char segments without warn', () => {
    const warn = mock.method(console, 'warn', () => {})
    assert.equal(
      shardian('abcdef', { dirLetterCount: 2, dirNestDepth: 2 }),
      '/ab/cd/abcdef',
    )
    assert.equal(warn.mock.callCount(), 0)
    warn.mock.restore()
  })

  await t.test('strips head slash when stripHeadSlash is true', () => {
    const warn = mock.method(console, 'warn', () => {})
    assert.equal(
      shardian('abc1234.jpg', { stripHeadSlash: true }),
      'a/b/c/1/abc1234.jpg',
    )
    assert.equal(warn.mock.callCount(), 0)
    warn.mock.restore()
  })

  await t.test('returns split path object when splitPathFilename is true', () => {
    const warn = mock.method(console, 'warn', () => {})
    assert.deepEqual(shardian('abc1234.jpg', { splitPathFilename: true }), {
      fullPath: '/a/b/c/1/abc1234.jpg',
      pathOnly: '/a/b/c/1/',
      fileNameOnly: 'abc1234.jpg',
    })
    assert.equal(warn.mock.callCount(), 0)
    warn.mock.restore()
  })

  await t.test('strips head slash on both fullPath and pathOnly when split', () => {
    assert.deepEqual(
      shardian('abc1234.jpg', {
        splitPathFilename: true,
        stripHeadSlash: true,
      }),
      {
        fullPath: 'a/b/c/1/abc1234.jpg',
        pathOnly: 'a/b/c/1/',
        fileNameOnly: 'abc1234.jpg',
      },
    )
  })

  await t.test('short name with zero segments returns filename path', () => {
    const warn = mock.method(console, 'warn', () => {})
    assert.equal(
      shardian('a', { dirLetterCount: 2, dirNestDepth: 3 }),
      '/a',
    )
    assert.equal(warn.mock.callCount(), 0)
    warn.mock.restore()
  })

  await t.test('zero segments with stripHeadSlash returns bare filename', () => {
    assert.equal(
      shardian('a', {
        dirLetterCount: 2,
        dirNestDepth: 3,
        stripHeadSlash: true,
      }),
      'a',
    )
  })

  await t.test('zero segments split returns root pathOnly', () => {
    assert.deepEqual(
      shardian('a', {
        dirLetterCount: 2,
        dirNestDepth: 3,
        splitPathFilename: true,
      }),
      {
        fullPath: '/a',
        pathOnly: '/',
        fileNameOnly: 'a',
      },
    )
  })

  await t.test('zero segments split with stripHeadSlash returns empty pathOnly', () => {
    assert.deepEqual(
      shardian('a', {
        dirLetterCount: 2,
        dirNestDepth: 3,
        splitPathFilename: true,
        stripHeadSlash: true,
      }),
      {
        fullPath: 'a',
        pathOnly: '',
        fileNameOnly: 'a',
      },
    )
  })

  await t.test('short name defaults to ignore without warn', () => {
    const warn = mock.method(console, 'warn', () => {})
    assert.equal(
      shardian('ab', { dirLetterCount: 1, dirNestDepth: 4 }),
      '/a/b/ab',
    )
    assert.equal(warn.mock.callCount(), 0)
    warn.mock.restore()
  })

  await t.test('short name warns when insufficientChars is warn', () => {
    const warn = mock.method(console, 'warn', () => {})
    assert.equal(
      shardian('ab', {
        dirLetterCount: 1,
        dirNestDepth: 4,
        insufficientChars: 'warn',
      }),
      '/a/b/ab',
    )
    assert.equal(warn.mock.callCount(), 1)
    warn.mock.restore()
  })

  await t.test('allows dotfile that is not extension-only', () => {
    const warn = mock.method(console, 'warn', () => {})
    assert.equal(shardian('.gitignore'), '/./g/i/t/.gitignore')
    assert.equal(warn.mock.callCount(), 0)
    warn.mock.restore()
  })

  await t.test('extensionOnlyList replaces defaults so .jpg is allowed', () => {
    assert.equal(
      shardian('.jpg', { extensionOnlyList: ['.custom'] }),
      '/./j/p/g/.jpg',
    )
  })
})

test('shardian: error cases', async (t) => {
  await t.test('empty fileName throws', () => {
    assert.throws(() => shardian(''))
  })

  await t.test('fileName with / throws', () => {
    assert.throws(() => shardian('dir/a.jpg'))
  })

  await t.test('fileName with \\ throws', () => {
    assert.throws(() => shardian('dir\\a.jpg'))
  })

  await t.test('dirLetterCount 0 throws', () => {
    assert.throws(() => shardian('abc.jpg', { dirLetterCount: 0 }))
  })

  await t.test('dirNestDepth 0 throws', () => {
    assert.throws(() => shardian('abc.jpg', { dirNestDepth: 0 }))
  })

  await t.test('short name throws when insufficientChars is throw', () => {
    assert.throws(() =>
      shardian('ab', {
        dirLetterCount: 1,
        dirNestDepth: 4,
        insufficientChars: 'throw',
      }),
    )
  })

  await t.test('dot fileName throws', () => {
    assert.throws(() => shardian('.'))
  })

  await t.test('dotdot fileName throws', () => {
    assert.throws(() => shardian('..'))
  })

  await t.test('./ fileName throws', () => {
    assert.throws(() => shardian('./'))
  })

  await t.test('../ fileName throws', () => {
    assert.throws(() => shardian('../'))
  })

  await t.test('extension-only .jpg throws', () => {
    assert.ok(COMMON_EXTENSIONS.includes('.jpg'))
    assert.throws(() => shardian('.jpg'))
  })

  await t.test('extension-only .JPG throws case-insensitively', () => {
    assert.throws(() => shardian('.JPG'))
  })

  await t.test('custom extensionOnlyList match throws', () => {
    assert.throws(() =>
      shardian('.custom', { extensionOnlyList: ['.custom'] }),
    )
  })

  await t.test('empty extensionOnlyList falls back to COMMON_EXTENSIONS', () => {
    assert.throws(() => shardian('.jpg', { extensionOnlyList: [] }))
  })

  await t.test('extensionOnlyList entry without leading dot throws', () => {
    assert.throws(() =>
      shardian('a.jpg', { extensionOnlyList: ['jpg'] }),
    )
  })
})
