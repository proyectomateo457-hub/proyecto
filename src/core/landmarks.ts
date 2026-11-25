import type { Side } from './types';
// Índices de MediaPipe Pose (33 puntos)
export const LM = {
  nose: 0, earL: 7, earR: 8, shL: 11, shR: 12, elL: 13, elR: 14, wrL: 15, wrR: 16,
  idxL: 19, idxR: 20, hipL: 23, hipR: 24, knL: 25, knR: 26, anL: 27, anR: 28,
} as const;
export const pick = (side: Side) =>
  side === 'right'
    ? { ear: LM.earR, sh: LM.shR, el: LM.elR, wr: LM.wrR, hip: LM.hipR, kn: LM.knR, an: LM.anR, shO: LM.shL }
    : { ear: LM.earL, sh: LM.shL, el: LM.elL, wr: LM.wrL, hip: LM.hipL, kn: LM.knL, an: LM.anL, shO: LM.shR };
export const SKELETON: [number, number][] = [
  [11, 12], [11, 13], [13, 15], [12, 14], [14, 16], [11, 23], [12, 24], [23, 24],
  [23, 25], [25, 27], [24, 26], [26, 28],
];
