import {
  tasty,
  type ElementsDefinition,
  type ModPropsInput,
  type StylesInterface,
  type Styles,
  type SubElementProps,
  type TastyElementOptions,
  type TastyPolymorphicComponent,
  type TokenPropsInput,
  type VariantMap,
} from "@tenphi/tasty";
import type {
  ComponentProps,
  ComponentType,
  ElementType,
  ForwardRefExoticComponent,
  JSX,
  PropsWithoutRef,
  RefAttributes,
} from "react";
import { resolveComponentStyles } from "./components/component-styles.js";
import { inheritComponentParts } from "./components/inherit-component-parts.js";

type InheritedParts<C> = {
  [
    Name in keyof C as Name extends string
      ? Name extends Capitalize<Name>
        ? C[Name] extends ComponentType<any>
          ? Name
          : never
        : never
      : never
  ]: C[Name];
};

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

/** Extend a component's styles and defaults, preserving its props and compound parts. */
export function extendComponent<C extends ComponentType<any>>(
  name: string,
  base: C,
  options: Partial<Omit<ComponentProps<C>, "as" | "styles">> & {
    styles?: Styles;
  },
): ComponentType<ComponentProps<C>> & InheritedParts<C> {
  const extended = tasty(base, {
    ...options,
    styles: resolveComponentStyles(name, options.styles ?? {}),
  });
  // Tasty's wrapper type erases compound exports and makes every prop optional.
  // Restore the copied parts and conservatively keep the base's required props.
  return inheritComponentParts(base, extended) as unknown as ComponentType<
    ComponentProps<C>
  > &
    InheritedParts<C>;
}

/** Create a named Tasty component with theme.customStyles[name] merged into its defaults. */
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
