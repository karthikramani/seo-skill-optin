# Vercel KV Setup for CRM

## Quick Setup (3 Steps)

### 1. Create Vercel KV Store

Go to your Vercel dashboard:
1. Navigate to your project: **seo-skill-optin**
2. Click **Storage** tab
3. Click **Create Database**
4. Select **KV (Redis)**
5. Name it: `seo-skill-crm`
6. Click **Create**

### 2. Connect to Project

Vercel will automatically add environment variables:
- `KV_URL`
- `KV_REST_API_URL`
- `KV_REST_API_TOKEN`
- `KV_REST_API_READ_ONLY_TOKEN`

These are automatically available to your API routes.

### 3. Deploy

The CRM is already configured to use Vercel KV. Just deploy:

```bash
git add .
git commit -m "Add Vercel KV integration"
git push origin main
```

Vercel will automatically:
- Install `@vercel/kv` package
- Connect to your KV store
- Make the API available at `/api/contacts`

## How It Works

### API Endpoints

**GET `/api/contacts`**
- Returns all contacts from KV
- Response: `{ contacts: [...] }`

**POST `/api/contacts`**
- Saves all contacts to KV
- Body: `{ contacts: [...] }`
- Response: `{ success: true, count: 10 }`

**PUT `/api/contacts`**
- Updates single contact
- Body: `{ contact: {...} }`
- Response: `{ success: true, contact: {...} }`

**DELETE `/api/contacts?id=123`**
- Deletes contact by ID
- Response: `{ success: true, deleted: 123 }`

### CRM Integration

The CRM automatically:
1. Loads contacts from Vercel KV on startup
2. Saves to KV after every change
3. Falls back to localStorage if API unavailable
4. Syncs localStorage to KV on first load (migration)

### Data Structure

Stored in Vercel KV as:
```json
{
  "crm_contacts": [
    {
      "id": 1,
      "name": "John Smith",
      "email": "john@example.com",
      "stage": 1,
      "tags": ["hot-lead"],
      "notes": [...],
      "activity": [...],
      "emails": [...],
      "createdAt": "2026-03-22T..."
    }
  ]
}
```

### Vercel KV Benefits

✅ **Fast**: Redis-based, sub-millisecond reads
✅ **Scalable**: Handles thousands of contacts
✅ **Global**: Edge network for low latency
✅ **Synced**: Data available across all browsers
✅ **Persistent**: Data never lost
✅ **Free tier**: 3,000 commands/day free

## Vercel Dashboard Access

**Create KV Store:**
https://vercel.com/flexifunnels1/seo-skill-optin/stores

**View Data:**
https://vercel.com/flexifunnels1/seo-skill-optin/stores/seo-skill-crm

## Testing

After setup, test the API:

```bash
# Get all contacts
curl https://seo-skill.openclawpages.com/api/contacts

# Add contact
curl -X POST https://seo-skill.openclawpages.com/api/contacts \
  -H "Content-Type: application/json" \
  -d '{"contacts": [{"id": 1, "name": "Test", "email": "test@example.com"}]}'
```

## Migration

Existing localStorage data will automatically sync to Vercel KV on first load.

The CRM includes a migration function:
```javascript
// Run in browser console to force sync
await window.CRM_API.syncLocalStorageToAPI();
```

## Pricing

**Vercel KV Free Tier:**
- 3,000 commands/day
- 256 MB storage
- Perfect for CRM with 1000s of contacts

**Paid (if needed):**
- $1/100K commands
- Scales automatically

## Backup

Export CSV regularly from CRM dashboard:
1. Click **Export CSV**
2. Save to Google Drive/Dropbox
3. Scheduled backup recommended

## Support

Vercel KV docs: https://vercel.com/docs/storage/vercel-kv

Issues? Check:
1. KV store is created in Vercel dashboard
2. Environment variables are set
3. Project is deployed (not just local dev)
4. API endpoint returns 200 (test with curl)

---

**Next deployment will automatically connect to Vercel KV!** 🚀
