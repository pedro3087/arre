import { useEffect, useState } from 'react';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
  getDocs,
  where,
  writeBatch,
  deleteField
} from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { useAuth } from '../../../lib/auth/AuthContext';
import { Project, ProjectColor } from '../../../shared/types/task';

const convertProject = (docSnap: any): Project => {
  const data = docSnap.data();
  return {
    id: docSnap.id,
    title: data.title,
    color: data.color || 'emerald',
    order: data.order ?? 0,
    createdAt: data.createdAt?.toDate().toISOString() || new Date().toISOString(),
    status: data.status,
    closedAt: data.closedAt,
  };
};

export function useProjects() {
  const { user } = useAuth();
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const addProject = async (title: string, color: ProjectColor) => {
    if (!user) return;
    try {
      const ref = await addDoc(collection(db, 'users', user.uid, 'projects'), {
        title,
        color,
        order: allProjects.filter(p => p.status !== 'closed').length,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return ref.id;
    } catch (e) {
      console.error('Error adding project', e);
      throw e;
    }
  };

  const updateProject = async (id: string, updates: Partial<Pick<Project, 'title' | 'color'>>) => {
    if (!user) return;
    try {
      const projectRef = doc(db, 'users', user.uid, 'projects', id);
      await updateDoc(projectRef, { ...updates, updatedAt: serverTimestamp() });
    } catch (e) {
      console.error('Error updating project', e);
      throw e;
    }
  };

  const deleteProject = async (id: string) => {
    if (!user) return;
    try {
      // 1. Find tasks associated with this project
      const tasksRef = collection(db, 'users', user.uid, 'tasks');
      const q = query(tasksRef, where('projectId', '==', id));
      const tasksSnap = await getDocs(q);

      // 2. Prepare Atomic Batch
      const batch = writeBatch(db);

      // 3. Unassign tasks (cascade logic: set projectId to null)
      tasksSnap.forEach((doc) => {
        // Use 'updatedAt' if schema supports it, otherwise just projectId
        batch.update(doc.ref, { projectId: null, updatedAt: serverTimestamp() });
      });

      // 4. Delete Project
      const projectRef = doc(db, 'users', user.uid, 'projects', id);
      batch.delete(projectRef);

      // 5. Commit
      await batch.commit();
    } catch (e) {
      console.error('Error deleting project', e);
      throw e;
    }
  };

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const projectsRef = collection(db, 'users', user.uid, 'projects');
    const q = query(projectsRef, orderBy('order', 'asc'));

    const unsubscribe = onSnapshot(q,
      (snapshot) => {
        const fetchedProjects = snapshot.docs.map(convertProject);
        setAllProjects(fetchedProjects);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching projects:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const reorderProjects = async (orderedIds: string[]) => {
    if (!user) return;
    const batch = writeBatch(db);
    orderedIds.forEach((id, index) => {
      const ref = doc(db, 'users', user.uid, 'projects', id);
      batch.update(ref, { order: index });
    });
    await batch.commit();
  };

  const closeProject = async (id: string, reassignments: Record<string, string | null>) => {
    if (!user) return;
    try {
      const batch = writeBatch(db);
      Object.entries(reassignments).forEach(([taskId, newProjectId]) => {
        const taskRef = doc(db, 'users', user.uid, 'tasks', taskId);
        batch.update(taskRef, { projectId: newProjectId ?? null, updatedAt: serverTimestamp() });
      });
      const projectRef = doc(db, 'users', user.uid, 'projects', id);
      batch.update(projectRef, {
        status: 'closed',
        closedAt: new Date().toISOString(),
        updatedAt: serverTimestamp(),
      });
      await batch.commit();
    } catch (e) {
      console.error('Error closing project', e);
      throw e;
    }
  };

  const reopenProject = async (id: string) => {
    if (!user) return;
    try {
      const projectRef = doc(db, 'users', user.uid, 'projects', id);
      await updateDoc(projectRef, {
        status: 'active',
        closedAt: deleteField(),
        updatedAt: serverTimestamp(),
      });
    } catch (e) {
      console.error('Error reopening project', e);
      throw e;
    }
  };

  const projects = allProjects.filter(p => p.status !== 'closed');
  const closedProjects = allProjects
    .filter(p => p.status === 'closed')
    .sort((a, b) => {
      if (!a.closedAt || !b.closedAt) return 0;
      return b.closedAt.localeCompare(a.closedAt);
    });

  return { projects, closedProjects, loading, error, addProject, updateProject, deleteProject, reorderProjects, closeProject, reopenProject };
}
