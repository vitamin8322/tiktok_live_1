import type { Choice } from '../data/quizQuestions';

export interface PlayerScore { username: string; name: string; score: number; streak: number; correct: number }
export interface QuizAnswer { username: string; name: string; choice: Choice }
export type Scoreboard = Record<string, PlayerScore>;
export const QUIZ_CHOICES: Choice[] = ['A', 'B', 'C', 'D'];

export function recordAnswer(answers: Record<string, QuizAnswer>, username: string, name: string, text: string): Record<string, QuizAnswer> {
  const choice = text.trim().toUpperCase() as Choice;
  if (!QUIZ_CHOICES.includes(choice) || !username.trim()) return answers;
  return { ...answers, [username.trim().toLowerCase()]: { username, name, choice } };
}

// A missed or wrong answer breaks the consecutive-correct streak.
export function scoreRound(scores: Scoreboard, answers: Record<string, QuizAnswer>, correct: Choice, doublePoints: boolean): Scoreboard {
  const next: Scoreboard = {};
  for (const [key, player] of Object.entries(scores)) next[key] = { ...player, streak: 0 };
  for (const [key, answer] of Object.entries(answers)) {
    const previous = scores[key] ?? { username: answer.username, name: answer.name, score: 0, streak: 0, correct: 0 };
    const right = answer.choice === correct;
    const streak = right ? previous.streak + 1 : 0;
    const points = right ? 10 * (doublePoints ? 2 : 1) + (streak > 0 && streak % 3 === 0 ? 5 : 0) : 0;
    next[key] = { ...previous, name: answer.name, score: previous.score + points, streak, correct: previous.correct + (right ? 1 : 0) };
  }
  return next;
}

export function topPlayers(scores: Scoreboard): PlayerScore[] {
  return Object.values(scores).sort((a, b) => b.score - a.score || b.correct - a.correct || a.username.localeCompare(b.username));
}
