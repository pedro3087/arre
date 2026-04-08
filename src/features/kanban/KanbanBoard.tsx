import { useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { SortableContext, arrayMove, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { LayoutDashboard } from 'lucide-react';
import clsx from 'clsx';
import { Task, Project, KanbanStatus, PROJECT_COLORS } from '../../shared/types/task';
import { KanbanColumn } from './KanbanColumn';
import { KanbanCard } from './KanbanCard';
import { useKanbanBoard } from './hooks/useKanbanBoard';
import styles from './KanbanBoard.module.css';

interface KanbanBoardProps {
  projects: Project[];
  onEditTask: (task: Task) => void;
}

function getProjectHex(color: string) {
  return PROJECT_COLORS.find((c) => c.name === color)?.hex || '#86868b';
}

/** Ghost rendered in DragOverlay when a column header is being dragged */
function ColumnGhost({ status, taskCount }: { status: KanbanStatus; taskCount: number }) {
  return (
    <div className={styles.columnGhost}>
      <span className={styles.columnGhostLabel}>{status.label}</span>
      <span className={styles.columnGhostCount}>{taskCount}</span>
    </div>
  );
}

export function KanbanBoard({ projects, onEditTask }: KanbanBoardProps) {
  // Project selection is by document ID (not list position), so drag-reordering
  // projects in the sidebar never affects which tasks are shown here.
  // useKanbanBoard filters tasks via where('projectId', '==', selectedProjectId).
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    projects.length > 0 ? projects[0].id : null
  );
  const { statuses, tasksByColumn, loading, moveTask, reorderColumns, reorderTasksInColumn } =
    useKanbanBoard(selectedProjectId);

  // Track what's being dragged: { type: 'column' | 'task', id: string }
  const [activeDrag, setActiveDrag] = useState<{ type: string; id: string } | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  const allTasks = Object.values(tasksByColumn).flat();
  const activeTask =
    activeDrag?.type === 'task'
      ? (allTasks.find((t) => t.id === activeDrag.id) ?? null)
      : null;
  const activeColumn =
    activeDrag?.type === 'column'
      ? (statuses.find((s) => s.id === activeDrag.id) ?? null)
      : null;

  const handleDragStart = (event: DragStartEvent) => {
    const type = (event.active.data.current?.type as string) ?? 'task';
    setActiveDrag({ type, id: event.active.id as string });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDrag(null);

    if (!over || active.id === over.id) return;

    const type = active.data.current?.type as string;

    if (type === 'column') {
      // Column reorder
      const oldIndex = statuses.findIndex((s) => s.id === active.id);
      const newIndex = statuses.findIndex((s) => s.id === over.id);
      if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
        const newOrder = arrayMove(statuses, oldIndex, newIndex);
        reorderColumns(newOrder.map((s) => s.id));
      }
      return;
    }

    // Task drag
    const taskId = active.id as string;
    const sourceColumnId = active.data.current?.columnId as string | undefined;
    // over could be a task (has columnId) or a column drop zone (its id is a status id)
    const overIsColumn = statuses.some((s) => s.id === over.id);
    const destColumnId = overIsColumn
      ? (over.id as string)
      : (over.data.current?.columnId as string | undefined);

    if (!destColumnId) return;

    if (sourceColumnId && sourceColumnId === destColumnId) {
      // Same-column reorder
      const columnTasks = tasksByColumn[sourceColumnId] ?? [];
      const oldIdx = columnTasks.findIndex((t) => t.id === taskId);
      const newIdx = columnTasks.findIndex((t) => t.id === over.id);
      if (oldIdx !== -1 && newIdx !== -1 && oldIdx !== newIdx) {
        const newOrder = arrayMove(
          columnTasks.map((t) => t.id),
          oldIdx,
          newIdx
        );
        reorderTasksInColumn(sourceColumnId, newOrder);
      }
    } else {
      // Cross-column move
      moveTask(taskId, destColumnId);
    }
  };

  if (projects.length === 0) {
    return (
      <div className={styles.emptyState}>
        <LayoutDashboard size={48} className={styles.emptyIcon} />
        <h3>No projects yet</h3>
        <p>Create a project first, then you can manage its tasks here.</p>
      </div>
    );
  }

  const selectedProject = projects.find((p) => p.id === selectedProjectId);
  const hasNoTasks = !loading && Object.values(tasksByColumn).every((col) => col.length === 0);

  return (
    <div className={styles.boardRoot}>
      {/* Project Picker */}
      <div className={styles.projectPicker}>
        {projects.map((project) => (
          <button
            key={project.id}
            className={clsx(
              styles.projectTab,
              selectedProjectId === project.id && styles.projectTabActive
            )}
            onClick={() => setSelectedProjectId(project.id)}
          >
            <span
              className={styles.projectDot}
              style={{ backgroundColor: getProjectHex(project.color) }}
            />
            <span className={styles.projectTabLabel}>{project.title}</span>
          </button>
        ))}
      </div>

      {/* Board */}
      {loading ? (
        <div className={styles.loadingState}>
          <div className={styles.spinner} />
          <span>Loading board…</span>
        </div>
      ) : hasNoTasks ? (
        <div className={styles.emptyState}>
          <LayoutDashboard size={36} className={styles.emptyIcon} />
          <h3>No active tasks in "{selectedProject?.title}"</h3>
          <p>Add tasks to this project and they'll appear here.</p>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={statuses.map((s) => s.id)}
            strategy={horizontalListSortingStrategy}
          >
            <div className={styles.columns}>
              {statuses.map((status) => (
                <KanbanColumn
                  key={status.id}
                  status={status}
                  tasks={tasksByColumn[status.id] ?? []}
                  projects={projects}
                  onEditRequest={onEditTask}
                />
              ))}
            </div>
          </SortableContext>

          <DragOverlay dropAnimation={null}>
            {activeColumn ? (
              <ColumnGhost
                status={activeColumn}
                taskCount={(tasksByColumn[activeColumn.id] ?? []).length}
              />
            ) : activeTask ? (
              <KanbanCard
                task={activeTask}
                projects={projects}
                onEditRequest={onEditTask}
                isOverlay
              />
            ) : null}
          </DragOverlay>
        </DndContext>
      )}
    </div>
  );
}
