/** Pagefind's text clear button measures itself and writes inline padding.
 * Cookbook renders an icon and owns the reserved space in SearchResults.Input.
 * Fail on an upstream change so a dependency upgrade cannot silently restore it.
 */
export function adaptPagefindUI(source: string): string {
  const assignment = /input_el\.style\.paddingRight = `\$\{width \+ 2\}px`/g;
  const matches = [...source.matchAll(assignment)];
  if (matches.length !== 1)
    throw new Error(
      "Pagefind's UI sizing changed. Update Cookbook's Tasty adapter before upgrading @pagefind/default-ui.",
    );
  return source.replace(assignment, "undefined");
}
