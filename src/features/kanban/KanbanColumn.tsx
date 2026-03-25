import { useDroppable } from '@dnd-kit/core';
import { CheckCircle } from 'lucide-react';
import clsx from 'clsx';
import { Task, KanbanStatus, Project } from '../../shared/types/task';
import { KanbanCard } from './KanbanCard';
import styles from './KanbanColumn.module.css';

interface KanbanColumnProps {
  status: KanbanStatus;
  tasks: Task[];
  projects: Project[];
  onEditRequest: (task: Task) => void;
}

export function KanbanColumn({ status, tasks, projects, onEditRequest }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: status.id });

  return (
    <div className={styles.column}>
      <div className={styles.header}>
        <span className={styles.label}>{status.label}</span>
        <div className={styles.headerRight}>
          {status.isFinal && (
            <span title="Completing tasks here moves them to Logbook">
              <CheckCircle size={14} className={styles.finalIcon} />
            </span>
          )}
          <span className={styles.count}>{tasks.length}</span>
        </div>
      </div>

      <div
        ref={setNodeRef}
        className={clsx(styles.dropZone, isOver && styles.dropOver)}
      >
        {tasks.length > 0 ? (
          <div className={styles.cardList}>
            {tasks.map((task) => (
              <KanbanCard
                key={task.id}
                task={task}
                projects={projects}
                onEditRequest={onEditRequest}
              />
            ))}
          </div>
        ) : (
          <div className={styles.emptyColumn}>
            <span>Drop tasks here</span>
          </div>
        )}
      </div>
    </div>
  );
}
