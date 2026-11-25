import type { Diagnosis, Metric, Phase } from './types';
const ORDER: Record<Phase, number> = { dip: 0, setpoint: 1, release: 2 };
/** keep = lo que está ok ("no se toca"). focus = desvíos, ordenados por fase del tiro y severidad. */
export function diagnose(metrics: Metric[]): Diagnosis {
  const keep = metrics.filter((m) => m.status === 'ok').map((m) => ({ key: m.key }));
  const focus = metrics
    .filter((m) => m.status !== 'ok')
    .sort((a, b) => ORDER[a.phase] - ORDER[b.phase] || (a.status === 'bad' ? -1 : 1) - (b.status === 'bad' ? -1 : 1))
    .map((m, i) => ({ key: m.key, phase: m.phase, status: m.status, priority: i + 1 }));
  return { keep, focus };
}
