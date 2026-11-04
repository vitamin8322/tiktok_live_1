import type { CommentEvent, Devotee } from '../types/temple';
import type { Scoreboard } from './quizGame';

export const COMMENT_VISIBLE_MS = 8000;
const MAX_PEOPLE = 30;
const RESERVED_TOP = 10;

export interface ClassroomPerson {
  username: string;
  name: string;
  avatar?: string;
  score: number;
  lastComment?: CommentEvent;
}

/** Keep top scorers visible, then make room for recently active commenters. */
export function selectClassroomPeople(devotees: Devotee[], comments: CommentEvent[], scores: Scoreboard, now: number): ClassroomPerson[] {
  const byUser = new Map<string, ClassroomPerson>();
  const keyOf = (username: string) => username.trim().toLowerCase();
  for (const d of devotees) {
    const key = keyOf(d.username);
    if (key && !byUser.has(key)) byUser.set(key, { username: d.username, name: d.displayName, avatar: d.avatarUrl, score: 0 });
  }
  for (const c of comments) {
    const key = keyOf(c.username);
    if (!key) continue;
    const person = byUser.get(key) ?? { username: c.username, name: c.displayName, score: 0 };
    if (!person.lastComment || c.timestamp >= person.lastComment.timestamp) {
      person.lastComment = c;
      person.name = c.displayName || person.name;
      person.avatar = c.avatarUrl || person.avatar;
    }
    byUser.set(key, person);
  }
  for (const [key, score] of Object.entries(scores)) {
    const person = byUser.get(key) ?? { username: score.username, name: score.name, score: 0 };
    person.score = score.score;
    byUser.set(key, person);
  }

  const candidates = [...byUser.values()];
  const top = candidates.filter((p) => p.score > 0).sort((a, b) => b.score - a.score || keyOf(a.username).localeCompare(keyOf(b.username))).slice(0, RESERVED_TOP);
  const selected = new Set(top.map((p) => keyOf(p.username)));
  const others = candidates.filter((p) => !selected.has(keyOf(p.username))).sort((a, b) => {
    const recentA = a.lastComment && now - a.lastComment.timestamp < COMMENT_VISIBLE_MS ? a.lastComment.timestamp : 0;
    const recentB = b.lastComment && now - b.lastComment.timestamp < COMMENT_VISIBLE_MS ? b.lastComment.timestamp : 0;
    return Number(Boolean(recentB)) - Number(Boolean(recentA)) || b.score - a.score || recentB - recentA;
  });
  return [...top, ...others].slice(0, MAX_PEOPLE);
}
