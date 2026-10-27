/**
 * Register UniAria's behaviors as `cb-*` light-DOM elements on server-rendered
 * markup. Cookbook's own elements keep the `cookbook-*` prefix.
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
defineElement(popover, { prefix: "cb" });
defineElement(dialog, { prefix: "cb" });

declare global {
  interface HTMLElementTagNameMap {
    "cb-popover": UniElement<typeof popover>;
    "cb-dialog": UniElement<typeof dialog>;
  }
}
