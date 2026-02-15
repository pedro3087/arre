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
  writeBatch
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
    createdAt: data.createdAt?.toDate().toISOString() || new Date().toISOString(),
  };
};

export function useProjects() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const addProject = async (title: string, color: ProjectColor) => {
    if (!user) return;
    try {
      const ref = await addDoc(collection(db, 'users', user.uid, 'projects'), {
        title,
        color,
        order: projects.length,
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
    const q = query(projectsRef, orderBy('createdAt', 'asc'));

    const unsubscribe = onSnapshot(q,
      (snapshot) => {
        const fetchedProjects = snapshot.docs.map(convertProject);
        setProjects(fetchedProjects);
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

  return { projects, loading, error, addProject, updateProject, deleteProject };
}
