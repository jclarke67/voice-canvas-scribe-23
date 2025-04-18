
import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { formatTime } from '@/lib/utils';
import { getAudioFromStorage } from '@/lib/storage';

interface AudioPlayerProps {
  audioId: string;
  duration: number;
  name?: string;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ audioId, duration, name }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressBarRef = useRef<HTMLDivElement | null>(null);
  
  useEffect(() => {
    // Get audio from storage
    setIsLoading(true);
    const storedAudio = getAudioFromStorage(`audio-${audioId}`);
    if (storedAudio) {
      setAudioUrl(storedAudio);
    } else {
      console.error(`Audio not found for ID: audio-${audioId}`);
    }
    setIsLoading(false);
    
    // Clean up on unmount
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, [audioId]);
  
  useEffect(() => {
    if (!audioRef.current) return;
    
    const updateTime = () => {
      if (audioRef.current) {
        setCurrentTime(audioRef.current.currentTime);
      }
    };
    
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
      }
    };
    
    audioRef.current.addEventListener('timeupdate', updateTime);
    audioRef.current.addEventListener('ended', handleEnded);
    
    return () => {
      if (audioRef.current) {
        audioRef.current.removeEventListener('timeupdate', updateTime);
        audioRef.current.removeEventListener('ended', handleEnded);
      }
    };
  }, []);
  
  const togglePlayPause = () => {
    if (!audioRef.current || !audioUrl) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      // Stop all other audio players when playing this one
      document.querySelectorAll('audio').forEach(audio => {
        if (audio !== audioRef.current) {
          audio.pause();
        }
      });
      audioRef.current.play().catch(err => {
        console.error('Failed to play audio:', err);
      });
    }
    
    setIsPlaying(!isPlaying);
  };
  
  const toggleMute = () => {
    if (!audioRef.current) return;
    
    audioRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };
  
  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !progressBarRef.current) return;
    
    const progressBar = progressBarRef.current;
    const rect = progressBar.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const newTime = percent * duration;
    
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };
  
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  
  return (
    <div className="rounded-lg bg-primary/5 p-3 my-3 animate-fade-in">
      {audioUrl && (
        <audio ref={audioRef} src={audioUrl} preload="metadata" />
      )}
      
      {name && (
        <div className="text-sm font-medium mb-2">{name}</div>
      )}
      
      <div className="flex items-center space-x-2">
        <button 
          onClick={togglePlayPause}
          className={`h-8 w-8 rounded-full flex items-center justify-center text-primary-foreground transition-colors ${
            isLoading ? 'bg-primary/50 cursor-wait' : 'bg-primary hover:bg-primary/90'
          }`}
          disabled={isLoading || !audioUrl}
        >
          {isPlaying ? <Pause size={16} /> : <Play size={16} />}
        </button>
        
        <div 
          ref={progressBarRef}
          className="relative h-2 flex-1 bg-primary/20 rounded-full cursor-pointer"
          onClick={handleProgressClick}
        >
          <div 
            className="absolute top-0 left-0 h-full bg-primary rounded-full transition-all"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        
        <div className="text-xs text-muted-foreground min-w-[60px] text-right">
          {formatTime(currentTime)} / {formatTime(duration)}
        </div>
        
        <button 
          onClick={toggleMute}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </button>
      </div>
    </div>
  );
};

export default AudioPlayer;
