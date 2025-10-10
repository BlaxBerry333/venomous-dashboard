/**
 * Input validation utilities for Notes service
 * Provides defensive validation at service layer
 */

/**
 * Validate UUID format
 */
export const isValidUUID = (uuid: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

/**
 * Validate string is not empty
 */
export const isNonEmptyString = (value: any): boolean => {
  return typeof value === "string" && value.trim().length > 0;
};

/**
 * Validate memo color enum value
 */
export const isValidMemoColor = (color: any): boolean => {
  return typeof color === "number" && color >= 0 && color <= 5;
};

/**
 * Validate article status enum value
 */
export const isValidArticleStatus = (status: any): boolean => {
  return typeof status === "number" && status >= 0 && status <= 2;
};

/**
 * Validate chapter number
 */
export const isValidChapterNumber = (chapterNumber: any): boolean => {
  return typeof chapterNumber === "number" && chapterNumber >= 1 && Number.isInteger(chapterNumber);
};

/**
 * Validate word count
 */
export const isValidWordCount = (wordCount: any): boolean => {
  return typeof wordCount === "number" && wordCount >= 0 && Number.isInteger(wordCount);
};

/**
 * Sanitize string input by trimming whitespace
 */
export const sanitizeString = (value: string): string => {
  return value.trim();
};
