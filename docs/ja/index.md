---
title: Cookbook
description: リポジトリや公開済み npm パッケージから、製品に合ったテーマの静的な Astro ドキュメントサイトを作成します。
template: splash
seo:
  title: Cookbook — コードとともに保ち、製品に合わせて整えるドキュメント
hero:
  title: コードと同じ場所にあるドキュメント。
  tagline: リポジトリの Markdown やバージョンを固定した npm パッケージから静的な Astro ドキュメントサイトを作成し、色、タイポグラフィ、コンポーネントを製品に合わせて調整できます。
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

## コンテンツもデザインも自由に

### ソースファイルをそのまま使う

リポジトリの Markdown とローカルアセットを、Astro のコンテンツツリーへコピーせずに利用できます。OpenAPI 仕様や、バージョンと整合性を固定した npm パッケージ内のドキュメントも読み込めます。[コンテンツソースを見る](../content-sources.md)。

### 製品に合わせて外観を整える

ブランドカラーから始め、[Tasty](https://tasty.style) と [Glaze](https://glaze.tenphi.me) でセマンティックなパレット、フォント、タイポグラフィ、コンポーネントの名前付きパーツを設定できます。`theme.styles` の部分的な上書きは、CSS の抽出前に Cookbook の既定値と統合されます。ブラウザには静的な CSS が届きます。[テーマを見る](../theme-and-components.md)。

### 公開前に問題を検出する

リンク切れ、アセットの欠落、重複したルート、無効なナビゲーションは、原因となるソースファイルを示すエラーになります。出力はローカル検索を備えた事前生成 HTML で、どの静的ホストにも配置できます。[検証の流れを見る](../quality-checks.md)。

## ガイドを探す

- [はじめに](./getting-started.md)：リポジトリ、npm パッケージ、既存の Astro プロジェクト。
- [ドキュメントツールの比較](../comparison.md)：Cookbook のコンテンツとカスタマイズの考え方。
- [使用例](../examples.md)：リポジトリ、モノレポ、パッケージ、共有テーマ。
- [検索とナビゲーション](../site-navigation.md)：読者がページを見つける仕組み。
- [執筆](../authoring.mdx)：ページ、コンポーネント、対話的な例。
- [テーマとコンポーネント](../theme-and-components.md)：ブランド、トークン、フォント、組み込みスタイル、独自コンポーネント。
- [デプロイ](../deployment.md)：検証と静的ホスティング。

これ以外のドキュメントは現在英語で公開されています。[AI エージェント向けの手順](../ai-agents.md)、[設定リファレンス](../configuration.md)、[公開設定](../publishing.md)、[CLI リファレンス](../cli.md)も参照してください。
