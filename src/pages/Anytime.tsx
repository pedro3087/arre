import { useTasks } from '../features/tasks/hooks/useTasks';
import { TaskItem } from '../features/tasks/TaskItem';
import styles from './Dashboard.module.css';

export function Anytime() {
  const { tasks, loading, error, updateTask } = useTasks('anytime');

  const handleToggle = (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (task) {
      updateTask(id, { status: task.status === 'completed' ? 'todo' : 'completed' });
    }
  };

  if (loading) return <div className={styles.loading}>Loading tasks...</div>;
  if (error) return <div className={styles.error}>Error: {error}</div>;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Anytime</h1>
      </header>

      <div className={styles.taskList}>
        {tasks.map(task => (
           <TaskItem key={task.id} task={task} onToggle={handleToggle} />
        ))}
        {tasks.length === 0 && <p className={styles.emptyState}>No tasks in Anytime.</p>}
      </div>
    </div>
  );
}
