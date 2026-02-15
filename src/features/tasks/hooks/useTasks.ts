import { useEffect, useState } from 'react';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  doc,
  getDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { useAuth } from '../../../lib/auth/AuthContext';
import { TaskDocument } from '../../../lib/types/firestore';
import { Task } from '../../../shared/types/task';

// Convert Firestore doc to App Task type
const convertTask = (doc: any): Task => {
  const data = doc.data() as TaskDocument;
  return {
    ...data,
    id: doc.id,
    createdAt: data.createdAt?.toDate().toISOString() || new Date().toISOString()
  } as Task;
};

export function useTasks(view?: 'today' | 'inbox' | 'upcoming' | 'anytime' | 'someday' | 'logbook') {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // CRUD actions need user but not necessarily view
  const addTask = async (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!user) return;
    try {
      await addDoc(collection(db, 'users', user.uid, 'tasks'), {
        ...task,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        status: task.status || 'todo'
      });
    } catch (e) {
      console.error("Error adding task", e);
      throw e;
    }
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    if (!user) {
      console.log('UpdateTask aborted. User is null.');
      return;
    }
    try {
      console.log('UpdateTask executing. ID:', id, 'Updates:', updates);
      const taskRef = doc(db, 'users', user.uid, 'tasks', id);
      const firestoreUpdates: any = { ...updates, updatedAt: serverTimestamp() };
      
      // If status is changing to completed, set completedAt
      if (updates.status === 'completed') {
        firestoreUpdates.completedAt = serverTimestamp();
      }

      await updateDoc(taskRef, firestoreUpdates);
      
      // Verification
      const verifySnap = await getDoc(taskRef);
      console.log('VERIFY TITLE:', verifySnap.exists() ? (verifySnap.data() as any).title : 'DOC MISSING');
    } catch (e) {
      console.error("Error updating task", e);
      throw e;
    }
  };

  const deleteTask = async (id: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'tasks', id));
    } catch (e) {
      console.error("Error deleting task", e);
      throw e;
    }
  };

  useEffect(() => {
    if (!user || !view) {
      if (!view) setLoading(false);
      else setTasks([]);
      return;
    }

    const tasksRef = collection(db, 'users', user.uid, 'tasks');
    let q;
    
    console.log('useTasks useEffect running. View:', view, 'User:', user.uid);

    const today = new Date().toISOString().split('T')[0];

    // Query Logic per View (matches PENDING_UI_FEATURES.md)
    switch (view) {
      case 'today':
        q = query(
          tasksRef, 
          where('date', '==', today), 
          where('status', '!=', 'completed'),
          orderBy('isEvening', 'asc'),
          orderBy('createdAt', 'desc')
        );
        break;
        
      case 'inbox':
        q = query(
          tasksRef,
          where('date', '==', null),
          where('status', '!=', 'completed'),
          orderBy('createdAt', 'desc')
        );
        break;

      case 'upcoming':
        q = query(
          tasksRef,
          where('date', '>', today),
          where('status', '!=', 'completed'),
          orderBy('date', 'asc')
        );
        break;

      case 'anytime':
        q = query(
          tasksRef,
          where('date', '==', null),
          where('projectId', '!=', null),
          where('status', '!=', 'completed')
        );
        break;

       case 'someday':
        q = query(tasksRef, where('status', '==', 'someday'));
        break;

      case 'logbook':
        q = query(
          tasksRef, 
          where('status', '==', 'completed'), 
          orderBy('completedAt', 'desc')
        );
        break;

      default:
        q = query(tasksRef, orderBy('createdAt', 'desc'));
    }

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const fetchedTasks = snapshot.docs.map(convertTask);
        console.log('SNAPSHOT FIRED. View:', view, 'Count:', fetchedTasks.length, 'Titles:', fetchedTasks.map(t => t.title));
        setTasks(fetchedTasks);
        setLoading(false);
      },
      (err) => {
        console.error("Error fetching tasks:", err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user, view]);

  return { tasks, loading, error, addTask, updateTask, deleteTask };
}
