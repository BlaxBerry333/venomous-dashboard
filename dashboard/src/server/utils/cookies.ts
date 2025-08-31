import { cookies } from "next/headers";

export const COOKIE_NAME = {
  ACCESS_TOKEN: "__DASHBOARD_AUTH_TOKEN",
} as const;

export const getAccessCookie = async () => {
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_NAME.ACCESS_TOKEN);
};

export const setAccessCookie = async (token: string) => {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME.ACCESS_TOKEN, token, {
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
};

export const removeAccessCookie = async () => {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME.ACCESS_TOKEN);
};
