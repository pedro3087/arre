import { useOutletContext } from 'react-router-dom';
import { MainLayoutContext } from '../layout/MainLayout';
import { useTasks } from '../features/tasks/hooks/useTasks';
import { TaskItem } from '../features/tasks/TaskItem';
import styles from './Dashboard.module.css';

export function Upcoming() {
  const { activeProjectId } = useOutletContext<MainLayoutContext>();
  const { tasks, loading, error, updateTask } = useTasks('upcoming', activeProjectId);

  const handleToggle = (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (task) {
      updateTask(id, { status: task.status === 'completed' ? 'todo' : 'completed' });
    }
  };

  if (loading) return <div className={styles.loading}>Loading tasks...</div>;
  if (error) return <div className={styles.error}>Error: {error}</div>;

  // Group tasks by date
  const groupedTasks = tasks.reduce((groups, task) => {
    const date = task.date || 'No Date';
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(task);
    return groups;
  }, {} as Record<string, typeof tasks>);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Upcoming</h1>
      </header>

      {Object.entries(groupedTasks).map(([date, dateTasks]) => (
        <section key={date} className={styles.section}>
          <h2 className={styles.sectionTitle}>
             {new Date(date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
          </h2>
          <div className={styles.taskList}>
            {dateTasks.map(task => (
              <TaskItem key={task.id} task={task} onToggle={handleToggle} />
            ))}
          </div>
        </section>
      ))}

      {tasks.length === 0 && (
        <p className={styles.emptyState}>No upcoming tasks scheduled.</p>
      )}
    </div>
  );
}
