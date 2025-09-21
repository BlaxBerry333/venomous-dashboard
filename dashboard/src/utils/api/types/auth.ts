// ====================================================================================================
// Base User Types
// ====================================================================================================
export type TUser = {
  id: string;
  email: string;
  name: string;
  role_id: string;
  avatar: string | null;
  locale: string;
  timezone: string | null;
  created_at: string;
  updated_at: string;
};

export type TAuthUser = {
  id: string;
  user_id: string;
  email: string;
  password_hash: string;
  email_verified: boolean;
  last_login: string | null;
  failed_login_attempts: number;
  account_locked_until: string | null;
  created_at: string;
  updated_at: string;
};

export type TUserProfile = Pick<TUser, "id" | "email" | "name" | "role_id">;

// ====================================================================================================
// Token Types
// ====================================================================================================
export type TAuthToken = {
  token: string;
  expires_at: string;
  issued_at: string;
};

export type TAuthTokenInfo = {
  valid: boolean;
  user_id: string;
  email: string;
  name: string;
  role: string;
  expires_at: number;
  issued_at: number;
};

// ====================================================================================================
// API Response Types
// ====================================================================================================
export type TApiResponseOfAuthSignup = {
  success: boolean;
  data: {
    token: string;
    user: TUserProfile & {
      created_at: string;
    };
  } | null;
  error: {
    code: string;
    message: string;
  } | null;
};

export type TApiResponseOfAuthSignin = {
  success: boolean;
  data: {
    token: string;
    user: TUserProfile & {
      last_login: string;
    };
  } | null;
  error: {
    code: string;
    message: string;
  } | null;
};

export type TApiResponseOfAuthLogout = {
  success: boolean;
  data: null;
  error: {
    code: string;
    message: string;
  } | null;
};

export type TApiResponseOfAuthTokenVerify = {
  success: boolean;
  data: TAuthTokenInfo | null;
  error: {
    code: string;
    message: string;
  } | null;
};

export type TApiResponseOfAuthTokenInfo = {
  success: boolean;
  data: TAuthTokenInfo | null;
  error: {
    code: string;
    message: string;
  } | null;
};

export type TApiResponseOfAuthTokenRefresh = {
  success: boolean;
  data: {
    token: string;
    expires_at: number;
  } | null;
  error: {
    code: string;
    message: string;
  } | null;
};
