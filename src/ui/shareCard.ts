import type { EvalRow } from '../data/db';

/** Genera la tarjeta PNG de resumen y la comparte (Web Share) o la descarga. */
export async function shareSummary(opts: { player: string; ev: EvalRow; t: (k: string) => string; frame?: HTMLCanvasElement | null }) {
  const { player, ev, t } = opts;
  const W = 1080, H = 1350, cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  const g = cv.getContext('2d')!;
  g.fillStyle = '#0b0f14'; g.fillRect(0, 0, W, H);
  g.fillStyle = '#3ee0ff'; g.font = '700 28px system-ui'; g.fillText('SHOTLAB', 60, 80);
  g.fillStyle = '#e6edf3'; g.font = '700 64px system-ui'; g.fillText(player, 60, 170);
  g.fillStyle = '#8b98a9'; g.font = '32px system-ui'; g.fillText(new Date(ev.date).toLocaleDateString(), 60, 220);
  let y = 320;
  const wrap = (txt: string, x: number, maxW: number, lh: number) => {
    let line = '';
    for (const w of txt.split(' ')) { const test = line + w + ' '; if (g.measureText(test).width > maxW && line) { g.fillText(line, x, y); y += lh; line = w + ' '; } else line = test; }
    g.fillText(line, x, y); y += lh;
  };
  g.fillStyle = '#ff5d6c'; g.font = '700 34px system-ui'; g.fillText(t('focus').toUpperCase(), 60, y); y += 54;
  g.fillStyle = '#e6edf3'; g.font = '40px system-ui';
  const f = ev.diagnosis.focus[0];
  if (f) { g.font = '700 44px system-ui'; g.fillText(t(f.key + '.name'), 60, y); y += 56; g.font = '36px system-ui'; g.fillStyle = '#c9d4e0'; wrap(t(f.key + '.focus'), 60, W - 120, 48); }
  else { wrap(t('noFocus'), 60, W - 120, 52); }
  y += 50; g.fillStyle = '#3ddc97'; g.font = '700 34px system-ui'; g.fillText(t('keep').toUpperCase(), 60, y); y += 54;
  g.fillStyle = '#c9d4e0'; g.font = '36px system-ui';
  for (const k of ev.diagnosis.keep.slice(0, 3)) { wrap('✓ ' + t(k.key + '.keep'), 60, W - 120, 48); y += 14; }
  if (ev.note) { y += 30; g.fillStyle = '#8b98a9'; g.font = 'italic 34px system-ui'; wrap('“' + ev.note + '”', 60, W - 120, 46); }
  const blob: Blob = await new Promise((r) => cv.toBlob((b) => r(b!), 'image/png'));
  const file = new File([blob], `shotlab-${player}.png`, { type: 'image/png' });
  if (navigator.canShare?.({ files: [file] })) await navigator.share({ files: [file], title: 'ShotLab' });
  else { const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = file.name; a.click(); }
}
