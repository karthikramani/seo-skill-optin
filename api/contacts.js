// Vercel Serverless API for CRM Contacts
// This uses Vercel's file system (ephemeral) or can be upgraded to Vercel KV

import { kv } from '@vercel/kv';

const CONTACTS_KEY = 'crm_contacts';

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        if (req.method === 'GET') {
            // Get all contacts
            const contacts = await kv.get(CONTACTS_KEY) || [];
            return res.status(200).json({ contacts });
        }

        if (req.method === 'POST') {
            // Add or update contacts
            const { contacts } = req.body;
            
            if (!Array.isArray(contacts)) {
                return res.status(400).json({ error: 'Contacts must be an array' });
            }

            await kv.set(CONTACTS_KEY, contacts);
            return res.status(200).json({ success: true, count: contacts.length });
        }

        if (req.method === 'PUT') {
            // Update single contact
            const { contact } = req.body;
            
            if (!contact || !contact.id) {
                return res.status(400).json({ error: 'Contact with id required' });
            }

            const contacts = await kv.get(CONTACTS_KEY) || [];
            const index = contacts.findIndex(c => c.id === contact.id);
            
            if (index > -1) {
                contacts[index] = contact;
            } else {
                contacts.push(contact);
            }

            await kv.set(CONTACTS_KEY, contacts);
            return res.status(200).json({ success: true, contact });
        }

        if (req.method === 'DELETE') {
            // Delete contact
            const { id } = req.query;
            
            if (!id) {
                return res.status(400).json({ error: 'Contact id required' });
            }

            const contacts = await kv.get(CONTACTS_KEY) || [];
            const filtered = contacts.filter(c => c.id !== parseInt(id));

            await kv.set(CONTACTS_KEY, filtered);
            return res.status(200).json({ success: true, deleted: parseInt(id) });
        }

        return res.status(405).json({ error: 'Method not allowed' });

    } catch (error) {
        console.error('CRM API Error:', error);
        return res.status(500).json({ error: error.message });
    }
}
