# ClearPath Contacts Backend — Phase 3 Tally Webhook

Phase 3 connects the live Tally intake form to the durable contacts backend.

## Endpoint

```text
POST /api/tally/contacts
```

The route parses Tally submission payloads, maps the form fields into a ClearPath contact, checks duplicates, and creates a `source=tally` lead in the existing contacts store.

## Auth

Add a long random server-side secret:

```bash
CLEARPATH_TALLY_WEBHOOK_SECRET=
```

Accepted ways to send it:

1. Preferred if Tally supports custom headers:

```text
Authorization: Bearer <secret>
```

or:

```text
x-clearpath-tally-secret: <secret>
```

2. Fallback if Tally only supports a plain webhook URL:

```text
https://clearpathwv.com/api/tally/contacts?secret=<secret>
```

That URL includes a secret, so keep it private. Do not paste it in public docs, tickets, screenshots, or Discord.

## Field mapping

The parser accepts common Tally payload shapes and reads fields by `key`, `label`, `title`, or `name`.

Expected ClearPath fields:

- name: `Name`, `Full name`, `Your name`
- business: `Business`, `Business name`, `Company`, `Organization`
- email: `Email`, `Email address`
- phone: `Phone`, `Phone number`
- pain: `Pain point`, `Workflow issue`, `What's one repetitive task eating your time right now?`

Created contact defaults:

```json
{
  "source": "tally",
  "type": "lead",
  "status": "new"
}
```

Notes include the Tally submission id when present.

## Duplicate behavior

If the webhook submission matches an existing contact by normalized email or business name, it returns `200` with `duplicate: true` and does not create a second contact. This prevents webhook retries or repeat submissions from cluttering the CRM.

## Local curl smoke test

Use a throwaway secret locally. Do not paste the production secret into chat.

```bash
TOKEN="$CLEARPATH_TALLY_WEBHOOK_SECRET"

curl -i -X POST "http://localhost:3000/api/tally/contacts" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  --data '{
    "eventId":"evt_local_smoke",
    "data":{
      "fields":[
        {"label":"Name","value":"Tally Smoke Test"},
        {"label":"Business","value":"ClearPath Tally Test"},
        {"label":"Email","value":"tally-smoke@example.com"},
        {"label":"Pain point","value":"Lead capture follow-up is manual."}
      ]
    }
  }'
```

Expected:

- First run: `201 Created`
- Second run: `200 OK` with `duplicate: true`

Delete the smoke contact after validation.

## Verification

```bash
npm run test:contacts
npm run lint
npm run build
```

Expected contacts/webhook tests after Phase 3: 13 passing tests.

## Vercel setup

Add `CLEARPATH_TALLY_WEBHOOK_SECRET` to the ClearPath Vercel project for Production. A new deployment is needed before production can use it.

Then configure the Tally form webhook integration to call:

```text
https://clearpathwv.com/api/tally/contacts?secret=<secret>
```

If Tally allows custom headers, use the clean URL and send the secret as an auth header instead:

```text
https://clearpathwv.com/api/tally/contacts
```
