const DEFAULT_BACKEND_URL = "https://surprised-bikini-asp-suffered.trycloudflare.com";

export const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ||
  buildLocalBackendUrl() ||
  DEFAULT_BACKEND_URL
).replace(/\/$/, "");

export function apiUrl(path) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
}

export const API_REQUEST_HEADERS = {
  "ngrok-skip-browser-warning": "true",
};

function buildLocalBackendUrl() {
  const host = import.meta.env.VITE_BACKEND_HOST;
  const port = import.meta.env.VITE_BACKEND_PORT;

  if (!host || !port) {
    return "";
  }

  return `http://${host}:${port}`;
}
