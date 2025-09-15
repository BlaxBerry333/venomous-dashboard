export const API_ENDPOINTS = {
  API_GATEWAY_URL: {
    AUTH: {
      // User authentication endpoints
      SIGNUP: `${process.env.NEXT_PUBLIC_ENDPOINT_API_GATEWAY}/api/auth/signup`,
      SIGNIN: `${process.env.NEXT_PUBLIC_ENDPOINT_API_GATEWAY}/api/auth/signin`,
      LOGOUT: `${process.env.NEXT_PUBLIC_ENDPOINT_API_GATEWAY}/api/auth/logout`,

      // Token management endpoints (all proxied to authorization service)
      TOKEN_VERIFY: `${process.env.NEXT_PUBLIC_ENDPOINT_API_GATEWAY}/api/auth/token-verify`,
      TOKEN_INFO: `${process.env.NEXT_PUBLIC_ENDPOINT_API_GATEWAY}/api/auth/token-info`,
      TOKEN_REFRESH: `${process.env.NEXT_PUBLIC_ENDPOINT_API_GATEWAY}/api/auth/token-refresh`,

      // Legacy aliases for backward compatibility
      VERIFY: `${process.env.NEXT_PUBLIC_ENDPOINT_API_GATEWAY}/api/auth/token-verify`,
      REFRESH: `${process.env.NEXT_PUBLIC_ENDPOINT_API_GATEWAY}/api/auth/token-refresh`,
    },
  },
} as const;
