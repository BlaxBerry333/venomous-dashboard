export const SERVICE_NAMES = {
  DASHBOARD: "dashboard",
  AUTH: "auth",
  MEDIA: "media",
  NOTES: "notes",
  WORKFLOW: "workflow",
} as const;

export const __NOTES_SERVICE_PATHS = {
  LIST: "/dashboard/notes-list",
  CREATE: "/dashboard/notes-create",
  DETAIL: "/dashboard/notes-detail", // +?id={noteId}
} as const;

export const __MEDIA_SERVICE_PATHS = {
  LIST: "/dashboard/media-list",
  CREATE: "/dashboard/media-create",
  DETAIL: "/dashboard/media-detail", // +?id={mediaId}
} as const;

export const __WORKFLOW_SERVICE_PATHS = {
  LIST: "/dashboard/workflow-list",
  CREATE: "/dashboard/workflow-create",
  DETAIL: "/dashboard/workflow-detail", // +?id={workflowId}
} as const;

export const ROUTER_PATHS = {
  ROOT: "/",
  AUTH: {
    SIGNIN: "/auth/signin",
    SIGNUP: "/auth/signup",
  },
  DASHBOARD: {
    MEDIA_LIST: __MEDIA_SERVICE_PATHS.LIST,
    MEDIA_CREATE: __MEDIA_SERVICE_PATHS.CREATE,
    MEDIA_DETAIL: __MEDIA_SERVICE_PATHS.DETAIL,
    NOTES_LIST: __NOTES_SERVICE_PATHS.LIST,
    NOTES_CREATE: __NOTES_SERVICE_PATHS.CREATE,
    NOTES_DETAIL: __NOTES_SERVICE_PATHS.DETAIL,
    WORKFLOW_LIST: __WORKFLOW_SERVICE_PATHS.LIST,
    WORKFLOW_CREATE: __WORKFLOW_SERVICE_PATHS.CREATE,
    WORKFLOW_DETAIL: __WORKFLOW_SERVICE_PATHS.DETAIL,
  },
} as const;
