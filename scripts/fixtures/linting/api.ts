import plugin, {
  recommended,
  strict,
  validationConfig,
  type TastyValidationConfig,
  type ResolvedConfig,
  type StyleFunctionConfig,
} from "@tenphi/cookbook/eslint-plugin";
import rendererPlugin, {
  type StyleFunctionConfig as RendererStyleFunctionConfig,
} from "@tenphi/starlight/eslint-plugin";

export const helper: StyleFunctionConfig = {
  argument: "all",
  kind: "styles",
  partial: true,
};
export const rendererHelper: RendererStyleFunctionConfig = helper;
export const config: TastyValidationConfig = {
  ...validationConfig,
  styleFunctions: { ...validationConfig.styleFunctions, customMerge: helper },
};
export type Resolved = ResolvedConfig;
export const rules = { ...recommended, ...strict };
export const plugins = [plugin, rendererPlugin];
