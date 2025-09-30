import type { TAuthSigninSchema, TAuthSignupSchema } from "../schemas/auth";

export const AUTH_SIGNIN_FORM_DEFAULT_VALUES: TAuthSigninSchema = {
  email: "",
  password: "",
};

export const AUTH_SIGNUP_FORM_DEFAULT_VALUES: TAuthSignupSchema = {
  name: "",
  email: "",
  password: "",
  passwordConfirm: "",
};
