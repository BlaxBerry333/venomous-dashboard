import type { FastifyInstance } from "fastify";

import { articlesRoutes } from "./articles";
import { memosRoutes } from "./memos";

/**
 * Register all application routes
 */
export const registerRoutes = (app: FastifyInstance) => {
  // Health check
  app.get("/health", async () => {
    return { status: "ok", service: "notes", timestamp: new Date().toISOString() };
  });

  // Business routes
  app.register(memosRoutes, { prefix: "/memos" });
  app.register(articlesRoutes, { prefix: "/articles" });
};
