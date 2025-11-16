export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

export const APP_TITLE = process.env.NEXT_PUBLIC_APP_TITLE || "App";

export const APP_LOGO =
  process.env.NEXT_PUBLIC_APP_LOGO ||
  "https://placehold.co/128x128/E1E7EF/1F2937?text=App";

// Generate login URL at runtime so redirect URI reflects the current origin.
const resolveWindow = () => {
  if (typeof globalThis === "undefined") {
    return undefined;
  }
  const maybeWindow = globalThis as typeof globalThis & { window?: Window };
  return maybeWindow.window;
};

export const getLoginUrl = (targetWindow?: Window | null) => {
  const currentWindow =
    typeof targetWindow === "undefined" ? resolveWindow() : targetWindow;

  if (!currentWindow) {
    throw new Error("getLoginUrl must be called in a browser environment");
  }

  const oauthPortalUrl = process.env.NEXT_PUBLIC_OAUTH_PORTAL_URL;
  const appId = process.env.NEXT_PUBLIC_APP_ID;

  if (!oauthPortalUrl || !appId) {
    throw new Error(
      "NEXT_PUBLIC_OAUTH_PORTAL_URL and NEXT_PUBLIC_APP_ID must be defined."
    );
  }

  const redirectUri = `${currentWindow.location.origin}/api/oauth/callback`;
  const state = btoa(redirectUri);

  const url = new URL(`${oauthPortalUrl}/app-auth`);
  url.searchParams.set("appId", appId);
  url.searchParams.set("redirectUri", redirectUri);
  url.searchParams.set("state", state);
  url.searchParams.set("type", "signIn");

  return url.toString();
};
