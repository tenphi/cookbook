export function validateTableOfContents(value: unknown): string[] {
  if (value === false) return [];
  if (!value || typeof value !== "object" || Array.isArray(value))
    return ["tableOfContents must be false or an object."];
  const config = value as Record<string, unknown>;
  const errors: string[] = [];
  for (const key of Object.keys(config))
    if (!["minHeadingLevel", "maxHeadingLevel", "mobile"].includes(key))
      errors.push(`tableOfContents.${key} is not supported.`);
  for (const key of ["minHeadingLevel", "maxHeadingLevel"])
    if (
      config[key] !== undefined &&
      (!Number.isInteger(config[key]) ||
        Number(config[key]) < 1 ||
        Number(config[key]) > 6)
    )
      errors.push(`tableOfContents.${key} must be an integer from 1 to 6.`);
  if (config.mobile !== undefined && typeof config.mobile !== "boolean")
    errors.push("tableOfContents.mobile must be a boolean.");
  if (
    typeof config.minHeadingLevel === "number" &&
    typeof config.maxHeadingLevel === "number" &&
    config.minHeadingLevel > config.maxHeadingLevel
  )
    errors.push(
      "tableOfContents.minHeadingLevel cannot exceed maxHeadingLevel.",
    );
  return errors;
}
