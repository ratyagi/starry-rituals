export interface Habit {
  id: string;
  name: string;
  icon?: string;
  importance: 'low' | 'medium' | 'high';
  createdAt: string;
  archived: boolean;
}

export interface DayLog {
  date: string; // YYYY-MM-DD format
  completedHabits: string[]; // Array of habit IDs
  note?: string;
}

export interface HabitData {
  habits: Habit[];
  logs: DayLog[];
}

export type ViewMode = 'daily' | 'weekly' | 'monthly';
