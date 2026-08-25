import assert from 'node:assert/strict'
import { mock, test } from 'node:test'
import { shardian } from './shardian.js'

test('shardian: normal cases', async (t) => {
  await t.test('builds full path with defaults and no warn', () => {
    const warn = mock.method(console, 'warn', () => {})
    assert.equal(
      shardian({
        fileName: 'abc1234.jpg',
        dirLetterCount: 1,
        dirNestDepth: 4,
      }),
      '/a/b/c/1/abc1234.jpg',
    )
    assert.equal(warn.mock.callCount(), 0)
    warn.mock.restore()
  })

  await t.test('omits filename when includeFileName is false', () => {
    const warn = mock.method(console, 'warn', () => {})
    assert.equal(
      shardian({
        fileName: 'abc1234.jpg',
        dirLetterCount: 1,
        dirNestDepth: 4,
        includeFileName: false,
      }),
      '/a/b/c/1',
    )
    assert.equal(warn.mock.callCount(), 0)
    warn.mock.restore()
  })

  await t.test('builds two-char segments without warn', () => {
    const warn = mock.method(console, 'warn', () => {})
    assert.equal(
      shardian({
        fileName: 'abcdef',
        dirLetterCount: 2,
        dirNestDepth: 2,
      }),
      '/ab/cd/abcdef',
    )
    assert.equal(warn.mock.callCount(), 0)
    warn.mock.restore()
  })

  await t.test('short name defaults to ignore without warn', () => {
    const warn = mock.method(console, 'warn', () => {})
    assert.equal(
      shardian({
        fileName: 'ab',
        dirLetterCount: 1,
        dirNestDepth: 4,
      }),
      '/a/b/ab',
    )
    assert.equal(warn.mock.callCount(), 0)
    warn.mock.restore()
  })

  await t.test('short name warns when insufficientChars is warn', () => {
    const warn = mock.method(console, 'warn', () => {})
    assert.equal(
      shardian({
        fileName: 'ab',
        dirLetterCount: 1,
        dirNestDepth: 4,
        insufficientChars: 'warn',
      }),
      '/a/b/ab',
    )
    assert.equal(warn.mock.callCount(), 1)
    warn.mock.restore()
  })

  await t.test('short name with ignore returns filename only without warn', () => {
    const warn = mock.method(console, 'warn', () => {})
    assert.equal(
      shardian({
        fileName: 'a',
        dirLetterCount: 2,
        dirNestDepth: 3,
        insufficientChars: 'ignore',
      }),
      '/a',
    )
    assert.equal(warn.mock.callCount(), 0)
    warn.mock.restore()
  })
})

test('shardian: error cases', async (t) => {
  await t.test('empty fileName throws', () => {
    assert.throws(() =>
      shardian({
        fileName: '',
        dirLetterCount: 1,
        dirNestDepth: 4,
      }),
    )
  })

  await t.test('fileName with / throws', () => {
    assert.throws(() =>
      shardian({
        fileName: 'dir/a.jpg',
        dirLetterCount: 1,
        dirNestDepth: 4,
      }),
    )
  })

  await t.test('fileName with \\ throws', () => {
    assert.throws(() =>
      shardian({
        fileName: 'dir\\a.jpg',
        dirLetterCount: 1,
        dirNestDepth: 4,
      }),
    )
  })

  await t.test('dirLetterCount 0 throws', () => {
    assert.throws(() =>
      shardian({
        fileName: 'abc.jpg',
        dirLetterCount: 0,
        dirNestDepth: 4,
      }),
    )
  })

  await t.test('dirNestDepth 0 throws', () => {
    assert.throws(() =>
      shardian({
        fileName: 'abc.jpg',
        dirLetterCount: 1,
        dirNestDepth: 0,
      }),
    )
  })

  await t.test('short name throws when insufficientChars is throw', () => {
    assert.throws(() =>
      shardian({
        fileName: 'ab',
        dirLetterCount: 1,
        dirNestDepth: 4,
        insufficientChars: 'throw',
      }),
    )
  })
})
