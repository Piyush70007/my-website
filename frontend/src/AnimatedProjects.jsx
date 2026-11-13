import { useRef, useState } from 'react';
import { Check, Pause, Play, RotateCcw, ShieldCheck, Sparkles, Terminal, X } from 'lucide-react';
import { TiltFrame, useActiveScene, useSceneCycle } from './MotionSystem.jsx';

const apiDurations = [1800, 2200, 4200, 2200];
const apiPhases = ['Validate input', 'Run XGBoost', 'Return prediction', 'Log & monitor'];
const responseLines = ['{', '  "customerid": "c12345",', '  "churn_probability": 0.37,', '  "churn_prediction": 0,', '  "model_version": "xgb_v4",', '  "threshold": 0.5', '}'];

export function ApiPreview() {
  const ref = useRef(null), tabs = useRef([]);
  const [tab, setTab] = useState(0), [playing, setPlaying] = useState(true);
  const active = useActiveScene(ref);
  const running = active && playing;
  const [phase, setPhase] = useSceneCycle(apiDurations, running);
  const choose = index => { setTab(index); tabs.current[index].focus(); };
  return <TiltFrame><div ref={ref} className="api-preview animated-api" data-running={running} data-phase={phase}>
    <div className="api-chrome"><span><i /><i /><i /></span><span>sentryml / predict</span><Terminal size={14} /></div>
    <div className="api-tabs" role="tablist" aria-label="SentryML preview">{['Example response', 'How it works'].map((name, index) => <button role="tab" id={`api-tab-${index}`} aria-controls={`api-panel-${index}`} aria-selected={tab === index} tabIndex={tab === index ? 0 : -1} ref={element => tabs.current[index] = element} key={name} onClick={() => setTab(index)} onKeyDown={event => { if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) { event.preventDefault(); choose(event.key === 'Home' ? 0 : event.key === 'End' ? 1 : 1 - index); } }}>{name}</button>)}</div>
    <div className="api-sequence" aria-label="Illustrated prediction flow">{apiPhases.map((name, index) => <span key={name} className={phase === index ? 'is-current' : phase > index ? 'is-complete' : ''}><i>{phase > index ? '✓' : index + 1}</i><span>{name}</span></span>)}<div className="api-traveler" style={{ '--phase': phase }} aria-hidden="true" /></div>
    {tab === 0 ? <div id="api-panel-0" role="tabpanel" aria-labelledby="api-tab-0" tabIndex={0}>
      <div className="api-endpoint"><b>POST</b><span>/predict</span><span className="api-success">{phase < 2 ? 'EXAMPLE RUN' : '200 OK'}</span></div>
      <div className="prediction-stage"><div className="prediction-scan" aria-hidden="true" /><pre className={`response-code ${phase >= 2 ? 'is-returned' : ''}`} key={phase >= 2 ? 'response' : 'waiting'}><code>{responseLines.map((line, index) => <span className="response-line" key={index} style={{ '--line-delay': `${index * .11}s` }}>{line}</span>)}</code></pre>
      {phase < 2 && <div className="prediction-processing" aria-hidden="true"><span className="processing-ring" /><b>{phase === 0 ? 'Checking the input' : 'Finding the signal'}</b><span>{phase === 0 ? 'Validated features → model' : 'XGBoost → churn probability'}</span></div>}</div>
      <p className="api-note">Animated example from the documentation. No live API request.</p>
    </div> : <div id="api-panel-1" role="tabpanel" aria-labelledby="api-tab-1" tabIndex={0} className="api-flow">{[['01', 'Customer features', 'Validated input arrives at the API.'], ['02', 'XGBoost model', 'The model estimates churn probability.'], ['03', 'Prediction + record', 'Return a result, log it, monitor drift.']].map(([n, title, body], i) => <div key={n} className={Math.min(phase, 2) === i ? 'is-current' : ''}><span>{n}</span><div><b>{title}</b><p>{body}</p></div></div>)}</div>}
    <div className="animation-console"><span><i />{apiPhases[phase]}</span><div><button onClick={() => { setPhase(0); setPlaying(true); }} aria-label="Replay SentryML example"><RotateCcw size={13} /></button><button onClick={() => setPlaying(value => !value)} aria-label={playing ? 'Pause SentryML example' : 'Play SentryML example'} aria-pressed={!playing}>{playing ? <Pause size={13} /> : <Play size={13} />}</button></div></div>
  </div></TiltFrame>;
}

const allowedDurations = [1700, 1900, 1900, 3500];
const blockedDurations = [1700, 1900, 4000];

export function SafeOpsDiagram() {
  const ref = useRef(null), [blocked, setBlocked] = useState(false), [playing, setPlaying] = useState(true);
  const active = useActiveScene(ref), running = active && playing;
  const [phase, setPhase] = useSceneCycle(blocked ? blockedDurations : allowedDurations, running);
  const stopped = blocked && phase === 2;
  const labels = blocked ? ['Agent proposes', 'Policy inspects', 'Action blocked'] : ['Agent proposes', 'Policy authorizes', 'Checks verify', 'Ready for rollout'];
  return <TiltFrame><div className="safeops-diagram animated-safeops" ref={ref} data-running={running} data-phase={phase} data-blocked={blocked}>
    <div className="diagram-caption"><span>THE AGENT IS NEVER THE AUTHORITY.</span><ShieldCheck size={18} /></div>
    <div className="scenario-toggle" aria-label="SafeOps illustrated scenarios"><button aria-pressed={!blocked} onClick={() => { setBlocked(false); setPhase(0); }}>Allowed action</button><button aria-pressed={blocked} onClick={() => { setBlocked(true); setPhase(0); }}>Blocked action</button></div>
    <div className={`flow-step ${phase === 0 ? 'is-current' : ''}`}><span className="flow-icon"><Sparkles size={20} /></span><div><b>Agent proposes</b><small>{blocked ? 'Request exceeds permitted scope' : 'Investigate · suggest a change'}</small></div><span className="step-id">01</span></div><div className={`flow-connector ${phase === 0 ? 'is-traveling' : ''}`} />
    <div className={`flow-step policy-step ${phase === 1 ? 'is-current' : ''} ${stopped ? 'is-blocked' : ''}`}><span className="flow-icon">{stopped ? <X size={20} /> : <ShieldCheck size={20} />}</span><div><b>{stopped ? 'Policy blocks the action' : 'Policy decides'}</b><small>{stopped ? 'Tool call denied · no change applied' : 'Authorize each tool call'}</small></div><span className="policy-tag">OPA</span></div><div className={`flow-connector ${phase === 1 && !blocked ? 'is-traveling' : ''}`} />
    <div className={`flow-step ${phase === 2 && !blocked ? 'is-current' : ''} ${blocked ? 'is-inactive' : ''}`}><span className="flow-icon"><Check size={20} /></span><div><b>Checks verify</b><small>Deterministic gates before rollout</small></div><span className="step-id">03</span></div>
    <div className={`flow-outcomes ${phase === 3 ? 'is-current' : ''} ${stopped ? 'is-blocked' : ''}`}><span><i />{stopped ? 'Stopped at the policy boundary' : phase === 3 ? 'Ready for controlled rollout' : 'Waiting for the checks'}</span>{phase === 3 && <Check size={15} />}</div>
    <p>Animated architecture example · project in development</p>
    <div className="animation-console"><span><i />{labels[phase]}</span><div><button onClick={() => { setPhase(0); setPlaying(true); }} aria-label="Replay SafeOps example"><RotateCcw size={13} /></button><button onClick={() => setPlaying(value => !value)} aria-label={playing ? 'Pause SafeOps example' : 'Play SafeOps example'} aria-pressed={!playing}>{playing ? <Pause size={13} /> : <Play size={13} />}</button></div></div>
  </div></TiltFrame>;
}
