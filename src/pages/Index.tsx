import { useState, useEffect, useCallback } from 'react';
import { Plus, Calendar, Moon } from 'lucide-react';
import { HabitData, Habit, ViewMode } from '@/types/habit';
import {
  loadData,
  saveData,
  toggleHabit,
  addHabit,
  updateHabit,
  deleteHabit,
  getTodayKey,
  formatDate,
  isHabitCompleted,
} from '@/lib/storage';
import { StarryBackground } from '@/components/StarryBackground';
import { ConstellationView } from '@/components/ConstellationView';
import { WeeklyView } from '@/components/WeeklyView';
import { AddHabitDialog } from '@/components/AddHabitDialog';
import { SaveRitual } from '@/components/SaveRitual';
import { cn } from '@/lib/utils';

export default function Index() {
  const [data, setData] = useState<HabitData>({ habits: [], logs: [] });
  const [viewMode, setViewMode] = useState<ViewMode>('daily');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);

  const today = getTodayKey();
  const activeHabits = data.habits.filter((h) => !h.archived);
  const completedCount = activeHabits.filter((h) =>
    isHabitCompleted(data, h.id, today)
  ).length;

  // Load data on mount
  useEffect(() => {
    setData(loadData());
  }, []);

  const handleToggleHabit = useCallback((habitId: string) => {
    setData((prev) => {
      const updated = toggleHabit(prev, habitId, today);
      saveData(updated);
      return updated;
    });
  }, [today]);

  const handleAddHabit = useCallback(
    (habit: Omit<Habit, 'id' | 'createdAt' | 'archived'>) => {
      if (editingHabit) {
        setData((prev) => {
          const updated = updateHabit(prev, editingHabit.id, habit);
          saveData(updated);
          return updated;
        });
      } else {
        setData((prev) => {
          const updated = addHabit(prev, habit);
          saveData(updated);
          return updated;
        });
      }
      setEditingHabit(null);
    },
    [editingHabit]
  );

  const handleDeleteHabit = useCallback((habitId: string) => {
    setData((prev) => {
      const updated = updateHabit(prev, habitId, { archived: true });
      saveData(updated);
      return updated;
    });
  }, []);

  const handleEditHabit = useCallback((habit: Habit) => {
    setEditingHabit(habit);
    setDialogOpen(true);
  }, []);

  const handleSave = useCallback(() => {
    saveData(data);
  }, [data]);

  const handleOpenDialog = useCallback(() => {
    setEditingHabit(null);
    setDialogOpen(true);
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Starry background */}
      <StarryBackground />

      {/* Gradient overlay */}
      <div className="fixed inset-0 bg-gradient-night pointer-events-none opacity-90" />

      {/* Main content */}
      <div className="relative z-10 min-h-screen flex flex-col px-4 py-8 max-w-2xl mx-auto">
        {/* Header */}
        <header className="text-center mb-8 animate-fade-in">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Moon className="w-5 h-5 text-swirl" />
            <h1 className="text-2xl font-light tracking-wide text-foreground">
              Starry Habits
            </h1>
          </div>
          <p className="text-muted-foreground">{formatDate(today)}</p>
        </header>

        {/* View toggle */}
        <div className="flex justify-center gap-2 mb-8 animate-fade-in" style={{ animationDelay: '100ms' }}>
          <button
            onClick={() => setViewMode('daily')}
            className={cn(
              'px-4 py-2 rounded-full text-sm font-medium transition-all duration-300',
              viewMode === 'daily'
                ? 'bg-swirl/20 text-swirl'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            Tonight
          </button>
          <button
            onClick={() => setViewMode('weekly')}
            className={cn(
              'px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-2',
              viewMode === 'weekly'
                ? 'bg-swirl/20 text-swirl'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Calendar className="w-4 h-4" />
            Week
          </button>
        </div>

        {/* Main view */}
        <div className="flex-1 flex flex-col items-center justify-center mb--5">
          {viewMode === 'daily' ? (
            <ConstellationView
              data={data}
              onToggleHabit={handleToggleHabit}
              onEditHabit={handleEditHabit}
            />
          ) : (
            <WeeklyView data={data} />
          )}
        </div>

        {/* Add habit button */}
        <div className="flex justify-center mb-8 animate-fade-in" style={{ animationDelay: '200ms' }}>
          <button
            onClick={handleOpenDialog}
            className={cn(
              'flex items-center gap-2 px-8 py-4 rounded-full',
              'bg-secondary/80 backdrop-blur-sm text-foreground',
              'hover:bg-secondary transition-all duration-300',
              'focus:outline-none focus:ring-2 focus:ring-swirl focus:ring-offset-2 focus:ring-offset-background'
            )}
          >
            <Plus className="w-5 h-5" />
            <span className="font-medium">Add Star</span>
          </button>
        </div>

        {/* Save ritual */}
        <div className="animate-fade-in" style={{ animationDelay: '300ms' }}>
          <SaveRitual
            onSave={handleSave}
            completedCount={completedCount}
            totalCount={activeHabits.length}
          />
        </div>

        {/* Footer quote */}
        <footer className="mt-12 text-center animate-fade-in" style={{ animationDelay: '400ms' }}>
          <p className="text-xs text-muted-foreground/60 italic">
            "You are not tracking habits. You are watching a constellation slowly form."
          </p>
        </footer>
      </div>

      {/* Add/Edit dialog */}
      <AddHabitDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSave={handleAddHabit}
        editingHabit={editingHabit}
        onDelete={handleDeleteHabit}
      />
    </div>
  );
}
