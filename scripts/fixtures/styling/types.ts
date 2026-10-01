import type { ComponentProps } from "react";
import {
  Button as CookbookButton,
  defineComponent,
  extendComponent,
  tasty,
  type Styles,
} from "@tenphi/cookbook/styling";

const Button = defineComponent("ProjectButton", {
  as: "button",
  modProps: { busy: Boolean },
  tokenProps: { progress: "$progress" },
  styleProps: ["padding"],
  variants: {
    primary: { color: "#accent-text" },
    secondary: { color: "#text" },
  },
  elements: { Label: "span", Link: "a" },
});

const buttonProps: ComponentProps<typeof Button> = {
  type: "submit",
  busy: true,
  progress: 0.5,
  padding: "1x",
  variant: "primary",
};
// @ts-expect-error Typed modifier props must survive customization.
const invalidButtonProps: ComponentProps<typeof Button> = { busy: "yes" };
const invalidVariantProps: ComponentProps<typeof Button> = {
  // @ts-expect-error Variants must retain their defined names.
  variant: "unknown",
};
// @ts-expect-error HTML button attributes must retain their types.
const invalidHtmlProps: ComponentProps<typeof Button> = { type: "unknown" };
const linkProps: ComponentProps<typeof Button.Link> = { href: "/docs/" };
// @ts-expect-error Generated subcomponents must retain their HTML attribute types.
const invalidLinkProps: ComponentProps<typeof Button.Link> = { href: 42 };
// @ts-expect-error Only declared subcomponents should be available.
const missingPart = Button.Missing;
const DerivedButton = extendComponent("DerivedButton", Button, {
  variant: "primary",
  styles: { padding: "2x", Label: { color: "#text" } },
});
const derivedProps: ComponentProps<typeof DerivedButton> = buttonProps;
const derivedLinkProps: ComponentProps<typeof DerivedButton.Link> = linkProps;
const invalidDerivedProps: ComponentProps<typeof DerivedButton> = {
  // @ts-expect-error Inheritance must preserve typed modifier props.
  busy: "yes",
};
const invalidDerivedPart: ComponentProps<typeof DerivedButton.Link> = {
  // @ts-expect-error Inheritance must preserve typed compound parts.
  href: 42,
};
// @ts-expect-error Factory-only settings are not supported by Tasty wrapping.
extendComponent("InvalidExtension", Button, { elements: { Icon: "svg" } });
const ProjectButton = extendComponent("SharedButton", CookbookButton, {
  styles: { padding: "1x", fill: "#surface" },
});
const sharedButtonProps: ComponentProps<typeof ProjectButton> = {
  type: "submit",
};
const Svg = defineComponent("ProjectIcon", { as: "svg" });
const svgProps: ComponentProps<typeof Svg> = { viewBox: "0 0 24 24" };

function RequiredLabel(_props: { label: string; styles?: Styles }) {
  return null;
}
const Label = defineComponent("ProjectLabel", { as: RequiredLabel });
const labelProps: ComponentProps<typeof Label> = { label: "Docs" };
// @ts-expect-error Styling overrides do not supply required component props.
const missingLabelProps: ComponentProps<typeof Label> = {};
const DerivedLabel = extendComponent("DerivedLabel", Label, {
  styles: { padding: "1x" },
});
const derivedLabelProps: ComponentProps<typeof DerivedLabel> = {
  label: "Docs",
};
// @ts-expect-error Extension does not remove required props from the base.
const missingDerivedLabelProps: ComponentProps<typeof DerivedLabel> = {};

// @ts-expect-error Style values must retain Tasty's published types.
const invalidStyles: Styles = { padding: () => true };

const Unnamed = tasty({ as: "a" });
const unnamedProps: ComponentProps<typeof Unnamed> = { href: "/" };

void [
  buttonProps,
  invalidButtonProps,
  invalidVariantProps,
  invalidHtmlProps,
  linkProps,
  invalidLinkProps,
  missingPart,
  derivedProps,
  derivedLinkProps,
  invalidDerivedProps,
  invalidDerivedPart,
  sharedButtonProps,
  svgProps,
  labelProps,
  missingLabelProps,
  derivedLabelProps,
  missingDerivedLabelProps,
  invalidStyles,
  unnamedProps,
];
