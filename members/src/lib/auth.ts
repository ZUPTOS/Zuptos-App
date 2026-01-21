const TOKEN_KEY = "authToken";

export const getToken = (): string | undefined => {
  if (typeof window === "undefined") return undefined;
  try {
    return localStorage.getItem(TOKEN_KEY) ?? undefined;
  } catch {
    return undefined;
  }
};

export const setToken = (token: string) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, token);
};

export const clearToken = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
};

export const isAuthed = () => Boolean(getToken());

export const getPublicAppUrl = () =>
  process.env.NEXT_PUBLIC_PUBLIC_APP_URL ?? "http://localhost:3000";

export const getMembersAppUrl = () =>
  process.env.NEXT_PUBLIC_MEMBERS_APP_URL ?? "http://localhost:3001";

export const buildLoginRedirectUrl = (path = "/dashboard") => {
  const publicAppUrl = getPublicAppUrl();
  const membersAppUrl = getMembersAppUrl();
  const redirectTarget = `${membersAppUrl}${path}`;
  return `${publicAppUrl}/login?redirect=${encodeURIComponent(redirectTarget)}`;
};
