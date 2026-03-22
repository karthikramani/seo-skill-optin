// Supabase Client for CRM
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

// Initialize Supabase client
const SUPABASE_URL = 'https://tfpaqpntfqxteuskooob.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRmcGFxcG50ZnF4dGV1c2tvb29iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQyMDY0OTUsImV4cCI6MjA4OTc4MjQ5NX0.yzXC7ReUjwnrMGIqWVbW-QBmk2UrifoddHk9s4PdDBY'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// Load contacts from Supabase
async function loadContacts() {
    try {
        const { data, error } = await supabase
            .from('contacts')
            .select('*')
            .order('created_at', { ascending: false })
        
        if (error) throw error
        
        // Convert Supabase format to CRM format
        contacts = data.map(contact => ({
            id: contact.id,
            name: contact.name,
            email: contact.email,
            phone: contact.phone,
            stage: contact.stage,
            source: contact.source,
            tags: contact.tags || [],
            notes: contact.notes || [],
            activity: contact.activity || [],
            emails: contact.emails || [],
            initialNotes: contact.initial_notes,
            createdAt: contact.created_at,
            updatedAt: contact.updated_at
        }))
        
        console.log(`✅ Loaded ${contacts.length} contacts from Supabase`)
        
        // Also save to localStorage as backup
        localStorage.setItem('crm_contacts', JSON.stringify(contacts))
    } catch (error) {
        console.error('Failed to load from Supabase:', error)
        // Fallback to localStorage
        const stored = localStorage.getItem('crm_contacts')
        if (stored) {
            contacts = JSON.parse(stored)
            console.log('⚠️ Using localStorage fallback')
        }
    }
}

// Save contact to Supabase
async function saveContact(contact) {
    try {
        const supabaseContact = {
            id: contact.id,
            name: contact.name,
            email: contact.email,
            phone: contact.phone,
            stage: contact.stage,
            source: contact.source,
            tags: contact.tags || [],
            notes: contact.notes || [],
            activity: contact.activity || [],
            emails: contact.emails || [],
            initial_notes: contact.initialNotes,
            created_at: contact.createdAt,
            updated_at: new Date().toISOString()
        }
        
        const { data, error } = await supabase
            .from('contacts')
            .upsert(supabaseContact, { onConflict: 'id' })
            .select()
        
        if (error) throw error
        
        console.log('✅ Contact saved to Supabase')
        
        // Update localStorage
        const index = contacts.findIndex(c => c.id === contact.id)
        if (index > -1) {
            contacts[index] = contact
        } else {
            contacts.push(contact)
        }
        localStorage.setItem('crm_contacts', JSON.stringify(contacts))
        
        return data[0]
    } catch (error) {
        console.error('Failed to save to Supabase:', error)
        // Fallback: save to localStorage only
        const index = contacts.findIndex(c => c.id === contact.id)
        if (index > -1) {
            contacts[index] = contact
        } else {
            contacts.push(contact)
        }
        localStorage.setItem('crm_contacts', JSON.stringify(contacts))
    }
}

// Save all contacts (bulk update)
async function saveContacts() {
    try {
        const supabaseContacts = contacts.map(contact => ({
            id: contact.id,
            name: contact.name,
            email: contact.email,
            phone: contact.phone,
            stage: contact.stage,
            source: contact.source,
            tags: contact.tags || [],
            notes: contact.notes || [],
            activity: contact.activity || [],
            emails: contact.emails || [],
            initial_notes: contact.initialNotes,
            created_at: contact.createdAt,
            updated_at: new Date().toISOString()
        }))
        
        const { error } = await supabase
            .from('contacts')
            .upsert(supabaseContacts, { onConflict: 'id' })
        
        if (error) throw error
        
        console.log(`✅ Saved ${contacts.length} contacts to Supabase`)
        
        // Update localStorage
        localStorage.setItem('crm_contacts', JSON.stringify(contacts))
    } catch (error) {
        console.error('Failed to save to Supabase:', error)
        // Fallback to localStorage
        localStorage.setItem('crm_contacts', JSON.stringify(contacts))
    }
}

// Delete contact from Supabase
async function deleteContactSupabase(contactId) {
    try {
        const { error } = await supabase
            .from('contacts')
            .delete()
            .eq('id', contactId)
        
        if (error) throw error
        
        console.log('✅ Contact deleted from Supabase')
        
        // Update local state
        contacts = contacts.filter(c => c.id !== contactId)
        localStorage.setItem('crm_contacts', JSON.stringify(contacts))
    } catch (error) {
        console.error('Failed to delete from Supabase:', error)
    }
}

// Sync localStorage to Supabase (migration)
async function syncLocalStorageToSupabase() {
    const stored = localStorage.getItem('crm_contacts')
    if (stored) {
        try {
            const localContacts = JSON.parse(stored)
            if (localContacts.length > 0) {
                console.log(`Migrating ${localContacts.length} contacts from localStorage to Supabase...`)
                contacts = localContacts
                await saveContacts()
                console.log('✅ Migration complete')
            }
        } catch (error) {
            console.error('Migration failed:', error)
        }
    }
}

// Real-time subscription (bonus feature!)
function subscribeToContacts(callback) {
    const subscription = supabase
        .channel('contacts_changes')
        .on('postgres_changes', 
            { event: '*', schema: 'public', table: 'contacts' },
            (payload) => {
                console.log('📡 Real-time update:', payload)
                callback(payload)
            }
        )
        .subscribe()
    
    return subscription
}

// Export for use in main CRM
if (typeof window !== 'undefined') {
    window.SUPABASE_CRM = {
        loadContacts,
        saveContact,
        saveContacts,
        deleteContactSupabase,
        syncLocalStorageToSupabase,
        subscribeToContacts,
        supabase // Expose client for advanced usage
    }
}
