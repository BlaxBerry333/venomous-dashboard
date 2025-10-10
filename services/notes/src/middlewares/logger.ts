import type { FastifyInstance } from "fastify";

declare module "fastify" {
  interface FastifyRequest {
    requestStartTime?: number;
  }
}

/**
 * Gin-style request logger middleware
 * Logs HTTP requests in a colorful, readable format similar to Gin framework
 */
export const registerLoggerMiddleware = (app: FastifyInstance) => {
  // Store request start time
  app.addHook("onRequest", async (request) => {
    if (request.url === "/health") {
      // Skip logging for health checks
      return;
    }
    request.requestStartTime = Date.now();
  });

  // Log after response is sent
  app.addHook("onResponse", async (request, reply) => {
    if (request.url === "/health") {
      // Skip logging for health checks
      return;
    }

    const responseTime = Date.now() - (request.requestStartTime || Date.now());
    const timestamp = new Date().toLocaleString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });

    // Color codes for status
    const statusColor =
      reply.statusCode >= 500
        ? "\x1b[31m" // red
        : reply.statusCode >= 400
          ? "\x1b[33m" // yellow
          : reply.statusCode >= 300
            ? "\x1b[36m" // cyan
            : reply.statusCode >= 200
              ? "\x1b[32m" // green
              : "\x1b[0m"; // reset

    const resetColor = "\x1b[0m";
    const methodColor = "\x1b[35m"; // magenta

    // Format: [NOTES] 2023/01/01 - 12:00:00 | 200 | 12.345ms | 127.0.0.1 | GET /api/path
    console.log(
      `\x1b[34m[NOTES]${resetColor} ${timestamp} | ${statusColor}${reply.statusCode}${resetColor} | ${responseTime.toString().padStart(7)}ms | ${request.ip.padEnd(15)} | ${methodColor}${request.method.padEnd(7)}${resetColor} ${request.url}`,
    );
  });
};
