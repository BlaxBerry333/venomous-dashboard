export const SERVICE_NAMES = {
  DASHBOARD: "dashboard",
  AUTH: "auth",
  MEDIAS: "medias",
  NOTES: "notes",
  WORKFLOWS: "workflow",
} as const;

export const __NOTES_SERVICE_PATHS = {
  LIST: "/dashboard/notes-list",
  CREATE: "/dashboard/notes-create",
  DETAIL: "/dashboard/notes-detail", // +?id={noteId}
} as const;

export const __MEDIAS_SERVICE_PATHS = {
  LIST: "/dashboard/medias-list",
  CREATE: "/dashboard/medias-create",
  DETAIL: "/dashboard/medias-detail", // +?id={mediaId}
} as const;

export const __WORKFLOWS_SERVICE_PATHS = {
  LIST: "/dashboard/workflows-list",
  CREATE: "/dashboard/workflows-create",
  DETAIL: "/dashboard/workflows-detail", // +?id={workflowId}
} as const;

export const ROUTER_PATHS = {
  ROOT: "/",
  AUTH: {
    SIGNIN: "/auth/signin",
    SIGNUP: "/auth/signup",
  },
  DASHBOARD: {
    MEDIA_LIST: __MEDIAS_SERVICE_PATHS.LIST,
    MEDIA_CREATE: __MEDIAS_SERVICE_PATHS.CREATE,
    MEDIA_DETAIL: __MEDIAS_SERVICE_PATHS.DETAIL,
    NOTES_LIST: __NOTES_SERVICE_PATHS.LIST,
    NOTES_CREATE: __NOTES_SERVICE_PATHS.CREATE,
    NOTES_DETAIL: __NOTES_SERVICE_PATHS.DETAIL,
    WORKFLOW_LIST: __WORKFLOWS_SERVICE_PATHS.LIST,
    WORKFLOW_CREATE: __WORKFLOWS_SERVICE_PATHS.CREATE,
    WORKFLOW_DETAIL: __WORKFLOWS_SERVICE_PATHS.DETAIL,
  },
} as const;
