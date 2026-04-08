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
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, MoreHorizontal } from 'lucide-react';
import clsx from 'clsx';
import { Project, PROJECT_COLORS } from '../../shared/types/task';
import styles from './DraggableProjectList.module.css';

function getProjectHex(color: string) {
  return PROJECT_COLORS.find((c) => c.name === color)?.hex || '#86868b';
}

interface ProjectRowProps {
  project: Project;
  isActive: boolean;
  onSelect: () => void;
  onEdit: (e: React.MouseEvent) => void;
  isOverlay?: boolean;
}

function ProjectRow({ project, isActive, onSelect, onEdit, isOverlay }: ProjectRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: project.id,
    disabled: isOverlay,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={clsx(
        styles.projectItem,
        isActive && styles.activeProject,
        isDragging && styles.dragging
      )}
      data-testid={`project-item-${project.id}`}
    >
      <span
        className={styles.dragHandle}
        {...listeners}
        {...attributes}
        title="Drag to reorder"
      >
        <GripVertical size={14} />
      </span>
      <span
        className={styles.projectDot}
        style={{ backgroundColor: getProjectHex(project.color) }}
      />
      <span className={styles.projectName} onClick={onSelect}>
        {project.title}
      </span>
      <button
        className={styles.projectEditBtn}
        onClick={onEdit}
        title="Edit Project"
      >
        <MoreHorizontal size={14} />
      </button>
    </li>
  );
}

interface DraggableProjectListProps {
  projects: Project[];
  activeProjectId: string | null;
  onSelectProject: (id: string | null) => void;
  onEditProject: (project: Project) => void;
  onReorder: (orderedIds: string[]) => void;
}

export function DraggableProjectList({
  projects,
  activeProjectId,
  onSelectProject,
  onEditProject,
  onReorder,
}: DraggableProjectListProps) {
  const [draggingId, setDraggingId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setDraggingId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setDraggingId(null);
    if (!over || active.id === over.id) return;

    const oldIndex = projects.findIndex((p) => p.id === active.id);
    const newIndex = projects.findIndex((p) => p.id === over.id);
    const reordered = arrayMove(projects, oldIndex, newIndex);
    onReorder(reordered.map((p) => p.id));
  };

  const draggingProject = draggingId ? projects.find((p) => p.id === draggingId) : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={projects.map((p) => p.id)} strategy={verticalListSortingStrategy}>
        <ul className={styles.projectsList}>
          {projects.map((project) => (
            <ProjectRow
              key={project.id}
              project={project}
              isActive={activeProjectId === project.id}
              onSelect={() =>
                onSelectProject(activeProjectId === project.id ? null : project.id)
              }
              onEdit={(e) => {
                e.stopPropagation();
                onEditProject(project);
              }}
            />
          ))}
          {projects.length === 0 && (
            <li className={styles.projectsEmpty}>No projects yet</li>
          )}
        </ul>
      </SortableContext>

      <DragOverlay dropAnimation={null}>
        {draggingProject ? (
          <ProjectRow
            project={draggingProject}
            isActive={activeProjectId === draggingProject.id}
            onSelect={() => {}}
            onEdit={() => {}}
            isOverlay
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
