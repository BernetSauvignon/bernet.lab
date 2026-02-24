const ABSOLUTE_URL_RE = /^(?:[a-z][a-z0-9+.-]*:)?\/\//i;

export function withBase(path: string): string {
  if (!path || ABSOLUTE_URL_RE.test(path) || path.startsWith("data:") || path.startsWith("#")) {
    return path;
  }

  const baseUrl = import.meta.env.BASE_URL;
  const normalizedBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;

  if (path.startsWith("/")) {
    return `${normalizedBase}${path.slice(1)}`;
  }

  return `${normalizedBase}${path}`;
}

export function basePathForRouter(): string {
  const baseUrl = import.meta.env.BASE_URL;
  if (baseUrl === "/") {
    return "";
  }
  return baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
}
