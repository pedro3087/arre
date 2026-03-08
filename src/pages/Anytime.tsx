import { useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useTasks } from '../features/tasks/hooks/useTasks';

import { ReorderableTaskList } from '../features/tasks/ReorderableTaskList';
import { MainLayoutContext } from '../layout/MainLayout';
import { PROJECT_COLORS, Project } from '../shared/types/task';
import { Layers } from 'lucide-react';
import styles from './ProjectView.module.css';

export function Anytime() {
  const { projects, activeProjectId } = useOutletContext<MainLayoutContext>();
  const { tasks, loading, error, updateTask, reorderTasks } = useTasks('anytime', activeProjectId);

  const handleToggle = (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (task) {
      updateTask(id, { status: task.status === 'completed' ? 'todo' : 'completed' });
    }
  };

  const getProjectHex = (color: string) =>
    PROJECT_COLORS.find(c => c.name === color)?.hex || '#86868b';

  // Group tasks by project
  const { grouped, unassigned } = useMemo(() => {
    const projectMap = new Map<string, typeof tasks>();
    const noProject: typeof tasks = [];

    tasks.forEach(task => {
      if (task.projectId) {
        const existing = projectMap.get(task.projectId) || [];
        existing.push(task);
        projectMap.set(task.projectId, existing);
      } else {
        noProject.push(task);
      }
    });

    // Build grouped array with project info
    const grouped = projects
      .filter((p: Project) => projectMap.has(p.id))
      .map((p: Project) => ({
        project: p,
        tasks: projectMap.get(p.id) || [],
      }));

    return { grouped, unassigned: noProject };
  }, [tasks, projects]);

  if (loading) return <div className={styles.loading}>Loading tasks...</div>;
  if (error) return <div className={styles.error}>Error: {error}</div>;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.titleGroup}>
          <h1 className={styles.title}>Anytime</h1>
          <span className={styles.subtitle}>
            {tasks.length} task{tasks.length !== 1 ? 's' : ''} across {grouped.length} project{grouped.length !== 1 ? 's' : ''}
            {activeProjectId && <span data-testid="active-filter-indicator"> • Filtered</span>}
          </span>
        </div>
      </header>

      {/* Project Groups */}
      {grouped.map(({ project, tasks: projectTasks }) => (
        <div key={project.id} className={styles.projectGroup}>
          <div className={styles.projectGroupHeader}>
            <span
              className={styles.projectDot}
              style={{ backgroundColor: getProjectHex(project.color) }}
            />
            <h2 className={styles.projectGroupTitle}>{project.title}</h2>
            <span className={styles.projectTaskCount}>
              {projectTasks.length} task{projectTasks.length !== 1 ? 's' : ''}
            </span>
          </div>
          <ReorderableTaskList 
            tasks={projectTasks} 
            onToggle={handleToggle} 
            onReorderTasks={reorderTasks} 
            className={styles.taskList} 
          />
        </div>
      ))}

      {/* Unassigned Tasks */}
      {unassigned.length > 0 && (
        <div className={styles.unassignedGroup}>
          <div className={styles.unassignedHeader}>
            <Layers size={16} style={{ color: 'var(--text-tertiary)' }} />
            <h2 className={styles.unassignedTitle}>Single Actions</h2>
            <span className={styles.projectTaskCount}>
              {unassigned.length} task{unassigned.length !== 1 ? 's' : ''}
            </span>
          </div>
          <ReorderableTaskList 
            tasks={unassigned} 
            onToggle={handleToggle} 
            onReorderTasks={reorderTasks} 
            className={styles.taskList} 
          />
        </div>
      )}

      {tasks.length === 0 && <p className={styles.emptyState}>No tasks in Anytime.</p>}
    </div>
  );
}
