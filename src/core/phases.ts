import { LM, pick } from './landmarks';
import { argmax, speedSeries } from './geometry';
import type { Frame, PhaseMarks, Side } from './types';

/** Detecta dip / set point / release en una toma (asume un tiro por clip). */
export function detectPhases(frames: Frame[], side: Side): PhaseMarks {
  const n = frames.length;
  const p = pick(side);
  const wy = frames.map((f) => f.lm[p.wr].y);
  const wSpeed = speedSeries(frames, p.wr);
  // muñeca más alta = tope del follow-through; release = pico de velocidad justo antes.
  let top = 0;
  for (let k = 1; k < n; k++) if (wy[k] < wy[top]) top = k;
  const winStart = Math.max(0, top - Math.round(n * 0.25));
  const release = argmax(wSpeed, winStart, top);
  // dip = cadera más baja antes del release
  const hipY = frames.map((f) => (f.lm[LM.hipL].y + f.lm[LM.hipR].y) / 2);
  const dip = argmax(hipY, 0, release);
  // set point = primera vez que la muñeca pasa por encima del hombro tras el dip
  let setpoint = Math.round((dip + release) / 2);
  for (let k = dip; k <= release; k++) if (frames[k].lm[p.wr].y < frames[k].lm[p.sh].y) { setpoint = k; break; }
  return { dip, setpoint: Math.min(setpoint, release), release };
}

/** Lado de tiro: la muñeca que más sube por encima del hombro. */
export function detectSide(frames: Frame[]): Side {
  let l = -Infinity, r = -Infinity;
  for (const f of frames) {
    l = Math.max(l, f.lm[LM.shL].y - f.lm[LM.wrL].y);
    r = Math.max(r, f.lm[LM.shR].y - f.lm[LM.wrR].y);
  }
  return r >= l ? 'right' : 'left';
}
