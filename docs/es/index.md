---
title: Cookbook
description: Crea un sitio de documentación estático con Astro a partir de tu repositorio o de un paquete npm publicado, con un tema adaptado a tu producto.
template: splash
seo:
  title: Cookbook — documentación junto al código y adaptada a tu producto
hero:
  title: Documentación que permanece junto al código.
  tagline: Cookbook es un kit de herramientas de documentación para Astro. Convierte el Markdown de tu repositorio o un paquete npm publicado en un sitio estático con búsqueda, y adapta los colores, la tipografía y los componentes a tu producto.
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

## Qué incluye

- **Usa la documentación que ya tienes.** Lee Markdown, MDX y recursos locales directamente desde tu repositorio, o genera el sitio a partir de un paquete npm fijado por versión e integridad. [Fuentes de contenido](../content-sources.md).
- **Genera una referencia de API.** Convierte una especificación OpenAPI local en un resumen con búsqueda y una página por operación, con parámetros, cuerpos de petición, respuestas y ejemplos. [Referencias OpenAPI](../content-sources.md#openapi-references).
- **Búsqueda integrada.** Pagefind indexa las páginas y los encabezados localmente, con un atajo de teclado y recursos de búsqueda que se cargan cuando hacen falta. [Búsqueda](../site-navigation.md#search).
- **Navegación para documentación que crece.** Organiza secciones con pestañas y barras laterales agrupadas, añade índices de página y enlaces anterior/siguiente, y ofrece un menú de navegación móvil. [Búsqueda y navegación](../site-navigation.md).
- **Componentes para documentación técnica.** Usa pestañas, avisos, tarjetas, pasos, grupos de código, código resaltado con controles de copia y ejemplos interactivos aislados en MDX. [Componentes de contenido](../authoring.mdx).
- **Un tema adaptado a tu producto.** Configura colores de marca, paletas semánticas, fuentes, tipografía y partes de componentes con [Tasty](https://tasty.style) y [Glaze](https://glaze.tenphi.me). Los modos claro, oscuro y de alto contraste reciben CSS estático generado durante la compilación. [Tema y componentes](../theme-and-components.md).
- **Idiomas y versiones.** Ofrece páginas traducidas y documentación versionada, con selectores que llevan a la página equivalente cuando existe. [Idiomas y versiones](../site-navigation.md#contents-languages-and-versions).
- **Comprobaciones antes de publicar.** Detecta enlaces rotos, recursos ausentes, rutas duplicadas y navegación inválida con errores que señalan el archivo de origen. Publica HTML prerenderizado en cualquier alojamiento estático. [Comprobaciones de calidad](../quality-checks.md).
- **Páginas listas para compartir y leer.** Publica URL canónicas, vistas previas para redes sociales, mapas del sitio, Markdown descargable y un índice `llms.txt` para agentes de programación. [Metadatos de publicación](../publishing.md).

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

## Explora la guía

- [Primeros pasos](./getting-started.md) explica cómo empezar con repositorios, paquetes npm y proyectos Astro existentes.
- [Comparación de herramientas](../comparison.md) describe el modelo de contenido y personalización de Cookbook.
- [Ejemplos](../examples.md) muestran configuraciones para repositorios, monorepos, paquetes y temas compartidos.
- [Búsqueda y navegación](../site-navigation.md) explica cómo encuentran los lectores las páginas.
- [Redacción](../authoring.mdx) cubre páginas, componentes y ejemplos interactivos.
- [Tema y componentes](../theme-and-components.md) introduce la marca y los tokens y enlaza con fuentes, estilos y componentes propios.
- [Despliegue](../deployment.md) cubre la validación y el alojamiento estático.

El resto de la documentación aún está disponible en inglés. Consulta también el [flujo para agentes de IA](../ai-agents.md), la [referencia de configuración](../configuration.md), las [opciones de publicación](../publishing.md) y la [referencia de la CLI](../cli.md).
