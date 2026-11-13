import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowUp, ArrowUpRight, Sparkles, X } from 'lucide-react';
import { assistantEndpoint, localAnswer } from './content.js';

export default function Assistant() {
  const [question, setQuestion] = useState('');
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const active = useRef(null);
  const endpoint = assistantEndpoint(window.location.origin);
  useEffect(() => () => active.current?.abort(), []);

  async function ask(value) {
    const clean = value.trim().slice(0, 400);
    if (!clean || busy) return;
    const fallback = localAnswer(clean);
    setQuestion('');
    if (!endpoint) { setResult({ ...fallback, mode: 'Portfolio guide · published facts' }); return; }
    setBusy(true);
    active.current = new AbortController();
    const timer = setTimeout(() => active.current?.abort(), 16000);
    try {
      const response = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ question: clean }), signal: active.current.signal });
      if (!response.ok) throw new Error('Assistant unavailable');
      const data = await response.json();
      if (typeof data.answer !== 'string' || !data.answer.trim()) throw new Error('Empty response');
      setResult({ ...fallback, answer: data.answer.slice(0, 4000), mode: `${data.source === 'groq' ? 'Groq' : data.source === 'gemini' ? 'Gemini' : data.source === 'claude' ? 'Claude' : 'AI'} answer · check details with Piyush` });
    } catch { setResult({ ...fallback, mode: 'Portfolio guide · AI unavailable' }); }
    finally { clearTimeout(timer); setBusy(false); }
  }

  return <section className="assistant" id="ask" aria-labelledby="assistant-title">
    <div className="assistant-heading"><span className="assistant-spark"><Sparkles size={17} /></span><h2 id="assistant-title">Ask my AI.</h2><span className="assistant-status"><i />{endpoint ? 'ABOUT ME' : 'PREVIEW GUIDE'}</span></div>
    <p>A shortcut to my projects, skills, and story.</p>
    <form onSubmit={event => { event.preventDefault(); ask(question); }}>
      <label className="sr-only" htmlFor="assistant-question">Ask about Piyush</label>
      <input id="assistant-question" value={question} onChange={event => setQuestion(event.target.value)} placeholder="What has Piyush built?" maxLength={400} autoComplete="off" disabled={busy} />
      <button type="submit" aria-label="Ask my AI" disabled={busy || !question.trim()}><ArrowUp size={20} /></button>
    </form>
    <div className="prompt-row">{['His projects', 'His education', 'His skills'].map((label, index) => <button key={label} disabled={busy} onClick={() => ask(['What projects has he built?', 'What is his education?', 'What are his skills?'][index])}>{label}<ArrowUpRight size={12} /></button>)}</div>
    <div aria-live="polite" aria-busy={busy}>
      {busy && <p className="thinking">Thinking through the portfolio…</p>}
      {result && <motion.div className="assistant-answer" key={result.answer} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: .22 }}>
        <div className="answer-label"><span>{result.mode}</span><button aria-label="Close answer" onClick={() => setResult(null)}><X size={15} /></button></div>
        <p>{result.answer}</p><a href={result.link}>{result.label}<ArrowUpRight size={14} /></a>
      </motion.div>}
    </div>
    {endpoint && <small className="assistant-privacy">Questions go to my AI service. Please leave out private information.</small>}
  </section>;
}
