import {
  defineRouteMiddleware,
  type StarlightRouteData,
} from "@astrojs/starlight/route-data";
import { content } from "virtual:cookbook/config";
import { navigationPath } from "./navigation.js";

/** Run before ecosystem middleware, after Starlight validates its owned fields. */
export const onRequest = defineRouteMiddleware(async (context, next) => {
  const path = navigationPath(context.url.pathname, content.base);
  const source = content.entries.find((entry) => entry.route === path);
  if (source) {
    const entry = (context.locals as { starlightRoute: StarlightRouteData })
      .starlightRoute.entry;
    entry.data = { ...structuredClone(source.metadata), ...entry.data };
    entry.body = source.transformedBody;
    entry.filePath = source.absolutePath;
  }
  await next();
});
