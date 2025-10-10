import { and, count, desc, eq, isNull } from "drizzle-orm";
import type { RouteHandlerMethod } from "fastify";

import { ErrorCode, ErrorMessage } from "../constants";
import { articleChapters, articles, db } from "../database";
import { CACHE_TTL, cacheKey, delCache, getCache, setCache } from "../lib/cache";
import type { TArticleCreateRequest, TArticleUpdateRequest, TChapterCreateRequest, TChapterUpdateRequest } from "../types";
import { ApiResponse } from "../utils";

// Enum to String mapping (for storing in DB)
const ARTICLE_STATUS_TO_STRING = {
  0: "draft",
  1: "published",
  2: "archived",
  [-1]: "draft",
} as const;

// String to Enum mapping (for returning to client)
const STRING_TO_ARTICLE_STATUS: Record<string, number> = {
  draft: 0,
  published: 1,
  archived: 2,
};

/**
 * Transform database article to API response format
 * Converts status string to enum number
 */
const transformArticleToResponse = (article: any) => ({
  ...article,
  status: STRING_TO_ARTICLE_STATUS[article.status] ?? 0,
});

/**
 * 获取用户所有 Articles
 */
export const getListArticles: RouteHandlerMethod = async (request, reply) => {
  const userId = request.user?.userId;
  if (!userId) {
    return reply.status(401).send(ApiResponse.error(ErrorCode.UNAUTHORIZED, ErrorMessage.UNAUTHORIZED));
  }
  const key = cacheKey.articleList(userId);

  const cached = await getCache(key);
  if (cached && Array.isArray(cached)) {
    const transformed = cached.map((item: any) => ({
      article: transformArticleToResponse(item.article),
      chapterCount: item.chapterCount,
    }));
    return reply.send(ApiResponse.success(transformed));
  }

  // 使用 Drizzle 查询
  const result = await db
    .select({
      article: articles,
      chapterCount: count(articleChapters.id),
    })
    .from(articles)
    .leftJoin(articleChapters, and(eq(articleChapters.articleId, articles.id), isNull(articleChapters.deletedAt)))
    .where(and(eq(articles.userId, userId), isNull(articles.deletedAt)))
    .groupBy(articles.id)
    .orderBy(desc(articles.updatedAt));

  await setCache(key, result, CACHE_TTL.ARTICLE_LIST);

  // 转换 article status 为 enum number
  const transformed = result.map((item) => ({
    article: transformArticleToResponse(item.article),
    chapterCount: item.chapterCount,
  }));
  return reply.send(ApiResponse.success(transformed));
};

/**
 * 获取 Article 详情 (含章节)
 */
export const getArticle: RouteHandlerMethod = async (request, reply) => {
  const { id } = request.params as { id: string };
  const userId = request.user?.userId;
  if (!userId) {
    return reply.status(401).send(ApiResponse.error(ErrorCode.UNAUTHORIZED, ErrorMessage.UNAUTHORIZED));
  }

  const articleResult = await db
    .select()
    .from(articles)
    .where(and(eq(articles.id, id), eq(articles.userId, userId), isNull(articles.deletedAt)))
    .limit(1);

  if (articleResult.length === 0) {
    return reply.status(404).send(ApiResponse.error(ErrorCode.ARTICLE_NOT_FOUND, ErrorMessage.ARTICLE_NOT_FOUND));
  }

  const chaptersResult = await db
    .select()
    .from(articleChapters)
    .where(and(eq(articleChapters.articleId, id), isNull(articleChapters.deletedAt)))
    .orderBy(articleChapters.chapterNumber);

  return reply.send(
    ApiResponse.success({
      article: transformArticleToResponse(articleResult[0]),
      chapters: chaptersResult,
    }),
  );
};

/**
 * 创建 Article
 */
export const createArticle: RouteHandlerMethod = async (request, reply) => {
  const { title, description, category, coverImageUrl } = request.body as TArticleCreateRequest;
  const userId = request.user?.userId;
  if (!userId) {
    return reply.status(401).send(ApiResponse.error(ErrorCode.UNAUTHORIZED, ErrorMessage.UNAUTHORIZED));
  }

  if (!title || title.trim().length === 0) {
    return reply.status(400).send(ApiResponse.error(ErrorCode.VALIDATION_ERROR, ErrorMessage.TITLE_REQUIRED));
  }

  const result = await db
    .insert(articles)
    .values({
      userId,
      title,
      description: description || null,
      category: category || null,
      coverImageUrl: coverImageUrl || null,
    })
    .returning();

  await delCache(cacheKey.articleList(userId));

  const transformed = transformArticleToResponse(result[0]);
  return reply.status(201).send(ApiResponse.success(transformed));
};

/**
 * 更新 Article
 */
export const updateArticle: RouteHandlerMethod = async (request, reply) => {
  const { id } = request.params as { id: string };
  const { title, description, category, coverImageUrl, status } = request.body as Omit<TArticleUpdateRequest, "id">;
  const userId = request.user?.userId;
  if (!userId) {
    return reply.status(401).send(ApiResponse.error(ErrorCode.UNAUTHORIZED, ErrorMessage.UNAUTHORIZED));
  }

  const checkResult = await db
    .select()
    .from(articles)
    .where(and(eq(articles.id, id), eq(articles.userId, userId), isNull(articles.deletedAt)))
    .limit(1);

  if (checkResult.length === 0) {
    return reply.status(404).send(ApiResponse.error(ErrorCode.ARTICLE_NOT_FOUND, ErrorMessage.ARTICLE_NOT_FOUND));
  }

  const updateData: Partial<typeof articles.$inferInsert> = {
    updatedAt: new Date(),
  };

  if (title !== undefined) updateData.title = title;
  if (description !== undefined) updateData.description = description;
  if (category !== undefined) updateData.category = category;
  if (coverImageUrl !== undefined) updateData.coverImageUrl = coverImageUrl;
  if (status !== undefined) updateData.status = ARTICLE_STATUS_TO_STRING[status] || ARTICLE_STATUS_TO_STRING[-1];

  if (Object.keys(updateData).length === 1) {
    return reply.status(400).send(ApiResponse.error(ErrorCode.NO_FIELDS_TO_UPDATE, ErrorMessage.NO_FIELDS_TO_UPDATE));
  }

  const result = await db
    .update(articles)
    .set(updateData)
    .where(and(eq(articles.id, id), eq(articles.userId, userId)))
    .returning();

  await delCache(cacheKey.articleList(userId), cacheKey.article(id));

  const transformed = transformArticleToResponse(result[0]);
  return reply.send(ApiResponse.success(transformed));
};

/**
 * 删除 Article (软删除)
 */
export const deleteArticle: RouteHandlerMethod = async (request, reply) => {
  const { id } = request.params as { id: string };
  const userId = request.user?.userId;
  if (!userId) {
    return reply.status(401).send(ApiResponse.error(ErrorCode.UNAUTHORIZED, ErrorMessage.UNAUTHORIZED));
  }

  const result = await db
    .update(articles)
    .set({ deletedAt: new Date() })
    .where(and(eq(articles.id, id), eq(articles.userId, userId), isNull(articles.deletedAt)))
    .returning({ id: articles.id });

  if (result.length === 0) {
    return reply.status(404).send(ApiResponse.error(ErrorCode.ARTICLE_NOT_FOUND, ErrorMessage.ARTICLE_NOT_FOUND));
  }

  await delCache(cacheKey.articleList(userId), cacheKey.article(id));

  // 使用 200 状态码并返回成功响应（而不是 204 No Content）
  return reply.status(200).send(ApiResponse.deleteSuccess());
};

/**
 * 获取 Chapter
 */
export const getChapter: RouteHandlerMethod = async (request, reply) => {
  const { articleId, chapterId } = request.params as {
    articleId: string;
    chapterId: string;
  };
  const userId = request.user?.userId;
  if (!userId) {
    return reply.status(401).send(ApiResponse.error(ErrorCode.UNAUTHORIZED, ErrorMessage.UNAUTHORIZED));
  }

  const articleResult = await db
    .select()
    .from(articles)
    .where(and(eq(articles.id, articleId), eq(articles.userId, userId), isNull(articles.deletedAt)))
    .limit(1);

  if (articleResult.length === 0) {
    return reply.status(404).send(ApiResponse.error(ErrorCode.ARTICLE_NOT_FOUND, ErrorMessage.ARTICLE_NOT_FOUND));
  }

  const chapterResult = await db
    .select()
    .from(articleChapters)
    .where(and(eq(articleChapters.id, chapterId), eq(articleChapters.articleId, articleId), isNull(articleChapters.deletedAt)))
    .limit(1);

  if (chapterResult.length === 0) {
    return reply.status(404).send(ApiResponse.error(ErrorCode.CHAPTER_NOT_FOUND, ErrorMessage.CHAPTER_NOT_FOUND));
  }

  return reply.send(ApiResponse.success(chapterResult[0]));
};

/**
 * 创建 Chapter
 */
export const createChapter: RouteHandlerMethod = async (request, reply) => {
  const { articleId } = request.params as { articleId: string };
  const { title, content, chapterNumber, wordCount = 0 } = request.body as Omit<TChapterCreateRequest, "articleId">;
  const userId = request.user?.userId;
  if (!userId) {
    return reply.status(401).send(ApiResponse.error(ErrorCode.UNAUTHORIZED, ErrorMessage.UNAUTHORIZED));
  }

  const articleResult = await db
    .select()
    .from(articles)
    .where(and(eq(articles.id, articleId), eq(articles.userId, userId), isNull(articles.deletedAt)))
    .limit(1);

  if (articleResult.length === 0) {
    return reply.status(404).send(ApiResponse.error(ErrorCode.ARTICLE_NOT_FOUND, ErrorMessage.ARTICLE_NOT_FOUND));
  }

  if (!title || title.trim().length === 0) {
    return reply.status(400).send(ApiResponse.error(ErrorCode.VALIDATION_ERROR, ErrorMessage.TITLE_REQUIRED));
  }

  if (!content || content.trim().length === 0) {
    return reply.status(400).send(ApiResponse.error(ErrorCode.CONTENT_REQUIRED, ErrorMessage.CONTENT_REQUIRED));
  }

  if (chapterNumber === undefined || chapterNumber < 1) {
    return reply.status(400).send(ApiResponse.error(ErrorCode.VALIDATION_ERROR, "Valid chapter number is required"));
  }

  const result = await db
    .insert(articleChapters)
    .values({
      articleId,
      title,
      content,
      chapterNumber,
      wordCount,
    })
    .returning();

  await delCache(cacheKey.article(articleId));

  return reply.status(201).send(ApiResponse.success(result[0]));
};

/**
 * 更新 Chapter
 */
export const updateChapter: RouteHandlerMethod = async (request, reply) => {
  const { articleId, chapterId } = request.params as {
    articleId: string;
    chapterId: string;
  };
  const { title, content, wordCount } = request.body as Omit<TChapterUpdateRequest, "articleId" | "chapterId">;
  const userId = request.user?.userId;
  if (!userId) {
    return reply.status(401).send(ApiResponse.error(ErrorCode.UNAUTHORIZED, ErrorMessage.UNAUTHORIZED));
  }

  const articleResult = await db
    .select()
    .from(articles)
    .where(and(eq(articles.id, articleId), eq(articles.userId, userId), isNull(articles.deletedAt)))
    .limit(1);

  if (articleResult.length === 0) {
    return reply.status(404).send(ApiResponse.error(ErrorCode.ARTICLE_NOT_FOUND, ErrorMessage.ARTICLE_NOT_FOUND));
  }

  const checkResult = await db
    .select()
    .from(articleChapters)
    .where(and(eq(articleChapters.id, chapterId), eq(articleChapters.articleId, articleId), isNull(articleChapters.deletedAt)))
    .limit(1);

  if (checkResult.length === 0) {
    return reply.status(404).send(ApiResponse.error(ErrorCode.CHAPTER_NOT_FOUND, ErrorMessage.CHAPTER_NOT_FOUND));
  }

  const updateData: Partial<typeof articleChapters.$inferInsert> = {
    updatedAt: new Date(),
  };

  if (title !== undefined) updateData.title = title;
  if (content !== undefined) updateData.content = content;
  if (wordCount !== undefined) updateData.wordCount = wordCount;

  if (Object.keys(updateData).length === 1) {
    return reply.status(400).send(ApiResponse.error(ErrorCode.NO_FIELDS_TO_UPDATE, ErrorMessage.NO_FIELDS_TO_UPDATE));
  }

  const result = await db
    .update(articleChapters)
    .set(updateData)
    .where(and(eq(articleChapters.id, chapterId), eq(articleChapters.articleId, articleId)))
    .returning();

  await delCache(cacheKey.article(articleId), cacheKey.chapter(chapterId));

  return reply.send(ApiResponse.success(result[0]));
};

/**
 * 删除 Chapter (软删除)
 */
export const deleteChapter: RouteHandlerMethod = async (request, reply) => {
  const { articleId, chapterId } = request.params as {
    articleId: string;
    chapterId: string;
  };
  const userId = request.user?.userId;
  if (!userId) {
    return reply.status(401).send(ApiResponse.error(ErrorCode.UNAUTHORIZED, ErrorMessage.UNAUTHORIZED));
  }

  const articleResult = await db
    .select()
    .from(articles)
    .where(and(eq(articles.id, articleId), eq(articles.userId, userId), isNull(articles.deletedAt)))
    .limit(1);

  if (articleResult.length === 0) {
    return reply.status(404).send(ApiResponse.error(ErrorCode.ARTICLE_NOT_FOUND, ErrorMessage.ARTICLE_NOT_FOUND));
  }

  const result = await db
    .update(articleChapters)
    .set({ deletedAt: new Date() })
    .where(and(eq(articleChapters.id, chapterId), eq(articleChapters.articleId, articleId), isNull(articleChapters.deletedAt)))
    .returning({ id: articleChapters.id });

  if (result.length === 0) {
    return reply.status(404).send(ApiResponse.error(ErrorCode.CHAPTER_NOT_FOUND, ErrorMessage.CHAPTER_NOT_FOUND));
  }

  await delCache(cacheKey.article(articleId), cacheKey.chapter(chapterId));

  // 使用 200 状态码并返回成功响应（而不是 204 No Content）
  return reply.status(200).send(ApiResponse.deleteSuccess());
};
