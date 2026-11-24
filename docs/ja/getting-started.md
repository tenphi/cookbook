---
title: はじめに
description: ドキュメントサイトの作成、既存リポジトリの文書化、公開済み npm パッケージの利用方法を説明します。
sidebar:
  order: 2
---

Cookbook には Node.js 22.19 以降が必要です。サイトの作成はコーディングエージェントに依頼することも、自分でコマンドを実行することもできます。

## エージェントに依頼する

リポジトリで、Claude Code、Codex などのコーディングエージェントに次の内容を貼り付けます。

```text
Cookbook を使って、このリポジトリのドキュメントサイトを
README と docs/ のページから作成してください。サイトがビルドできることを
確認し、確認した内容と、私が決める必要があることを教えてください。

エージェント向けの Cookbook の手順: https://cookbook.tenphi.me/agents/
```

エージェントは以下のセクションと同じ手順で作業します。サイトの公開 URL が決まったら伝えてください。その後の作業に使えるプロンプトは [コーディングエージェントと作業する](../ai-agents.md)（英語）にまとめています。

## 最初のサイトを作る

```sh
npm create @tenphi/cookbook@latest my-docs -- --yes
cd my-docs
npm run dev
```

作成ツールは README、Astro の設定、`docs.config.ts` を書き込み、依存パッケージをインストールします。コーディングエージェント向けの指示を記した `AGENTS.md` と、それを Claude Code 向けに読み込む `CLAUDE.md` も作成します。ホームページを変えるには `README.md` を編集してください。`docs/guide.md` を追加すると `/guide` が作られます。新規・変更したページは、開発サーバーを再起動せずに反映されます。

## 既存のリポジトリを文書化する

リポジトリのルートで実行します。

```sh
npm create @tenphi/cookbook@latest docs-site -- --source . --yes
cd docs-site
npm run dev
```

生成された `docs.config.ts` は元のリポジトリを参照します。ルートの README がホームページになり、`docs/**/*.{md,mdx}` がほかのページになります。Cookbook はファイルをコピー・書き換えず、そのまま読み込みます。

`--yes` を指定すると作成ツールは確認を求めないため、空でない保存先の上書きを拒否します。`--no-install`、`--brand`、`--site`、`--deploy` などのオプションは、[作成ツールのフラグ](../cli.md#creator-flags)を参照してください。

## 公開済みの npm パッケージを文書化する

```sh
npm create @tenphi/cookbook@latest my-package-docs -- \
  --package @scope/package@latest --yes
cd my-package-docs
npm run dev
```

作成ツールは実際に公開されたパッケージからドキュメントを見つけ、正確なバージョンと整合性情報を `cookbook.lock.json` に記録します。このファイルをコミットしてください。対象パッケージはインストールされず、ライフサイクルスクリプトも実行されません。指定したタグやバージョン範囲を再解決したい場合は、`npm run update` を実行します。

## 既存の Astro プロジェクトに追加する

Cookbook には Astro 7.3.2 以降の 7.x と、Astro の `output: "static"` が必要です。プロジェクトで `output: "server"` を使っている場合は、ドキュメント用に別の静的 Astro プロジェクトを作成してください。

```sh
npx astro add @tenphi/cookbook
```

Astro の設定に必要な統合は一つだけです。

```ts
import { defineConfig } from "astro/config";
import cookbook from "@tenphi/cookbook";

export default defineConfig({ integrations: [cookbook()] });
```

Cookbook には Astro 用レンダラーが含まれ、`docs.config.ts` を自動検出します。ドキュメント設定がない場合は、README と `docs/` の規約を使用します。

## サイトを設定する

`astro.config.ts` と同じ場所に `docs.config.ts` を作成します。

```ts
import { defineDocsConfig } from "@tenphi/cookbook/config";

export default defineDocsConfig({
  site: {
    title: "Example Project",
    description: "Documentation for Example Project",
    repository: "https://github.com/example/project",
  },
  theme: {
    brand: { from: "#2f5bff" },
    fonts: { body: "Inter", heading: "Newsreader" },
  },
});
```

`theme.fonts` を変更すると、[名前で指定する Google Fonts や独自のフォントファイル](../fonts-and-typography.md#change-font-families)を使えます。タイポグラフィの詳細には `theme.presets`、組み込み要素には `theme.styles`、新しい要素には `defineComponent()` と `theme.customStyles` を使用します。[テーマガイド](../theme-and-components.md)が出発点となり、[コンポーネントスタイルのリファレンス](../component-styles.md)にはカスタマイズ可能なすべてのパーツが載っています。

完全な出発点として[ブランド、ロゴ、フォントのレシピ](../recipes.md)を用意しています。より細かなスタイル変更や新しいコンポーネントには、[カスタマイズのルール](../customization-rules.md)を参照してください。これらのルールと参照先は、インストールされる Cookbook パッケージにも含まれます。

ほかに使える設定ファイル名と、設定ファイルを別の場所に置く方法は、[設定リファレンス](../configuration.md#project-resolution-and-presets)を参照してください。

## モノレポのルート

`apps/docs/` 内のアプリから、リポジトリ全体のコンテンツを利用できます。

```ts
import { defineDocsConfig } from "@tenphi/cookbook/config";

export default defineDocsConfig({ root: "../.." });
```

`root` はドキュメント設定ファイルからの相対パスです。コンテンツ、ローカルアセット、`cookbook.lock.json` の場所を決めます。アプリのディレクトリで `npm run doctor` を実行すると、統合と同じリポジトリのルートが解決されます。複数パッケージを扱うサイトでは、[ソースごとにルートを指定する](../examples.md#monorepo-with-two-packages)こともできます。

## 検証して公開する

```sh
npm run validate
npm run preview
```

`validate` はプロジェクトの型チェック、`cookbook doctor`、サイトのビルド、出力の検証を行います。自分で構成したプロジェクトでは、[CLI コマンド](../cli.md)に記載されたスクリプトを追加するか、`npx @tenphi/cookbook doctor` を実行してください。その後、`dist/` ディレクトリをデプロイします。

ほかのガイドは現在英語で公開されています。[使用例](../examples.md)、[執筆用コンポーネント](../authoring.mdx)、[コーディングエージェントとの作業](../ai-agents.md)、[デプロイ](../deployment.md)、[バージョン別のアップグレードガイド](../migration.md)を参照してください。検証に失敗した場合は[トラブルシューティング](../troubleshooting.md)を参照してください。
