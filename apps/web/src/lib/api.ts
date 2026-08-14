const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api";

export type ApiError = { error?: { message?: string } };

export async function apiFetch<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(init.headers ?? {}) },
  });
  const payload = (await response.json().catch(() => ({}))) as T & ApiError;
  if (!response.ok)
    throw new Error(payload.error?.message ?? "เกิดข้อผิดพลาด กรุณาลองใหม่");
  return payload;
}
