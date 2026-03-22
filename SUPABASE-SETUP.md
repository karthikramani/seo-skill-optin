# Supabase Setup for SEO Skill CRM

## Quick Setup (5 Steps)

### 1. Get Supabase Credentials

From your Supabase project dashboard:
1. Go to **Settings** → **API**
2. Copy **Project URL** (looks like: `https://xxxxx.supabase.co`)
3. Copy **anon public** key (long string starting with `eyJ...`)

### 2. Update CRM Configuration

Edit `crm/supabase-client.js`:

```javascript
const SUPABASE_URL = 'https://your-project.supabase.co' // Your URL
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1...' // Your anon key
```

### 3. Create Database Table

In Supabase dashboard:
1. Go to **SQL Editor**
2. Click **New Query**
3. Copy the entire contents of `supabase-schema.sql`
4. Paste and click **Run**

This creates:
- `contacts` table with all fields
- Indexes for fast queries
- Row Level Security (RLS) policies
- Auto-update triggers
- Analytics view

### 4. Deploy to Vercel

```bash
git add .
git commit -m "Configure Supabase integration"
git push origin main
```

Vercel will auto-deploy.

### 5. Test the Connection

1. Open CRM: https://seo-skill.openclawpages.com/crm/
2. Check browser console for: `✅ Loaded X contacts from Supabase`
3. Add a test contact
4. Check Supabase **Table Editor** → `contacts` to see the data

---

## Database Schema

### `contacts` Table

| Column | Type | Description |
|--------|------|-------------|
| `id` | BIGINT | Primary key (auto from CRM) |
| `name` | TEXT | Contact name |
| `email` | TEXT | Contact email |
| `phone` | TEXT | Phone number (optional) |
| `stage` | INTEGER | Pipeline stage (1-5) |
| `source` | TEXT | Lead source (e.g., 'seo-skill-optin') |
| `tags` | JSONB | Array of tags |
| `notes` | JSONB | Array of note objects |
| `activity` | JSONB | Array of activity objects |
| `emails` | JSONB | Array of sent emails |
| `initial_notes` | TEXT | First notes about contact |
| `created_at` | TIMESTAMPTZ | When contact was created |
| `updated_at` | TIMESTAMPTZ | Last update time (auto) |

### Indexes

- `idx_contacts_email` - Fast email lookups
- `idx_contacts_stage` - Filter by pipeline stage
- `idx_contacts_created_at` - Sort by date
- `idx_contacts_tags` - Filter by tags (GIN index)

### Views

**`contact_stats`** - Real-time analytics:
```sql
SELECT * FROM contact_stats;
```

Returns:
- `total_contacts`
- `new_leads`, `contacted`, `engaged`, `customers`, `inactive`
- `today_contacts`, `week_contacts`
- `conversion_rate`

---

## Features Enabled

### ✅ Real Database
- PostgreSQL (production-grade)
- ACID compliance
- Transactions support
- Full SQL queries

### ✅ Real-time Sync
- Changes sync across all browsers instantly
- WebSocket-based subscriptions
- No polling needed

### ✅ Automatic Backups
- Supabase handles all backups
- Point-in-time recovery available
- No manual backup needed

### ✅ Advanced Queries
- Full SQL support via Supabase
- Analytics queries
- Custom reports
- Data export

### ✅ Scalability
- Handles millions of contacts
- Auto-scaling infrastructure
- CDN-backed globally

### ✅ Security
- Row Level Security (RLS)
- API key authentication
- Encrypted at rest
- SSL/TLS in transit

---

## Usage Examples

### Query Contacts Directly (SQL)

In Supabase SQL Editor:

```sql
-- Get all hot leads
SELECT * FROM contacts 
WHERE tags @> '["hot-lead"]'::jsonb;

-- Get contacts created today
SELECT * FROM contacts 
WHERE created_at >= CURRENT_DATE;

-- Get conversion funnel
SELECT 
    stage,
    COUNT(*) as count,
    ROUND(COUNT(*)::NUMERIC / SUM(COUNT(*)) OVER () * 100, 2) as percentage
FROM contacts
GROUP BY stage
ORDER BY stage;

-- Get email activity
SELECT 
    name,
    email,
    jsonb_array_length(emails) as email_count
FROM contacts
WHERE jsonb_array_length(emails) > 0
ORDER BY email_count DESC;
```

### Real-time Updates (JavaScript)

```javascript
// Subscribe to changes
const subscription = window.SUPABASE_CRM.subscribeToContacts((payload) => {
    console.log('Change detected:', payload);
    // payload.eventType: 'INSERT', 'UPDATE', 'DELETE'
    // payload.new: New row data
    // payload.old: Old row data
});

// Unsubscribe later
subscription.unsubscribe();
```

### Direct Supabase Access

```javascript
// Access Supabase client directly for custom queries
const { supabase } = window.SUPABASE_CRM;

// Custom query
const { data, error } = await supabase
    .from('contacts')
    .select('*')
    .eq('stage', 4)
    .order('created_at', { ascending: false })
    .limit(10);

console.log('Recent customers:', data);
```

---

## Migration from localStorage

The CRM automatically migrates existing localStorage data to Supabase on first load.

**Manual migration:**
```javascript
// In browser console
await window.SUPABASE_CRM.syncLocalStorageToSupabase();
```

After migration:
- ✅ All contacts in Supabase
- ✅ Notes preserved
- ✅ Activity history preserved
- ✅ Email history preserved
- ✅ Tags preserved

---

## Analytics & Reporting

### Built-in View

```sql
SELECT * FROM contact_stats;
```

### Custom Reports

```sql
-- Top performing sources
SELECT 
    source,
    COUNT(*) as total,
    COUNT(*) FILTER (WHERE stage = 4) as customers,
    ROUND(
        COUNT(*) FILTER (WHERE stage = 4)::NUMERIC / 
        COUNT(*)::NUMERIC * 100, 
        2
    ) as conversion_rate
FROM contacts
GROUP BY source
ORDER BY total DESC;

-- Activity heatmap by day
SELECT 
    DATE(created_at) as date,
    COUNT(*) as new_contacts
FROM contacts
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;
```

---

## Pricing

**Supabase Free Tier:**
- 500 MB database
- 1 GB file storage
- 2 GB bandwidth
- 50,000 monthly active users
- **Perfect for CRM with 10,000s of contacts**

**Paid Plans:**
- Pro: $25/month (8 GB database, 250 GB bandwidth)
- Team: $599/month (128 GB database, 5 TB bandwidth)

---

## Troubleshooting

### Check Connection

Browser console should show:
```
✅ Loaded X contacts from Supabase
```

If you see:
```
⚠️ Using localStorage fallback
```

**Check:**
1. Supabase URL and key are correct in `supabase-client.js`
2. Table `contacts` exists in Supabase
3. RLS policy allows anonymous access
4. No CORS errors in console

### Enable RLS Debug

```sql
-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'contacts';

-- Temporarily disable RLS (not recommended for production)
ALTER TABLE contacts DISABLE ROW LEVEL SECURITY;
```

### View Logs

Supabase dashboard → **Database** → **Logs**
- See all queries
- Debug errors
- Performance monitoring

---

## Security Best Practices

### Production Setup

1. **Create authenticated policy:**
```sql
-- Remove public policy
DROP POLICY "Allow all operations on contacts" ON contacts;

-- Add authenticated-only policy
CREATE POLICY "Authenticated users can manage contacts" ON contacts
    FOR ALL
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');
```

2. **Add user authentication** (Supabase Auth)
3. **Add user_id column** to track ownership
4. **Restrict by user_id** in policies

### API Key Rotation

1. Generate new anon key in Supabase
2. Update `supabase-client.js`
3. Redeploy
4. Revoke old key

---

## Backup & Export

### Automatic Backups
Supabase automatically backs up your database daily.

**Restore from backup:**
Supabase dashboard → **Database** → **Backups**

### Manual Export

**SQL:**
```sql
COPY (SELECT * FROM contacts) 
TO '/tmp/contacts_backup.csv' 
WITH CSV HEADER;
```

**Via CRM:**
Click **Export CSV** button in CRM interface.

---

## Support

- **Supabase Docs:** https://supabase.com/docs
- **SQL Reference:** https://supabase.com/docs/guides/database
- **Real-time Docs:** https://supabase.com/docs/guides/realtime

---

**Your CRM is now powered by Supabase!** 🚀

All contacts sync in real-time across devices and are stored securely in PostgreSQL.
