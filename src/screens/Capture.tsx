import { useState } from 'react';
import { analyze, type Input } from '../core/analyze';
import { db, type PlayerRow } from '../data/db';
import type { View } from '../core/types';
import { useI18n } from '../i18n';

export default function Capture({ player, onBack, onDone }: { player: PlayerRow; onBack: () => void; onDone: (id: number) => void }) {
  const { t } = useI18n();
  const [files, setFiles] = useState<Partial<Record<View, File>>>({});
  const [trim, setTrim] = useState<Partial<Record<View, { start?: number; end?: number }>>>({});
  const [prog, setProg] = useState<number | null>(null);
  const [err, setErr] = useState('');

  const run = async () => {
    if (!files.frontal && !files.lateral) return setErr(t('needOne'));
    setErr(''); setProg(0);
    try {
      const inputs: Partial<Record<View, Input>> = {};
      (['frontal', 'lateral'] as View[]).forEach((v) => { if (files[v]) inputs[v] = { file: files[v]!, trim: trim[v] }; });
      const r = await analyze(inputs, setProg);
      const takes: { frontal?: typeof r.frontal; lateral?: typeof r.lateral } = {};
      for (const v of ['frontal', 'lateral'] as View[]) {
        if (r[v] && files[v]) { const vid = await db.videos.add({ blob: files[v]! }); takes[v] = { ...r[v]!, videoId: vid }; }
      }
      const id = await db.evals.add({ playerId: player.id!, date: Date.now(), side: r.side, metrics: r.metrics, diagnosis: r.diagnosis, takes, note: '' });
      onDone(id);
    } catch (e) { setErr(String((e as Error).message)); setProg(null); }
  };

  return (
    <>
      <button onClick={onBack}>← {t('back')}</button>
      <h2>{player.name}</h2>
      {(['frontal', 'lateral'] as View[]).map((v) => (
        <div className="card" key={v}>
          <div className="row sp"><b>{t(v)}</b><span className="mut">{files[v]?.name ?? ''}</span></div>
          <p className="mut">{t('tip.' + v)}</p>
          <label className="btn" style={{ display: 'block', textAlign: 'center' }}>
            {t('record')}
            <input type="file" accept="video/*" capture="environment" hidden onChange={(e) => setFiles((f) => ({ ...f, [v]: e.target.files?.[0] }))} />
          </label>
          {files[v] && (
            <div className="row" style={{ marginTop: 8 }}>
              <span className="mut">{t('trim')}</span>
              <input type="number" step="0.1" min="0" placeholder={t('from')} onChange={(e) => setTrim((x) => ({ ...x, [v]: { ...x[v], start: e.target.value ? +e.target.value : undefined } }))} />
              <input type="number" step="0.1" min="0" placeholder={t('to')} onChange={(e) => setTrim((x) => ({ ...x, [v]: { ...x[v], end: e.target.value ? +e.target.value : undefined } }))} />
            </div>)}
        </div>))}
      {prog !== null && <div className="bar"><i style={{ width: `${Math.round(prog * 100)}%` }} /></div>}
      {err && <p style={{ color: 'var(--bad)' }}>{err}</p>}
      <button className="primary fab" disabled={prog !== null} onClick={run}>{prog !== null ? t('analyzing') : t('analyze')}</button>
    </>
  );
}
