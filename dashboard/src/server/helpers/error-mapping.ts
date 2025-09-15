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

/**
 * Parses error response from auth service and extracts error code
 */
export async function parseAuthServiceError(response: Response, defaultErrorCode: string): Promise<string> {
  try {
    const errorData = await response.json();
    if (errorData.error && errorData.error.code) {
      return errorData.error.code;
    }
    return defaultErrorCode;
  } catch (parseError) {
    console.warn("Failed to parse error response from auth service:", parseError);
    return "INTERNAL_SERVER_ERROR";
  }
}
