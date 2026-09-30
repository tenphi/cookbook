---
title: Cookbook
description: リポジトリや公開済み npm パッケージから、製品に合ったテーマの静的な Astro ドキュメントサイトを作成します。
template: splash
seo:
  title: Cookbook — コードとともに保ち、製品に合わせて整えるドキュメント
hero:
  title: コードと同じ場所にあるドキュメント。
  tagline: Cookbook は Astro 向けのドキュメントツールキットです。リポジトリの Markdown や公開済み npm パッケージを、検索できる静的サイトに変換し、色、タイポグラフィ、コンポーネントを製品に合わせて調整できます。
  image:
    html: '<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 64 64" aria-hidden="true"><rect width="64" height="64" rx="14" fill="currentColor"/><path fill="#fff" d="M14.8 16c6.7.2 12.3 2 16.7 5.4v28.4c-4.4-3.1-10-4.7-16.6-4.9a3 3 0 0 1-2.9-3V19a3 3 0 0 1 2.8-3Z"/><path fill="#fff" d="M49.2 16c-6.7.2-12.3 2-16.7 5.4v28.4c4.4-3.1 10-4.7 16.6-4.9a3 3 0 0 0 2.9-3V19a3 3 0 0 0-2.8-3Z"/></svg>'
  actions:
    - text: 使い始める
      link: /ja/getting-started/
      variant: primary
    - text: ツールを比較（英語）
      link: /comparison/
      variant: secondary
sidebar:
  label: 概要
  order: 1
---

## 主な機能

- **既存のドキュメントをそのまま利用。** Markdown、MDX、ローカルアセットをリポジトリから直接読み込むか、バージョンと整合性を固定した npm パッケージからサイトを構築できます。[コンテンツソース](../content-sources.md)。
- **API リファレンスを生成。** ローカルの OpenAPI 仕様から、検索可能な概要と操作ごとのページを作成します。パラメータ、リクエストボディ、レスポンス、例を掲載できます。[OpenAPI リファレンス](../content-sources.md#openapi-references)。
- **検索を標準搭載。** Pagefind がページと見出しをローカルで索引化します。キーボードショートカットで検索を開き、検索用アセットは必要なときに読み込まれます。[検索](../site-navigation.md#search)。
- **ドキュメントの成長に対応するナビゲーション。** タブやグループ化したサイドバーでセクションを整理し、ページ内目次、前後のページへのリンク、モバイル用のナビゲーションドロワーを提供できます。[検索とナビゲーション](../site-navigation.md)。
- **技術文書用のコンポーネント。** MDX でタブ、注意書き、カード、手順、コードグループ、コピー操作付きのコードハイライト、隔離された対話的プレビューを使えます。[執筆用コンポーネント](../authoring.mdx)。
- **製品に合ったテーマ。** [Tasty](https://tasty.style) と [Glaze](https://glaze.tenphi.me) でブランドカラー、セマンティックなパレット、フォント、タイポグラフィ、コンポーネントの各パーツを設定できます。ライト、ダーク、高コントラストの各表示には、ビルド時に生成した静的 CSS が配信されます。[テーマとコンポーネント](../theme-and-components.md)。
- **言語とバージョン。** 翻訳ページやバージョン別のドキュメントを提供できます。切り替え先に対応するページがあれば、そのページへ移動します。[言語とバージョン](../site-navigation.md#contents-languages-and-versions)。
- **公開前の検証。** リンク切れ、アセットの欠落、重複したルート、無効なナビゲーションを、ソースの場所を示すエラーで検出します。事前生成した HTML は任意の静的ホストに公開できます。[品質チェック](../quality-checks.md)。
- **共有しやすく、読み取りやすいページ。** 正規 URL、ソーシャルプレビュー、サイトマップ、ダウンロード用 Markdown、コーディングエージェント向けの `llms.txt` 索引を公開できます。[公開メタデータ](../publishing.md)。

## リポジトリから始める

`README.md` または `docs/` ディレクトリがあるプロジェクトで、次を実行します。

```sh
npm create @tenphi/cookbook@latest docs-site -- --source . --yes
cd docs-site
npm run dev
```

Cookbook はファイルを現在の場所から読み込みます。[新しいサイトを作る](./getting-started.md)、[npm に公開されたファイルをそのまま文書化する](./getting-started.md)、[既存の Astro プロジェクトに追加する](./getting-started.md)方法もあります。

## このサイト自体が使用例

このページの原稿は [docs/ja/index.md](https://github.com/tenphi/cookbook/blob/main/docs/ja/index.md) にあります。小さな [Astro アプリ](https://github.com/tenphi/cookbook/tree/main/apps/reference) が、リポジトリの `docs/` ディレクトリを直接読み込んでサイトを構築します。ナビゲーション、検索、コード操作、編集リンク、Git の更新日時は、どの Cookbook サイトでも利用できます。

## ガイドを探す

- [はじめに](./getting-started.md)：リポジトリ、npm パッケージ、既存の Astro プロジェクト。
- [ドキュメントツールの比較](../comparison.md)：Cookbook のコンテンツとカスタマイズの考え方。
- [使用例](../examples.md)：リポジトリ、モノレポ、パッケージ、共有テーマ。
- [検索とナビゲーション](../site-navigation.md)：読者がページを見つける仕組み。
- [執筆](../authoring.mdx)：ページ、コンポーネント、対話的な例。
- [テーマとコンポーネント](../theme-and-components.md)：ブランド、トークン、フォント、組み込みスタイル、独自コンポーネント。
- [デプロイ](../deployment.md)：検証と静的ホスティング。

これ以外のドキュメントは現在英語で公開されています。[AI エージェント向けの手順](../ai-agents.md)、[設定リファレンス](../configuration.md)、[公開設定](../publishing.md)、[CLI リファレンス](../cli.md)も参照してください。
