import { useEffect, useState } from 'react';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  writeBatch,
  getDocs,
  where,
} from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { useAuth } from '../../../lib/auth/AuthContext';
import { KanbanStatus } from '../../../shared/types/task';

const DEFAULT_STATUSES = [
  { label: 'To Do', order: 0, isFinal: false },
  { label: 'In Progress', order: 1, isFinal: false },
  { label: 'Done', order: 2, isFinal: true },
];

export function useKanbanStatuses() {
  const { user } = useAuth();
  const [statuses, setStatuses] = useState<KanbanStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setStatuses([]);
      setLoading(false);
      return;
    }

    const statusesRef = collection(db, 'users', user.uid, 'kanbanStatuses');
    const q = query(statusesRef, orderBy('order', 'asc'));

    let seeded = false; // local flag — prevents double-seed within this effect run

    const unsubscribe = onSnapshot(
      q,
      async (snapshot) => {
        if (snapshot.empty && !seeded) {
          seeded = true;
          const batch = writeBatch(db);
          DEFAULT_STATUSES.forEach((s) => {
            const newRef = doc(statusesRef);
            batch.set(newRef, { ...s, createdAt: new Date().toISOString() });
          });
          await batch.commit();
          // listener will fire again with the new docs — nothing more to do here
          return;
        }
        const fetched = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as KanbanStatus[];
        setStatuses(fetched);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching kanban statuses:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const seedDefaults = async () => {
    if (!user) return;
    const statusesRef = collection(db, 'users', user.uid, 'kanbanStatuses');
    const snapshot = await getDocs(statusesRef);
    if (!snapshot.empty) return;

    const batch = writeBatch(db);
    DEFAULT_STATUSES.forEach((s) => {
      const newRef = doc(statusesRef);
      batch.set(newRef, { ...s, createdAt: new Date().toISOString() });
    });
    await batch.commit();
  };

  const addStatus = async (label: string) => {
    if (!user) return;
    const nextOrder =
      statuses.length > 0 ? Math.max(...statuses.map((s) => s.order)) + 1 : 0;
    const statusesRef = collection(db, 'users', user.uid, 'kanbanStatuses');
    await addDoc(statusesRef, {
      label,
      order: nextOrder,
      isFinal: false,
      createdAt: new Date().toISOString(),
    });
  };

  const updateStatus = async (id: string, changes: Partial<Omit<KanbanStatus, 'id'>>) => {
    if (!user) return;
    const statusRef = doc(db, 'users', user.uid, 'kanbanStatuses', id);
    await updateDoc(statusRef, changes as any);
  };

  const deleteStatus = async (id: string) => {
    if (!user) return;
    const tasksRef = collection(db, 'users', user.uid, 'tasks');
    const q = query(tasksRef, where('kanbanStatusId', '==', id));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      throw new Error(
        `Cannot delete: ${snapshot.size} task(s) are in this column. Move them first.`
      );
    }
    await deleteDoc(doc(db, 'users', user.uid, 'kanbanStatuses', id));
  };

  const reorderStatuses = async (orderedIds: string[]) => {
    if (!user) return;
    const batch = writeBatch(db);
    orderedIds.forEach((id, index) => {
      const ref = doc(db, 'users', user.uid, 'kanbanStatuses', id);
      batch.update(ref, { order: index });
    });
    await batch.commit();
  };

  const setFinalStatus = async (id: string) => {
    if (!user) return;
    const batch = writeBatch(db);
    statuses.forEach((s) => {
      const ref = doc(db, 'users', user.uid, 'kanbanStatuses', s.id);
      batch.update(ref, { isFinal: s.id === id });
    });
    await batch.commit();
  };

  return {
    statuses,
    loading,
    error,
    seedDefaults,
    addStatus,
    updateStatus,
    deleteStatus,
    reorderStatuses,
    setFinalStatus,
  };
}
