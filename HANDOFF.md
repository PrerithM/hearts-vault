# ✅ **Hearts Vault — Developer Handoff (D1 Architecture)**

---

## 1. Project Overview

**Project Name:** Hearts Vault (Flames Analytics)
**Purpose:** Collect user name, crush name, FLAMES result, and client/network metadata. Store securely in Cloudflare D1. No user login. Frontend hosted on GitHub Pages. Backend via Cloudflare Worker.

**Architecture:**

```
User Browser
     ↓
GitHub Pages (Frontend)
     ↓
Cloudflare Worker (API + Security)
     ↓
Cloudflare D1 (SQL Database)
```

---

## 2. Cloudflare Account & D1 Database

### Account

- Account ID: `84f629d8c780bdf50e8f170de72e5deb`

### D1 Database

- Name: `hearts-vault-db`
- Database ID: `803025e6-a2e0-4b2e-87b6-7a75b64bebd3`

### Access

- Antigravity will be invited to the Cloudflare account
- Secrets and bindings must be configured inside Cloudflare (no secrets in repo)

---

## 3. GitHub Repository

- Repository:
  [https://github.com/PrerithM/hearts-vault.git](https://github.com/PrerithM/hearts-vault.git)

- Frontend URL (GitHub Pages):
  [https://PrerithM.github.io/hearts-vault](https://PrerithM.github.io/hearts-vault)

### Repo Structure (Expected)

```
hearts-vault/
├─ frontend/
│  ├─ index.html
│  ├─ style.css
│  └─ script.js
├─ worker/
│  ├─ worker.js
│  └─ wrangler.toml
├─ docs/
│  └─ acceptance-checklist.md
└─ README.md
```

---

## 4. What Needs To Be Built

### Backend (Cloudflare Worker)

1. Bind Worker to D1 database `hearts-vault-db`
2. Implement POST endpoint:
   - Validate input
   - Hash IP
   - Store submission in D1
   - Update stats table

3. Configure CORS to allow only GitHub Pages origin
4. Deploy Worker

---

### Frontend (GitHub Pages)

1. Update the frontend UI and other elements accordingly
2. Integrate FLAMES logic
3. Collect client metadata
4. POST data to Worker
5. Show success/error feedback
6. Deploy via GitHub Pages

---

## 5. Worker Endpoint

After deployment:

```
https://hearts-vault-api.<namespace>.workers.dev
```

This endpoint will accept:

```json
POST /submit
Content-Type: application/json

{
  "name": "Rahul",
  "crush": "Anita",
  "result": "Love",
  "client": {
    "device": "mobile",
    "screen": "360x800",
    "language": "en-IN",
    "browser": "Chrome",
    "os": "Android"
  }
}
```

---

## 6. Database Schema (D1 / SQLite)

### Table: `submissions`

```sql
CREATE TABLE IF NOT EXISTS submissions (
  id TEXT PRIMARY KEY,
  timestamp TEXT NOT NULL,

  user_name TEXT NOT NULL,
  crush_name TEXT NOT NULL,
  result TEXT NOT NULL,

  device TEXT,
  screen TEXT,
  language TEXT,
  browser TEXT,
  os TEXT,

  country TEXT,
  city TEXT,
  ip_hash TEXT,

  session_id TEXT,
  referrer TEXT,
  page TEXT
);
```

---

### Table: `stats`

```sql
CREATE TABLE IF NOT EXISTS stats (
  key TEXT PRIMARY KEY,
  value INTEGER
);
```

Initial seed:

```sql
INSERT OR IGNORE INTO stats (key, value)
VALUES
  ('totalVisits', 0),
  ('totalSubmissions', 0);
```

---

## 7. Worker Configuration (wrangler.toml)

```toml
name = "hearts-vault-api"
main = "worker.js"
compatibility_date = "2026-02-13"

account_id = "84f629d8c780bdf50e8f170de72e5deb"

[[d1_databases]]
binding = "DB"
database_name = "hearts-vault-db"
database_id = "803025e6-a2e0-4b2e-87b6-7a75b64bebd3"
```

The Worker will access D1 via:

```js
env.DB;
```

---

## 8. Security Requirements

### CORS

Allow only:

```
https://PrerithM.github.io
```

Reject all others.

---

### Rate Limiting (Optional)

Target:

- Max 10 requests / minute / IP

Implementation via:

- In-memory Map
- Cloudflare Rate Limiting Rules (preferred)

---

### Input Validation

- Max 200 chars: `name`, `crush`
- Allowed results: `Friends`, `Love`, `Affection`, `Marriage`, `Enemies`, `Siblings`
- Reject empty fields

---

### IP Handling

- Use `CF-Connecting-IP`
- Hash using SHA-256
- Never store raw IP

---

## 9. Data Model (Logical JSON Equivalent)

Each row in `submissions` represents this logical object:

```json
{
  "id": "evt_1739445123123",
  "timestamp": "2026-02-13T12:10:00Z",

  "user": {
    "name": "Rahul",
    "crush": "Anita"
  },

  "result": "Love",

  "client": {
    "device": "mobile",
    "screen": "360x800",
    "language": "en-IN",
    "browser": "Chrome",
    "os": "Android"
  },

  "network": {
    "country": "India",
    "city": "Bengaluru",
    "ipHash": "91fa38b2..."
  },

  "session": {
    "sessionId": "s_83921",
    "referrer": "google",
    "page": "/"
  }
}
```

D1 = relational storage of this structure.

---

## 10. Acceptance Criteria

### Functional

- [ ] Worker deployed
- [ ] `/submit` endpoint reachable
- [ ] POST saves row in `submissions`
- [ ] `stats.totalSubmissions` increments
- [ ] Frontend receives `{ success: true }`

---

### Security

- [ ] CORS blocks non-GitHub Pages origins
- [ ] Raw IP never stored
- [ ] Inputs sanitized
- [ ] No secrets in repo

---

### Data

- [ ] Data visible in Cloudflare D1 console
- [ ] Rows match schema
- [ ] Timestamps ISO-8601
- [ ] No null critical fields

---

## 11. Deployment Steps (For Antigravity)

1. Clone repo
2. Install Wrangler

```bash
npm install -g wrangler
```

3. Login

```bash
wrangler login
```

4. Configure `wrangler.toml`
5. Run migrations (if needed)

```bash
wrangler d1 execute hearts-vault-db --file=./schema.sql
```

6. Deploy Worker

```bash
wrangler deploy
```

7. Update frontend endpoint
8. Deploy frontend to GitHub Pages
9. Run acceptance tests

---

## 12. Operations & Maintenance

- Monitor Worker logs
- Monitor D1 storage usage
- Rotate secrets yearly
- Backup D1 quarterly
- Export data when needed

---

## 13. Founder Note (For Internal Use)

This architecture is:

✅ Free tier compatible
✅ Scales to ~100k users/month
✅ No vendor lock-in
✅ Easy migration to Postgres later
✅ Resume-grade / portfolio-grade

---

# 🏁 Summary

With D1, your system is now:

> A real SaaS-style analytics backend running fully serverless.

You’ve moved from:
TXT → JSON → SQL DB → Production Cloud Stack

That’s serious engineering growth.
