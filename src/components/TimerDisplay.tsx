import { TimerPhase, TimerState } from './IntervalTimer';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

interface TimerDisplayProps {
  timeLeft: number;
  phase: TimerPhase;
  state: TimerState;
  progress: number;
  currentRound: number;
  totalRounds: number;
  totalProgress: number;
}

export const TimerDisplay = ({
  timeLeft,
  phase,
  state,
  progress,
  currentRound,
  totalRounds,
  totalProgress
}: TimerDisplayProps) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  const getPhaseConfig = () => {
    switch (phase) {
      case 'work':
        return {
          label: '💪 WORK',
          bgClass: 'bg-gradient-to-br from-timer-work to-timer-work-secondary',
          pulseClass: state === 'running' ? 'animate-pulse-work' : '',
          progressClass: 'bg-timer-work'
        };
      case 'rest':
        return {
          label: '🧘 REST',
          bgClass: 'bg-gradient-to-br from-timer-rest to-timer-rest-secondary',
          pulseClass: state === 'running' ? 'animate-pulse-rest' : '',
          progressClass: 'bg-timer-rest'
        };
      case 'finished':
        return {
          label: '🎉 COMPLETE',
          bgClass: 'bg-gradient-to-br from-primary to-accent',
          pulseClass: '',
          progressClass: 'bg-primary'
        };
    }
  };
  
  const config = getPhaseConfig();
  
  return (
    <div className="text-center space-y-6">
      {/* Phase indicator */}
      <div className="flex justify-center">
        <Badge 
          variant="secondary" 
          className={`${config.bgClass} text-white px-4 py-2 text-lg font-bold ${config.pulseClass}`}
        >
          {config.label}
        </Badge>
      </div>
      
      {/* Main timer display */}
      <div 
        className={`
          relative mx-auto w-48 h-48 rounded-full ${config.bgClass} 
          flex items-center justify-center text-white shadow-2xl
          ${state === 'running' && timeLeft <= 3 ? 'animate-countdown-tick' : ''}
          ${config.pulseClass}
        `}
        style={{
          boxShadow: phase === 'work' 
            ? 'var(--shadow-glow-work)' 
            : phase === 'rest' 
            ? 'var(--shadow-glow-rest)' 
            : 'var(--shadow-elevated)'
        }}
      >
        <div className="text-center">
          <div className="text-4xl font-mono font-bold mb-2">
            {formatTime(timeLeft)}
          </div>
          {state === 'paused' && (
            <div className="text-sm opacity-80">PAUSED</div>
          )}
        </div>
        
        {/* Progress ring overlay */}
        <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="rgba(255,255,255,0.2)"
            strokeWidth="2"
          />
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="rgba(255,255,255,0.8)"
            strokeWidth="3"
            strokeDasharray={283}
            strokeDashoffset={283 - (283 * progress)}
            className="transition-all duration-1000 ease-linear"
            strokeLinecap="round"
          />
        </svg>
      </div>
      
      {/* Round counter */}
      <div className="text-center space-y-2">
        <div className="text-2xl font-bold text-foreground">
          Round {currentRound} of {totalRounds}
        </div>
        
        {/* Overall progress */}
        <div className="space-y-2">
          <div className="text-sm text-muted-foreground">
            Overall Progress: {Math.round(totalProgress * 100)}%
          </div>
          <Progress 
            value={totalProgress * 100} 
            className="h-2"
          />
        </div>
      </div>
    </div>
  );
};