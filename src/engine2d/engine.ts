/**
 * Pure game-logic core for Interactive 2D Story Exploration.
 * No React, no DOM, no timers: every function takes a state and returns a new one, so the
 * rules in PRD 6.3.1 (FR-2D-MOVE/CAM/BND/TGT/EVT/DLG/TRN/CMP) can be unit-tested directly.
 */
import { InteractiveTarget, Scene, StoryEvent } from '../types';

export type Phase = 'exploring' | 'event' | 'story-complete';

export interface Hint {
  kind: 'too-far' | 'order' | 'missing-event';
  targetId: string;
  text: string;
}

export interface EngineState {
  sceneNumber: number;
  x: number;
  facing: 1 | -1;
  walking: boolean;
  left: boolean;
  right: boolean;
  viewportWidth: number;
  cameraX: number;
  phase: Phase;
  activeEventId: string | null;
  lineIndex: number;
  /** event ids already completed, per scene. Completion is counted once (FR-2D-EVT-06). */
  completed: Record<number, string[]>;
  hint: Hint | null;
  /** user-facing problem message (FR-2D-FB-03/04); never locks the controls. */
  notice: string | null;
}

export type ActivationOutcome =
  | 'triggered'
  | 'ignored-not-a-target'
  | 'blocked-busy'
  | 'too-far'
  | 'out-of-order'
  | 'event-missing';

export type AdvanceOutcome =
  | { kind: 'next-line' }
  | { kind: 'return-control'; eventId: string; firstCompletion: boolean }
  | { kind: 'scene-complete'; eventId: string; from: number; to: number }
  | { kind: 'story-complete'; eventId: string }
  | { kind: 'transition-failed'; eventId: string; reason: string }
  | { kind: 'noop' };

// ---------- geometry ----------
export const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

export function sceneBounds(scene: Scene) {
  const world = scene.worldWidth ?? 0;
  return scene.movementBounds ?? { minX: 0, maxX: world };
}

/** FR-2D-CAM-01..03: follow the avatar, never show outside the world, stay still when the world fits. */
export function computeCameraX(avatarX: number, worldWidth: number, viewportWidth: number): number {
  if (worldWidth <= viewportWidth) return 0;
  return clamp(avatarX - viewportWidth / 2, 0, worldWidth - viewportWidth);
}

export function horizontalDistance(x: number, target: Pick<InteractiveTarget, 'positionX'>) {
  return Math.abs(x - target.positionX);
}

export const isWithinRadius = (x: number, t: InteractiveTarget) => horizontalDistance(x, t) <= t.interactionRadius;

// ---------- queries ----------
export const getEvent = (scene: Scene, id: string | null | undefined): StoryEvent | undefined =>
  id ? scene.storyEvents?.find((e) => e.id === id) : undefined;

export const getTarget = (scene: Scene, id: string): InteractiveTarget | undefined =>
  scene.interactiveTargets?.find((t) => t.id === id);

export const requiredEvents = (scene: Scene): StoryEvent[] =>
  (scene.storyEvents ?? []).filter((e) => e.requirement === 'required').sort((a, b) => (a.sequence ?? 0) - (b.sequence ?? 0));

export function sceneProgress(scene: Scene, completedIds: string[] = []) {
  const req = requiredEvents(scene);
  const done = req.filter((e) => completedIds.includes(e.id)).length;
  return { requiredTotal: req.length, requiredDone: done, complete: req.length > 0 && done === req.length };
}

/** Number of dialogue parts: one per line, or a single cultural panel when the event has no lines. */
export const eventPartCount = (e: StoryEvent) => Math.max(1, e.lines?.length ?? 0);

// ---------- construction ----------
export function createEngineState(scene: Scene, viewportWidth: number, completed: EngineState['completed'] = {}): EngineState {
  const b = sceneBounds(scene);
  const x = clamp(scene.avatarStartX ?? b.minX, b.minX, b.maxX);
  return {
    sceneNumber: scene.sceneNumber,
    x,
    facing: 1,
    walking: false,
    left: false,
    right: false,
    viewportWidth,
    cameraX: computeCameraX(x, scene.worldWidth ?? 0, viewportWidth),
    phase: 'exploring',
    activeEventId: null,
    lineIndex: 0,
    completed,
    hint: null,
    notice: null,
  };
}

// ---------- input & movement ----------
export function setInput(state: EngineState, dir: 'left' | 'right', pressed: boolean): EngineState {
  // while an event is open (or the story is over) presses are ignored; releases always clear (FR-2D-MOVE-04)
  if (pressed && state.phase !== 'exploring') return state;
  if (state[dir] === pressed) return state;
  return { ...state, [dir]: pressed };
}

export const clearInput = (state: EngineState): EngineState =>
  state.left || state.right || state.walking ? { ...state, left: false, right: false, walking: false } : state;

/** Resolved direction. Left+right together cancel out: deterministic (FR-2D-CTRL-05). */
export const inputDirection = (s: Pick<EngineState, 'left' | 'right'>): -1 | 0 | 1 => ((s.right ? 1 : 0) - (s.left ? 1 : 0)) as -1 | 0 | 1;

export function step(state: EngineState, scene: Scene, dtSeconds: number, speed: number): EngineState {
  if (state.phase !== 'exploring') return state.walking ? { ...state, walking: false } : state;
  const dir = inputDirection(state);
  if (dir === 0) return state.walking ? { ...state, walking: false } : state;
  const b = sceneBounds(scene);
  const nx = clamp(state.x + dir * speed * Math.min(dtSeconds, 0.1), b.minX, b.maxX); // dt cap avoids tunnelling after tab switches
  const moved = nx !== state.x;
  return {
    ...state,
    x: nx,
    facing: dir,
    walking: moved, // pushing against a bound is ignored without error (FR-2D-BND-02)
    cameraX: computeCameraX(nx, scene.worldWidth ?? 0, state.viewportWidth),
    hint: moved ? null : state.hint,
  };
}

export function resize(state: EngineState, scene: Scene, viewportWidth: number): EngineState {
  if (viewportWidth === state.viewportWidth) return state;
  return { ...state, viewportWidth, cameraX: computeCameraX(state.x, scene.worldWidth ?? 0, viewportWidth) };
}

// ---------- target activation ----------
export function activateTarget(state: EngineState, scene: Scene, targetId: string): { state: EngineState; outcome: ActivationOutcome } {
  const target = getTarget(scene, targetId);
  if (!target) return { state, outcome: 'ignored-not-a-target' }; // decorative objects never trigger (AC-2D-07)
  if (state.phase !== 'exploring') return { state, outcome: 'blocked-busy' }; // no double events (AC-2D-10)

  if (!isWithinRadius(state.x, target)) {
    return {
      state: { ...state, hint: { kind: 'too-far', targetId, text: target.hint || `Dekati ${target.label} terlebih dahulu.` } },
      outcome: 'too-far',
    };
  }
  const event = getEvent(scene, target.eventId);
  if (!event || event.triggerTargetId !== target.id) {
    return {
      state: { ...state, hint: null, notice: `Bagian ini belum dapat ditampilkan (${target.label}). Kamu bisa lanjut menjelajah atau membaca teks cerita.` },
      outcome: 'event-missing',
    };
  }
  const done = state.completed[scene.sceneNumber] ?? [];
  if (event.requirement === 'required' && !done.includes(event.id)) {
    const earlier = requiredEvents(scene).find((e) => (e.sequence ?? 0) < (event.sequence ?? 0) && !done.includes(e.id));
    if (earlier) {
      const who = getTarget(scene, earlier.triggerTargetId)?.label ?? 'tokoh lain';
      return {
        state: { ...state, hint: { kind: 'order', targetId, text: `Temui ${who} lebih dulu supaya ceritanya runtut.` } },
        outcome: 'out-of-order',
      };
    }
  }
  return {
    state: { ...clearInput(state), phase: 'event', activeEventId: event.id, lineIndex: 0, hint: null, notice: null },
    outcome: 'triggered',
  };
}

// ---------- dialogue: "Lanjut" ----------
export function advanceEvent(state: EngineState, scenes: Scene[]): { state: EngineState; outcome: AdvanceOutcome } {
  const scene = scenes.find((s) => s.sceneNumber === state.sceneNumber);
  const event = scene ? getEvent(scene, state.activeEventId) : undefined;
  if (state.phase !== 'event' || !scene || !event) return { state, outcome: { kind: 'noop' } };

  if (state.lineIndex < eventPartCount(event) - 1) {
    return { state: { ...state, lineIndex: state.lineIndex + 1 }, outcome: { kind: 'next-line' } };
  }

  // last part: complete the event exactly once
  const prevDone = state.completed[scene.sceneNumber] ?? [];
  const firstCompletion = !prevDone.includes(event.id);
  const done = firstCompletion ? [...prevDone, event.id] : prevDone;
  const completed = { ...state.completed, [scene.sceneNumber]: done };
  const base: EngineState = { ...state, completed, activeEventId: null, lineIndex: 0, phase: 'exploring' };

  const progress = sceneProgress(scene, done);
  if (event.afterEvent === 'advance-scene' && progress.complete) {
    if (scene.nextSceneNumber == null) {
      return { state: { ...base, phase: 'story-complete' }, outcome: { kind: 'story-complete', eventId: event.id } };
    }
    const next = scenes.find((s) => s.sceneNumber === scene.nextSceneNumber);
    if (!next || next.mode !== 'interactive-2d' || !next.worldWidth) {
      // FR-2D-FB-04 / AC-2D-16: stay on the current scene with a clear message; controls are returned
      return {
        state: { ...base, notice: 'Adegan berikutnya belum dapat dimuat. Kamu tetap berada di adegan ini; buka pembaca standar untuk melanjutkan membaca.' },
        outcome: { kind: 'transition-failed', eventId: event.id, reason: `scene ${scene.nextSceneNumber} missing or invalid` },
      };
    }
    const fresh = createEngineState(next, state.viewportWidth, completed);
    return { state: fresh, outcome: { kind: 'scene-complete', eventId: event.id, from: scene.sceneNumber, to: next.sceneNumber } };
  }
  return { state: base, outcome: { kind: 'return-control', eventId: event.id, firstCompletion } };
}

/** Escape hatch (FR-2D-FB-03): close the panel without completing the event; the user keeps control. */
export function dismissEvent(state: EngineState): EngineState {
  if (state.phase !== 'event') return state;
  return { ...state, phase: 'exploring', activeEventId: null, lineIndex: 0 };
}

/** Closest in-range target, used for the proximity affordance (FR-2D-UX-06/07). */
export function nearestInRange(state: EngineState, scene: Scene): InteractiveTarget | undefined {
  return (scene.interactiveTargets ?? [])
    .filter((t) => isWithinRadius(state.x, t))
    .sort((a, b) => horizontalDistance(state.x, a) - horizontalDistance(state.x, b))[0];
}
