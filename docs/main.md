# shardian

ファイル名からシャード階層パス文字列を生成するライブラリ。

## 目的

ストレージや静的配信でよく使う、ファイル名プレフィックスによるディレクトリ分割パスを、言語横断で同じ契約で生成する。

## スコープ

### やること

- ファイル名・階層文字数・深さ・末尾ファイル名の有無からパス文字列を返す
- Node.js（Bun / Deno 互換、npm 配信）と Go で同一の振る舞いを提供する

### やらないこと

- ファイル I/O、ディレクトリ作成
- 暗号ハッシュやエンコード変換
- 永続化・アップロード・配信そのもの

## 技術方針

- パッケージライブラリ（薄い DDD の CRUD Trait は採用しない）
- 憲章（`docs/charter/`）に従う。独自例外は `docs/override-charter.md`
- 仕様正本の置き場は本ファイルおよび `docs/plans/` → 実装後 `docs/specs/`
- テスト仕様は `docs/tests/`

## 索引

| 文書 | 内容 |
|------|------|
| [roadmap.md](./roadmap.md) | マイルストーン |
| [plans/README.md](./plans/README.md) | 未実装計画の索引 |
| [plans/v0.1.0/path-api.md](./plans/v0.1.0/path-api.md) | パス生成 API（v0.1.0） |
| [tests/shardian.md](./tests/shardian.md) | テスト仕様 |

----

以上
