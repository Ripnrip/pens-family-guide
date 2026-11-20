import app from "./app.js";
import { SUBMISSION_PATH } from "./config.js";

const port = Number(process.env.PORT ?? 8787);

app.listen(port, () => {
  console.log(`PENS MCP server listening on http://localhost:${port}`);
  console.log(`  MCP endpoint:        http://localhost:${port}/mcp`);
  console.log(`  Submission endpoint: http://localhost:${port}${SUBMISSION_PATH}`);
  console.log(`  Previews:            http://localhost:${port}/preview`);
});
