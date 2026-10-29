/**
 * Register UniAria's behaviors as `cookbook-*` light-DOM elements, using the
 * same prefix as every other Cookbook-owned custom element.
 */
import { dialog } from "@uniaria/core/dialog";
import { configure } from "@uniaria/core/dom";
import { popover } from "@uniaria/core/popover";
import type { UniElement } from "@uniaria/elements";
import { defineElement } from "@uniaria/elements";

// Panels keep the placement Cookbook's styles give them; UniAria only links
// each one to its anchor and reads the side back.
configure({ positioning: "css" });
// Each returns undefined without `customElements` and skips a defined name.
defineElement(popover, { prefix: "cookbook" });
defineElement(dialog, { prefix: "cookbook" });

declare global {
  interface HTMLElementTagNameMap {
    "cookbook-popover": UniElement<typeof popover>;
    "cookbook-dialog": UniElement<typeof dialog>;
  }
}
