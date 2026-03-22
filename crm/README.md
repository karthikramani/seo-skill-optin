# SEO Skill CRM System

A simple CRM with pipeline management and AgentMail email integration for following up with SEO skill opt-ins.

## Features

✅ **Pipeline Management** - 5 stages: New Lead → Contacted → Engaged → Customer → Inactive
✅ **Contact Cards** - Visual kanban-style pipeline view
✅ **Email Integration** - Send follow-up emails via AgentMail
✅ **Search** - Find contacts quickly
✅ **Local Storage** - Contacts persist in browser
✅ **Export to CSV** - Download your contact list
✅ **Mobile Responsive** - Works on all devices

## Files

- `index.html` - CRM dashboard interface
- `api.js` - API integration for opt-ins and emails
- `contacts.json` - Contact storage (backend version)
- `pipeline-stages.json` - Pipeline stage configuration

## Setup

### 1. Open the CRM Dashboard

Open `crm/index.html` in your browser or deploy it alongside the opt-in page.

### 2. Integrate with Opt-in Page

Update the opt-in form in `seo-skill-optin/index.html` to save contacts to CRM:

```html
<!-- Add this script tag to the opt-in page -->
<script src="/crm/api.js"></script>

<script>
    document.getElementById('optinForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const name = this.querySelector('input[type="text"]').value;
        const email = this.querySelector('input[type="email"]').value;
        
        // Save to CRM
        await CRM_API.addContact(name, email, 'seo-skill-optin');
        
        // Redirect to thank you page
        window.location.href = '/thank-you.html';
    });
</script>
```

### 3. Configure AgentMail

1. Get your AgentMail API key from credentials/agentmail.txt
2. Update `api.js` line 48 with your AgentMail address:
   ```javascript
   from: 'sangeet@agentmail.to' // Your AgentMail address
   ```

### 4. Send Follow-up Emails

From the CRM dashboard:
1. Click on any contact card
2. Click "📧 Send Email"
3. Write your message
4. Click "📤 Send Email"

The email will be sent via AgentMail automatically.

## Pipeline Stages

| Stage | Description | Color |
|-------|-------------|-------|
| 🟢 New Lead | Just opted in | Green |
| 🔵 Contacted | Sent first email | Blue |
| 🟠 Engaged | Replied/clicked | Orange |
| 🟣 Customer | Purchased/converted | Purple |
| ⚫ Inactive | No response | Gray |

## Email Templates

### Welcome Email (for New Leads)

**Subject:** Your SEO Content Writer Skill + Quick Start Guide

**Body:**
```
Hey [Name],

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
OpenClaw Team
```

### Follow-up Email (for Contacted)

**Subject:** Did you install the SEO skill? Need help?

**Body:**
```
Hey [Name],

Just checking in! Did you get a chance to install the SEO Content Writer skill?

If you're stuck, I'm here to help. Just reply and let me know what you're trying to do.

Also - I'd love to hear what kind of content you're planning to create with it!

- Sangeet
```

### Engagement Email (for Engaged)

**Subject:** 3 killer prompts for your SEO skill

**Body:**
```
Hey [Name],

Since you're using the SEO skill, here are 3 prompts that get amazing results:

1. "Analyze top 5 results for [keyword] and write a better 3000-word guide"
2. "Write FAQ-style article optimized for featured snippets: [topic]"
3. "Create pillar content + 5 cluster articles for [niche]"

Pro tip: The skill works best when you give it specifics (word count, competitor URLs, target keywords).

What topics are you writing about?

- Sangeet
```

## Workflow

### Daily Routine

1. **Morning:** Check "New Lead" stage → send welcome emails
2. **Afternoon:** Review "Contacted" → follow up with non-responders (after 2 days)
3. **End of day:** Move engaged contacts forward in pipeline

### Automation Ideas

- Auto-send welcome email when contact enters "New Lead"
- Auto-move to "Inactive" if no response after 7 days
- Tag contacts by source (opt-in page, referral, etc.)

## Export Data

Click "Export to CSV" to download your contact list for:
- Backup
- Import to other tools
- Reporting

## Integration with OpenClaw

You can automate follow-ups using OpenClaw:

```
/cron add --name "Daily CRM Check" --schedule "0 9 * * *" --task "Check CRM for new leads and send welcome emails"
```

## Next Steps

1. **Deploy CRM** - Host it on Vercel alongside opt-in page
2. **Set up AgentMail** - Configure API key in api.js
3. **Test flow** - Submit opt-in form → verify contact appears in CRM
4. **Send test email** - Use AgentMail integration
5. **Build automation** - Set up OpenClaw cron jobs for follow-ups

## Support

Questions? Check:
- OpenClaw docs: https://docs.openclaw.ai
- AgentMail docs: [docs link]
- Discord: https://discord.com/invite/clawd
