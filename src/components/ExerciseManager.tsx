import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Plus, X } from 'lucide-react';

interface ExerciseManagerProps {
  exercises: string[];
  onChange: (exercises: string[]) => void;
  disabled: boolean;
}

export const ExerciseManager = ({
  exercises,
  onChange,
  disabled
}: ExerciseManagerProps) => {
  const [newExercise, setNewExercise] = useState('');

  const addExercise = () => {
    if (!newExercise.trim()) return;
    
    const exerciseName = newExercise.trim();
    if (!exercises.includes(exerciseName)) {
      onChange([...exercises, exerciseName]);
    }
    setNewExercise('');
  };

  const removeExercise = (index: number) => {
    onChange(exercises.filter((_, i) => i !== index));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addExercise();
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground mb-4">Exercises</h3>
      
      {/* Add new exercise */}
      <div className="space-y-2">
        <Label htmlFor="new-exercise" className="text-sm font-medium">
          Add Exercise
        </Label>
        <div className="flex gap-2">
          <Input
            id="new-exercise"
            placeholder="Enter exercise name..."
            value={newExercise}
            onChange={(e) => setNewExercise(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={disabled}
            className="flex-1"
          />
          <Button
            size="sm"
            onClick={addExercise}
            disabled={!newExercise.trim() || disabled}
            className="px-3"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>
      
      {/* Exercise list */}
      {exercises.length > 0 && (
        <div className="space-y-2">
          <Label className="text-sm font-medium">
            Current Exercises ({exercises.length})
          </Label>
          <div className="flex flex-wrap gap-2">
            {exercises.map((exercise, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="px-3 py-1 flex items-center gap-2"
              >
                <span>{exercise}</span>
                {!disabled && (
                  <button
                    onClick={() => removeExercise(index)}
                    className="ml-1 hover:bg-destructive/20 rounded-sm p-1"
                    aria-label={`Remove ${exercise}`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </Badge>
            ))}
          </div>
        </div>
      )}
      
      {exercises.length === 0 && (
        <p className="text-sm text-muted-foreground">
          No exercises added yet. Add exercises to cycle through during your workout.
        </p>
      )}
      
      {disabled && (
        <p className="text-sm text-muted-foreground">
          Exercises can only be managed when timer is stopped
        </p>
      )}
    </div>
  );
};