import React, { useEffect, useState } from 'react';
import {
  StreamConfig,
  GiftCategory,
  LeaderboardEntry,
  Devotee,
  CommentEvent,
} from '../types/temple';
import { LiveControlPanel } from './LiveControlPanel';

// Link for the TikTok LIVE Studio / OBS "Link" source. LIVE Studio refuses plain localhost, so it goes through
// lvh.me, a public name that points back to this computer (127.0.0.1); vite.config.ts allows that host.
const obsStageUrl = () => `http://lvh.me:${(typeof window !== 'undefined' && window.location.port) || '3000'}/?view=stage`;

interface StreamerDeckProps {
  config: StreamConfig;
  onUpdateConfig: (newConfig: Partial<StreamConfig>) => void;
  tikTokStatus?: import('../types/temple').TikTokLiveStatus;
  onConnectTikTok?: (username: string) => void;
  onDisconnectTikTok?: () => void;
  onSaveChannelName?: (name: string) => void;
}

export const StreamerDeck: React.FC<StreamerDeckProps> = ({
  config,
  onUpdateConfig,
  tikTokStatus,
  onConnectTikTok,
  onDisconnectTikTok,
  onSaveChannelName,
}) => {
  const [activeTab, setActiveTab] = useState<'tiktok_obs' | 'audio'>('tiktok_obs');
  const [tiktokUsernameInput, setTiktokUsernameInput] = useState(tikTokStatus?.username || '');
  const [copiedUrl, setCopiedUrl] = useState(false);
  // Channel name read by the voice and shown as the title; saved on the server so the live page and restarts keep it
  const [nameDraft, setNameDraft] = useState(config.channelName);
  const [nameSaved, setNameSaved] = useState(false);
  useEffect(() => setNameDraft(config.channelName), [config.channelName]);
  const saveName = () => {
    const name = nameDraft.trim();
    if (!name) return;
    onSaveChannelName?.(name);
    setNameSaved(true);
    setTimeout(() => setNameSaved(false), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-[#120806] border border-stone-800 rounded-2xl shadow-2xl overflow-hidden text-stone-200">
      {/* DECK HEADER / CONNECTION SETTINGS */}
      <div className="p-3.5 border-b border-stone-800 bg-stone-900/60 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold text-sm">
            ⚙
          </div>
          <div>
            <h3 className="text-xs font-bold text-white tracking-wide uppercase">
              Bảng Điều Khiển Live: {config.channelName}
            </h3>
            <span className="text-[11px] text-stone-400">
              Giọng đọc · Nhạc nền · Kết nối TikTok LIVE
            </span>
          </div>
        </div>

        {/* Channel name (title + what the voice says) */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-stone-950 border border-stone-700 rounded-lg px-2.5 py-1">
            <span className="text-xs text-amber-400 font-bold mr-1.5">Tên kênh:</span>
            <input
              type="text"
              value={nameDraft}
              maxLength={40}
              onChange={(e) => setNameDraft(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && saveName()}
              placeholder="Tâm Tịnh Tâm An"
              className="bg-transparent text-xs text-white focus:outline-none w-36 font-medium"
            />
          </div>
          <button
            onClick={saveName}
            disabled={!nameDraft.trim() || nameDraft.trim() === config.channelName}
            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-400 text-stone-950 disabled:bg-stone-800 disabled:text-stone-400 transition-colors"
          >
            {nameSaved ? 'Đã lưu' : 'Lưu'}
          </button>
        </div>
      </div>

      {/* NAVIGATION TABS */}
      <div className="flex border-b border-stone-800 bg-stone-950/40 px-3 overflow-x-auto">
        <button
          onClick={() => setActiveTab('tiktok_obs')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'tiktok_obs'
              ? 'border-amber-400 text-amber-300 bg-amber-950/30'
              : 'border-transparent text-stone-300 hover:text-white'
          }`}
        >
          <span className="relative flex h-2 w-2">
            {tikTokStatus?.isConnected ? (
              <>
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </>
            ) : (
              <span className="relative inline-flex rounded-full h-2 w-2 bg-stone-500"></span>
            )}
          </span>
          <span>📡</span> TikTok LIVE & OBS (Trực Tiếp)
        </button>


        <button
          onClick={() => setActiveTab('audio')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'audio'
              ? 'border-amber-400 text-amber-300 bg-amber-950/20'
              : 'border-transparent text-stone-400 hover:text-stone-200'
          }`}
        >
          <span>🎙</span> Giọng dẫn trò chơi
        </button>



      </div>

      {/* TAB CONTENT PANELS */}
      <div className="p-4 flex-1 overflow-y-auto">
        {/* TAB 0: TIKTOK LIVE & OBS INTEGRATION */}
        {activeTab === 'tiktok_obs' && (
          <div className="space-y-4">
            <LiveControlPanel />

            {/* 1. REAL TIKTOK LIVE CONNECTOR BOX */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-stone-900/90 to-stone-950 border border-amber-500/30 shadow-lg space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-stone-800">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🔴</span>
                  <div>
                    <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wide">
                      Kết Nối Phòng Live TikTok Thật (Webcast Real-time)
                    </h4>
                    <p className="text-[11px] text-stone-400">
                      Bắt comment "adidaphat", quà tặng và người xem trực tiếp từ TikTok
                    </p>
                  </div>
                </div>

                {/* Connection Status Badge */}
                <div className="flex items-center gap-2">
                  {tikTokStatus?.isConnected ? (
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 flex items-center gap-1.5 animate-pulse">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      Đang Live: @{tikTokStatus.username}
                    </span>
                  ) : tikTokStatus?.isConnecting ? (
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/20 border border-amber-500/50 text-amber-300 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-spin" />
                      Đang kết nối...
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-stone-800 text-stone-400 border border-stone-700">
                      ⚪ Chưa kết nối
                    </span>
                  )}
                </div>
              </div>

              {/* Input Username & Action */}
              <div className="flex flex-col sm:flex-row gap-2 pt-1">
                <div className="flex-1 flex items-center bg-stone-950 border border-stone-700 rounded-lg px-3 py-2 focus-within:border-amber-400 transition-colors">
                  <span className="text-sm font-bold text-amber-400 mr-1.5">@</span>
                  <input
                    type="text"
                    value={tiktokUsernameInput}
                    onChange={(e) => setTiktokUsernameInput(e.target.value.replace(/^@/, ''))}
                    placeholder="Nhập username TikTok của bạn (không cần @)"
                    className="bg-transparent text-xs text-white placeholder-stone-500 focus:outline-none w-full font-medium"
                  />
                </div>

                {tikTokStatus?.isConnected ? (
                  <button
                    onClick={() => onDisconnectTikTok?.()}
                    className="px-4 py-2 bg-red-950 hover:bg-red-900 border border-red-700 text-red-200 rounded-lg text-xs font-bold transition-all whitespace-nowrap shadow-md flex items-center justify-center gap-1.5"
                  >
                    <span>⏹</span> Ngắt Kết Nối
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      if (tiktokUsernameInput.trim() && onConnectTikTok) {
                        onConnectTikTok(tiktokUsernameInput.trim());
                      }
                    }}
                    disabled={tikTokStatus?.isConnecting || !tiktokUsernameInput.trim()}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-400 active:scale-95 disabled:opacity-50 text-stone-950 rounded-lg text-xs font-black transition-all whitespace-nowrap shadow-md flex items-center justify-center gap-1.5"
                  >
                    <span>🔴</span> Bắt Đầu Kết Nối Live Thật
                  </button>
                )}
              </div>

              {/* Live Room Stats when connected */}
              {tikTokStatus?.isConnected && (
                <div className="grid grid-cols-3 gap-2 pt-2">
                  <div className="p-2 rounded-lg bg-stone-950/70 border border-stone-800 text-center">
                    <span className="text-[10px] text-stone-400 block">Người Xem (Viewers)</span>
                    <span className="text-sm font-black text-amber-300">
                      👥 {tikTokStatus.viewerCount ?? 0}
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-stone-950/70 border border-stone-800 text-center">
                    <span className="text-[10px] text-stone-400 block">Lượt Thích (Likes)</span>
                    <span className="text-sm font-black text-rose-400">
                      ❤️ {tikTokStatus.totalLikes ?? 0}
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-stone-950/70 border border-stone-800 text-center">
                    <span className="text-[10px] text-stone-400 block">Mã Phòng Live</span>
                    <span className="text-[11px] font-mono font-bold text-stone-300 truncate block">
                      {tikTokStatus.roomId ? `#${tikTokStatus.roomId.slice(-6)}` : 'Đang đồng bộ'}
                    </span>
                  </div>
                </div>
              )}

              {/* Error Message if any */}
              {tikTokStatus?.error && (
                <div className="p-2.5 rounded-lg bg-red-950/50 border border-red-800/60 text-[11px] text-red-200 flex items-start gap-2">
                  <span className="text-base shrink-0">⚠️</span>
                  <div>
                    <strong className="font-bold">Lưu ý kết nối: </strong>
                    {tikTokStatus.error}
                    <div className="mt-1 text-[10px] text-stone-400">
                      💡 Mẹo: Hãy mở app TikTok trên điện thoại hoặc TikTok LIVE Studio trên PC, bấm <strong>Phát trực tiếp (Go LIVE)</strong> trước, sau đó bấm Kết Nối lại tại đây!
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 2. OBS & TIKTOK LIVE STUDIO BROWSER SOURCE URL */}
            <div className="p-4 rounded-xl bg-stone-900/70 border border-stone-800 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-stone-800">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🎥</span>
                  <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wide">
                    Link Màn Hình OBS Studio & TikTok LIVE Studio (Tỷ Lệ 9:16 Dọc)
                  </h4>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  Chuẩn 1080 x 1920
                </span>
              </div>

              {/* URL Display with Copy Button */}
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="flex-1 px-3 py-2 bg-stone-950 border border-stone-700 rounded-lg text-xs font-mono text-amber-200 select-all overflow-x-auto whitespace-nowrap">
                  {obsStageUrl()}
                </div>
                <button
                  onClick={() => {
                    if (typeof window !== 'undefined') {
                      navigator.clipboard.writeText(obsStageUrl());
                      setCopiedUrl(true);
                      setTimeout(() => setCopiedUrl(false), 3000);
                    }
                  }}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5 ${
                    copiedUrl
                      ? 'bg-emerald-600 text-white'
                      : 'bg-stone-800 hover:bg-stone-700 text-amber-300 border border-amber-500/40'
                  }`}
                >
                  <span>{copiedUrl ? '✓' : '📋'}</span>
                  <span>{copiedUrl ? 'Đã Sao Chép!' : 'Sao Chép Link OBS'}</span>
                </button>
                <a
                  href="/?view=stage"
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-2 bg-stone-900 hover:bg-stone-800 border border-stone-700 text-stone-300 rounded-lg text-xs font-medium transition-all text-center flex items-center justify-center gap-1"
                >
                  <span>👁️</span> Mở Tab Tràn Viền
                </a>
              </div>

              {/* Step-by-Step Instructions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                {/* Method 1: TikTok LIVE Studio */}
                <div className="p-3 rounded-lg bg-stone-950/60 border border-stone-800 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-300">
                    <span>📱</span> Cách 1: Dùng TikTok LIVE Studio (Khuyên Dùng)
                  </div>
                  <ol className="text-[11px] text-stone-300 space-y-1.5 list-decimal list-inside leading-relaxed">
                    <li>Mở phần mềm <strong>TikTok LIVE Studio</strong> trên máy tính.</li>
                    <li>Trong mục Nguồn (Sources), bấm <strong>Thêm Nguồn (Add Source)</strong> &rarr; Chọn <strong>Trình duyệt (Browser)</strong>.</li>
                    <li>Dán link OBS ở trên vào ô <strong>URL</strong>.</li>
                    <li>Đặt kích thước: Rộng <strong>1080</strong>, Cao <strong>1920</strong> (Tỷ lệ 9:16 dọc).</li>
                    <li>Tích chọn <strong>Điều khiển âm thanh</strong> (Control audio via OBS/Studio) để phát tiếng chuông mõ & kinh Niệm Phật qua Live!</li>
                  </ol>
                </div>

                {/* Method 2: OBS Studio */}
                <div className="p-3 rounded-lg bg-stone-950/60 border border-stone-800 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
                    <span>🎬</span> Cách 2: Dùng OBS Studio
                  </div>
                  <ol className="text-[11px] text-stone-300 space-y-1.5 list-decimal list-inside leading-relaxed">
                    <li>Mở <strong>OBS Studio</strong> &rarr; Tại khung <strong>Sources (+)</strong> &rarr; Chọn <strong>Browser</strong>.</li>
                    <li>Dán URL ở trên vào &rarr; Đặt Width: <strong>1080</strong>, Height: <strong>1920</strong>, FPS: <strong>60</strong>.</li>
                    <li>Đánh dấu tích vào ô <strong>Control audio via OBS</strong>.</li>
                    <li>Bấm <strong>Start Virtual Camera (Khởi động Camera ảo)</strong> nếu bạn dùng TikTok trên điện thoại, hoặc nhập <strong>Stream Key</strong> TikTok vào Settings &rarr; Stream!</li>
                  </ol>
                </div>
              </div>
            </div>

            {/* 3. EXPLANATION: CÁCH HOẠT ĐỘNG VỚI USER & QUÀ THẬT */}
            <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/20 space-y-2.5">
              <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wide flex items-center gap-1.5">
                <span>💡</span> Cơ Chế Hoạt Động Khi User Thật Vào Tương Tác
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-[11px] text-stone-300">
                <div className="p-2.5 rounded-lg bg-stone-950/60 border border-stone-800 space-y-1">
                  <div className="font-bold text-amber-200 flex items-center gap-1">
                    <span>💬</span> Bình luận thật trên TikTok:
                  </div>
                  <p className="leading-relaxed text-stone-300">
                    Khi người xem gõ <strong className="text-white">"adidaphat"</strong> hoặc <strong className="text-white">"a di đà phật"</strong> trên ứng dụng TikTok, hình ảnh phật tử quỳ lạy sẽ xuất hiện ngay lập tức trên Chánh điện cùng lời cầu nguyện trên đầu! Chuông mõ sẽ ngân vang và giọng nữ Phật giáo chào mừng!
                  </p>
                </div>

                <div className="p-2.5 rounded-lg bg-stone-950/60 border border-stone-800 space-y-1">
                  <div className="font-bold text-amber-200 flex items-center gap-1">
                    <span>🎁</span> Tặng quà thật trên TikTok:
                  </div>
                  <p className="leading-relaxed text-stone-300">
                    Khán giả tặng Hoa hồng, Hoa sen, Tim, Tiền xu... sân khấu bật hiệu ứng sen vàng và cánh sen rơi, máy quay áp sát người tặng, cộng điểm vào <strong>TOP THÀNH TÂM</strong>, và giọng đọc gọi tên cảm ơn kèm lời chúc (combo chỉ đọc 1 lần).
                  </p>
                </div>
              </div>

              <div className="p-2 rounded bg-amber-900/30 border border-amber-600/30 text-[10px] text-amber-200 flex items-center gap-2">
                <span>🔔</span>
                <span>
                  <strong>Quy tắc tôn kính:</strong> Khi streamer bật tab <strong>"Thuyết Giảng Phật Pháp"</strong>, hệ thống sẽ tự động tắt đọc quà của phật tử để bài pháp thoại không bị phân tâm.
                </span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'audio' && <LiveControlPanel />}

      </div>
    </div>
  );
};
