import type { Frame, Pt } from './types';
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
export const dist = (a: Pt, b: Pt) => Math.hypot(a.x - b.x, a.y - b.y);
export const mid = (a: Pt, b: Pt): Pt => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2, v: Math.min(a.v, b.v) });

/** Ángulo en grados en el vértice b (a-b-c). */
export function angle(a: Pt, b: Pt, c: Pt): number {
  const v1x = a.x - b.x, v1y = a.y - b.y, v2x = c.x - b.x, v2y = c.y - b.y;
  const m = Math.hypot(v1x, v1y) * Math.hypot(v2x, v2y);
  if (!m) return NaN;
  return (Math.acos(clamp((v1x * v2x + v1y * v2y) / m, -1, 1)) * 180) / Math.PI;
}

/** Velocidad (unidades/seg) de un landmark por diferencias centrales + suavizado de 3 taps. */
export function speedSeries(frames: Frame[], i: number): number[] {
  const n = frames.length;
  const raw = frames.map((_, k) => {
    const a = frames[Math.max(0, k - 1)], b = frames[Math.min(n - 1, k + 1)];
    const dt = (b.t - a.t) / 1000;
    return dt > 0 ? dist(a.lm[i], b.lm[i]) / dt : 0;
  });
  return raw.map((_, k) => (raw[Math.max(0, k - 1)] + raw[k] + raw[Math.min(n - 1, k + 1)]) / 3);
}

export const argmax = (xs: number[], from = 0, to = xs.length - 1) => {
  let best = from;
  for (let k = from; k <= to; k++) if (xs[k] > xs[best]) best = k;
  return best;
};
export const median = (xs: number[]) => {
  const s = [...xs].filter(Number.isFinite).sort((a, b) => a - b);
  return s.length ? s[Math.floor(s.length / 2)] : NaN;
};
