import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';
import styles from './MainLayout.module.css';

import { useState } from 'react';
import { useTasks } from '../features/tasks/hooks/useTasks';
import { TaskEditorModal } from '../features/tasks/TaskEditorModal';
import { Plus } from 'lucide-react';
import { Task } from '../shared/types/task';

export type MainLayoutContext = {
  openNewTaskModal: () => void;
  openEditTaskModal: (task: Task) => void;
};

export function MainLayout() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const { addTask, updateTask } = useTasks('inbox'); // View doesn't matter for addTask/updateTask logic

  const openNewTaskModal = () => {
    setTaskToEdit(null);
    setIsModalOpen(true);
  };

  const openEditTaskModal = (task: Task) => {
    console.log('openEditTaskModal called with:', task.id);
    setTaskToEdit(task);
    setIsModalOpen(true);
  };

  const handleSaveTask = async (taskData: any) => {
    console.log('handleSaveTask called. Editing:', !!taskToEdit, 'Data:', taskData);
    try {
      if (taskToEdit) {
        await updateTask(taskToEdit.id, taskData);
      } else {
        await addTask(taskData);
      }
    } catch (e) {
      console.error("Failed to save task", e);
    }
  };

  return (
    <div className={styles.layout}>
      <aside className={styles.sidebarWrapper}>
        <Sidebar onNewTask={openNewTaskModal} />
      </aside>
      
      <main className={styles.mainContent}>
        <div className={styles.container}>
          <Outlet context={{ openNewTaskModal, openEditTaskModal } satisfies MainLayoutContext} />
        </div>
      </main>

      <button 
        className={styles.fab} 
        onClick={openNewTaskModal}
        aria-label="New Task"
        data-testid="btn-new-task-fab"
      >
        <Plus size={24} />
      </button>
      <BottomNav />
      
      <TaskEditorModal 
        key={isModalOpen ? 'open' : 'closed'}
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleSaveTask}
        initialData={taskToEdit}
      />
    </div>
  );
}
