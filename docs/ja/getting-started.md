---
title: はじめに
description: ドキュメントサイトの作成、既存リポジトリの文書化、公開済み npm パッケージの利用方法を説明します。
sidebar:
  order: 2
---

Cookbook には Node.js 22.19 以降が必要です。

## 最初のサイトを作る

```sh
npm create @tenphi/cookbook@latest my-docs -- --yes
cd my-docs
npm run dev
```

作成ツールは README、Astro の設定、`docs.config.ts` を書き込み、依存パッケージをインストールします。コーディングエージェント向けの指示を記した `AGENTS.md` も作成します。ホームページを変えるには `README.md` を編集してください。`docs/guide.md` を追加すると `/guide` が作られます。新規・変更したページは、開発サーバーを再起動せずに反映されます。

## 既存のリポジトリを文書化する

リポジトリのルートで実行します。

```sh
npm create @tenphi/cookbook@latest docs-site -- --source . --yes
cd docs-site
npm run dev
```

生成された `docs.config.ts` は元のリポジトリを参照します。ルートの README がホームページになり、`docs/**/*.{md,mdx}` がほかのページになります。Cookbook はファイルをコピー・書き換えず、そのまま読み込みます。

依存パッケージをインストールする前にファイルだけ作るには、`--no-install` を指定します。対話なしのモードでは、空でない保存先の上書きを拒否します。

## 公開済みの npm パッケージを文書化する

```sh
npm create @tenphi/cookbook@latest my-package-docs -- \
  --package @scope/package@latest --yes
cd my-package-docs
npm run dev
```

作成ツールは実際に公開されたパッケージからドキュメントを見つけ、正確なバージョンと整合性情報を `cookbook.lock.json` に記録します。このファイルをコミットしてください。対象パッケージはインストールされず、ライフサイクルスクリプトも実行されません。指定したタグやバージョン範囲を再解決したい場合は、`npm run update` を実行します。

## 既存の Astro プロジェクトに追加する

Cookbook では Astro の `output: "static"` が必要です。プロジェクトで `output: "server"` を使っている場合は、ドキュメント用に別の静的 Astro プロジェクトを作成してください。

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

まずは[ブランド、ロゴ、フォントのレシピ](../recipes.md)をご覧ください。より細かなスタイル変更や新しいコンポーネントには、[カスタマイズのルール](../customization-rules.md)を参照してください。これらのルールと参照先は、インストールされる Cookbook パッケージにも含まれます。

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

`theme.fonts` を変更すると、[名前で指定する Google Fonts や独自のフォントファイル](../fonts-and-typography.md)を使えます。タイポグラフィの詳細には `theme.presets`、組み込み要素には `theme.styles`、新しい要素には `defineComponent()` と `theme.customStyles` を使用します。[テーマガイド](../theme-and-components.md)が出発点となり、[コンポーネントスタイルのリファレンス](../component-styles.md)にはカスタマイズ可能なすべてのパーツが載っています。

統合と CLI は同じ設定を読み込みます。対応するファイル名は優先順に `docs.config.ts`、`.mts`、`.js`、`.mjs` です。統合に明示した `config` オブジェクトが優先され、`configFile: false` で自動検出を無効にできます。標準以外の場所では `cookbook({ configFile: "./config/manual.ts" })` と `cookbook doctor --config ./config/manual.ts` を使用してください。

## モノレポのルート

`apps/docs/` 内のアプリから、リポジトリ全体のコンテンツを利用できます。

```ts
import { defineDocsConfig } from "@tenphi/cookbook/config";

export default defineDocsConfig({ root: "../.." });
```

`root` はドキュメント設定ファイルからの相対パスです。コンテンツ、ローカルアセット、`cookbook.lock.json` の場所を決めます。アプリのディレクトリで `npm run doctor` を実行すると、統合と同じリポジトリのルートが解決されます。複数パッケージを扱うサイトでは、ソースごとにルートを指定することもできます。

## 検証して公開する

```sh
npm run validate
npm run preview
```

ほかのガイドは現在英語で公開されています。[使用例](../examples.md)、[執筆用コンポーネント](../authoring.mdx)、[AI エージェントの作業手順](../ai-agents.md)、[デプロイ](../deployment.md)、[バージョン別のアップグレードガイド](../migration.md)を参照してください。設定例には[レシピ](../recipes.md)、検証に失敗した場合には[トラブルシューティング](../troubleshooting.md)が役立ちます。
