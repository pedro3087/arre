import { MOCK_TASKS } from '../shared/data/mockData';
import { TaskItem } from '../features/tasks/TaskItem';
import styles from './Dashboard.module.css';

export function Someday() {
  const somedayTasks = MOCK_TASKS.filter(t => t.projectId === 'p3'); // Just mocking filter for now

  return (
    <div className={styles.container}>
       <header className={styles.header}>
        <h1 className={styles.title}>Someday</h1>
        <p className={styles.date}>Ideas for later</p>
      </header>
       <div className={styles.taskList}>
        {somedayTasks.map(task => (
           <TaskItem key={task.id} task={task} onToggle={(id) => console.log('Toggle', id)} />
        ))}
         {somedayTasks.length === 0 && <p className={styles.emptyState}>Start dreaming!</p>}
      </div>
    </div>
  );
}
