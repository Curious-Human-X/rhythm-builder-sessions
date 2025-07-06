import { useState, useEffect, useCallback, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { TimerDisplay } from './TimerDisplay';
import { TimerControls } from './TimerControls';
import { TimerSettings } from './TimerSettings';
import { ExerciseManager } from './ExerciseManager';
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
  exercises?: string[];
}

export const IntervalTimer = () => {
  const { toast } = useToast();
  
  // Timer settings
  const [settings, setSettings] = useState<TimerSettings>({
    workDuration: 30,
    restDuration: 10,
    rounds: 5
  });
  
  // Exercise management
  const [exercises, setExercises] = useState<string[]>([]);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  
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
    console.log('Phase transition called:', { phase, currentRound, timeLeft });
    
    if (phase === 'work') {
      console.log('Transitioning from work to rest');
      setPhase('rest');
      setTimeLeft(settings.restDuration);
      playBeep(600, 300);
      speak('Rest time');
      toast({
        title: '💪 Work Complete!',
        description: `Rest for ${settings.restDuration} seconds`,
      });
    } else if (phase === 'rest') {
      console.log('Transitioning from rest to work');
      if (currentRound < settings.rounds) {
        setCurrentRound(prev => prev + 1);
        setPhase('work');
        setTimeLeft(settings.workDuration);
        
        // Move to next exercise if available (before announcing)
        let nextExerciseIndex = currentExerciseIndex;
        if (exercises.length > 0) {
          nextExerciseIndex = (currentExerciseIndex + 1) % exercises.length;
          setCurrentExerciseIndex(nextExerciseIndex);
          console.log('Next exercise index:', nextExerciseIndex, 'Exercise:', exercises[nextExerciseIndex]);
        }
        
        playBeep(800, 300);
        
        const nextExercise = exercises.length > 0 ? exercises[nextExerciseIndex] : '';
        const speakText = nextExercise 
          ? `Round ${currentRound + 1}, ${nextExercise}` 
          : `Round ${currentRound + 1}, work time`;
        speak(speakText);
        
        toast({
          title: '🔥 Next Round!',
          description: `Round ${currentRound + 1}${nextExercise ? ` - ${nextExercise}` : ` - Work for ${settings.workDuration} seconds`}`,
        });
      } else {
        console.log('Workout complete');
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
  }, [phase, currentRound, settings, exercises, currentExerciseIndex, playBeep, speak, toast]);
  
  // Timer tick effect
  useEffect(() => {
    if (state === 'running' && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          console.log('Timer tick:', { prev, phase, state });
          const newTime = prev - 1;
          
          // Countdown beeps for last 3 seconds
          if (newTime <= 3 && newTime > 0) {
            playBeep(1200, 100);
          }
          
          // When time reaches 0, trigger phase transition
          if (newTime <= 0) {
            setTimeout(() => transitionPhase(), 10);
            return 0;
          }
          
          return newTime;
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
  }, [state, timeLeft, transitionPhase, playBeep]);
  
  // Reset timer when settings change and timer is idle
  useEffect(() => {
    if (state === 'idle') {
      setTimeLeft(settings.workDuration);
      setPhase('work');
      setCurrentRound(1);
      setCurrentExerciseIndex(0);
    }
  }, [settings, state]);
  
  // Control functions
  const startTimer = () => {
    setState('running');
    if (phase === 'work') {
      const currentExercise = exercises.length > 0 ? exercises[currentExerciseIndex] : '';
      const speakText = currentExercise 
        ? `Round ${currentRound}, ${currentExercise}` 
        : `Round ${currentRound}, work time`;
      speak(speakText);
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
    setCurrentExerciseIndex(0);
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
            currentExercise={exercises.length > 0 ? exercises[currentExerciseIndex] : ''}
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
          <ExerciseManager
            exercises={exercises}
            onChange={setExercises}
            disabled={state !== 'idle'}
          />
        </Card>
        
        <Card className="p-6 bg-card/80 backdrop-blur-sm border-border/50">
          <PresetManager
            currentSettings={settings}
            currentExercises={exercises}
            onLoadPreset={(preset) => {
              setSettings({
                workDuration: preset.workDuration,
                restDuration: preset.restDuration,
                rounds: preset.rounds
              });
              setExercises(preset.exercises || []);
              setCurrentExerciseIndex(0);
            }}
            disabled={state !== 'idle'}
          />
        </Card>
      </div>
    </div>
  );
};