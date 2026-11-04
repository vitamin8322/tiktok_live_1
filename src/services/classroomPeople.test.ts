import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import type { CommentEvent, Devotee } from '../types/temple';
import { COMMENT_VISIBLE_MS, selectClassroomPeople } from './classroomPeople';
import type { Scoreboard } from './quizGame';

const now = 100_000;
const comment = (username: string, timestamp: number, text = 'Xin chào'): CommentEvent => ({ id: `${username}-${timestamp}`, username, displayName: username, comment: text, timestamp });
const devotee = (username: string): Devotee => ({ id: username, username, displayName: username, robeColor: '', joinedAt: 0, bowOffset: 0 });

test('top scorers and recent commenters displace inactive people in a full classroom', () => {
  const devotees = Array.from({ length: 35 }, (_, i) => devotee(`viewer${i}`));
  const scores: Scoreboard = { winner: { username: 'Winner', name: 'Winner', score: 100, streak: 0, correct: 10 } };
  const people = selectClassroomPeople(devotees, [comment('Latecomer', now)], scores, now);
  assert.equal(people.length, 30);
  assert.equal(people[0].username, 'Winner');
  assert.equal(people[1].username, 'Latecomer');
  assert.ok(!people.some((p) => p.username === 'viewer34'));
});

test('latest comment and avatar win without duplicate usernames, and expired comments lose priority', () => {
  const comments = [comment('Alice', now - COMMENT_VISIBLE_MS - 1, 'old'), { ...comment('ALICE', now - 100, 'new'), avatarUrl: 'avatar' }];
  const people = selectClassroomPeople([devotee('alice'), devotee('bob')], comments, {}, now);
  assert.equal(people.length, 2);
  assert.equal(people[0].lastComment?.comment, 'new');
  assert.equal(people[0].avatar, 'avatar');
  const expired = selectClassroomPeople([devotee('bob'), devotee('alice')], comments, {}, now + COMMENT_VISIBLE_MS);
  assert.equal(expired[0].username, 'bob');
});
