import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { assistantEndpoint, contact, localAnswer } from '../src/content.js';

test('education answer preserves the supplied completion date', () => {
  assert.match(localAnswer('Where did Piyush graduate?').answer, /August 2026/);
  assert.match(localAnswer('Tell me his education').answer, /Savitribai/);
});
test('specific project question wins over generic project wording', () => {
  assert.equal(localAnswer('Tell me about Mivvy and its voice identities').id, 'mivvy');
  assert.match(localAnswer('What can Jarvis do?').answer, /selected desktop/);
  assert.match(localAnswer('What projects has he built?').answer, /four featured projects/);
  assert.equal(localAnswer('Tell me about his OpenMail project').id, 'openmail');
  assert.equal(localAnswer('What is the SentryML project?').id, 'sentry');
  assert.equal(localAnswer('How do SafeOps agents work?').id, 'safeops');
});
test('unknown facts and private data are not invented', () => {
  assert.equal(localAnswer('What is his passport number?').id, 'unknown');
  assert.equal(localAnswer('  '), null);
  assert.equal(localAnswer('<script>alert(1)</script>').id, 'unknown');
  assert.match(localAnswer('Is there a CV?').answer, /contact him directly/);
  assert.equal(contact.cv, null);
});
test('local and unrelated origins never invoke the production assistant', () => {
  for (const origin of ['http://127.0.0.1:5174', 'http://localhost:5174', 'https://example.test', 'https://piyushchavan.com.example.test', 'http://piyushchavan.com']) assert.equal(assistantEndpoint(origin), null);
  assert.match(assistantEndpoint('https://piyushchavan.com'), /^https:/);
  assert.match(assistantEndpoint('https://www.piyushchavan.com'), /^https:/);
});

function sampleTransport() {
  const context = vm.createContext({ window: {}, Response, URL, location: { href: 'https://portfolio.example.test/openmail/app.html', origin: 'https://portfolio.example.test' }, document: { addEventListener() {} } });
  vm.runInContext(readFileSync(new URL('../public/openmail/sample-transport.js', import.meta.url), 'utf8'), context);
  return context.window.fetch;
}
test('preview supplies fictional messages with exact UI response shape', async () => {
  const fetch = sampleTransport();
  const { user } = await (await fetch('/api/auth/session')).json();
  assert.match(user.email, /example\.test$/);
  const { messages } = await (await fetch('/api/messages?view=inbox&mailboxId=mailbox-0')).json();
  assert.equal(messages.length, 6);
  assert.ok(messages.every(message => message.from_address.endsWith('@example.test>')));
});
test('preview filters folders and mailbox selections', async () => {
  const fetch = sampleTransport();
  assert.equal((await (await fetch('/api/messages?view=starred')).json()).messages.length, 1);
  assert.equal((await (await fetch('/api/messages?view=inbox&mailboxId=mailbox-1')).json()).messages.length, 0);
  assert.equal((await (await fetch('/api/messages?view=sent')).json()).messages.length, 0);
});
test('preview rejects all sending, saving and AI requests', async () => {
  const fetch = sampleTransport();
  for (const path of ['/api/messages/send', '/api/ai/simulator', '/api/ai/profile', '/api/auth', '/api/domains']) {
    const response = await fetch(path, { method: 'POST', body: '{}' });
    assert.equal(response.status, 405);
    assert.match((await response.json()).error, /disabled/);
  }
  assert.equal((await fetch('https://freeopenmail.tech/api/auth/session')).status, 405);
  assert.equal((await fetch('/api/ai/profile', { method: 'DELETE' })).status, 405);
});
test('reading sample mail changes only the in-memory copy', async () => {
  const fetch = sampleTransport();
  const response = await fetch('/api/messages/message-0', { method: 'PATCH', body: JSON.stringify({ action: 'read' }) });
  assert.ok((await response.json()).message.read_at);
  assert.equal((await sampleTransport()('/api/messages/message-0')).status, 200);
  assert.equal((await (await sampleTransport()('/api/messages/message-0')).json()).message.read_at, null);
});
test('OpenMail iframe has a second network and form boundary', () => {
  const html = readFileSync(new URL('../public/openmail/app.html', import.meta.url), 'utf8');
  assert.match(html, /connect-src 'none'/);
  assert.match(html, /form-action 'none'/);
  assert.match(html, /name="robots" content="noindex,nofollow"/);
  assert.ok(html.indexOf('sample-transport.js') < html.indexOf('app-ui.js'));
});
