import { sql } from "drizzle-orm";
import Fastify from "fastify";

import { db } from "./database";
import { redis } from "./lib";
import { registerAuthMiddleware, registerLoggerMiddleware } from "./middlewares";
import { registerCorsPlugin } from "./plugins";
import { registerRoutes } from "./routes";

const PORT = Number.parseInt(process.env.PORT || "8200", 10);
const HOST = "0.0.0.0";

const app = Fastify({
  logger: false, // use custom Gin-style logger
  disableRequestLogging: true, // Disable automatic request logging
});

// Register middlewares
registerLoggerMiddleware(app);
registerAuthMiddleware(app);

// Register plugins
registerCorsPlugin(app);

// Register routes
registerRoutes(app);

// Start server
const start = async () => {
  try {
    await db.execute(sql`SELECT 1`);
    console.log("✅ Database connected");

    await redis.ping();
    console.log("✅ Redis connected");

    await app.listen({ port: PORT, host: HOST });
    console.log(`🚀 Notes service running on http://${HOST}:${PORT}`);
  } catch (err) {
    console.error("❌ Failed to start server:", err);
    process.exit(1);
  }
};

start();

// Graceful shutdown - cleanup resources when process is terminated
// This ensures no data loss and proper connection cleanup
const shutdown = async (signal: string) => {
  console.log(`\n📥 Received ${signal}, shutting down gracefully...`);
  try {
    await redis.quit();
    console.log("✅ Redis connection closed");

    await app.close();
    console.log("✅ HTTP server closed");

    process.exit(0);
  } catch (err) {
    console.error("❌ Error during shutdown:", err);
    process.exit(1);
  }
};

// Handle termination signals from Docker/Kubernetes
process.on("SIGTERM", () => shutdown("SIGTERM"));
// Handle Ctrl+C in terminal
process.on("SIGINT", () => shutdown("SIGINT"));
