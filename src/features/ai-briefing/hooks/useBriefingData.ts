import { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { useAuth } from '../../../lib/auth/AuthContext';
import { useProjects } from '../../projects/hooks/useProjects';

export function useBriefingData() {
  const { user } = useAuth();
  const { projects } = useProjects();
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTasks() {
      if (!user) {
        setLoading(false);
        return;
      }
      
      setLoading(true);
      setError(null);

      try {
        const tasksRef = collection(db, 'users', user.uid, 'tasks');
        // Fetch tasks that are active (not completed)
        const q = query(
          tasksRef,
          where('status', '==', 'todo')
        );

        const snapshot = await getDocs(q);
        const fetchedTasks = snapshot.docs.map(doc => {
          const data = doc.data() as any;
          return { ...data, id: doc.id };
        });

        // Add projectName to tasks
        const tasksWithProjectNames = fetchedTasks.map(t => {
          const project = projects.find(p => p.id === t.projectId);
          return {
            ...t,
            projectName: project ? project.title : 'No Project'
          };
        });

        setTasks(tasksWithProjectNames);
      } catch (err: any) {
        console.error("Error fetching tasks for briefing:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    if (projects && projects.length >= 0) { // Wait for projects to load (even if empty) to map names
      fetchTasks();
    }
  }, [user, projects]);

  return { tasks, projects, loading, error };
}
