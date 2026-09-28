export interface CardProps {
  title?: string;
  href?: string;
}
export interface LogoProps {
  label?: string;
  decorative?: boolean;
  class?: string;
}
export interface PreviewProps {
  title: string;
  html?: string;
  css?: string;
  javascript?: string;
}
export type StepsProps = Record<string, never>;
export interface TabsProps {
  label?: string;
}
export interface TabProps {
  label: string;
}
export interface CalloutProps {
  title?: string;
  kind?: "note" | "tip" | "caution" | "danger";
}
export interface CodeGroupProps {
  label?: string;
  items: Array<{ label: string; code: string; language?: string }>;
}
