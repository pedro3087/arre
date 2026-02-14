import { Task, Project } from '../types/task';

const today = new Date().toISOString().split('T')[0];

export const MOCK_PROJECTS: Project[] = [
  { id: 'p1', title: 'Work', color: 'sapphire' },
  { id: 'p2', title: 'Personal', color: 'emerald' },
  { id: 'p3', title: 'Vacation', color: 'lavender' },
];

export const MOCK_TASKS: Task[] = [
  // --- TODAY ---
  {
    id: 't1',
    title: 'Review Q1 Roadmap',
    notes: 'Focus on strategic alignment.',
    status: 'todo',
    date: today,
    isEvening: false,
    tags: ['work', 'urgent'],
    createdAt: '2023-10-25T08:00:00Z',
    projectId: 'p1',
  },
  {
    id: 't2',
    title: 'Buy groceries for dinner',
    status: 'todo',
    date: today,
    isEvening: false,
    tags: ['errand'],
    createdAt: '2023-10-25T09:30:00Z',
  },
  {
    id: 't3',
    title: 'Call Mom',
    status: 'completed',
    date: today,
    isEvening: false,
    tags: ['personal'],
    createdAt: '2023-10-25T10:00:00Z',
  },

  // --- THIS EVENING ---
  {
    id: 't4',
    title: 'Read "Pragmatic Programmer"',
    status: 'todo',
    date: today,
    isEvening: true,
    tags: ['personal'],
    createdAt: '2023-10-25T18:00:00Z',
  },
  {
    id: 't5',
    title: 'Plan weekend hike',
    status: 'todo',
    date: today,
    isEvening: true,
    tags: ['personal'],
    createdAt: '2023-10-25T19:00:00Z',
    projectId: 'p2',
  },

  // --- INBOX ---
  {
    id: 't6',
    title: 'New idea for app logo',
    status: 'todo',
    createdAt: '2023-10-24T22:15:00Z',
    energy: 'neutral',
  },
  {
    id: 't7',
    title: 'Check car insurance renewal',
    status: 'todo',
    createdAt: '2023-10-24T14:00:00Z',
    energy: 'low',
  },
  {
    id: 't11',
    title: 'Finalize Q3 Financial Report',
    notes: 'Consolidate departmental spreadsheets and draft the executive summary.',
    status: 'todo',
    createdAt: '2023-10-24T10:00:00Z',
    energy: 'high',
    tags: ['work', 'urgent'],
  },
  {
    id: 't12',
    title: 'Architecture Review for Arre',
    status: 'todo',
    createdAt: '2023-10-24T11:00:00Z',
    energy: 'high',
    tags: ['work'],
  },

  // --- UPCOMING ---
  {
    id: 't8',
    title: 'Doctor Appointment',
    status: 'todo',
    date: '2023-12-01', // Example future date
    createdAt: '2023-10-20T10:00:00Z',
  },

  // --- ANYTIME ---
  {
    id: 't9',
    title: 'Learn Rust',
    status: 'todo',
    tags: ['personal'],
    projectId: 'p2',
    createdAt: '2023-09-15T00:00:00Z',
  },

  // --- SOMEDAY ---
  {
    id: 't10',
    title: 'Travel to Japan',
    status: 'todo',
    createdAt: '2023-01-01T00:00:00Z',
    projectId: 'p3',
  },
];
