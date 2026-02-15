import { Check, Circle } from 'lucide-react';
import { Task } from '../../shared/types/task';
import clsx from 'clsx';
import styles from './TaskItem.module.css';
import { useState } from 'react';

interface TaskItemProps {
  task: Task;
  onToggle: (id: string) => void;
}

export function TaskItem({ task, onToggle }: TaskItemProps) {
  // Use local state for immediate feedback, but sync with props in a real app
  const [complete, setComplete] = useState(task.status === 'completed');

  const handleToggle = () => {
    const newState = !complete;
    setComplete(newState);
    onToggle(task.id);
  };

  return (
    <div className={clsx(styles.taskItem, complete && styles.completed)}>
      <button 
        className={styles.checkbox} 
        onClick={handleToggle}
        aria-label={complete ? "Mark as incomplete" : "Mark as complete"}
      >
        {complete ? (
          <div className={styles.checkedCircle}>
            <Check size={14} strokeWidth={3} />
          </div>
        ) : (
          <Circle size={22} className={styles.uncheckedCircle} />
        )}
      </button>

      <div className={styles.content}>
        <span className={styles.title}>{task.title}</span>
        {task.notes && <span className={styles.notes}>{task.notes}</span>}
        
        <div className={styles.meta}>
          {task.date && (
            <span className={clsx(styles.tag, styles.dateTag)}>
              {new Date(task.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            </span>
          )}
          {task.status === 'someday' && <span className={styles.tag}>Someday</span>}
          {task.tags?.map(tag => (
            <span key={tag} className={styles.tag}>#{tag}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
