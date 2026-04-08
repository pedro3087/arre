import { useEffect, useState, useMemo, useCallback } from 'react';
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { useAuth } from '../../../lib/auth/AuthContext';
import { Task } from '../../../shared/types/task';
import { useKanbanStatuses } from './useKanbanStatuses';

export function useKanbanBoard(projectId: string | null) {
  const { user } = useAuth();
  const { statuses, loading: statusesLoading } = useKanbanStatuses();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [tasksLoading, setTasksLoading] = useState(true);

  useEffect(() => {
    if (!user || !projectId) {
      setTasks([]);
      setTasksLoading(false);
      return;
    }

    setTasksLoading(true);
    const tasksRef = collection(db, 'users', user.uid, 'tasks');
    // Single-field query only — avoids requiring a composite Firestore index.
    const q = query(
      tasksRef,
      where('projectId', '==', projectId)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const fetched = snapshot.docs
          .map((d) => ({ id: d.id, ...d.data() }) as Task);
        setTasks(fetched);
        setTasksLoading(false);
      },
      (err) => {
        console.error('Error fetching kanban tasks:', err);
        setTasksLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user, projectId]);

  // Group tasks by column:
  // - Completed tasks always go to the final column (isFinal:true), regardless of stored kanbanStatusId
  // - Active tasks use their kanbanStatusId if valid, otherwise fall back to the first column
  const tasksByColumn = useMemo<Record<string, Task[]>>(() => {
    if (statuses.length === 0) return {};
    const firstColumnId = statuses[0].id;
    const finalColumn = statuses.find((s) => s.isFinal);
    const finalColumnId = finalColumn?.id ?? firstColumnId;
    const result: Record<string, Task[]> = {};
    statuses.forEach((s) => {
      result[s.id] = [];
    });

    tasks.forEach((task) => {
      let colId: string;
      if (task.status === 'completed') {
        colId = finalColumnId;
      } else if (task.kanbanStatusId && result[task.kanbanStatusId] !== undefined) {
        colId = task.kanbanStatusId;
      } else {
        colId = firstColumnId;
      }
      result[colId].push(task);
    });

    return result;
  }, [tasks, statuses]);

  // Move a task to a new column; if the destination isFinal, auto-complete the task
  const moveTask = useCallback(
    async (taskId: string, toStatusId: string) => {
      if (!user) return;
      const destinationStatus = statuses.find((s) => s.id === toStatusId);
      if (!destinationStatus) return;

      // Optimistic update — immediately reflect the move in local state
      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId
            ? {
                ...t,
                kanbanStatusId: toStatusId,
                ...(destinationStatus.isFinal
                  ? { status: 'completed' as const, completedAt: new Date().toISOString() }
                  : { status: 'todo' as const, completedAt: undefined }),
              }
            : t
        )
      );

      try {
        const taskRef = doc(db, 'users', user.uid, 'tasks', taskId);
        if (destinationStatus.isFinal) {
          await updateDoc(taskRef, {
            status: 'completed',
            completedAt: new Date().toISOString(),
            kanbanStatusId: toStatusId,
            updatedAt: serverTimestamp(),
          });
        } else {
          await updateDoc(taskRef, {
            kanbanStatusId: toStatusId,
            updatedAt: serverTimestamp(),
          });
        }
      } catch (err) {
        console.error('Error moving task:', err);
        // The Firestore snapshot will revert the state automatically on next sync
      }
    },
    [user, statuses]
  );

  return {
    statuses,
    tasksByColumn,
    loading: tasksLoading || statusesLoading,
    moveTask,
  };
}
