import { useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { LayoutDashboard } from 'lucide-react';
import { MainLayoutContext } from '../layout/MainLayout';
import { KanbanBoard } from '../features/kanban/KanbanBoard';
import { useKanbanStatuses } from '../features/kanban/hooks/useKanbanStatuses';
import styles from './Kanban.module.css';

export function Kanban() {
  const { projects, openEditTaskModal } = useOutletContext<MainLayoutContext>();
  const { seedDefaults } = useKanbanStatuses();

  // Seed default columns on first visit if none exist
  useEffect(() => {
    seedDefaults();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.titleWrapper}>
          <LayoutDashboard size={22} className={styles.headerIcon} />
          <h1>Kanban</h1>
        </div>
        <p className={styles.subtitle}>Manage your project tasks visually</p>
      </header>

      <div className={styles.boardWrapper}>
        <KanbanBoard projects={projects} onEditTask={openEditTaskModal} />
      </div>
    </div>
  );
}
