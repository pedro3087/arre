export type TaskStatus = 'todo' | 'completed' | 'canceled' | 'someday';
export type TaskTag = 'work' | 'personal' | 'errand' | 'urgent';

export interface Task {
  id: string;
  title: string;
  notes?: string;
  status: TaskStatus;
  date?: string; // ISO date string YYYY-MM-DD
  isEvening?: boolean; // Specific to "This Evening" feature
  energy?: 'low' | 'neutral' | 'high';
  tags?: TaskTag[];
  projectId?: string;
  order?: number; // Custom ordering
  createdAt: string;
  updatedAt?: string;
  completedAt?: string;
  isGoogleTask?: boolean;
  googleTaskListId?: string;
}

export const PROJECT_COLORS = [
  { name: 'emerald', hex: '#10b981', label: 'Emerald' },
  { name: 'sapphire', hex: '#2563eb', label: 'Sapphire' },
  { name: 'ruby', hex: '#dc2626', label: 'Ruby' },
  { name: 'lavender', hex: '#7c3aed', label: 'Lavender' },
  { name: 'gold', hex: '#f59e0b', label: 'Gold' },
  { name: 'cyan', hex: '#06b6d4', label: 'Cyan' },
  { name: 'rose', hex: '#f43f5e', label: 'Rose' },
  { name: 'amber', hex: '#d97706', label: 'Amber' },
  { name: 'teal', hex: '#14b8a6', label: 'Teal' },
  { name: 'indigo', hex: '#6366f1', label: 'Indigo' },
] as const;

export type ProjectColor = typeof PROJECT_COLORS[number]['name'];

export interface Project {
  id: string;
  title: string;
  color: ProjectColor;
  createdAt?: string;
}
