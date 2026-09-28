/// <reference types="astro/client" />

declare namespace App {
  interface Locals {
    cookbookRoute: import("./route-context.js").CookbookRoute;
    t(key: string): string;
  }
}

declare module "*.astro" {
  const Component: unknown;
  export default Component;
}
