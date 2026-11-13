import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from 'motion/react';
import { ArrowDown, ArrowUpRight, Check, ChevronDown, FileText, MapPin, Menu, MoveUpRight, ShieldCheck, Sparkles, Terminal, X, Maximize2 } from 'lucide-react';
import Assistant from './Assistant.jsx';
import MivvyProject from "./MivvyProject.jsx";
const AvatarBust = lazy(() => import('./AvatarBust.jsx'));
import { Reveal, useSiteMotion } from "./MotionSystem.jsx";
import MailboxPreview from "./MailboxPreview.jsx";
import { ApiPreview, SafeOpsDiagram } from "./AnimatedProjects.jsx";
import { contact, education } from './content.js';

function External({ href, children, className = '' }) {
  return <a className={className} href={href} target="_blank" rel="noopener noreferrer">{children}<ArrowUpRight size={17} aria-hidden="true" /></a>;
}
function Header() {
  const [open, setOpen] = useState(false), menuRef = useRef(null);
  useEffect(() => { const close = event => { if (event.key === 'Escape' && open) { setOpen(false); menuRef.current?.focus(); } }; window.addEventListener('keydown', close); return () => window.removeEventListener('keydown', close); }, [open]);
  return <header className="site-header">
    <a className="wordmark" href="#top" aria-label="Piyush Chavan, back to top"><span className="monogram">pc<span>↗</span></span><span>Piyush Chavan<span className="wordmark-role">AI DEVELOPER</span></span></a>
    <button className="menu-toggle" ref={menuRef} aria-label={open ? 'Close navigation' : 'Open navigation'} aria-controls="main-navigation" aria-expanded={open} onClick={() => setOpen(value => !value)}>{open ? <X /> : <Menu />}</button>
    <nav id="main-navigation" className={open ? 'is-open' : ''} aria-label="Main navigation">
      {[['Work', '#work'], ['Education', '#education'], ['About', '#about'], ['CV', '#cv']].map(([name, href]) => <a href={href} key={href} onClick={() => setOpen(false)}>{name}</a>)}
      <a href="#ask" className="nav-ai" onClick={() => setOpen(false)}><Sparkles size={14} />Ask my AI</a><a href="#contact" className="nav-contact" onClick={() => setOpen(false)}>Let’s talk<ArrowUpRight size={15} /></a>
    </nav>
  </header>;
}
function Hero() {
  const [clock, setClock] = useState(''), ref = useRef(null), reduced = useReducedMotion();
  const { enabled } = useSiteMotion();
  useEffect(() => { const update = () => setClock(new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Berlin', hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date())); update(); const id = setInterval(update, 60000); return () => clearInterval(id); }, []);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const shift = useTransform(scrollYProgress, [0, 1], [0, 65]);
  return <section className="hero shell" ref={ref} aria-labelledby="hero-title">
    <div className="hero-top"><span className="eyebrow"><i className="status-dot" />INDEPENDENT MIND. APPLIED AI.</span><span className="eyebrow hero-location"><MapPin size={12} />BERLIN, DE <span>{clock}</span></span></div>
    <div className="hero-grid">
      <div className="hero-copy"><p className="hello">Hi, I’m Piyush.</p><h1 id="hero-title"><span className="title-line"><span>Curious mind.</span></span><span className="title-line"><span className="title-color">Useful</span></span><span className="title-line"><span className="title-color">machines.</span></span></h1>
        <Reveal delay={.1}><p className="hero-description">I turn ideas about AI into things you can use.<br className="desktop-break" /> From an intelligent inbox to models that work beyond a notebook.</p><div className="hero-actions"><a className="button button-light" href="#work">Explore my work<ArrowDown size={16} /></a><a className="text-link" href="#about">A little about me<ArrowUpRight size={16} /></a></div></Reveal>
      </div>
      <div className="hero-right"><motion.div className="hero-object" style={{ y: reduced || !enabled ? 0 : shift }}><Suspense fallback={<div style={{height:370}} aria-label="Loading 3D portrait" />}><AvatarBust /></Suspense></motion.div><Assistant /></div>
    </div>
    <div className="hero-bottom"><span>IDEA → MODEL → SOMETHING USEFUL</span><a href="#work">SCROLL TO EXPLORE<ArrowDown size={12} /></a><span>SELECTED WORK / 2026</span></div>
    <div className="motion-ribbon" aria-label="Applied AI, useful products, considered systems"><div aria-hidden="true">{[0, 1].map(copy => <span className="ribbon-copy" key={copy}>APPLIED AI <i>✳</i> USEFUL PRODUCTS <i>✳</i> CONSIDERED SYSTEMS <i>✳</i> ALWAYS CURIOUS <i>✳</i></span>)}</div></div>
  </section>;
}
function ProjectDetails({ children }) { return <details className="project-details"><summary>Inside the project<ChevronDown size={16} /></summary><div>{children}</div></details>; }
function Work() {
  return <section className="work shell" id="work" aria-labelledby="work-title">
    <Reveal><div className="section-heading"><div><span className="eyebrow">01 / SELECTED WORK</span><h2 id="work-title">Less talk.<br /><em>More building.</em></h2></div><p>Four projects. From conversation to action.<br />Explore the product, the code, and what I’m still learning.</p></div></Reveal>
    <Reveal><article className="project project-openmail" id="openmail"><div className="project-intro"><div><span className="project-kicker">01 / AI PRODUCT <span>LIVE</span></span><h3>OpenMail<span>↗</span></h3><p className="project-statement">Your domain.<br />An inbox with an AI teammate.</p></div><div className="project-context"><p>A working space for custom-domain email. Set up addresses, read and send mail, and give AI representatives the knowledge to handle routine questions.</p><div className="tags"><span>Python / FastAPI</span><span>AI representatives</span><span>React</span></div><div className="project-links"><External href="https://freeopenmail.tech/" className="button button-dark">Open the product</External><External href="https://github.com/Piyush70007/openmail-site">View source</External></div></div></div>
      <MailboxPreview /><ProjectDetails><p>I built the email workspace and its AI tools: company knowledge, reply review, practice tests, representatives, rules, and results. The preview below the title runs the real mailbox UI against fictional data.</p><p>Custom domains need verification. Automatic replies follow the configured checks and handover rules; account and provider limits apply.</p></ProjectDetails>
    </article></Reveal>
    <MivvyProject />
    <div className="project-pair"><Reveal><article className="project project-sentry" id="sentryml"><span className="project-kicker">03 / MACHINE LEARNING <span>API LIVE</span></span><h3>SentryML<span>↗</span></h3><p className="project-statement">A prediction is only<br />the beginning.</p><p className="project-description">Customer-churn prediction with logging and drift monitoring. Built to make a model useful beyond the training notebook.</p><ApiPreview /><div className="tags"><span>XGBoost</span><span>FastAPI</span><span>Docker</span></div><div className="project-links"><External href="https://sentryml-risk-engine.onrender.com/docs">Explore the API</External><External href="https://github.com/Piyush70007/sentryml-risk-engine">Source</External></div><ProjectDetails><p>XGBoost serves predictions through FastAPI. SQLite stores prediction logs, while monitoring endpoints compare new inputs against a training-data baseline. The live link opens the real API documentation.</p></ProjectDetails></article></Reveal>
    <Reveal delay={.08}><article className="project project-safeops" id="safeops"><span className="project-kicker">04 / AGENT SAFETY <span>IN DEVELOPMENT</span></span><h3>SafeOps AI<span>↗</span></h3><p className="project-statement">Give agents tools.<br />Keep control.</p><p className="project-description">A learning lab for policy-controlled AI operations. Exploring how useful agents can work inside clear, testable boundaries.</p><SafeOpsDiagram /><div className="tags"><span>Python</span><span>Kubernetes</span><span>Open Policy Agent</span></div><div className="project-links"><External href="https://github.com/Piyush70007/Safeops-ai">Explore the source</External><span className="lab-label">PORTFOLIO LAB</span></div><ProjectDetails><p>JEV routes work, OPA authorizes tool calls, deterministic gates check changes, and Argo Rollouts manages promotion or rollback. This is an in-progress lab, not a deployed autonomous operations service.</p></ProjectDetails></article></Reveal></div>
  </section>;
}
function Education() {
  return <section className="education" id="education" aria-labelledby="education-title"><div className="shell"><Reveal><div className="section-heading"><div><span className="eyebrow">02 / EDUCATION</span><h2 id="education-title">The foundation.<br /><em>The next chapter.</em></h2></div><p>From computer applications in Pune<br />to software engineering in Potsdam.</p></div></Reveal><div className="education-grid">{education.map((item, index) => <Reveal key={item.id} delay={index * .08}><article className={`education-card ${item.id}`}><div className="education-card-top"><span className="eyebrow">{item.level}</span><span className="completed"><Check size={12} />COMPLETED</span></div><a href={item.url} target="_blank" rel="noopener noreferrer" className="university-logo"><img src={item.logo} alt={`${item.university} logo`} loading="lazy" width={item.id === 'ue' ? 340 : 184} height={item.id === 'ue' ? 97 : 95} /></a><h3>{item.degree}</h3><p className="university-name">{item.university}</p><div className="education-meta"><span><MapPin size={13} />{item.location}</span><time dateTime={item.dateTime}>{item.date}</time></div></article></Reveal>)}</div></div></section>;
}
function About() {
  return <section className="about shell" id="about" aria-labelledby="about-title"><Reveal><span className="eyebrow">03 / THE PERSON BEHIND THE PROJECTS</span><div className="about-grid"><h2 id="about-title">Building is<br />how I <em>learn.</em><span className="about-asterisk" aria-hidden="true">✳</span></h2><div className="about-copy"><p className="about-lead">I’m Piyush, an AI developer based in Berlin. I’m interested in the space between a clever model and something people can actually use.</p><p>That curiosity takes me from prediction APIs to intelligent email and safer agent workflows. I like tracing an idea all the way through: how it works, where it breaks, and how to make it clearer.</p><p>My projects are my way of exploring those questions in public.</p><div className="focus-tags"><span>Applied AI</span><span>Machine learning</span><span>LLM systems</span><span>Agent safety</span></div></div></div></Reveal><Reveal><div className="toolbox"><span className="eyebrow">TOOLS I BUILD WITH</span><div>{['Python', 'FastAPI', 'XGBoost', 'React', 'Docker', 'Kubernetes'].map(tool => <span key={tool}>{tool}</span>)}</div></div></Reveal></section>;
}
function Resume() {
  return <section className="resume shell" id="cv" aria-labelledby="cv-title"><Reveal><div className="resume-panel"><div className="resume-document" aria-hidden="true"><FileText size={38} strokeWidth={1.2} /><span>PC / CV</span></div><div className="resume-copy"><span className="eyebrow">04 / THE FULL PICTURE</span><h2 id="cv-title">Take the story with you.</h2><p>For my education, project experience, and skills in one place, request my latest CV.</p></div><a className="button button-light" href={contact.cv || `mailto:${contact.email}?subject=Your%20latest%20CV`} {...(contact.cv ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>{contact.cv ? 'View my CV' : 'Request my CV'}<ArrowUpRight size={17} /></a></div></Reveal></section>;
}
function Footer() {
  return <footer id="contact" className="contact"><div className="shell"><Reveal><div className="contact-top"><span className="eyebrow">HAVE SOMETHING IN MIND?</span><span className="eyebrow">LET’S START A CONVERSATION</span></div><a className="contact-headline" href={`mailto:${contact.email}`}><span>Let’s make<br />it <em>useful.</em></span><MoveUpRight strokeWidth={1} aria-hidden="true" /></a><div className="contact-links"><a href={`mailto:${contact.email}`}>{contact.email}<ArrowUpRight size={18} /></a><div><External href={contact.github}>GitHub</External><External href={contact.linkedin}>LinkedIn</External></div></div></Reveal><div className="footer-bottom"><span>© {new Date().getFullYear()} PIYUSH CHAVAN</span><span>MADE WITH CURIOSITY. BUILT WITH REACT.</span><a href="#top">BACK TO TOP ↑</a></div></div></footer>;
}
export default function App() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: .001 });
  return <><a className="skip-link" href="#main">Skip to content</a><motion.div className="scroll-progress" style={{ scaleX }} /><div id="top" /><Header /><main id="main"><Hero /><Work /><Education /><About /><Resume /></main><Footer /></>;
}
