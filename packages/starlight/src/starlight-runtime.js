import { register as registerLoader } from "node:module";
import { register } from "tsx/esm/api";

const rawLoaderSource = `
  import { readFile } from 'node:fs/promises';
  export async function load(url, context, nextLoad) {
    if (url.includes('.jsonc')) {
      const file = new URL(url.split('?')[0]);
      const contents = await readFile(file, 'utf8');
      return { format: 'module', source: 'export default ' + JSON.stringify(contents), shortCircuit: true };
    }
    return nextLoad(url, context);
  }
`;
registerLoader(
  `data:text/javascript,${encodeURIComponent(rawLoaderSource)}`,
  import.meta.url,
);
const unregister = register();
const [{ default: starlight }, { docsSchema }] = await Promise.all([
  import("@astrojs/starlight"),
  import("@astrojs/starlight/schema"),
]);
unregister();

export { docsSchema };
export default starlight;
