import { useState, useEffect, useCallback, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { TimerDisplay } from './TimerDisplay';
import { TimerControls } from './TimerControls';
import { TimerSettings } from './TimerSettings';
import { PresetManager } from './PresetManager';
import { useToast } from '@/hooks/use-toast';

export type TimerPhase = 'work' | 'rest' | 'finished';
export type TimerState = 'idle' | 'running' | 'paused';

export interface TimerSettings {
  workDuration: number;
  restDuration: number;
  rounds: number;
}

export interface TimerPreset extends TimerSettings {
  name: string;
}

export const IntervalTimer = () => {
  const { toast } = useToast();
  
  // Timer settings
  const [settings, setSettings] = useState<TimerSettings>({
    workDuration: 30,
    restDuration: 10,
    rounds: 5
  });
  
  // Timer state
  const [state, setState] = useState<TimerState>('idle');
  const [phase, setPhase] = useState<TimerPhase>('work');
  const [currentRound, setCurrentRound] = useState(1);
  const [timeLeft, setTimeLeft] = useState(settings.workDuration);
  
  // Audio and notifications
  const audioContextRef = useRef<AudioContext | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Initialize audio context
  useEffect(() => {
    const initAudio = () => {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
    };
    
    document.addEventListener('click', initAudio, { once: true });
    return () => document.removeEventListener('click', initAudio);
  }, []);
  
  // Play beep sound
  const playBeep = useCallback((frequency: number = 800, duration: number = 200) => {
    if (!audioContextRef.current) return;
    
    const oscillator = audioContextRef.current.createOscillator();
    const gainNode = audioContextRef.current.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContextRef.current.destination);
    
    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.1, audioContextRef.current.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContextRef.current.currentTime + duration / 1000);
    
    oscillator.start(audioContextRef.current.currentTime);
    oscillator.stop(audioContextRef.current.currentTime + duration / 1000);
  }, []);
  
  // Speak text using Web Speech API
  const speak = useCallback((text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.2;
      utterance.pitch = 1;
      speechSynthesis.speak(utterance);
    }
  }, []);
  
  // Handle phase transition
  const transitionPhase = useCallback(() => {
    if (phase === 'work') {
      setPhase('rest');
      setTimeLeft(settings.restDuration);
      playBeep(600, 300);
      speak('Rest time');
      toast({
        title: '💪 Work Complete!',
        description: `Rest for ${settings.restDuration} seconds`,
      });
    } else if (phase === 'rest') {
      if (currentRound < settings.rounds) {
        setCurrentRound(prev => prev + 1);
        setPhase('work');
        setTimeLeft(settings.workDuration);
        playBeep(800, 300);
        speak(`Round ${currentRound + 1}, work time`);
        toast({
          title: '🔥 Next Round!',
          description: `Round ${currentRound + 1} - Work for ${settings.workDuration} seconds`,
        });
      } else {
        setPhase('finished');
        setState('idle');
        playBeep(1000, 500);
        speak('Workout complete');
        toast({
          title: '🎉 Workout Complete!',
          description: `You completed ${settings.rounds} rounds!`,
        });
      }
    }
  }, [phase, currentRound, settings, playBeep, speak, toast]);
  
  // Timer tick effect
  useEffect(() => {
    if (state === 'running') {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            transitionPhase();
            return 0;
          }
          
          // Countdown beeps for last 3 seconds
          if (prev <= 3) {
            playBeep(1200, 100);
          }
          
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [state, transitionPhase, playBeep]);
  
  // Reset timer when settings change and timer is idle
  useEffect(() => {
    if (state === 'idle') {
      setTimeLeft(settings.workDuration);
      setPhase('work');
      setCurrentRound(1);
    }
  }, [settings, state]);
  
  // Control functions
  const startTimer = () => {
    setState('running');
    if (phase === 'work') {
      speak(`Round ${currentRound}, work time`);
    } else {
      speak('Rest time');
    }
  };
  
  const pauseTimer = () => {
    setState('paused');
  };
  
  const resetTimer = () => {
    setState('idle');
    setPhase('work');
    setCurrentRound(1);
    setTimeLeft(settings.workDuration);
  };
  
  const progress = phase === 'work' 
    ? 1 - (timeLeft / settings.workDuration)
    : 1 - (timeLeft / settings.restDuration);
    
  const totalProgress = ((currentRound - 1) + (phase === 'rest' ? 1 : progress)) / settings.rounds;

  return (
    <div className="min-h-screen bg-[image:var(--gradient-bg)] flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <Card className="p-8 bg-card/80 backdrop-blur-sm border-border/50" style={{ boxShadow: 'var(--shadow-elevated)' }}>
          <TimerDisplay
            timeLeft={timeLeft}
            phase={phase}
            state={state}
            progress={progress}
            currentRound={currentRound}
            totalRounds={settings.rounds}
            totalProgress={totalProgress}
          />
          
          <TimerControls
            state={state}
            onStart={startTimer}
            onPause={pauseTimer}
            onReset={resetTimer}
          />
        </Card>
        
        <Card className="p-6 bg-card/80 backdrop-blur-sm border-border/50">
          <TimerSettings
            settings={settings}
            onChange={setSettings}
            disabled={state !== 'idle'}
          />
        </Card>
        
        <Card className="p-6 bg-card/80 backdrop-blur-sm border-border/50">
          <PresetManager
            currentSettings={settings}
            onLoadPreset={setSettings}
            disabled={state !== 'idle'}
          />
        </Card>
      </div>
    </div>
  );
};