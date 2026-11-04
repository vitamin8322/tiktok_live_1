import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { QUIZ_QUESTIONS } from '../data/quizQuestions';
import { ENGLISH_QUESTIONS } from '../data/englishQuestions';
import { recordAnswer, scoreRound, topPlayers } from './quizGame';

test('answer changes use the last valid choice and usernames are case-insensitive', () => {
  let answers = recordAnswer({}, 'Alice', 'Alice', ' a ');
  answers = recordAnswer(answers, 'ALICE', 'Alice', 'd');
  answers = recordAnswer(answers, 'alice', 'Alice', 'hello');
  assert.equal(Object.keys(answers).length, 1);
  assert.equal(answers.alice.choice, 'D');
});

test('English question bank has 100 distinct questions with balanced answer positions', () => {
  assert.equal(ENGLISH_QUESTIONS.length, 100);
  assert.equal(new Set(ENGLISH_QUESTIONS.map((q) => q.question)).size, 100);
  const counts = { A: 0, B: 0, C: 0, D: 0 };
  for (const q of ENGLISH_QUESTIONS) {
    assert.equal(q.answers.length, 4);
    assert.equal(new Set(q.answers).size, 4);
    assert.ok(q.answers.every(Boolean));
    assert.ok(q.explanation);
    counts[q.correct]++;
  }
  assert.deepEqual(counts, { A: 25, B: 25, C: 25, D: 25 });
});

test('scoring rewards streaks, bonus questions and resets streaks for wrong or missed answers', () => {
  const answer = recordAnswer({}, 'Alice', 'Alice', 'A');
  let scores = scoreRound({}, answer, 'A', false);
  scores = scoreRound(scores, answer, 'A', false);
  scores = scoreRound(scores, answer, 'A', true);
  assert.equal(scores.alice.score, 45);
  assert.equal(scores.alice.streak, 3);
  scores = scoreRound(scores, {}, 'A', false);
  assert.equal(scores.alice.streak, 0);
  scores = scoreRound(scores, answer, 'B', false);
  assert.equal(scores.alice.score, 45);
  assert.equal(scores.alice.streak, 0);
  assert.equal(topPlayers(scores)[0].username, 'Alice');
});

test('question bank contains valid choices and multiple subjects', () => {
  assert.ok(QUIZ_QUESTIONS.length >= 30);
  assert.ok(new Set(QUIZ_QUESTIONS.map((q) => q.topic)).size >= 5);
  for (const q of QUIZ_QUESTIONS) {
    assert.equal(q.answers.length, 4);
    assert.equal(new Set(q.answers).size, 4);
    assert.ok(['A', 'B', 'C', 'D'].includes(q.correct));
    assert.ok(q.question && q.explanation);
  }
});
