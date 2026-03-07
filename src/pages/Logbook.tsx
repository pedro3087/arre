import { useTasks } from '../features/tasks/hooks/useTasks';
import { TaskItem } from '../features/tasks/TaskItem';
import { useAuth } from '../lib/auth/AuthContext';
import styles from './Logbook.module.css';
import { CheckSquare } from 'lucide-react';
import { useMemo } from 'react';
import { Task } from '../shared/types/task';

// Type representing a grouped set of tasks by date
interface LogbookGroup {
  dateLabel: string;
  dateKey: string;
  tasks: Task[];
}

export function Logbook() {
  const { user } = useAuth();
  const { tasks, loading, updateTask } = useTasks('logbook');

  // Group tasks by their completedAt date (or updated/created if completedAt is missing)
  const groupedTasks = useMemo(() => {
    const groups: Record<string, LogbookGroup> = {};

    tasks.forEach(task => {
      // Best effort to group by completion date.
      // If completedAt isn't present for some reason, fallback to updatedAt or createdAt
      const dateStr = task.completedAt || task.updatedAt || task.createdAt; 
      const dateObj = new Date(dateStr);
      
      // key like "YYYY-MM-DD"
      const dateKey = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;
      
      if (!groups[dateKey]) {
        // Formatting to "Month DD, YYYY"
        const dateLabel = dateObj.toLocaleDateString(undefined, {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
        
        groups[dateKey] = {
          dateKey,
          dateLabel,
          tasks: []
        };
      }
      
      groups[dateKey].tasks.push(task);
    });

    // Sort groups descending by dateKey
    return Object.values(groups).sort((a, b) => b.dateKey.localeCompare(a.dateKey));
  }, [tasks]);

  if (!user) return null;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.titleInfo}>
          <CheckSquare className={styles.headerIcon} size={28} />
          <h1>Logbook</h1>
        </div>
        <p className={styles.subtitle}>A history of everything you've completed.</p>
      </header>

      {loading ? (
        <div className={styles.emptyState}>Loading logbook...</div>
      ) : groupedTasks.length === 0 ? (
        <div className={styles.emptyState}>
          <CheckSquare size={48} className={styles.emptyIcon} />
          <p>Your logbook is empty.</p>
          <span>Tasks you complete will appear here.</span>
        </div>
      ) : (
        <div className={styles.logList}>
          {groupedTasks.map(group => (
            <div key={group.dateKey} className={styles.dateGroup}>
              <h2 className={styles.dateHeader}>{group.dateLabel}</h2>
              <ul className={styles.taskList}>
                {group.tasks.map((task) => (
                  <TaskItem 
                    key={task.id} 
                    task={task} 
                    onToggle={(id) => updateTask(id, { status: 'todo' })}
                  />
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
