import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';
import styles from './MainLayout.module.css';

import { useState } from 'react';
import { useTasks } from '../features/tasks/hooks/useTasks';
import { NewTaskModal } from '../features/tasks/NewTaskModal';
import { Plus } from 'lucide-react';

export function MainLayout() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { addTask } = useTasks('inbox'); // View doesn't matter for addTask

  const handleSaveTask = async (newTask: any) => {
    try {
      await addTask(newTask);
    } catch (e) {
      console.error("Failed to add task", e);
    }
  };

  return (
    <div className={styles.layout}>
      <aside className={styles.sidebarWrapper}>
        <Sidebar onNewTask={() => setIsModalOpen(true)} />
      </aside>
      
      <main className={styles.mainContent}>
        <div className={styles.container}>
          <Outlet />
        </div>
      </main>

      <button 
        className={styles.fab} 
        onClick={() => setIsModalOpen(true)}
        aria-label="New Task"
        data-testid="btn-new-task-fab"
      >
        <Plus size={24} />
      </button>
      <BottomNav />
      
      <NewTaskModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleSaveTask}
      />
    </div>
  );
}
