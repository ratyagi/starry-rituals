import { HabitData, Habit, DayLog } from '@/types/habit';

const STORAGE_KEY = 'starry-habits-data';

const defaultData: HabitData = {
  habits: [],
  logs: [],
};

export function loadData(): HabitData {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return defaultData;
    return JSON.parse(stored) as HabitData;
  } catch {
    return defaultData;
  }
}

export function saveData(data: HabitData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function getTodayKey(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getDayLog(data: HabitData, date: string): DayLog | undefined {
  return data.logs.find((log) => log.date === date);
}

export function isHabitCompleted(data: HabitData, habitId: string, date: string): boolean {
  const dayLog = getDayLog(data, date);
  return dayLog?.completedHabits.includes(habitId) ?? false;
}

export function toggleHabit(data: HabitData, habitId: string, date: string): HabitData {
  const existingLog = getDayLog(data, date);
  
  if (existingLog) {
    const isCompleted = existingLog.completedHabits.includes(habitId);
    const updatedCompletedHabits = isCompleted
      ? existingLog.completedHabits.filter((id) => id !== habitId)
      : [...existingLog.completedHabits, habitId];
    
    return {
      ...data,
      logs: data.logs.map((log) =>
        log.date === date
          ? { ...log, completedHabits: updatedCompletedHabits }
          : log
      ),
    };
  }
  
  return {
    ...data,
    logs: [...data.logs, { date, completedHabits: [habitId] }],
  };
}

export function addHabit(data: HabitData, habit: Omit<Habit, 'id' | 'createdAt' | 'archived'>): HabitData {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  
  const newHabit: Habit = {
    ...habit,
    id: crypto.randomUUID(),
    createdAt: `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`,
    archived: false,
  };
  
  return {
    ...data,
    habits: [...data.habits, newHabit],
  };
}

export function updateHabit(data: HabitData, habitId: string, updates: Partial<Habit>): HabitData {
  return {
    ...data,
    habits: data.habits.map((habit) =>
      habit.id === habitId ? { ...habit, ...updates } : habit
    ),
  };
}

export function deleteHabit(data: HabitData, habitId: string): HabitData {
  return {
    ...data,
    habits: data.habits.filter((habit) => habit.id !== habitId),
    logs: data.logs.map((log) => ({
      ...log,
      completedHabits: log.completedHabits.filter((id) => id !== habitId),
    })),
  };
}

export function getWeekDates(referenceDate: Date = new Date()): string[] {
  const dates: string[] = [];
  const startOfWeek = new Date(referenceDate);
  startOfWeek.setDate(referenceDate.getDate() - referenceDate.getDay());
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + i);
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    dates.push(`${year}-${month}-${day}`);
  }
  
  return dates;
}

export function calculateMomentum(data: HabitData, habitId: string): number {
  const last7Days = getWeekDates();
  let completedDays = 0;
  
  for (const date of last7Days) {
    if (isHabitCompleted(data, habitId, date)) {
      completedDays++;
    }
  }
  
  return Math.round((completedDays / 7) * 100);
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString + 'T00:00:00');
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

export function formatShortDate(dateString: string): string {
  const date = new Date(dateString + 'T00:00:00');
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    day: 'numeric',
  });
}
