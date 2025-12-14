export enum Frequency {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MON_FRI = 'MON_FRI',
}

export interface Habit {
  id: string;
  name: string;
  description?: string;
  icon: string;
  color: string;
  frequency: Frequency;
  createdAt: number;
}

// Map: habitId -> { dateString: boolean }
export interface HabitLogs {
  [habitId: string]: {
    [dateStr: string]: boolean; // true = done
  };
}

export interface HabitStats {
  currentStreak: number;
  bestStreak: number;
  totalCompletions: number;
  completionRate: number;
}

export enum AppView {
  HOME = 'HOME',
  STATS = 'STATS',
}
