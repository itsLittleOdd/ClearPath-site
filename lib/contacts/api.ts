import { NextResponse } from 'next/server';

import { CONTACT_OPTIONS, getContactsStore } from '@/lib/contacts/store';

function unauthorized() {
  return NextResponse.json({ ok: false, error: 'Unauthorized.' }, { status: 401 });
}

export function requireAdmin(request: Request) {
  const token = process.env.CLEARPATH_ADMIN_TOKEN;
  if (!token) {
    return NextResponse.json(
      { ok: false, error: 'CLEARPATH_ADMIN_TOKEN is not configured.' },
      { status: 503 },
    );
  }

  const header = request.headers.get('authorization') || '';
  const expected = `Bearer ${token}`;
  if (header !== expected) return unauthorized();

  return null;
}

export function jsonError(error: unknown) {
  const err = error as { status?: number; message?: string; errors?: Record<string, string> };
  return NextResponse.json(
    {
      ok: false,
      error: err.message || 'Request failed.',
      errors: err.errors,
    },
    { status: err.status || 500 },
  );
}

export { CONTACT_OPTIONS, getContactsStore };
