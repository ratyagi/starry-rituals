import { useState } from 'react';
import { Habit } from '@/types/habit';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface AddHabitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (habit: Omit<Habit, 'id' | 'createdAt' | 'archived'>) => void;
  editingHabit?: Habit | null;
  onDelete?: (habitId: string) => void;
}

const iconOptions = ['✦', '☀', '🌙', '⭐', '💫', '🌊', '🌿', '📖', '🧘', '💪', '🎵', '✨'];

const importanceOptions: { value: Habit['importance']; label: string }[] = [
  { value: 'low', label: 'Gentle' },
  { value: 'medium', label: 'Steady' },
  { value: 'high', label: 'Bright' },
];

export function AddHabitDialog({
  open,
  onOpenChange,
  onSave,
  editingHabit,
  onDelete,
}: AddHabitDialogProps) {
  const [name, setName] = useState(editingHabit?.name || '');
  const [icon, setIcon] = useState(editingHabit?.icon || '✦');
  const [importance, setImportance] = useState<Habit['importance']>(
    editingHabit?.importance || 'medium'
  );

  const handleSave = () => {
    if (!name.trim()) return;
    onSave({ name: name.trim(), icon, importance });
    setName('');
    setIcon('✦');
    setImportance('medium');
    onOpenChange(false);
  };

  const handleDelete = () => {
    if (editingHabit && onDelete) {
      onDelete(editingHabit.id);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            {editingHabit ? 'Edit Habit' : 'Add New Star'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          {/* Name input */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-muted-foreground">
              Name
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Morning meditation"
              className="bg-secondary border-border focus:border-swirl"
              autoComplete="off"
              autoFocus
            />
          </div>

          {/* Icon selector */}
          <div className="space-y-2">
            <Label className="text-muted-foreground">Icon</Label>
            <div className="flex flex-wrap gap-2">
              {iconOptions.map((opt) => (
                <button
                  key={opt}
                  onClick={() => setIcon(opt)}
                  className={cn(
                    'w-10 h-10 rounded-lg flex items-center justify-center text-lg transition-all duration-200',
                    icon === opt
                      ? 'bg-swirl/20 ring-2 ring-swirl'
                      : 'bg-secondary hover:bg-secondary/80'
                  )}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* Importance selector */}
          <div className="space-y-2">
            <Label className="text-muted-foreground">Importance (affects star size)</Label>
            <div className="flex gap-2">
              {importanceOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setImportance(opt.value)}
                  className={cn(
                    'flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200',
                    importance === opt.value
                      ? 'bg-swirl/20 text-swirl ring-1 ring-swirl'
                      : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            {editingHabit && onDelete && (
              <Button
                variant="outline"
                onClick={handleDelete}
                className="border-border text-muted-foreground hover:bg-secondary"
              >
                Archive
              </Button>
            )}
            <Button
              onClick={handleSave}
              disabled={!name.trim()}
              className="flex-1 bg-swirl text-primary-foreground hover:bg-swirl/90"
            >
              {editingHabit ? 'Save Changes' : 'Add to Sky'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
