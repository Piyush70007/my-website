import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ArrowRight, Inbox, Maximize2, Pause, Play, ShieldCheck, Sparkles, X } from 'lucide-react';
import { TiltFrame, useActiveScene, useSceneCycle, useSiteMotion } from './MotionSystem.jsx';

const scenes = [
  { key: 'inbox', label: 'Mail arrives', note: 'A familiar inbox for addresses on your own domain.', icon: Inbox },
  { key: 'representative', label: 'Set the boundaries', note: 'Choose the AI representative and when checked replies may be sent.', icon: Sparkles },
  { key: 'training', label: 'Test before trusting', note: 'Practice questions reveal which answers need a person.', icon: ShieldCheck },
  { key: 'trust', label: 'See the results', note: 'Review replies, handovers, and feedback in one place.', icon: ShieldCheck },
];
const durations = [4800, 5600, 5600, 6500];

export default function MailboxPreview() {
  const ref = useRef(null), frame = useRef(null), explorer = useRef(null), dialog = useRef(null), trigger = useRef(null);
  const [width, setWidth] = useState(0), [expanded, setExpanded] = useState(false), [playing, setPlaying] = useState(true), [ready, setReady] = useState(false);
  const active = useActiveScene(ref, .2), { enabled } = useSiteMotion();
  const running = active && playing && !expanded;
  const [step, setStep] = useSceneCycle(durations, running && ready);
  const scene = scenes[step];
  useEffect(() => { const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width)); observer.observe(ref.current); return () => observer.disconnect(); }, []);
  useEffect(() => {
    const listener = event => {
      if (event.source === frame.current?.contentWindow && event.data?.type === 'portfolio:ready') setReady(true);
      if (event.source === explorer.current?.contentWindow && event.data?.type === 'portfolio:close') dialog.current?.close();
    };
    window.addEventListener('message', listener);
    return () => window.removeEventListener('message', listener);
  }, []);
  useEffect(() => {
    // Opaque-origin sandbox: messages contain only a scene name and animation flags.
    frame.current?.contentWindow?.postMessage({ type: 'portfolio:scene', scene: scene.key, animated: enabled && active, running }, '*');
  }, [scene.key, ready, running, enabled, active]);
  useEffect(() => {
    if (!expanded) return;
    const root = document.documentElement, previous = root.style.overflow;
    root.style.overflow = 'hidden';
    return () => { root.style.overflow = previous; };
  }, [expanded]);
  function close() { dialog.current?.close(); }
  function closed() { setExpanded(false); trigger.current?.focus({ preventScroll: true }); }
  return <div className="mail-story" data-scene={scene.key} data-running={running}>
    <div className="story-intro"><span className="story-live"><i />WATCH THE WORKSPACE IN MOTION</span><button onClick={() => setPlaying(value => !value)} aria-label={playing ? 'Pause OpenMail tour' : 'Play OpenMail tour'} aria-pressed={!playing}>{playing ? <Pause size={13} /> : <Play size={13} />}{playing ? 'Pause tour' : 'Play tour'}</button></div>
    <TiltFrame><div className="mail-preview">
      <div className="preview-label"><span><i />ACTUAL OPENMAIL INTERFACE</span><button ref={trigger} onClick={() => { setExpanded(true); dialog.current.showModal(); }}><Maximize2 size={13} />Explore interface</button></div>
      <div className="mail-preview-window" ref={ref} style={{ height: width ? width * 850 / 1440 : undefined }} inert>
        <iframe ref={frame} title="Animated tour of the actual OpenMail interface with fictional data" src="/openmail/app.html" loading="lazy" sandbox="allow-scripts" tabIndex={-1} style={{ width: 1440, height: 850, transform: `scale(${width / 1440})` }} />
      </div>
      <div className="preview-caption"><span>Actual interface · fictional mail & metrics · no messages sent</span><span>GUIDED PRODUCT TOUR</span></div>
    </div></TiltFrame>
    <div className="tour-steps" aria-label="OpenMail tour scenes">{scenes.map((item, index) => {
      const Icon = item.icon;
      return <button key={item.key} aria-current={step === index ? 'step' : undefined} onClick={() => { setStep(index); setPlaying(false); }}><span className="tour-step-number">0{index + 1}</span><Icon size={16} /><b>{item.label}</b><span className="tour-progress" key={`${step}-${running}`} style={{ '--scene-duration': `${durations[step]}ms` }} /></button>;
    })}</div>
    <div className="tour-narration"><p key={scene.key}>{scene.note}</p><button aria-label="Next OpenMail tour scene" onClick={() => { setStep((step + 1) % scenes.length); setPlaying(false); }}><ArrowRight size={18} /></button></div>
    {createPortal(<dialog className="mail-dialog" aria-labelledby="mail-dialog-title" ref={dialog} onClose={closed} onClick={event => { if (event.target === dialog.current) close(); }}>
      <div className="mail-dialog-heading"><div><b id="mail-dialog-title">Explore OpenMail</b><span>Actual interface · fictional mail and metrics · sending and saving are disabled</span></div><button type="button" autoFocus onClick={close} aria-label="Close OpenMail preview"><X size={22} aria-hidden="true" /></button></div>
      {expanded && <iframe ref={explorer} title="Interactive OpenMail interface with sample data" src="/openmail/app.html" sandbox="allow-scripts" />}
    </dialog>, document.body)}
  </div>;
}
