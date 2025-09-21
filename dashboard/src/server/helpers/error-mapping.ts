/**
 * Maps HTTP status codes to TRPC error codes
 */
export function mapHttpStatusToTRPCCode(statusCode: number): "UNAUTHORIZED" | "BAD_REQUEST" | "CONFLICT" | "INTERNAL_SERVER_ERROR" {
  switch (statusCode) {
    case 401:
      return "UNAUTHORIZED";
    case 400:
    case 422:
      return "BAD_REQUEST";
    case 409:
      return "CONFLICT";
    default:
      return "INTERNAL_SERVER_ERROR";
  }
}
