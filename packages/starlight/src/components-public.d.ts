import type { AstroComponentFactory } from "astro/runtime/server/index.js";
import type {
  CardProps,
  LogoProps,
  PreviewProps,
  StepsProps,
  TabsProps,
  TabProps,
  CalloutProps,
  CodeGroupProps,
} from "./components/props.js";
export type * from "./components/props.js";
type Component<Props> = (props: Props) => ReturnType<AstroComponentFactory>;
export const Card: Component<CardProps>;
export const Logo: Component<LogoProps>;
export const Preview: Component<PreviewProps>;
export const Steps: Component<StepsProps>;
export const Tabs: Component<TabsProps>;
export const Tab: Component<TabProps>;
export const Callout: Component<CalloutProps>;
export const CodeGroup: Component<CodeGroupProps>;
