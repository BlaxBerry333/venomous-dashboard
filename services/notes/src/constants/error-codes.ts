/**
 * Error codes for Notes service
 * These codes are used for programmatic error handling
 */
export class ErrorCode {
  // Authentication errors
  static readonly UNAUTHORIZED = "UNAUTHORIZED";
  static readonly TOKEN_INVALID = "TOKEN_INVALID";

  // Validation errors
  static readonly VALIDATION_ERROR = "VALIDATION_ERROR";
  static readonly CONTENT_REQUIRED = "CONTENT_REQUIRED";
  static readonly INVALID_INPUT = "INVALID_INPUT";

  // Resource errors
  static readonly MEMO_NOT_FOUND = "MEMO_NOT_FOUND";
  static readonly ARTICLE_NOT_FOUND = "ARTICLE_NOT_FOUND";
  static readonly CHAPTER_NOT_FOUND = "CHAPTER_NOT_FOUND";

  // Permission errors
  static readonly FORBIDDEN = "FORBIDDEN";
  static readonly INSUFFICIENT_PERMISSIONS = "INSUFFICIENT_PERMISSIONS";

  // Database errors
  static readonly DATABASE_ERROR = "DATABASE_ERROR";
  static readonly INTERNAL_SERVER_ERROR = "INTERNAL_SERVER_ERROR";

  // Update errors
  static readonly NO_FIELDS_TO_UPDATE = "NO_FIELDS_TO_UPDATE";
  static readonly UPDATE_FAILED = "UPDATE_FAILED";
}
