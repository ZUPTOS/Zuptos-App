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
  process.env.NEXT_PUBLIC_PUBLIC_APP_URL?.trim() ?? "";

export const getMembersAppUrl = () =>
  process.env.NEXT_PUBLIC_MEMBERS_APP_URL?.trim() ?? "";

export const buildLoginRedirectUrl = (path = "/login") => {
  const publicAppUrl = getPublicAppUrl();
  const membersAppUrl = getMembersAppUrl();
  const redirectTarget = membersAppUrl ? `${membersAppUrl}${path}` : path;
  const redirectParam = encodeURIComponent(redirectTarget);
  return publicAppUrl
    ? `${publicAppUrl}/login?redirect=${redirectParam}`
    : `/login?redirect=${redirectParam}`;
};
