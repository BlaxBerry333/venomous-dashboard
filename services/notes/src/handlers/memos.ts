import { and, desc, eq, isNull } from "drizzle-orm";
import type { RouteHandlerMethod } from "fastify";

import { ErrorCode, ErrorMessage } from "../constants";
import { db, memos } from "../database";
import { CACHE_TTL, cacheKey, delCache, getCache, setCache } from "../lib/cache";
import type { TMemoCreateRequest, TMemoUpdateRequest } from "../types";
import { ApiResponse, isNonEmptyString, isValidMemoColor, isValidUUID, sanitizeString } from "../utils";

// Enum to String mapping (for storing in DB)
const MEMO_COLOR_TO_STRING = {
  0: "yellow",
  1: "green",
  2: "blue",
  3: "pink",
  4: "purple",
  5: "gray",
  [-1]: "yellow",
} as const;

// String to Enum mapping (for returning to client)
const STRING_TO_MEMO_COLOR: Record<string, number> = {
  yellow: 0,
  green: 1,
  blue: 2,
  pink: 3,
  purple: 4,
  gray: 5,
};

/**
 * Transform database memo to API response format
 * Converts color string to enum number
 */
const transformMemoToResponse = (memo: any) => ({
  ...memo,
  color: STRING_TO_MEMO_COLOR[memo.color] ?? 0,
});

/**
 * 获取用户所有 Memos
 */
export const getListMemos: RouteHandlerMethod = async (request, reply) => {
  const userId = request.user?.userId;
  if (!userId) {
    return reply.status(401).send(ApiResponse.error(ErrorCode.UNAUTHORIZED, ErrorMessage.UNAUTHORIZED));
  }
  const key = cacheKey.memoList(userId);

  // 尝试从缓存获取
  const cached = await getCache(key);
  if (cached && Array.isArray(cached)) {
    const transformed = cached.map(transformMemoToResponse);
    return reply.send(ApiResponse.success(transformed));
  }

  // 使用 Drizzle 查询数据库
  const result = await db
    .select()
    .from(memos)
    .where(and(eq(memos.userId, userId), isNull(memos.deletedAt)))
    .orderBy(desc(memos.isPinned), desc(memos.updatedAt));

  // 写入缓存
  await setCache(key, result, CACHE_TTL.MEMO_LIST);

  // 转换 color 为 enum number
  const transformed = result.map(transformMemoToResponse);
  return reply.send(ApiResponse.success(transformed));
};

/**
 * 获取单个 Memo
 */
export const getMemo: RouteHandlerMethod = async (request, reply) => {
  const { id } = request.params as { id: string };
  const userId = request.user?.userId;
  if (!userId) {
    return reply.status(401).send(ApiResponse.error(ErrorCode.UNAUTHORIZED, ErrorMessage.UNAUTHORIZED));
  }

  // Validate ID format
  if (!isValidUUID(id)) {
    return reply.status(400).send(ApiResponse.error(ErrorCode.VALIDATION_ERROR, "Invalid memo ID format"));
  }

  const result = await db
    .select()
    .from(memos)
    .where(and(eq(memos.id, id), eq(memos.userId, userId), isNull(memos.deletedAt)))
    .limit(1);

  if (result.length === 0) {
    return reply.status(404).send(ApiResponse.error(ErrorCode.MEMO_NOT_FOUND, ErrorMessage.MEMO_NOT_FOUND));
  }

  const transformed = transformMemoToResponse(result[0]);
  return reply.send(ApiResponse.success(transformed));
};

/**
 * 创建 Memo
 */
export const createMemo: RouteHandlerMethod = async (request, reply) => {
  const { content, color, isPinned = false } = request.body as TMemoCreateRequest;
  const userId = request.user?.userId;
  if (!userId) {
    return reply.status(401).send(ApiResponse.error(ErrorCode.UNAUTHORIZED, ErrorMessage.UNAUTHORIZED));
  }

  // Input validation
  if (!isNonEmptyString(content)) {
    return reply.status(400).send(ApiResponse.error(ErrorCode.CONTENT_REQUIRED, ErrorMessage.CONTENT_REQUIRED));
  }

  if (!isValidMemoColor(color)) {
    return reply.status(400).send(ApiResponse.error(ErrorCode.VALIDATION_ERROR, "Invalid memo color"));
  }

  const sanitizedContent = sanitizeString(content);
  const colorString = MEMO_COLOR_TO_STRING[color] || MEMO_COLOR_TO_STRING[-1];

  const result = await db
    .insert(memos)
    .values({
      userId,
      content: sanitizedContent,
      color: colorString,
      isPinned,
    })
    .returning();

  // 清除列表缓存
  await delCache(cacheKey.memoList(userId));

  const transformed = transformMemoToResponse(result[0]);
  return reply.status(201).send(ApiResponse.success(transformed));
};

/**
 * 更新 Memo
 */
export const updateMemo: RouteHandlerMethod = async (request, reply) => {
  const { id } = request.params as { id: string };
  const { content, color, isPinned } = request.body as Omit<TMemoUpdateRequest, "id">;
  const userId = request.user?.userId;
  if (!userId) {
    return reply.status(401).send(ApiResponse.error(ErrorCode.UNAUTHORIZED, ErrorMessage.UNAUTHORIZED));
  }

  // 检查所有权
  const checkResult = await db
    .select()
    .from(memos)
    .where(and(eq(memos.id, id), eq(memos.userId, userId), isNull(memos.deletedAt)))
    .limit(1);

  if (checkResult.length === 0) {
    return reply.status(404).send(ApiResponse.error(ErrorCode.MEMO_NOT_FOUND, ErrorMessage.MEMO_NOT_FOUND));
  }

  // 构建更新对象
  const updateData: Partial<typeof memos.$inferInsert> = {
    updatedAt: new Date(),
  };

  if (content !== undefined) {
    updateData.content = content;
  }
  if (color !== undefined) {
    updateData.color = MEMO_COLOR_TO_STRING[color] || MEMO_COLOR_TO_STRING[-1];
  }
  if (isPinned !== undefined) {
    updateData.isPinned = isPinned;
  }

  if (Object.keys(updateData).length === 1) {
    // 只有 updatedAt，说明没有其他字段需要更新
    return reply.status(400).send(ApiResponse.error(ErrorCode.NO_FIELDS_TO_UPDATE, ErrorMessage.NO_FIELDS_TO_UPDATE));
  }

  const result = await db
    .update(memos)
    .set(updateData)
    .where(and(eq(memos.id, id), eq(memos.userId, userId)))
    .returning();

  // 清除缓存
  await delCache(cacheKey.memoList(userId), cacheKey.memo(id));

  const transformed = transformMemoToResponse(result[0]);
  return reply.send(ApiResponse.success(transformed));
};

/**
 * 删除 Memo (软删除)
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

  // 清除缓存
  await delCache(cacheKey.memoList(userId), cacheKey.memo(id));

  // 使用 200 状态码并返回成功响应（而不是 204 No Content）
  return reply.status(200).send(ApiResponse.deleteSuccess());
};
