import { useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useTasks } from '../features/tasks/hooks/useTasks';
import { TaskItem } from '../features/tasks/TaskItem';
import { MainLayoutContext } from '../layout/MainLayout';
import { PROJECT_COLORS, Project } from '../shared/types/task';
import { Archive } from 'lucide-react';
import styles from './ProjectView.module.css';

export function Someday() {
  const { tasks, loading, error, updateTask } = useTasks('someday');
  const { projects } = useOutletContext<MainLayoutContext>();

  // For someday tasks, toggling usually means "Activate" => Move to Todo/Inbox
  const handleActivate = (id: string) => {
    updateTask(id, { status: 'todo' });
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
          <h1 className={styles.title}>Someday / Maybe</h1>
          <span className={styles.subtitle}>
            {tasks.length} idea{tasks.length !== 1 ? 's' : ''} parked for later
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
          <div className={styles.taskList}>
            {projectTasks.map(task => (
              <TaskItem key={task.id} task={task} onToggle={handleActivate} />
            ))}
          </div>
        </div>
      ))}

      {/* Unassigned Tasks */}
      {unassigned.length > 0 && (
        <div className={styles.unassignedGroup}>
          <div className={styles.unassignedHeader}>
            <Archive size={16} style={{ color: 'var(--text-tertiary)' }} />
            <h2 className={styles.unassignedTitle}>Loose Ideas</h2>
            <span className={styles.projectTaskCount}>
              {unassigned.length} task{unassigned.length !== 1 ? 's' : ''}
            </span>
          </div>
          <div className={styles.taskList}>
            {unassigned.map(task => (
              <TaskItem key={task.id} task={task} onToggle={handleActivate} />
            ))}
          </div>
        </div>
      )}

      {tasks.length === 0 && <p className={styles.emptyState}>No someday tasks.</p>}
    </div>
  );
}
