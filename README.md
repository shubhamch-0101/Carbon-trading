# CarbonScope Intelligence

A self-contained full-stack MVP for corporate carbon performance, budgets, credit inventory, project intelligence, and a controlled internal RFQ marketplace.

## Run

```bash
npm start
```

Open `http://localhost:4173`.

Demo administrator:

- Email: `admin@carbonscope.demo`
- Password: `Demo123!`

## What is implemented

- Authentication, registration, protected API routes, organization record, and role checks for administrative and seller operations.
- Persistent local JSON database with 12 synthetic companies, 15 projects, 40 credit lots, 30 listings, and 100 price observations.
- Command Center with data-derived KPIs, trends, supply chart, and deterministic budget insights.
- Company directory, profiles, filtering, CSV export, company creation/archive API, and emissions/budget entry forms.
- Carbon budget calculations: actual emissions, utilization, forecast variance, and potential emissions-gap framing.
- Credit lot inventory and validated ledger movement endpoint that prevents negative eligible availability and over-retirement.
- Project directory, marketplace filters, controlled listing creation, internal RFQ submission, alerts, global search, reports export, and demo reset control.

## Verification

```bash
npm test
```

The test suite exercises authentication/dashboard metrics plus the inventory and listing quantity safeguards.

## Intentional MVP limits

All seeded records are visibly labelled synthetic demo data. There are no live registry transfers, payments, price feeds, regulatory sources, email delivery, or external identity provider connections. Production deployment should replace the JSON store and in-memory sessions with an ACID database, secure password hashing/session storage, CSRF protection, managed secrets, and a real authorization model.
