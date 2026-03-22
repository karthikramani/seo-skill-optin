// CRM API Integration
// Handles opt-in capture and AgentMail email sending

const CRM_API = {
    // Add contact from opt-in form
    addContact: async function(name, email, source = 'seo-skill-optin') {
        const contact = {
            id: Date.now(),
            name: name,
            email: email,
            stage: 1, // New Lead
            source: source,
            notes: `Opted in from ${source}`,
            createdAt: new Date().toISOString()
        };

        // Save to localStorage
        let contacts = JSON.parse(localStorage.getItem('crm_contacts') || '[]');
        contacts.push(contact);
        localStorage.setItem('crm_contacts', JSON.stringify(contacts));

        // Send to backend (optional)
        try {
            const response = await fetch('/api/contacts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(contact)
            });
            if (response.ok) {
                console.log('✅ Contact saved to backend');
            }
        } catch (error) {
            console.log('ℹ️ Backend not available, saved locally');
        }

        return contact;
    },

    // Send email via AgentMail
    sendEmail: async function(to, subject, message, agentMailApiKey) {
        const emailData = {
            to: to,
            subject: subject,
            body: message,
            from: 'your-agent@agentmail.to' // Replace with your AgentMail address
        };

        try {
            const response = await fetch('https://api.agentmail.to/v1/send', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${agentMailApiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(emailData)
            });

            if (response.ok) {
                const result = await response.json();
                console.log('✅ Email sent via AgentMail:', result);
                return { success: true, result };
            } else {
                const error = await response.json();
                console.error('❌ AgentMail error:', error);
                return { success: false, error };
            }
        } catch (error) {
            console.error('❌ Failed to send email:', error);
            return { success: false, error: error.message };
        }
    },

    // Get all contacts
    getContacts: function() {
        return JSON.parse(localStorage.getItem('crm_contacts') || '[]');
    },

    // Update contact stage
    updateStage: function(contactId, newStage) {
        let contacts = this.getContacts();
        const contact = contacts.find(c => c.id === contactId);
        if (contact) {
            contact.stage = newStage;
            contact.updatedAt = new Date().toISOString();
            localStorage.setItem('crm_contacts', JSON.stringify(contacts));
            return contact;
        }
        return null;
    },

    // Export contacts to CSV
    exportToCSV: function() {
        const contacts = this.getContacts();
        const stages = ['New Lead', 'Contacted', 'Engaged', 'Customer', 'Inactive'];
        
        const csv = [
            ['Name', 'Email', 'Stage', 'Source', 'Created At', 'Notes'],
            ...contacts.map(c => [
                c.name,
                c.email,
                stages[c.stage - 1],
                c.source || 'direct',
                new Date(c.createdAt).toLocaleDateString(),
                c.notes || ''
            ])
        ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `crm-contacts-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    }
};

// Make available globally
if (typeof window !== 'undefined') {
    window.CRM_API = CRM_API;
}

// For Node.js environments
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CRM_API;
}
