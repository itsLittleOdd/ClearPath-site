import { NextResponse } from 'next/server';

import { jsonError, getContactsStore, requireAdmin } from '@/lib/contacts/api';
import { buildContactsDigest } from '@/lib/contacts/digest';

export async function GET(request: Request) {
  const auth = requireAdmin(request);
  if (auth) return auth;

  try {
    const { searchParams } = new URL(request.url);
    const today = searchParams.get('today') || undefined;
    const limit = Number.parseInt(searchParams.get('limit') || '10', 10);
    const result = await getContactsStore().searchContacts({ action: 'needs_action', today });
    const digest = buildContactsDigest({
      contacts: result.items,
      today,
      limit: Number.isFinite(limit) && limit > 0 ? limit : 10,
    });
    return NextResponse.json({ ok: true, digest });
  } catch (error) {
    return jsonError(error);
  }
}
