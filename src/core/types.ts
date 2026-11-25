export type Pt = { x: number; y: number; v: number };
/** t en ms relativo al inicio del recorte. x está en unidades de "alto de imagen" (corregido por aspecto). */
export type Frame = { t: number; lm: Pt[] };
export type Side = 'right' | 'left';
export type View = 'frontal' | 'lateral';
export type Phase = 'dip' | 'setpoint' | 'release';
export type Status = 'ok' | 'warn' | 'bad';
export type MetricKey = 'kneeDip' | 'elbowFlare' | 'shoulderElevation' | 'kineticChain';

export interface RawTake { frames: Frame[]; aspect: number; durationMs: number; trimStartMs: number }
export interface PhaseMarks { dip: number; setpoint: number; release: number } // índices de frame
export interface Take extends RawTake { view: View; side: Side; phases: PhaseMarks; videoId?: number }

export interface Metric {
  key: MetricKey; view: View; phase: Phase;
  value: number; unit: 'deg' | 'ratio' | 'count';
  status: Status; frameIdx: number;
}
export interface Diagnosis {
  keep: { key: MetricKey }[];
  focus: { key: MetricKey; phase: Phase; priority: number; status: Status }[];
}
