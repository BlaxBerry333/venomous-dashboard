import { cookies } from "next/headers";

export const COOKIE_NAME = {
  ACCESS_TOKEN: "__DASHBOARD_AUTH_TOKEN",
} as const;

/**
 * Get access token from cookie
 */
export const getAccessCookie = async () => {
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_NAME.ACCESS_TOKEN);
};

/**
 * Set access token to cookie
 */
export const setAccessCookie = async (token: string) => {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME.ACCESS_TOKEN, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
};

/**
 * Remove access token from cookie
 */
export const removeAccessCookie = async () => {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME.ACCESS_TOKEN);
};
