import cors from "@fastify/cors";
import type { FastifyInstance } from "fastify";

/**
 * Register CORS plugins
 */
export const registerCorsPlugin = (app: FastifyInstance) => {
  app.register(cors, {
    origin: true, // Allow all origins (adjust for production)
    credentials: true, // Allow credentials (cookies, authorization headers)
  });
};
