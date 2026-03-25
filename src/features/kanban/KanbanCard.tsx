import { useDraggable } from '@dnd-kit/core';
import { Edit2 } from 'lucide-react';
import clsx from 'clsx';
import { Task, PROJECT_COLORS, Project } from '../../shared/types/task';
import styles from './KanbanCard.module.css';

interface KanbanCardProps {
  task: Task;
  projects: Project[];
  onEditRequest: (task: Task) => void;
  isOverlay?: boolean;
}

function CardContent({ task, projects, onEditRequest }: Omit<KanbanCardProps, 'isOverlay'>) {
  const project = task.projectId
    ? projects.find((p) => p.id === task.projectId)
    : null;

  const getProjectHex = (color: string) =>
    PROJECT_COLORS.find((c) => c.name === color)?.hex || '#86868b';

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEditRequest(task);
  };

  return (
    <>
      <div className={styles.cardHeader}>
        <span className={styles.title}>{task.title}</span>
        <button className={styles.editBtn} onClick={handleEdit} title="Edit task">
          <Edit2 size={14} />
        </button>
      </div>

      {task.notes && <p className={styles.notes}>{task.notes}</p>}

      <div className={styles.meta}>
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
          <span className={styles.tag}>
            {new Date(task.date + 'T00:00:00').toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
            })}
          </span>
        )}
        {task.energy && (
          <span className={clsx(styles.tag, styles[`energy-${task.energy}`])}>
            {task.energy}
          </span>
        )}
        {task.tags?.map((tag) => (
          <span key={tag} className={styles.tag}>
            #{tag}
          </span>
        ))}
      </div>
    </>
  );
}

export function KanbanCard({ task, projects, onEditRequest, isOverlay }: KanbanCardProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: task.id,
    disabled: isOverlay,
  });

  return (
    <div
      ref={setNodeRef}
      {...(!isOverlay ? listeners : {})}
      {...(!isOverlay ? attributes : {})}
      className={clsx(
        styles.card,
        isDragging && styles.dragging,
        isOverlay && styles.overlay
      )}
    >
      <CardContent task={task} projects={projects} onEditRequest={onEditRequest} />
    </div>
  );
}
