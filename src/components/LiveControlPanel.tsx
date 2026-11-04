import React, { useEffect, useState } from 'react';

// Sends commands to the live stage page (the Link source in TikTok LIVE Studio), which plays the sound
export const LiveControlPanel: React.FC = () => {
  const [status, setStatus] = useState('');
  const [quizVoice, setQuizVoice] = useState(true);
  const [quizVolume, setQuizVolume] = useState(1);
  const [quizRate, setQuizRate] = useState(1);
  const [effectsEnabled, setEffectsEnabled] = useState(true);
  const [effectsVolume, setEffectsVolume] = useState(0.45);
  useEffect(() => {
    const events = new EventSource('/api/tiktok/events');
    const control = (event: MessageEvent) => {
      try {
        const { action, text } = JSON.parse(event.data);
        if (action === 'setQuizVoice') setQuizVoice(text === 'on');
        if (action === 'setQuizVolume') setQuizVolume(Number(text));
        if (action === 'setRate') setQuizRate(Number(text));
        if (action === 'setClassroomEffects') setEffectsEnabled(text === 'on');
        if (action === 'setClassroomEffectsVolume') setEffectsVolume(Number(text));
      } catch { /* Ignore malformed control events. */ }
    };
    events.addEventListener('control', control);
    return () => events.close();
  }, []);

  const send = async (action: string, body: Record<string, string> = {}) => {
    try {
      const res = await fetch('/api/control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ...body }),
      });
      const result = await res.json();
      setStatus(result.success ? 'Đã gửi tới màn hình live ✓' : result.error || 'Gửi lệnh thất bại');
      return result.success as boolean;
    } catch {
      setStatus('Không gửi được lệnh. Kiểm tra cửa sổ đen (server) còn mở không.');
      return false;
    }
  };

  return (
    <div className="p-4 rounded-xl bg-stone-900/80 border border-amber-500/40 space-y-3">
      <div>
        <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wide">🎛 Điều khiển màn hình live</h4>
        <p className="text-[11px] text-stone-400 mt-0.5">
          Các nút điều khiển áp dụng cho màn hình live và bản xem trước nếu đã bật tiếng.
        </p>
      </div>

      <div className="grid gap-3 rounded-lg border border-sky-700/50 bg-sky-950/30 p-3 text-xs">
        <label className="flex items-center gap-2 text-sky-100 font-bold">
          <input type="checkbox" checked={effectsEnabled} onChange={(e) => { const on = e.target.checked; setEffectsEnabled(on); void send('setClassroomEffects', { text: on ? 'on' : 'off' }); }} />
          Hiệu ứng âm thanh lớp học
        </label>
        <label className="text-stone-300">Âm lượng hiệu ứng: {Math.round(effectsVolume * 100)}%
          <input className="block w-full accent-sky-400" type="range" min="0" max="1" step="0.05" value={effectsVolume} onChange={(e) => { setEffectsVolume(Number(e.target.value)); void send('setClassroomEffectsVolume', { text: e.target.value }); }} />
        </label>
        <div className="flex flex-wrap gap-1.5">
          {([['question', 'Câu hỏi'], ['countdown', 'Sắp hết giờ'], ['answer', 'Đáp án'], ['gift', 'Quà tặng'], ['celebrate', 'Chúc mừng']] as const).map(([cue, label]) => (
            <button key={cue} type="button" disabled={!effectsEnabled} onClick={() => void send('previewClassroomCue', { text: cue })} className="rounded-md bg-sky-800 px-2 py-1.5 font-semibold text-white hover:bg-sky-700 disabled:opacity-40">▶ {label}</button>
          ))}
        </div>
        <span className="text-stone-400">Để nghe tại đây, hãy bật tiếng xem trước ở phía trên. Khi live, âm thanh cũng phát trên màn hình OBS.</span>
      </div>

      <div className="grid gap-3 rounded-lg border border-teal-700/50 bg-teal-950/30 p-3 text-xs">
        <label className="flex items-center gap-2 text-teal-100 font-bold">
          <input type="checkbox" checked={quizVoice} onChange={(e) => { const on = e.target.checked; setQuizVoice(on); void send('setQuizVoice', { text: on ? 'on' : 'off' }); }} />
          Giọng dẫn câu hỏi và kết quả
        </label>
        <label className="text-stone-300">Âm lượng: {Math.round(quizVolume * 100)}%
          <input className="block w-full accent-teal-400" type="range" min="0" max="1" step="0.05" value={quizVolume} onChange={(e) => { setQuizVolume(Number(e.target.value)); void send('setQuizVolume', { text: e.target.value }); }} />
        </label>
        <label className="text-stone-300">Tốc độ: {quizRate.toFixed(2)}x
          <input className="block w-full accent-teal-400" type="range" min="0.6" max="1.15" step="0.05" value={quizRate} onChange={(e) => { setQuizRate(Number(e.target.value)); void send('setRate', { text: e.target.value }); }} />
        </label>
        <span className="text-stone-400">Giọng đọc trên bản xem trước bắt đầu từ thông báo tiếp theo sau khi bật tiếng.</span>
      </div>

      {status && <p className="text-[11px] text-emerald-300">{status}</p>}
    </div>
  );
};
