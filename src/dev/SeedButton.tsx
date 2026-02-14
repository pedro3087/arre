import { useState } from 'react';
import { collection, writeBatch, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../lib/auth/AuthContext';
import { MOCK_TASKS } from '../shared/data/mockData';
import { Database } from 'lucide-react';

export function SeedButton() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [seeded, setSeeded] = useState(false);

  const handleSeed = async () => {
    if (!user) return;
    setLoading(true);
    
    try {
      const batch = writeBatch(db);
      const tasksRef = collection(db, 'users', user.uid, 'tasks');
      const today = new Date().toISOString().split('T')[0];

      MOCK_TASKS.forEach(task => {
        const docRef = doc(tasksRef); // Auto-ID
        // Adjust mock dates to be relative to "today" for better demo
        let taskDate = task.date;
        if (task.date === '2023-10-24') taskDate = today; 

        batch.set(docRef, {
          title: task.title,
          notes: task.notes || '',
          status: task.status,
          date: taskDate || null,
          isEvening: task.isEvening || false,
          energy: task.energy || 'neutral',
          tags: task.tags || [],
          projectId: task.projectId || null,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      });

      await batch.commit();
      setSeeded(true);
      console.log('Database seeded!');
    } catch (e) {
      console.error('Seeding failed', e);
    } finally {
      setLoading(false);
    }
  };

  if (!user || user.email?.includes('prod')) return null; // Safety check

  return (
    <button 
      onClick={handleSeed} 
      disabled={loading || seeded}
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        background: seeded ? '#10b981' : '#f59e0b',
        color: 'white',
        padding: '10px 15px',
        borderRadius: '8px',
        border: 'none',
        cursor: 'pointer',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        zIndex: 9999
      }}
    >
      <Database size={16} />
      {loading ? 'Seeding...' : seeded ? 'Seeded!' : 'Seed DB'}
    </button>
  );
}
