import type * as Types from "@/types";
import { toCamelCase } from "@/utils/helper";
import { API_ENDPOINTS } from "../endpoints";

export const AUTH_FETCHERS = {
  SIGNUP: async (
    requestBody: Types.TAuthSignupRequest,
  ): Promise<{
    response: Response;
    data: Types.TAuthSignupResponse;
  }> => {
    const response = await fetch(API_ENDPOINTS.API_GATEWAY_URL.AUTH.SIGNUP, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });
    const rawData = await response.json();
    const data = toCamelCase<Types.TAuthSignupResponse>(rawData);
    return {
      response,
      data,
    };
  },

  SIGNIN: async (
    requestBody: Types.TAuthSigninRequest,
  ): Promise<{
    response: Response;
    data: Types.TAuthSigninResponse;
  }> => {
    const response = await fetch(API_ENDPOINTS.API_GATEWAY_URL.AUTH.SIGNIN, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });
    const rawData = await response.json();
    const data = toCamelCase<Types.TAuthSigninResponse>(rawData);
    return {
      response,
      data,
    };
  },

  TOKEN_INFO: async (
    requestBody: Types.TAuthTokenInfoRequest,
  ): Promise<{
    response: Response;
    data: Types.TAuthTokenRefreshResponse;
  }> => {
    const response = await fetch(API_ENDPOINTS.API_GATEWAY_URL.AUTH.TOKEN_INFO, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${requestBody.token}`,
      },
      body: JSON.stringify(requestBody),
    });
    const rawData = await response.json();
    const data = toCamelCase<Types.TAuthTokenRefreshResponse>(rawData);
    return {
      response,
      data,
    };
  },

  TOKEN_VERIFY: async (
    requestBody: Types.TAuthTokenVerifyRequest,
  ): Promise<{
    response: Response;
    data: Types.TAuthTokenVerifyResponse;
  }> => {
    const response = await fetch(API_ENDPOINTS.API_GATEWAY_URL.AUTH.TOKEN_VERIFY, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${requestBody.token}`,
      },
      body: JSON.stringify(requestBody),
    });
    const rawData = await response.json();
    const data = toCamelCase<Types.TAuthTokenVerifyResponse>(rawData);
    return {
      response,
      data,
    };
  },

  TOKEN_REFRESH: async (
    requestBody: Types.TAuthTokenRefreshRequest,
  ): Promise<{
    response: Response;
    data: Types.TAuthTokenRefreshResponse;
  }> => {
    const response = await fetch(API_ENDPOINTS.API_GATEWAY_URL.AUTH.TOKEN_REFRESH, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${requestBody.token}`,
      },
      body: JSON.stringify(requestBody),
    });
    const rawData = await response.json();
    const data = toCamelCase<Types.TAuthTokenRefreshResponse>(rawData);
    return {
      response,
      data,
    };
  },
} as const;
