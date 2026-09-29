---
type: Override
title: このプロジェクト独自のルール（憲章をオーバーライドする範囲）
description: 憲章より優先するプロジェクト固有ルール。
tags: [charter, override]
timestamp: 2026-08-19T02:18:29Z
---
# このプロジェクト独自のルール（憲章をオーバーライドする範囲）

ここに記述された内容は、憲章（`docs/charter/`）より優先される。

## 言語ポートごとの独立版

本リポジトリは言語ポートごとに **独立した SemVer** を持つ。共通の単一版番号は持たない。

| ポート | 版の正本 | Gitタグ | 配信 |
|--------|----------|---------|------|
| Node.js | `packages/node/package.json` | `vX.Y.Z`（リポジトリルート） | npm（`release` ブランチへ `packages/node/**` の変更が入ったとき） |
| Go | リリース意図（モジュールタグ） | `packages/go/vX.Y.Z` | Go Modules（タグのみ。npm は動かない） |
| PHP | `packages/php`（正本） | モノレポ: `packages/php/vX.Y.Z` → ミラー `b4moss/shardian-php`: `vX.Y.Z` | Packagist（ミラーリポを追従。登録は手動） |

- いずれか一方のポートだけ版を上げてよい
- Go / PHP だけの修正では Node の version / `v*` タグを触らない
- Node だけの修正では `packages/go/v*` / `packages/php/v*` タグを打たない
- PHP は `packages/php` を subtree split し [`b4moss/shardian-php`](https://github.com/b4moss/shardian-php) へ CD 同期する（`split-php` ワークフロー。`main` / `release` への push、および `packages/php/v*` タグ）
- タグを打つブランチは main（または出荷に使うコミットが乗っているブランチ）。詳細は CD ワークフローを正とする

## タグの切り方（補足）

憲章の [versioning-rule.md](./charter/versioning-rule.md) / [git-rule.md](./charter/git-rule.md) に加え、本リポジトリでは次を守る。

- Node: `vX.Y.Z` / Go: `packages/go/vX.Y.Z` / PHP: `packages/php/vX.Y.Z`（言語ポートごとに独立）
- PHP の Packagist 用タグはミラー [`b4moss/shardian-php`](https://github.com/b4moss/shardian-php) 上の `vX.Y.Z`（CD が `packages/php/v*` から同期）
- `release` は共通の出荷ブランチのまま。npm 公開は Node（`packages/node/**`）変更時のみ

----

以上
