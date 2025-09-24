import type {
  TAuthSigninRequest,
  TAuthSigninResponse,
  TAuthSignupRequest,
  TAuthSignupResponse,
  TAuthTokenInfoRequest,
  TAuthTokenRefreshRequest,
  TAuthTokenRefreshResponse,
  TAuthTokenVerifyRequest,
  TAuthTokenVerifyResponse,
} from "@/types";
import { API_ENDPOINTS } from "./endpoints";

export const AUTH_FETCHERS = {
  SIGNUP: async (
    requestBody: TAuthSignupRequest,
  ): Promise<{
    response: Response;
    data: TAuthSignupResponse;
  }> => {
    const response = await fetch(API_ENDPOINTS.API_GATEWAY_URL.AUTH.SIGNUP, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });
    return {
      response,
      data: await response.json(),
    };
  },

  SIGNIN: async (
    requestBody: TAuthSigninRequest,
  ): Promise<{
    response: Response;
    data: TAuthSigninResponse;
  }> => {
    const response = await fetch(API_ENDPOINTS.API_GATEWAY_URL.AUTH.SIGNIN, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });
    return {
      response,
      data: await response.json(),
    };
  },

  TOKEN_INFO: async (
    requestBody: TAuthTokenInfoRequest,
  ): Promise<{
    response: Response;
    data: TAuthTokenRefreshResponse;
  }> => {
    const response = await fetch(API_ENDPOINTS.API_GATEWAY_URL.AUTH.TOKEN_INFO, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });
    return {
      response,
      data: await response.json(),
    };
  },

  TOKEN_VERIFY: async (
    requestBody: TAuthTokenVerifyRequest,
  ): Promise<{
    response: Response;
    data: TAuthTokenVerifyResponse;
  }> => {
    const response = await fetch(API_ENDPOINTS.API_GATEWAY_URL.AUTH.TOKEN_VERIFY, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });
    return {
      response,
      data: await response.json(),
    };
  },

  TOKEN_REFRESH: async (
    requestBody: TAuthTokenRefreshRequest,
  ): Promise<{
    response: Response;
    data: TAuthTokenRefreshResponse;
  }> => {
    const response = await fetch(API_ENDPOINTS.API_GATEWAY_URL.AUTH.TOKEN_REFRESH, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });
    return {
      response,
      data: await response.json(),
    };
  },
} as const;

export const USER_FETCHERS = {
  PROFILE: async (
    requestBody: TAuthTokenRefreshRequest,
  ): Promise<{
    response: Response;
    data: TAuthTokenRefreshResponse;
  }> => {
    const response = await fetch(API_ENDPOINTS.API_GATEWAY_URL.AUTH.TOKEN_REFRESH, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });
    return {
      response,
      data: await response.json(),
    };
  },
} as const;
