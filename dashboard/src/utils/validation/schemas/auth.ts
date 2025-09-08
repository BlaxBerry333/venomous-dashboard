import z from "zod";

import { VALIDATION_MESSAGE_I18N_KEYS } from "../validation-message-keys";
import { __USER_BASE_SCHEMA } from "./user";

export const AUTH_SIGNIN_SCHEMA = __USER_BASE_SCHEMA.pick({
  email: true,
  password: true,
});

export const AUTH_SIGNUP_SCHEMA = __USER_BASE_SCHEMA
  .pick({
    name: true,
    email: true,
    password: true,
  })
  .extend({
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: VALIDATION_MESSAGE_I18N_KEYS.CONFIRM_PASSWORD_MISMATCH,
    path: ["confirmPassword"],
  });

export type TAuthSigninSchema = z.infer<typeof AUTH_SIGNIN_SCHEMA>;
export type TAuthSignupSchema = z.infer<typeof AUTH_SIGNUP_SCHEMA>;
