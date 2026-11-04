import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { classroomSounds } from './classroomSounds';

test('classroom cues use their own notes and respect the effects switch', () => {
  let oscillators = 0;
  const scheduled: number[] = [];
  class FakeAudioContext {
    state = 'running';
    currentTime = 0;
    destination = {};
    createOscillator() {
      oscillators++;
      return { type: '', frequency: { setValueAtTime: (n: number) => scheduled.push(n) }, connect() {}, disconnect() {}, start() {}, stop() {}, onended: null };
    }
    createGain() {
      return { gain: { setValueAtTime() {}, exponentialRampToValueAtTime() {} }, connect() {}, disconnect() {} };
    }
    close() { return Promise.resolve(); }
  }
  const oldWindow = globalThis.window;
  const oldNow = Date.now;
  let now = 100_000;
  Date.now = () => now;
  Object.defineProperty(globalThis, 'window', { value: { AudioContext: FakeAudioContext }, configurable: true });
  try {
    classroomSounds.configure(true, 0.5);
    classroomSounds.unlock();
    classroomSounds.play('question');
    assert.deepEqual(scheduled, [523.25, 659.25, 783.99]);
    classroomSounds.play('question');
    assert.equal(oscillators, 3, 'repeated events are rate-limited');
    classroomSounds.configure(false, 0.5);
    classroomSounds.play('gift');
    assert.equal(oscillators, 3, 'muting stops new effects');
    classroomSounds.configure(true, 0.5);
    classroomSounds.play('gift');
    assert.equal(oscillators, 6);
    classroomSounds.play('tick');
    now += 1000;
    classroomSounds.play('tick');
    assert.equal(oscillators, 8, 'countdown ticks can play once per second');
    classroomSounds.play('tick');
    assert.equal(oscillators, 8, 'duplicate ticks are rate-limited');
  } finally {
    Date.now = oldNow;
    classroomSounds.dispose();
    Object.defineProperty(globalThis, 'window', { value: oldWindow, configurable: true });
  }
});

test('countdown track follows mute, volume, resume and stop', () => {
  const oldWindow = globalThis.window;
  const oldAudio = globalThis.Audio;
  const oldNow = Date.now;
  let now = 200_000;
  Date.now = () => now;
  const created: FakeAudio[] = [];
  class FakeAudio {
    paused = true;
    currentTime = 0;
    loop = false;
    volume = 1;
    constructor(public src: string) { created.push(this); }
    play() { this.paused = false; return Promise.resolve(); }
    pause() { this.paused = true; }
  }
  class FakeAudioContext { state = 'running'; close() { return Promise.resolve(); } }
  Object.defineProperty(globalThis, 'window', { value: { AudioContext: FakeAudioContext }, configurable: true });
  Object.defineProperty(globalThis, 'Audio', { value: FakeAudio, configurable: true });
  try {
    classroomSounds.configure(true, 0.4);
    classroomSounds.unlock();
    classroomSounds.startCountdown(now + 15_000);
    assert.equal(created[0].src, '/assets/audio/countdown.mp3');
    assert.equal(created[0].volume, 0.4);
    assert.equal(created[0].paused, false);
    classroomSounds.configure(false, 0.4);
    assert.equal(created[0].paused, true);
    now += 5000;
    classroomSounds.configure(true, 0.8);
    assert.equal(created[0].currentTime, 5);
    assert.equal(created[0].volume, 0.8);
    assert.equal(created[0].paused, false);
    classroomSounds.stopCountdown();
    assert.equal(created[0].paused, true);
    assert.equal(created[0].currentTime, 0);
  } finally {
    classroomSounds.dispose();
    Date.now = oldNow;
    Object.defineProperty(globalThis, 'window', { value: oldWindow, configurable: true });
    Object.defineProperty(globalThis, 'Audio', { value: oldAudio, configurable: true });
  }
});
