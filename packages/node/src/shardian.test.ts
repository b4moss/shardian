import assert from 'node:assert/strict'
import { mock, test } from 'node:test'
import { shardian } from './shardian.js'

test('shardian: normal cases', async (t) => {
  await t.test("shardian('abc1234.jpg', 1, 4, true) returns full path without warn", () => {
    const warn = mock.method(console, 'warn', () => {})
    assert.equal(shardian('abc1234.jpg', 1, 4, true), '/a/b/c/1/abc1234.jpg')
    assert.equal(warn.mock.callCount(), 0)
    warn.mock.restore()
  })

  await t.test("shardian('abc1234.jpg', 1, 4, false) returns dirs only without warn", () => {
    const warn = mock.method(console, 'warn', () => {})
    assert.equal(shardian('abc1234.jpg', 1, 4, false), '/a/b/c/1')
    assert.equal(warn.mock.callCount(), 0)
    warn.mock.restore()
  })

  await t.test("shardian('abcdef', 2, 2, true) returns two-char segments without warn", () => {
    const warn = mock.method(console, 'warn', () => {})
    assert.equal(shardian('abcdef', 2, 2, true), '/ab/cd/abcdef')
    assert.equal(warn.mock.callCount(), 0)
    warn.mock.restore()
  })

  await t.test("shardian('ab', 1, 4, true) returns partial path and warns", () => {
    const warn = mock.method(console, 'warn', () => {})
    assert.equal(shardian('ab', 1, 4, true), '/a/b/ab')
    assert.equal(warn.mock.callCount(), 1)
    warn.mock.restore()
  })

  await t.test("shardian('abc', 2, 3, true) returns partial path and warns", () => {
    const warn = mock.method(console, 'warn', () => {})
    assert.equal(shardian('abc', 2, 3, true), '/ab/abc')
    assert.equal(warn.mock.callCount(), 1)
    warn.mock.restore()
  })

  await t.test("shardian('a', 2, 3, true) returns filename only and warns", () => {
    const warn = mock.method(console, 'warn', () => {})
    assert.equal(shardian('a', 2, 3, true), '/a')
    assert.equal(warn.mock.callCount(), 1)
    warn.mock.restore()
  })
})

test('shardian: error cases', async (t) => {
  await t.test('empty fileName throws', () => {
    assert.throws(() => shardian('', 1, 4, true))
  })

  await t.test('fileName with / throws', () => {
    assert.throws(() => shardian('dir/a.jpg', 1, 4, true))
  })

  await t.test('fileName with \\ throws', () => {
    assert.throws(() => shardian('dir\\a.jpg', 1, 4, true))
  })

  await t.test('segmentLength 0 throws', () => {
    assert.throws(() => shardian('abc.jpg', 0, 4, true))
  })

  await t.test('depth 0 throws', () => {
    assert.throws(() => shardian('abc.jpg', 1, 0, true))
  })
})
