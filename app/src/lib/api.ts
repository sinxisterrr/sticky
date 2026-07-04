import type { Note } from './types';

const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';

function authHeader(): Record<string, string> {
  const token = localStorage.getItem('sticky_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function req<T>(path: string, opts: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      ...authHeader(),
      ...(opts.headers as Record<string, string> ?? {}),
    },
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export const api = {
  auth: {
    google: (credential: string) =>
      req<{ token: string; user: { id: number; email: string; display_name: string; avatar_url: string } }>(
        '/auth/google', { method: 'POST', body: JSON.stringify({ credential }) }
      ),
  },
  notes: {
    list: () => req<Note[]>('/notes'),
    create: (data: Partial<Note>) => req<Note>('/notes', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: Partial<Note>) =>
      req<Note>(`/notes/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (id: string) => req<{ ok: boolean }>(`/notes/${id}`, { method: 'DELETE' }),
    getColors: () => req<{ color: string; position: number }[]>('/notes/colors'),
    saveColors: (colors: string[]) =>
      req<{ ok: boolean }>('/notes/colors', { method: 'PUT', body: JSON.stringify({ colors }) }),
  },
};
