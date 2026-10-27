// Shared API configuration and request helpers.
export const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:8000"
).replace(/\/$/, "");
export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

/** Send an API request and retry once after refreshing an expired access token. */
export async function apiFetch(path, options = {}) {
  const buildHeaders = (token) => ({
    ...(options.body instanceof FormData
      ? {}
      : { "Content-Type": "application/json" }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  });

  let token = localStorage.getItem("apc_access_token");
  let response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: buildHeaders(token),
  });

  // Transparently renew an expired access token once, then retry the original request.
  const isAuthEndpoint =
    path.startsWith("/api/auth/login") ||
    path.startsWith("/api/auth/register") ||
    path.startsWith("/api/auth/google") ||
    path.startsWith("/api/auth/refresh");

  if (response.status === 401 && !isAuthEndpoint) {
    const refreshToken = localStorage.getItem("apc_refresh_token");
    if (refreshToken) {
      const refreshResponse = await fetch(`${API_URL}/api/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });
      const refreshed = await refreshResponse.json().catch(() => ({}));

      if (
        refreshResponse.ok &&
        refreshed.access_token &&
        refreshed.refresh_token
      ) {
        localStorage.setItem("apc_access_token", refreshed.access_token);
        localStorage.setItem("apc_refresh_token", refreshed.refresh_token);
        token = refreshed.access_token;
        response = await fetch(`${API_URL}${path}`, {
          ...options,
          headers: buildHeaders(token),
        });
      } else {
        localStorage.removeItem("apc_access_token");
        localStorage.removeItem("apc_refresh_token");
        throw new Error(
          "เซสชันหมดอายุแล้ว กรุณาเข้าสู่ระบบใหม่ คำตอบที่ยังอยู่ในช่องจะไม่ถูกล้าง",
        );
      }
    }
  }

  const data =
    response.status === 204 ? null : await response.json().catch(() => ({}));
  if (!response.ok)
    throw new Error(data?.detail || "เกิดข้อผิดพลาด กรุณาลองใหม่");
  return data;
}

/** Convert a project record from the API into the shape used by the UI. */
export function toProject(project) {
  return {
    id: project.id,
    title: project.title,
    type: project.type || "University",
    date: project.updated_at
      ? new Date(project.updated_at).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : "Just now",
    questions: project.questions || 0,
    score: project.score ?? null,
    color: "purple",
    description: project.description || "",
    presentations: project.presentations || [],
    sessions: project.sessions || 0,
  };
}
