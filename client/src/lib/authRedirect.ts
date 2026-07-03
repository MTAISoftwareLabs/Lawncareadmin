/** Read `?next=` from the current URL and return a safe in-app path. */
export function getPostAuthRedirect(fallback = "/app"): string {
  const next = new URLSearchParams(window.location.search).get("next");
  if (next && next.startsWith("/") && !next.startsWith("//")) {
    return next;
  }
  return fallback;
}
