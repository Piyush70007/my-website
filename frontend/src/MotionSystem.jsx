import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { motion, MotionConfig, useInView, useMotionValue, useReducedMotion, useSpring } from 'motion/react';
import { Pause, Play } from 'lucide-react';

const MotionContext = createContext({ enabled: true });
export const useSiteMotion = () => useContext(MotionContext);

export function MotionProvider({ children }) {
  const reduced = useReducedMotion();
  const [paused, setPaused] = useState(false);
  const enabled = !paused && !reduced;
  useEffect(() => {
    document.documentElement.dataset.motion = enabled ? 'on' : 'off';
    return () => { delete document.documentElement.dataset.motion; };
  }, [enabled]);
  return <MotionContext.Provider value={{ enabled }}>
    <MotionConfig reducedMotion={enabled ? 'user' : 'always'}>{children}</MotionConfig>
    <button className="site-motion-toggle" aria-label={reduced ? 'Reduced motion is enabled in your system settings' : enabled ? 'Pause all animations' : 'Play all animations'} aria-pressed={!enabled} disabled={Boolean(reduced)} onClick={() => setPaused(value => !value)}>
      {enabled ? <Pause size={13} /> : <Play size={13} />}<span>{reduced ? 'Reduced motion' : enabled ? 'Motion on' : 'Motion paused'}</span><i />
    </button>
  </MotionContext.Provider>;
}

export function useActiveScene(ref, amount = .15) {
  const { enabled } = useSiteMotion();
  const visible = useInView(ref, { amount });
  const [pageVisible, setPageVisible] = useState(!document.hidden);
  useEffect(() => { const update = () => setPageVisible(!document.hidden); document.addEventListener('visibilitychange', update); return () => document.removeEventListener('visibilitychange', update); }, []);
  return enabled && visible && pageVisible;
}

export function useSceneCycle(durations, running) {
  const [step, setStep] = useState(0);
  useEffect(() => {
    if (!running) return;
    const timer = setTimeout(() => setStep(value => (value + 1) % durations.length), durations[step]);
    return () => clearTimeout(timer);
  }, [durations, running, step]);
  return [step, setStep];
}

export function Reveal({ children, className = '', delay = 0 }) {
  const ref = useRef(null), visible = useInView(ref, { amount: .06, margin: '0px 0px -35px 0px' });
  const { enabled } = useSiteMotion();
  return <div ref={ref} className={`scroll-reveal ${visible || !enabled ? 'is-visible' : ''} ${className}`} style={{ '--reveal-delay': `${delay}s` }}>{children}</div>;
}

export function TiltFrame({ children, className = '' }) {
  const { enabled } = useSiteMotion();
  const x = useMotionValue(0), y = useMotionValue(0);
  const rotateX = useSpring(x, { stiffness: 160, damping: 22 });
  const rotateY = useSpring(y, { stiffness: 160, damping: 22 });
  useEffect(() => { if (!enabled) { x.set(0); y.set(0); } }, [enabled, x, y]);
  return <motion.div className={`motion-tilt ${className}`} style={{ rotateX, rotateY, transformPerspective: 1400 }} onPointerMove={event => {
    if (!enabled || event.pointerType !== 'mouse') return;
    const rect = event.currentTarget.getBoundingClientRect();
    x.set((.5 - (event.clientY - rect.top) / rect.height) * 7);
    y.set(((event.clientX - rect.left) / rect.width - .5) * 7);
  }} onPointerLeave={() => { x.set(0); y.set(0); }}>{children}</motion.div>;
}
