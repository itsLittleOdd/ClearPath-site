import type { Metadata } from 'next';

import { AdminContactsClient } from '@/components/AdminContactsClient';
import { Container } from '@/components/Container';

export const metadata: Metadata = {
  title: { absolute: 'Contacts Admin | ClearPath' },
  robots: { index: false, follow: false },
};

export default function AdminContactsPage() {
  return (
    <main className="min-h-screen bg-cream-50 py-12 text-navy-950">
      <Container>
        <div className="mb-8 max-w-3xl">
          <p className="font-display text-eyebrow font-semibold uppercase tracking-[0.16em] text-sage-600">Private backend</p>
          <h1 className="mt-3 font-display text-[clamp(2.4rem,5vw,4rem)] font-semibold leading-none tracking-[-0.045em]">ClearPath contacts.</h1>
          <p className="mt-4 text-base leading-relaxed text-graphite-600">
            Search prospects and clients, or create a manual lead after a call, email, or referral. This page requires the admin token before the API returns data.
          </p>
        </div>
        <AdminContactsClient />
      </Container>
    </main>
  );
}
