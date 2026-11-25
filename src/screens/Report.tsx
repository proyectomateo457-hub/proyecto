import { useEffect, useRef, useState } from 'react';
import { db, type EvalRow, type PlayerRow } from '../data/db';
import VideoOverlay, { type OverlayHandle } from '../ui/VideoOverlay';
import { shareSummary } from '../ui/shareCard';
import { useI18n } from '../i18n';
import type { Metric, Phase, View } from '../core/types';

const fmt = (m: Metric) => (m.unit === 'deg' ? `${m.value.toFixed(0)}°` : m.unit === 'ratio' ? `${(m.value * 100).toFixed(0)}%` : `${m.value}`);

export default function Report({ evalId, player, onBack }: { evalId: number; player: PlayerRow; onBack: () => void }) {
  const { t } = useI18n();
  const [ev, setEv] = useState<EvalRow | null>(null);
  const [blobs, setBlobs] = useState<Partial<Record<View, Blob>>>({});
  const [view, setView] = useState<View>('lateral');
  const [note, setNote] = useState('');
  const ref = useRef<OverlayHandle>(null);

  useEffect(() => { (async () => {
    const e = await db.evals.get(evalId); if (!e) return;
    setEv(e); setNote(e.note);
    const b: Partial<Record<View, Blob>> = {};
    for (const v of ['frontal', 'lateral'] as View[]) { const id = e.takes[v]?.videoId; if (id) b[v] = (await db.videos.get(id))?.blob; }
    setBlobs(b);
    setView(e.takes.lateral ? 'lateral' : 'frontal');
  })(); }, [evalId]);
  if (!ev) return null;

  const take = ev.takes[view], blob = blobs[view];
  const metric = (k: string) => ev.metrics.find((m) => m.key === k)!;
  const jump = (m: Metric) => { if (m.view !== view && ev.takes[m.view]) setView(m.view); setTimeout(() => ref.current?.seekToFrame(m.frameIdx), 50); };
  const phaseJump = (p: Phase) => take && ref.current?.seekToFrame(take.phases[p]);
  const saveNote = async () => { await db.evals.update(evalId, { note }); setEv({ ...ev, note }); };

  return (
    <>
      <div className="row sp"><button onClick={onBack}>← {t('back')}</button><span className="mut">{player.name} · {t('side.' + ev.side)} · {new Date(ev.date).toLocaleDateString()}</span></div>

      <h2>{t('focus')}</h2>
      {ev.diagnosis.focus.length === 0 && <div className="card keep">{t('noFocus')}</div>}
      {ev.diagnosis.focus.slice(0, 2).map((f, i) => { const m = metric(f.key); return (
        <div key={f.key} className={`card focus ${f.status}`} onClick={() => jump(m)} style={{ opacity: i ? 0.85 : 1 }}>
          <div className="row sp"><b><i className={`dot ${f.status}`} />{t(f.key + '.name')}</b><span className="num">{fmt(m)}</span></div>
          <div>{t(f.key + '.focus')}</div><div className="mut">{t('phase.' + f.phase)}</div>
        </div>); })}

      <h2>{t('keep')}</h2>
      {ev.diagnosis.keep.length === 0 && <div className="mut">{t('noKeep')}</div>}
      {ev.diagnosis.keep.map((k) => { const m = metric(k.key); return (
        <div key={k.key} className="card keep" onClick={() => jump(m)}>
          <div className="row sp"><b><i className="dot" />{t(k.key + '.name')}</b><span className="num">{fmt(m)}</span></div><div className="mut">{t(k.key + '.keep')}</div>
        </div>); })}

      <h2>Video</h2>
      <div className="chips">
        {(['frontal', 'lateral'] as View[]).filter((v) => ev.takes[v]).map((v) => <button key={v} className={`chip ${v === view ? 'on' : ''}`} onClick={() => setView(v)}>{t(v)}</button>)}
        {(['dip', 'setpoint', 'release'] as Phase[]).map((p) => <button key={p} className="chip" onClick={() => phaseJump(p)}>{t('phase.' + p)}</button>)}
      </div>
      {take && blob && <VideoOverlay key={view} ref={ref} take={take} blob={blob} />}

      <h2>{t('note')}</h2>
      <textarea rows={3} value={note} onChange={(e) => setNote(e.target.value)} onBlur={saveNote} />
      <button className="primary fab" onClick={() => shareSummary({ player: player.name, ev: { ...ev, note }, t })}>{t('share')}</button>
    </>
  );
}
