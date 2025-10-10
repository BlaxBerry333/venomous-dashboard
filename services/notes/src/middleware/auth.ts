import type { FastifyRequest, FastifyReply } from "fastify";

// Extend FastifyRequest to include user information
declare module "fastify" {
  interface FastifyRequest {
    user?: {
      userId: string;
      email: string;
      role: string;
    };
  }
}

/**
 * Middleware to extract user information from request headers
 * These headers are injected by API Gateway after JWT verification
 */
export const extractUserMiddleware = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  // HTTP headers are case-insensitive, but different implementations may normalize differently
  // Try both uppercase and lowercase versions
  const userId = (request.headers["x-user-id"] || request.headers["X-User-ID"]) as string;
  const email = (request.headers["x-user-email"] || request.headers["X-User-Email"]) as string;
  const role = (request.headers["x-user-role"] || request.headers["X-User-Role"]) as string;

  // Defensive check: ensure request comes from API Gateway
  if (!userId) {
    console.error("[Auth Middleware] Missing X-User-ID header. Headers:", request.headers);
    return reply.status(401).send({
      success: false,
      error: {
        code: "UNAUTHORIZED",
        message: "Direct access denied. Please use API Gateway.",
      },
    });
  }

  // Attach user information to request object
  request.user = {
    userId,
    email,
    role,
  };
};
