// ====================================================================================================
// validation message keys
// ====================================================================================================
export { VALIDATION_MESSAGE_I18N_KEYS } from "./validation-message-keys";

// ====================================================================================================
// schemas
// ====================================================================================================
export { AUTH_SIGNIN_SCHEMA, AUTH_SIGNUP_SCHEMA } from "./schemas/auth";
export type { TAuthSigninSchema, TAuthSignupSchema } from "./schemas/auth";
export {
  NOTES_ARTICLE_CREATE_SCHEMA,
  NOTES_ARTICLE_DELETE_SCHEMA,
  NOTES_ARTICLE_GET_SCHEMA,
  NOTES_ARTICLE_UPDATE_SCHEMA,
  NOTES_CHAPTER_CREATE_SCHEMA,
  NOTES_CHAPTER_DELETE_SCHEMA,
  NOTES_CHAPTER_GET_SCHEMA,
  NOTES_CHAPTER_UPDATE_SCHEMA,
  NOTES_MEMO_CREATE_SCHEMA,
  NOTES_MEMO_DELETE_SCHEMA,
  NOTES_MEMO_GET_SCHEMA,
  NOTES_MEMO_UPDATE_SCHEMA,
} from "./schemas/notes";
export { USER_BASE_SCHEMA, USER_UPDATE_PROFILE_SCHEMA } from "./schemas/user";

// ====================================================================================================
// schemas default values
// ====================================================================================================
export { AUTH_SIGNIN_FORM_DEFAULT_VALUES, AUTH_SIGNUP_FORM_DEFAULT_VALUES } from "./default-values/auth";
