# 🚀 Hearts Vault - Deployment Quick Start

**Status**: ✅ Production Ready

---

## Prerequisites

- Cloudflare account (free tier)
- Node.js 18+ and npm
- GitHub account

---

## Step-by-Step Deployment

### 1. Install Wrangler CLI

```bash
npm install -g wrangler
```

### 2. Login to Cloudflare

```bash
wrangler login
```

This opens your browser to authenticate.

### 3. Deploy Database Schema

```bash
cd worker
wrangler d1 execute hearts-vault-db --file=./schema.sql
```

**Expected output**: "Successfully executed SQL"

### 4. Deploy Worker

```bash
wrangler deploy
```

**Expected output**:

```
✨ Build completed successfully
✨ Successfully published your Worker
URL: https://hearts-vault-api.YOUR-NAMESPACE.workers.dev
```

**IMPORTANT**: Copy this URL!

### 5. Update Frontend API Endpoint

Edit `frontend/script.js`, line 11:

```javascript
// BEFORE:
const API_ENDPOINT =
  "https://hearts-vault-api.84f629d8c780bdf50e8f170de72e5deb.workers.dev/submit";

// AFTER (use your actual Worker URL):
const API_ENDPOINT =
  "https://hearts-vault-api.YOUR-NAMESPACE.workers.dev/submit";
```

### 6. Deploy Frontend to GitHub Pages

```bash
# From project root
git add .
git commit -m "Deploy Hearts Vault production"
git push origin main
```

Then:

1. Go to GitHub repository → **Settings** → **Pages**
2. Source: **Deploy from a branch**
3. Branch: **main**
4. Folder: **/frontend**
5. Click **Save**

Wait 1-2 minutes for deployment.

### 7. Verify Deployment

**Test the live site**:

```
https://PrerithM.github.io/hearts-vault
```

**Test workflow**:

1. Enter your name
2. Enter a crush name
3. Click "Calculate Destiny"
4. Should see result with animated heart

**Verify database**:

```bash
wrangler d1 execute hearts-vault-db --command="SELECT COUNT(*) FROM submissions"
```

Should show count > 0 after test submission.

---

## Troubleshooting

### Issue: CORS Error in Browser Console

**Problem**: `Access to fetch at '...' has been blocked by CORS policy`

**Solution**: Ensure Worker CORS allows GitHub Pages origin:

- Check `worker/worker.js` line 13: `const ALLOWED_ORIGIN = 'https://PrerithM.github.io';`
- Redeploy Worker: `wrangler deploy`

### Issue: API Endpoint Not Found (404)

**Problem**: Frontend can't reach Worker

**Solution**:

1. Verify Worker URL matches `frontend/script.js` line 11
2. Check Worker is deployed: `wrangler deployments list`

### Issue: Database Not Found

**Problem**: `D1_ERROR: database not found`

**Solution**: Verify database ID in `wrangler.toml` matches:

```bash
wrangler d1 list
```

---

## Production Checklist

Before going live:

- [x] Worker deployed
- [x] Database schema created
- [ ] Frontend API endpoint updated
- [ ] GitHub Pages deployed
- [ ] Test submission successful
- [ ] Database contains test data
- [ ] CORS working (no console errors)
- [ ] Animations smooth on mobile
- [ ] Accessibility tested (keyboard navigation)

---

## Monitoring

### View Worker Logs

```bash
wrangler tail
```

Shows live request logs.

### View Database

```bash
# Count submissions
wrangler d1 execute hearts-vault-db --command="SELECT COUNT(*) FROM submissions"

# View recent submissions
wrangler d1 execute hearts-vault-db --command="SELECT * FROM submissions ORDER BY timestamp DESC LIMIT 5"

# Check stats
wrangler d1 execute hearts-vault-db --command="SELECT * FROM stats"
```

### Cloudflare Dashboard

- Workers & Pages → hearts-vault-api → Metrics
- D1 → hearts-vault-db → Metrics

---

## Support

Full documentation: [README.md](file:///c:/Users/preri/Downloads/FLAME/README.md)
Acceptance checklist: [docs/acceptance-checklist.md](file:///c:/Users/preri/Downloads/FLAME/docs/acceptance-checklist.md)

---

**Estimated deployment time**: 10 minutes ⏱️

**Expected result**: Award-winning FLAMES calculator live on the internet 🏆
