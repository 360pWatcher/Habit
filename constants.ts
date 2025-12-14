import { Frequency } from './types';

export const COLORS = [
  '#6366f1', // Indigo
  '#ec4899', // Pink
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#3b82f6', // Blue
  '#8b5cf6', // Violet
  '#ef4444', // Red
  '#14b8a6', // Teal
];

export const ICONS = [
  'activity', 'book', 'coffee', 'droplet', 'dumbbell', 
  'headphones', 'heart', 'moon', 'sun', 'zap', 'briefcase', 
  'code', 'music', 'smile', 'star'
];

export const INITIAL_HABITS = [
  {
    id: '1',
    name: 'Morning Meditation',
    description: '10 minutes of mindfulness',
    icon: 'sun',
    color: '#f59e0b',
    frequency: Frequency.DAILY,
    createdAt: Date.now(),
  },
  {
    id: '2',
    name: 'Drink Water',
    description: '2 liters daily',
    icon: 'droplet',
    color: '#3b82f6',
    frequency: Frequency.DAILY,
    createdAt: Date.now(),
  },
  {
    id: '3',
    name: 'Read Books',
    description: 'Read 20 pages',
    icon: 'book',
    color: '#8b5cf6',
    frequency: Frequency.WEEKLY,
    createdAt: Date.now(),
  }
];
