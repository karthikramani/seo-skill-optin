// Enhanced CRM with comprehensive features
let contacts = [];
let stages = [
    { id: 1, name: 'New Lead', color: '#00ff88' },
    { id: 2, name: 'Contacted', color: '#0099ff' },
    { id: 3, name: 'Engaged', color: '#ff9900' },
    { id: 4, name: 'Customer', color: '#9900ff' },
    { id: 5, name: 'Inactive', color: '#666666' }
];

let currentView = 'pipeline';
let currentContact = null;
let currentTab = 'overview';
let selectedContacts = new Set();
let filters = {
    source: '',
    date: '',
    tags: []
};

// Email templates
const emailTemplates = {
    welcome: {
        subject: 'Your SEO Content Writer Skill + Quick Start Guide',
        message: `Hey [NAME],

Thanks for grabbing the SEO Content Writer skill! 🚀

Your download should have started automatically. If not, here's your link:
[Download Link]

Quick start:
1. Extract the ZIP file
2. Open OpenClaw and type: /skills install
3. Drop the SKILL.md file
4. Try it: "Write a 2000-word SEO article for 'best CRM tools 2026'"

Need help? Just reply to this email!

- Sangeet
OpenClaw Team`
    },
    followup: {
        subject: 'Did you install the SEO skill? Need help?',
        message: `Hey [NAME],

Just checking in! Did you get a chance to install the SEO Content Writer skill?

If you're stuck, I'm here to help. Just reply and let me know what you're trying to do.

Also - I'd love to hear what kind of content you're planning to create with it!

- Sangeet`
    },
    engagement: {
        subject: '3 killer prompts for your SEO skill',
        message: `Hey [NAME],

Since you're using the SEO skill, here are 3 prompts that get amazing results:

1. "Analyze top 5 results for [keyword] and write a better 3000-word guide"
2. "Write FAQ-style article optimized for featured snippets: [topic]"
3. "Create pillar content + 5 cluster articles for [niche]"

Pro tip: The skill works best when you give it specifics (word count, competitor URLs, target keywords).

What topics are you writing about?

- Sangeet`
    }
};

// Load data from localStorage
function loadContacts() {
    const stored = localStorage.getItem('crm_contacts');
    if (stored) {
        contacts = JSON.parse(stored);
    }
}

// Save data to localStorage
function saveContacts() {
    localStorage.setItem('crm_contacts', JSON.stringify(contacts));
}

// Get all unique tags
function getAllTags() {
    const tags = new Set();
    contacts.forEach(contact => {
        if (contact.tags) {
            contact.tags.forEach(tag => tags.add(tag));
        }
    });
    return Array.from(tags);
}

// Render tag filter
function renderTagFilter() {
    const tagFilter = document.getElementById('tagFilter');
    const tags = getAllTags();
    
    tagFilter.innerHTML = tags.map(tag => 
        `<span class="tag-badge ${filters.tags.includes(tag) ? 'active' : ''}" onclick="toggleTagFilter('${tag}')">${tag}</span>`
    ).join('');
}

// Toggle tag filter
function toggleTagFilter(tag) {
    const index = filters.tags.indexOf(tag);
    if (index > -1) {
        filters.tags.splice(index, 1);
    } else {
        filters.tags.push(tag);
    }
    renderTagFilter();
    applyFilters();
}

// Apply filters
function applyFilters() {
    filters.source = document.getElementById('sourceFilter').value;
    filters.date = document.getElementById('dateFilter').value;
    
    if (currentView === 'pipeline') {
        renderPipeline();
    } else {
        renderListView();
    }
}

// Filter contacts
function getFilteredContacts() {
    let filtered = [...contacts];
    
    // Source filter
    if (filters.source) {
        filtered = filtered.filter(c => c.source === filters.source);
    }
    
    // Date filter
    if (filters.date) {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        filtered = filtered.filter(c => {
            const contactDate = new Date(c.createdAt);
            const contactDay = new Date(contactDate.getFullYear(), contactDate.getMonth(), contactDate.getDate());
            
            switch (filters.date) {
                case 'today':
                    return contactDay.getTime() === today.getTime();
                case 'week':
                    const weekAgo = new Date(today);
                    weekAgo.setDate(weekAgo.getDate() - 7);
                    return contactDay >= weekAgo;
                case 'month':
                    const monthAgo = new Date(today);
                    monthAgo.setMonth(monthAgo.getMonth() - 1);
                    return contactDay >= monthAgo;
                default:
                    return true;
            }
        });
    }
    
    // Tag filter
    if (filters.tags.length > 0) {
        filtered = filtered.filter(c => 
            c.tags && c.tags.some(tag => filters.tags.includes(tag))
        );
    }
    
    return filtered;
}

// Render pipeline
function renderPipeline() {
    const pipeline = document.getElementById('pipeline');
    const filtered = getFilteredContacts();
    pipeline.innerHTML = '';

    stages.forEach(stage => {
        const stageContacts = filtered.filter(c => c.stage === stage.id);
        
        const stageEl = document.createElement('div');
        stageEl.className = 'stage';
        stageEl.innerHTML = `
            <div class="stage-header">
                <div class="stage-title">
                    <span style="color: ${stage.color}">●</span>
                    ${stage.name}
                </div>
                <div class="stage-count">${stageContacts.length}</div>
            </div>
            <div class="stage-body" id="stage-${stage.id}">
                ${stageContacts.length === 0 ? '<div class="empty-state">No contacts</div>' : ''}
            </div>
        `;
        pipeline.appendChild(stageEl);

        const stageBody = stageEl.querySelector(`#stage-${stage.id}`);
        stageContacts.forEach(contact => {
            const card = createContactCard(contact);
            stageBody.appendChild(card);
        });
    });

    updateStats();
    renderTagFilter();
}

// Create contact card
function createContactCard(contact) {
    const card = document.createElement('div');
    card.className = 'contact-card';
    if (contact.notes && contact.notes.length > 0) card.classList.add('has-note');
    if (contact.activity && contact.activity.length > 0) card.classList.add('has-activity');
    card.onclick = () => showContactDetails(contact);
    
    const date = new Date(contact.createdAt);
    const dateStr = date.toLocaleDateString();
    
    const emailCount = contact.emails ? contact.emails.length : 0;
    const noteCount = contact.notes ? contact.notes.length : 0;

    const tagsHtml = contact.tags ? 
        `<div class="contact-tags">${contact.tags.map(tag => 
            `<span class="tag-badge">${tag}</span>`
        ).join('')}</div>` : '';

    card.innerHTML = `
        <div class="contact-name">${contact.name}</div>
        <div class="contact-email">${contact.email}</div>
        ${tagsHtml}
        <div class="contact-stats">
            <span class="contact-stat">📧 ${emailCount}</span>
            <span class="contact-stat">📝 ${noteCount}</span>
        </div>
        <div class="contact-meta">
            <div class="contact-date">📅 ${dateStr}</div>
        </div>
        <div class="contact-actions" onclick="event.stopPropagation()">
            <button onclick="showEmailModal(${contact.id})">📧</button>
            <button onclick="showQuickNote(${contact.id})">📝</button>
            ${contact.stage < stages.length ? `<button onclick="moveContact(${contact.id}, ${contact.stage + 1})">→</button>` : ''}
        </div>
    `;
    return card;
}

// Render list view
function renderListView() {
    const tbody = document.getElementById('listTableBody');
    const filtered = getFilteredContacts();
    
    tbody.innerHTML = filtered.map(contact => {
        const stage = stages.find(s => s.id === contact.stage);
        const date = new Date(contact.createdAt).toLocaleDateString();
        const lastActivity = contact.activity && contact.activity.length > 0 ?
            new Date(contact.activity[contact.activity.length - 1].timestamp).toLocaleDateString() : 'None';
        
        const tagsHtml = contact.tags ? 
            contact.tags.map(tag => `<span class="tag-badge">${tag}</span>`).join(' ') : '';
        
        return `
            <tr>
                <td><input type="checkbox" ${selectedContacts.has(contact.id) ? 'checked' : ''} onchange="toggleSelect(${contact.id})"></td>
                <td>${contact.name}</td>
                <td>${contact.email}</td>
                <td><span style="color: ${stage.color}">${stage.name}</span></td>
                <td>${tagsHtml}</td>
                <td>${contact.source || 'N/A'}</td>
                <td>${date}</td>
                <td>${lastActivity}</td>
                <td>
                    <button class="btn btn-secondary" style="padding: 4px 8px; font-size: 11px;" onclick="showContactDetails(${JSON.stringify(contact).replace(/"/g, '&quot;')})">View</button>
                </td>
            </tr>
        `;
    }).join('');
    
    updateStats();
}

// Switch view
function switchView(view) {
    currentView = view;
    
    // Update buttons
    document.querySelectorAll('.view-toggle button').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    // Show/hide views
    if (view === 'pipeline') {
        document.getElementById('pipeline').style.display = 'grid';
        document.getElementById('listView').classList.remove('active');
        renderPipeline();
    } else {
        document.getElementById('pipeline').style.display = 'none';
        document.getElementById('listView').classList.add('active');
        renderListView();
    }
}

// Switch tab
function switchTab(tab) {
    currentTab = tab;
    
    // Update tab buttons
    document.querySelectorAll('.modal-tab').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    // Show/hide tab content
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    document.getElementById(`${tab}Tab`).classList.add('active');
    
    if (tab === 'activity' && currentContact) {
        renderActivity(currentContact);
    } else if (tab === 'notes' && currentContact) {
        renderNotes(currentContact);
    } else if (tab === 'emails' && currentContact) {
        renderEmailHistory(currentContact);
    }
}

// Show contact details
function showContactDetails(contact) {
    if (typeof contact === 'string') {
        contact = JSON.parse(contact.replace(/&quot;/g, '"'));
    }
    
    currentContact = contacts.find(c => c.id === contact.id);
    if (!currentContact) return;
    
    const modal = document.getElementById('contactModal');
    document.getElementById('contactModalTitle').textContent = currentContact.name;
    
    // Reset to overview tab
    currentTab = 'overview';
    document.querySelectorAll('.modal-tab').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.modal-tab')[0].classList.add('active');
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    document.getElementById('overviewTab').classList.add('active');
    
    renderOverview(currentContact);
    
    modal.classList.add('active');
}

// Render overview tab
function renderOverview(contact) {
    const stage = stages.find(s => s.id === contact.stage);
    const date = new Date(contact.createdAt).toLocaleString();
    const emailCount = contact.emails ? contact.emails.length : 0;
    const noteCount = contact.notes ? contact.notes.length : 0;
    const activityCount = contact.activity ? contact.activity.length : 0;
    
    const tagsHtml = contact.tags ? 
        contact.tags.map(tag => `<span class="tag-badge">${tag}</span>`).join(' ') : 'None';

    document.getElementById('overviewTab').innerHTML = `
        <div class="contact-detail">
            <div class="contact-detail-row">
                <span class="contact-detail-label">Name</span>
                <span class="contact-detail-value">${contact.name}</span>
            </div>
            <div class="contact-detail-row">
                <span class="contact-detail-label">Email</span>
                <span class="contact-detail-value">${contact.email}</span>
            </div>
            ${contact.phone ? `
            <div class="contact-detail-row">
                <span class="contact-detail-label">Phone</span>
                <span class="contact-detail-value">${contact.phone}</span>
            </div>
            ` : ''}
            <div class="contact-detail-row">
                <span class="contact-detail-label">Stage</span>
                <span class="contact-detail-value" style="color: ${stage.color}">${stage.name}</span>
            </div>
            <div class="contact-detail-row">
                <span class="contact-detail-label">Source</span>
                <span class="contact-detail-value">${contact.source || 'N/A'}</span>
            </div>
            <div class="contact-detail-row">
                <span class="contact-detail-label">Tags</span>
                <span class="contact-detail-value">${tagsHtml}</span>
            </div>
            <div class="contact-detail-row">
                <span class="contact-detail-label">Created</span>
                <span class="contact-detail-value">${date}</span>
            </div>
            <div class="contact-detail-row">
                <span class="contact-detail-label">Stats</span>
                <span class="contact-detail-value">📧 ${emailCount} emails · 📝 ${noteCount} notes · 📊 ${activityCount} activities</span>
            </div>
            ${contact.initialNotes ? `
            <div class="contact-detail-row">
                <span class="contact-detail-label">Initial Notes</span>
                <span class="contact-detail-value">${contact.initialNotes}</span>
            </div>
            ` : ''}
        </div>
        <div class="modal-footer">
            <button class="btn btn-secondary" onclick="editContact(${contact.id})">✏️ Edit</button>
            <button class="btn btn-secondary" onclick="deleteContact(${contact.id})">🗑️ Delete</button>
            <button class="btn btn-primary" onclick="showEmailModal(${contact.id})">📧 Send Email</button>
        </div>
    `;
}

// Render activity timeline
function renderActivity(contact) {
    const timeline = document.getElementById('activityTimeline');
    
    if (!contact.activity || contact.activity.length === 0) {
        timeline.innerHTML = '<div class="empty-state">No activity yet</div>';
        return;
    }
    
    // Sort by most recent first
    const activities = [...contact.activity].sort((a, b) => 
        new Date(b.timestamp) - new Date(a.timestamp)
    );
    
    timeline.innerHTML = activities.map(activity => {
        const time = new Date(activity.timestamp).toLocaleString();
        const icons = {
            created: '✨',
            email_sent: '📧',
            note_added: '📝',
            stage_changed: '🔄',
            tag_added: '🏷️',
            edited: '✏️'
        };
        
        return `
            <div class="activity-item">
                <div class="activity-icon">${icons[activity.type] || '📊'}</div>
                <div class="activity-content">
                    <div class="activity-header">
                        <span class="activity-type">${activity.type.replace('_', ' ').toUpperCase()}</span>
                        <span class="activity-time">${time}</span>
                    </div>
                    <div class="activity-text">${activity.description}</div>
                </div>
            </div>
        `;
    }).join('');
}

// Render notes
function renderNotes(contact) {
    const noteList = document.getElementById('noteList');
    
    if (!contact.notes || contact.notes.length === 0) {
        noteList.innerHTML = '<div class="empty-state">No notes yet</div>';
        return;
    }
    
    // Sort by most recent first
    const notes = [...contact.notes].sort((a, b) => 
        new Date(b.timestamp) - new Date(a.timestamp)
    );
    
    noteList.innerHTML = notes.map((note, index) => {
        const time = new Date(note.timestamp).toLocaleString();
        return `
            <div class="note-item">
                <div class="note-header">
                    <span class="note-time">${time}</span>
                    <button class="note-delete" onclick="deleteNote(${index})">🗑️ Delete</button>
                </div>
                <div class="note-text">${note.text}</div>
            </div>
        `;
    }).join('');
}

// Render email history
function renderEmailHistory(contact) {
    const emailHistory = document.getElementById('emailHistory');
    
    if (!contact.emails || contact.emails.length === 0) {
        emailHistory.innerHTML = '<div class="empty-state">No emails sent yet</div>';
        return;
    }
    
    // Sort by most recent first
    const emails = [...contact.emails].sort((a, b) => 
        new Date(b.sentAt) - new Date(a.sentAt)
    );
    
    emailHistory.innerHTML = emails.map(email => {
        const time = new Date(email.sentAt).toLocaleString();
        return `
            <div class="activity-item">
                <div class="activity-icon">📧</div>
                <div class="activity-content">
                    <div class="activity-header">
                        <span class="activity-type">${email.subject}</span>
                        <span class="activity-time">${time}</span>
                    </div>
                    <div class="activity-text">${email.message}</div>
                </div>
            </div>
        `;
    }).join('');
}

// Add note
function addNote() {
    const text = document.getElementById('newNoteText').value.trim();
    if (!text || !currentContact) return;
    
    if (!currentContact.notes) currentContact.notes = [];
    
    currentContact.notes.push({
        text: text,
        timestamp: new Date().toISOString()
    });
    
    // Add to activity
    if (!currentContact.activity) currentContact.activity = [];
    currentContact.activity.push({
        type: 'note_added',
        description: text.substring(0, 100) + (text.length > 100 ? '...' : ''),
        timestamp: new Date().toISOString()
    });
    
    saveContacts();
    renderNotes(currentContact);
    document.getElementById('newNoteText').value = '';
    updateContactInCurrentView();
}

// Delete note
function deleteNote(index) {
    if (!currentContact || !currentContact.notes) return;
    
    currentContact.notes.splice(index, 1);
    saveContacts();
    renderNotes(currentContact);
    updateContactInCurrentView();
}

// Show quick note
function showQuickNote(contactId) {
    const note = prompt('Add a quick note:');
    if (!note) return;
    
    const contact = contacts.find(c => c.id === contactId);
    if (!contact) return;
    
    if (!contact.notes) contact.notes = [];
    contact.notes.push({
        text: note,
        timestamp: new Date().toISOString()
    });
    
    if (!contact.activity) contact.activity = [];
    contact.activity.push({
        type: 'note_added',
        description: note.substring(0, 100),
        timestamp: new Date().toISOString()
    });
    
    saveContacts();
    refreshPipeline();
}

// Show add contact modal
function showAddContactModal() {
    document.getElementById('addContactForm').reset();
    document.getElementById('addContactModal').classList.add('active');
}

// Save contact
function saveContact() {
    const form = document.getElementById('addContactForm');
    const formData = new FormData(form);
    
    const contact = {
        id: contacts.length > 0 ? Math.max(...contacts.map(c => c.id)) + 1 : 1,
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        stage: parseInt(formData.get('stage')),
        source: formData.get('source'),
        tags: formData.get('tags') ? formData.get('tags').split(',').map(t => t.trim()) : [],
        initialNotes: formData.get('notes'),
        notes: formData.get('notes') ? [{
            text: formData.get('notes'),
            timestamp: new Date().toISOString()
        }] : [],
        activity: [{
            type: 'created',
            description: 'Contact created',
            timestamp: new Date().toISOString()
        }],
        createdAt: new Date().toISOString()
    };

    contacts.push(contact);
    saveContacts();
    refreshPipeline();
    closeModal('addContactModal');
}

// Edit contact
function editContact(contactId) {
    // TODO: Implement edit modal
    alert('Edit functionality coming soon!');
}

// Move contact to next stage
function moveContact(contactId, nextStage) {
    const contact = contacts.find(c => c.id === contactId);
    if (contact && nextStage <= stages.length) {
        const oldStage = stages.find(s => s.id === contact.stage);
        const newStage = stages.find(s => s.id === nextStage);
        
        contact.stage = nextStage;
        
        // Add to activity
        if (!contact.activity) contact.activity = [];
        contact.activity.push({
            type: 'stage_changed',
            description: `Moved from ${oldStage.name} to ${newStage.name}`,
            timestamp: new Date().toISOString()
        });
        
        saveContacts();
        refreshPipeline();
    }
}

// Delete contact
function deleteContact(contactId) {
    if (confirm('Are you sure you want to delete this contact?')) {
        contacts = contacts.filter(c => c.id !== contactId);
        saveContacts();
        refreshPipeline();
        closeModal('contactModal');
    }
}

// Show email modal
function showEmailModal(contactId) {
    const contact = contacts.find(c => c.id === contactId);
    if (contact) {
        currentContact = contact;
        document.getElementById('emailContactId').value = contact.id;
        document.getElementById('emailTo').value = contact.email;
        document.getElementById('emailForm').reset();
        document.getElementById('emailTo').value = contact.email;
        document.getElementById('emailTemplate').value = '';
        closeModal('contactModal');
        document.getElementById('emailModal').classList.add('active');
    }
}

// Load email template
function loadTemplate() {
    const templateId = document.getElementById('emailTemplate').value;
    if (!templateId) return;
    
    const template = emailTemplates[templateId];
    if (template && currentContact) {
        document.getElementById('emailSubject').value = template.subject;
        document.getElementById('emailMessage').value = template.message.replace('[NAME]', currentContact.name);
    }
}

// Send email
function sendEmail() {
    const form = document.getElementById('emailForm');
    const formData = new FormData(form);
    
    const emailData = {
        contactId: parseInt(formData.get('contactId')),
        to: formData.get('to'),
        subject: formData.get('subject'),
        message: formData.get('message'),
        sentAt: new Date().toISOString()
    };

    console.log('📧 Email to send:', emailData);
    
    // Save to contact
    const contact = contacts.find(c => c.id === emailData.contactId);
    if (contact) {
        if (!contact.emails) contact.emails = [];
        contact.emails.push(emailData);
        
        // Add to activity
        if (!contact.activity) contact.activity = [];
        contact.activity.push({
            type: 'email_sent',
            description: `Email sent: ${emailData.subject}`,
            timestamp: new Date().toISOString()
        });
        
        // Move to "Contacted" if in "New Lead"
        if (contact.stage === 1) {
            contact.stage = 2;
            contact.activity.push({
                type: 'stage_changed',
                description: 'Moved from New Lead to Contacted (email sent)',
                timestamp: new Date().toISOString()
            });
        }
        
        saveContacts();
        refreshPipeline();
    }
    
    // TODO: Integrate with AgentMail API here
    alert('Email sent! (AgentMail integration coming next)');
    
    closeModal('emailModal');
}

// Toggle contact selection
function toggleSelect(contactId) {
    if (selectedContacts.has(contactId)) {
        selectedContacts.delete(contactId);
    } else {
        selectedContacts.add(contactId);
    }
    
    updateBulkActions();
}

// Toggle select all
function toggleSelectAll() {
    const checked = document.getElementById('selectAll').checked;
    const filtered = getFilteredContacts();
    
    if (checked) {
        filtered.forEach(c => selectedContacts.add(c.id));
    } else {
        selectedContacts.clear();
    }
    
    updateBulkActions();
    renderListView();
}

// Update bulk actions bar
function updateBulkActions() {
    const bulkActions = document.getElementById('bulkActions');
    const count = selectedContacts.size;
    
    if (count > 0) {
        bulkActions.classList.add('active');
        document.getElementById('selectedCount').textContent = count;
    } else {
        bulkActions.classList.remove('active');
    }
}

// Clear selection
function clearSelection() {
    selectedContacts.clear();
    updateBulkActions();
    document.getElementById('selectAll').checked = false;
    renderListView();
}

// Bulk email
function bulkEmail() {
    alert(`Send bulk email to ${selectedContacts.size} contacts (feature coming soon!)`);
}

// Bulk tag
function bulkTag() {
    const tag = prompt('Enter tag to add to selected contacts:');
    if (!tag) return;
    
    selectedContacts.forEach(contactId => {
        const contact = contacts.find(c => c.id === contactId);
        if (contact) {
            if (!contact.tags) contact.tags = [];
            if (!contact.tags.includes(tag)) {
                contact.tags.push(tag);
                
                if (!contact.activity) contact.activity = [];
                contact.activity.push({
                    type: 'tag_added',
                    description: `Tag added: ${tag}`,
                    timestamp: new Date().toISOString()
                });
            }
        }
    });
    
    saveContacts();
    clearSelection();
    refreshPipeline();
}

// Bulk delete
function bulkDelete() {
    if (confirm(`Delete ${selectedContacts.size} contacts? This cannot be undone.`)) {
        contacts = contacts.filter(c => !selectedContacts.has(c.id));
        saveContacts();
        clearSelection();
        refreshPipeline();
    }
}

// Close modal
function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

// Update stats
function updateStats() {
    const filtered = getFilteredContacts();
    const totalEmails = filtered.reduce((sum, c) => sum + (c.emails ? c.emails.length : 0), 0);
    const customers = filtered.filter(c => c.stage === 4).length;
    const conversion = filtered.length > 0 ? Math.round((customers / filtered.length) * 100) : 0;
    
    document.getElementById('totalLeads').textContent = filtered.length;
    document.getElementById('totalEmails').textContent = totalEmails;
    document.getElementById('totalCustomers').textContent = customers;
    document.getElementById('conversionRate').textContent = conversion + '%';
}

// Refresh pipeline
function refreshPipeline() {
    loadContacts();
    if (currentView === 'pipeline') {
        renderPipeline();
    } else {
        renderListView();
    }
}

// Update contact in current view
function updateContactInCurrentView() {
    const index = contacts.findIndex(c => c.id === currentContact.id);
    if (index > -1) {
        contacts[index] = currentContact;
        saveContacts();
    }
}

// Search
document.getElementById('searchInput').addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    
    if (currentView === 'pipeline') {
        const cards = document.querySelectorAll('.contact-card');
        cards.forEach(card => {
            const name = card.querySelector('.contact-name').textContent.toLowerCase();
            const email = card.querySelector('.contact-email').textContent.toLowerCase();
            const tags = Array.from(card.querySelectorAll('.tag-badge')).map(t => t.textContent.toLowerCase()).join(' ');
            
            if (name.includes(query) || email.includes(query) || tags.includes(query)) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    } else {
        renderListView();
    }
});

// Initialize CRM
function initCRM() {
    loadContacts();
    renderPipeline();
    console.log('✅ CRM initialized with', contacts.length, 'contacts');
}

// Export to CSV (complete function)
function exportToCSV() {
    const filtered = getFilteredContacts();
    const csv = [
        ['Name', 'Email', 'Phone', 'Stage', 'Source', 'Tags', 'Created At', 'Emails Sent', 'Notes'],
        ...filtered.map(c => [
            c.name,
            c.email,
            c.phone || '',
            stages.find(s => s.id === c.stage).name,
            c.source || '',
            (c.tags || []).join('; '),
            new Date(c.createdAt).toLocaleDateString(),
            (c.emails || []).length,
            (c.notes || []).length
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

// Close modals on ESC key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeModal('contactModal');
        closeModal('addContactModal');
        closeModal('emailModal');
    }
});

// Start the CRM
initCRM();
