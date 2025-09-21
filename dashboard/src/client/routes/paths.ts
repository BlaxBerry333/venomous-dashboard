export const ROUTER_PATHS = {
  ROOT: "/",

  AUTH: {
    SIGNIN: "/auth/signin",
    SIGNUP: "/auth/signup",
  },

  DASHBOARD: {
    ROOT: "/dashboard/media",
    MEDIA: "/dashboard/media",
    NOTES: "/dashboard/notes",
    WORKFLOW: "/dashboard/workflow",

    USER_PROFILE: "/dashboard/profile",
  },
} as const;
