/* Portfolio-only sample data. The original OpenMail UI is unchanged.
   Every fetch is intercepted. CSP also blocks network connections and form submissions. */
(() => {
  'use strict';
  const now = new Date('2026-11-11T10:00:00Z');
  const user = { id: 'sample-owner', email: 'owner@northline.example.test' };
  const domain = { id: 'sample-domain', domain_name: 'northline.example.test', status: 'verified', dns_records: [] };
  const mailboxes = ['support', 'sales', 'contact'].map((name, i) => ({ id: `mailbox-${i}`, domain_id: domain.id, address: `${name}@northline.example.test`, local_part: name, status: 'active' }));
  const representatives = ['Support', 'Sales', 'Billing', 'Careers'].map((name, i) => ({ id: `representative-${i}`, kind: name.toLowerCase(), display_name: name, enabled: true }));
  const messages = [
    ['Maya Chen', 'A quick question about your studio hours', 'Hi, when is your studio open?', 'primary'],
    ['Eli at Forming', 'The first cut is ready', 'The first round of design work is ready. Would love your thoughts.', 'primary'],
    ['Jules Rivera', 'Please check my invoice', 'Could you review a duplicate charge on my invoice?', 'primary'],
    ['Orbit Community', 'Your circle had a busy week', 'A weekly community roundup from your circle.', 'social'],
    ['Field Supply', 'A little room for your next idea', 'New tools for the things you are making next.', 'promotions'],
    ['Northline Workspace', 'Your monthly workspace note', 'Your project files and team directory are up to date.', 'updates'],
  ].map(([name, subject, body, category], i) => ({ id: `message-${i}`, mailbox_id: mailboxes[0].id, direction: 'inbound', folder: 'inbox', from_address: `${name} <sender${i}@example.test>`, to_addresses: [mailboxes[0].address], subject, text_body: body, preview: body, created_at: new Date(now - i * 3600000).toISOString(), read_at: i < 2 ? null : now.toISOString(), starred: i === 1, category, status: 'received', ai_handoff_status: i === 2 ? 'pending' : null, ai_representative_id: representatives[0].id }));
  const profile = { company_name: 'Northline Studio · sample', company_description: 'An independent design studio.', business_hours: 'Monday–Friday, 09:00–17:00 CET.', products_services: 'Brand identity, editorial design and website design.', enabled: true };
  const runs = ['Opening hours', 'Service question', 'Invoice refund', 'Unknown deadline', 'Application process'].map((name, i) => ({ id: `run-${i}`, test_name: name, passed: i !== 3, actual_decision: [2, 3].includes(i) ? 'human_review' : 'auto_reply', created_at: new Date(now - i * 3600000).toISOString() }));
  const totals = { automaticReplies: 24, escalations: 7, corrections: 1, markedCorrect: 9, successfulResolutions: 12, labeledAccuracy: 90, workflowDrafts: 5, workflowRoutes: 8, simulatorCases: 5, simulatorPassed: 4 };
  const response = (data, status = 200) => Promise.resolve(new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } }));
  const disabled = () => response({ error: 'Portfolio preview: sending, saving, uploads and AI generation are disabled. This is fictional sample data.' }, 405);
  window.fetch = (input, options = {}) => {
    const url = new URL(typeof input === 'string' ? input : input.url, location.href), path = url.pathname;
    const method = String(options.method || (typeof input === 'object' && input.method) || 'GET').toUpperCase();
    if (url.origin !== location.origin) return disabled();
    if (method !== 'GET') {
      let body = {}; try { body = JSON.parse(options.body || '{}'); } catch { return disabled(); }
      if (method === 'PATCH' && path.startsWith('/api/messages/') && body.action === 'read') {
        const message = messages.find(m => m.id === path.split('/').pop());
        if (message) { message.read_at = now.toISOString(); return response({ message }); }
      }
      return disabled();
    }
    if (path === '/api/status') return response({ authReady: true, mailReady: true, authMissing: [], mailMissing: [] });
    if (path === '/api/auth/session') return response({ signedIn: true, user });
    if (path === '/api/domains') return response({ domains: [domain] });
    if (path === '/api/mailboxes') return response({ mailboxes });
    if (path === '/api/messages') {
      const view = url.searchParams.get('view') || 'inbox';
      const box = mailboxes.find(item => item.id === url.searchParams.get('mailboxId')) || mailboxes[0];
      return response({ mailbox: box, messages: messages.filter(m => m.mailbox_id === box.id && (view === 'starred' ? m.starred : view === 'needs_review' ? m.ai_handoff_status === 'pending' : m.folder === view)) });
    }
    if (path.startsWith('/api/messages/')) return response({ message: messages.find(m => m.id === path.split('/').pop()) || messages[0] });
    if (path === '/api/ai/profile') return response({ profile, provider: { configured: true }, mailReady: true });
    if (path === '/api/ai/representatives') return response({ representatives });
    if (path === '/api/ai/mailbox-settings') return response({ settings: { auto_reply_enabled: false, representative_id: representatives[0].id }, domainVerified: true });
    if (path === '/api/ai/knowledge') return response({ entries: [] });
    if (path === '/api/ai/documents') return response({ documents: [] });
    if (path === '/api/ai/simulator') return response({ runs, representatives });
    if (path === '/api/ai/workflows') return response({ workflows: [], representatives });
    if (path === '/api/ai/trust') return response({ days: 30, summary: { totals, byRepresentative: [] }, recent: messages.slice(0, 3).map((m, i) => ({ messageId: m.id, subject: m.subject, status: i === 2 ? 'human_review' : 'auto_sent', reason: 'Fictional portfolio example', createdAt: m.created_at, feedback: null })) });
    return response({ error: 'Unavailable in the portfolio preview.' }, 404);
  };
  document.addEventListener('DOMContentLoaded', () => {
    document.title = 'OpenMail interface preview — fictional data';
    const uploads = document.querySelector('#aiDocumentsList');
    if (uploads) uploads.textContent = 'Documents are disabled in this portfolio preview.';
    document.querySelectorAll('a[href]').forEach(link => link.addEventListener('click', event => {
      event.preventDefault();
      const status = document.querySelector('#appToast');
      if (status) { status.textContent = 'Close this preview and choose “Open the product” to visit OpenMail.'; status.classList.add('visible'); setTimeout(() => status.classList.remove('visible'), 4500); }
    }));
  });
})();
