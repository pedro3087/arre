import { useState } from 'react';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { LayoutDashboard } from 'lucide-react';
import clsx from 'clsx';
import { Task, Project, PROJECT_COLORS } from '../../shared/types/task';
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

export function KanbanBoard({ projects, onEditTask }: KanbanBoardProps) {
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    projects.length > 0 ? projects[0].id : null
  );
  const { statuses, tasksByColumn, loading, moveTask } = useKanbanBoard(selectedProjectId);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  const allTasks = Object.values(tasksByColumn).flat();
  const activeTask = activeTaskId ? allTasks.find((t) => t.id === activeTaskId) ?? null : null;

  const handleDragStart = (event: DragStartEvent) => {
    setActiveTaskId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTaskId(null);

    if (!over) return;
    const taskId = active.id as string;
    const toStatusId = over.id as string;

    // Find source column — no-op if same column
    const sourceColumnId = statuses.find((s) =>
      tasksByColumn[s.id]?.some((t) => t.id === taskId)
    )?.id;

    if (sourceColumnId === toStatusId) return;
    moveTask(taskId, toStatusId);
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
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
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

          <DragOverlay dropAnimation={null}>
            {activeTask ? (
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
