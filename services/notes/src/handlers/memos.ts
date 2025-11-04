import { and, desc, eq, isNull } from "drizzle-orm";
import type { RouteHandlerMethod } from "fastify";

import { ErrorCode, ErrorMessage } from "../constants";
import { db, memos } from "../database";
import { CACHE_TTL, cacheKey, delCache, getCache, setCache } from "../lib";
import type { TMemoCreateRequest, TMemoUpdateRequest } from "../types";
import { ApiResponse } from "../utils";

/**
 * Get list of memos
 * TODO: Implement pagination, filtering (by color, isPinned), search, and sorting parameters
 *       Current API type defines TMemoListRequest with these fields but they are not used yet.
 *       See protobuf definition: protobuf/protos/notes/api.proto
 */
export const getListMemos: RouteHandlerMethod = async (request, reply) => {
  const userId = request.user?.userId;
  if (!userId) {
    return reply.status(401).send(ApiResponse.error(ErrorCode.UNAUTHORIZED, ErrorMessage.UNAUTHORIZED));
  }

  const key = cacheKey.memoList(userId);
  const cached = await getCache(key);
  if (cached && Array.isArray(cached)) {
    return reply.send(ApiResponse.success(cached));
  }

  const result = await db
    .select()
    .from(memos)
    .where(and(eq(memos.userId, userId), isNull(memos.deletedAt)))
    .orderBy(desc(memos.isPinned), desc(memos.updatedAt));

  await setCache(key, result, CACHE_TTL.MEMO_LIST);

  return reply.send(ApiResponse.success(result));
};

/**
 * Get single memo
 */
export const getMemo: RouteHandlerMethod = async (request, reply) => {
  const { id } = request.params as { id: string };
  const userId = request.user?.userId;
  if (!userId) {
    return reply.status(401).send(ApiResponse.error(ErrorCode.UNAUTHORIZED, ErrorMessage.UNAUTHORIZED));
  }

  const key = cacheKey.memo(id);
  const cached = await getCache(key);
  if (cached) {
    return reply.send(ApiResponse.success(cached));
  }

  const result = await db
    .select()
    .from(memos)
    .where(and(eq(memos.id, id), eq(memos.userId, userId), isNull(memos.deletedAt)))
    .limit(1);

  if (result.length === 0) {
    return reply.status(404).send(ApiResponse.error(ErrorCode.MEMO_NOT_FOUND, ErrorMessage.MEMO_NOT_FOUND));
  }

  await setCache(key, result[0], CACHE_TTL.MEMO_DETAIL);

  return reply.send(ApiResponse.success(result[0]));
};

/**
 * Create memo
 */
export const createMemo: RouteHandlerMethod = async (request, reply) => {
  const { content, color, isPinned = false } = request.body as TMemoCreateRequest;
  const userId = request.user?.userId;
  if (!userId) {
    return reply.status(401).send(ApiResponse.error(ErrorCode.UNAUTHORIZED, ErrorMessage.UNAUTHORIZED));
  }
  if (!content.trim().length) {
    return reply.status(400).send(ApiResponse.error(ErrorCode.CONTENT_REQUIRED, ErrorMessage.CONTENT_REQUIRED));
  }

  const result = await db
    .insert(memos)
    .values({
      userId,
      content: content.trim(),
      color: color || "#FFF9C4",
      isPinned: isPinned ?? false,
    })
    .returning();

  await delCache(cacheKey.memoList(userId));

  return reply.status(201).send(ApiResponse.success(result[0]));
};

/**
 * Update memo
 */
export const updateMemo: RouteHandlerMethod = async (request, reply) => {
  const { id } = request.params as { id: string };
  const { content, color, isPinned } = request.body as Omit<TMemoUpdateRequest, "id">;
  const userId = request.user?.userId;
  if (!userId) {
    return reply.status(401).send(ApiResponse.error(ErrorCode.UNAUTHORIZED, ErrorMessage.UNAUTHORIZED));
  }

  const checkResult = await db
    .select()
    .from(memos)
    .where(and(eq(memos.id, id), eq(memos.userId, userId), isNull(memos.deletedAt)))
    .limit(1);

  if (checkResult.length === 0) {
    return reply.status(404).send(ApiResponse.error(ErrorCode.MEMO_NOT_FOUND, ErrorMessage.MEMO_NOT_FOUND));
  }

  const updateData: Partial<typeof memos.$inferInsert> = {
    updatedAt: new Date(),
  };
  if (content !== undefined) updateData.content = content;
  if (color !== undefined) updateData.color = color;
  if (isPinned !== undefined) updateData.isPinned = isPinned;
  if (Object.keys(updateData).length === 1) {
    return reply.status(400).send(ApiResponse.error(ErrorCode.NO_FIELDS_TO_UPDATE, ErrorMessage.NO_FIELDS_TO_UPDATE));
  }

  const result = await db
    .update(memos)
    .set(updateData)
    .where(and(eq(memos.id, id), eq(memos.userId, userId)))
    .returning();

  await delCache(cacheKey.memoList(userId), cacheKey.memo(id));

  return reply.send(ApiResponse.success(result[0]));
};

/**
 * Delete memo (soft delete)
 */
export const deleteMemo: RouteHandlerMethod = async (request, reply) => {
  const { id } = request.params as { id: string };
  const userId = request.user?.userId;
  if (!userId) {
    return reply.status(401).send(ApiResponse.error(ErrorCode.UNAUTHORIZED, ErrorMessage.UNAUTHORIZED));
  }

  const result = await db
    .update(memos)
    .set({ deletedAt: new Date() })
    .where(and(eq(memos.id, id), eq(memos.userId, userId), isNull(memos.deletedAt)))
    .returning({ id: memos.id });

  if (result.length === 0) {
    return reply.status(404).send(ApiResponse.error(ErrorCode.MEMO_NOT_FOUND, ErrorMessage.MEMO_NOT_FOUND));
  }

  await delCache(cacheKey.memoList(userId), cacheKey.memo(id));

  return reply.status(200).send(ApiResponse.deleteSuccess());
};
