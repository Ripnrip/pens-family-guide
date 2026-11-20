import { z } from "zod";
import type { Lang } from "../content/types.js";
import type { WidgetId } from "../widgets/ids.js";

export interface ToolContext {
  lang: Lang;
  now: Date;
}

export interface ToolOutput {
  /** Becomes `structuredContent` (merged with the safety envelope). Visible to the model and the widget. */
  structured: Record<string, unknown>;
  /** Short text summary for the model / non-widget hosts (Claude). */
  text: string;
  /** Widget-only data (`_meta` on the result -> `window.openai.toolResponseMetadata`). Not shown to the model. */
  widgetMeta?: Record<string, unknown>;
}

export interface ToolDef<S extends z.ZodRawShape = z.ZodRawShape> {
  name: string;
  title: string;
  description: string;
  widget: WidgetId;
  /** Status strings shown by ChatGPT while/after the tool runs. */
  invoking: string;
  invoked: string;
  /** Whether the widget may call tools itself via window.openai.callTool. */
  widgetAccessible?: boolean;
  input: S;
  handler: (args: z.infer<z.ZodObject<S>>, ctx: ToolContext) => ToolOutput;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyToolDef = ToolDef<any>;

export function defineTool<S extends z.ZodRawShape>(def: ToolDef<S>): AnyToolDef {
  return def as AnyToolDef;
}

export const langParam = z
  .enum(["en", "es"])
  .optional()
  .describe("Response language: 'en' (English) or 'es' (Spanish). Omit to follow the user's language/locale.");

/** Free-text field. Never put names, birthdates, or medical record details in it. */
export const freeText = (description: string) =>
  z
    .string()
    .max(600)
    .describe(`${description} Do not include names, birthdates, contact details, or medical record information.`);
