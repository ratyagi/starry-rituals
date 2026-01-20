import { useState } from 'react';
import { Habit } from '@/types/habit';
import { cn } from '@/lib/utils';

interface HabitStarProps {
  habit: Habit;
  isCompleted: boolean;
  momentum: number;
  onToggle: () => void;
  onEdit: () => void;
  delay?: number;
}

const importanceScale = {
  low: 1,
  medium: 1.2,
  high: 1.4,
};

export function HabitStar({
  habit,
  isCompleted,
  momentum,
  onToggle,
  onEdit,
  delay = 0,
}: HabitStarProps) {
  const [isPressed, setIsPressed] = useState(false);
  const scale = importanceScale[habit.importance];

  return (
    <div
      className="relative group animate-fade-in"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Momentum ring */}
      <div
        className={cn(
          'absolute inset-0 rounded-full transition-all duration-500',
          momentum > 70 && 'bg-gradient-blue-glow opacity-50'
        )}
        style={{
          transform: `scale(${1.3 + (momentum / 100) * 0.3})`,
        }}
      />

      {/* Star button */}
      <button
        onClick={onToggle}
        onMouseDown={() => setIsPressed(true)}
        onMouseUp={() => setIsPressed(false)}
        onMouseLeave={() => setIsPressed(false)}
        onDoubleClick={onEdit}
        className={cn(
          'relative flex items-center justify-center rounded-full transition-all duration-300 ease-out',
          'focus:outline-none focus:ring-2 focus:ring-swirl focus:ring-offset-2 focus:ring-offset-background',
          isCompleted
            ? 'bg-star shadow-star animate-star-glow'
            : 'bg-secondary hover:bg-secondary/80',
          isPressed && 'scale-95'
        )}
        style={{
          width: `${60 * scale}px`,
          height: `${60 * scale}px`,
        }}
        title={`${habit.name} - Double click to edit`}
      >
        {/* Inner glow for completed */}
        {isCompleted && (
          <div className="absolute inset-2 rounded-full bg-moonlight/30 blur-sm" />
        )}

        {/* Star icon or emoji */}
        <span
          className={cn(
            'relative text-lg transition-transform duration-300',
            isCompleted ? 'text-night-sky' : 'text-muted-foreground'
          )}
          style={{ fontSize: `${18 * scale}px` }}
        >
          {habit.icon || '✦'}
        </span>
      </button>

      {/* Label */}
      <div
        className={cn(
          'absolute left-1/2 -translate-x-1/2 mt-2 text-center transition-all duration-300',
          'opacity-0 group-hover:opacity-100'
        )}
        style={{ top: `${60 * scale}px` }}
      >
        <span
          className={cn(
            'text-xs font-medium px-2 py-1 rounded-full whitespace-nowrap',
            isCompleted
              ? 'bg-star/20 text-star'
              : 'bg-secondary text-muted-foreground'
          )}
        >
          {habit.name}
        </span>

        {/* Momentum indicator */}
        {momentum > 0 && (
          <div className="mt-1 flex justify-center gap-0.5">
            {[...Array(7)].map((_, i) => (
              <div
                key={i}
                className={cn(
                  'w-1 h-1 rounded-full transition-all duration-300',
                  i < Math.round(momentum / 14.3)
                    ? isCompleted
                      ? 'bg-star'
                      : 'bg-swirl'
                    : 'bg-border'
                )}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
