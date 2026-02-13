# Hearts Vault - Acceptance Checklist

This checklist validates that the Hearts Vault platform meets all functional, security, and data quality requirements defined in the [HANDOFF.md](../HANDOFF.md) architecture document.

---

## ✅ Functional Requirements

### Backend Deployment

- [ ] Cloudflare Worker deployed successfully
- [ ] Worker accessible at `https://hearts-vault-api.<namespace>.workers.dev`
- [ ] D1 database `hearts-vault-db` created and bound to Worker
- [ ] Database schema applied (tables: `submissions`, `stats`)
- [ ] Initial stats seeded (`totalVisits: 0`, `totalSubmissions: 0`)

### API Endpoint

- [ ] POST `/submit` endpoint reachable
- [ ] Accepts JSON payload with `name`, `crush`, `result`, `client` fields
- [ ] Returns `{ success: true, submissionId, timestamp }` on success
- [ ] Returns proper error JSON on validation failure
- [ ] Handles OPTIONS preflight requests correctly

### Data Flow

- [ ] Form submission saves row in `submissions` table
- [ ] `stats.totalSubmissions` increments with each valid submission
- [ ] Data visible in Cloudflare D1 console
- [ ] Submission ID follows format: `evt_<timestamp>`
- [ ] Timestamp follows ISO-8601 format (e.g., `2026-02-13T12:34:56Z`)

### Frontend Integration

- [ ] Frontend form submits data to Worker endpoint
- [ ] Success response displays result to user
- [ ] Error response shows user-friendly error message
- [ ] Loading state shown during API call
- [ ] FLAMES result calculated correctly

---

## 🔒 Security Requirements

### CORS Protection

- [ ] Worker accepts requests ONLY from `https://PrerithM.github.io`
- [ ] Worker blocks requests from other origins (returns 403)
- [ ] Preflight OPTIONS requests include correct CORS headers
- [ ] No CORS headers sent to blocked origins

### IP Privacy

- [ ] Client IP obtained from `CF-Connecting-IP` header
- [ ] IP address hashed using SHA-256
- [ ] Only IP hash stored in database (verify no raw IPs in `ip_hash` column)
- [ ] Hash is consistently formatted (64-character hex string)

### Input Validation

- [ ] Names exceeding 200 characters rejected
- [ ] Empty names rejected
- [ ] Invalid FLAMES results rejected (must be one of: Friends, Love, Affection, Marriage, Enemies, Siblings)
- [ ] Missing required fields return 400 error
- [ ] Validation errors return descriptive error messages

### Secrets Management

- [ ] No API keys, secrets, or tokens in repository code
- [ ] Account ID and Database ID only in `wrangler.toml` (acceptable per HANDOFF.md)
- [ ] No credentials hardcoded in frontend JavaScript
- [ ] All sensitive operations handled server-side

---

## 📊 Data Quality Requirements

### Schema Compliance

- [ ] All `submissions` rows have required fields: `id`, `timestamp`, `user_name`, `crush_name`, `result`
- [ ] Timestamps are ISO-8601 formatted strings
- [ ] No null values in critical fields (`id`, `timestamp`, `user_name`, `crush_name`, `result`)
- [ ] Optional metadata fields properly stored (device, browser, OS, country, city)

### Data Integrity

- [ ] Submission IDs are unique
- [ ] Timestamps are accurate (within 1 minute of submission time)
- [ ] FLAMES results match allowed values
- [ ] Stats counters increment correctly

### Database Verification Queries

```sql
-- Count total submissions
SELECT COUNT(*) FROM submissions;

-- Check stats table
SELECT * FROM stats;

-- Verify recent submissions (last 5)
SELECT id, timestamp, user_name, crush_name, result
FROM submissions
ORDER BY timestamp DESC
LIMIT 5;

-- Verify no raw IPs stored (hash should be 64 chars)
SELECT LENGTH(ip_hash) as hash_length, COUNT(*)
FROM submissions
WHERE ip_hash IS NOT NULL
GROUP BY hash_length;

-- Check for null critical fields
SELECT COUNT(*) as null_critical_fields
FROM submissions
WHERE user_name IS NULL
   OR crush_name IS NULL
   OR result IS NULL
   OR timestamp IS NULL;
```

---

## 🎨 UI/UX Requirements

### Design Quality

- [ ] Liquid glass effects visible (frosted transparency, backdrop blur)
- [ ] Black background theme applied
- [ ] Red gradient hearts displayed and animated
- [ ] Smooth animations on all interactions (hover, focus, submit)
- [ ] Typography clean and readable (Inter font loaded)

### Responsiveness

- [ ] Layout works on mobile (320px - 767px)
- [ ] Layout works on tablet (768px - 1023px)
- [ ] Layout works on desktop (1024px+)
- [ ] No horizontal scrolling on any viewport size
- [ ] Touch targets minimum 44px on mobile

### Accessibility

- [ ] Keyboard navigation works (Tab, Enter, Escape)
- [ ] Focus indicators visible on interactive elements
- [ ] Form inputs have associated labels
- [ ] Error messages announced to screen readers (aria-live)
- [ ] Reduced motion respected (`prefers-reduced-motion`)

### User Experience

- [ ] Form submission provides clear feedback (loading state)
- [ ] Success state shows FLAMES result prominently
- [ ] Error state displays user-friendly message
- [ ] "Calculate Again" button resets form and scrolls to top
- [ ] Animations are smooth (no janky frame drops)

---

## 🚀 Deployment Requirements

### Backend

- [ ] Worker deployed via `wrangler deploy`
- [ ] Worker logs accessible via Cloudflare dashboard
- [ ] D1 database visible in Cloudflare dashboard
- [ ] Worker metrics available (requests, errors, latency)

### Frontend

- [ ] Frontend deployed to GitHub Pages
- [ ] Site accessible at `https://PrerithM.github.io/hearts-vault`
- [ ] API endpoint URL updated in `script.js`
- [ ] Assets load correctly (CSS, JS, fonts)
- [ ] No console errors in browser

---

## 🧪 End-to-End Test Scenarios

### Scenario 1: Happy Path

1. ✅ User visits GitHub Pages URL
2. ✅ User enters name: "Alice"
3. ✅ User enters crush: "Bob"
4. ✅ User clicks "Calculate Destiny"
5. ✅ Loading state appears
6. ✅ FLAMES result displays (e.g., "Love")
7. ✅ Database shows new row in `submissions` table
8. ✅ Stats counter incremented

### Scenario 2: Validation Error

1. ✅ User enters empty name
2. ✅ User clicks "Calculate Destiny"
3. ✅ Error message displays: "Please enter both names"
4. ✅ No database entry created

### Scenario 3: CORS Rejection

1. ✅ Developer makes request from non-allowed origin (e.g., `http://localhost:3000`)
2. ✅ Worker returns 403 Forbidden
3. ✅ CORS error visible in browser console

### Scenario 4: Mobile Experience

1. ✅ User visits site on mobile device (or DevTools mobile emulator)
2. ✅ Layout adapts to small screen
3. ✅ Form inputs are touch-friendly
4. ✅ Animations remain smooth
5. ✅ Result displays correctly

---

## 📋 Pre-Launch Verification

- [ ] All automated tests pass
- [ ] Manual testing completed
- [ ] Accessibility tested with keyboard only
- [ ] Accessibility tested with screen reader (NVDA/VoiceOver)
- [ ] Cross-browser testing (Chrome, Firefox, Safari, Edge)
- [ ] Performance audit (Lighthouse score 90+)
- [ ] Security audit (CORS, input validation, IP hashing)
- [ ] Database queries return expected data
- [ ] Worker logs show no errors
- [ ] GitHub Pages deployment successful

---

## 🏁 Sign-Off

| Requirement Category | Status | Verified By | Date |
| -------------------- | ------ | ----------- | ---- |
| Functional           | ⬜     |             |      |
| Security             | ⬜     |             |      |
| Data Quality         | ⬜     |             |      |
| UI/UX                | ⬜     |             |      |
| Deployment           | ⬜     |             |      |

**Status Legend**:

- ⬜ Not Started
- 🔄 In Progress
- ✅ Complete
- ❌ Failed

---

**Final Approval**: ******\_\_\_\_******  
**Date**: ******\_\_\_\_******

---

Once all checkboxes are marked ✅, Hearts Vault is **production-ready** 🚀
