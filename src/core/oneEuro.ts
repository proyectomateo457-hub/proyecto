/** One Euro Filter: suaviza jitter sin sumar lag en movimientos rápidos. */
export class OneEuro {
  private x?: number; private dx = 0; private t?: number;
  constructor(private minCutoff = 1.2, private beta = 0.08, private dCutoff = 1) {}
  private alpha(cutoff: number, dt: number) { const tau = 1 / (2 * Math.PI * cutoff); return 1 / (1 + tau / dt); }
  filter(v: number, tSec: number): number {
    if (this.x === undefined || this.t === undefined) { this.x = v; this.t = tSec; return v; }
    const dt = Math.max(1e-3, tSec - this.t);
    const dv = (v - this.x) / dt;
    this.dx += this.alpha(this.dCutoff, dt) * (dv - this.dx);
    const cutoff = this.minCutoff + this.beta * Math.abs(this.dx);
    this.x += this.alpha(cutoff, dt) * (v - this.x);
    this.t = tSec;
    return this.x;
  }
}
