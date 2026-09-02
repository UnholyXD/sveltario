import { json } from '@sveltejs/kit';
import { getSessionFromRequest } from '$lib/server/auth/session';

export async function GET({ cookies }: { cookies: any }) {
  const session = getSessionFromRequest(cookies);
  return json({
    authenticated: Boolean(session),
    usuario: session?.usuario ?? null
  });
}
