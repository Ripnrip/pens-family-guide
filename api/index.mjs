// Vercel serverless entry. `npm run build` (vercel.json buildCommand) compiles src/ -> dist/.
// The Express app is exported as the request handler.
import app from "../dist/app.js";

export default app;
