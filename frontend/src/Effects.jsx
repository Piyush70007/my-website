// Presentation-only motion. Everything here stops when the site's motion
// toggle is off or the visitor prefers reduced motion.
import { useEffect, useRef, useState } from 'react';
import { animate, AnimatePresence, motion, useInView, useMotionValue, useScroll, useSpring, useTransform } from 'motion/react';
import { useSiteMotion } from './MotionSystem.jsx';

const ease = [.2, .8, .2, 1];

// Words rise out of a mask, one after another. Screen readers get the plain sentence.
export function SplitText({ text, accent, delay = 0, step = .055 }) {
  const ref = useRef(null), visible = useInView(ref, { once: true, amount: .4 }), { enabled } = useSiteMotion();
  const shown = visible || !enabled;
  return <><span className="sr-only">{text}</span><span className="fx-split" aria-hidden="true" ref={ref}>{text.split(' ').map((word, index) => {
    const marked = word === accent;
    return <span key={index}><span className={`fx-word ${marked ? 'fx-word-accent' : ''}`}><motion.span initial={enabled ? { y: '115%' } : false} animate={shown ? { y: 0 } : undefined} transition={{ duration: .85, delay: delay + index * step, ease }}>{marked ? <em className={`fx-break ${shown ? 'is-in' : ''}`} data-text={word} style={{ '--crack-delay': `${delay + index * step + .9}s` }}>{word}</em> : word}</motion.span></span>{' '}</span>;
  })}</span></>;
}

export function CountUp({ from = 0, to, duration = 1.5 }) {
  const ref = useRef(null), visible = useInView(ref, { once: true, amount: .8 }), { enabled } = useSiteMotion();
  const [value, setValue] = useState(enabled ? from : to);
  useEffect(() => {
    if (!visible) return;
    if (!enabled) { setValue(to); return; }
    const controls = animate(from, to, { duration, ease, onUpdate: latest => setValue(Math.round(latest)) });
    return () => controls.stop();
  }, [visible, enabled, from, to, duration]);
  return <span ref={ref} className="fx-count">{value}</span>;
}

// A button that leans toward the pointer.
export function Magnetic({ children, strength = .28 }) {
  const { enabled } = useSiteMotion(), x = useMotionValue(0), y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 220, damping: 16, mass: .4 }), sy = useSpring(y, { stiffness: 220, damping: 16, mass: .4 });
  return <motion.span className="fx-magnetic" style={{ x: sx, y: sy }} onPointerMove={event => {
    if (!enabled || event.pointerType !== 'mouse') return;
    const box = event.currentTarget.getBoundingClientRect();
    x.set((event.clientX - box.left - box.width / 2) * strength); y.set((event.clientY - box.top - box.height / 2) * strength);
  }} onPointerLeave={() => { x.set(0); y.set(0); }}>{children}</motion.span>;
}

// Pointer-following light on a card: <article className="fx-spot" onPointerMove={spot}>
export function spot(event) {
  const box = event.currentTarget.getBoundingClientRect();
  event.currentTarget.style.setProperty('--mx', `${event.clientX - box.left}px`);
  event.currentTarget.style.setProperty('--my', `${event.clientY - box.top}px`);
}

// The project stage grows into place as it scrolls into view.
export function StageReveal({ children }) {
  const ref = useRef(null), { enabled } = useSiteMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 1', 'start 0.42'] });
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 28, mass: .3 });
  const scale = useTransform(progress, [0, 1], [.88, 1]), y = useTransform(progress, [0, 1], [80, 0]), opacity = useTransform(progress, [0, .5], [.35, 1]);
  return <motion.div ref={ref} className="fx-stage" style={enabled ? { scale, y, opacity } : undefined}>{children}</motion.div>;
}

export function Parallax({ children, distance = 70, className = '' }) {
  const { enabled } = useSiteMotion(), { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 900], [0, distance]);
  return <motion.div className={className} style={enabled ? { y } : undefined}>{children}</motion.div>;
}

export function Rise({ children, delay = 0, className = '' }) {
  const { enabled } = useSiteMotion();
  return <motion.div className={className} initial={enabled ? { opacity: 0, y: 26 } : false} animate={{ opacity: 1, y: 0 }} transition={{ duration: .8, delay, ease }}>{children}</motion.div>;
}

export function Marquee({ items }) {
  return <div className="fx-marquee" aria-hidden="true"><div className="fx-marquee-track">{[0, 1].map(copy => <div key={copy}>{items.map(item => <span key={item}>{item}<i /></span>)}</div>)}</div></div>;
}

// A rule that draws itself from left to right.
export function DrawRule({ className = '' }) {
  const ref = useRef(null), visible = useInView(ref, { once: true, amount: 1 }), { enabled } = useSiteMotion();
  return <motion.div ref={ref} className={`fx-rule ${className}`} initial={enabled ? { scaleX: 0 } : false} animate={visible || !enabled ? { scaleX: 1 } : undefined} transition={{ duration: 1.1, ease }} />;
}

// A short curtain on first load.
export const introSeconds = 1.25;
export function Intro() {
  const { enabled } = useSiteMotion(), [open, setOpen] = useState(true);
  useEffect(() => { const timer = setTimeout(() => setOpen(false), 950); return () => clearTimeout(timer); }, []);
  if (!enabled) return null;
  return <AnimatePresence>{open && <motion.div className="fx-intro" aria-hidden="true" exit={{ y: '-100%' }} transition={{ duration: .75, ease: [.76, 0, .24, 1] }}>
    <motion.span initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .45, ease }}><i />Piyush Chavan</motion.span>
    <motion.b initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: .85, ease }} />
  </motion.div>}</AnimatePresence>;
}

// Page progress drawn as a crack down the left edge (shown by the ember theme).
const faultPath = 'M17 0 L11 46 L23 83 L9 142 L21 188 L14 236 L27 291 L10 352 L19 398 L6 455 L24 512 L13 561 L22 618 L8 672 L26 731 L12 790 L20 842 L7 901 L23 950 L15 1000';
export function FaultLine() {
  const { scrollYProgress } = useScroll(), progress = useSpring(scrollYProgress, { stiffness: 120, damping: 28, mass: .2 });
  return <svg className="fx-fault" viewBox="0 0 34 1000" preserveAspectRatio="none" aria-hidden="true"><path className="fx-fault-base" d={faultPath} /><motion.path className="fx-fault-live" d={faultPath} style={{ pathLength: progress }} /></svg>;
}

// Publishes the pointer position as --px / --py for the dot field.
export function usePointerField() {
  const { enabled } = useSiteMotion();
  useEffect(() => {
    if (!enabled) return;
    let frame = 0;
    const move = event => { cancelAnimationFrame(frame); frame = requestAnimationFrame(() => { const root = document.documentElement.style; root.setProperty('--px', `${event.clientX}px`); root.setProperty('--py', `${event.clientY}px`); }); };
    window.addEventListener('pointermove', move, { passive: true });
    return () => { window.removeEventListener('pointermove', move); cancelAnimationFrame(frame); };
  }, [enabled]);
}
