import React, { useState, useEffect } from 'react';
import { Play, Pause, Volume2 } from 'lucide-react';

interface VoiceWaveformPlayerProps {
  durationSeconds?: number;
  waveformAmplitudes?: number[];
  isOutgoing?: boolean;
}

export const VoiceWaveformPlayer: React.FC<VoiceWaveformPlayerProps> = ({
  durationSeconds = 12,
  waveformAmplitudes = [30, 45, 80, 60, 95, 40, 70, 85, 90, 50, 75, 60, 40, 30, 65, 80, 50, 35, 45, 60],
  isOutgoing = false
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<1 | 1.5 | 2>(1);
  const [currentProgressPercent, setCurrentProgressPercent] = useState(0);

  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentProgressPercent((prev) => {
          if (prev >= 100) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 5 * playbackSpeed;
        });
      }, 200);
    }
    return () => clearInterval(interval);
  }, [isPlaying, playbackSpeed]);

  const handleTogglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPlaying(!isPlaying);
  };

  const handleCycleSpeed = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (playbackSpeed === 1) setPlaybackSpeed(1.5);
    else if (playbackSpeed === 1.5) setPlaybackSpeed(2);
    else setPlaybackSpeed(1);
  };

  const formattedDuration = `${Math.floor(durationSeconds / 60)}:${(durationSeconds % 60).toString().padStart(2, '0')}`;

  return (
    <div className="flex items-center gap-2.5 py-1 select-none">
      {/* Play / Pause button */}
      <button
        onClick={handleTogglePlay}
        className={`w-9 h-9 rounded-full flex items-center justify-center cursor-pointer shadow-md transition-transform active:scale-95 ${
          isOutgoing 
            ? 'bg-white text-[#FF4F87]' 
            : 'bg-[#FF4F87] text-white'
        }`}
      >
        {isPlaying ? (
          <Pause className="w-4 h-4 fill-current" />
        ) : (
          <Play className="w-4 h-4 fill-current ml-0.5" />
        )}
      </button>

      {/* Waveform Bars */}
      <div className="flex-1 flex items-center gap-0.5 h-7 cursor-pointer">
        {waveformAmplitudes.map((amp, idx) => {
          const barPercent = (idx / waveformAmplitudes.length) * 100;
          const isPlayed = barPercent <= currentProgressPercent;

          return (
            <div
              key={idx}
              style={{ height: `${Math.max(20, amp)}%` }}
              className={`w-1 rounded-full transition-all duration-150 ${
                isPlayed
                  ? (isOutgoing ? 'bg-white shadow-[0_0_4px_#FFF]' : 'bg-[#FF4F87] shadow-[0_0_4px_#FF4F87]')
                  : (isOutgoing ? 'bg-white/35' : 'bg-[#B9A8B3]/40')
              }`}
            />
          );
        })}
      </div>

      {/* Duration & Speed Pill */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <span className={`text-[10px] font-medium ${isOutgoing ? 'text-white/80' : 'text-[#B9A8B3]'}`}>
          {formattedDuration}
        </span>

        <button
          onClick={handleCycleSpeed}
          className={`px-1.5 py-0.5 rounded text-[9px] font-black cursor-pointer transition-colors ${
            isOutgoing 
              ? 'bg-white/20 text-white hover:bg-white/30' 
              : 'bg-black/40 text-[#FFB4CE] hover:bg-black/60'
          }`}
          title="Change playback speed"
        >
          {playbackSpeed}x
        </button>
      </div>
    </div>
  );
};
