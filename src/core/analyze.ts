import { extractFrames } from './pose/extractFrames';
import { detectPhases, detectSide } from './phases';
import { computeMetrics } from './metrics';
import { diagnose } from './diagnose';
import type { Diagnosis, Metric, Side, Take, View } from './types';

export interface Input { file: Blob; trim?: { start?: number; end?: number } }
export interface Result { side: Side; frontal?: Take; lateral?: Take; metrics: Metric[]; diagnosis: Diagnosis }

export async function analyze(
  inputs: Partial<Record<View, Input>>, onProgress: (p: number) => void,
): Promise<Result> {
  const views = (['frontal', 'lateral'] as View[]).filter((v) => inputs[v]);
  if (!views.length) throw new Error('Falta al menos una toma');
  const raws = {} as Record<View, Awaited<ReturnType<typeof extractFrames>>>;
  for (let i = 0; i < views.length; i++) {
    const v = views[i];
    raws[v] = await extractFrames(inputs[v]!.file, inputs[v]!.trim, (p) => onProgress((i + p) / views.length));
  }
  // el lado de tiro se detecta en el frontal (ve ambos brazos); si no hay, en el lateral
  const side = detectSide(raws[views.includes('frontal') ? 'frontal' : views[0]].frames);
  const build = (v: View): Take | undefined =>
    raws[v] ? { ...raws[v], view: v, side, phases: detectPhases(raws[v].frames, side) } : undefined;
  const frontal = build('frontal'), lateral = build('lateral');
  const metrics = computeMetrics(frontal, lateral);
  return { side, frontal, lateral, metrics, diagnosis: diagnose(metrics) };
}
