import { Reorder } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Task } from '../../shared/types/task';
import { TaskItem } from './TaskItem';

interface ReorderableTaskListProps {
  tasks: Task[];
  onToggle: (id: string) => void;
  onReorderTasks: (tasks: Task[]) => void;
  className?: string;
}

export function ReorderableTaskList({ 
  tasks: initialTasks, 
  onToggle, 
  onReorderTasks, 
  className 
}: ReorderableTaskListProps) {
  // Exclude Google Tasks from drag-and-drop to prevent UI jumpiness
  const draggableTasks = initialTasks.filter(t => !t.isGoogleTask);
  const staticTasks = initialTasks.filter(t => t.isGoogleTask);

  const [tasks, setTasks] = useState(draggableTasks);
  const [isDragging, setIsDragging] = useState(false);

  // Keep local state in sync with parent when items are added/removed,
  // but pause syncing while the user is actively dragging.
  useEffect(() => {
    if (!isDragging) {
      const currentIds = tasks.map(t => t.id).join(',');
      const newIds = draggableTasks.map(t => t.id).join(',');
      if (currentIds !== newIds) {
        setTasks(draggableTasks);
      }
    }
  }, [initialTasks, isDragging, tasks]);

  const handleReorder = (newTasks: Task[]) => {
    // Update local state immediately for smooth animation
    setTasks(newTasks);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    // Determine if order really changed before saving
    const isDifferent = tasks.some((task, idx) => task.id !== draggableTasks[idx]?.id);
    if (isDifferent) {
      onReorderTasks(tasks);
    }
  };

  return (
    <div className={className}>
      <Reorder.Group 
        axis="y" 
        values={tasks} 
        onReorder={handleReorder} 
        as="div"
      >
        {tasks.map(task => (
          <Reorder.Item 
            key={task.id} 
            value={task}
            onDragStart={() => setIsDragging(true)}
            onDragEnd={handleDragEnd}
            as="div"
          >
            <TaskItem task={task} onToggle={onToggle} />
          </Reorder.Item>
        ))}
      </Reorder.Group>

      {/* Render Google Tasks below draggable ones */}
      {staticTasks.map(task => (
        <div key={task.id}>
          <TaskItem task={task} onToggle={onToggle} />
        </div>
      ))}
    </div>
  );
}
