import type { ComponentProps } from "react";
import {
  customizeComponent,
  tasty,
  type Styles,
} from "@tenphi/cookbook/styling";

const Button = customizeComponent(
  "ProjectButton",
  tasty({ as: "button", modProps: { busy: Boolean } }),
);

const buttonProps: ComponentProps<typeof Button> = {
  type: "submit",
  busy: true,
};
// @ts-expect-error Typed modifier props must survive customization.
const invalidButtonProps: ComponentProps<typeof Button> = { busy: "yes" };

function RequiredLabel(_props: { label: string; styles?: Styles }) {
  return null;
}
const Label = customizeComponent("ProjectLabel", RequiredLabel);
const labelProps: ComponentProps<typeof Label> = { label: "Docs" };
// @ts-expect-error Styling overrides do not supply required component props.
const missingLabelProps: ComponentProps<typeof Label> = {};

// @ts-expect-error Style values must retain Tasty's published types.
const invalidStyles: Styles = { padding: () => true };

void [
  buttonProps,
  invalidButtonProps,
  labelProps,
  missingLabelProps,
  invalidStyles,
];
