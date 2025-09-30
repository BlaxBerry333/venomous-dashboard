/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Converts snake_case object keys to camelCase recursively
 *
 * @example
 * const obj = { "foo_bar": "baz" };
 * const camelObj = toCamelCase(obj);
 * console.log(camelObj.fooBar); // "baz"
 */
export function toCamelCase<T = any>(obj: any): T {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(toCamelCase) as T;
  }

  if (typeof obj === "object" && obj.constructor === Object) {
    const result: any = {};

    for (const [key, value] of Object.entries(obj)) {
      // Convert snake_case to camelCase
      const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
      result[camelKey] = toCamelCase(value);
    }

    return result as T;
  }

  return obj;
}

/**
 * Converts camelCase object keys to snake_case recursively
 *
 * @example
 * const obj = { fooBar: "baz" };
 * const snakeObj = toSnakeCase(obj);
 * console.log(snakeObj.foo_bar); // "baz"
 */
export function toSnakeCase<T = any>(obj: any): T {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(toSnakeCase) as T;
  }

  if (typeof obj === "object" && obj.constructor === Object) {
    const result: any = {};

    for (const [key, value] of Object.entries(obj)) {
      // Convert camelCase to snake_case
      const snakeKey = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
      result[snakeKey] = toSnakeCase(value);
    }

    return result as T;
  }

  return obj;
}
