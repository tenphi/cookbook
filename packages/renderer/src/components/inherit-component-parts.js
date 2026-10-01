/** Tasty wrappers forward styles but do not copy compound component exports. */
export function inheritComponentParts(base, extended) {
  for (const [name, part] of Object.entries(base)) {
    if (/^[A-Z]/.test(name)) extended[name] = part;
  }
  return extended;
}
