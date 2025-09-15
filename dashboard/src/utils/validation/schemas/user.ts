import { z } from "zod";

import { VALIDATION_MESSAGE_I18N_KEYS } from "../validation-message-keys";

export const __USER_BASE_SCHEMA = z.object({
  name: z
    .string()
    .min(2, VALIDATION_MESSAGE_I18N_KEYS.NAME_TOO_SHORT)
    .max(50, VALIDATION_MESSAGE_I18N_KEYS.NAME_TOO_LONG)
    .regex(/^[a-zA-Z\u4e00-\u9fa5\s]+$/, VALIDATION_MESSAGE_I18N_KEYS.NAME_INVALID_CHARS)
    .transform((name) => name.trim()),

  email: z.email(VALIDATION_MESSAGE_I18N_KEYS.EMAIL_INVALID).max(100, VALIDATION_MESSAGE_I18N_KEYS.EMAIL_TOO_LONG),

  password: z
    .string()
    .min(8, VALIDATION_MESSAGE_I18N_KEYS.PASSWORD_TOO_SHORT)
    .max(128, VALIDATION_MESSAGE_I18N_KEYS.PASSWORD_TOO_LONG)
    .transform((password) => password.trim()),

  createdAt: z.date(),
  updatedAt: z.date(),
  logoutAt: z.date().nullable(),
});
