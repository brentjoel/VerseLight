export function resolveSiteUrl(value: string | undefined): URL {
  if (!value?.trim()) return new URL("http://localhost:3000");
  try {
    const url = new URL(value.trim());
    const local = url.hostname === "localhost" || url.hostname === "127.0.0.1";
    if ((url.protocol !== "https:" && !(local && url.protocol === "http:")) || url.username || url.password || url.search || url.hash || url.pathname !== "/") throw new Error();
    return new URL(url.origin);
  } catch {
    throw new Error("NEXT_PUBLIC_SITE_URL must be an HTTPS origin, or HTTP localhost for development.");
  }
}

export const siteUrl = resolveSiteUrl(process.env.NEXT_PUBLIC_SITE_URL);
