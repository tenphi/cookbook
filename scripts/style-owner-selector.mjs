import assert from "node:assert/strict";

/** Match classes attached to the rendered owner, independent of content hashes. */
export function styleOwnerSelector(html, name) {
  const tag = [...html.matchAll(/<[a-z][^>]*>/gi)].find(
    (match) =>
      match[0].includes(`data-element="${name}"`) &&
      /\bclass="[^"]*\bt[0-9a-z]+\b/.test(match[0]),
  )?.[0];
  assert.ok(tag, `Missing ${name} style owner`);
  const classes = /\bclass="([^"]+)"/
    .exec(tag)?.[1]
    .split(/\s+/)
    .filter((name) => /^t[0-9a-z]+$/.test(name));
  assert.ok(classes?.length, `Missing generated classes for ${name}`);
  return `(?:${classes.map((name) => `\\.${name}\\.${name}`).join("|")})`;
}
