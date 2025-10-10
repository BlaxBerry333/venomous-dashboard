import type { FastifyPluginAsync } from "fastify";
import * as memosHandlers from "../handlers/memos";
import { extractUserMiddleware } from "../middleware/auth";

export const memosRoutes: FastifyPluginAsync = async (app) => {
  // Add authentication middleware to all routes in this group
  app.addHook("onRequest", extractUserMiddleware);

  app.get("/", memosHandlers.getListMemos);
  app.get("/:id", memosHandlers.getMemo);
  app.post("/", memosHandlers.createMemo);
  app.put("/:id", memosHandlers.updateMemo);
  app.delete("/:id", memosHandlers.deleteMemo);
};
