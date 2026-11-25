import { useState } from 'react';
import { useI18n } from './i18n';
import Roster from './screens/Roster';
import Capture from './screens/Capture';
import Report from './screens/Report';
import type { PlayerRow } from './data/db';

type Route = { name: 'roster' } | { name: 'capture'; player: PlayerRow } | { name: 'report'; evalId: number; player: PlayerRow };

export default function App() {
  const { lang, setLang, t } = useI18n();
  const [route, setRoute] = useState<Route>({ name: 'roster' });
  return (
    <div className="app">
      <header className="top">
        <h1>ShotLab<small>{t('app.sub')}</small></h1>
        <button onClick={() => setLang(lang === 'es' ? 'en' : 'es')}>{lang === 'es' ? 'EN' : 'ES'}</button>
      </header>
      {route.name === 'roster' && <Roster onShoot={(player) => setRoute({ name: 'capture', player })} onOpen={(player, evalId) => setRoute({ name: 'report', player, evalId })} />}
      {route.name === 'capture' && <Capture player={route.player} onBack={() => setRoute({ name: 'roster' })} onDone={(evalId) => setRoute({ name: 'report', player: route.player, evalId })} />}
      {route.name === 'report' && <Report evalId={route.evalId} player={route.player} onBack={() => setRoute({ name: 'roster' })} />}
    </div>
  );
}
