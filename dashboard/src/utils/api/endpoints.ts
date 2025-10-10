export const API_ENDPOINTS = {
  API_GATEWAY_URL: {
    AUTH: {
      SIGNUP: `${process.env.NEXT_PUBLIC_ENDPOINT_API_GATEWAY}/api/auth/signup`,
      SIGNIN: `${process.env.NEXT_PUBLIC_ENDPOINT_API_GATEWAY}/api/auth/signin`,
      LOGOUT: `${process.env.NEXT_PUBLIC_ENDPOINT_API_GATEWAY}/api/auth/logout`,
      TOKEN_VERIFY: `${process.env.NEXT_PUBLIC_ENDPOINT_API_GATEWAY}/api/auth/token-verify`,
      TOKEN_INFO: `${process.env.NEXT_PUBLIC_ENDPOINT_API_GATEWAY}/api/auth/token-info`,
      TOKEN_REFRESH: `${process.env.NEXT_PUBLIC_ENDPOINT_API_GATEWAY}/api/auth/token-refresh`,
    },

    USER: {
      GET_PROFILE: `${process.env.NEXT_PUBLIC_ENDPOINT_API_GATEWAY}/api/user/profile`,
      UPDATE_PROFILE: `${process.env.NEXT_PUBLIC_ENDPOINT_API_GATEWAY}/api/user/profile`,
    },

    NOTES: {
      // Memos
      GET_LIST_MEMOS: `${process.env.NEXT_PUBLIC_ENDPOINT_API_GATEWAY}/api/notes/memos`,
      GET_MEMO: `${process.env.NEXT_PUBLIC_ENDPOINT_API_GATEWAY}/api/notes/memos`,
      CREATE_MEMO: `${process.env.NEXT_PUBLIC_ENDPOINT_API_GATEWAY}/api/notes/memos`,
      UPDATE_MEMO: `${process.env.NEXT_PUBLIC_ENDPOINT_API_GATEWAY}/api/notes/memos`,
      DELETE_MEMO: `${process.env.NEXT_PUBLIC_ENDPOINT_API_GATEWAY}/api/notes/memos`,

      // Articles
      GET_LIST_ARTICLES: `${process.env.NEXT_PUBLIC_ENDPOINT_API_GATEWAY}/api/notes/articles`,
      GET_ARTICLE: `${process.env.NEXT_PUBLIC_ENDPOINT_API_GATEWAY}/api/notes/articles`,
      CREATE_ARTICLE: `${process.env.NEXT_PUBLIC_ENDPOINT_API_GATEWAY}/api/notes/articles`,
      UPDATE_ARTICLE: `${process.env.NEXT_PUBLIC_ENDPOINT_API_GATEWAY}/api/notes/articles`,
      DELETE_ARTICLE: `${process.env.NEXT_PUBLIC_ENDPOINT_API_GATEWAY}/api/notes/articles`,

      // Chapters
      GET_CHAPTER: `${process.env.NEXT_PUBLIC_ENDPOINT_API_GATEWAY}/api/notes/articles`,
      CREATE_CHAPTER: `${process.env.NEXT_PUBLIC_ENDPOINT_API_GATEWAY}/api/notes/articles`,
      UPDATE_CHAPTER: `${process.env.NEXT_PUBLIC_ENDPOINT_API_GATEWAY}/api/notes/articles`,
      DELETE_CHAPTER: `${process.env.NEXT_PUBLIC_ENDPOINT_API_GATEWAY}/api/notes/articles`,
    },
  },
} as const;
