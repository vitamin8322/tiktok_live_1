import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { ENGLISH_QUESTIONS } from '../data/englishQuestions';
import { questionNarration, resultNarration, splitQuestion } from './quizNarration';

test('mixed Vietnamese question and quoted English use the right voice', () => {
  const segments = splitQuestion('“Apple” nghĩa là gì?');
  assert.deepEqual(segments, [{ language: 'en', text: 'Apple' }, { language: 'vi', text: 'nghĩa là gì?' }]);
  assert.deepEqual(splitQuestion('Đáp lại “Thank you” thế nào?'), [
    { language: 'vi', text: 'Đáp lại' }, { language: 'en', text: 'Thank you' }, { language: 'vi', text: 'thế nào?' },
  ]);
  assert.equal(splitQuestion('Muốn nói “Tôi không hiểu”, bạn nói gì?')[1].language, 'vi');
});

test('grammar questions, options and explanations use English and Vietnamese voices', () => {
  const q = ENGLISH_QUESTIONS.find((item) => item.question === 'I ___ a student.')!;
  const parts = questionNarration(q, 0, false);
  assert.ok(parts.some((p) => p.language === 'en' && p.text === 'I blank a student.'));
  assert.ok(parts.some((p) => p.language === 'en' && p.text === 'am'));
  const result = resultNarration(q, 'Chúc mừng cả lớp!');
  assert.ok(result.some((p) => p.language === 'en' && p.text.toLowerCase() === 'am'));
  assert.equal(result.at(-1)?.language, 'vi');
});

test('all English questions produce non-empty segments for each answer and result', () => {
  for (const q of ENGLISH_QUESTIONS) {
    const intro = questionNarration(q, 1, false);
    const result = resultNarration(q, '');
    assert.ok(intro.every((p) => p.text.trim()));
    assert.ok(result.every((p) => p.text.trim()));
    assert.equal(intro.filter((p) => p.language === 'vi' && /^Đáp án [ABCD]\.$/.test(p.text)).length, 4);
    assert.ok(intro.some((p) => p.language === 'en'));
  }
});
