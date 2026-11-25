import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { SKELETON } from '../core/landmarks';
import type { Take } from '../core/types';

export interface OverlayHandle { seekToFrame: (i: number) => void }
/** Video + esqueleto dibujado desde los landmarks guardados (sin re-inferir). */
const VideoOverlay = forwardRef<OverlayHandle, { take: Take; blob: Blob }>(({ take, blob }, ref) => {
  const v = useRef<HTMLVideoElement>(null), c = useRef<HTMLCanvasElement>(null);
  const url = useRef(URL.createObjectURL(blob));
  useEffect(() => () => URL.revokeObjectURL(url.current), []);
  useImperativeHandle(ref, () => ({
    seekToFrame: (i) => { if (v.current) { v.current.pause(); v.current.currentTime = (take.trimStartMs + take.frames[i].t) / 1000; } },
  }));
  useEffect(() => {
    let raf = 0;
    const draw = () => {
      const video = v.current, cv = c.current;
      if (video && cv) {
        cv.width = video.clientWidth; cv.height = video.clientHeight;
        const ctx = cv.getContext('2d')!;
        ctx.clearRect(0, 0, cv.width, cv.height);
        const tMs = video.currentTime * 1000 - take.trimStartMs;
        let best = 0;
        for (let k = 1; k < take.frames.length; k++) if (Math.abs(take.frames[k].t - tMs) < Math.abs(take.frames[best].t - tMs)) best = k;
        // el <video> usa object-fit: contain → calcular el rect real del video
        const vw = video.videoWidth || 1, vh = video.videoHeight || 1;
        const s = Math.min(cv.width / vw, cv.height / vh), w = vw * s, h = vh * s, ox = (cv.width - w) / 2, oy = (cv.height - h) / 2;
        const P = (i: number) => { const p = take.frames[best].lm[i]; return [ox + (p.x / take.aspect) * w, oy + p.y * h]; };
        ctx.strokeStyle = '#3ee0ff'; ctx.lineWidth = 3; ctx.fillStyle = '#fff';
        for (const [a, b] of SKELETON) { const [x1, y1] = P(a), [x2, y2] = P(b); ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); }
        for (const i of [11, 12, 13, 14, 15, 16, 23, 24, 25, 26, 27, 28]) { const [x, y] = P(i); ctx.beginPath(); ctx.arc(x, y, 4, 0, 7); ctx.fill(); }
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [take]);
  return <div className="vid"><video ref={v} src={url.current} controls playsInline muted loop /><canvas ref={c} /></div>;
});
export default VideoOverlay;
