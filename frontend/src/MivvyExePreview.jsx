import { useEffect, useRef, useState } from 'react';
import { Mic, Send, Square, X } from 'lucide-react';
import { useActiveScene } from './MotionSystem.jsx';
import './mivvy-exe.css';

const identities = {
  andrea: { name: 'Andrea', line: 'Warm. Thoughtful. By your side.', color: '#efa6d5', rgb: '242, 98, 191' },
  jarvis: { name: 'Jarvis', line: 'Calm. Precise. Always ready.', color: '#85dfff', rgb: '70, 191, 255' },
  ultron: { name: 'Ultron', line: 'Focused. Decisive. Built to act.', color: '#ff8e80', rgb: '255, 91, 70' },
};

function sampleReply(text, name) {
  if (/\b(remind|task|schedule)\b/i.test(text)) return 'Mivvy can turn a request into a reminder or task. This local preview only demonstrates the conversation — nothing has been scheduled.';
  if (/\b(open|play|gmail|computer|laptop|browser)\b/i.test(text)) return 'In the Windows app, supported commands go to its desktop controller. This portfolio preview stays on this page and has no access to your computer.';
  if (/\b(who|what can|help|features)\b/i.test(text)) return `I’m ${name}. Mivvy brings together voice conversation, personal tools and supported computer actions. Try another identity to see the interface change.`;
  return { Andrea: 'Hey, I’m Andrea. A little space for your ideas. What are we working on today?', Jarvis: 'Hey, I’m Jarvis. At your service. What shall we work on?', Ultron: 'Hey, I’m Ultron. Systems ready. Give me a direction.' }[name];
}

function ReactiveGlobe({ identity, phase, lowPower }) {
  const holder = useRef(null), canvas = useRef(null);
  const running = useActiveScene(holder);
  useEffect(() => {
    const element = canvas.current, parent = holder.current;
    if (!element || !parent) return;
    const context = element.getContext('2d');
    if (!context) return;
    let size = 260, raf, last = 0;
    const count = lowPower ? 92 : 220;
    const points = Array.from({ length: count }, (_, i) => {
      const y = 1 - 2 * (i + .5) / count, radius = Math.sqrt(1 - y * y), angle = i * Math.PI * (3 - Math.sqrt(5));
      return [Math.cos(angle) * radius, y, Math.sin(angle) * radius];
    });
    const resize = () => {
      const bounds = parent.getBoundingClientRect();
      size = Math.max(100, Math.min(bounds.width, bounds.height, 460));
      const dpr = Math.min(devicePixelRatio || 1, 1.5);
      element.width = Math.round(size * dpr); element.height = Math.round(size * dpr);
      element.style.width = `${size}px`; element.style.height = `${size}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const draw = now => {
      if (running) raf = requestAnimationFrame(draw);
      if (running && now - last < 1000 / (lowPower ? 12 : 24)) return;
      last = now;
      const time = running ? now / 1000 : 0;
      const energy = phase === 'Replying' ? .07 : phase === 'Thinking' ? .04 : phase === 'Listening' ? .025 : .015;
      const radius = size * (.33 + Math.sin(time * 3) * energy), angle = time * .16;
      context.clearRect(0, 0, size, size); context.save(); context.translate(size / 2, size / 2);
      const glow = context.createRadialGradient(0, 0, radius * .2, 0, 0, radius * 1.42);
      glow.addColorStop(0, `rgba(${identity.rgb},.16)`); glow.addColorStop(.7, `rgba(${identity.rgb},.13)`); glow.addColorStop(1, `rgba(${identity.rgb},0)`);
      context.fillStyle = glow; context.fillRect(-size / 2, -size / 2, size, size);
      const projected = points.map(([x, y, z], i) => {
        const turnX = x * Math.cos(angle) + z * Math.sin(angle), turnZ = z * Math.cos(angle) - x * Math.sin(angle);
        const wave = 1 + Math.sin(time * 1.6 + i * .33) * .035;
        return { x: turnX * radius * wave, y: y * radius * wave, z: turnZ };
      });
      context.lineWidth = .55;
      projected.forEach((point, i) => {
        for (const offset of [5, 8, 13]) {
          const other = projected[(i + offset) % count];
          if (Math.hypot(point.x - other.x, point.y - other.y) > radius * .55) continue;
          context.strokeStyle = `rgba(${identity.rgb},${.06 + (point.z + 1) * .12})`;
          context.beginPath(); context.moveTo(point.x, point.y); context.lineTo(other.x, other.y); context.stroke();
        }
      });
      for (let ring = 0; ring < 3; ring++) {
        context.beginPath(); context.strokeStyle = `rgba(${identity.rgb},.38)`; context.lineWidth = .8;
        for (let i = 0; i <= 90; i++) {
          const step = i / 90 * Math.PI * 2, tilt = .5 + ring * .82 + time * .07;
          const x = Math.cos(step) * radius * 1.03, y = Math.sin(step) * radius * .42;
          const px = x * Math.cos(tilt) - y * Math.sin(tilt), py = x * Math.sin(tilt) + y * Math.cos(tilt);
          if (i === 0) context.moveTo(px, py); else context.lineTo(px, py);
        }
        context.stroke();
      }
      projected.sort((a, b) => a.z - b.z).forEach(point => {
        context.beginPath(); context.fillStyle = `rgba(${identity.rgb},${.25 + (point.z + 1) * .35})`;
        context.arc(point.x, point.y, .6 + (point.z + 1) * .7, 0, Math.PI * 2); context.fill();
      });
      context.restore();
    };
    resize(); draw(performance.now());
    const observer = new ResizeObserver(() => { resize(); if (!running) draw(performance.now()); });
    observer.observe(parent);
    return () => { cancelAnimationFrame(raf); observer.disconnect(); };
  }, [identity, phase, lowPower, running]);
  return <div className="exe-globe" ref={holder} data-running={running} data-low-power={lowPower} aria-hidden="true"><canvas ref={canvas} /></div>;
}

export default function MivvyExePreview() {
  const [mode, setMode] = useState('andrea'), [listening, setListening] = useState(false), [lowPower, setLowPower] = useState(false);
  const [input, setInput] = useState(''), [phase, setPhase] = useState('Ready'), [tools, setTools] = useState(false);
  const [messages, setMessages] = useState([]);
  const timer = useRef(), feed = useRef();
  const identity = identities[mode];
  const visualPhase = phase === 'Ready' && listening ? 'Listening' : phase;
  useEffect(() => () => clearTimeout(timer.current), []);
  useEffect(() => { if (feed.current) feed.current.scrollTop = feed.current.scrollHeight; }, [messages, phase]);
  const stop = () => { clearTimeout(timer.current); setPhase('Ready'); };
  const choose = key => { stop(); setMode(key); };
  const send = event => {
    event.preventDefault(); const text = input.trim().slice(0, 220); if (!text) return;
    stop(); setInput(''); setMessages(items => [...items, { who: 'You', text }].slice(-10)); setPhase('Thinking');
    timer.current = setTimeout(() => {
      setMessages(items => [...items, { who: identity.name, text: sampleReply(text, identity.name) }].slice(-10)); setPhase('Replying');
      timer.current = setTimeout(() => setPhase('Ready'), 1500);
    }, 450);
  };
  return <div className="exe-demo" style={{ '--exe-accent': identity.color, '--exe-rgb': identity.rgb }} aria-label="Interactive Mivvy Windows interface preview">
    <div className="exe-titlebar"><span><i />mivvy.exe</span><span>INTERACTIVE PREVIEW</span><span aria-hidden="true">—　□　×</span></div>
    <header className="exe-toolbar"><div><b>m. mivvy</b><small>A little more human.</small></div><div><span className="exe-local">● Local demo</span><button type="button" onClick={() => setTools(value => !value)} aria-expanded={tools}>My tools ↗</button><button type="button" onClick={() => setLowPower(value => !value)} aria-pressed={lowPower}>Low power</button></div></header>
    <div className="exe-demo-body">
      <section className="exe-identity"><div className="exe-persona-heading"><div><h4>{identity.name}</h4><p>{identity.line}</p></div><span>{visualPhase}</span></div>
        <ReactiveGlobe identity={identity} phase={visualPhase} lowPower={lowPower} />
        <p className="exe-globe-caption">{phase === 'Thinking' ? 'A thought taking shape.' : phase === 'Replying' ? 'A little energy in every reply.' : 'Here when you need me.'}</p>
        <div className="exe-personas" role="group" aria-label="Preview voice identity">{Object.entries(identities).map(([key, item]) => <button key={key} type="button" aria-pressed={mode === key} onClick={() => choose(key)}>● {item.name}</button>)}</div>
      </section>
      <section className="exe-conversation"><div className="exe-conversation-heading"><h4>{tools ? 'My tools' : 'Conversation'}</h4><span>{tools ? 'EXAMPLE DATA' : 'SAMPLE REPLIES'}</span>{tools && <button type="button" onClick={() => setTools(false)} aria-label="Close preview tools"><X size={15} /></button>}</div>
        {tools ? <div className="exe-tools"><p>Personal tools in the real app</p>{[['Daily tasks', 'Plan the next step'], ['Reminders', 'Keep the important things close'], ['Money space', 'Track expenses and monthly budgets']].map(([title, text]) => <div key={title}><b>{title}</b><span>{text}</span></div>)}<small>This panel shows examples. It does not create or save entries.</small></div> : <>
          <div className="exe-message-feed" ref={feed} role="log" aria-label="Local sample conversation" aria-live="polite">{messages.length ? messages.map((item, i) => <div key={i} className={`exe-message ${item.who === 'You' ? 'from-user' : ''}`}><small>{item.who}</small><p>{item.text}</p></div>) : <div className="exe-welcome"><b>A little space.<br />Just for you.</b><p>Switch an identity, or type a hello.<br />Try the interface for yourself.</p></div>}{phase === 'Thinking' && <div className="exe-thinking" aria-label="Preparing a sample reply"><i /><i /><i /></div>}</div>
          <form className="exe-composer" onSubmit={send}><label className="sr-only" htmlFor="mivvy-exe-message">Message the Mivvy demo</label><input id="mivvy-exe-message" value={input} onChange={event => setInput(event.target.value)} maxLength={220} placeholder="Say hello. Try the interface." autoComplete="off" /><button type="submit" aria-label="Send sample message" disabled={!input.trim()}><Send size={15} /></button></form>
        </>}
      </section>
    </div>
    <div className="exe-demo-controls"><button type="button" onClick={() => setListening(value => !value)} aria-pressed={listening}><Mic size={13} />{listening ? 'Listening preview' : 'Try listening state'}</button><button type="button" onClick={stop} disabled={phase === 'Ready'}><Square size={11} />Stop</button><span>{listening ? 'Visual simulation · microphone stays off' : 'A responsive glimpse of the Windows app'}</span></div>
    <p className="exe-demo-disclosure">Interactive UI demo · local sample replies · no microphone, account or computer access.</p>
  </div>;
}
