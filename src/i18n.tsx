import { createContext, useContext, useState, type ReactNode } from 'react';
import type { MetricKey } from './core/types';

type Dict = Record<string, string>;
const es: Dict = {
  'app.sub': 'Laboratorio de tiro', 'roster': 'Jugadores', 'newPlayer': 'Nombre del jugador', 'add': 'Agregar',
  'shoot': 'Nuevo tiro', 'frontal': 'Frontal', 'lateral': 'Lateral', 'record': 'Grabar / subir', 'analyze': 'Analizar',
  'analyzing': 'Analizando…', 'trim': 'Recorte (seg)', 'from': 'Desde', 'to': 'Hasta', 'back': 'Volver',
  'focus': 'Foco inmediato', 'keep': 'No se toca', 'noFocus': 'Sin desvíos importantes. ¡Seguí así!', 'noKeep': 'Nada en verde todavía.',
  'share': 'Compartir resumen', 'history': 'Historial', 'note': 'Observación del entrenador', 'save': 'Guardar',
  'tip.frontal': 'Celular vertical a ~3 m, altura de pecho, de frente al tirador.',
  'tip.lateral': 'Celular vertical a ~3 m, altura de pecho, de costado (lado del brazo de tiro).',
  'phase.dip': 'Carga', 'phase.setpoint': 'Set point', 'phase.release': 'Release',
  'side.right': 'Diestro', 'side.left': 'Zurdo', 'needOne': 'Subí al menos una toma.',
  'kneeDip.name': 'Flexión de rodillas', 'kneeDip.focus': 'Falta de flexión: bajá más la cadera al recibir y cargar.', 'kneeDip.keep': 'Buena carga de piernas.',
  'elbowFlare.name': 'Alineación del codo', 'elbowFlare.focus': 'Codo abierto al soltar: llevalo debajo de la pelota.', 'elbowFlare.keep': 'Codo alineado en el release.',
  'shoulderElevation.name': 'Hombros', 'shoulderElevation.focus': 'Hombros elevados antes de arrancar: relajá escápulas y trapecio.', 'shoulderElevation.keep': 'Hombros relajados.',
  'kineticChain.name': 'Cadena cinemática', 'kineticChain.focus': 'Orden roto: piernas→cadera→hombro→codo→muñeca.', 'kineticChain.keep': 'Cadena ordenada piernas→cadera→hombro→codo→muñeca.',
};
const en: Dict = {
  'app.sub': 'Shooting lab', 'roster': 'Players', 'newPlayer': 'Player name', 'add': 'Add',
  'shoot': 'New shot', 'frontal': 'Front', 'lateral': 'Side', 'record': 'Record / upload', 'analyze': 'Analyze',
  'analyzing': 'Analyzing…', 'trim': 'Trim (sec)', 'from': 'From', 'to': 'To', 'back': 'Back',
  'focus': 'Immediate focus', 'keep': "Don't touch", 'noFocus': 'No major issues. Keep it up!', 'noKeep': 'Nothing in green yet.',
  'share': 'Share summary', 'history': 'History', 'note': 'Coach note', 'save': 'Save',
  'tip.frontal': 'Phone vertical, ~3 m away, chest height, facing the shooter.',
  'tip.lateral': 'Phone vertical, ~3 m away, chest height, from the shooting-arm side.',
  'phase.dip': 'Dip', 'phase.setpoint': 'Set point', 'phase.release': 'Release',
  'side.right': 'Right-handed', 'side.left': 'Left-handed', 'needOne': 'Upload at least one take.',
  'kneeDip.name': 'Knee bend', 'kneeDip.focus': 'Lack of dip: sink the hips more on the catch/load.', 'kneeDip.keep': 'Good leg load.',
  'elbowFlare.name': 'Elbow alignment', 'elbowFlare.focus': 'Elbow flares at release: keep it under the ball.', 'elbowFlare.keep': 'Elbow aligned at release.',
  'shoulderElevation.name': 'Shoulders', 'shoulderElevation.focus': 'Shoulders raised before the shot: relax scapula/traps.', 'shoulderElevation.keep': 'Shoulders relaxed.',
  'kineticChain.name': 'Kinetic chain', 'kineticChain.focus': 'Chain out of order: legs→hips→shoulder→elbow→wrist.', 'kineticChain.keep': 'Ordered chain legs→hips→shoulder→elbow→wrist.',
};
const dicts = { es, en };
type Lang = keyof typeof dicts;
const Ctx = createContext<{ lang: Lang; setLang: (l: Lang) => void; t: (k: string) => string }>(null as never);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => (localStorage.getItem('lang') as Lang) || 'es');
  const setLang = (l: Lang) => { localStorage.setItem('lang', l); setLangState(l); };
  return <Ctx.Provider value={{ lang, setLang, t: (k) => dicts[lang][k] ?? k }}>{children}</Ctx.Provider>;
}
export const useI18n = () => useContext(Ctx);
export type { MetricKey };
