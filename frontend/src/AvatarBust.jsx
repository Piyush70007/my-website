import { useEffect, useRef, useState } from 'react';
import * as T from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { Pause, Play, RotateCcw } from 'lucide-react';
import { avatarAsset } from './avatarAsset.js';
import { useActiveScene, useSiteMotion } from './MotionSystem.jsx';
import './avatar.css';

function disposeModel(model) {
  const textures = new Set();
  model.traverse(object => {
    object.geometry?.dispose();
    const materials = object.material ? (Array.isArray(object.material) ? object.material : [object.material]) : [];
    materials.forEach(material => {
      Object.values(material).forEach(value => { if (value?.isTexture) textures.add(value); });
      material.dispose();
    });
  });
  textures.forEach(texture => texture.dispose());
}

export default function AvatarBust() {
  const mount = useRef(null), api = useRef(null), runningRef = useRef(false);
  const { enabled } = useSiteMotion(), active = useActiveScene(mount);
  const [paused, setPaused] = useState(false), [status, setStatus] = useState(avatarAsset.model ? 'loading' : 'unavailable');
  const running = active && !paused;
  runningRef.current = running;
  useEffect(() => { api.current?.setRunning(running); }, [running]);

  useEffect(() => {
    if (!avatarAsset.model) return;
    const host = mount.current;
    let renderer;
    try { renderer = new T.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' }); }
    catch { setStatus('failed'); return; }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.7));
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = T.SRGBColorSpace;
    renderer.toneMapping = T.NeutralToneMapping;
    renderer.toneMappingExposure = 1;
    renderer.domElement.setAttribute('aria-label', 'Rotatable 3D bust of Piyush');
    renderer.domElement.setAttribute('role', 'img');
    host.append(renderer.domElement);
    const scene = new T.Scene(), root = new T.Group();
    const room = new RoomEnvironment(), pmrem = new T.PMREMGenerator(renderer);
    const environment = pmrem.fromScene(room, .04);
    scene.environment = environment.texture; scene.environmentIntensity = .5;
    room.dispose(); pmrem.dispose();
    scene.add(root);
    const camera = new T.OrthographicCamera(-3, 3, 2.35, -2.35, .1, 40);
    camera.position.set(0, .15, 9);
    camera.lookAt(0, 0, 0);
    scene.add(new T.HemisphereLight('#fff8f0', '#7b7170', 1.1));
    const key = new T.DirectionalLight('#fff3e5', 1.4); key.position.set(-3, 5, 5); scene.add(key);
    const fill = new T.DirectionalLight('#edf1ff', .8); fill.position.set(4, 1, 2); scene.add(fill);
    const rim = new T.DirectionalLight('#c3d0ed', 1.4); rim.position.set(-1, 3, -4); scene.add(rim);
    let disposed = false, ready = false, live = runningRef.current, visible = true;
    let frame = 0, dragging = false, lastX = 0, spin = 0, targetTilt = 0, tilt = 0, last = 0;
    function draw() {
      if (disposed) return;
      root.rotation.set(tilt * .06, spin, 0);
      renderer.render(scene, camera);
      host.dataset.rotation = String(Math.round(T.MathUtils.radToDeg(spin) % 360));
    }
    function resize() {
      const { width, height } = host.getBoundingClientRect();
      if (!width || !height) return;
      renderer.setSize(width, height, false);
      const aspect = width / height;
      // Fit shoulders as well as height on narrow screens.
      const halfHeight = Math.max(2.35, 2.15 / aspect);
      camera.left = -halfHeight * aspect; camera.right = halfHeight * aspect;
      camera.top = halfHeight; camera.bottom = -halfHeight;
      camera.updateProjectionMatrix(); draw();
    }
    function tick(now) {
      frame = 0;
      if (disposed || !ready || !live || !visible || document.hidden) return;
      const dt = Math.min((now - last) / 1000, .05); last = now;
      if (!dragging) spin += dt * Math.PI * 2 / 36;
      tilt += (targetTilt - tilt) * .05;
      draw(); frame = requestAnimationFrame(tick);
    }
    function start() {
      cancelAnimationFrame(frame); frame = 0;
      if (!disposed && ready && live && visible && !document.hidden) {
        last = performance.now(); frame = requestAnimationFrame(tick);
      } else draw();
    }
    api.current = {
      setRunning(value) { live = value; start(); },
      front() { spin = 0; tilt = 0; targetTilt = 0; draw(); },
    };
    new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).load(avatarAsset.model, gltf => {
      if (disposed) { disposeModel(gltf.scene); return; }
      const model = gltf.scene;
      model.traverse(object => {
        if (!object.isMesh) return;
        const materials = Array.isArray(object.material) ? object.material : [object.material];
        materials.forEach(material => {
          // Skin and fabric are nonmetallic; soften generated micro-bump detail.
          material.metalness = 0; material.roughness = .85;
          material.normalScale?.setScalar(.5);
        });
      });
      model.updateMatrixWorld(true);
      const box = new T.Box3().setFromObject(model), size = box.getSize(new T.Vector3());
      const center = box.getCenter(new T.Vector3());
      const scale = Math.min(4.1 / size.y, 4.15 / size.x);
      if (!Number.isFinite(scale) || scale <= 0) { disposeModel(model); setStatus('failed'); return; }
      model.scale.multiplyScalar(scale);
      model.position.sub(center.multiplyScalar(scale));
      root.add(model); ready = true; host.dataset.loaded = 'true';
      setStatus('ready'); resize(); start();
    }, undefined, () => { if (!disposed) setStatus('failed'); });
    const observer = new ResizeObserver(resize); observer.observe(host);
    const view = new IntersectionObserver(entries => { visible = entries[0].isIntersecting; start(); }); view.observe(host);
    const down = e => { if (!ready || e.button !== 0) return; dragging = true; lastX = e.clientX; host.setPointerCapture(e.pointerId); };
    const move = e => {
      const rect = host.getBoundingClientRect(); targetTilt = (e.clientY - rect.top) / rect.height - .5;
      if (dragging) { spin += (e.clientX - lastX) * .012; lastX = e.clientX; draw(); }
    };
    const up = () => { dragging = false; };
    const keyboard = e => {
      if (ready && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
        e.preventDefault(); spin += e.key === 'ArrowLeft' ? -.2 : .2; draw();
      }
    };
    const lost = e => { e.preventDefault(); cancelAnimationFrame(frame); ready = false; setStatus('failed'); };
    host.addEventListener('pointerdown', down); host.addEventListener('pointermove', move);
    host.addEventListener('pointerup', up); host.addEventListener('pointercancel', up); host.addEventListener('keydown', keyboard);
    document.addEventListener('visibilitychange', start); renderer.domElement.addEventListener('webglcontextlost', lost);
    resize();
    return () => {
      disposed = true; cancelAnimationFrame(frame); observer.disconnect(); view.disconnect();
      host.removeEventListener('pointerdown', down); host.removeEventListener('pointermove', move);
      host.removeEventListener('pointerup', up); host.removeEventListener('pointercancel', up); host.removeEventListener('keydown', keyboard);
      document.removeEventListener('visibilitychange', start); renderer.domElement.removeEventListener('webglcontextlost', lost);
      disposeModel(root); environment.dispose(); renderer.dispose(); renderer.domElement.remove(); api.current = null;
    };
  }, []);

  const ready = status === 'ready';
  return <div className="avatar-wrap">
    <div className={`avatar-stage ${ready ? 'is-ready' : 'is-pending'}`} ref={mount} tabIndex={ready ? 0 : undefined}
      aria-label={ready ? 'Drag to rotate Piyush’s 3D bust, or use left and right arrow keys' : '3D portrait'}>
      {status === 'loading' && <span className="avatar-status" role="status">Loading 3D portrait…</span>}
      {(status === 'failed' || status === 'unavailable') && <span className="avatar-status" role="status">3D portrait unavailable on this device</span>}
    </div>
    <div className="avatar-controls"><span>PIYUSH / {ready ? '3D PORTRAIT' : 'PORTRAIT'}</span>
      {ready && <div><button onClick={() => api.current?.front()} aria-label="Show avatar front"><RotateCcw size={13} /><span>Front</span></button>
        <button onClick={() => setPaused(value => !value)} disabled={!enabled} aria-pressed={paused} aria-label={paused ? 'Rotate avatar automatically' : 'Pause avatar rotation'}>{paused ? <Play size={13} /> : <Pause size={13} />}</button></div>}
    </div>
    <p className="avatar-hint">{ready ? 'DRAG TO EXPLORE · 360°' : status === 'loading' ? 'PREPARING 3D VIEW' : '3D VIEW UNAVAILABLE'}</p>
  </div>;
}
