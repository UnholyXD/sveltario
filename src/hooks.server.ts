import { redirect, type Handle } from '@sveltejs/kit';
import { getSessionFromRequest } from '$lib/server/auth/session';

const publicPages = new Set(['/login']);
const publicAuthApis = new Set(['/api/auth/login', '/api/auth/logout', '/api/auth/session']);

export const handle: Handle = async ({ event, resolve }) => {
  const pathname = event.url.pathname;
  const session = getSessionFromRequest(event.cookies);

  if (pathname.startsWith('/_app/') || pathname === '/favicon.ico') {
    return resolve(event);
  }

  if (pathname.startsWith('/api/')) {
    if (!session && !publicAuthApis.has(pathname)) {
      return new Response(JSON.stringify({ error: 'Não autenticado.' }), {
        status: 401,
        headers: { 'content-type': 'application/json' }
      });
    }

    return resolve(event);
  }

  if (publicPages.has(pathname)) {
    if (session) {
      redirect(303, '/');
    }

    return resolve(event);
  }

  if (!session) {
    redirect(303, '/login');
  }

  return resolve(event);
};
