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
  },
} as const;
