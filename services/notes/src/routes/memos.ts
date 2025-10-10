import type { FastifyPluginAsync } from "fastify";
import * as memosHandlers from "../handlers/memos";

export const memosRoutes: FastifyPluginAsync = async (app) => {
  app.get("/", memosHandlers.getListMemos);
  app.get("/:id", memosHandlers.getMemo);
  app.post("/", memosHandlers.createMemo);
  app.put("/:id", memosHandlers.updateMemo);
  app.delete("/:id", memosHandlers.deleteMemo);
};
