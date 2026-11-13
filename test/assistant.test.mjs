import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import worker from '../worker.mjs';

const require = createRequire(import.meta.url);
const api = require('../api/ask.js');
const origin = 'https://piyushchavan.com';
const answer = { choices: [{ message: { content: 'Mivvy offers Andrea, Jarvis, and Ultron.' } }] };
let client = 0;
function request(question = 'Tell me about Mivvy', headers = {}, method = 'POST') {
  return new Request('https://assistant.example.test/', { method,
    headers: { Origin: origin, 'Content-Type': 'application/json', 'cf-connecting-ip': `test-${++client}`, ...headers },
    ...(method === 'POST' ? { body: JSON.stringify({ question }) } : {}),
  });
}
test('worker supplies current facts to the model and returns only answer metadata', async t => {
  let sent;
  t.mock.method(globalThis, 'fetch', async (url, options) => {
    assert.equal(url, 'https://api.groq.com/openai/v1/chat/completions');
    sent = JSON.parse(options.body);
    return Response.json(answer);
  });
  const result = await worker.fetch(request(), { GROQ_API_KEY: 'synthetic-test-key' });
  assert.equal(result.status, 200);
  assert.equal(result.headers.get('access-control-allow-origin'), origin);
  assert.equal(result.headers.get('cache-control'), 'no-store');
  const body = await result.json();
  assert.equal(body.source, 'groq');
  assert.match(body.answer, /Mivvy/);
  assert.equal(JSON.stringify(body).includes('synthetic-test-key'), false);
  for (const fact of ['four projects', 'Mivvy', 'August 2026', 'https://freeopenmail.tech/', 'not the Windows executable', 'Account and provider limits apply']) assert.ok(sent.messages[0].content.includes(fact), fact);
  assert.equal(sent.messages[1].content, 'Tell me about Mivvy');
});
test('worker rejects disallowed origins and invalid input before contacting a model', async t => {
  const upstream = t.mock.method(globalThis, 'fetch', async () => { throw new Error('Must not be called'); });
  const env = { GROQ_API_KEY: 'synthetic-test-key' };
  assert.equal((await worker.fetch(request('hi', { Origin: 'https://attacker.example.test' }), env)).status, 403);
  for (const value of ['', ' ', 'x'.repeat(401), null, 42]) assert.equal((await worker.fetch(request(value), env)).status, 400);
  assert.equal((await worker.fetch(request('', {}, 'GET'), env)).status, 405);
  assert.equal((await worker.fetch(request('', {}, 'OPTIONS'), env)).status, 204);
  assert.equal(upstream.mock.callCount(), 0);
});
test('worker rate limits a repeated client without spending further model requests', async t => {
  const upstream = t.mock.method(globalThis, 'fetch', async () => Response.json(answer));
  const env = { GROQ_API_KEY: 'synthetic-test-key', PORTFOLIO_REQUEST_LIMIT: '2' };
  const headers = { 'cf-connecting-ip': 'rate-limit-test' };
  for (let i = 0; i < 2; i++) assert.equal((await worker.fetch(request('Mivvy', headers), env)).status, 200);
  assert.equal((await worker.fetch(request('Mivvy', headers), env)).status, 429);
  assert.equal(upstream.mock.callCount(), 2);
});
test('worker tries a fallback model only for retired or unavailable models', async t => {
  const models = [];
  t.mock.method(globalThis, 'fetch', async (_, options) => {
    const model = JSON.parse(options.body).model; models.push(model);
    return model === 'retired-model' ? Response.json({}, { status: 404 }) : Response.json(answer);
  });
  t.mock.method(console, 'error', () => {});
  const env = { GROQ_API_KEY: 'synthetic-test-key', GROQ_MODEL: 'retired-model,working-model' };
  assert.equal((await worker.fetch(request(), env)).status, 200);
  assert.deepEqual(models, ['retired-model', 'working-model']);
  models.length = 0;
  globalThis.fetch = async (_, options) => { models.push(JSON.parse(options.body).model); return Response.json({}, { status: 401 }); };
  const failed = await worker.fetch(request(), env);
  assert.equal(failed.status, 502);
  assert.deepEqual(models, ['retired-model']);
  assert.equal(JSON.stringify(await failed.json()).includes('401'), false);
});
test('Vercel endpoint applies the same input and origin boundaries', async t => {
  t.mock.method(globalThis, 'fetch', async () => Response.json(answer));
  const previous = process.env.GROQ_API_KEY;
  process.env.GROQ_API_KEY = 'synthetic-test-key';
  t.after(() => { if (previous === undefined) delete process.env.GROQ_API_KEY; else process.env.GROQ_API_KEY = previous; });
  const call = async (question, inputOrigin = origin) => {
    const res = { headers: {}, setHeader(key, value) { this.headers[key] = value; }, status(value) { this.code = value; return this; }, json(value) { this.body = value; return this; }, end() {} };
    await api({ method: 'POST', headers: { origin: inputOrigin, 'x-real-ip': `api-test-${++client}` }, body: { question } }, res);
    return res;
  };
  assert.equal((await call('Mivvy')).body.source, 'groq');
  assert.equal((await call('Mivvy', 'https://attacker.example.test')).code, 403);
  assert.equal((await call('x'.repeat(401))).code, 400);
});
test('both deployments use identical current facts and the browser allows time for fallback', () => {
  const sources = ['../worker.mjs', '../api/ask.js'].map(file => readFileSync(new URL(file, import.meta.url), 'utf8'));
  const facts = sources.map(source => source.match(/const PORTFOLIO_FACTS = \[([\s\S]*?)\]\.join\("\\n"\);/)[1]);
  assert.equal(facts[0], facts[1]);
  const clientCode = readFileSync(new URL('../frontend/src/Assistant.jsx', import.meta.url), 'utf8');
  const browserTimeout = Number(clientCode.match(/abort\(\), (\d+)\)/)[1]);
  for (const source of sources) assert.ok(Number(source.match(/TOTAL_TIMEOUT_MS = ([\d_]+)/)[1].replaceAll('_', '')) < browserTimeout);
});
