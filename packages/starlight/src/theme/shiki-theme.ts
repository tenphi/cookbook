const comment = "var(--syntax-comment-color)";
const punctuation = "var(--syntax-punctuation-color)";
const keyword = "var(--syntax-keyword-color)";
const string = "var(--syntax-string-color)";
const token = "var(--syntax-token-color)";
const property = "var(--syntax-property-color)";
const number = "var(--syntax-number-color)";
const func = "var(--syntax-function-color)";
const value = "var(--syntax-value-color)";
const operator = "var(--syntax-operator-color)";
const foreground = "var(--syntax-text-color)";
const background = "var(--syntax-bg-color)";

type HighlightToken = {
  content: string;
  offset: number;
  color?: string;
};

const shellLanguages = new Set(["bash", "sh", "shell", "shellscript", "zsh"]);
const shellPlaceholder = /<[A-Za-z][A-Za-z0-9_-]*>/g;

/**
 * Shell grammars interpret documentation placeholders such as `<plan-id>` as
 * redirections and can split the final character into an unscoped token. Keep
 * the placeholder name visually coherent while retaining the operator color
 * on the angle brackets.
 */
const bashPlaceholderTransformer = {
  name: "cookbook:bash-placeholders",
  enforce: "post" as const,
  tokens(
    this: { source: string; options: { lang?: string } },
    lines: HighlightToken[][],
  ): HighlightToken[][] | undefined {
    if (!this.options.lang || !shellLanguages.has(this.options.lang)) return;
    const ranges = [...this.source.matchAll(shellPlaceholder)].map((match) => ({
      start: (match.index ?? 0) + 1,
      end: (match.index ?? 0) + match[0].length - 1,
    }));
    if (ranges.length === 0) return;

    for (const line of lines) {
      for (const highlighted of line) {
        const start = highlighted.offset;
        const end = start + highlighted.content.length;
        if (ranges.some((range) => start < range.end && end > range.start)) {
          highlighted.color = string;
        }
      }
    }
    return lines;
  },
};

/**
 * Astro loads fenced-code grammars lazily. MDX embeds TSX, but loading MDX by
 * itself leaves that embedded grammar unavailable and produces partially
 * highlighted imports and JSX. Preload TSX while preserving consumer-supplied
 * languages and transformers.
 */
export function cookbookShikiConfig(
  config: Record<string, unknown> | undefined,
): Record<string, unknown> {
  const languages = Array.isArray(config?.langs) ? [...config.langs] : [];
  const transformers = Array.isArray(config?.transformers)
    ? config.transformers
    : [];
  const hasTsx = languages.some(
    (language) =>
      language === "tsx" ||
      (typeof language === "object" &&
        language !== null &&
        "name" in language &&
        language.name === "tsx"),
  );

  return {
    ...config,
    langs: hasTsx ? languages : [...languages, "tsx"],
    theme: tastyCodeTheme,
    transformers: transformers.includes(bashPlaceholderTransformer)
      ? transformers
      : [...transformers, bashPlaceholderTransformer],
  };
}

/**
 * Shiki performs the grammatical classification, while every emitted color
 * remains a reference to a Glaze-generated token owned by Tasty.
 */
const tastyCodeTheme = {
  name: "tasty-code",
  type: "light" as const,
  fg: foreground,
  bg: background,
  colors: {
    "editor.background": background,
    "editor.foreground": foreground,
  },
  settings: [
    {
      scope: [
        "comment",
        "comment.line",
        "comment.block",
        "punctuation.definition.comment",
      ],
      settings: { foreground: comment, fontStyle: "italic" },
    },
    {
      scope: [
        "keyword",
        "keyword.control",
        "keyword.other",
        "storage.type",
        "storage.modifier",
        "keyword.control.at-rule.tasty",
        "keyword.control.at-rule.media.tasty",
        "keyword.control.at-rule.media-type.tasty",
        "keyword.control.at-rule.starting.tasty",
        "keyword.control.state-alias.tasty",
      ],
      settings: { foreground: keyword },
    },
    {
      scope: [
        "string",
        "string.quoted",
        "string.template",
        "string.quoted.attribute-value.tasty",
        "string.unquoted.attribute-value.tasty",
      ],
      settings: { foreground: string },
    },
    {
      scope: [
        "support.constant.color.tasty-token",
        "support.constant.color.tasty-token.builtin",
        "constant.other.color.tasty-token",
        "constant.other.color.tasty",
        "constant.other.color.hex",
        "constant.other.color.rgb-value",
      ],
      settings: { foreground: token },
    },
    {
      scope: [
        "constant.numeric",
        "constant.numeric.tasty",
        "constant.numeric.custom-unit.tasty",
        "constant.numeric.css-with-unit",
        "constant.numeric.bare.tasty",
        "constant.numeric.css",
        "constant.numeric.keyframe-step.tasty",
        "constant.language.boolean.tasty",
      ],
      settings: { foreground: number },
    },
    {
      scope: [
        "support.type.property-name.tasty",
        "variable.other.constant.tasty",
      ],
      settings: { foreground: property },
    },
    {
      scope: ["variable", "variable.other"],
      settings: { foreground },
    },
    {
      scope: [
        "entity.name.function",
        "support.function",
        "support.function.misc.css",
        "entity.name.tag",
        "entity.name.tag.tsx",
        "entity.name.type.tasty",
        "entity.name.tag.tasty",
      ],
      settings: { foreground: func },
    },
    {
      scope: [
        "support.constant.property-value.tasty",
        "support.constant.property-value.tasty-display",
        "support.constant.property-value.tasty-directional",
        "support.constant.property-value.tasty-preset",
        "support.constant.property-value.tasty-shape",
        "support.constant.property-value.tasty-scrollbar",
        "support.constant.property-value.tasty-state",
        "support.constant.property-value.tasty-cursor",
        "support.constant.property-value.tasty-overflow",
        "support.constant.property-value.tasty-position",
        "support.constant.property-value.tasty-flex",
        "support.constant.property-value.tasty-font",
        "support.constant.property-value.tasty-text",
        "support.constant.property-value.tasty-alignment",
        "support.constant.property-value.tasty-border-style",
        "support.constant.property-value.tasty-whitespace",
        "support.constant.property-value.tasty-global",
        "support.constant.property-value.tasty-transition",
        "support.constant.property-value.css-syntax",
        "entity.other.attribute-name",
        "entity.other.attribute-name.tasty",
        "entity.other.attribute-name.pseudo-class.tasty",
        "entity.other.attribute-name.pseudo-class.css",
        "entity.other.attribute-name.class.tasty",
        "entity.other.attribute-name.pseudo-element.css",
        "punctuation.definition.entity.css",
      ],
      settings: { foreground: value },
    },
    {
      scope: [
        "keyword.operator",
        "keyword.operator.logical.tasty",
        "keyword.operator.arithmetic.css",
        "keyword.operator.assignment",
        "keyword.operator.selector-affix.tasty",
        "keyword.operator.attribute-selector.tasty",
        "keyword.operator.comparison.tasty",
      ],
      settings: { foreground: operator },
    },
    {
      scope: [
        "punctuation.definition.string",
        "punctuation.separator",
        "punctuation.definition.block",
        "punctuation.definition.array",
        "punctuation.section",
        "punctuation.definition.auto-calc",
        "punctuation.definition.attribute-selector",
        "punctuation.definition.pseudo-class",
        "punctuation.definition.fallback",
        "meta.brace",
      ],
      settings: { foreground: punctuation },
    },
    {
      scope: ["keyword.control.at-rule", "entity.name.tag.class.css"],
      settings: { foreground: keyword },
    },
    {
      scope: ["support.type.property-name.css", "meta.property-name.css"],
      settings: { foreground: property },
    },
  ],
};
