# shardian

ファイル名からシャード階層パス文字列を生成するライブラリ。

## 目的

ストレージや静的配信でよく使う、ファイル名プレフィックスによるディレクトリ分割パスを、言語横断で同じ契約で生成する。

## スコープ

### やること

- ファイル名・階層文字数・深さからシャードパス文字列（またはパス分割オブジェクト）を返す
- Node.js（Bun / Deno 互換、npm 配信）。Go / PHP は後続マイルストーン

### やらないこと

- ファイル I/O、ディレクトリ作成
- 暗号ハッシュやエンコード変換
- 永続化・アップロード・配信そのもの

## 技術方針

- パッケージライブラリ（薄い DDD の CRUD Trait は採用しない）
- 憲章（`docs/charter/`）に従う。独自例外は `docs/override-charter.md`
- 仕様正本の置き場は本ファイルおよび `docs/specs/`（未実装は `docs/plans/`）
- テスト仕様は `docs/tests/`

## 索引

| 文書 | 内容 |
|------|------|
| [roadmap.md](./roadmap.md) | マイルストーン |
| [specs/path-api.md](./specs/path-api.md) | パス生成 API（現行・v0.4.0） |
| [plans/README.md](./plans/README.md) | 未実装計画の索引 |
| [_archived/README.md](./_archived/README.md) | 旧契約・歴史資料 |
| [tests/shardian.md](./tests/shardian.md) | テスト仕様（現行） |

----

以上
