import { redis } from "./redis";

// 缓存 TTL (秒)
export const CACHE_TTL = {
  MEMO_LIST: 60, // 1分钟
  MEMO_DETAIL: 300, // 5分钟
  ARTICLE_LIST: 60,
  ARTICLE_DETAIL: 300,
  CHAPTER_DETAIL: 300,
};

// 缓存键生成
export const cacheKey = {
  memoList: (userId: string) => `user:${userId}:memos`,
  memo: (id: string) => `memo:${id}`,
  articleList: (userId: string) => `user:${userId}:articles`,
  article: (id: string) => `article:${id}`,
  chapter: (id: string) => `chapter:${id}`,
};

// 获取缓存
export async function getCache<T>(key: string): Promise<T | null> {
  const cached = await redis.get(key);
  return cached ? JSON.parse(cached) : null;
}

// 设置缓存
export async function setCache(key: string, value: unknown, ttl: number): Promise<void> {
  await redis.setex(key, ttl, JSON.stringify(value));
}

// 删除缓存
export async function delCache(...keys: string[]): Promise<void> {
  if (keys.length > 0) {
    await redis.del(...keys);
  }
}
