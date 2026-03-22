-- Supabase Schema for SEO Skill CRM
-- Run this in Supabase SQL Editor

-- Create contacts table
CREATE TABLE IF NOT EXISTS contacts (
    id BIGINT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    stage INTEGER NOT NULL DEFAULT 1,
    source TEXT,
    tags JSONB DEFAULT '[]'::jsonb,
    notes JSONB DEFAULT '[]'::jsonb,
    activity JSONB DEFAULT '[]'::jsonb,
    emails JSONB DEFAULT '[]'::jsonb,
    initial_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index on email for fast lookups
CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts(email);

-- Create index on stage for filtering
CREATE INDEX IF NOT EXISTS idx_contacts_stage ON contacts(stage);

-- Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_contacts_created_at ON contacts(created_at DESC);

-- Create index on tags for filtering (GIN index for JSONB)
CREATE INDEX IF NOT EXISTS idx_contacts_tags ON contacts USING GIN (tags);

-- Enable Row Level Security (RLS)
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (adjust based on your needs)
-- For now, allow all operations without authentication for simplicity
CREATE POLICY "Allow all operations on contacts" ON contacts
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Optional: Create a function to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update updated_at
CREATE TRIGGER update_contacts_updated_at
    BEFORE UPDATE ON contacts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create view for contact stats (optional, useful for analytics)
CREATE OR REPLACE VIEW contact_stats AS
SELECT
    COUNT(*) as total_contacts,
    COUNT(*) FILTER (WHERE stage = 1) as new_leads,
    COUNT(*) FILTER (WHERE stage = 2) as contacted,
    COUNT(*) FILTER (WHERE stage = 3) as engaged,
    COUNT(*) FILTER (WHERE stage = 4) as customers,
    COUNT(*) FILTER (WHERE stage = 5) as inactive,
    COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE) as today_contacts,
    COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '7 days') as week_contacts,
    ROUND(
        COUNT(*) FILTER (WHERE stage = 4)::NUMERIC / 
        NULLIF(COUNT(*)::NUMERIC, 0) * 100, 
        2
    ) as conversion_rate
FROM contacts;

-- Grant access to the view
GRANT SELECT ON contact_stats TO anon, authenticated;

-- Insert sample data (optional, for testing)
-- DELETE THIS SECTION IN PRODUCTION
/*
INSERT INTO contacts (id, name, email, stage, source, tags, created_at) VALUES
(1, 'John Smith', 'john@example.com', 1, 'seo-skill-optin', '["hot-lead"]'::jsonb, NOW()),
(2, 'Jane Doe', 'jane@example.com', 2, 'seo-skill-optin', '["follow-up"]'::jsonb, NOW() - INTERVAL '1 day'),
(3, 'Bob Wilson', 'bob@example.com', 4, 'seo-skill-optin', '["customer", "vip"]'::jsonb, NOW() - INTERVAL '7 days');
*/
