import { NextResponse } from 'next/server';

import { getContactsStore, jsonError, requireAdmin } from '@/lib/contacts/api';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireAdmin(request);
  if (auth) return auth;

  try {
    const { id } = await params;
    const contact = await getContactsStore().getContact(id);
    if (!contact) return NextResponse.json({ ok: false, error: 'Contact not found.' }, { status: 404 });
    return NextResponse.json({ ok: true, contact });
  } catch (error) {
    return jsonError(error);
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireAdmin(request);
  if (auth) return auth;

  try {
    const { id } = await params;
    const body = await request.json();
    const contact = await getContactsStore().updateContact(id, body);
    if (!contact) return NextResponse.json({ ok: false, error: 'Contact not found.' }, { status: 404 });
    return NextResponse.json({ ok: true, contact });
  } catch (error) {
    return jsonError(error);
  }
}
