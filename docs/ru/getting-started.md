---
title: Начало работы
description: Создайте сайт документации, опишите существующий репозиторий или используйте опубликованный npm-пакет.
sidebar:
  order: 2
---

Для Cookbook требуется Node.js 22.19 или новее. Попросите агента программирования создать сайт или выполните команды сами.

## Попросите агента

Вставьте этот текст в Claude Code, Codex или другой агент программирования в своём репозитории:

```text
С помощью Cookbook создай сайт документации для этого репозитория
на основе нашего README и страниц из docs/. Проверь, что сайт
собирается, и расскажи, что проверено и что мне осталось решить.

Шаги Cookbook для агентов: https://cookbook.tenphi.me/agents/
```

Агент выполнит те же шаги, что описаны в разделах ниже. Сообщите ему публичный URL сайта, когда он будет известен. Запросы для следующих задач собраны на странице [Работа с агентом программирования](../ai-agents.md) (на английском).

## Создайте первый сайт

```sh
npm create @tenphi/cookbook@latest my-docs -- --yes
cd my-docs
npm run dev
```

Мастер создаст README, конфигурацию Astro и `docs.config.ts`, а затем установит зависимости. Он также создаст `AGENTS.md` с инструкциями для агентов программирования и `CLAUDE.md`, который импортирует их для Claude Code. Измените `README.md`, чтобы обновить главную страницу. Добавьте `docs/guide.md`, чтобы создать маршрут `/guide`. Новые и изменённые страницы появляются на сервере разработки без перезапуска.

## Опишите существующий репозиторий

Выполните команды из корня репозитория:

```sh
npm create @tenphi/cookbook@latest docs-site -- --source . --yes
cd docs-site
npm run dev
```

Созданный `docs.config.ts` ссылается на ваш репозиторий. Корневой README становится главной страницей, а `docs/**/*.{md,mdx}` — остальными страницами. Cookbook читает эти файлы без копирования или изменения.

С флагом `--yes` мастер ничего не спрашивает, поэтому не перезаписывает непустой целевой каталог. Флаги `--no-install`, `--brand`, `--site`, `--deploy` и остальные описаны в [справочнике CLI](../cli.md#creator-flags).

## Опишите опубликованный npm-пакет

```sh
npm create @tenphi/cookbook@latest my-package-docs -- \
  --package @scope/package@latest --yes
cd my-package-docs
npm run dev
```

Мастер находит документацию в опубликованном пакете и записывает его точную версию и контрольную сумму в `cookbook.lock.json`. Добавьте этот файл в Git. Документируемый пакет не устанавливается, а его скрипты не запускаются. Выполните `npm run update`, когда понадобится заново определить версию по указанному тегу или диапазону.

## Добавьте Cookbook в существующий проект Astro

Для Cookbook требуется Astro 7.3.2 или более поздняя версия 7.x и настройка Astro `output: "static"`. Если проект использует `output: "server"`, создайте отдельный статический проект Astro для документации.

```sh
npx astro add @tenphi/cookbook
```

В конфигурации Astro нужна одна интеграция:

```ts
import { defineConfig } from "astro/config";
import cookbook from "@tenphi/cookbook";

export default defineConfig({ integrations: [cookbook()] });
```

Cookbook включает собственный рендерер Astro и автоматически находит `docs.config.ts`. Без конфигурации документации он следует соглашениям для README и каталога `docs/`.

## Настройте сайт

Создайте `docs.config.ts` рядом с `astro.config.ts`:

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

В `theme.fonts` можно указать [Google Fonts по имени или собственные файлы шрифтов](../fonts-and-typography.md#change-font-families). Для типографики используйте `theme.presets`, для встроенных элементов — `theme.styles`, а для новых элементов — `defineComponent()` вместе с `theme.customStyles`. Начните с [руководства по теме](../theme-and-components.md); все настраиваемые части перечислены в [справочнике стилей компонентов](../component-styles.md).

Полные отправные точки собраны в [рецептах для фирменного стиля, логотипа и шрифтов](../recipes.md). Более глубокие изменения стилей и создание компонентов описаны в [правилах настройки](../customization-rules.md). Эти правила и ссылки на первоисточники также входят в установленный пакет Cookbook.

Другие имена файла конфигурации и способ хранить его в другом каталоге описаны в [справочнике конфигурации](../configuration.md#project-resolution-and-presets).

## Корневой каталог монорепозитория

Приложение в `apps/docs/` может использовать материалы всего репозитория:

```ts
import { defineDocsConfig } from "@tenphi/cookbook/config";

export default defineDocsConfig({ root: "../.." });
```

Значение `root` указывается относительно файла конфигурации документации. Оно определяет расположение контента, локальных ресурсов и `cookbook.lock.json`. Запустите `npm run doctor` из каталога приложения: команда найдёт тот же корень, что и интеграция. Для сайта с несколькими пакетами [каждый источник также может задать свой корень](../examples.md#monorepo-with-two-packages).

## Проверьте и опубликуйте

```sh
npm run validate
npm run preview
```

`validate` проверяет типы проекта, запускает `cookbook doctor`, собирает сайт и проверяет результат. Если проект настроен вручную, добавьте скрипты из [описания команд CLI](../cli.md) или запустите `npx @tenphi/cookbook doctor`. Затем разверните каталог `dist/`.

Остальные руководства пока доступны на английском языке: [примеры](../examples.md), [компоненты для подготовки материалов](../authoring.mdx), [работа с агентом программирования](../ai-agents.md), [развёртывание](../deployment.md) и [обновление между версиями](../migration.md). Если проверка завершилась ошибкой, см. [решение проблем](../troubleshooting.md).
