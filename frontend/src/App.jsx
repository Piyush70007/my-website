import { lazy, Suspense, useRef, useState } from 'react';
import { AnimatePresence, motion, useScroll, useSpring } from 'motion/react';
import { ArrowDown, ArrowUpRight, Check, ChevronDown, MapPin, MonitorPlay, MousePointerClick, Sparkles } from 'lucide-react';
import Assistant from './Assistant.jsx';
import { MivvyPreview } from './MivvyProject.jsx';
const AvatarBust = lazy(() => import('./AvatarBust.jsx'));
import { Reveal } from './MotionSystem.jsx';
import MailboxPreview from './MailboxPreview.jsx';
import { ApiPreview, SafeOpsDiagram } from './AnimatedProjects.jsx';
import { contact, education } from './content.js';
import { FaultLine, usePointerField, CountUp, DrawRule, Intro, introSeconds, Magnetic, Marquee, Parallax, Rise, SplitText, StageReveal, spot } from './Effects.jsx';
import '@fontsource-variable/bricolage-grotesque';

function External({ href, children, className = '' }) {
  return <a className={className} href={href} target="_blank" rel="noopener noreferrer">{children}<ArrowUpRight size={16} aria-hidden="true" /></a>;
}

function Header() {
  return <header className="v2-header v2-shell">
    <a className="v2-wordmark" href="#top" aria-label="Piyush Chavan, back to top"><i aria-hidden="true" />Piyush Chavan</a>
    <nav aria-label="Main navigation">
      {[['Work', '#work'], ['How I build', '#method'], ['Education', '#education'], ['About', '#about']].map(([name, href]) => <a href={href} key={href}>{name}</a>)}
      <a href="#ask" className="v2-nav-ai"><Sparkles size={14} aria-hidden="true" />Ask my AI</a>
      <a href="#contact" className="v2-nav-contact">Let’s talk</a>
    </nav>
  </header>;
}

function Hero() {
  return <section className="v2-hero v2-shell" aria-labelledby="hero-title">
    <div className="v2-hero-copy">
      <Rise delay={introSeconds - .1}><p className="v2-mono v2-hero-meta"><span>AI ENGINEER</span><span><MapPin size={12} aria-hidden="true" />BERLIN</span><span>M.SC. SOFTWARE ENGINEERING, 2026</span></p></Rise>
      <h1 id="hero-title"><SplitText text="I build AI products, then check where they break." accent="break." delay={introSeconds} /></h1>
      <Rise delay={introSeconds + .55}><p className="v2-lead">LLM applications, retrieval systems and agent workflows, taken from an idea to something people can use. Every project below is something you can try, watch, or read the code for.</p></Rise>
      <Rise delay={introSeconds + .7} className="v2-actions"><Magnetic><a className="v2-button v2-button-accent" href="#work">See the work<ArrowDown size={16} aria-hidden="true" /></a></Magnetic><Magnetic><a className="v2-button v2-button-line" href="#cv">Request my CV</a></Magnetic></Rise>
    </div>
    <Parallax className="v2-hero-side"><Rise delay={introSeconds + .3}>
      <div className="v2-bust"><Suspense fallback={<div style={{ height: 370 }} aria-label="Loading 3D portrait" />}><AvatarBust /></Suspense></div>
      <Assistant />
    </Rise></Parallax>
  </section>;
}

function Evidence() {
  return <section className="v2-evidence" aria-label="Measured results"><div className="v2-shell v2-evidence-grid">
    <div><b>6 <i>→</i> <CountUp from={6} to={33} /><small> / 40</small></b><p>Questions with the answer in context after OpenMail moved to BM25 retrieval, at the same 15% context budget.</p></div>
    <div><b><CountUp to={3} duration={.9} /> <small>clients</small></b><p>Mivvy runs on Windows, the web and native iOS, with owner-only access to the laptop.</p></div>
    <div><b><CountUp to={4} duration={1.1} /> <small>projects</small></b><p>Two with a live interface and a teaser video, one live API, one lab in development.</p></div>
  </div><Marquee items={['Retrieval', 'Evaluation', 'Agents', 'Voice', 'FastAPI', 'React', 'SwiftUI', 'Kubernetes']} /></section>;
}

function Media({ name, video, poster, length, children }) {
  const [view, setView] = useState('demo');
  return <div className="v2-media">
    <div className="v2-media-tabs" role="group" aria-label={`${name} preview`}>
      <button aria-pressed={view === 'demo'} onClick={() => setView('demo')}>{view === 'demo' && <motion.i layoutId={`tab-${name}`} className="v2-tab-pill" transition={{ type: 'spring', stiffness: 420, damping: 34 }} />}<span><MousePointerClick size={15} aria-hidden="true" />Live demo</span></button>
      <button aria-pressed={view === 'video'} onClick={() => setView('video')}>{view === 'video' && <motion.i layoutId={`tab-${name}`} className="v2-tab-pill" transition={{ type: 'spring', stiffness: 420, damping: 34 }} />}<span><MonitorPlay size={15} aria-hidden="true" />Teaser video<small>{length}</small></span></button>
    </div>
    <StageReveal>
      <div hidden={view !== 'demo'}>{children}</div>
      <AnimatePresence>{view === 'video' && <motion.div className="v2-video" initial={{ opacity: 0, scale: .97 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: .45, ease: [.2, .8, .2, 1] }}><video src={video} poster={poster} controls playsInline preload="metadata" aria-label={`${name} teaser video`} /><p>Product teaser. Screens are recreated from the app’s real design.</p></motion.div>}</AnimatePresence>
    </StageReveal>
  </div>;
}

function Details({ children }) { return <details className="v2-details"><summary>Inside the project<ChevronDown size={16} aria-hidden="true" /></summary><div>{children}</div></details>; }

function Work() {
  return <section className="v2-work v2-shell" id="work" aria-labelledby="work-title">
    <Reveal><div className="v2-section-head"><h2 id="work-title"><SplitText text="Selected work" /></h2><span className="v2-mono">04 PROJECTS · TRY THEM, DON’T JUST READ</span></div></Reveal>

    <Reveal><article className="v2-case" id="openmail">
      <div className="v2-case-head">
        <div><span className="v2-mono">01 · AI PRODUCT · <b>LIVE</b></span><h3>OpenMail</h3><p className="v2-statement">Your domain. An inbox with an AI teammate.</p></div>
        <div><p>Email on a domain you own, with AI representatives that answer from your documents. Replies are built from exact quotes checked against the source, and hand over to a person when they cannot be.</p>
          <div className="v2-measured"><span className="v2-mono">WHAT I MEASURED</span><p>BM25 passage retrieval put the answer in context for 33 of 40 questions, up from 6, at the same 15% budget. This measures retrieval, not end-to-end accuracy.</p></div>
          <div className="v2-links"><External href="https://freeopenmail.tech/" className="v2-button v2-button-dark">Open the product</External><External href="https://github.com/Piyush70007/openmail-site">Source</External><External href="https://github.com/Piyush70007/openmail-site/blob/main/docs/RETRIEVAL_EVAL.md">Evaluation report</External></div></div>
      </div>
      <Media name="OpenMail" video="/assets/video/openmail-teaser.mp4" poster="/assets/video/openmail-teaser.jpg" length="0:33"><div className="project project-openmail v2-stage"><MailboxPreview /></div></Media>
      <Details><p>I built the email workspace and its AI tools: company knowledge, reply review, practice tests, representatives, rules, and results. The demo runs the real mailbox UI against fictional data.</p><p>Custom domains need verification. Automatic replies follow the configured checks and handover rules; account and provider limits apply.</p></Details>
    </article></Reveal>

    <Reveal><article className="v2-case" id="mivvy">
      <div className="v2-case-head">
        <div><span className="v2-mono">02 · PERSONAL AI · <b>WINDOWS + WEB + IOS</b></span><h3>Mivvy</h3><p className="v2-statement">A voice to talk to. An assistant to act with.</p></div>
        <div><p>A personal assistant you speak to. On Windows it opens apps, plays music and sets reminders. From the web or an iPhone, the owner can ask for a view of the laptop’s screen or camera.</p>
          <div className="v2-measured"><span className="v2-mono">WHAT I CHECKED</span><p>Actions are reported only after they are verified. Laptop views belong to the owner account alone. Supported actions and response speed have practical limits.</p></div>
          <div className="v2-links"><External href="https://skulls-personal-ai.vercel.app/" className="v2-button v2-button-dark">Visit Mivvy web</External></div></div>
      </div>
      <Media name="Mivvy" video="/assets/video/mivvy-teaser.mp4" poster="/assets/video/mivvy-teaser.jpg" length="1:03"><div className="project project-mivvy v2-stage v2-stage-mivvy"><MivvyPreview /></div></Media>
      <Details><p>Mivvy connects a Python/PySide6 Windows interface with cloud conversation and expressive speech, with audio workers separated from the interface. The web version adds private conversations and personal tools such as tasks, reminders, notes and expenses.</p><p>Owner-linked screen and camera snapshots are individually requested; they are not offered to every account. This is an evolving personal project.</p></Details>
    </article></Reveal>

    <div className="v2-pair">
      <Reveal><article className="v2-case v2-case-small fx-spot" id="sentryml" onPointerMove={spot}>
        <span className="v2-mono">03 · MACHINE LEARNING · <b>API LIVE</b></span><h3>SentryML</h3><p className="v2-statement">A prediction is only the beginning.</p>
        <p>Customer-churn prediction with logging and drift monitoring, built to make a model useful beyond the training notebook.</p>
        <div className="project project-sentry v2-stage"><ApiPreview /></div>
        <div className="v2-links"><External href="https://sentryml-risk-engine.onrender.com/docs" className="v2-button v2-button-dark">Explore the API</External><External href="https://github.com/Piyush70007/sentryml-risk-engine">Source</External></div>
        <Details><p>XGBoost serves predictions through FastAPI. SQLite stores prediction logs, while monitoring endpoints compare new inputs against a training-data baseline.</p></Details>
      </article></Reveal>
      <Reveal delay={.08}><article className="v2-case v2-case-small fx-spot" id="safeops" onPointerMove={spot}>
        <span className="v2-mono">04 · AGENT SAFETY · <b className="v2-wip">IN DEVELOPMENT</b></span><h3>SafeOps AI</h3><p className="v2-statement">Give agents tools. Keep control.</p>
        <p>A learning lab for policy-controlled AI operations: how useful agents can work inside clear, testable boundaries.</p>
        <div className="project project-safeops v2-stage"><SafeOpsDiagram /></div>
        <div className="v2-links"><External href="https://github.com/Piyush70007/Safeops-ai" className="v2-button v2-button-dark">Explore the source</External></div>
        <Details><p>A router assigns work, OPA authorizes tool calls, deterministic gates check changes, and Argo Rollouts manages promotion or rollback. This is an in-progress lab, not a deployed autonomous operations service.</p></Details>
      </article></Reveal>
    </div>
  </section>;
}

function Method() {
  const items = [
    ['Compare against a baseline', 'A retrieval or prompt change is run against the previous version on a fixed set before it ships.'],
    ['Test the failure paths', 'Account ownership, replayed webhooks, unsafe automatic replies, cancelled jobs and the reminder lifecycle.'],
    ['Say what is synthetic', 'Synthetic tests, live checks and planned features stay clearly separated in each project’s documentation.'],
    ['Work with AI, with scope', 'Coding agents for implementation, debugging and deployment, each task with explicit limits and validation steps.'],
  ];
  return <section className="v2-method v2-shell" id="method" aria-labelledby="method-title">
    <h2 id="method-title"><SplitText text="A demo that works once is not the finish line." /></h2>
    <div><DrawRule /><div className="v2-method-grid">{items.map(([title, body], index) => <Reveal key={title} delay={index * .1}><div><span className="v2-mono">0{index + 1}</span><h3>{title}</h3><p>{body}</p></div></Reveal>)}</div></div>
  </section>;
}

function Education() {
  return <section className="v2-education v2-shell" id="education" aria-labelledby="education-title">
    <Reveal><div className="v2-section-head"><h2 id="education-title"><SplitText text="Education" /></h2><span className="v2-mono">PUNE → POTSDAM</span></div></Reveal>
    <div className="v2-education-grid">{education.map((item, index) => <Reveal key={item.id} delay={index * .08}><article className="v2-education-card fx-spot" onPointerMove={spot}>
      <div className="v2-mono v2-education-top"><span>{item.level}</span><span><Check size={12} aria-hidden="true" />COMPLETED</span></div>
      <a href={item.url} target="_blank" rel="noopener noreferrer" className="v2-logo"><img src={item.logo} alt={`${item.university} logo`} loading="lazy" width={item.id === 'ue' ? 340 : 184} height={item.id === 'ue' ? 97 : 95} /></a>
      <h3>{item.degree}</h3><p>{item.university}</p>
      <div className="v2-mono v2-education-meta"><span><MapPin size={12} aria-hidden="true" />{item.location}</span><time dateTime={item.dateTime}>{item.date}</time></div>
    </article></Reveal>)}</div>
  </section>;
}

function About() {
  const rows = [['LANGUAGES', 'Python, JavaScript, SQL, Swift'], ['APPLICATIONS', 'FastAPI, Node.js, React, Next.js, SwiftUI, Supabase/PostgreSQL, SQLite'], ['ML', 'XGBoost, retrieval evaluation, LLM systems'], ['DELIVERY', 'Git, GitHub Actions, Docker, pytest, XCTest, Vercel'], ['SAFETY LAB', 'Kubernetes, Open Policy Agent']];
  return <section className="v2-about v2-shell" id="about" aria-labelledby="about-title">
    <Reveal><div className="v2-about-copy"><span className="v2-mono">ABOUT</span><h2 id="about-title">I’m Piyush, an AI developer in Berlin. I’m interested in the space between a clever model and something people can actually use.</h2><p>That curiosity takes me from prediction APIs to intelligent email and safer agent workflows. I like tracing an idea all the way through: how it works, where it breaks, and how to make it clearer.</p></div></Reveal>
    <Reveal delay={.08}><dl className="v2-tools">{rows.map(([name, value]) => <div key={name}><dt className="v2-mono">{name}</dt><dd>{value}</dd></div>)}</dl></Reveal>
  </section>;
}

function Footer() {
  return <footer id="contact" className="v2-contact fx-spot fx-spot-dark" onPointerMove={spot}><div className="v2-shell">
    <h2><SplitText text="Have something worth building?" /> <a href={`mailto:${contact.email}`}>Let’s make it useful.</a></h2>
    <div className="v2-contact-actions" id="cv">
      <Magnetic><a className="v2-button v2-button-light" href={`mailto:${contact.email}`}>{contact.email}</a></Magnetic>
      <a className="v2-button v2-button-ghost" href={contact.cv || `mailto:${contact.email}?subject=Your%20latest%20CV`} {...(contact.cv ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>{contact.cv ? 'View my CV' : 'Request my CV'}</a>
      <External href={contact.linkedin} className="v2-button v2-button-ghost">LinkedIn</External>
      <External href={contact.github} className="v2-button v2-button-ghost">GitHub</External>
    </div>
    <div className="v2-mono v2-footer-bottom"><span>© {new Date().getFullYear()} PIYUSH CHAVAN · BERLIN</span><span>CURIOSITY, PUT TO WORK.</span><a href="#top">BACK TO TOP ↑</a></div>
  </div></footer>;
}

export default function App() {
  const { scrollYProgress } = useScroll(), scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 28, mass: .2 });
  usePointerField();
  return <><Intro /><FaultLine /><a className="skip-link" href="#main">Skip to content</a><motion.div className="scroll-progress" style={{ scaleX }} /><div id="top" /><Header /><main id="main"><Hero /><Evidence /><Work /><Method /><Education /><About /></main><Footer /></>;
}
