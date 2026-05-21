'use client';

import { FormEvent, useMemo, useState } from 'react';

type Contact = {
  id: string;
  type: string;
  status: string;
  source: string;
  name: string;
  business: string;
  email: string;
  phone?: string;
  pain?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

type ApiResult = {
  ok: boolean;
  items?: Contact[];
  contact?: Contact;
  duplicate?: boolean;
  duplicates?: Contact[];
  error?: string;
  errors?: Record<string, string>;
};

const emptyForm = {
  name: '',
  business: '',
  email: '',
  phone: '',
  pain: '',
  notes: '',
  type: 'lead',
  status: 'new',
  source: 'manual',
};

const statusOptions = [
  ['new', 'New'],
  ['warm', 'Warm'],
  ['active', 'Active'],
  ['paused', 'Paused'],
  ['closed', 'Closed'],
  ['not_fit', 'Not fit'],
];

function authHeaders(token: string) {
  return { Authorization: `Bearer ${token}` };
}

export function AdminContactsClient() {
  const [token, setToken] = useState('');
  const [query, setQuery] = useState('');
  const [type, setType] = useState('');
  const [status, setStatus] = useState('');
  const [source, setSource] = useState('');
  const [items, setItems] = useState<Contact[]>([]);
  const [duplicateItems, setDuplicateItems] = useState<Contact[]>([]);
  const [allowDuplicate, setAllowDuplicate] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState('Enter the admin token, then search or create a lead.');
  const [busy, setBusy] = useState(false);

  const canSubmit = useMemo(() => token.trim().length > 0, [token]);

  async function loadContacts(event?: FormEvent) {
    event?.preventDefault();
    if (!canSubmit) return setMessage('Admin token is required.');
    setBusy(true);
    setMessage('Searching contacts...');
    try {
      const params = new URLSearchParams();
      if (query) params.set('q', query);
      if (type) params.set('type', type);
      if (status) params.set('status', status);
      if (source) params.set('source', source);
      const response = await fetch(`/api/admin/contacts?${params.toString()}`, {
        headers: authHeaders(token),
        cache: 'no-store',
      });
      const data = (await response.json()) as ApiResult;
      if (!response.ok || !data.ok) throw new Error(data.error || 'Search failed.');
      setItems(data.items || []);
      setMessage(`${data.items?.length || 0} contact${data.items?.length === 1 ? '' : 's'} found.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Search failed.');
    } finally {
      setBusy(false);
    }
  }

  async function createContact(event: FormEvent) {
    event.preventDefault();
    if (!canSubmit) return setMessage('Admin token is required.');
    setBusy(true);
    setMessage('Creating lead...');
    setDuplicateItems([]);
    try {
      const response = await fetch('/api/admin/contacts', {
        method: 'POST',
        headers: { ...authHeaders(token), 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, allowDuplicate }),
      });
      const data = (await response.json()) as ApiResult;
      if (response.status === 409 && data.duplicate) {
        setDuplicateItems(data.duplicates || []);
        setMessage(data.error || 'Possible duplicate found. Review it before creating another contact.');
        return;
      }
      if (!response.ok || !data.ok) {
        const detail = data.errors ? Object.values(data.errors).join(' ') : data.error;
        throw new Error(detail || 'Create failed.');
      }
      setForm(emptyForm);
      setAllowDuplicate(false);
      setItems((current) => (data.contact ? [data.contact, ...current] : current));
      setMessage(`Created ${data.contact?.business || 'new lead'}.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Create failed.');
    } finally {
      setBusy(false);
    }
  }

  async function updateStatus(contact: Contact, nextStatus: string) {
    if (!canSubmit) return setMessage('Admin token is required.');
    setBusy(true);
    setMessage(`Updating ${contact.business}...`);
    try {
      const response = await fetch(`/api/admin/contacts/${contact.id}`, {
        method: 'PATCH',
        headers: { ...authHeaders(token), 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });
      const data = (await response.json()) as ApiResult;
      if (!response.ok || !data.ok || !data.contact) throw new Error(data.error || 'Status update failed.');
      setItems((current) => current.map((item) => (item.id === data.contact?.id ? data.contact : item)));
      setMessage(`${data.contact.business} moved to ${data.contact.status}.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Status update failed.');
    } finally {
      setBusy(false);
    }
  }

  function renderContact(contact: Contact, compact = false) {
    return (
      <article key={contact.id} className="rounded-3xl border border-navy-800/12 bg-cream-50/85 p-5 shadow-xl shadow-navy-950/5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="font-display text-xl font-semibold text-navy-950">{contact.business}</h3>
            <p className="text-sm text-graphite-600">{contact.name} · {contact.email}{contact.phone ? ` · ${contact.phone}` : ''}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-sage-600">
            <span>{contact.type}</span>
            <span>{contact.status}</span>
            <span>{contact.source}</span>
          </div>
        </div>
        {contact.pain ? <p className="mt-4 text-sm leading-relaxed text-graphite-600">{contact.pain}</p> : null}
        {contact.notes ? <p className="mt-2 text-sm leading-relaxed text-graphite-500">Notes: {contact.notes}</p> : null}
        {!compact ? (
          <label className="mt-4 block text-sm font-medium text-navy-950">
            Update status
            <select
              className="mt-2 rounded-xl border border-navy-800/15 bg-cream-50 px-3 py-2 text-sm"
              value={contact.status}
              onChange={(event) => updateStatus(contact, event.target.value)}
              disabled={busy}
            >
              {statusOptions.map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </label>
        ) : null}
      </article>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
      <section className="rounded-3xl border border-navy-800/12 bg-cream-50/85 p-6 shadow-xl shadow-navy-950/5">
        <h2 className="font-display text-2xl font-semibold tracking-[-0.03em] text-navy-950">Search contacts</h2>
        <p className="mt-2 text-sm leading-relaxed text-graphite-600">Search by name, business, email, phone, workflow issue, or notes.</p>
        <label className="mt-5 block text-sm font-medium text-navy-950">
          Admin token
          <input className="mt-2 w-full rounded-xl border border-navy-800/15 bg-cream-50 px-3 py-2 text-sm" type="password" value={token} onChange={(event) => setToken(event.target.value)} />
        </label>
        <form className="mt-5 grid gap-3" onSubmit={loadContacts}>
          <input className="rounded-xl border border-navy-800/15 bg-cream-50 px-3 py-2 text-sm" placeholder="Search contacts" value={query} onChange={(event) => setQuery(event.target.value)} />
          <div className="grid gap-3 md:grid-cols-3">
            <select className="rounded-xl border border-navy-800/15 bg-cream-50 px-3 py-2 text-sm" value={type} onChange={(event) => setType(event.target.value)}>
              <option value="">Any type</option>
              <option value="lead">Lead</option>
              <option value="prospect">Prospect</option>
              <option value="client">Client</option>
            </select>
            <select className="rounded-xl border border-navy-800/15 bg-cream-50 px-3 py-2 text-sm" value={status} onChange={(event) => setStatus(event.target.value)}>
              <option value="">Any status</option>
              {statusOptions.map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
            <select className="rounded-xl border border-navy-800/15 bg-cream-50 px-3 py-2 text-sm" value={source} onChange={(event) => setSource(event.target.value)}>
              <option value="">Any source</option>
              <option value="manual">Manual</option>
              <option value="tally">Tally</option>
              <option value="cal">Cal.com</option>
              <option value="email">Email</option>
              <option value="referral">Referral</option>
            </select>
          </div>
          <button className="rounded-lg bg-sage-500 px-4 py-2 text-sm font-semibold text-navy-950 disabled:opacity-50" disabled={busy} type="submit">
            {busy ? 'Working...' : 'Search'}
          </button>
        </form>
        <p className="mt-4 rounded-2xl bg-sage-500/10 p-3 text-sm text-graphite-600">{message}</p>
      </section>

      <section className="rounded-3xl border border-navy-800/12 bg-cream-50/85 p-6 shadow-xl shadow-navy-950/5">
        <h2 className="font-display text-2xl font-semibold tracking-[-0.03em] text-navy-950">Create new lead</h2>
        <form className="mt-5 grid gap-3" onSubmit={createContact}>
          <div className="grid gap-3 md:grid-cols-2">
            <input required className="rounded-xl border border-navy-800/15 bg-cream-50 px-3 py-2 text-sm" placeholder="Name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
            <input required className="rounded-xl border border-navy-800/15 bg-cream-50 px-3 py-2 text-sm" placeholder="Business" value={form.business} onChange={(event) => setForm({ ...form, business: event.target.value })} />
            <input required className="rounded-xl border border-navy-800/15 bg-cream-50 px-3 py-2 text-sm" placeholder="Email" type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
            <input className="rounded-xl border border-navy-800/15 bg-cream-50 px-3 py-2 text-sm" placeholder="Phone" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} />
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <select className="rounded-xl border border-navy-800/15 bg-cream-50 px-3 py-2 text-sm" value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value })}>
              <option value="lead">Lead</option>
              <option value="prospect">Prospect</option>
              <option value="client">Client</option>
            </select>
            <select className="rounded-xl border border-navy-800/15 bg-cream-50 px-3 py-2 text-sm" value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}>
              {statusOptions.map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
            <select className="rounded-xl border border-navy-800/15 bg-cream-50 px-3 py-2 text-sm" value={form.source} onChange={(event) => setForm({ ...form, source: event.target.value })}>
              <option value="manual">Manual</option>
              <option value="tally">Tally</option>
              <option value="cal">Cal.com</option>
              <option value="email">Email</option>
              <option value="referral">Referral</option>
            </select>
          </div>
          <textarea className="min-h-24 rounded-xl border border-navy-800/15 bg-cream-50 px-3 py-2 text-sm" placeholder="Workflow issue or pain point" value={form.pain} onChange={(event) => setForm({ ...form, pain: event.target.value })} />
          <textarea className="min-h-24 rounded-xl border border-navy-800/15 bg-cream-50 px-3 py-2 text-sm" placeholder="Private notes" value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} />
          {duplicateItems.length > 0 ? (
            <div className="rounded-2xl border border-sage-500/30 bg-sage-500/10 p-4">
              <p className="text-sm font-semibold text-navy-950">Possible duplicate found.</p>
              <div className="mt-3 grid gap-3">
                {duplicateItems.map((contact) => renderContact(contact, true))}
              </div>
              <label className="mt-4 flex items-center gap-2 text-sm text-graphite-600">
                <input type="checkbox" checked={allowDuplicate} onChange={(event) => setAllowDuplicate(event.target.checked)} />
                Create another contact anyway
              </label>
            </div>
          ) : null}
          <button className="rounded-lg bg-navy-950 px-4 py-2 text-sm font-semibold text-cream-50 disabled:opacity-50" disabled={busy} type="submit">
            {busy ? 'Working...' : allowDuplicate ? 'Create anyway' : 'Create lead'}
          </button>
        </form>
      </section>

      <section className="lg:col-span-2">
        <div className="grid gap-3">
          {items.map((contact) => renderContact(contact))}
        </div>
      </section>
    </div>
  );
}
