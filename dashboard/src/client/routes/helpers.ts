import { SERVICE_NAMES, __MEDIAS_SERVICE_PATHS, __NOTES_SERVICE_PATHS, __WORKFLOWS_SERVICE_PATHS } from "./paths";

const isPathIncludeService = (pathname: string, servicePaths: Record<string, string>) => {
  // Remove locale prefix (e.g., /zh-CN or /en) to get the actual path
  const pathWithoutLocale = pathname.replace(/^\/[^/]+/, "");
  return Object.values(servicePaths).some((servicePath) => pathWithoutLocale.startsWith(servicePath));
};

/**
 * get service name from pathname
 * @param pathname
 * @returns
 */
export const getServiceNameFromPathname = (pathname: string) => {
  if (isPathIncludeService(pathname, __MEDIAS_SERVICE_PATHS)) {
    return SERVICE_NAMES.MEDIAS;
  }

  if (isPathIncludeService(pathname, __NOTES_SERVICE_PATHS)) {
    return SERVICE_NAMES.NOTES;
  }

  if (isPathIncludeService(pathname, __WORKFLOWS_SERVICE_PATHS)) {
    return SERVICE_NAMES.WORKFLOWS;
  }

  return undefined;
};
