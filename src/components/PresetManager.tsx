import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Save, Trash2, Download } from 'lucide-react';
import { TimerPreset, TimerSettings } from './IntervalTimer';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

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

export const PresetManager = ({ currentSettings, currentExercises, onLoadPreset, disabled }: PresetManagerProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [presetName, setPresetName] = useState('');
  const [userPresets, setUserPresets] = useState<TimerPreset[]>([]);
  const [selectedPreset, setSelectedPreset] = useState<string>('');
  const [loading, setLoading] = useState(false);

  // Load user presets from database
  useEffect(() => {
    if (user) {
      loadPresets();
    }
  }, [user]);

  const loadPresets = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_presets')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const presets: TimerPreset[] = data?.map(preset => ({
        name: preset.name,
        workDuration: preset.work_duration,
        restDuration: preset.rest_duration,
        rounds: preset.rounds,
        exercises: preset.exercises as string[] || []
      })) || [];

      setUserPresets(presets);
    } catch (error) {
      console.error('Error loading presets:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load your saved presets.'
      });
    } finally {
      setLoading(false);
    }
  };

  const savePreset = async () => {
    if (!user || !presetName.trim()) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: !user ? 'Please sign in to save presets.' : 'Please enter a preset name.'
      });
      return;
    }

    setLoading(true);
    try {
      // Check if preset name already exists
      const { data: existingPreset } = await supabase
        .from('user_presets')
        .select('id')
        .eq('user_id', user.id)
        .eq('name', presetName.trim())
        .single();

      const presetData = {
        user_id: user.id,
        name: presetName.trim(),
        work_duration: currentSettings.workDuration,
        rest_duration: currentSettings.restDuration,
        rounds: currentSettings.rounds,
        exercises: currentExercises
      };

      if (existingPreset) {
        // Update existing preset
        const { error } = await supabase
          .from('user_presets')
          .update(presetData)
          .eq('id', existingPreset.id);

        if (error) throw error;

        toast({
          title: '✅ Preset Updated',
          description: `"${presetName.trim()}" has been updated.`
        });
      } else {
        // Create new preset
        const { error } = await supabase
          .from('user_presets')
          .insert([presetData]);

        if (error) throw error;

        toast({
          title: '💾 Preset Saved',
          description: `"${presetName.trim()}" has been saved.`
        });
      }

      setPresetName('');
      await loadPresets(); // Reload presets
    } catch (error) {
      console.error('Error saving preset:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to save preset. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const deletePreset = async (presetName: string) => {
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('user_presets')
        .delete()
        .eq('user_id', user.id)
        .eq('name', presetName);

      if (error) throw error;

      // Clear selection if deleted preset was selected
      if (selectedPreset === presetName) {
        setSelectedPreset('');
      }
      
      toast({
        title: '🗑️ Preset Deleted',
        description: `"${presetName}" has been deleted.`
      });

      await loadPresets(); // Reload presets
    } catch (error) {
      console.error('Error deleting preset:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete preset. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadPreset = (presetName: string) => {
    // Check both default and user presets
    const allPresets = [...DEFAULT_PRESETS, ...userPresets];
    const preset = allPresets.find(p => p.name === presetName);
    
    if (preset) {
      onLoadPreset(preset);
      toast({
        title: '📥 Preset Loaded',
        description: `"${preset.name}" settings have been applied.`
      });
    }
  };

  const allPresets = [...DEFAULT_PRESETS, ...userPresets];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground">Presets</h3>
      
      {/* Save current settings as preset */}
      <div className="space-y-2">
        <Label htmlFor="preset-name" className="text-sm font-medium">Save Current Settings</Label>
        <div className="flex gap-2">
          <Input
            id="preset-name"
            placeholder="Enter preset name..."
            value={presetName}
            onChange={(e) => setPresetName(e.target.value)}
            disabled={disabled || loading || !user}
          />
          <Button 
            onClick={savePreset}
            disabled={disabled || loading || !user || !presetName.trim()}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {loading ? 'Saving...' : 'Save'}
          </Button>
        </div>
        {!user && (
          <p className="text-xs text-muted-foreground">Sign in to save custom presets</p>
        )}
      </div>

      <Separator />

      {/* Load saved presets */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Load Preset</Label>
        <Select value={selectedPreset} onValueChange={setSelectedPreset} disabled={disabled || loading}>
          <SelectTrigger>
            <SelectValue placeholder={loading ? "Loading presets..." : allPresets.length === 0 ? "No presets available" : "Choose a preset"} />
          </SelectTrigger>
          <SelectContent>
            {DEFAULT_PRESETS.map((preset) => (
              <SelectItem key={`default-${preset.name}`} value={preset.name}>
                <div className="flex flex-col items-start">
                  <span className="font-medium">{preset.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {preset.workDuration}s work, {preset.restDuration}s rest, {preset.rounds} rounds
                  </span>
                </div>
              </SelectItem>
            ))}
            {userPresets.length > 0 && (
              <>
                <SelectItem disabled value="user-presets-header">
                  <span className="text-xs font-semibold text-muted-foreground">Your Custom Presets</span>
                </SelectItem>
                {userPresets.map((preset) => (
                  <SelectItem key={`user-${preset.name}`} value={preset.name}>
                    <div className="flex flex-col items-start">
                      <span className="font-medium">{preset.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {preset.workDuration}s work, {preset.restDuration}s rest, {preset.rounds} rounds
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </>
            )}
          </SelectContent>
        </Select>

        {selectedPreset && (
          <div className="flex gap-2">
            <Button
              onClick={() => loadPreset(selectedPreset)}
              disabled={disabled || loading}
              className="flex items-center gap-2 flex-1"
            >
              <Download className="h-4 w-4" />
              Load Preset
            </Button>
            
            {/* Only show delete button for user presets */}
            {userPresets.some(p => p.name === selectedPreset) && (
              <Button 
                onClick={() => deletePreset(selectedPreset)}
                variant="destructive"
                size="sm"
                disabled={disabled || loading}
                className="flex items-center gap-2"
              >
                <Trash2 className="h-3 w-3" />
                {loading ? 'Deleting...' : 'Delete'}
              </Button>
            )}
          </div>
        )}
      </div>

      {disabled && (
        <p className="text-sm text-muted-foreground">
          Presets can only be managed when timer is stopped
        </p>
      )}
    </div>
  );
};