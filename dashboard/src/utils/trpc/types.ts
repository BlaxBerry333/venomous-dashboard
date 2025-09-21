import type { TRPCClientErrorLike } from "@trpc/client";

/**
 * Extended TRPC error data with cause information
 */
export interface TRPCErrorData {
  code: string;
  httpStatus: number;
  path: string;
  stack?: string;
  cause?: {
    errorCode?: string;
    errorMessage?: string;
    statusCode?: number;
  };
}

/**
 * TRPC Router type - represents any TRPC router
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyTRPCRouter = any;

/**
 * Typed TRPC Client Error
 */
export type TypedTRPCError = TRPCClientErrorLike<AnyTRPCRouter> & {
  data: TRPCErrorData;
};

/**
 * Helper function to extract error information from TRPC error
 */
export function extractTRPCErrorInfo(error: TRPCClientErrorLike<AnyTRPCRouter>) {
  const typedError = error as TypedTRPCError;
  return {
    errorCode: typedError.data?.cause?.errorCode,
    errorMessage: typedError.data?.cause?.errorMessage,
    statusCode: typedError.data?.cause?.statusCode,
  };
}
