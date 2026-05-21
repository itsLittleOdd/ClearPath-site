import { NextResponse } from 'next/server';

import { getContactsStore } from '@/lib/contacts/store';
import { processTallyWebhookSubmission } from '@/lib/contacts/tally';

function providedSecret(request: Request) {
  const authorization = request.headers.get('authorization') || '';
  if (authorization.toLowerCase().startsWith('bearer ')) return authorization.slice(7).trim();

  const headerSecret = request.headers.get('x-clearpath-tally-secret');
  if (headerSecret) return headerSecret.trim();

  const { searchParams } = new URL(request.url);
  return searchParams.get('secret') || '';
}

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON payload.' }, { status: 400 });
  }

  try {
    const result = await processTallyWebhookSubmission({
      payload,
      providedSecret: providedSecret(request),
      configuredSecret: process.env.CLEARPATH_TALLY_WEBHOOK_SECRET,
      store: getContactsStore(),
    });

    return NextResponse.json(result.body, { status: result.status });
  } catch (error) {
    const err = error as { status?: number; message?: string; errors?: Record<string, string> };
    return NextResponse.json(
      {
        ok: false,
        error: err.message || 'Tally webhook failed.',
        errors: err.errors,
      },
      { status: err.status || 500 },
    );
  }
}
