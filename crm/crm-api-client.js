// CRM API Client - connects to Vercel KV backend

const API_BASE = '/api/contacts';

// Load contacts from API
async function loadContacts() {
    try {
        const response = await fetch(API_BASE);
        const data = await response.json();
        contacts = data.contacts || [];
        
        // Also sync to localStorage as backup
        localStorage.setItem('crm_contacts', JSON.stringify(contacts));
    } catch (error) {
        console.error('Failed to load from API, using localStorage:', error);
        // Fallback to localStorage
        const stored = localStorage.getItem('crm_contacts');
        if (stored) {
            contacts = JSON.parse(stored);
        }
    }
}

// Save contacts to API
async function saveContacts() {
    try {
        const response = await fetch(API_BASE, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ contacts })
        });
        
        if (!response.ok) {
            throw new Error('Failed to save to API');
        }
        
        // Also save to localStorage as backup
        localStorage.setItem('crm_contacts', JSON.stringify(contacts));
        
        console.log('✅ Contacts saved to Vercel KV');
    } catch (error) {
        console.error('Failed to save to API, saved to localStorage only:', error);
        // Fallback to localStorage only
        localStorage.setItem('crm_contacts', JSON.stringify(contacts));
    }
}

// Update single contact
async function updateContact(contact) {
    try {
        const response = await fetch(API_BASE, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ contact })
        });
        
        if (!response.ok) {
            throw new Error('Failed to update contact');
        }
        
        console.log('✅ Contact updated in Vercel KV');
    } catch (error) {
        console.error('Failed to update contact:', error);
    }
}

// Delete contact from API
async function deleteContactAPI(contactId) {
    try {
        const response = await fetch(`${API_BASE}?id=${contactId}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            throw new Error('Failed to delete contact');
        }
        
        console.log('✅ Contact deleted from Vercel KV');
    } catch (error) {
        console.error('Failed to delete contact:', error);
    }
}

// Sync localStorage to API (for migration)
async function syncLocalStorageToAPI() {
    const stored = localStorage.getItem('crm_contacts');
    if (stored) {
        try {
            const localContacts = JSON.parse(stored);
            if (localContacts.length > 0) {
                console.log(`Syncing ${localContacts.length} contacts from localStorage to API...`);
                contacts = localContacts;
                await saveContacts();
                console.log('✅ Sync complete');
            }
        } catch (error) {
            console.error('Sync failed:', error);
        }
    }
}

// Export for use in main CRM file
if (typeof window !== 'undefined') {
    window.CRM_API = {
        loadContacts,
        saveContacts,
        updateContact,
        deleteContactAPI,
        syncLocalStorageToAPI
    };
}
