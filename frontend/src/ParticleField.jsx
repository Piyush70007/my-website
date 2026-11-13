import { useEffect, useRef, useState } from 'react';
import { Pause, Play, Shuffle } from 'lucide-react';
import { useActiveScene, useSiteMotion } from './MotionSystem.jsx';

export default function ParticleField() {
  const canvasRef = useRef(null);
  const stageRef = useRef(null);
  const controls = useRef({ paused: false, shape: 0, refresh: () => {} });
  const { enabled } = useSiteMotion(), active = useActiveScene(stageRef);
  const [paused, setPaused] = useState(false);
  const [shape, setShape] = useState(0);
  useEffect(() => { controls.current.paused = paused || !enabled; controls.current.shape = shape; controls.current.refresh(); }, [paused, shape, enabled]);
  useEffect(() => { if (paused || !active) return; const timer = setInterval(() => setShape(value => value ? 0 : 1), 6400); return () => clearInterval(timer); }, [paused, active]);

  useEffect(() => {
    const canvas = canvasRef.current, stage = stageRef.current, ctx = canvas.getContext('2d');
    if (!ctx) return;
    let width = 0, height = 0, frame = 0, angle = .3, mode = 0, visible = true, last = 0;
    let pointerX = 0, pointerY = 0, smoothX = 0, smoothY = 0;
    const points = [];
    for (let u = 0; u < 112; u++) for (let v = 0; v < 36; v++) points.push([u / 112 * Math.PI * 2, v / 36 * Math.PI * 2]);
    function paint() {
      ctx.clearRect(0, 0, width, height);
      const scale = Math.min(width, height) * .30, rendered = [];
      const rx = .57 + smoothY * .75, ry = angle + smoothX * .95, rz = -.52;
      const sx = Math.sin(rx), cx = Math.cos(rx), sy = Math.sin(ry), cy = Math.cos(ry), sz = Math.sin(rz), cz = Math.cos(rz);
      for (const [u, v] of points) {
        const r = .48 + .07 * Math.sin(u * 3 + v * 2);
        let x = (1 + r * Math.cos(v)) * Math.cos(u), y = (1 + r * Math.cos(v)) * Math.sin(u), z = r * Math.sin(v);
        x += (1.32 * Math.sin(v / 2) * Math.cos(u) - x) * mode;
        y += (1.32 * Math.sin(v / 2) * Math.sin(u) - y) * mode;
        z += (1.32 * Math.cos(v / 2) - z) * mode;
        const y1 = y * cx - z * sx, z1 = y * sx + z * cx, x2 = x * cy + z1 * sy, z2 = -x * sy + z1 * cy;
        const perspective = 4.7 / (4.7 + z2), front = 1 - (z2 + 1.6) / 3.2;
        rendered.push([width * .5 + (x2 * cz - y1 * sz) * scale * perspective, height * .49 + (x2 * sz + y1 * cz) * scale * perspective, z2, front, perspective]);
      }
      rendered.sort((a, b) => b[2] - a[2]);
      for (const [x, y, , front, perspective] of rendered) {
        ctx.fillStyle = `rgba(${Math.round(52 + front * 80)},${Math.round(93 + front * 95)},255,${.15 + front * .78})`;
        ctx.beginPath(); ctx.arc(x, y, (.65 + front * .7) * perspective, 0, Math.PI * 2); ctx.fill();
      }
    }
    function resize() { const rect = stage.getBoundingClientRect(); width = rect.width; height = rect.height; const dpr = Math.min(devicePixelRatio || 1, 2); canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); paint(); }
    function tick(time) { frame = 0; if (!visible || document.hidden || controls.current.paused) return; if (time - last > 30) { angle += .014; mode += (controls.current.shape - mode) * .045; smoothX += (pointerX - smoothX) * .1; smoothY += (pointerY - smoothY) * .1; paint(); last = time; } frame = requestAnimationFrame(tick); }
    function refresh() { cancelAnimationFrame(frame); frame = 0; if (controls.current.paused) { mode = controls.current.shape; paint(); } else if (visible && !document.hidden) frame = requestAnimationFrame(tick); }
    function pointer(event) { const rect = stage.getBoundingClientRect(); pointerX = (event.clientX - rect.left) / rect.width - .5; pointerY = (event.clientY - rect.top) / rect.height - .5; }
    function leave() { pointerX = pointerY = 0; }
    const resizeObserver = new ResizeObserver(resize); resizeObserver.observe(stage);
    const intersection = new IntersectionObserver(entries => { visible = entries[0].isIntersecting; refresh(); }); intersection.observe(stage);
    stage.addEventListener('pointermove', pointer); stage.addEventListener('pointerleave', leave); document.addEventListener('visibilitychange', refresh);
    controls.current.refresh = refresh; resize(); refresh();
    return () => { cancelAnimationFrame(frame); resizeObserver.disconnect(); intersection.disconnect(); stage.removeEventListener('pointermove', pointer); stage.removeEventListener('pointerleave', leave); document.removeEventListener('visibilitychange', refresh); controls.current.refresh = () => {}; };
  }, []);

  return <div className="field-wrap" data-running={active && !paused}><div className="field" ref={stageRef}><div className="orbit-ring ring-one" aria-hidden="true"><i /></div><div className="orbit-ring ring-two" aria-hidden="true"><i /></div><canvas ref={canvasRef} aria-hidden="true" /><span className="field-cross cross-one">+</span><span className="field-cross cross-two">+</span><span className="field-caption">MOVE YOUR CURSOR · WATCH IT CHANGE</span></div>
    <div className="field-controls"><span>{shape ? '02 / SPHERE' : '01 / ORBIT'}</span><div><button onClick={() => setShape(value => value ? 0 : 1)}><Shuffle size={13} />Change form</button><button onClick={() => setPaused(value => !value)} aria-label={paused ? 'Play animation' : 'Pause animation'} aria-pressed={paused}>{paused ? <Play size={13} /> : <Pause size={13} />}</button></div></div>
  </div>;
}
