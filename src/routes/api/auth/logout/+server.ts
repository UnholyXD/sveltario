import { json } from '@sveltejs/kit';
import { destroySession } from '$lib/server/auth/session';

export async function POST({ cookies }: { cookies: any }) {
  destroySession(cookies);
  return json({ ok: true });
}
