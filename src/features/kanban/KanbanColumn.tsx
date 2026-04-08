import { useDroppable } from '@dnd-kit/core';
import { useSortable } from '@dnd-kit/sortable';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { CheckCircle, GripVertical } from 'lucide-react';
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
  // useSortable for the column itself (column reordering)
  const {
    attributes,
    listeners,
    setNodeRef: setSortableRef,
    transform,
    transition,
    isDragging: isColumnDragging,
  } = useSortable({
    id: status.id,
    data: { type: 'column', id: status.id },
  });

  // useDroppable for the inner task drop zone (task cross-column drops)
  const { setNodeRef: setDropRef, isOver } = useDroppable({ id: status.id });

  const columnStyle = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const taskIds = tasks.map((t) => t.id);

  return (
    <div
      ref={setSortableRef}
      style={columnStyle}
      className={clsx(styles.column, isColumnDragging && styles.columnDragging)}
    >
      <div className={styles.header}>
        <span
          className={styles.dragHandle}
          {...listeners}
          {...attributes}
          title="Drag to reorder column"
        >
          <GripVertical size={14} />
        </span>
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
        ref={setDropRef}
        className={clsx(styles.dropZone, isOver && styles.dropOver)}
      >
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          {tasks.length > 0 ? (
            <div className={styles.cardList}>
              {tasks.map((task) => (
                <KanbanCard
                  key={task.id}
                  task={task}
                  projects={projects}
                  onEditRequest={onEditRequest}
                  columnId={status.id}
                />
              ))}
            </div>
          ) : (
            <div className={styles.emptyColumn}>
              <span>Drop tasks here</span>
            </div>
          )}
        </SortableContext>
      </div>
    </div>
  );
}
