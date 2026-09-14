import {
  tasty,
  type ElementsDefinition,
  type ModPropsInput,
  type StylesInterface,
  type SubElementProps,
  type TastyElementOptions,
  type TastyPolymorphicComponent,
  type TokenPropsInput,
  type VariantMap,
} from "@tenphi/tasty";
import type {
  ElementType,
  ForwardRefExoticComponent,
  JSX,
  PropsWithoutRef,
  RefAttributes,
} from "react";
import { resolveComponentStyles } from "./components/component-styles.js";

type SubElementTag<Definition extends ElementsDefinition[string]> =
  Definition extends string
    ? Definition
    : Definition extends { as?: infer Tag }
      ? Tag extends keyof JSX.IntrinsicElements
        ? Tag
        : "div"
      : "div";

// Use public Tasty types so declarations do not leak its private sub-element aliases.
type SubElements<E extends ElementsDefinition> = {
  [Name in keyof E]: ForwardRefExoticComponent<
    PropsWithoutRef<SubElementProps<SubElementTag<E[Name]>>> &
      RefAttributes<
        SubElementTag<E[Name]> extends keyof HTMLElementTagNameMap
          ? HTMLElementTagNameMap[SubElementTag<E[Name]>]
          : unknown
      >
  >;
};

/** Create a named Tasty component with theme.styles[name] merged into its defaults. */
export function defineComponent<
  K extends readonly (keyof StylesInterface)[],
  V extends VariantMap,
  E extends ElementsDefinition = Record<string, never>,
  AsType extends ElementType = "div",
  M extends ModPropsInput = readonly never[],
  TP extends TokenPropsInput = readonly never[],
>(
  name: string,
  options: TastyElementOptions<K, V, E, AsType, M, TP>,
): TastyPolymorphicComponent<AsType, K, V, M, TP> & SubElements<E> {
  return tasty<K, V, E, AsType, M, TP>({
    ...options,
    styles: resolveComponentStyles(name, options.styles ?? {}),
  }) as TastyPolymorphicComponent<AsType, K, V, M, TP> & SubElements<E>;
}
