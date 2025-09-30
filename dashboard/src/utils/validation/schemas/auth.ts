import z from "zod";

import { VALIDATION_MESSAGE_I18N_KEYS } from "../validation-message-keys";
import { USER_BASE_SCHEMA } from "./user";

export const AUTH_SIGNIN_SCHEMA = USER_BASE_SCHEMA.pick({
  email: true,
  password: true,
});

export const AUTH_SIGNUP_SCHEMA = USER_BASE_SCHEMA.pick({
  name: true,
  email: true,
  password: true,
})
  .extend({
    passwordConfirm: z.string().min(8, VALIDATION_MESSAGE_I18N_KEYS.PASSWORD_TOO_SHORT),
  })
  .refine((data) => data.passwordConfirm.length > 8 && data.password === data.passwordConfirm, {
    message: VALIDATION_MESSAGE_I18N_KEYS.CONFIRM_PASSWORD_MISMATCH,
    path: ["passwordConfirm"],
  });

export type TAuthSigninSchema = z.infer<typeof AUTH_SIGNIN_SCHEMA>;
export type TAuthSignupSchema = z.infer<typeof AUTH_SIGNUP_SCHEMA>;
