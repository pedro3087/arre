import { MOCK_TASKS } from '../shared/data/mockData';
import { TaskItem } from '../features/tasks/TaskItem';
import styles from './Dashboard.module.css';

export function Upcoming() {
  const current = new Date().toISOString().split('T')[0];
  const upcomingTasks = MOCK_TASKS.filter(t => t.date && t.date > current);

  return (
    <div className={styles.container}>
       <header className={styles.header}>
        <h1 className={styles.title}>Upcoming</h1>
        <p className={styles.date}>Plan ahead</p>
      </header>

      <div className={styles.taskList}>
        {upcomingTasks.map(task => (
           <div key={task.id}>
             {/* Basic date header integration could happen here */}
             <p className={styles.date} style={{marginBottom: '0.5rem'}}>{task.date}</p>
             <TaskItem task={task} onToggle={(id) => console.log('Toggle', id)} />
           </div>
        ))}
         {upcomingTasks.length === 0 && <p className={styles.emptyState}>No upcoming tasks.</p>}
      </div>
    </div>
  );
}
