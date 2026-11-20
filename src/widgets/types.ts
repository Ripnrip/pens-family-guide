import type { WidgetId } from "./ids.js";

export interface WidgetSource {
  id: WidgetId;
  title: string;
  /** Shown to the model via `openai/widgetDescription`. */
  description: string;
  css?: string;
  /** Client script; calls PENS.mount(fn). */
  script: string;
}
