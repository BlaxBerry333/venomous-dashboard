import { z } from "zod";

import { VALIDATION_MESSAGE_I18N_KEYS } from "../validation-message-keys";

export const MEMO_COLORS = {
  LIGHT_YELLOW: "#FFF9C4",
  LIGHT_GREEN: "#C8E6C9",
  LIGHT_PINK: "#F8BBD0",
} as const;

const NOTES_MEMO_BASE_SCHEMA = z.object({
  id: z.uuid(VALIDATION_MESSAGE_I18N_KEYS.INVALID),
  content: z.string().min(1, VALIDATION_MESSAGE_I18N_KEYS.MEMO_CONTENT_REQUIRED),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, VALIDATION_MESSAGE_I18N_KEYS.INVALID)
    .optional()
    .default(MEMO_COLORS.LIGHT_YELLOW),
  isPinned: z.boolean().optional().default(false),
});

const NOTES_ARTICLE_BASE_SCHEMA = z.object({
  id: z.uuid(VALIDATION_MESSAGE_I18N_KEYS.INVALID),
  title: z.string().min(1, VALIDATION_MESSAGE_I18N_KEYS.ARTICLE_TITLE_REQUIRED),
  description: z.string().optional(),
  category: z.string().optional(),
  coverImageUrl: z.url(VALIDATION_MESSAGE_I18N_KEYS.ARTICLE_COVER_URL_INVALID).optional(),
  status: z.number().int().min(0, VALIDATION_MESSAGE_I18N_KEYS.ARTICLE_STATUS_INVALID).max(2, VALIDATION_MESSAGE_I18N_KEYS.ARTICLE_STATUS_INVALID),
});

const NOTES_CHAPTER_BASE_SCHEMA = z.object({
  articleId: z.uuid(VALIDATION_MESSAGE_I18N_KEYS.INVALID),
  chapterId: z.uuid(VALIDATION_MESSAGE_I18N_KEYS.INVALID),
  title: z.string().min(1, VALIDATION_MESSAGE_I18N_KEYS.CHAPTER_TITLE_REQUIRED),
  content: z.string().min(1, VALIDATION_MESSAGE_I18N_KEYS.CHAPTER_CONTENT_REQUIRED),
  chapterNumber: z.number().int().min(1, VALIDATION_MESSAGE_I18N_KEYS.CHAPTER_NUMBER_INVALID),
  wordCount: z.number().int().min(0, VALIDATION_MESSAGE_I18N_KEYS.CHAPTER_WORD_COUNT_INVALID),
});

export const NOTES_MEMO_GET_SCHEMA = NOTES_MEMO_BASE_SCHEMA.pick({ id: true });

export const NOTES_MEMO_CREATE_SCHEMA = NOTES_MEMO_BASE_SCHEMA.omit({ id: true });

export const NOTES_MEMO_UPDATE_SCHEMA = NOTES_MEMO_BASE_SCHEMA.partial().required({ id: true });

export const NOTES_MEMO_DELETE_SCHEMA = NOTES_MEMO_BASE_SCHEMA.pick({ id: true });

export const NOTES_ARTICLE_GET_SCHEMA = NOTES_ARTICLE_BASE_SCHEMA.pick({ id: true });

export const NOTES_ARTICLE_CREATE_SCHEMA = NOTES_ARTICLE_BASE_SCHEMA.omit({ id: true, status: true });

export const NOTES_ARTICLE_UPDATE_SCHEMA = NOTES_ARTICLE_BASE_SCHEMA.partial().required({ id: true });

export const NOTES_CHAPTER_CREATE_SCHEMA = NOTES_CHAPTER_BASE_SCHEMA.omit({ chapterId: true });

export const NOTES_ARTICLE_DELETE_SCHEMA = NOTES_ARTICLE_BASE_SCHEMA.pick({ id: true });

export const NOTES_CHAPTER_UPDATE_SCHEMA = NOTES_CHAPTER_BASE_SCHEMA.pick({
  articleId: true,
  chapterId: true,
  title: true,
  content: true,
  wordCount: true,
})
  .partial()
  .required({ articleId: true, chapterId: true });

export const NOTES_CHAPTER_DELETE_SCHEMA = NOTES_CHAPTER_BASE_SCHEMA.pick({
  articleId: true,
  chapterId: true,
});

export const NOTES_CHAPTER_GET_SCHEMA = NOTES_CHAPTER_BASE_SCHEMA.pick({
  articleId: true,
  chapterId: true,
});

export type TNotesMemoCreateSchema = z.infer<typeof NOTES_MEMO_CREATE_SCHEMA>;
export type TNotesMemoUpdateSchema = z.infer<typeof NOTES_MEMO_UPDATE_SCHEMA>;
export type TNotesArticleCreateSchema = z.infer<typeof NOTES_ARTICLE_CREATE_SCHEMA>;
export type TNotesArticleUpdateSchema = z.infer<typeof NOTES_ARTICLE_UPDATE_SCHEMA>;
export type TNotesChapterCreateSchema = z.infer<typeof NOTES_CHAPTER_CREATE_SCHEMA>;
export type TNotesChapterUpdateSchema = z.infer<typeof NOTES_CHAPTER_UPDATE_SCHEMA>;
