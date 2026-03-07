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
  serverTimestamp,
  deleteField
} from 'firebase/firestore';
import { db, functions } from '../../../lib/firebase';
import { useAuth } from '../../../lib/auth/AuthContext';
import { TaskDocument } from '../../../lib/types/firestore';
import { Task } from '../../../shared/types/task';
import { httpsCallable } from 'firebase/functions';

const parseFirestoreDate = (dateField: any): string | undefined => {
  if (!dateField) return undefined;
  if (typeof dateField === 'object' && 'toDate' in dateField && typeof dateField.toDate === 'function') {
    return dateField.toDate().toISOString();
  }
  if (typeof dateField === 'string' && !isNaN(new Date(dateField).getTime())) {
    return dateField;
  }
  if (dateField instanceof Date) {
    return dateField.toISOString();
  }
  return undefined;
};

// Convert Firestore doc to App Task type
const convertTask = (doc: any): Task => {
  const data = doc.data() as TaskDocument;
  
  return {
    ...data,
    id: doc.id,
    createdAt: parseFirestoreDate(data.createdAt) || new Date().toISOString(),
    updatedAt: parseFirestoreDate(data.updatedAt),
    completedAt: parseFirestoreDate(data.completedAt)
  } as Task;
};

export function useTasks(view?: 'today' | 'inbox' | 'upcoming' | 'anytime' | 'someday' | 'logbook' | null) {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [googleTasks, setGoogleTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingGoogle, setLoadingGoogle] = useState(false);
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
    if (!user) return;

    // Check if it's a Google Task based on the ID format
    if (id.startsWith('google_')) {
      const parts = id.split('_');
      // Format is google_${listId}_${taskId}
      if (parts.length >= 3) {
        const listId = parts[1];
        const taskId = parts.slice(2).join('_'); // In case taskId has underscores
        
        try {
          const updateGoogle = httpsCallable(functions, 'updateGoogleTask');
          
          // Only passing properties that Google Tasks supports updating right now (status)
          const payload: any = {
            listId,
            taskId
          };
          
          if (updates.status !== undefined) {
             payload.status = updates.status; // 'todo' or 'completed'
          }

          if (updates.title !== undefined) payload.title = updates.title;
          if (updates.notes !== undefined) payload.notes = updates.notes;
          
          await updateGoogle(payload);
          
          // Re-fetch Google Tasks to get the updated state
          // A more robust implementation would do optimistic UI updates here
          // but for now, we rely on the next fetch.
        } catch (e) {
          console.error("Error updating Google Task", e);
          throw e;
        }
      }
      return;
    }

    try {
      const taskRef = doc(db, 'users', user.uid, 'tasks', id);
      const firestoreUpdates: any = { ...updates, updatedAt: serverTimestamp() };
      
      // Keep completedAt in sync with status
      if (updates.status === 'completed') {
        firestoreUpdates.completedAt = new Date().toISOString();
      } else if (updates.status === 'todo') {
        firestoreUpdates.completedAt = deleteField();
      }

      await updateDoc(taskRef, firestoreUpdates);
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
    if (!user) {
      setTasks([]);
      setLoading(false);
      return;
    }

    // Optimization: If view is null, user only wants actions, not data.
    if (view === null) {
      setLoading(false);
      return;
    }

    const tasksRef = collection(db, 'users', user.uid, 'tasks');
    let q;
    const today = new Date().toISOString().split('T')[0];

    // Query Logic per View
    // Note: Using 'status == todo' instead of '!= completed' to avoid Firestore index issues
    // and invalid range+inequality combinations (especially for 'upcoming').
    switch (view) {
      case 'today':
        q = query(
          tasksRef, 
          where('date', '==', today), 
          where('status', '==', 'todo'),
          orderBy('isEvening', 'asc'),
          orderBy('createdAt', 'desc')
        );
        break;
        
      case 'inbox':
        q = query(
          tasksRef,
          where('date', '==', null),
          where('status', '==', 'todo'),
          orderBy('createdAt', 'desc')
        );
        break;

      case 'upcoming':
        q = query(
          tasksRef,
          where('date', '>', today),
          where('status', '==', 'todo'),
          orderBy('date', 'asc')
        );
        break;

      case 'anytime':
        q = query(
          tasksRef,
          where('date', '==', null),
          where('status', '==', 'todo'),
          orderBy('createdAt', 'desc')
        );
        break;

      case 'someday':
        q = query(
          tasksRef, 
          where('status', '==', 'someday'),
          orderBy('createdAt', 'desc')
        );
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

  // Fetch Google Tasks
  useEffect(() => {
    if (!user || view === null) {
      setGoogleTasks([]);
      setLoadingGoogle(false);
      return;
    }

    let isMounted = true;
    
    async function fetchGoogleTasks() {
      if (!user) return;
      setLoadingGoogle(true);
      try {
        const docRef = doc(db, 'users', user.uid, 'integrations', 'googleTasks');
        const docSnap = await getDoc(docRef);
        
        if (!docSnap.exists()) {
          if (isMounted) setGoogleTasks([]);
          return;
        }

        const data = docSnap.data();
        const selectedLists = data.selectedLists || [];
        
        if (selectedLists.length === 0) {
          if (isMounted) setGoogleTasks([]);
          return;
        }

        const getTasks = httpsCallable(functions, 'getGoogleTasks');
        let allGoogleTasks: Task[] = [];
        const todayDate = new Date().toISOString().split('T')[0];

        // Fetch each selected list
        const promises = selectedLists.map(async (listId: string) => {
          const isLogbook = view === 'logbook';
          console.log(`[useTasks] Fetching Google tasks for list: ${listId}`);
          try {
            const result = await getTasks({ listId, showCompleted: isLogbook, showHidden: isLogbook });
            const resData = result.data as any;
            const gTasks = resData.tasks || [];
            console.log(`[useTasks] Fetched ${gTasks.length} tasks from list: ${listId}`);
            
            return gTasks.map((gt: any): Task => {
              const dateStr = gt.due ? new Date(gt.due).toISOString().split('T')[0] : undefined;
              return {
                id: `google_${listId}_${gt.id}`,
                title: gt.title || '(No title)',
                notes: gt.notes,
                status: gt.status === 'completed' ? 'completed' : 'todo',
                date: dateStr,
                createdAt: gt.updated || new Date().toISOString(),
                updatedAt: gt.updated,
                completedAt: gt.completed,
                isGoogleTask: true,
                googleTaskListId: listId
              };
            });
          } catch (e) {
             console.error(`[useTasks] Error fetching list ${listId}`, e);
             return [];
          }
        });

        const listsOfTasks = await Promise.all(promises);
        listsOfTasks.forEach(list => {
          allGoogleTasks = [...allGoogleTasks, ...list];
        });
        
        console.log(`[useTasks] Total Google tasks mapped: ${allGoogleTasks.length}`);

        // Filter Google Tasks for current view locally
        let filteredTasks = allGoogleTasks;
        switch (view) {
          case 'today':
            filteredTasks = allGoogleTasks.filter(t => t.date === todayDate && t.status === 'todo');
            break;
          case 'inbox':
          case 'anytime':
            filteredTasks = allGoogleTasks.filter(t => !t.date && t.status === 'todo');
            break;
          case 'upcoming':
            filteredTasks = allGoogleTasks.filter(t => t.date && t.date > todayDate && t.status === 'todo');
            break;
          case 'someday':
            filteredTasks = []; // Someday not natively supported by Google Tasks
            break;
          case 'logbook':
            filteredTasks = allGoogleTasks.filter(t => t.status === 'completed');
            break;
          default:
            filteredTasks = allGoogleTasks;
        }

        if (isMounted) setGoogleTasks(filteredTasks);

      } catch (err: any) {
        console.error("Error fetching Google Tasks:", err);
      } finally {
        if (isMounted) setLoadingGoogle(false);
      }
    }

    fetchGoogleTasks();

    return () => {
      isMounted = false;
    };
  }, [user, view]);

  // Combine and Sort Tasks
  const combinedTasks = [...tasks, ...googleTasks];
  
  if (view === 'today') {
    combinedTasks.sort((a, b) => {
      if (a.isEvening === b.isEvening) {
        return b.createdAt.localeCompare(a.createdAt);
      }
      return a.isEvening ? 1 : -1;
    });
  } else if (view === 'logbook') {
    combinedTasks.sort((a, b) => {
      const aTime = a.completedAt || a.updatedAt || a.createdAt;
      const bTime = b.completedAt || b.updatedAt || b.createdAt;
      return bTime.localeCompare(aTime);
    });
  } else if (view === 'upcoming') {
    combinedTasks.sort((a, b) => {
      const aDate = a.date || '9999-12-31';
      const bDate = b.date || '9999-12-31';
      return aDate.localeCompare(bDate);
    });
  } else {
    // Default (inbox, anytime, someday)
    combinedTasks.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  return { 
    tasks: combinedTasks, 
    loading: loading || loadingGoogle, 
    error, 
    addTask, 
    updateTask, 
    deleteTask 
  };
}
