import React, { useEffect, useMemo, useState } from 'react';
import type { CommentEvent, Devotee, GiftEvent, LeaderboardEntry, StreamConfig } from '../types/temple';

const QUESTIONS = [
  { question: '2 mũ 10 bằng bao nhiêu?', answers: ['100', '512', '2048', '1024'], correct: 'D' },
  { question: 'Hành tinh nào gần Mặt Trời nhất?', answers: ['Sao Thủy', 'Sao Hỏa', 'Trái Đất', 'Sao Kim'], correct: 'A' },
  { question: 'Một giờ có bao nhiêu phút?', answers: ['30', '60', '90', '100'], correct: 'B' },
  { question: 'Thủ đô của Việt Nam là gì?', answers: ['Đà Nẵng', 'Huế', 'Hà Nội', 'Hải Phòng'], correct: 'C' },
];
const LETTERS = ['A', 'B', 'C', 'D'];
const COLORS = ['#f4a62a', '#3c9acf', '#ec6a63', '#8f72cf', '#50b884', '#eb925c'];

interface Props {
  [key: string]: unknown;
  config: StreamConfig;
  devotees: Devotee[];
  comments: CommentEvent[];
  currentGift: GiftEvent | null;
  leaderboardDonors: LeaderboardEntry[];
  likeProgress?: number;
}

export function ClassroomQuizStage({ config, devotees, comments, currentGift, leaderboardDonors, likeProgress = 0 }: Props) {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [seconds, setSeconds] = useState(15);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [lastRoundCount, setLastRoundCount] = useState<number | null>(null);
  const [roundStarted, setRoundStarted] = useState(() => Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => setSeconds((s) => Math.max(0, s - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [questionIndex]);

  useEffect(() => {
    if (seconds !== 0) return;
    const timer = window.setTimeout(() => {
      setLastRoundCount(Object.keys(answers).length);
      setAnswers({});
      setRoundStarted(Date.now());
      setSeconds(15);
      setQuestionIndex((n) => n + 1);
    }, 2000);
    return () => window.clearTimeout(timer);
  }, [seconds, answers]);

  useEffect(() => {
    if (seconds === 0) return;
    const next: Record<string, string> = {};
    for (const comment of comments) {
      if (comment.timestamp < roundStarted) continue;
      const choice = comment.comment.trim().toUpperCase();
      if (LETTERS.includes(choice)) next[comment.username.toLowerCase()] = choice;
    }
    setAnswers(next);
  }, [comments, roundStarted, seconds === 0]);

  const people = useMemo(() => {
    const seen = new Set<string>();
    return [...devotees.map((d) => ({ name: d.displayName, username: d.username, avatar: d.avatarUrl })),
      ...[...comments].reverse().map((c) => ({ name: c.displayName, username: c.username, avatar: undefined }))]
      .filter((p) => { const key = p.username.toLowerCase(); if (seen.has(key)) return false; seen.add(key); return true; })
      .slice(0, 30);
  }, [devotees, comments]);
  const question = QUESTIONS[questionIndex % QUESTIONS.length];

  return (
    <div className="quiz-stage relative mx-auto w-full max-w-[430px] aspect-[9/16] overflow-hidden rounded-2xl select-none text-[#103e43]">
      <div className="quiz-header">
        <div className="quiz-kicker">✦ KHÔNG GIAN HỌC HỎI ✦</div>
        <div className="quiz-title">LỚP HỌC VUI VẺ</div>
        <div className="quiz-channel">{config.channelName} · Cùng nhau khám phá mỗi ngày</div>
      </div>
      <section className="quiz-card">
        <div className="quiz-subject"><span>TOÁN VUI &amp; KIẾN THỨC</span><span className="quiz-clock"><i style={{ width: `${seconds / 15 * 100}%` }} /> </span><b>{seconds}s</b></div>
        <div className="quiz-round">CÂU {questionIndex + 1} · CÙNG NHAU TRẢ LỜI</div>
        <h2>{question.question}</h2>
        <div className="quiz-options">{question.answers.map((answer, i) => (
          <div key={answer} className={`quiz-option ${seconds === 0 && LETTERS[i] === question.correct ? 'quiz-correct' : ''}`}><b>{LETTERS[i]}</b><span>{answer}</span></div>
        ))}</div>
        <div className="quiz-instruction">BÌNH LUẬN A / B / C / D ĐỂ TRẢ LỜI</div>
        <div className="quiz-result">{seconds === 0 ? `Đáp án đúng: ${question.correct}` : lastRoundCount === null ? `${Object.keys(answers).length} bạn đã trả lời` : `Vừa rồi · ${lastRoundCount} bạn đã trả lời`}</div>
      </section>
      <div className="quiz-like">♥ {likeProgress}/666 tim · Cùng thả tim cổ vũ lớp học!</div>
      <div className="quiz-banner">{currentGift ? <>🎉 {currentGift.displayName || currentGift.username} gửi {currentGift.giftName}</> : <>🎒 Cùng học, cùng vui mỗi ngày!<small>Bình luận để tham gia lớp</small></>}</div>
      <div className="quiz-classroom">
        <div className="quiz-aisle" />
        <div className="quiz-students">{Array.from({ length: 30 }, (_, i) => {
          const person = people[i];
          return <div className="quiz-student" key={person?.username || `empty-${i}`} style={{ animationDelay: `${(i % 7) * -0.28}s` }}>
            <div className="quiz-avatar" style={{ backgroundColor: COLORS[i % COLORS.length] }}>{person?.avatar ? <img src={person.avatar} alt="" referrerPolicy="no-referrer" /> : <><span className="quiz-hair" /><span className="quiz-face">•ᴗ•</span><span className="quiz-shirt" /></>}</div>
            <div className="quiz-name">{person?.name || 'Chờ học viên'}</div>
            <div className="quiz-answer">{person && answers[person.username.toLowerCase()] ? `Đã chọn ${answers[person.username.toLowerCase()]}` : person ? '✦ Có mặt' : '· · ·'}</div>
          </div>;
        })}</div>
      </div>
      <div className="quiz-footer"><span>🎓 {people.length} học viên</span><span>🏆 {leaderboardDonors[0]?.displayName || 'Cùng học thật vui'}</span></div>
    </div>
  );
}
