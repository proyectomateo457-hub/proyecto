import Dexie, { type Table } from 'dexie';
import type { Diagnosis, Metric, Side, Take } from '../core/types';

export interface PlayerRow { id?: number; name: string; category?: string; createdAt: number }
export interface EvalRow {
  id?: number; playerId: number; date: number; side: Side;
  metrics: Metric[]; diagnosis: Diagnosis; takes: { frontal?: Take; lateral?: Take }; note: string;
}
export interface VideoRow { id?: number; blob: Blob }

class DB extends Dexie {
  players!: Table<PlayerRow, number>;
  evals!: Table<EvalRow, number>;
  videos!: Table<VideoRow, number>;
  constructor() {
    super('shotlab');
    this.version(1).stores({ players: '++id, name, category', evals: '++id, playerId, date', videos: '++id' });
  }
}
export const db = new DB();
