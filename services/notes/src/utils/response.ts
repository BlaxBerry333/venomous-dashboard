import type { TApiError } from "../types/proto_generated/_common/interface.types";

/**
 * Standard API response structure
 */
export class ApiResponse {
  /**
   * Create a success response with data
   */
  static success<T>(data: T) {
    return {
      success: true,
      data,
    };
  }

  /**
   * Create an error response with code and message
   */
  static error(code: string, message: string) {
    return {
      success: false,
      error: {
        code,
        message,
      } as TApiError,
    };
  }

  /**
   * Create a delete success response (no data)
   */
  static deleteSuccess() {
    return {
      success: true,
    };
  }
}
