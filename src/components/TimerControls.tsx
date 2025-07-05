import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { TimerState } from './IntervalTimer';

interface TimerControlsProps {
  state: TimerState;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
}

export const TimerControls = ({
  state,
  onStart,
  onPause,
  onReset
}: TimerControlsProps) => {
  return (
    <div className="flex justify-center gap-4 mt-8">
      {state === 'running' ? (
        <Button
          size="lg"
          variant="secondary"
          onClick={onPause}
          className="px-8 py-4 text-lg"
        >
          <Pause className="w-5 h-5 mr-2" />
          Pause
        </Button>
      ) : (
        <Button
          size="lg"
          onClick={onStart}
          className="px-8 py-4 text-lg bg-gradient-to-r from-primary to-timer-work hover:from-primary/90 hover:to-timer-work/90"
        >
          <Play className="w-5 h-5 mr-2" />
          {state === 'paused' ? 'Resume' : 'Start'}
        </Button>
      )}
      
      <Button
        size="lg"
        variant="outline"
        onClick={onReset}
        className="px-8 py-4 text-lg"
      >
        <RotateCcw className="w-5 h-5 mr-2" />
        Reset
      </Button>
    </div>
  );
};