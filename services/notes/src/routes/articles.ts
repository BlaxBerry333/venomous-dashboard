import type { FastifyPluginAsync } from "fastify";
import * as articlesHandlers from "../handlers/articles";

export const articlesRoutes: FastifyPluginAsync = async (app) => {
  // Articles
  app.get("/", articlesHandlers.getListArticles);
  app.get("/:id", articlesHandlers.getArticle);
  app.post("/", articlesHandlers.createArticle);
  app.put("/:id", articlesHandlers.updateArticle);
  app.delete("/:id", articlesHandlers.deleteArticle);

  // Chapters
  app.get("/:articleId/chapters/:chapterId", articlesHandlers.getChapter);
  app.post("/:articleId/chapters", articlesHandlers.createChapter);
  app.put("/:articleId/chapters/:chapterId", articlesHandlers.updateChapter);
  app.delete("/:articleId/chapters/:chapterId", articlesHandlers.deleteChapter);
};
