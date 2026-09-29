---
title: Cookbook
description: Crea un sitio de documentación estático con Astro a partir de tu repositorio o de un paquete npm publicado, con un tema adaptado a tu producto.
template: splash
seo:
  title: Cookbook — documentación junto al código y adaptada a tu producto
hero:
  title: Documentación que permanece junto al código.
  tagline: Crea un sitio de documentación estático con Astro a partir de archivos Markdown de tu repositorio o de un paquete npm fijado, y adapta los colores, la tipografía y los componentes a tu producto.
  image:
    html: '<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 64 64" aria-hidden="true"><rect width="64" height="64" rx="14" fill="currentColor"/><path fill="#fff" d="M14.8 16c6.7.2 12.3 2 16.7 5.4v28.4c-4.4-3.1-10-4.7-16.6-4.9a3 3 0 0 1-2.9-3V19a3 3 0 0 1 2.8-3Z"/><path fill="#fff" d="M49.2 16c-6.7.2-12.3 2-16.7 5.4v28.4c4.4-3.1 10-4.7 16.6-4.9a3 3 0 0 0 2.9-3V19a3 3 0 0 0-2.8-3Z"/></svg>'
  actions:
    - text: Empezar
      link: /es/getting-started/
      variant: primary
    - text: Comparar herramientas (en inglés)
      link: /comparison/
      variant: secondary
sidebar:
  label: Introducción
  order: 1
---

## Empieza con tu repositorio

Ejecuta estos comandos en un proyecto que ya tenga un archivo `README.md` o un directorio `docs/`:

```sh
npm create @tenphi/cookbook@latest docs-site -- --source . --yes
cd docs-site
npm run dev
```

Cookbook lee los archivos donde ya están. También puedes [crear un sitio nuevo](./getting-started.md), [documentar exactamente los archivos publicados en npm](./getting-started.md) o [añadir Cookbook a un proyecto Astro](./getting-started.md).

## Este sitio es el ejemplo

Esta página procede de [docs/es/index.md](https://github.com/tenphi/cookbook/blob/main/docs/es/index.md). Una pequeña [aplicación Astro](https://github.com/tenphi/cookbook/tree/main/apps/reference) genera el sitio directamente desde el directorio `docs/` del repositorio. La navegación, la búsqueda, los controles de código, los enlaces de edición y las fechas de Git están disponibles para cualquier sitio Cookbook.

## Contenido y diseño a tu manera

### Conserva los archivos en su lugar

Usa los archivos Markdown y recursos locales de un repositorio sin copiarlos a un árbol de contenido de Astro. Cookbook también puede leer especificaciones OpenAPI o la documentación de un paquete npm fijado por versión e integridad. [Explora las fuentes de contenido](../content-sources.md).

### Adapta el aspecto del sitio

Empieza con un color de marca y configura paletas semánticas, fuentes, tipografía y partes de componentes mediante [Tasty](https://tasty.style) y [Glaze](https://glaze.tenphi.me). Las personalizaciones parciales de `theme.styles` se combinan con los valores predeterminados de Cookbook antes de extraer el CSS. El navegador recibe CSS estático. [Explora el tema](../theme-and-components.md).

### Detecta problemas antes de publicar

Los enlaces rotos, recursos ausentes, rutas duplicadas y errores de navegación detienen la validación con mensajes que indican el archivo de origen. El resultado es HTML prerenderizado con búsqueda local, listo para cualquier alojamiento estático. [Consulta el flujo de validación](../quality-checks.md).

## Explora la guía

- [Primeros pasos](./getting-started.md) explica cómo empezar con repositorios, paquetes npm y proyectos Astro existentes.
- [Comparación de herramientas](../comparison.md) describe el modelo de contenido y personalización de Cookbook.
- [Ejemplos](../examples.md) muestran configuraciones para repositorios, monorepos, paquetes y temas compartidos.
- [Búsqueda y navegación](../site-navigation.md) explica cómo encuentran los lectores las páginas.
- [Redacción](../authoring.mdx) cubre páginas, componentes y ejemplos interactivos.
- [Tema y componentes](../theme-and-components.md) introduce la marca y los tokens y enlaza con fuentes, estilos y componentes propios.
- [Despliegue](../deployment.md) cubre la validación y el alojamiento estático.

El resto de la documentación aún está disponible en inglés. Consulta también el [flujo para agentes de IA](../ai-agents.md), la [referencia de configuración](../configuration.md), las [opciones de publicación](../publishing.md) y la [referencia de la CLI](../cli.md).
