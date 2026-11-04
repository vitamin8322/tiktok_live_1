import type { QuizQuestion } from '../data/quizQuestions';
import { QUIZ_CHOICES } from './quizGame';

export type SpeechSegment = { language: 'vi' | 'en'; text: string };
const hasVietnamese = (text: string) => /[\u00c0-\u1ef9]/u.test(text);

function push(segments: SpeechSegment[], language: SpeechSegment['language'], text: string) {
  const clean = text.trim();
  if (clean && /[\p{L}\p{N}]/u.test(clean)) segments.push({ language, text: clean.replace(/_{2,}/g, 'blank') });
}

/** Quoted English in Vietnamese questions is spoken in English. */
export function splitQuestion(text: string): SpeechSegment[] {
  if (!hasVietnamese(text)) return [{ language: 'en', text: text.replace(/_{2,}/g, 'blank') }];
  const result: SpeechSegment[] = [];
  let previous = 0;
  for (const match of text.matchAll(/[“"]([^”"]+)[”"]/gu)) {
    push(result, 'vi', text.slice(previous, match.index));
    push(result, hasVietnamese(match[1]) ? 'vi' : 'en', match[1]);
    previous = (match.index ?? 0) + match[0].length;
  }
  push(result, 'vi', text.slice(previous));
  return result;
}

function englishTerms(question: QuizQuestion): string[] {
  const english = [...question.answers.filter((answer) => !hasVietnamese(answer)), ...splitQuestion(question.question).filter((part) => part.language === 'en').map((part) => part.text)];
  return [...new Set(english.flatMap((text) => text.match(/[A-Za-z]+(?:['’][A-Za-z]+)*/g) ?? []).map((word) => word.toLowerCase()))].sort((a, b) => b.length - a.length);
}

/** Highlight English vocabulary that also appears in the question or answers. */
export function splitExplanation(question: QuizQuestion): SpeechSegment[] {
  const terms = englishTerms(question);
  if (!terms.length) return [{ language: 'vi', text: question.explanation }];
  const pattern = new RegExp(`(?<![\\p{L}\\p{N}])(?:${terms.join('|')})(?![\\p{L}\\p{N}])`, 'giu');
  const parts: SpeechSegment[] = [];
  let previous = 0;
  for (const match of question.explanation.matchAll(pattern)) {
    push(parts, 'vi', question.explanation.slice(previous, match.index));
    push(parts, 'en', match[0]);
    previous = (match.index ?? 0) + match[0].length;
  }
  push(parts, 'vi', question.explanation.slice(previous));
  return parts;
}

export function questionNarration(question: QuizQuestion, index: number, bonus: boolean): SpeechSegment[] {
  const segments: SpeechSegment[] = [{ language: 'vi', text: `${index === 0 ? 'Chào cả lớp! Chúng ta cùng thử tài nhé. ' : ''}${bonus ? 'Câu thưởng nhân đôi điểm! ' : ''}Câu hỏi ${index + 1}:` }, ...splitQuestion(question.question)];
  question.answers.forEach((answer, i) => {
    segments.push({ language: 'vi', text: `Đáp án ${QUIZ_CHOICES[i]}.` });
    segments.push({ language: hasVietnamese(answer) || /^\d+$/.test(answer) ? 'vi' : 'en', text: answer });
  });
  return segments;
}

export function resultNarration(question: QuizQuestion, ending: string): SpeechSegment[] {
  const answer = question.answers[QUIZ_CHOICES.indexOf(question.correct)];
  return [
    { language: 'vi', text: `Đáp án đúng là ${question.correct}.` },
    { language: hasVietnamese(answer) || /^\d+$/.test(answer) ? 'vi' : 'en', text: answer },
    ...splitExplanation(question),
    ...(ending.trim() ? [{ language: 'vi' as const, text: ending.trim() }] : []),
  ];
}
