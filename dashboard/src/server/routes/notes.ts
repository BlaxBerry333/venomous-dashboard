import { TRPCError } from "@trpc/server";

import { mapHttpStatusToTRPCCode } from "@/server/helpers";
import { NOTES_FETCHERS } from "@/utils/api";
import { TRPCAuthProtectedProcedure } from "@/utils/trpc/index.server";
import * as SCHEMAS from "@/utils/validation/schemas/notes";

export const NotesProcedures = {
  /**
   * Get list of memos
   */
  getListMemos: TRPCAuthProtectedProcedure.query(async ({ ctx }) => {
    try {
      const {
        response,
        data: { data, success, error },
      } = await NOTES_FETCHERS.GET_LIST_MEMOS(ctx.token);

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
   * Get single memo
   */
  getMemo: TRPCAuthProtectedProcedure.input(SCHEMAS.NOTES_MEMO_GET_SCHEMA).query(async ({ ctx, input }) => {
    try {
      const {
        response,
        data: { data, success, error },
      } = await NOTES_FETCHERS.GET_MEMO(input, ctx.token);

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
   * Create memo
   */
  createMemo: TRPCAuthProtectedProcedure.input(SCHEMAS.NOTES_MEMO_CREATE_SCHEMA).mutation(async ({ ctx, input }) => {
    try {
      const {
        response,
        data: { data, success, error },
      } = await NOTES_FETCHERS.CREATE_MEMO(input, ctx.token);

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
   * Update memo
   */
  updateMemo: TRPCAuthProtectedProcedure.input(SCHEMAS.NOTES_MEMO_UPDATE_SCHEMA).mutation(async ({ ctx, input }) => {
    try {
      const {
        response,
        data: { data, success, error },
      } = await NOTES_FETCHERS.UPDATE_MEMO(input, ctx.token);

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
   * Delete memo
   */
  deleteMemo: TRPCAuthProtectedProcedure.input(SCHEMAS.NOTES_MEMO_DELETE_SCHEMA).mutation(async ({ ctx, input }) => {
    try {
      const {
        response,
        data: { success, error },
      } = await NOTES_FETCHERS.DELETE_MEMO(input, ctx.token);

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

      return { success: true };
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
   * Get list of articles
   */
  getListArticles: TRPCAuthProtectedProcedure.query(async ({ ctx }) => {
    try {
      const {
        response,
        data: { data, success, error },
      } = await NOTES_FETCHERS.GET_LIST_ARTICLES(ctx.token);

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
   * Get single article with chapters
   */
  getArticle: TRPCAuthProtectedProcedure.input(SCHEMAS.NOTES_ARTICLE_GET_SCHEMA).query(async ({ ctx, input }) => {
    try {
      const {
        response,
        data: { data, success, error },
      } = await NOTES_FETCHERS.GET_ARTICLE(input, ctx.token);

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
   * Create article
   */
  createArticle: TRPCAuthProtectedProcedure.input(SCHEMAS.NOTES_ARTICLE_CREATE_SCHEMA).mutation(async ({ ctx, input }) => {
    try {
      const {
        response,
        data: { data, success, error },
      } = await NOTES_FETCHERS.CREATE_ARTICLE(input, ctx.token);

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
   * Update article
   */
  updateArticle: TRPCAuthProtectedProcedure.input(SCHEMAS.NOTES_ARTICLE_UPDATE_SCHEMA).mutation(async ({ ctx, input }) => {
    try {
      const {
        response,
        data: { data, success, error },
      } = await NOTES_FETCHERS.UPDATE_ARTICLE(input, ctx.token);

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
   * Delete article
   */
  deleteArticle: TRPCAuthProtectedProcedure.input(SCHEMAS.NOTES_ARTICLE_DELETE_SCHEMA).mutation(async ({ ctx, input }) => {
    try {
      const {
        response,
        data: { success, error },
      } = await NOTES_FETCHERS.DELETE_ARTICLE(input, ctx.token);

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

      return { success: true };
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
   * Get single chapter
   */
  getChapter: TRPCAuthProtectedProcedure.input(SCHEMAS.NOTES_CHAPTER_GET_SCHEMA).query(async ({ ctx, input }) => {
    try {
      const {
        response,
        data: { data, success, error },
      } = await NOTES_FETCHERS.GET_CHAPTER(input, ctx.token);

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
   * Create chapter
   */
  createChapter: TRPCAuthProtectedProcedure.input(SCHEMAS.NOTES_CHAPTER_CREATE_SCHEMA).mutation(async ({ ctx, input }) => {
    try {
      const {
        response,
        data: { data, success, error },
      } = await NOTES_FETCHERS.CREATE_CHAPTER(input, ctx.token);

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
   * Update chapter
   */
  updateChapter: TRPCAuthProtectedProcedure.input(SCHEMAS.NOTES_CHAPTER_UPDATE_SCHEMA).mutation(async ({ ctx, input }) => {
    try {
      const {
        response,
        data: { data, success, error },
      } = await NOTES_FETCHERS.UPDATE_CHAPTER(input, ctx.token);

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
   * Delete chapter
   */
  deleteChapter: TRPCAuthProtectedProcedure.input(SCHEMAS.NOTES_CHAPTER_DELETE_SCHEMA).mutation(async ({ ctx, input }) => {
    try {
      const {
        response,
        data: { success, error },
      } = await NOTES_FETCHERS.DELETE_CHAPTER(input, ctx.token);

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

      return { success: true };
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
