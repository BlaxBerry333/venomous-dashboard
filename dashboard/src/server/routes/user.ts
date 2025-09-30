import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { mapHttpStatusToTRPCCode } from "@/server/helpers";
import { USER_FETCHERS } from "@/utils/api";
import { TRPCAuthProtectedProcedure } from "@/utils/trpc/index.server";
import { USER_UPDATE_PROFILE_SCHEMA } from "@/utils/validation";

export const UserProcedures = {
  /**
   * Get current user profile
   */
  getProfile: TRPCAuthProtectedProcedure.query(async ({ ctx }) => {
    try {
      const token = ctx.token?.value;

      if (!token) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "User not authenticated",
        });
      }

      const {
        response,
        data: { data, success, error },
      } = await USER_FETCHERS.GET_PROFILE(token);

      if (!response.ok || !success) {
        throw new TRPCError({
          code: mapHttpStatusToTRPCCode(response.status),
          cause: {
            errorCode: error?.code,
            errorMessage: error?.message,
            statusCode: response.status,
          },
        });
      }

      return data;
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: `${(error as Error).message}`,
      });
    }
  }),

  /**
   * Update user basic information
   */
  updateProfile: TRPCAuthProtectedProcedure.input(z.object(USER_UPDATE_PROFILE_SCHEMA.shape)).mutation(async ({ ctx, input }) => {
    try {
      const token = ctx.token?.value;

      if (!token) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "User not authenticated",
        });
      }

      const {
        response,
        data: { data, success, error },
      } = await USER_FETCHERS.UPDATE_PROFILE(input, token);

      if (!response.ok || !success) {
        throw new TRPCError({
          code: mapHttpStatusToTRPCCode(response.status),
          cause: {
            errorCode: error?.code,
            errorMessage: error?.message,
            statusCode: response.status,
          },
        });
      }

      return data;
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: `${(error as Error).message}`,
      });
    }
  }),
} as const;
