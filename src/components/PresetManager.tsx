import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Save, Download } from 'lucide-react';
import { TimerSettings, TimerPreset } from './IntervalTimer';
import { useToast } from '@/hooks/use-toast';

interface PresetManagerProps {
  currentSettings: TimerSettings;
  currentExercises: string[];
  onLoadPreset: (preset: TimerPreset) => void;
  disabled: boolean;
}

const DEFAULT_PRESETS: TimerPreset[] = [
  { name: 'Quick HIIT', workDuration: 20, restDuration: 10, rounds: 8, exercises: ['Jumping Jacks', 'Push-ups', 'Squats', 'Burpees'] },
  { name: 'Tabata Classic', workDuration: 20, restDuration: 10, rounds: 8, exercises: ['High Knees', 'Mountain Climbers', 'Plank', 'Lunges'] },
  { name: 'Strength Training', workDuration: 45, restDuration: 15, rounds: 6, exercises: ['Deadlifts', 'Bench Press', 'Squats', 'Pull-ups', 'Rows', 'Overhead Press'] },
  { name: 'Cardio Burst', workDuration: 30, restDuration: 15, rounds: 12, exercises: ['Jump Rope', 'Running in Place', 'Jumping Jacks', 'High Knees'] },
  { name: 'Beginner Friendly', workDuration: 30, restDuration: 30, rounds: 5, exercises: ['Walking in Place', 'Arm Circles', 'Bodyweight Squats', 'Wall Push-ups', 'Stretching'] }
];

export const PresetManager = ({
  currentSettings,
  currentExercises,
  onLoadPreset,
  disabled
}: PresetManagerProps) => {
  const { toast } = useToast();
  const [presets, setPresets] = useState<TimerPreset[]>([]);
  const [newPresetName, setNewPresetName] = useState('');
  const [selectedPreset, setSelectedPreset] = useState<string>('');
  const [newExercise, setNewExercise] = useState('');

  // Load presets from localStorage on mount
  useEffect(() => {
    const savedPresets = localStorage.getItem('interval-timer-presets');
    if (savedPresets) {
      try {
        const parsed = JSON.parse(savedPresets);
        setPresets([...DEFAULT_PRESETS, ...parsed]);
      } catch {
        setPresets(DEFAULT_PRESETS);
      }
    } else {
      setPresets(DEFAULT_PRESETS);
    }
  }, []);

  // Save presets to localStorage
  const savePresetsToStorage = (newPresets: TimerPreset[]) => {
    const customPresets = newPresets.filter(p => 
      !DEFAULT_PRESETS.some(dp => dp.name === p.name)
    );
    localStorage.setItem('interval-timer-presets', JSON.stringify(customPresets));
  };

  const saveCurrentAsPreset = () => {
    if (!newPresetName.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a preset name',
        variant: 'destructive'
      });
      return;
    }

    const preset: TimerPreset = {
      name: newPresetName.trim(),
      ...currentSettings,
      exercises: currentExercises.length > 0 ? [...currentExercises] : undefined
    };

    const updatedPresets = [...presets.filter(p => p.name !== preset.name), preset];
    setPresets(updatedPresets);
    savePresetsToStorage(updatedPresets);
    setNewPresetName('');
    
    toast({
      title: 'Preset Saved',
      description: `"${preset.name}" has been saved successfully`
    });
  };

  const loadPreset = (presetName: string) => {
    const preset = presets.find(p => p.name === presetName);
    if (preset) {
      onLoadPreset(preset);
      
      toast({
        title: 'Preset Loaded',
        description: `"${preset.name}" settings have been applied`
      });
    }
  };

  const deletePreset = (presetName: string) => {
    if (DEFAULT_PRESETS.some(p => p.name === presetName)) {
      toast({
        title: 'Cannot Delete',
        description: 'Default presets cannot be deleted',
        variant: 'destructive'
      });
      return;
    }

    const updatedPresets = presets.filter(p => p.name !== presetName);
    setPresets(updatedPresets);
    savePresetsToStorage(updatedPresets);
    setSelectedPreset('');
    
    toast({
      title: 'Preset Deleted',
      description: `"${presetName}" has been removed`
    });
  };

  const formatPresetDescription = (preset: TimerPreset) => {
    const exerciseText = preset.exercises?.length ? ` - ${preset.exercises.length} exercises` : '';
    return `${preset.workDuration}s work, ${preset.restDuration}s rest, ${preset.rounds} rounds${exerciseText}`;
  };

  const addExercise = () => {
    if (!newExercise.trim()) return;
    // This would need to be managed at the parent level
    setNewExercise('');
  };

  const removeExercise = (index: number) => {
    // This would need to be managed at the parent level
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground mb-4">Presets</h3>
      
      {/* Load preset */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Load Preset</Label>
        <div className="flex gap-2">
          <Select 
            value={selectedPreset} 
            onValueChange={setSelectedPreset}
            disabled={disabled}
          >
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Choose a preset..." />
            </SelectTrigger>
            <SelectContent>
              {presets.map((preset) => (
                <SelectItem key={preset.name} value={preset.name}>
                  <div className="flex flex-col items-start">
                    <span className="font-medium">{preset.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {formatPresetDescription(preset)}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button
            size="sm"
            onClick={() => loadPreset(selectedPreset)}
            disabled={!selectedPreset || disabled}
            className="px-3"
          >
            <Download className="w-4 h-4" />
          </Button>
          
          {selectedPreset && !DEFAULT_PRESETS.some(p => p.name === selectedPreset) && (
            <Button
              size="sm"
              variant="destructive"
              onClick={() => deletePreset(selectedPreset)}
              disabled={disabled}
              className="px-3"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
      
      {/* Save current settings */}
      <div className="space-y-2">
        <Label htmlFor="preset-name" className="text-sm font-medium">
          Save Current Settings
        </Label>
        <div className="flex gap-2">
          <Input
            id="preset-name"
            placeholder="Enter preset name..."
            value={newPresetName}
            onChange={(e) => setNewPresetName(e.target.value)}
            disabled={disabled}
            className="flex-1"
          />
          <Button
            size="sm"
            onClick={saveCurrentAsPreset}
            disabled={!newPresetName.trim() || disabled}
            className="px-3"
          >
            <Save className="w-4 h-4" />
          </Button>
        </div>
      </div>
      
      {disabled && (
        <p className="text-sm text-muted-foreground">
          Presets can only be managed when timer is stopped
        </p>
      )}
    </div>
  );
};