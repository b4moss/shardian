# roadmap

パス生成 API の**契約マイルストーン**（言語横断で同じ振る舞い）を追う。各言語ポートの配信 SemVer は独立（[override-charter.md](./override-charter.md)）。

| 版 | 状態 | 受け入れ（要約） |
|----|------|------------------|
| v0.1.0 | リリース済 | Node で位置引数 API。短い名前は常に WARN。[旧仕様](./_archived/specs/path-api-v0.1.0.md) |
| v0.2.0 | リリース済 | オブジェクト API + `insufficientChars`。デフォルト沈黙。[旧仕様](./_archived/specs/path-api-v0.2.0.md) / [#7](https://github.com/b4moss/shardian/issues/7) |
| v0.3.0 | リリース済 | `shardian(fileName, option?)` + strip/split + 拡張子のみ常時エラー。[旧仕様](./_archived/specs/path-api-v0.3.0.md) / [#19](https://github.com/b4moss/shardian/issues/19) / [#20](https://github.com/b4moss/shardian/issues/20) |
| v0.4.0 | リリース済（現行契約） | `includeFileName` 廃止。ディレクトリは `splitPathFilename` の `pathOnly`。[specs](./specs/path-api.md) / [#26](https://github.com/b4moss/shardian/issues/26) |

## 配信版（現行契約 v0.4.0 を実装）

v1.0.0 は既存 path-api 契約（v0.4.0）に対する**安定稼働の宣言**であり、振る舞い変更はない（[#68](https://github.com/b4moss/shardian/issues/68)）。

| ポート | タグ / 版 | 置き場 |
|--------|-----------|--------|
| Node.js | `v1.0.0` / `@b4moss/shardian@1.0.0` | `packages/node` |
| Go | `packages/go/v1.0.0` | `packages/go` |
| PHP | `packages/php/v1.0.0` | `packages/php`（Packagist ミラー追従） |

## 将来（版未割当）

| 候補 | 状態 | メモ |
|------|------|------|
| （なし） | — | — |

完了（版未割当だった候補）:

| 候補 | 状態 | メモ |
|------|------|------|
| Go モジュール | 実装済 | [#14](https://github.com/b4moss/shardian/issues/14) / `packages/go` / 現行タグ `packages/go/v1.0.0` |
| PHP（Composer） | 実装済 | [#18](https://github.com/b4moss/shardian/issues/18) / `packages/php` / 現行タグ `packages/php/v1.0.0` |

----

以上
