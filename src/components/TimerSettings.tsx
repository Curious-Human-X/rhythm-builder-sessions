import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { TimerSettings as Settings } from './IntervalTimer';

interface TimerSettingsProps {
  settings: Settings;
  onChange: (settings: Settings) => void;
  disabled: boolean;
}

export const TimerSettings = ({
  settings,
  onChange,
  disabled
}: TimerSettingsProps) => {
  const updateSetting = (key: keyof Settings, value: number) => {
    onChange({
      ...settings,
      [key]: Math.max(1, value)
    });
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground mb-4">Timer Settings</h3>
      
      <div className="grid grid-cols-1 gap-4">
        <div className="space-y-2">
          <Label htmlFor="work-duration" className="text-sm font-medium">
            Work Duration (seconds)
          </Label>
          <Input
            id="work-duration"
            type="number"
            min="1"
            max="3600"
            value={settings.workDuration}
            onChange={(e) => updateSetting('workDuration', parseInt(e.target.value) || 1)}
            disabled={disabled}
            className="text-center"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="rest-duration" className="text-sm font-medium">
            Rest Duration (seconds)
          </Label>
          <Input
            id="rest-duration"
            type="number"
            min="1"
            max="3600"
            value={settings.restDuration}
            onChange={(e) => updateSetting('restDuration', parseInt(e.target.value) || 1)}
            disabled={disabled}
            className="text-center"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="rounds" className="text-sm font-medium">
            Number of Rounds
          </Label>
          <Input
            id="rounds"
            type="number"
            min="1"
            max="100"
            value={settings.rounds}
            onChange={(e) => updateSetting('rounds', parseInt(e.target.value) || 1)}
            disabled={disabled}
            className="text-center"
          />
        </div>
      </div>
      
      {disabled && (
        <p className="text-sm text-muted-foreground">
          Settings can only be changed when timer is stopped
        </p>
      )}
    </div>
  );
};