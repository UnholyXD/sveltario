import { randomBytes } from 'node:crypto';
import type { Cookies } from '@sveltejs/kit';

export const SESSION_COOKIE_NAME = 'sveltario_session';
export const SESSION_TTL_MS = 8 * 60 * 60 * 1000;

export interface SessionRecord {
  usuario: string;
  expiresAt: number;
}

const sessions = new Map<string, SessionRecord>();

export function createSession(usuario: string): { token: string; session: SessionRecord } {
  const token = randomBytes(32).toString('hex');
  const session = {
    usuario,
    expiresAt: Date.now() + SESSION_TTL_MS
  };

  sessions.set(token, session);
  return { token, session };
}

export function getSessionFromRequest(cookies: Cookies): { usuario: string } | null {
  const token = cookies.get(SESSION_COOKIE_NAME);
  if (!token) {
    return null;
  }

  const session = sessions.get(token);
  if (!session) {
    return null;
  }

  if (session.expiresAt <= Date.now()) {
    sessions.delete(token);
    return null;
  }

  return { usuario: session.usuario };
}

export function destroySession(cookies: Cookies): void {
  const token = cookies.get(SESSION_COOKIE_NAME);
  if (token) {
    sessions.delete(token);
  }

  cookies.delete(SESSION_COOKIE_NAME, { path: '/' });
}

/** Invalidate every active session belonging to a user. */
export function destroySessionsForUser(usuario: string): void {
  for (const [token, session] of sessions) {
    if (session.usuario === usuario) sessions.delete(token);
  }
}

export function getSessionFromCookieValue(cookieValue: string | undefined): { usuario: string } | null {
  if (!cookieValue) {
    return null;
  }

  const session = sessions.get(cookieValue);
  if (!session) {
    return null;
  }

  if (session.expiresAt <= Date.now()) {
    sessions.delete(cookieValue);
    return null;
  }

  return { usuario: session.usuario };
}
