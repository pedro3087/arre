import { useTasks } from '../features/tasks/hooks/useTasks';
import { TaskItem } from '../features/tasks/TaskItem';
import styles from './Dashboard.module.css';

export function Someday() {
  const { tasks, loading, error, updateTask } = useTasks('someday');

  // For someday tasks, toggling usually means "Activate" => Move to Todo/Inbox
  const handleActivate = (id: string) => {
    updateTask(id, { status: 'todo' });
  };

  if (loading) return <div className={styles.loading}>Loading tasks...</div>;
  if (error) return <div className={styles.error}>Error: {error}</div>;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Someday / Maybe</h1>
      </header>

      <div className={styles.taskList}>
        {tasks.map(task => (
           <TaskItem key={task.id} task={task} onToggle={handleActivate} />
        ))}
        {tasks.length === 0 && <p className={styles.emptyState}>No someday tasks.</p>}
      </div>
    </div>
  );
}
