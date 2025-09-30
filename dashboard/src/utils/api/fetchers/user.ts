import type { TUserGetProfileResponse, TUserUpdateProfileRequest, TUserUpdateProfileResponse } from "@/types";
import { toCamelCase } from "@/utils/helper";
import { API_ENDPOINTS } from "../endpoints";

export const USER_FETCHERS = {
  GET_PROFILE: async (
    token: string,
  ): Promise<{
    response: Response;
    data: TUserGetProfileResponse;
  }> => {
    const response = await fetch(API_ENDPOINTS.API_GATEWAY_URL.USER.GET_PROFILE, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    const rawData = await response.json();
    const data = toCamelCase<TUserGetProfileResponse>(rawData);
    return {
      response,
      data,
    };
  },

  UPDATE_PROFILE: async (
    requestBody: TUserUpdateProfileRequest,
    token: string,
  ): Promise<{
    response: Response;
    data: TUserUpdateProfileResponse;
  }> => {
    const response = await fetch(API_ENDPOINTS.API_GATEWAY_URL.USER.UPDATE_PROFILE, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(requestBody),
    });
    const rawData = await response.json();
    const data = toCamelCase<TUserUpdateProfileResponse>(rawData);
    return {
      response,
      data,
    };
  },
} as const;
