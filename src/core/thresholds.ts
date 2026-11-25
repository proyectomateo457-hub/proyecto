import type { MetricKey, Status } from './types';
/** Valores iniciales HEURÍSTICOS: calibrar con tiros etiquetados por el entrenador. */
export const THRESHOLDS: Record<MetricKey, { ok: number; warn: number }> = {
  kneeDip: { ok: 130, warn: 145 },          // ° mínimo de cadera-rodilla-tobillo (menor = más flexión)
  elbowFlare: { ok: 0.25, warn: 0.45 },     // desvío codo-muñeca / ancho de hombros en el release
  shoulderElevation: { ok: 0.10, warn: 0.18 }, // % que sube el hombro (oreja-hombro) vs. postura inicial
  kineticChain: { ok: 0, warn: 1 },         // nº de inversiones en el orden cadera→hombro→codo→muñeca
};
export const statusFor = (key: MetricKey, v: number): Status => {
  const t = THRESHOLDS[key];
  return v <= t.ok ? 'ok' : v <= t.warn ? 'warn' : 'bad';
};
