import type * as Types from "@/types";
import { toCamelCase } from "@/utils/helper";
import { API_ENDPOINTS } from "../endpoints";

export const USER_FETCHERS = {
  GET_PROFILE: async (
    token: string,
  ): Promise<{
    response: Response;
    data: Types.TUserGetProfileResponse;
  }> => {
    const response = await fetch(API_ENDPOINTS.API_GATEWAY_URL.USER.GET_PROFILE, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    const rawData = await response.json();
    const data = toCamelCase<Types.TUserGetProfileResponse>(rawData);
    return {
      response,
      data,
    };
  },

  UPDATE_PROFILE: async (
    requestBody: Types.TUserUpdateProfileRequest,
    token: string,
  ): Promise<{
    response: Response;
    data: Types.TUserUpdateProfileResponse;
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
    const data = toCamelCase<Types.TUserUpdateProfileResponse>(rawData);
    return {
      response,
      data,
    };
  },
} as const;
