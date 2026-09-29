---
title: Primeros pasos
description: Crea un sitio de documentación, documenta un repositorio existente o usa un paquete npm publicado.
sidebar:
  order: 2
---

Cookbook requiere Node.js 22.19 o una versión posterior.

## Crea tu primer sitio

```sh
npm create @tenphi/cookbook@latest my-docs -- --yes
cd my-docs
npm run dev
```

El creador genera un README, la configuración de Astro y `docs.config.ts`, e instala las dependencias. También escribe `AGENTS.md` con instrucciones para agentes de programación. Edita `README.md` para cambiar la página de inicio. Añade `docs/guide.md` para crear `/guide`. Las páginas nuevas o modificadas aparecen en el servidor de desarrollo sin reiniciarlo.

## Documenta un repositorio existente

Ejecuta estos comandos desde la raíz del repositorio:

```sh
npm create @tenphi/cookbook@latest docs-site -- --source . --yes
cd docs-site
npm run dev
```

El archivo `docs.config.ts` generado apunta a tu repositorio. El README de la raíz se convierte en la página de inicio y `docs/**/*.{md,mdx}` aporta las demás páginas. Cookbook lee esos archivos sin copiarlos ni modificarlos.

Usa `--no-install` para generar los archivos sin instalar las dependencias. En modo no interactivo, el creador se niega a sobrescribir un directorio de destino que no esté vacío.

## Documenta un paquete npm publicado

```sh
npm create @tenphi/cookbook@latest my-package-docs -- \
  --package @scope/package@latest --yes
cd my-package-docs
npm run dev
```

El creador descubre la documentación dentro del paquete publicado y guarda su versión exacta y su valor de integridad en `cookbook.lock.json`. Incluye este archivo en Git. El paquete documentado no se instala ni se ejecutan sus scripts. Ejecuta `npm run update` cuando quieras resolver de nuevo la etiqueta o el rango de versiones solicitado.

## Añádelo a un proyecto Astro existente

Cookbook requiere `output: "static"` en Astro. Si tu proyecto usa `output: "server"`, crea un proyecto Astro independiente para la documentación estática.

```sh
npx astro add @tenphi/cookbook
```

La configuración de Astro necesita una sola integración:

```ts
import { defineConfig } from "astro/config";
import cookbook from "@tenphi/cookbook";

export default defineConfig({ integrations: [cookbook()] });
```

Cookbook incluye su renderizador Astro y detecta `docs.config.ts` automáticamente. Sin configuración de documentación, usa las convenciones de README y `docs/`.

## Configura el sitio

Empieza con las [recetas completas de marca, logotipo y fuentes](../recipes.md). Para cambios de estilo más detallados o componentes nuevos, consulta las [reglas de personalización](../customization-rules.md). Estas reglas y las referencias originales también se incluyen en el paquete instalado de Cookbook.

Crea `docs.config.ts` junto a `astro.config.ts`:

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

Cambia `theme.fonts` para usar [Google Fonts por nombre o tus propios archivos de fuentes](../fonts-and-typography.md). Usa `theme.presets` para los detalles tipográficos, `theme.styles` para los elementos integrados y `defineComponent()` con `theme.customStyles` para añadir elementos. La [guía del tema](../theme-and-components.md) es un punto de partida; la [referencia de estilos de componentes](../component-styles.md) enumera todas las partes personalizables.

La integración y la CLI cargan la misma configuración. Se admiten `docs.config.ts`, `.mts`, `.js` y `.mjs`, en ese orden. Un objeto `config` explícito en la integración tiene prioridad; `configFile: false` desactiva la detección. Usa `cookbook({ configFile: "./config/manual.ts" })` y `cookbook doctor --config ./config/manual.ts` para una ubicación no estándar.

## Raíces de monorepositorios

Una aplicación en `apps/docs/` puede usar el contenido del repositorio con:

```ts
import { defineDocsConfig } from "@tenphi/cookbook/config";

export default defineDocsConfig({ root: "../.." });
```

`root` es relativo al archivo de configuración de la documentación. Determina dónde se encuentran el contenido, los recursos locales y `cookbook.lock.json`. Ejecuta `npm run doctor` desde el directorio de la aplicación: resolverá la misma raíz que la integración. Cada fuente también puede declarar su propia raíz para sitios con varios paquetes.

## Valida y publica

```sh
npm run validate
npm run preview
```

El resto de las guías se encuentra actualmente en inglés: [ejemplos](../examples.md), [componentes para redactar](../authoring.mdx), [flujo para agentes de IA](../ai-agents.md), [despliegue](../deployment.md) y [actualización entre versiones](../migration.md). Puedes partir de las [recetas](../recipes.md) para adaptar una configuración completa. Si falla la validación, consulta [solución de problemas](../troubleshooting.md).
