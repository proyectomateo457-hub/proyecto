import { FilesetResolver, PoseLandmarker } from '@mediapipe/tasks-vision';
import { OneEuro } from '../oneEuro';
import type { Frame, RawTake } from '../types';

// Para uso 100% offline: copiar el .task y /wasm a /public y apuntar acá.
const WASM = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm';
const MODEL = 'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_full/float16/latest/pose_landmarker_full.task';
const FPS = 30;

const once = (el: HTMLVideoElement, ev: string) =>
  new Promise<void>((res, rej) => {
    const ok = () => { el.removeEventListener('error', bad); res(); };
    const bad = () => { el.removeEventListener(ev, ok); rej(new Error('video error')); };
    el.addEventListener(ev, ok, { once: true });
    el.addEventListener('error', bad, { once: true });
  });

export async function extractFrames(
  file: Blob, trim: { start?: number; end?: number } = {}, onProgress?: (p: number) => void,
): Promise<RawTake> {
  const url = URL.createObjectURL(file);
  const video = document.createElement('video');
  video.muted = true; video.playsInline = true; video.preload = 'auto'; video.src = url;
  await once(video, 'loadeddata');
  const aspect = video.videoWidth / video.videoHeight;
  const start = Math.max(0, trim.start ?? 0);
  const end = Math.min(video.duration, trim.end ?? video.duration);

  const fileset = await FilesetResolver.forVisionTasks(WASM);
  const lm = await PoseLandmarker.createFromOptions(fileset, {
    baseOptions: { modelAssetPath: MODEL, delegate: 'GPU' }, runningMode: 'VIDEO', numPoses: 1,
  });
  const filters = Array.from({ length: 33 }, () => [new OneEuro(), new OneEuro()]);
  const frames: Frame[] = [];
  const total = Math.max(1, Math.floor((end - start) * FPS));
  try {
    for (let i = 0; i <= total; i++) {
      const t = start + i / FPS;
      video.currentTime = t;
      await once(video, 'seeked');
      const r = lm.detectForVideo(video, i * 33 + 1);
      const pts = r.landmarks[0];
      if (pts) {
        const tSec = i / FPS;
        frames.push({
          t: tSec * 1000,
          lm: pts.map((p, j) => ({
            x: filters[j][0].filter(p.x * aspect, tSec), // x en "alto de imagen": ángulos sin distorsión
            y: filters[j][1].filter(p.y, tSec),
            v: p.visibility ?? 0,
          })),
        });
      }
      onProgress?.(i / total);
    }
  } finally { lm.close(); URL.revokeObjectURL(url); }
  if (frames.length < 10) throw new Error('No se detectó una persona en el video');
  return { frames, aspect, durationMs: (end - start) * 1000, trimStartMs: start * 1000 };
}
