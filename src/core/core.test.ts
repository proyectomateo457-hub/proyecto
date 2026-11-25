import { describe, expect, it } from 'vitest';
import { angle } from './geometry';
import { statusFor } from './thresholds';
import { diagnose } from './diagnose';
import { OneEuro } from './oneEuro';

const P = (x: number, y: number) => ({ x, y, v: 1 });
describe('core', () => {
  it('angle', () => { expect(angle(P(1, 0), P(0, 0), P(0, 1))).toBeCloseTo(90); expect(angle(P(1, 0), P(0, 0), P(-1, 0))).toBeCloseTo(180); });
  it('status', () => { expect(statusFor('kneeDip', 120)).toBe('ok'); expect(statusFor('kneeDip', 140)).toBe('warn'); expect(statusFor('kneeDip', 160)).toBe('bad'); });
  it('diagnose orders focus by phase', () => {
    const d = diagnose([
      { key: 'elbowFlare', view: 'frontal', phase: 'release', value: 0.6, unit: 'ratio', status: 'bad', frameIdx: 0 },
      { key: 'kneeDip', view: 'lateral', phase: 'dip', value: 150, unit: 'deg', status: 'bad', frameIdx: 0 },
      { key: 'kineticChain', view: 'lateral', phase: 'release', value: 0, unit: 'count', status: 'ok', frameIdx: 0 },
    ]);
    expect(d.focus.map((f) => f.key)).toEqual(['kneeDip', 'elbowFlare']);
    expect(d.keep.map((k) => k.key)).toEqual(['kineticChain']);
  });
  it('oneEuro converges', () => { const f = new OneEuro(); let v = 0; for (let i = 0; i < 30; i++) v = f.filter(1, i / 30); expect(v).toBeCloseTo(1, 1); });
});
