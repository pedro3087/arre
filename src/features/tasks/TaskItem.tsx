import { Check, Circle, Trash2, Edit2 } from 'lucide-react';
import { Task, Project, PROJECT_COLORS } from '../../shared/types/task';
import clsx from 'clsx';
import styles from './TaskItem.module.css';
import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { MainLayoutContext } from '../../layout/MainLayout';
import { useTasks } from './hooks/useTasks';

interface TaskItemProps {
  task: Task;
  onToggle: (id: string) => void;
}

export function TaskItem({ task, onToggle }: TaskItemProps) {
  const [complete, setComplete] = useState(task.status === 'completed');
  const { openEditTaskModal, projects } = useOutletContext<MainLayoutContext>();
  const { deleteTask } = useTasks();

  const handleToggle = () => {
    if (task.isGoogleTask) {
      alert("Completing Google Tasks from Arre is coming in Story 5!");
      return;
    }
    const newState = !complete;
    setComplete(newState);
    onToggle(task.id);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this task?')) {
      deleteTask(task.id);
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    openEditTaskModal(task);
  };

  const project = task.projectId
    ? projects?.find((p: Project) => p.id === task.projectId)
    : null;

  const getProjectHex = (color: string) =>
    PROJECT_COLORS.find(c => c.name === color)?.hex || '#86868b';

  return (
    <div 
      className={clsx(styles.taskItem, complete && styles.completed)}
      data-testid="task-item"
    >
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
          {task.isGoogleTask && (
            <span className={clsx(styles.tag, styles.googleTaskTag)} title={`Google Tasks: ${task.googleTaskListId}`}>
              <img 
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Google_Tasks_2021.svg/1200px-Google_Tasks_2021.svg.png" 
                alt="Google Task" 
                className={styles.googleIcon} 
              />
              Google Task
            </span>
          )}
          {project && (
            <span className={styles.projectBadge}>
              <span
                className={styles.projectDot}
                style={{ backgroundColor: getProjectHex(project.color) }}
              />
              {project.title}
            </span>
          )}
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

      <div className={styles.actions}>
        {!task.isGoogleTask && (
          <button className={styles.actionBtn} onClick={handleEdit} title="Edit">
            <Edit2 size={16} />
          </button>
        )}
        {!task.isGoogleTask && (
          <button className={styles.actionBtn} onClick={handleDelete} title="Delete">
            <Trash2 size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
