import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { mapHttpStatusToTRPCCode } from "@/server/helpers";
import { USER_FETCHERS } from "@/utils/api";
import { TRPCAuthProtectedProcedure } from "@/utils/trpc/index.server";
import * as SCHEMAS from "@/utils/validation";

export const UserProcedures = {
  /**
   * Get current user profile
   */
  getProfile: TRPCAuthProtectedProcedure.query(async ({ ctx }) => {
    try {
      const {
        response,
        data: { data, success, error },
      } = await USER_FETCHERS.GET_PROFILE(ctx.token);

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
  updateProfile: TRPCAuthProtectedProcedure.input(z.object(SCHEMAS.USER_UPDATE_PROFILE_SCHEMA.shape)).mutation(async ({ ctx, input }) => {
    try {
      const {
        response,
        data: { data, success, error },
      } = await USER_FETCHERS.UPDATE_PROFILE(input, ctx.token);

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
