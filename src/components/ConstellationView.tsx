import { useMemo } from 'react';
import { Habit, HabitData } from '@/types/habit';
import { HabitStar } from './HabitStar';
import { isHabitCompleted, calculateMomentum, getTodayKey } from '@/lib/storage';

interface ConstellationViewProps {
  data: HabitData;
  onToggleHabit: (habitId: string) => void;
  onEditHabit: (habit: Habit) => void;
}

export function ConstellationView({
  data,
  onToggleHabit,
  onEditHabit,
}: ConstellationViewProps) {
  const today = getTodayKey();
  const activeHabits = data.habits.filter((h) => !h.archived);

  // Generate constellation positions
  const positions = useMemo(() => {
    const count = activeHabits.length;
    if (count === 0) return [];

    // Create an organic, constellation-like layout
    const centerX = 50;
    const centerY = 50;
    const maxRadius = 35;

    return activeHabits.map((_, index) => {
      // Use golden angle for even distribution
      const goldenAngle = Math.PI * (3 - Math.sqrt(5));
      const angle = index * goldenAngle;
      const radius = Math.sqrt(index / count) * maxRadius;

      // Add some controlled randomness for organic feel
      const jitterX = (Math.sin(index * 7.3) * 5);
      const jitterY = (Math.cos(index * 11.7) * 5);

      return {
        x: centerX + Math.cos(angle) * radius + jitterX,
        y: centerY + Math.sin(angle) * radius + jitterY,
      };
    });
  }, [activeHabits.length]);

  if (activeHabits.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <div className="text-4xl mb-4 animate-float">✦</div>
        <p className="text-muted-foreground text-lg">
          Your constellation awaits
        </p>
        <p className="text-muted-foreground/70 text-sm mt-2">
          Add your first habit to begin shaping your night sky
        </p>
      </div>
    );
  }

  const completedCount = activeHabits.filter((h) =>
    isHabitCompleted(data, h.id, today)
  ).length;

  return (
    <div className="relative w-full aspect-square max-w-lg mx-auto">
      {/* Connection lines between stars */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid meet"
      >
        {positions.map((pos, i) => {
          if (i === 0) return null;
          const prevPos = positions[i - 1];
          const isConnected =
            isHabitCompleted(data, activeHabits[i].id, today) &&
            isHabitCompleted(data, activeHabits[i - 1].id, today);

          return (
            <line
              key={i}
              x1={`${prevPos.x}%`}
              y1={`${prevPos.y}%`}
              x2={`${pos.x}%`}
              y2={`${pos.y}%`}
              className={`transition-all duration-500 ${
                isConnected ? 'stroke-star/40' : 'stroke-border/30'
              }`}
              strokeWidth="0.3"
              strokeDasharray={isConnected ? '0' : '1 1'}
            />
          );
        })}
      </svg>

      {/* Stars */}
      {activeHabits.map((habit, index) => (
        <div
          key={habit.id}
          className="absolute transform -translate-x-1/2 -translate-y-1/2"
          style={{
            left: `${positions[index]?.x || 50}%`,
            top: `${positions[index]?.y || 50}%`,
          }}
        >
          <HabitStar
            habit={habit}
            isCompleted={isHabitCompleted(data, habit.id, today)}
            momentum={calculateMomentum(data, habit.id)}
            onToggle={() => onToggleHabit(habit.id)}
            onEdit={() => onEditHabit(habit)}
            delay={index * 50}
          />
        </div>
      ))}

      {/* Completion indicator */}
      {completedCount === activeHabits.length && activeHabits.length > 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-gradient-star-glow w-32 h-32 rounded-full animate-star-pulse opacity-30" />
        </div>
      )}
    </div>
  );
}
