import type * as Types from "@/types";
import { toCamelCase } from "@/utils/helper";
import { API_ENDPOINTS } from "../endpoints";

export const NOTES_FETCHERS = {
  GET_LIST_MEMOS: async (
    token: string,
  ): Promise<{
    response: Response;
    data: Types.TMemoListResponse;
  }> => {
    const response = await fetch(API_ENDPOINTS.API_GATEWAY_URL.NOTES.GET_LIST_MEMOS, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    const rawData = await response.json();
    const data = toCamelCase<Types.TMemoListResponse>(rawData);
    return {
      response,
      data,
    };
  },

  GET_MEMO: async (
    { id }: Types.TMemoGetRequest,
    token: string,
  ): Promise<{
    response: Response;
    data: Types.TMemoGetResponse;
  }> => {
    const response = await fetch(`${API_ENDPOINTS.API_GATEWAY_URL.NOTES.GET_MEMO}/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    const rawData = await response.json();
    const data = toCamelCase<Types.TMemoGetResponse>(rawData);
    return {
      response,
      data,
    };
  },

  CREATE_MEMO: async (
    requestBody: Types.TMemoCreateRequest,
    token: string,
  ): Promise<{
    response: Response;
    data: Types.TMemoCreateResponse;
  }> => {
    const response = await fetch(API_ENDPOINTS.API_GATEWAY_URL.NOTES.CREATE_MEMO, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(requestBody),
    });
    const rawData = await response.json();
    const data = toCamelCase<Types.TMemoCreateResponse>(rawData);
    return {
      response,
      data,
    };
  },

  UPDATE_MEMO: async (
    requestBody: Types.TMemoUpdateRequest,
    token: string,
  ): Promise<{
    response: Response;
    data: Types.TMemoUpdateResponse;
  }> => {
    const response = await fetch(`${API_ENDPOINTS.API_GATEWAY_URL.NOTES.UPDATE_MEMO}/${requestBody.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(requestBody),
    });
    const rawData = await response.json();
    const data = toCamelCase<Types.TMemoUpdateResponse>(rawData);
    return {
      response,
      data,
    };
  },

  DELETE_MEMO: async (
    requestBody: Types.TMemoDeleteRequest,
    token: string,
  ): Promise<{
    response: Response;
    data: Types.TMemoDeleteResponse;
  }> => {
    const response = await fetch(`${API_ENDPOINTS.API_GATEWAY_URL.NOTES.DELETE_MEMO}/${requestBody.id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    const rawData = await response.json();
    const data = toCamelCase<Types.TMemoDeleteResponse>(rawData);
    return {
      response,
      data,
    };
  },

  GET_LIST_ARTICLES: async (
    token: string,
  ): Promise<{
    response: Response;
    data: Types.TArticleListResponse;
  }> => {
    const response = await fetch(API_ENDPOINTS.API_GATEWAY_URL.NOTES.GET_LIST_ARTICLES, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    const rawData = await response.json();
    const data = toCamelCase<Types.TArticleListResponse>(rawData);
    return {
      response,
      data,
    };
  },

  GET_ARTICLE: async (
    { id }: Types.TArticleGetRequest,
    token: string,
  ): Promise<{
    response: Response;
    data: Types.TArticleGetResponse;
  }> => {
    const response = await fetch(`${API_ENDPOINTS.API_GATEWAY_URL.NOTES.GET_ARTICLE}/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    const rawData = await response.json();
    const data = toCamelCase<Types.TArticleGetResponse>(rawData);
    return {
      response,
      data,
    };
  },

  CREATE_ARTICLE: async (
    requestBody: Types.TArticleCreateRequest,
    token: string,
  ): Promise<{
    response: Response;
    data: Types.TArticleCreateResponse;
  }> => {
    const response = await fetch(API_ENDPOINTS.API_GATEWAY_URL.NOTES.CREATE_ARTICLE, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(requestBody),
    });
    const rawData = await response.json();
    const data = toCamelCase<Types.TArticleCreateResponse>(rawData);
    return {
      response,
      data,
    };
  },

  UPDATE_ARTICLE: async (
    requestBody: Types.TArticleUpdateRequest,
    token: string,
  ): Promise<{
    response: Response;
    data: Types.TArticleUpdateResponse;
  }> => {
    const response = await fetch(`${API_ENDPOINTS.API_GATEWAY_URL.NOTES.UPDATE_ARTICLE}/${requestBody.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(requestBody),
    });
    const rawData = await response.json();
    const data = toCamelCase<Types.TArticleUpdateResponse>(rawData);
    return {
      response,
      data,
    };
  },

  DELETE_ARTICLE: async (
    requestBody: Types.TArticleDeleteRequest,
    token: string,
  ): Promise<{
    response: Response;
    data: Types.TArticleDeleteResponse;
  }> => {
    const response = await fetch(`${API_ENDPOINTS.API_GATEWAY_URL.NOTES.DELETE_ARTICLE}/${requestBody.id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    const rawData = await response.json();
    const data = toCamelCase<Types.TArticleDeleteResponse>(rawData);
    return {
      response,
      data,
    };
  },

  GET_CHAPTER: async (
    { articleId, chapterId }: Types.TChapterGetRequest,
    token: string,
  ): Promise<{
    response: Response;
    data: Types.TChapterGetResponse;
  }> => {
    const response = await fetch(`${API_ENDPOINTS.API_GATEWAY_URL.NOTES.GET_CHAPTER}/${articleId}/chapters/${chapterId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    const rawData = await response.json();
    const data = toCamelCase<Types.TChapterGetResponse>(rawData);
    return {
      response,
      data,
    };
  },

  CREATE_CHAPTER: async (
    requestBody: Types.TChapterCreateRequest,
    token: string,
  ): Promise<{
    response: Response;
    data: Types.TChapterCreateResponse;
  }> => {
    const response = await fetch(`${API_ENDPOINTS.API_GATEWAY_URL.NOTES.CREATE_CHAPTER}/${requestBody.articleId}/chapters`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(requestBody),
    });
    const rawData = await response.json();
    const data = toCamelCase<Types.TChapterCreateResponse>(rawData);
    return {
      response,
      data,
    };
  },

  UPDATE_CHAPTER: async (
    requestBody: Types.TChapterUpdateRequest,
    token: string,
  ): Promise<{
    response: Response;
    data: Types.TChapterUpdateResponse;
  }> => {
    const response = await fetch(`${API_ENDPOINTS.API_GATEWAY_URL.NOTES.UPDATE_CHAPTER}/${requestBody.articleId}/chapters/${requestBody.chapterId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(requestBody),
    });
    const rawData = await response.json();
    const data = toCamelCase<Types.TChapterUpdateResponse>(rawData);
    return {
      response,
      data,
    };
  },

  DELETE_CHAPTER: async (
    requestBody: Types.TChapterDeleteRequest,
    token: string,
  ): Promise<{
    response: Response;
    data: Types.TChapterDeleteResponse;
  }> => {
    const response = await fetch(`${API_ENDPOINTS.API_GATEWAY_URL.NOTES.DELETE_CHAPTER}/${requestBody.articleId}/chapters/${requestBody.chapterId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    const rawData = await response.json();
    const data = toCamelCase<Types.TChapterDeleteResponse>(rawData);
    return {
      response,
      data,
    };
  },
} as const;
