/** Encode an SVG data URL that remains valid after Tasty lowercases styles. */
export function svgIconUrl(svg: string): string {
  const encoded = encodeURIComponent(svg).replace(
    /%[0-9A-F]{2}|[A-Z]/g,
    (token) =>
      token.startsWith("%")
        ? token.toLowerCase()
        : `%${token.charCodeAt(0).toString(16)}`,
  );
  return `data:image/svg+xml,${encoded}`;
}
