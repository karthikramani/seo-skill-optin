# Supabase Quick Start (3 Minutes)

## ✅ Step 1: Get Your Credentials

Go to your Supabase project:
1. Click **Settings** (gear icon in sidebar)
2. Click **API** tab
3. Copy these two values:

**Project URL:**
```
https://xxxxxxxxxxxxx.supabase.co
```

**anon public key:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## ✅ Step 2: Update Configuration

Edit this file: `crm/supabase-client.js`

Find lines 4-5 and replace:
```javascript
const SUPABASE_URL = 'YOUR_SUPABASE_URL' // ← Paste your Project URL here
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY' // ← Paste your anon key here
```

**Example:**
```javascript
const SUPABASE_URL = 'https://abcdefgh.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTU2NzMyMDAsImV4cCI6MjAxMTI0OTIwMH0.xxx'
```

---

## ✅ Step 3: Create Database Table

In Supabase:
1. Click **SQL Editor** in sidebar
2. Click **New query**
3. Open the file `supabase-schema.sql` from this project
4. **Copy the entire contents**
5. **Paste into Supabase SQL Editor**
6. Click **Run** (or press Ctrl+Enter)

You should see:
```
Success. No rows returned
```

---

## ✅ Step 4: Deploy

```bash
git add crm/supabase-client.js
git commit -m "Configure Supabase credentials"
git push origin main
```

Vercel will auto-deploy in ~30 seconds.

---

## ✅ Step 5: Test

1. Open CRM: https://seo-skill.openclawpages.com/crm/
2. Open browser console (F12)
3. Look for: `✅ Loaded X contacts from Supabase`
4. Add a test contact
5. Go to Supabase → **Table Editor** → **contacts**
6. You should see your contact!

---

## 🎉 Done!

Your CRM now has:
- ✅ Real PostgreSQL database
- ✅ Real-time sync across all browsers
- ✅ Automatic backups
- ✅ SQL analytics
- ✅ Unlimited scale

---

## 📊 Verify Data

**In Supabase Table Editor:**
- Click **contacts** table
- You'll see all CRM data
- Can edit/delete directly
- Export to CSV

**In SQL Editor:**
```sql
-- See all contacts
SELECT * FROM contacts;

-- See stats
SELECT * FROM contact_stats;

-- Count by stage
SELECT stage, COUNT(*) FROM contacts GROUP BY stage;
```

---

## 🚨 Troubleshooting

**"Failed to load from Supabase"**
→ Check URL and anon key are correct

**"Table 'contacts' does not exist"**
→ Run the SQL schema (Step 3)

**"Row Level Security policy violation"**
→ Schema includes public access policy

---

**Need help?** Check `SUPABASE-SETUP.md` for detailed docs.
