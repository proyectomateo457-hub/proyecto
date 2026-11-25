import { useEffect, useState } from 'react';
import { db, type EvalRow, type PlayerRow } from '../data/db';
import { useI18n } from '../i18n';

export default function Roster({ onShoot, onOpen }: { onShoot: (p: PlayerRow) => void; onOpen: (p: PlayerRow, evalId: number) => void }) {
  const { t } = useI18n();
  const [players, setPlayers] = useState<PlayerRow[]>([]);
  const [evals, setEvals] = useState<EvalRow[]>([]);
  const [name, setName] = useState('');
  const [sel, setSel] = useState<PlayerRow | null>(null);
  const load = async () => { setPlayers(await db.players.orderBy('name').toArray()); setEvals(await db.evals.orderBy('date').reverse().toArray()); };
  useEffect(() => { load(); }, []);
  const add = async () => { if (!name.trim()) return; await db.players.add({ name: name.trim(), createdAt: Date.now() }); setName(''); load(); };
  const mine = sel ? evals.filter((e) => e.playerId === sel.id) : [];
  return (
    <>
      <h2>{t('roster')}</h2>
      <div className="row"><input type="text" placeholder={t('newPlayer')} value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && add()} /><button onClick={add}>{t('add')}</button></div>
      <div style={{ marginTop: 12 }}>
        {players.map((p) => (
          <div key={p.id} className="card" onClick={() => setSel(p)} style={{ borderColor: sel?.id === p.id ? 'var(--acc)' : undefined }}>
            <div className="row sp"><b>{p.name}</b><span className="mut">{evals.filter((e) => e.playerId === p.id).length} ✓</span></div>
          </div>
        ))}
      </div>
      {sel && mine.length > 0 && <><h2>{t('history')} · {sel.name}</h2>
        {mine.map((e) => (
          <div key={e.id} className="card" onClick={() => onOpen(sel, e.id!)}>
            <div className="row sp"><span>{new Date(e.date).toLocaleDateString()}</span>
              <span>{e.diagnosis.focus[0] ? <><i className={`dot ${e.diagnosis.focus[0].status}`} />{t(e.diagnosis.focus[0].key + '.name')}</> : <i className="dot" />}</span></div>
          </div>))}</>}
      {sel && <button className="primary fab" onClick={() => onShoot(sel)}>{t('shoot')} · {sel.name}</button>}
    </>
  );
}
