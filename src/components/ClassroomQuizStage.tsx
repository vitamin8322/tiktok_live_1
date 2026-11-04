import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { CommentEvent, Devotee, GiftEvent, StreamConfig } from '../types/temple';
import { ENGLISH_QUESTIONS as QUIZ_QUESTIONS } from '../data/englishQuestions';
import { QUIZ_CHOICES, recordAnswer, scoreRound, topPlayers, type QuizAnswer, type Scoreboard } from '../services/quizGame';
import { formatUsernameForTts } from '../services/ttsNames';
import { classroomSounds } from '../services/classroomSounds';
import { COMMENT_VISIBLE_MS, selectClassroomPeople } from '../services/classroomPeople';
import { questionNarration, resultNarration, type SpeechSegment } from '../services/quizNarration';

const COLORS = ['#f4a62a', '#3c9acf', '#ec6a63', '#8f72cf', '#50b884', '#eb925c'];
const ROUND_LENGTH = 10;
type Phase = 'reading' | 'answering' | 'result';
interface Props {
  [key: string]: unknown;
  config: StreamConfig;
  devotees: Devotee[];
  comments: CommentEvent[];
  currentGift: GiftEvent | null;
  likeProgress?: number;
  rainUntil?: number;
  demo?: boolean;
  onDemoAnswer?: (choice: string) => void;
}

export function ClassroomQuizStage({ config, devotees, comments, currentGift, likeProgress = 0, rainUntil = 0, demo, onDemoAnswer }: Props) {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>('reading');
  const [seconds, setSeconds] = useState(15);
  const [answers, setAnswers] = useState<Record<string, QuizAnswer>>({});
  const [scores, setScores] = useState<Scoreboard>({});
  const [lastCount, setLastCount] = useState(0);
  const [roundWinners, setRoundWinners] = useState<ReturnType<typeof topPlayers>>([]);
  const [raining, setRaining] = useState(false);
  const [commentClock, setCommentClock] = useState(0);
  useEffect(() => {
    const remaining = rainUntil - Date.now();
    setRaining(remaining > 0);
    if (remaining > 0) classroomSounds.play('celebrate');
    if (remaining <= 0) return;
    const timer = setTimeout(() => setRaining(false), remaining);
    return () => clearTimeout(timer);
  }, [rainUntil]);
  const question = QUIZ_QUESTIONS[questionIndex % QUIZ_QUESTIONS.length];
  const doublePoints = (questionIndex + 1) % 5 === 0;
  const answersRef = useRef(answers);
  const scoresRef = useRef(scores);
  const settingsRef = useRef(config);
  settingsRef.current = config;
  const phaseRef = useRef<Phase>('reading');
  const answerStartRef = useRef(Date.now());
  const answerDeadlineRef = useRef(Number.POSITIVE_INFINITY);
  const processedRef = useRef(new Set<string>());
  const greetedRef = useRef(new Set<string>());
  const welcomeQueueRef = useRef<string[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const cancelSpeechRef = useRef<(() => void) | null>(null);

  // Each stage owns its game and narration. The dashboard is silent by default.
  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let tick: ReturnType<typeof setInterval> | undefined;
    let warned = false;
    const setCurrentPhase = (next: Phase) => { phaseRef.current = next; setPhase(next); };
    const speak = async (input: string | SpeechSegment[]): Promise<void> => {
      if (!settingsRef.current.autoTts) return;
      const segments: SpeechSegment[] = typeof input === 'string' ? [{ language: 'vi', text: input }] : input;
      let stopped = false;
      let finishCurrent: (() => void) | undefined;
      const cancel = () => { stopped = true; audioRef.current?.pause(); finishCurrent?.(); };
      cancelSpeechRef.current?.();
      cancelSpeechRef.current = cancel;
      for (const segment of segments) {
        if (stopped || cancelled || !settingsRef.current.autoTts) break;
        await new Promise<void>((resolve) => {
          const voice = segment.language === 'en' ? 'english' : 'classroom';
          const audio = new Audio(`/api/tts?voice=${voice}&rate=${settingsRef.current.ttsSpeed}&text=${encodeURIComponent(segment.text)}`);
          audio.volume = settingsRef.current.ttsVolume;
          audioRef.current = audio;
          let finished = false;
          const finish = () => {
            if (finished) return;
            finished = true;
            clearTimeout(timeout);
            if (audioRef.current === audio) audioRef.current = null;
            finishCurrent = undefined;
            resolve();
          };
          const timeout = setTimeout(() => { audio.pause(); finish(); }, 30000);
          finishCurrent = finish;
          audio.onended = finish;
          audio.onerror = finish;
          audio.play().catch(finish);
        });
      }
      if (cancelSpeechRef.current === cancel) cancelSpeechRef.current = null;
    };
    const start = async () => {
      setCurrentPhase('reading');
      classroomSounds.play('question');
      setSeconds(15);
      answersRef.current = {};
      setAnswers({});
      processedRef.current.clear();
      answerStartRef.current = Date.now();
      answerDeadlineRef.current = Number.POSITIVE_INFINITY;
      await speak(questionNarration(question, questionIndex, doublePoints));
      if (cancelled) return;
      setCurrentPhase('answering');
      const deadline = Date.now() + 15000;
      answerDeadlineRef.current = deadline;
      classroomSounds.startCountdown(deadline);
      tick = setInterval(() => {
        const left = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
        setSeconds(left);
        if (left <= 5 && left > 0 && !warned) {
          warned = true;
          classroomSounds.play('countdown');
          void speak('Còn năm giây, các bạn chốt đáp án nhé!');
        }
        if (left > 0) return;
        clearInterval(tick);
        classroomSounds.stopCountdown();
        cancelSpeechRef.current?.();
        setCurrentPhase('result');
        classroomSounds.play('answer');
        const finalAnswers = answersRef.current;
        const nextScores = scoreRound(scoresRef.current, finalAnswers, question.correct, doublePoints);
        scoresRef.current = nextScores;
        setScores(nextScores);
        setLastCount(Object.keys(finalAnswers).length);
        const winners = (questionIndex + 1) % ROUND_LENGTH === 0 ? topPlayers(nextScores).slice(0, 3) : [];
        setRoundWinners(winners);
        const winnerText = winners.length ? ` Kết thúc vòng, dẫn đầu là ${formatUsernameForTts(winners[0].name)} với ${winners[0].score} điểm!` : '';
        const noAnswers = Object.keys(finalAnswers).length === 0 ? ' Các bạn mới vào cứ thử trả lời nhé!' : '';
        const streakPlayer = Object.values(nextScores).find((p) => p.streak > 0 && p.streak % 3 === 0 && finalAnswers[p.username.toLowerCase()]?.choice === question.correct);
        const praise = streakPlayer ? ` ${formatUsernameForTts(streakPlayer.name)} đã trả lời đúng ${streakPlayer.streak} câu liên tiếp!` : '';
        const welcomeNames = welcomeQueueRef.current.splice(0, 3).map(formatUsernameForTts);
        const welcome = welcomeNames.length ? ` Chào mừng ${welcomeNames.join(', ')} đến với lớp học!` : '';
        void speak(resultNarration(question, `${praise}${winnerText}${noAnswers}${welcome}`)).then(() => {
          if (cancelled) return;
          timer = setTimeout(() => {
            if ((questionIndex + 1) % ROUND_LENGTH === 0) { scoresRef.current = {}; setScores({}); }
            setRoundWinners([]);
            setQuestionIndex((n) => n + 1);
          }, 4000);
        });
      }, 250);
    };
    void start();
    return () => { cancelled = true; clearTimeout(timer); clearInterval(tick); classroomSounds.stopCountdown(); cancelSpeechRef.current?.(); };
  }, [questionIndex]);

  useEffect(() => {
    if (!config.autoTts) cancelSpeechRef.current?.();
    if (audioRef.current) audioRef.current.volume = config.ttsVolume;
  }, [config.autoTts, config.ttsVolume]);

  useEffect(() => {
    if (phaseRef.current === 'result') return;
    let next = answersRef.current;
    for (const comment of comments) {
      if (processedRef.current.has(comment.id)) continue;
      processedRef.current.add(comment.id);
      if (comment.timestamp < answerStartRef.current || comment.timestamp >= answerDeadlineRef.current) continue;
      const playerKey = comment.username.toLowerCase();
      if (!greetedRef.current.has(playerKey)) {
        greetedRef.current.add(playerKey);
        welcomeQueueRef.current.push(comment.displayName);
        welcomeQueueRef.current = welcomeQueueRef.current.slice(-20);
      }
      next = recordAnswer(next, comment.username, comment.displayName, comment.comment);
    }
    if (next !== answersRef.current) { answersRef.current = next; setAnswers(next); }
  }, [comments, questionIndex]);

  const people = useMemo(() => selectClassroomPeople(devotees, comments, scores, Date.now()), [devotees, comments, scores, commentClock]);
  useEffect(() => {
    const now = Date.now();
    const nextExpiry = people.reduce((earliest, p) => {
      const expiry = (p.lastComment?.timestamp ?? 0) + COMMENT_VISIBLE_MS;
      return expiry > now ? Math.min(earliest, expiry) : earliest;
    }, Infinity);
    if (!Number.isFinite(nextExpiry)) return;
    const timer = setTimeout(() => setCommentClock((n) => n + 1), Math.max(1, nextExpiry - now));
    return () => clearTimeout(timer);
  }, [people]);
  const leaders = topPlayers(scores).slice(0, 3);

  return (
    <div className="quiz-stage relative mx-auto w-full max-w-[430px] aspect-[9/16] overflow-hidden rounded-2xl select-none text-[#103e43]">
      <div className="quiz-header"><div className="quiz-kicker">✦ KHÔNG GIAN HỌC HỎI ✦</div><div className="quiz-title">LỚP HỌC VUI VẺ</div><div className="quiz-channel">{config.channelName} · Cùng nhau khám phá mỗi ngày</div></div>
      <section className="quiz-card">
        <div className="quiz-subject">
          <span>{question.topic.toUpperCase()}</span>
          <span className={`quiz-clock ${phase === 'answering' ? 'quiz-clock-running' : ''} ${phase === 'answering' && seconds <= 5 ? 'quiz-clock-urgent' : ''}`} aria-hidden="true">
            <i style={{ width: `${seconds / 15 * 100}%` }} />
          </span>
          <b key={`${phase}-${seconds}`} className={phase === 'answering' ? `quiz-clock-number ${seconds <= 5 ? 'quiz-clock-number-urgent' : ''}` : ''} aria-label={phase === 'reading' ? 'Đang đọc câu hỏi' : `Còn ${seconds} giây`}>
            {phase === 'reading' ? 'Đang đọc' : `${seconds}s`}
          </b>
        </div>
        <div className="quiz-round">VÒNG {Math.floor(questionIndex / ROUND_LENGTH) + 1} · CÂU {questionIndex % ROUND_LENGTH + 1}/{ROUND_LENGTH}{doublePoints ? ' · NHÂN ĐÔI ĐIỂM' : ''}</div>
        <h2>{question.question}</h2>
        <div className="quiz-options">{question.answers.map((answer, i) => <div key={answer} className={`quiz-option ${phase === 'result' && QUIZ_CHOICES[i] === question.correct ? 'quiz-correct' : ''}`}><b>{QUIZ_CHOICES[i]}</b><span>{answer}</span></div>)}</div>
        <div className="quiz-instruction">BÌNH LUẬN A / B / C / D ĐỂ TRẢ LỜI</div>
        <div className="quiz-result">{phase === 'result' ? `Đáp án ${question.correct} · ${lastCount} bạn trả lời` : `${Object.keys(answers).length} bạn đã trả lời · Có thể đổi đáp án`}</div>
      </section>
      <div className="quiz-like">{raining ? '🎉 Cả lớp đang nhận mưa lời cổ vũ!' : `♥ ${likeProgress}/666 tim · Cùng thả tim cổ vũ lớp học!`}</div>
      <div className="quiz-banner">{roundWinners.length ? <>🏆 Kết thúc vòng: {roundWinners[0].name}<small>{roundWinners[0].score} điểm · Chúc mừng!</small></> : currentGift ? <>🎉 {currentGift.displayName || currentGift.username} gửi {currentGift.giftName}<small>Cảm ơn bạn đã cổ vũ lớp!</small></> : <>🎒 {doublePoints ? 'Câu thưởng nhân đôi điểm!' : 'Cùng học, cùng vui mỗi ngày!'}<small>Đúng +10 điểm · 3 câu liên tiếp +5</small></>}</div>
      <div className="quiz-classroom"><div className="quiz-aisle" /><div className="quiz-students">{Array.from({ length: 30 }, (_, i) => {
        const person = people[i];
        const comment = person?.lastComment && Date.now() - person.lastComment.timestamp < COMMENT_VISIBLE_MS ? person.lastComment : undefined;
        return <div className="quiz-student" key={person?.username || `empty-${i}`} style={{ animationDelay: `${(i % 7) * -0.28}s` }}>
          <div className="quiz-avatar-wrap">
            {comment && <div className="quiz-comment" title={comment.comment}>{comment.comment}</div>}
            <div className="quiz-avatar" style={{ backgroundColor: COLORS[i % COLORS.length] }}>{person?.avatar ? <img src={person.avatar} alt="" referrerPolicy="no-referrer" /> : <><span className="quiz-hair" /><span className="quiz-face">•ᴗ•</span><span className="quiz-shirt" /></>}</div>
          </div>
          <div className="quiz-name">{person?.name || 'Chờ học viên'}</div>
          <div className="quiz-answer">{person && answers[person.username.toLowerCase()] ? `Đã chọn ${answers[person.username.toLowerCase()].choice}` : person ? `${person.score} điểm` : '· · ·'}</div>
        </div>;
      })}</div></div>
      <div className="quiz-footer"><span>🎓 {people.length} học viên</span><span>🏆 {leaders.length ? leaders.map((p, i) => `${i + 1}. ${p.name}: ${p.score}`).join(' · ') : 'Chưa có điểm'}</span></div>
      {(raining || currentGift) && <div className="quiz-confetti" aria-hidden="true">{Array.from({ length: 18 }, (_, i) => <span key={i} style={{ left: `${(i * 37) % 100}%`, animationDelay: `${(i % 7) * -.45}s`, background: COLORS[i % COLORS.length] }} />)}</div>}
      {demo && <div className="quiz-demo"><span>Trả lời thử:</span>{QUIZ_CHOICES.map((choice) => <button key={choice} type="button" onClick={() => onDemoAnswer?.(choice)} disabled={phase === 'result'}>{choice}</button>)}</div>}
    </div>
  );
}
