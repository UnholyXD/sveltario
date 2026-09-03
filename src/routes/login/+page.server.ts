import { redirect } from '@sveltejs/kit';
import { getSessionFromRequest } from '$lib/server/auth/session';

export function load({ cookies }) {
  if (getSessionFromRequest(cookies)) {
    redirect(303, '/');
  }
}
