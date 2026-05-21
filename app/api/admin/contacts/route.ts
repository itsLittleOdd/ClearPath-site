import { NextResponse } from 'next/server';

import { getContactsStore, jsonError, requireAdmin } from '@/lib/contacts/api';

export async function GET(request: Request) {
  const auth = requireAdmin(request);
  if (auth) return auth;

  try {
    const { searchParams } = new URL(request.url);
    const result = await getContactsStore().searchContacts({
      q: searchParams.get('q') || '',
      type: searchParams.get('type') || '',
      status: searchParams.get('status') || '',
      source: searchParams.get('source') || '',
    });
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: Request) {
  const auth = requireAdmin(request);
  if (auth) return auth;

  try {
    const body = await request.json();
    const allowDuplicate = body?.allowDuplicate === true;
    const store = getContactsStore();
    const duplicates = await store.findDuplicateContacts(body);

    if (!allowDuplicate && duplicates.items.length > 0) {
      return NextResponse.json(
        {
          ok: false,
          duplicate: true,
          error: 'Possible duplicate found. Review it before creating another contact.',
          duplicates: duplicates.items,
        },
        { status: 409 },
      );
    }

    const contact = await store.createContact(body);
    return NextResponse.json({ ok: true, contact }, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
