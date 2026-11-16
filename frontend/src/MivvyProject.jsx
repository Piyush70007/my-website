import { useState } from 'react';
import { ArrowUpRight, ChevronDown, Monitor, RotateCw, Smartphone } from 'lucide-react';
import { Reveal, useSiteMotion } from './MotionSystem.jsx';
import './mivvy.css';

export default function MivvyProject() {
  const [view, setView] = useState('desktop');
  const { enabled } = useSiteMotion();
  const desktop = view === 'desktop';
  return <Reveal><article id="mivvy" className="project project-mivvy">
    <div className="mivvy-layout"><div className="mivvy-description">
      <span className="project-kicker">02 / PERSONAL AI <span>DESKTOP + WEB</span></span>
      <h3>Mivvy<span>↗</span></h3>
      <p className="project-statement">A voice to talk to.<br />An assistant to act with.</p>
      <p className="project-description">A personal AI assistant with Andrea, Jarvis, and Ultron voice identities. Built as a Windows application and a mobile-focused web companion, each with its own interface and capabilities.</p>
      <div className="mivvy-capabilities">
        <section><h4><Monitor size={16} />Windows application</h4><p>Hands-free conversation, expressive speech, and supported desktop and browser commands. Audio controls and app actions depend on available integrations and permissions.</p></section>
        <section><h4><Smartphone size={16} />Web companion</h4><p>Conversations with expressive eyes, plus tasks, reminders, expenses, notes, habits, and focus tools. Linked laptop views are restricted to the owner account.</p></section>
      </div>
      <div className="tags"><span>Python / PySide6</span><span>Conversational AI</span><span>React web companion</span></div>
      <div className="project-links"><a href="https://skulls-personal-ai.vercel.app/" target="_blank" rel="noopener noreferrer" className="button mivvy-link">Visit Mivvy web<ArrowUpRight size={16} /></a></div>
    </div>
    <figure className="mivvy-real-preview">
      <div className="mivvy-capture-heading"><span>ONE ASSISTANT. TWO VIEWS.</span><div role="group" aria-label="Mivvy web screenshot views"><button aria-pressed={desktop} onClick={() => setView('desktop')} aria-label="Show Mivvy desktop-browser screenshot"><Monitor size={14} />Desktop</button><button aria-pressed={!desktop} onClick={() => setView('mobile')} aria-label="Show Mivvy phone screenshot"><Smartphone size={14} />Phone</button></div></div>
      <div className={`mivvy-flip-stage ${enabled ? '' : 'without-motion'}`}>
        <div className={`mivvy-flip-card ${desktop ? '' : 'is-flipped'}`}>
          <div className="mivvy-face mivvy-face-front" aria-hidden={!desktop} inert={!desktop}>
            <div className="mivvy-view-label"><Monitor size={13} /><span>DESKTOP BROWSER</span><i /><span>WEB APP</span></div>
            <div className="mivvy-capture desktop-capture"><img src="/assets/mivvy-web-desktop.jpg" width="1280" height="900" alt="Actual Mivvy web app in a desktop browser, showing its sidebar, expressive eyes, clean conversation screen, and message controls" loading="lazy" /></div>
          </div>
          <div className="mivvy-face mivvy-face-back" aria-hidden={desktop} inert={desktop}>
            <div className="mivvy-view-label"><Smartphone size={13} /><span>MOBILE COMPANION</span><i /><span>WEB APP</span></div>
            <div className="mivvy-capture mobile-capture"><img src="/assets/mivvy-web-mobile.jpg" width="390" height="844" alt="Actual Mivvy phone web interface with expressive eyes, conversation prompts, microphone controls, and bottom navigation" loading="lazy" /></div>
          </div>
        </div>
      </div>
      <div className="mivvy-flip-footer"><span aria-live="polite">{desktop ? '01 / DESKTOP BROWSER' : '02 / MOBILE WEB'}</span><button onClick={() => setView(desktop ? 'mobile' : 'desktop')} aria-label={desktop ? 'Flip Mivvy preview to mobile' : 'Flip Mivvy preview to desktop'}><RotateCw size={15} />Flip to {desktop ? 'mobile' : 'desktop'}</button></div>
      <figcaption>Captured from the live web app with a clean conversation. These are screenshots; the Windows application has a separate interface.</figcaption>
    </figure></div>
    <details className="project-details"><summary>Inside the project<ChevronDown size={16} /></summary><div>
      <p>Mivvy connects a Python/PySide6 Windows interface with cloud conversation and expressive speech. The shared build history documents DeepSeek for replies, Fish Audio voice integration, audio workers separated from the interface, and a lightweight reactive globe.</p>
      <p>The desktop build supports selected computer and browser actions, wake-by-identity, and goodbye-based conversation pause. The web version adds private conversations and personal tools. Owner-linked screen and camera snapshots are individually requested; they are not offered to every account.</p>
      <p>This is an evolving personal project. App control and speech responsiveness have practical limits. Gmail and Slack were still being connected at the end of the supplied build conversation.</p>
    </div></details>
  </article></Reveal>;
}

export function MivvyPreview() {
  const [view, setView] = useState('desktop');
  const { enabled } = useSiteMotion();
  const desktop = view === 'desktop';
  return <figure className="mivvy-real-preview">
      <div className="mivvy-capture-heading"><span>ONE ASSISTANT. TWO VIEWS.</span><div role="group" aria-label="Mivvy web screenshot views"><button aria-pressed={desktop} onClick={() => setView('desktop')} aria-label="Show Mivvy desktop-browser screenshot"><Monitor size={14} />Desktop</button><button aria-pressed={!desktop} onClick={() => setView('mobile')} aria-label="Show Mivvy phone screenshot"><Smartphone size={14} />Phone</button></div></div>
      <div className={`mivvy-flip-stage ${enabled ? '' : 'without-motion'}`}>
        <div className={`mivvy-flip-card ${desktop ? '' : 'is-flipped'}`}>
          <div className="mivvy-face mivvy-face-front" aria-hidden={!desktop} inert={!desktop}>
            <div className="mivvy-view-label"><Monitor size={13} /><span>DESKTOP BROWSER</span><i /><span>WEB APP</span></div>
            <div className="mivvy-capture desktop-capture"><img src="/assets/mivvy-web-desktop.jpg" width="1280" height="900" alt="Actual Mivvy web app in a desktop browser, showing its sidebar, expressive eyes, clean conversation screen, and message controls" loading="lazy" /></div>
          </div>
          <div className="mivvy-face mivvy-face-back" aria-hidden={desktop} inert={desktop}>
            <div className="mivvy-view-label"><Smartphone size={13} /><span>MOBILE COMPANION</span><i /><span>WEB APP</span></div>
            <div className="mivvy-capture mobile-capture"><img src="/assets/mivvy-web-mobile.jpg" width="390" height="844" alt="Actual Mivvy phone web interface with expressive eyes, conversation prompts, microphone controls, and bottom navigation" loading="lazy" /></div>
          </div>
        </div>
      </div>
      <div className="mivvy-flip-footer"><span aria-live="polite">{desktop ? '01 / DESKTOP BROWSER' : '02 / MOBILE WEB'}</span><button onClick={() => setView(desktop ? 'mobile' : 'desktop')} aria-label={desktop ? 'Flip Mivvy preview to mobile' : 'Flip Mivvy preview to desktop'}><RotateCw size={15} />Flip to {desktop ? 'mobile' : 'desktop'}</button></div>
      <figcaption>Captured from the live web app with a clean conversation. These are screenshots; the Windows application has a separate interface.</figcaption>
    </figure>;
}
