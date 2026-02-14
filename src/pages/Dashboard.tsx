import { useTasks } from '../features/tasks/hooks/useTasks';
import { TaskItem } from '../features/tasks/TaskItem';
import styles from './Dashboard.module.css';

export function Dashboard() {
  const { tasks, loading, error, updateTask } = useTasks('today');

  const handleToggle = (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (task) {
      updateTask(id, { status: task.status === 'completed' ? 'todo' : 'completed' });
    }
  };

  if (loading) return <div className={styles.loading}>Loading tasks...</div>;
  if (error) return <div className={styles.error}>Error: {error}</div>;

  const todayTasks = tasks.filter(t => !t.isEvening);
  const eveningTasks = tasks.filter(t => t.isEvening);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Today</h1>
        <p className={styles.date}>{new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric' })}</p>
      </header>

      <div className={styles.taskList}>
        {todayTasks.map(task => (
          <TaskItem key={task.id} task={task} onToggle={handleToggle} />
        ))}
        {todayTasks.length === 0 && <p className={styles.emptyState}>No tasks for today. Enjoy!</p>}
      </div>

      {eveningTasks.length > 0 && (
        <section className={styles.eveningSection}>
          <h2 className={styles.eveningTitle}>This Evening</h2>
          <div className={styles.taskList}>
            {eveningTasks.map(task => (
              <TaskItem key={task.id} task={task} onToggle={handleToggle} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
