import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { PageId, PixelAsset, PlayerAvatar, Scene, Story, InteractiveTarget } from '../types';
import {
  EngineState, activateTarget, advanceEvent, createEngineState, dismissEvent, eventPartCount, getEvent, getTarget,
  nearestInRange, requiredEvents, resize, sceneProgress, setInput, step, clearInput,
} from '../engine2d/engine';
import { DEFAULT_AVATAR_SPEED } from '../data/interactive/avatars';
import { FEET_Y, SCENE_HEIGHT } from '../data/interactive/assets';
import { track } from '../lib/api';

export type FallbackReason = 'asset-load-failed' | 'asset-timeout' | 'invalid-scene';

interface Props {
  story: Story;
  avatar: PlayerAvatar;
  assets: PixelAsset[];
  startSceneIndex?: number;
  /** true while a modal (e.g. the glossary) is open: keyboard movement must not react (FR-2D-CTRL-02) */
  inputBlocked?: boolean;
  fontClass: string;
  onSceneChange: (sceneNumber: number) => void;
  onFallback: (reason: FallbackReason, sceneNumber: number, detail?: string) => void;
  onSwitchToStandard: (sceneNumber: number) => void;
  onNavigate: (page: PageId, storyId?: string) => void;
  onOpenGlossaryWord: (term: string) => void;
  onOpenGlossary: () => void;
}

const LOAD_TIMEOUT_MS = 10000;
const isTypingTarget = (el: EventTarget | null) => {
  const n = el as HTMLElement | null;
  if (!n || !n.tagName) return false;
  return ['INPUT', 'TEXTAREA', 'SELECT'].includes(n.tagName) || n.isContentEditable;
};

/** Preload every asset that is essential for the scene. Decorative sprites may fail without breaking the scene. */
function useSceneAssets(scene: Scene, avatar: PlayerAvatar, assets: PixelAsset[]) {
  const [state, setState] = useState<{ sceneNumber: number; status: 'loading' | 'ready' | 'error'; failed?: string }>({ sceneNumber: scene.sceneNumber, status: 'loading' });
  const [failedDecor, setFailedDecor] = useState<string[]>([]);
  useEffect(() => {
    let cancelled = false;
    setState({ sceneNumber: scene.sceneNumber, status: 'loading' });
    setFailedDecor([]);
    const byId = (id?: string) => assets.find((a) => a.id === id);
    const required = [byId(scene.backgroundAssetId), byId(avatar.spriteAssetId), ...(scene.interactiveTargets ?? []).map((t) => byId(t.spriteAssetId))];
    const decor = (scene.decorSprites ?? []).map((d) => byId(d.spriteAssetId));
    let pending = 0;
    let done = false;
    const finish = (status: 'ready' | 'error', failed?: string) => {
      if (cancelled || done) return;
      done = true;
      setState({ sceneNumber: scene.sceneNumber, status, failed });
    };
    const timer = window.setTimeout(() => finish('error', 'timeout'), LOAD_TIMEOUT_MS);
    const urls = new Set<string>();
    for (const a of required) {
      if (!a) { finish('error', 'asset-not-registered'); return () => { cancelled = true; clearTimeout(timer); }; }
      urls.add(a.url);
    }
    pending = urls.size;
    if (pending === 0) finish('ready');
    urls.forEach((u) => {
      const img = new Image();
      img.onload = () => { if (--pending === 0) finish('ready'); };
      img.onerror = () => finish('error', u);
      img.src = u;
    });
    decor.forEach((a) => {
      if (!a) return;
      const img = new Image();
      img.onerror = () => !cancelled && setFailedDecor((p) => [...p, a.id]);
      img.src = a.url;
    });
    return () => { cancelled = true; clearTimeout(timer); };
  }, [scene, avatar, assets]);
  return { ...state, failedDecor };
}

export const Interactive2DReader: React.FC<Props> = ({
  story, avatar, assets, startSceneIndex = 0, inputBlocked, fontClass, onSceneChange, onFallback, onSwitchToStandard, onNavigate, onOpenGlossaryWord, onOpenGlossary,
}) => {
  const scenes = story.scenes;
  const speed = avatar.movement?.speed ?? DEFAULT_AVATAR_SPEED;
  const wrapRef = useRef<HTMLDivElement>(null);
  const [containerW, setContainerW] = useState(0);
  const scale = containerW > 0 && containerW < 520 ? 2 : 3;
  const viewportW = containerW > 0 ? Math.max(80, Math.floor(containerW / scale)) : 256;

  const initialScene = scenes[Math.min(startSceneIndex, scenes.length - 1)];
  const stateRef = useRef<EngineState>(createEngineState(initialScene, viewportW));
  const [state, setState] = useState<EngineState>(stateRef.current);
  const commit = useCallback((next: EngineState) => {
    if (next === stateRef.current) return;
    stateRef.current = next;
    setState(next);
  }, []);

  const scene = scenes.find((s) => s.sceneNumber === state.sceneNumber) ?? initialScene;
  const assetOf = useCallback((id?: string) => assets.find((a) => a.id === id), [assets]);
  const avatarAsset = assetOf(avatar.spriteAssetId);
  const loaded = useSceneAssets(scene, avatar, assets);
  const ready = loaded.status === 'ready' && loaded.sceneNumber === scene.sceneNumber;
  const reportedFallback = useRef(false);

  // ---- viewport measurement (FR-2D-CAM-04) ----
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const measure = () => setContainerW(Math.max(0, el.clientWidth - 8)); // minus the 4px frame on each side
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  useEffect(() => {
    commit(resize(stateRef.current, scene, viewportW));
  }, [viewportW, scene, commit]);

  // ---- notify parent / analytics ----
  useEffect(() => { onSceneChange(state.sceneNumber); }, [state.sceneNumber, onSceneChange]);
  useEffect(() => { track('2d_start', { storyId: story.id }); }, [story.id]);
  useEffect(() => {
    if (loaded.status === 'error' && loaded.sceneNumber === scene.sceneNumber && !reportedFallback.current) {
      reportedFallback.current = true;
      track('2d_failure', { storyId: story.id, sceneNumber: scene.sceneNumber, props: { failed: loaded.failed } });
      onFallback(loaded.failed === 'timeout' ? 'asset-timeout' : 'asset-load-failed', scene.sceneNumber, loaded.failed);
    }
  }, [loaded, scene.sceneNumber, story.id, onFallback]);

  // ---- game loop: only does work while moving ----
  useEffect(() => {
    if (!ready) return;
    let raf = 0;
    let last = performance.now();
    const tick = (t: number) => {
      const dt = (t - last) / 1000;
      last = t;
      const prev = stateRef.current;
      if ((prev.phase === 'exploring' && (prev.left || prev.right)) || prev.walking) {
        const sc = scenes.find((s) => s.sceneNumber === prev.sceneNumber)!;
        commit(step(prev, sc, dt, speed));
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [ready, scenes, speed, commit]);

  // ---- keyboard (desktop). Arrow keys never change scene here and never scroll the page. ----
  useEffect(() => {
    const dirOf = (k: string): 'left' | 'right' | null =>
      k === 'ArrowLeft' || k === 'a' || k === 'A' ? 'left' : k === 'ArrowRight' || k === 'd' || k === 'D' ? 'right' : null;
    const down = (e: KeyboardEvent) => {
      if (inputBlocked || isTypingTarget(e.target) || e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.key === 'Escape' && stateRef.current.phase === 'event') {
        commit(dismissEvent(stateRef.current));
        return;
      }
      const d = dirOf(e.key);
      if (!d) return;
      e.preventDefault();
      commit(setInput(stateRef.current, d, true));
    };
    const up = (e: KeyboardEvent) => {
      const d = dirOf(e.key);
      if (d) commit(setInput(stateRef.current, d, false));
    };
    const release = () => commit(clearInput(stateRef.current));
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    window.addEventListener('blur', release);
    document.addEventListener('visibilitychange', release);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
      window.removeEventListener('blur', release);
      document.removeEventListener('visibilitychange', release);
    };
  }, [inputBlocked, commit]);
  useEffect(() => { if (inputBlocked) commit(clearInput(stateRef.current)); }, [inputBlocked, commit]);

  // ---- actions ----
  const onTarget = (t: InteractiveTarget) => {
    const r = activateTarget(stateRef.current, scene, t.id);
    commit(r.state);
    if (r.outcome === 'triggered') {
      const ev = getEvent(scene, t.eventId);
      track('2d_interaction', { storyId: story.id, sceneNumber: scene.sceneNumber, props: { targetId: t.id, type: ev?.type } });
      if (ev?.type === 'cultural-info') track('2d_cultural_open', { storyId: story.id, sceneNumber: scene.sceneNumber, props: { targetId: t.id } });
    } else if (r.outcome === 'too-far') track('2d_too_far', { storyId: story.id, sceneNumber: scene.sceneNumber, props: { targetId: t.id } });
    else if (r.outcome === 'event-missing') track('2d_failure', { storyId: story.id, sceneNumber: scene.sceneNumber, props: { targetId: t.id, kind: 'event-missing' } });
  };
  const onLanjut = () => {
    const r = advanceEvent(stateRef.current, scenes);
    commit(r.state);
    const o = r.outcome;
    if (o.kind === 'scene-complete') track('scene_complete', { storyId: story.id, sceneNumber: o.from });
    if (o.kind === 'story-complete') {
      track('scene_complete', { storyId: story.id, sceneNumber: scene.sceneNumber });
      track('2d_story_complete', { storyId: story.id });
      track('story_complete', { storyId: story.id });
    }
    if (o.kind === 'transition-failed') track('2d_failure', { storyId: story.id, sceneNumber: scene.sceneNumber, props: { kind: 'transition', reason: o.reason } });
  };
  const hold = (dir: 'left' | 'right', on: boolean) => {
    commit(setInput(stateRef.current, dir, on));
    if (on) track('2d_mobile_control', { storyId: story.id, props: { dir } });
  };
  const restart = () => {
    commit(createEngineState(scenes[0], viewportW));
  };

  // ---- touch drag strip ----
  const stripRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const dragDir = (clientX: number) => {
    const r = stripRef.current!.getBoundingClientRect();
    const dx = clientX - (r.left + r.width / 2);
    const dead = Math.min(24, r.width * 0.1);
    commit(setInput(setInput(stateRef.current, 'left', dx < -dead), 'right', dx > dead));
  };

  // ---- derived view data ----
  const activeEvent = getEvent(scene, state.activeEventId);
  const activeTarget = activeEvent ? getTarget(scene, activeEvent.triggerTargetId) : undefined;
  const doneIds = state.completed[scene.sceneNumber] ?? [];
  const progress = sceneProgress(scene, doneIds);
  const nextRequired = requiredEvents(scene).find((e) => !doneIds.includes(e.id));
  const nextTargetLabel = nextRequired ? getTarget(scene, nextRequired.triggerTargetId)?.label : undefined;
  const optionalEvents = (scene.storyEvents ?? []).filter((e) => e.requirement === 'optional');
  const optionalDone = optionalEvents.filter((e) => doneIds.includes(e.id)).length;
  const near = nearestInRange(state, scene);
  const bgAsset = assetOf(scene.backgroundAssetId);
  const maxCam = Math.max(0, (scene.worldWidth ?? 0) - viewportW);
  const sceneIdx = scenes.findIndex((s) => s.sceneNumber === scene.sceneNumber);
  const px = (n: number) => Math.round(n * scale);
  const fmtSpeaker = (s?: string) => s ?? 'Narator';

  const sprite = useCallback(
    (id: string, x: number, offsetY = 0, extra: React.CSSProperties = {}) => {
      const a = assetOf(id);
      if (!a) return null;
      return { a, style: { position: 'absolute', left: px(x - a.width / 2), top: px(FEET_Y - a.height + offsetY), width: px(a.width), height: px(a.height), ...extra } as React.CSSProperties };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [assetOf, scale],
  );

  const complete = state.phase === 'story-complete';

  return (
    <div ref={wrapRef} className="w-full" data-testid="interactive-2d" data-phase={state.phase} data-scene={scene.sceneNumber}>
      {/* title row */}
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="min-w-0">
          <div className="text-[11px] font-bold uppercase tracking-widest text-[#9d422a]">{scene.partTitle} • {scene.timeContext}</div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#0e2444] leading-tight">{scene.actTitle}</h1>
        </div>
        <button
          onClick={() => onSwitchToStandard(scene.sceneNumber)}
          data-testid="switch-standard"
          className="shrink-0 text-xs font-semibold px-3 py-2 rounded-lg border border-[#E7E0D4] bg-[#F3EFE7] text-[#0e2444] hover:bg-[#E7E0D4] cursor-pointer inline-flex items-center gap-1.5"
        >
          <span className="material-symbols-outlined text-[16px]" aria-hidden>menu_book</span>
          Baca versi teks
        </button>
      </div>

      {/* scene viewport */}
      <div className="rounded-2xl overflow-hidden shadow-xl border-4 border-[#0e2444] bg-[#0e2444] flex justify-center" style={{ minHeight: px(SCENE_HEIGHT) }}>
        {!ready ? (
          <div className="flex flex-col items-center justify-center text-white/90 gap-3 p-6 text-center" style={{ height: px(SCENE_HEIGHT), width: '100%' }} data-testid="loading-2d" role="status">
            <span className="material-symbols-outlined animate-spin text-[28px]" aria-hidden>progress_activity</span>
            <span className="text-sm font-semibold">Memuat dunia cerita…</span>
            <button onClick={() => onSwitchToStandard(scene.sceneNumber)} className="text-xs underline cursor-pointer">Baca versi teks sekarang</button>
          </div>
        ) : (
          <div
            key={scene.sceneNumber}
            className="relative ngm-scene-fade overflow-hidden select-none"
            style={{ width: px(viewportW), height: px(SCENE_HEIGHT), background: '#0e2444' }}
            data-testid="scene-viewport"
            role="group"
            aria-label={scene.backgroundAlt ?? scene.actTitle}
          >
            <div className="absolute top-0 left-0" style={{ width: px(scene.worldWidth ?? 0), height: px(SCENE_HEIGHT), transform: `translateX(${-px(state.cameraX)}px)` }} data-testid="world" data-camera-x={state.cameraX.toFixed(1)}>
              {bgAsset && <img src={bgAsset.url} alt="" aria-hidden className="pixel absolute top-0 left-0 pointer-events-none" style={{ width: px(bgAsset.width), height: px(bgAsset.height) }} draggable={false} />}

              {/* decorative sprites: never targets (FR-2D-TGT-01) */}
              {(scene.decorSprites ?? []).filter((d) => !loaded.failedDecor.includes(d.spriteAssetId)).map((d) => {
                const s = sprite(d.spriteAssetId, d.positionX, d.offsetY ?? 0);
                return s ? <img key={d.id} src={s.a.url} alt="" aria-hidden data-testid={`decor-${d.id}`} className="pixel" style={s.style} draggable={false} /> : null;
              })}

              {/* interactive targets */}
              {(scene.interactiveTargets ?? []).map((t) => {
                const s = sprite(t.spriteAssetId, t.positionX);
                if (!s) return null;
                const inRange = Math.abs(state.x - t.positionX) <= t.interactionRadius;
                const done = doneIds.includes(t.eventId);
                const isActive = state.activeEventId === t.eventId;
                const hitW = Math.max(parseInt(String(s.style.width)), 44);
                const hitH = Math.max(parseInt(String(s.style.height)), 44);
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => onTarget(t)}
                    data-testid={`target-${t.id}`}
                    data-in-range={inRange}
                    data-done={done}
                    aria-label={`${t.label}. ${inRange ? 'Dalam jangkauan, klik untuk berinteraksi' : t.hint}${done ? ' (sudah dibuka)' : ''}`}
                    className={`ngm-target absolute cursor-pointer group bg-transparent p-0 border-0 ${isActive ? 'z-20' : 'z-10'}`}
                    style={{ left: px(t.positionX) - hitW / 2, top: parseInt(String(s.style.top)) + parseInt(String(s.style.height)) - hitH, width: hitW, height: hitH }}
                  >
                    {/* hint ring: a dashed shape (not colour-only) shown on hover/focus and when in range */}
                    <span className={`absolute inset-0 rounded-md border-2 border-dashed pointer-events-none transition-opacity ${inRange ? 'border-[#fd8c6e] opacity-100' : 'border-white/70 opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100'}`} />
                    <img src={s.a.url} alt="" aria-hidden className="pixel absolute pointer-events-none" style={{ left: (hitW - parseInt(String(s.style.width))) / 2, bottom: 0, width: s.style.width, height: s.style.height }} draggable={false} />
                    {/* marker: diamond = interactive; check = already opened */}
                    <span
                      className={`absolute left-1/2 -translate-x-1/2 -top-5 text-[11px] leading-none font-black px-1.5 py-1 rounded bg-white text-[#0e2444] border-2 border-[#0e2444] pointer-events-none ${inRange && !done ? 'ngm-marker' : ''}`}
                      aria-hidden
                    >
                      {done ? '✓' : inRange ? '▶ KLIK' : '◆'}
                    </span>
                  </button>
                );
              })}

              {/* avatar */}
              {(() => {
                const a = sprite(avatar.spriteAssetId, state.x);
                return a ? (
                  <div style={{ ...a.style, transform: state.facing === -1 ? 'scaleX(-1)' : undefined, zIndex: 15, pointerEvents: 'none' }} data-testid="avatar" data-x={state.x.toFixed(1)} data-walking={state.walking} data-facing={state.facing}>
                    <img src={a.a.url} alt="" aria-hidden className={`pixel w-full h-full ${state.walking ? 'ngm-walking' : ''}`} draggable={false} />
                  </div>
                ) : null;
              })()}
            </div>

            {/* edge cues: the scene can be explored further (FR-2D-UX-09) */}
            {state.cameraX > 1 && <div className="absolute left-0 top-1/2 -translate-y-1/2 bg-black/50 text-white text-lg font-black px-1.5 py-1 rounded-r pointer-events-none" aria-hidden>‹</div>}
            {maxCam > 0 && state.cameraX < maxCam - 1 && <div className="absolute right-0 top-1/2 -translate-y-1/2 bg-black/50 text-white text-lg font-black px-1.5 py-1 rounded-l pointer-events-none" aria-hidden>›</div>}

            {/* progress chip */}
            <div className="absolute top-2 left-2 bg-black/60 text-white text-[11px] font-bold px-2.5 py-1 rounded-full pointer-events-none" data-testid="scene-progress">
              Adegan {sceneIdx + 1} dari {scenes.length}
            </div>
            {near && state.phase === 'exploring' && (
              <div className="absolute top-2 right-2 bg-white text-[#0e2444] text-[11px] font-bold px-2.5 py-1 rounded-full border-2 border-[#0e2444] pointer-events-none" data-testid="near-chip">
                Klik: {near.label}
              </div>
            )}
          </div>
        )}
      </div>

      {/* live feedback line */}
      <div className="min-h-[2.5rem] mt-3" role="status" aria-live="polite" data-testid="feedback">
        {state.hint && (
          <div className="inline-flex items-center gap-2 bg-[#F5DED6] text-[#74240e] text-sm font-semibold px-3 py-2 rounded-lg border border-[#fd8c6e]/50" data-testid="hint" data-kind={state.hint.kind}>
            <span className="material-symbols-outlined text-[18px]" aria-hidden>directions_walk</span>
            {state.hint.text}
          </div>
        )}
        {state.notice && (
          <div className="flex items-start justify-between gap-3 bg-[#fff4d6] text-[#513400] text-sm font-medium px-3 py-2 rounded-lg border border-[#f9bb62]" data-testid="notice">
            <span>{state.notice}</span>
            <div className="flex gap-2 shrink-0">
              <button className="underline text-xs cursor-pointer" onClick={() => onSwitchToStandard(scene.sceneNumber)}>Pembaca standar</button>
              <button className="underline text-xs cursor-pointer" onClick={() => onNavigate('katalog-cerita')}>Katalog</button>
            </div>
          </div>
        )}
      </div>

      {/* bottom region: dialogue panel OR controls (same slot, so controls never cover the text) */}
      <div className="mt-1">
        {complete ? (
          <div className="rounded-2xl border border-[#E7E0D4] bg-[#F3EFE7] p-5 sm:p-6" data-testid="completion">
            <div className="flex items-center gap-2 text-[#0e2444] font-extrabold text-lg mb-1"><span className="material-symbols-outlined text-[#9d422a]" aria-hidden>check_circle</span> Cerita selesai</div>
            <p className={`${fontClass} text-[#344454] mb-4`}>Kamu telah mencapai akhir “{story.title}”. Lanjutkan menjelajah budaya Nusantara:</p>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => onNavigate('peta-nusantara')} className="bg-[#0e2444] text-white text-xs font-semibold px-4 py-2.5 rounded-xl cursor-pointer">Jelajahi Peta</button>
              <button onClick={onOpenGlossary} className="bg-[#9d422a] text-white text-xs font-semibold px-4 py-2.5 rounded-xl cursor-pointer">Buka Glosarium</button>
              <button onClick={() => onNavigate('katalog-cerita')} className="bg-white border border-[#E7E0D4] text-[#0e2444] text-xs font-semibold px-4 py-2.5 rounded-xl cursor-pointer">Katalog Cerita</button>
              <button onClick={restart} data-testid="restart" className="bg-white border border-[#E7E0D4] text-[#0e2444] text-xs font-semibold px-4 py-2.5 rounded-xl cursor-pointer">Main lagi dari awal</button>
            </div>
          </div>
        ) : state.phase === 'event' && activeEvent ? (
          activeEvent.type === 'cultural-info' && activeEvent.culturalContent?.annotation ? (
            <div className="rounded-2xl border border-[#fd8c6e]/60 bg-[#F5DED6] p-5" data-testid="cultural-panel" role="dialog" aria-label="Informasi budaya">
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-[#9d422a] text-[24px] shrink-0" aria-hidden>auto_stories</span>
                <div className="min-w-0">
                  <div className="text-[11px] font-bold uppercase tracking-widest text-[#9d422a] mb-1">Informasi Budaya • bukan bagian alur cerita</div>
                  <h3 className="text-base font-bold text-[#74240e] mb-2" data-testid="cultural-title">{activeEvent.culturalContent.annotation.title}</h3>
                  <p className={`${fontClass} text-[#74240e]`}>{activeEvent.culturalContent.annotation.description}</p>
                  <div className="text-xs pt-2 font-medium text-[#9d422a]" data-testid="cultural-source">📖 Sumber: <em>{activeEvent.culturalContent.annotation.source}</em></div>
                  {activeEvent.culturalContent.glossaryTerm && (
                    <button onClick={() => onOpenGlossaryWord(activeEvent.culturalContent!.glossaryTerm!)} className="mt-3 text-xs font-semibold underline text-[#74240e] cursor-pointer">Lihat istilah “{activeEvent.culturalContent.glossaryTerm}” di Glosarium</button>
                  )}
                </div>
              </div>
              <div className="mt-4 flex justify-end gap-2">
                <LanjutButton onClick={onLanjut} />
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-[#E7E0D4] bg-white p-5 shadow-sm" data-testid="dialog-panel" role="dialog" aria-label="Dialog cerita">
              <div className="text-[11px] font-bold uppercase tracking-widest text-[#667483] mb-1">
                {fmtSpeaker(activeEvent.lines?.[state.lineIndex]?.speaker)}{activeTarget ? ` • ${activeTarget.label}` : ''}
              </div>
              <p className={`${fontClass} text-[#131c26] whitespace-pre-line`} data-testid="dialog-text">{activeEvent.lines?.[state.lineIndex]?.text ?? ''}</p>
              <div className="mt-4 flex items-center justify-between gap-2">
                <span className="text-[11px] text-[#667483]" data-testid="dialog-part">Bagian {state.lineIndex + 1} dari {eventPartCount(activeEvent)}</span>
                <div className="flex gap-2">
                  <button onClick={() => commit(dismissEvent(stateRef.current))} className="text-xs font-semibold text-[#667483] hover:text-[#0e2444] px-3 py-2 cursor-pointer" data-testid="close-panel">Tutup</button>
                  <LanjutButton onClick={onLanjut} />
                </div>
              </div>
            </div>
          )
        ) : (
          <div className="rounded-2xl border border-[#E7E0D4] bg-[#F3EFE7] p-4" data-testid="controls">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
              <div className="text-xs sm:text-sm text-[#344454]" data-testid="objective">
                {nextTargetLabel ? <>Tujuan: temui <strong>{nextTargetLabel}</strong> ({progress.requiredDone}/{progress.requiredTotal} peristiwa utama)</> : <>Peristiwa utama selesai.</>}
                {optionalEvents.length > 0 && <span className="text-[#667483]"> • Info budaya opsional {optionalDone}/{optionalEvents.length}</span>}
              </div>
              <div className="hidden md:block text-[11px] text-[#667483]">Gerak: <kbd className="px-1.5 py-0.5 rounded bg-black/10 font-mono">←</kbd> <kbd className="px-1.5 py-0.5 rounded bg-black/10 font-mono">→</kbd> / <kbd className="px-1.5 py-0.5 rounded bg-black/10 font-mono">A</kbd> <kbd className="px-1.5 py-0.5 rounded bg-black/10 font-mono">D</kbd> • klik tokoh/objek untuk berinteraksi</div>
            </div>
            <div className="flex items-stretch gap-3 select-none" style={{ touchAction: 'none' }}>
              <PadButton label="Jalan ke kiri" testId="btn-left" glyph="◀" onHold={(on) => hold('left', on)} />
              <div
                ref={stripRef}
                data-testid="drag-strip"
                className="flex-1 min-w-0 rounded-xl border-2 border-dashed border-[#0e2444]/40 bg-white/60 flex items-center justify-center text-[11px] sm:text-xs font-semibold text-[#344454] text-center px-2"
                style={{ touchAction: 'none', minHeight: 56 }}
                onPointerDown={(e) => { dragging.current = true; (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId); dragDir(e.clientX); }}
                onPointerMove={(e) => { if (dragging.current) dragDir(e.clientX); }}
                onPointerUp={() => { dragging.current = false; commit(clearInput(stateRef.current)); }}
                onPointerCancel={() => { dragging.current = false; commit(clearInput(stateRef.current)); }}
              >
                ↔ Geser jari ke kiri/kanan di sini untuk berjalan
              </div>
              <PadButton label="Jalan ke kanan" testId="btn-right" glyph="▶" onHold={(on) => hold('right', on)} />
            </div>
          </div>
        )}
      </div>

      {/* text-story access is always one click away (FR-2D-FB-01) */}
      <div className="mt-4 text-center text-[11px] text-[#667483]">Teks lengkap setiap adegan tetap tersedia lewat “Baca versi teks”. Aset piksel dibuat untuk NGM; detail budaya tetap bersumber dari anotasi terkurasi.</div>
    </div>
  );
};

const LanjutButton: React.FC<{ onClick: () => void }> = ({ onClick }) => {
  const ref = useRef<HTMLButtonElement>(null);
  useEffect(() => { ref.current?.focus({ preventScroll: true }); }, []);
  return (
    <button ref={ref} onClick={onClick} data-testid="lanjut" className="bg-[#9d422a] hover:bg-[#b54f35] text-white px-6 py-2.5 rounded-xl text-sm font-bold inline-flex items-center gap-1.5 shadow-sm cursor-pointer">
      Lanjut <span className="material-symbols-outlined text-[18px]" aria-hidden>arrow_forward</span>
    </button>
  );
};

const PadButton: React.FC<{ label: string; glyph: string; testId: string; onHold: (on: boolean) => void }> = ({ label, glyph, testId, onHold }) => (
  <button
    type="button"
    aria-label={label}
    data-testid={testId}
    className="w-16 sm:w-20 min-h-[56px] rounded-xl bg-[#0e2444] text-white text-2xl font-black active:bg-[#9d422a] cursor-pointer shrink-0"
    style={{ touchAction: 'none' }}
    onPointerDown={(e) => { e.preventDefault(); (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId); onHold(true); }}
    onPointerUp={() => onHold(false)}
    onPointerCancel={() => onHold(false)}
    onLostPointerCapture={() => onHold(false)}
    onContextMenu={(e) => e.preventDefault()}
    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onHold(true); } }}
    onKeyUp={(e) => { if (e.key === 'Enter' || e.key === ' ') onHold(false); }}
  >
    {glyph}
  </button>
);
