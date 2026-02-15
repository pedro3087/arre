import { Timestamp } from 'firebase/firestore';
import { TaskStatus } from '../../shared/types/task';

export interface TaskDocument {
  id: string; // Document ID
  title: string;
  notes?: string;
  status: TaskStatus;
  date?: string; // YYYY-MM-DD string is fine for query equality, or use Timestamp for precise time
  isEvening?: boolean;
  energy?: 'low' | 'neutral' | 'high';
  tags?: string[];
  projectId?: string;
  createdAt: Timestamp;
  completedAt?: Timestamp;
  updatedAt: Timestamp;
}

export interface ProjectDocument {
  id: string;
  title: string;
  color: string;
  order: number;
}
