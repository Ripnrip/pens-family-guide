import { registerAppResource, registerAppTool } from "@modelcontextprotocol/ext-apps/server";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { TOOLS, executeTool, inputSchemaFor, toolAnnotations, toolMeta } from "./tools/index.js";
import { WIDGET_IDS, WIDGET_MIME_TYPE, WIDGETS, widgetHtml, widgetResourceMeta, widgetUri } from "./widgets/index.js";

export const SERVER_INFO = { name: "pens-tampa", title: "PENS", version: "0.2.0" };

const INSTRUCTIONS = [
  "Tools for families and providers of Pediatric Epilepsy & Neurology Specialists (PENS), a pediatric neurology practice serving Tampa Bay from Tampa, FL.",
  "General education only: never diagnose, interpret results, or give dosing or treatment advice. Refer clinical questions to the PENS office.",
  "Never ask for or repeat a child's name, birthdate, contact details, or medical record details.",
  "If the user describes an emergency (seizure 5+ minutes, not breathing, blue lips, won't wake, injury, first seizure, self-harm), tell them to call 911 now before anything else.",
  "Reply in the user's language (English or Spanish) and pass lang='es' for Spanish.",
].join(" ");

/**
 * Build a fresh MCP server with all PENS tools and widget resources registered the MCP Apps way
 * (ext-apps `registerAppResource` / `registerAppTool`), so widgets render in ChatGPT and Claude.
 */
export function createPensServer(): McpServer {
  const server = new McpServer(SERVER_INFO, { instructions: INSTRUCTIONS, capabilities: { tools: {}, resources: {} } });

  for (const id of WIDGET_IDS) {
    const uri = widgetUri(id);
    registerAppResource(
      server,
      WIDGETS[id].title,
      uri,
      { title: WIDGETS[id].title, description: WIDGETS[id].description, mimeType: WIDGET_MIME_TYPE, _meta: widgetResourceMeta(id) },
      async () => ({
        contents: [{ uri, mimeType: WIDGET_MIME_TYPE, text: widgetHtml(id), _meta: widgetResourceMeta(id) }],
      }),
    );
  }

  for (const def of TOOLS) {
    registerAppTool(
      server,
      def.name,
      {
        title: def.title,
        description: def.description,
        inputSchema: inputSchemaFor(def),
        annotations: toolAnnotations(def),
        _meta: toolMeta(def) as { ui: { resourceUri: string } },
      },
      async (args: Record<string, unknown>, extra: { _meta?: Record<string, unknown> }) =>
        executeTool(def, args, { meta: extra?._meta }),
    );
  }

  return server;
}
