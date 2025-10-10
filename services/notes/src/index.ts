import cors from "@fastify/cors";
import Fastify from "fastify";
import { sql } from "drizzle-orm";
import { db } from "./database";
import { redis } from "./lib/redis";
import { articlesRoutes } from "./routes/articles";
import { memosRoutes } from "./routes/memos";

// ====================================================================================================
// Environment Variables Validation
// ====================================================================================================
const requiredEnvVars = ["DATABASE_URL", "REDIS_URL", "PORT"];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`❌ Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
}

console.log("✅ Environment variables validated");

// ====================================================================================================
// Fastify App Configuration
// ====================================================================================================
const app = Fastify({
  logger: {
    level: process.env.NODE_ENV === "development" ? "info" : "warn",
  },
  disableRequestLogging: false,
});

// Custom request logging that skips /health endpoint
app.addHook("onRequest", async (request) => {
  if (request.url === "/health") {
    // Skip logging for health checks
    return;
  }
  request.log.info({ url: request.url, method: request.method }, "incoming request");
});

// Register plugins
app.register(cors, {
  origin: true,
  credentials: true,
});

// Health check
app.get("/health", async () => {
  return { status: "ok", service: "notes", timestamp: new Date().toISOString() };
});

// Debug endpoint to check headers
app.get("/debug/headers", async (request) => {
  return {
    headers: request.headers,
    method: request.method,
    url: request.url,
  };
});

// Register routes
app.register(memosRoutes, { prefix: "/memos" });
app.register(articlesRoutes, { prefix: "/articles" });

// Start server
const PORT = Number.parseInt(process.env.PORT || "8200", 10);
const HOST = "0.0.0.0";

const start = async () => {
  try {
    await db.execute(sql`SELECT 1`);
    console.log("✅ Database connected");

    await redis.ping();
    console.log("✅ Redis connected");

    await app.listen({ port: PORT, host: HOST });
    console.log(`🚀 Notes service running on http://${HOST}:${PORT}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();

// Graceful shutdown
process.on("SIGTERM", async () => {
  await redis.quit();
  await app.close();
});
