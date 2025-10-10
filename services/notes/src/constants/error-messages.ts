/**
 * User-friendly error messages for Notes service
 * These messages provide clear feedback to users
 */
export class ErrorMessage {
  // Authentication messages
  static readonly UNAUTHORIZED = "Authentication required. Please log in to access this resource.";
  static readonly TOKEN_INVALID = "Your authentication token is invalid or has expired. Please log in again.";

  // Validation messages
  static readonly CONTENT_REQUIRED = "Content is required and cannot be empty.";
  static readonly TITLE_REQUIRED = "Title is required and cannot be empty.";
  static readonly INVALID_INPUT = "The information you provided is not valid. Please check all required fields.";

  // Memo messages
  static readonly MEMO_NOT_FOUND = "The memo you're looking for was not found or has been deleted.";
  static readonly MEMO_CREATE_FAILED = "Failed to create memo. Please try again.";
  static readonly MEMO_UPDATE_FAILED = "Failed to update memo. Please try again.";
  static readonly MEMO_DELETE_FAILED = "Failed to delete memo. Please try again.";

  // Article messages
  static readonly ARTICLE_NOT_FOUND = "The article you're looking for was not found or has been deleted.";
  static readonly ARTICLE_CREATE_FAILED = "Failed to create article. Please try again.";
  static readonly ARTICLE_UPDATE_FAILED = "Failed to update article. Please try again.";
  static readonly ARTICLE_DELETE_FAILED = "Failed to delete article. Please try again.";

  // Chapter messages
  static readonly CHAPTER_NOT_FOUND = "The chapter you're looking for was not found or has been deleted.";
  static readonly CHAPTER_CREATE_FAILED = "Failed to create chapter. Please try again.";
  static readonly CHAPTER_UPDATE_FAILED = "Failed to update chapter. Please try again.";
  static readonly CHAPTER_DELETE_FAILED = "Failed to delete chapter. Please try again.";

  // Permission messages
  static readonly FORBIDDEN = "You don't have permission to access this resource.";
  static readonly INSUFFICIENT_PERMISSIONS = "You don't have sufficient permissions to perform this action.";

  // General messages
  static readonly NO_FIELDS_TO_UPDATE = "No fields provided for update. Please specify at least one field to update.";
  static readonly INTERNAL_SERVER_ERROR = "An internal server error occurred. Please try again later or contact support.";
  static readonly DATABASE_ERROR = "A database error occurred. Please try again later.";
}
