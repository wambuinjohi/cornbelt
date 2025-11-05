import path from "path";
import { createServer } from "./index";
import * as express from "express";
import path from "path";

const app = createServer();
const port = process.env.PORT || 3000;

// In production, serve the built client files
const __dirname = import.meta.dirname;
const distPath = path.resolve(__dirname, "..");

// Serve static files
app.use(express.static(distPath));

// Serve project-level assets folder (e.g., /assets/*)
const assetsPath = path.resolve(distPath, '..', 'assets');
app.use('/assets', express.static(assetsPath));

// Handle React Router - serve index.html for all non-API routes
// Express 5 uses path-to-regexp v8 which doesn't accept "*" as a path.
// Use a regex to match all non-API and non-health routes instead.
app.get(/^\/(?!api\/|health).*/, (_req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

app.listen(port, () => {
  console.log(`🚀 Fusion Starter server running on port ${port}`);
  console.log(`📱 Frontend: http://localhost:${port}`);
  console.log(`🔧 API: http://localhost:${port}/api`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("🛑 Received SIGTERM, shutting down gracefully");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("🛑 Received SIGINT, shutting down gracefully");
  process.exit(0);
});
