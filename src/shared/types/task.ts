export type TaskStatus = 'todo' | 'completed' | 'canceled';
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
  createdAt: string;
}

export interface Project {
  id: string;
  title: string;
  color: string; // css variable name suffix (e.g., 'emerald')
}
