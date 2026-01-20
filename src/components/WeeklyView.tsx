import { HabitData } from '@/types/habit';
import { getWeekDates, isHabitCompleted, formatShortDate, getTodayKey } from '@/lib/storage';
import { cn } from '@/lib/utils';

interface WeeklyViewProps {
  data: HabitData;
}

export function WeeklyView({ data }: WeeklyViewProps) {
  const weekDates = getWeekDates();
  const today = getTodayKey();
  const activeHabits = data.habits.filter((h) => !h.archived);

  if (activeHabits.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Add habits to see your weekly constellation
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Week header */}
      <div className="grid grid-cols-7 gap-2">
        {weekDates.map((date) => (
          <div
            key={date}
            className={cn(
              'text-center py-2 rounded-lg transition-all duration-300',
              date === today
                ? 'bg-swirl/20 text-swirl'
                : 'text-muted-foreground'
            )}
          >
            <span className="text-xs font-medium">{formatShortDate(date)}</span>
          </div>
        ))}
      </div>

      {/* Star density map */}
      <div className="grid grid-cols-7 gap-2">
        {weekDates.map((date) => {
          const completedCount = activeHabits.filter((h) =>
            isHabitCompleted(data, h.id, date)
          ).length;
          const density = activeHabits.length > 0 
            ? completedCount / activeHabits.length 
            : 0;
          const isPast = date < today;
          const isFuture = date > today;

          return (
            <div
              key={date}
              className={cn(
                'aspect-square rounded-lg flex items-center justify-center relative overflow-hidden transition-all duration-500',
                'bg-secondary/50'
              )}
            >
              {/* Background glow based on density */}
              {density > 0 && !isFuture && (
                <div
                  className="absolute inset-0 transition-opacity duration-500"
                  style={{
                    background: `radial-gradient(circle, hsl(45, 90%, 61%, ${density * 0.4}) 0%, transparent 70%)`,
                  }}
                />
              )}

              {/* Stars representation */}
              <div className="relative z-10 flex flex-wrap justify-center gap-0.5 p-1">
                {activeHabits.map((habit) => {
                  const isCompleted = isHabitCompleted(data, habit.id, date);
                  return (
                    <div
                      key={habit.id}
                      className={cn(
                        'w-2 h-2 rounded-full transition-all duration-300',
                        isFuture
                          ? 'bg-border/50'
                          : isCompleted
                          ? 'bg-star'
                          : isPast
                          ? 'bg-border/30'
                          : 'bg-border'
                      )}
                      title={`${habit.name}: ${isCompleted ? 'Complete' : 'Incomplete'}`}
                    />
                  );
                })}
              </div>

              {/* Today marker */}
              {date === today && (
                <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-swirl" />
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-6 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-star" />
          <span>Complete</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-border" />
          <span>Pending</span>
        </div>
      </div>
    </div>
  );
}
