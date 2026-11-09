import React, { useState, useRef, useEffect } from 'react';
import { Volume2, VolumeX, Volume1, Play, Pause, X, Disc } from 'lucide-react';
import { audioStorage } from '../utils/audioStorage';

interface MusicPlayerProps {
  url?: string;
  title?: string;
  autoPlay?: boolean;
  delaySeconds?: number;
}

export const MusicPlayer: React.FC<MusicPlayerProps> = ({
  url,
  title = 'Nafis To‘y Valsi',
  autoPlay = true,
  delaySeconds = 5,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [volume, setVolume] = useState<number>(0.75); // 75% default
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const fadeIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const delayTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs <= 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Ekranning boshqa ixtiyoriy joyiga bosilganda menyuni avtomatik yopish
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('touchstart', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!url) return;

    let active = true;

    audioStorage.getAudioUrl(url).then((resolvedUrl) => {
      if (!active || !resolvedUrl) return;

      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }

      const audio = new Audio(resolvedUrl);
      audio.loop = true;
      audio.volume = 0; // Fade-in bilan boshlash
      audioRef.current = audio;

      const onTimeUpdate = () => setCurrentTime(audio.currentTime);
      const onLoadedMetadata = () => setDuration(audio.duration || 0);

      audio.addEventListener('timeupdate', onTimeUpdate);
      audio.addEventListener('loadedmetadata', onLoadedMetadata);

      if (autoPlay) {
        delayTimerRef.current = setTimeout(() => {
          audio
            .play()
            .then(() => {
              setIsPlaying(true);
              let cur = 0;
              const target = isMuted ? 0 : volume;
              fadeIntervalRef.current = setInterval(() => {
                cur = Math.min(cur + 0.05, target);
                if (audioRef.current) audioRef.current.volume = cur;
                if (cur >= target && fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
              }, 100);
            })
            .catch(() => {
              // Foydalanuvchi birinchi marta ekranga tekkanda boshlash
              const onFirstGesture = () => {
                if (audioRef.current) {
                  audioRef.current.volume = isMuted ? 0 : volume;
                  audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
                }
                window.removeEventListener('click', onFirstGesture);
                window.removeEventListener('touchstart', onFirstGesture);
              };
              window.addEventListener('click', onFirstGesture, { once: true });
              window.addEventListener('touchstart', onFirstGesture, { once: true });
            });
        }, delaySeconds * 1000);
      }
    });

    return () => {
      active = false;
      if (delayTimerRef.current) clearTimeout(delayTimerRef.current);
      if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, [url, autoPlay, delaySeconds]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.volume = isMuted ? 0 : volume;
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    }
  };

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    if (newVol === 0) setIsMuted(true);
    else if (isMuted) setIsMuted(false);
    if (audioRef.current) audioRef.current.volume = newVol;
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    if (isMuted) {
      audioRef.current.muted = false;
      audioRef.current.volume = volume > 0 ? volume : 0.75;
      setIsMuted(false);
      if (volume === 0) setVolume(0.75);
    } else {
      audioRef.current.muted = true;
      setIsMuted(true);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) audioRef.current.currentTime = time;
  };

  if (!url) return null;

  return (
    <div ref={panelRef} className="fixed bottom-6 left-4 z-[9999] select-none">
      {/* 
        1. EKRANNING CHETIDA QALQIB TURUVCHI IXCHAM TUGMA (3-rasmdagi qora video play iconkasi)
        Doimiy ravishda video qo'yish (Play) iconkasi ko'rinishida turadi.
      */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-12 h-12 rounded-2xl bg-[#1A1417] text-white flex items-center justify-center shadow-[0_10px_30px_rgba(0,0,0,0.4)] border border-white/20 hover:scale-105 active:scale-95 transition-all duration-300"
        title="Fon musiqasini boshqarish"
        aria-label="Fon musiqasi"
      >
        {/* 3-rasmdagi ichi shaffof oq chiziqli play ikonkasi */}
        <Play className="w-5 h-5 text-white ml-0.5 fill-transparent stroke-[2.5]" />

        {/* Musiqa o'ynayotgan paytda nozik tebranish nuri */}
        {isPlaying && (
          <span className="absolute -inset-1 rounded-2xl border border-[#D9658B]/60 animate-ping pointer-events-none opacity-40" />
        )}
      </button>

      {/* 
        2. TUGMA BOSILGANDA CHETDAN OCHILIB KELUVCHI BOSHQARUV MENYUSI (1-rasmdagi to'liq dizayn)
        Ekranning boshqa joyiga bosilganda o'z-o'zidan yopiladi.
      */}
      {isOpen && (
        <div className="absolute bottom-16 left-0 w-[320px] sm:w-[350px] rounded-3xl p-4 bg-white/95 backdrop-blur-2xl border border-white/95 shadow-[0_25px_60px_rgba(0,0,0,0.25)] animate-fadeIn space-y-3.5">
          {/* Yuqori qism: Sarlavha & Yopish */}
          <div className="flex items-center justify-between pb-1">
            <div className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-[#D9658B]">
              <span className="w-2 h-2 rounded-full bg-[#D9658B] animate-pulse" />
              <span>FON MUSIQASI</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg text-[#7A6A63] hover:bg-black/5 hover:text-black transition-colors"
              title="Yopish"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* O'rta qism: Play/Pause tugmasi + Qo'shiq nomi + Davomiyligi + Ovoz tugmasi */}
          <div className="flex items-center gap-3">
            {/* Play/Pause tugmasi (1-rasmdagi qora yumaloq to'rtburchak) */}
            <button
              onClick={togglePlay}
              className="w-12 h-12 rounded-2xl bg-[#1A1417] text-white flex items-center justify-center shadow-md active:scale-95 transition-all shrink-0 hover:bg-black"
              title={isPlaying ? 'Pauza' : 'Ijro etish'}
            >
              {isPlaying ? (
                <Pause className="w-5 h-5" />
              ) : (
                <Play className="w-5 h-5 ml-0.5 fill-transparent stroke-[2.5]" />
              )}
            </button>

            {/* Qo'shiq nomi va vaqti */}
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-[#1E1418] truncate leading-tight" title={title}>
                {title || 'To‘y Kuyi'}
              </div>
              <div className="flex items-center gap-3 text-[10px] text-[#7A6A63] font-mono mt-1">
                <span>{formatTime(currentTime)}</span>
                <span className="opacity-40">/</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Ovoz balandligi indikatori (1-rasmdagi pushti karnay va 75%) */}
            <div className="flex items-center gap-1.5 pl-2 border-l border-black/5 shrink-0">
              <button
                onClick={toggleMute}
                className="w-9 h-9 rounded-xl bg-[#FBF0F4] text-[#D9658B] flex items-center justify-center hover:bg-[#F5E1E9] transition-colors"
                title={isMuted ? 'Ovozni yoqish' : 'Ovozni o‘chirish'}
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-4 h-4 text-rose-500" />
                ) : volume < 0.5 ? (
                  <Volume1 className="w-4 h-4" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </button>
              <span className="text-[11px] font-mono font-bold text-[#5C4F48] w-7 text-right">
                {isMuted ? '0%' : `${Math.round(volume * 100)}%`}
              </span>
            </div>
          </div>

          {/* Pastki qism: Ikkita slayder (Davomiylik trekkeri va Ovoz slayderi) */}
          <div className="pt-1 border-t border-black/5 flex items-center gap-3">
            {/* Seek Bar (Qo'shiqni oldinga/orqaga surish) */}
            <div className="flex-1 flex items-center gap-1">
              <input
                type="range"
                min={0}
                max={duration || 100}
                value={currentTime}
                onChange={handleSeek}
                className="w-full h-1.5 bg-black/10 rounded-lg appearance-none cursor-pointer accent-[#D9658B]"
                title="Qo‘shiq vaqti"
              />
            </div>

            <div className="w-px h-4 bg-black/10 shrink-0" />

            {/* Volume Bar (Ovoz balandligini sozlash) */}
            <div className="w-24 sm:w-28 flex items-center gap-1">
              <Volume1 className="w-3 h-3 text-[#7A6A63] shrink-0" />
              <input
                type="range"
                min={0}
                max={1}
                step="0.02"
                value={isMuted ? 0 : volume}
                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-black/10 rounded-lg appearance-none cursor-pointer accent-[#D9658B]"
                title="Ovoz balandligi"
              />
              <Volume2 className="w-3 h-3 text-[#D9658B] shrink-0" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
