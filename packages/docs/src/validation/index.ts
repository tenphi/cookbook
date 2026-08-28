import type { DocsDiagnostic, DocsGraph } from "../types.js";

export class DocsValidationError extends Error {
  readonly diagnostics: DocsDiagnostic[];

  constructor(diagnostics: DocsDiagnostic[]) {
    super(formatDiagnostics(diagnostics));
    this.name = "DocsValidationError";
    this.diagnostics = diagnostics;
  }
}

export function validateDocs(graph: DocsGraph): DocsDiagnostic[] {
  return [...graph.diagnostics];
}

export function assertValidDocs(graph: DocsGraph): void {
  const errors = graph.diagnostics.filter(
    (diagnostic) => diagnostic.severity === "error",
  );
  if (errors.length > 0) throw new DocsValidationError(errors);
}

export function formatDiagnostics(
  diagnostics: DocsDiagnostic[],
  json = false,
): string {
  if (json) return JSON.stringify(diagnostics, null, 2);
  return diagnostics
    .map((diagnostic) => {
      const location = diagnostic.file
        ? `${diagnostic.file}${diagnostic.line ? `:${diagnostic.line}` : ""}: `
        : "";
      const hint = diagnostic.hint ? `\n  hint: ${diagnostic.hint}` : "";
      return `${diagnostic.severity.toUpperCase()} ${diagnostic.code} ${location}${diagnostic.message}${hint}`;
    })
    .join("\n");
}
