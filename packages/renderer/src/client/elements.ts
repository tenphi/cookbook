/**
 * Register UniAria's behaviors as `cb-*` light-DOM elements on server-rendered
 * markup. Cookbook's own elements keep the `cookbook-*` prefix.
 */
import { dialog } from "@uniaria/core/dialog";
import { configure } from "@uniaria/core/dom";
import { popover } from "@uniaria/core/popover";
import type { UniElement } from "@uniaria/elements";
import { defineElement } from "@uniaria/elements";

// UniAria 0.2.0 types a definition's unset `owner` and `links` as
// `undefined`, which `exactOptionalPropertyTypes` rejects for the optional
// properties of `AnyDefinition`. Their values are `undefined` here.
type Behavior<Definition> = Omit<Definition, "owner" | "links">;
const popoverBehavior: Behavior<typeof popover> = popover;
const dialogBehavior: Behavior<typeof dialog> = dialog;

// Panels keep the placement Cookbook's styles give them; UniAria only links
// each one to its anchor and reads the side back.
configure({ positioning: "css" });
// Each returns undefined without `customElements` and skips a defined name.
defineElement(popoverBehavior, { prefix: "cb" });
defineElement(dialogBehavior, { prefix: "cb" });

declare global {
  interface HTMLElementTagNameMap {
    "cb-popover": UniElement<typeof popoverBehavior>;
    "cb-dialog": UniElement<typeof dialogBehavior>;
  }
}
