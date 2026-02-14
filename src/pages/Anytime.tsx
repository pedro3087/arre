import { MOCK_TASKS } from '../shared/data/mockData';
import { TaskItem } from '../features/tasks/TaskItem';
import styles from './Dashboard.module.css';

export function Anytime() {
  const anytimeTasks = MOCK_TASKS.filter(t => t.projectId);

  return (
    <div className={styles.container}>
       <header className={styles.header}>
        <h1 className={styles.title}>Anytime</h1>
        <p className={styles.date}>Projects</p>
      </header>
       <div className={styles.taskList}>
        {anytimeTasks.map(task => (
           <TaskItem key={task.id} task={task} onToggle={(id) => console.log('Toggle', id)} />
        ))}
         {anytimeTasks.length === 0 && <p className={styles.emptyState}>No active projects.</p>}
      </div>
    </div>
  );
}
