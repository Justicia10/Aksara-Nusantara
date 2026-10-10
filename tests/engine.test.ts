import { describe, expect, it } from 'vitest';
import {
  activateTarget, advanceEvent, computeCameraX, createEngineState, dismissEvent, resize, setInput, step, sceneProgress, EngineState,
} from '../src/engine2d/engine';
import { roro2D } from './helpers';

const story = () => roro2D();
const SPEED = 70;
const run = (s: EngineState, scene: ReturnType<typeof story>['scenes'][number], secs: number) => {
  let st = s;
  for (let i = 0; i < Math.round(secs * 60); i++) st = step(st, scene, 1 / 60, SPEED);
  return st;
};
const walkTo = (s: EngineState, scene: ReturnType<typeof story>['scenes'][number], x: number) => ({ ...s, x, cameraX: computeCameraX(x, scene.worldWidth!, s.viewportWidth) });

describe('camera (FR-2D-CAM, AC-2D-05)', () => {
  it('follows the avatar when the world is wider than the viewport, and never leaves the world', () => {
    expect(computeCameraX(10, 480, 256)).toBe(0);
    expect(computeCameraX(240, 480, 256)).toBe(112);
    expect(computeCameraX(470, 480, 256)).toBe(224); // clamped to world - viewport
  });
  it('does not move when the world fits the viewport', () => {
    expect(computeCameraX(100, 200, 256)).toBe(0);
    expect(computeCameraX(100, 256, 256)).toBe(0);
  });
  it('stays consistent after a viewport resize (FR-2D-CAM-04)', () => {
    const sc = story().scenes[0];
    let st = walkTo(createEngineState(sc, 256), sc, 300);
    st = resize(st, sc, 180);
    expect(st.cameraX).toBe(computeCameraX(300, 480, 180));
    expect(st.x).toBe(300);
    st = resize(st, sc, 900); // wider than the world
    expect(st.cameraX).toBe(0);
  });
});

describe('movement & bounds (AC-2D-03, AC-2D-04)', () => {
  const sc = story().scenes[0];
  it('moves right while held, stops on release', () => {
    let st = createEngineState(sc, 256);
    const x0 = st.x;
    st = setInput(st, 'right', true);
    st = run(st, sc, 0.5);
    expect(st.x).toBeGreaterThan(x0 + 30);
    expect(st.facing).toBe(1);
    st = setInput(st, 'right', false);
    const xr = st.x;
    st = run(st, sc, 0.5);
    expect(st.x).toBe(xr);
    expect(st.walking).toBe(false);
  });
  it('moves left and faces left', () => {
    let st = walkTo(createEngineState(sc, 256), sc, 200);
    st = run(setInput(st, 'left', true), sc, 0.3);
    expect(st.x).toBeLessThan(200);
    expect(st.facing).toBe(-1);
  });
  it('cannot pass the left or right bound and never errors', () => {
    let st = run(setInput(createEngineState(sc, 256), 'left', true), sc, 5);
    expect(st.x).toBe(sc.movementBounds!.minX);
    expect(st.walking).toBe(false);
    st = run(setInput(setInput(st, 'left', false), 'right', true), sc, 20);
    expect(st.x).toBe(sc.movementBounds!.maxX);
    expect(st.walking).toBe(false);
  });
  it('left+right together cancel out deterministically (FR-2D-CTRL-05)', () => {
    let st = setInput(setInput(createEngineState(sc, 256), 'left', true), 'right', true);
    const x = st.x;
    st = run(st, sc, 1);
    expect(st.x).toBe(x);
  });
  it('a long frame (tab switch) cannot tunnel through targets', () => {
    let st = setInput(createEngineState(sc, 256), 'right', true);
    st = step(st, sc, 5, SPEED);
    expect(st.x - sc.avatarStartX!).toBeLessThanOrEqual(SPEED * 0.1 + 0.0001);
  });
});

describe('target activation & distance validation (AC-2D-06/07/08/10)', () => {
  const sc = story().scenes[0];
  const bandung = sc.interactiveTargets!.find((t) => t.id === 't1-bandung')!;

  it('too far: no event, hint shown, still exploring', () => {
    const st = createEngineState(sc, 256); // x=48, bandung at 140, radius 36
    const r = activateTarget(st, sc, 't1-bandung');
    expect(r.outcome).toBe('too-far');
    expect(r.state.phase).toBe('exploring');
    expect(r.state.activeEventId).toBeNull();
    expect(r.state.hint?.kind).toBe('too-far');
    expect(r.state.hint?.text).toMatch(/Dekati/);
  });
  it('within radius: triggers, pauses movement, ignores further input', () => {
    let st = setInput(createEngineState(sc, 256), 'right', true);
    st = walkTo(st, sc, bandung.positionX - 10);
    const r = activateTarget(st, sc, 't1-bandung');
    expect(r.outcome).toBe('triggered');
    expect(r.state.phase).toBe('event');
    expect(r.state.right).toBe(false);
    expect(setInput(r.state, 'right', true).right).toBe(false);
    const before = r.state.x;
    expect(step({ ...r.state }, sc, 1, SPEED).x).toBe(before);
  });
  it('boundary: exactly at the radius triggers, one pixel beyond does not', () => {
    const st = createEngineState(sc, 256);
    expect(activateTarget(walkTo(st, sc, bandung.positionX - bandung.interactionRadius), sc, 't1-bandung').outcome).toBe('triggered');
    expect(activateTarget(walkTo(st, sc, bandung.positionX - bandung.interactionRadius - 1), sc, 't1-bandung').outcome).toBe('too-far');
  });
  it('decorative objects / unknown ids never trigger and never change state', () => {
    const st = createEngineState(sc, 256);
    const r = activateTarget(st, sc, 'd1-obor-a');
    expect(r.outcome).toBe('ignored-not-a-target');
    expect(r.state).toBe(st);
  });
  it('no double events while one is active (AC-2D-10)', () => {
    const st = walkTo(createEngineState(sc, 256), sc, bandung.positionX);
    const a = activateTarget(st, sc, 't1-bandung');
    const b = activateTarget(a.state, sc, 't1-singgasana');
    expect(b.outcome).toBe('blocked-busy');
    expect(b.state.activeEventId).toBe('e1-bandung');
    const c = activateTarget(a.state, sc, 't1-bandung');
    expect(c.outcome).toBe('blocked-busy');
  });
  it('required events must follow the configured sequence', () => {
    const roro = sc.interactiveTargets!.find((t) => t.id === 't1-roro')!;
    const r = activateTarget(walkTo(createEngineState(sc, 256), sc, roro.positionX), sc, 't1-roro');
    expect(r.outcome).toBe('out-of-order');
    expect(r.state.phase).toBe('exploring');
    expect(r.state.hint?.text).toMatch(/Bandung Bondowoso/);
  });
  it('a target whose event is missing shows a notice and never locks the controls (FR-2D-FB-03)', () => {
    const broken = structuredClone(sc);
    broken.storyEvents = broken.storyEvents!.filter((e) => e.id !== 'e1-bandung');
    const st = walkTo(createEngineState(broken, 256), broken, bandung.positionX);
    const r = activateTarget(st, broken, 't1-bandung');
    expect(r.outcome).toBe('event-missing');
    expect(r.state.phase).toBe('exploring');
    expect(r.state.notice).toBeTruthy();
    expect(setInput(r.state, 'right', true).right).toBe(true);
  });
  it('Escape/dismiss returns control without completing the event', () => {
    const st = walkTo(createEngineState(sc, 256), sc, bandung.positionX);
    const a = activateTarget(st, sc, 't1-bandung').state;
    const d = dismissEvent(a);
    expect(d.phase).toBe('exploring');
    expect(d.completed[1]).toBeUndefined();
  });
});

describe('dialogue, "Lanjut" and linear progression (AC-2D-09/11/18)', () => {
  const s = story();

  function playScene(st: EngineState, sceneNumber: number) {
    const scene = s.scenes[sceneNumber - 1];
    const required = scene.storyEvents!.filter((e) => e.requirement === 'required').sort((a, b) => a.sequence! - b.sequence!);
    let cur = st;
    let last: ReturnType<typeof advanceEvent>['outcome'] | undefined;
    for (const ev of required) {
      const t = scene.interactiveTargets!.find((x) => x.id === ev.triggerTargetId)!;
      cur = walkTo(cur, scene, t.positionX);
      const act = activateTarget(cur, scene, t.id);
      expect(act.outcome).toBe('triggered');
      cur = act.state;
      for (;;) {
        const adv = advanceEvent(cur, s.scenes);
        cur = adv.state;
        last = adv.outcome;
        if (adv.outcome.kind !== 'next-line') break;
      }
    }
    return { st: cur, last: last! };
  }

  it('multi-line events show each part then complete on the last "Lanjut"', () => {
    const scene = s.scenes[1]; // scene 2 bandung event has two lines
    const t = scene.interactiveTargets!.find((x) => x.id === 't2-bandung')!;
    let st = activateTarget(walkTo(createEngineState(scene, 256), scene, t.positionX), scene, t.id).state;
    let r = advanceEvent(st, s.scenes);
    expect(r.outcome.kind).toBe('next-line');
    expect(r.state.lineIndex).toBe(1);
    r = advanceEvent(r.state, s.scenes);
    expect(r.outcome.kind).toBe('scene-complete');
    expect(r.state.sceneNumber).toBe(3);
  });
  it('return-control gives movement back; the event counts once even if replayed (AC-2D-10)', () => {
    const scene = s.scenes[0];
    const t = scene.interactiveTargets!.find((x) => x.id === 't1-bandung')!;
    let st = activateTarget(walkTo(createEngineState(scene, 256), scene, t.positionX), scene, t.id).state;
    let r = advanceEvent(st, s.scenes);
    expect(r.outcome).toEqual({ kind: 'return-control', eventId: 'e1-bandung', firstCompletion: true });
    expect(setInput(r.state, 'right', true).right).toBe(true);
    // activate again (replay)
    st = activateTarget(r.state, scene, t.id).state;
    expect(st.phase).toBe('event');
    r = advanceEvent(st, s.scenes);
    expect(r.outcome).toEqual({ kind: 'return-control', eventId: 'e1-bandung', firstCompletion: false });
    expect(r.state.completed[1]).toEqual(['e1-bandung']);
    expect(sceneProgress(scene, r.state.completed[1]).requiredDone).toBe(1);
  });
  it('next scene is unreachable until all required events are done (AC-2D-11)', () => {
    const scene = s.scenes[0];
    const t = scene.interactiveTargets!.find((x) => x.id === 't1-singgasana')!; // optional cultural
    let st = activateTarget(walkTo(createEngineState(scene, 256), scene, t.positionX), scene, t.id).state;
    const r = advanceEvent(st, s.scenes);
    expect(r.outcome.kind).toBe('return-control');
    expect(r.state.sceneNumber).toBe(1);
  });
  it('plays the whole story from scene 1 to the end and completes it (AC-2D-18)', () => {
    let st = createEngineState(s.scenes[0], 256);
    const visited: number[] = [1];
    for (let n = 1; n <= s.scenes.length; n++) {
      const { st: after, last } = playScene(st, n);
      st = after;
      if (n < s.scenes.length) {
        expect(last.kind).toBe('scene-complete');
        expect(st.sceneNumber).toBe(n + 1);
        expect(st.x).toBe(s.scenes[n].avatarStartX); // placed at the new scene's start (FR-2D-TRN-03)
        visited.push(st.sceneNumber);
      } else {
        expect(last.kind).toBe('story-complete');
        expect(st.phase).toBe('story-complete');
      }
    }
    expect(visited).toEqual([1, 2, 3, 4]);
  });
  it('invalid next scene: user stays put, gets a notice and keeps control (FR-2D-FB-04, AC-2D-16)', () => {
    const broken = structuredClone(s);
    broken.scenes = broken.scenes.filter((x) => x.sceneNumber !== 3); // scene 2 -> next 3 now missing
    const scene = broken.scenes[1];
    const t = scene.interactiveTargets!.find((x) => x.id === 't2-bandung')!;
    let st = activateTarget(walkTo(createEngineState(scene, 256), scene, t.positionX), scene, t.id).state;
    st = advanceEvent(st, broken.scenes).state;
    const r = advanceEvent(st, broken.scenes);
    expect(r.outcome.kind).toBe('transition-failed');
    expect(r.state.sceneNumber).toBe(2);
    expect(r.state.phase).toBe('exploring');
    expect(r.state.notice).toMatch(/pembaca standar/);
    expect(setInput(r.state, 'left', true).left).toBe(true);
  });
  it('Lanjut with no active event is a no-op', () => {
    const st = createEngineState(s.scenes[0], 256);
    expect(advanceEvent(st, s.scenes).outcome.kind).toBe('noop');
  });
});
