import { LM, pick } from './landmarks';
import { angle, dist, median, mid, speedSeries } from './geometry';
import { statusFor } from './thresholds';
import type { Frame, Metric, Take } from './types';

const torso = (f: Frame) => dist(mid(f.lm[LM.shL], f.lm[LM.shR]), mid(f.lm[LM.hipL], f.lm[LM.hipR]));

/** Flexión de rodillas: ángulo mínimo cadera-rodilla-tobillo hasta el release (plano lateral). */
export function kneeDip(t: Take): Metric | null {
  const p = pick(t.side);
  let best = Infinity, idx = -1;
  for (let k = 0; k <= t.phases.release; k++) {
    const f = t.frames[k];
    const a = angle(f.lm[p.hip], f.lm[p.kn], f.lm[p.an]);
    if (Number.isFinite(a) && a < best) { best = a; idx = k; }
  }
  if (idx < 0) return null;
  return { key: 'kneeDip', view: 'lateral', phase: 'dip', value: best, unit: 'deg', status: statusFor('kneeDip', best), frameIdx: idx };
}

/** Codo abierto: desvío horizontal codo-muñeca hacia afuera, normalizado por ancho de hombros (plano frontal). */
export function elbowFlare(t: Take): Metric | null {
  const p = pick(t.side), k = t.phases.release;
  let best = -Infinity, idx = k;
  for (let j = Math.max(0, k - 2); j <= Math.min(t.frames.length - 1, k + 2); j++) {
    const f = t.frames[j];
    const sw = dist(f.lm[LM.shL], f.lm[LM.shR]);
    if (!sw) continue;
    const out = Math.sign(f.lm[p.sh].x - f.lm[p.shO].x) || 1;
    const v = (out * (f.lm[p.el].x - f.lm[p.wr].x)) / sw;
    if (v > best) { best = v; idx = j; }
  }
  if (!Number.isFinite(best)) return null;
  const v = Math.max(0, best);
  return { key: 'elbowFlare', view: 'frontal', phase: 'release', value: v, unit: 'ratio', status: statusFor('elbowFlare', v), frameIdx: idx };
}

/** Elevación de hombros: cuánto se acorta oreja-hombro en el set point vs. postura inicial (plano frontal). */
export function shoulderElevation(t: Take): Metric | null {
  const p = pick(t.side);
  const ratio = (f: Frame) => dist(f.lm[p.ear], f.lm[p.sh]) / torso(f);
  const nBase = Math.max(3, Math.round(t.frames.length * 0.1));
  const base = median(t.frames.slice(0, nBase).map(ratio));
  const at = ratio(t.frames[t.phases.setpoint]);
  if (!Number.isFinite(base) || !Number.isFinite(at) || !base) return null;
  const v = Math.max(0, (base - at) / base);
  return { key: 'shoulderElevation', view: 'frontal', phase: 'setpoint', value: v, unit: 'ratio', status: statusFor('shoulderElevation', v), frameIdx: t.phases.setpoint };
}

/** Cadena cinemática: orden de los picos de velocidad cadera→hombro→codo→muñeca (plano lateral). */
export function kineticChain(t: Take): Metric | null {
  const p = pick(t.side);
  const from = t.phases.dip, to = Math.min(t.frames.length - 1, t.phases.release + 3);
  if (to - from < 3) return null;
  const peak = (i: number) => {
    const s = speedSeries(t.frames, i);
    let b = from;
    for (let k = from; k <= to; k++) if (s[k] > s[b]) b = k;
    return b;
  };
  const order = [peak(p.hip), peak(p.sh), peak(p.el), peak(p.wr)];
  let inversions = 0;
  for (let i = 1; i < order.length; i++) if (order[i] < order[i - 1] - 1) inversions++; // tolerancia de 1 frame
  return { key: 'kineticChain', view: 'lateral', phase: 'release', value: inversions, unit: 'count', status: statusFor('kineticChain', inversions), frameIdx: order[3] };
}

export function computeMetrics(frontal?: Take, lateral?: Take): Metric[] {
  const out: (Metric | null)[] = [];
  if (lateral) out.push(kneeDip(lateral), kineticChain(lateral));
  if (frontal) out.push(elbowFlare(frontal), shoulderElevation(frontal));
  return out.filter((m): m is Metric => !!m);
}
