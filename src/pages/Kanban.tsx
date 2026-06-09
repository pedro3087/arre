import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { LayoutDashboard, FolderPlus, Settings2 } from 'lucide-react';
import { MainLayoutContext } from '../layout/MainLayout';
import { KanbanBoard } from '../features/kanban/KanbanBoard';
import styles from './Kanban.module.css';

export function Kanban() {
  const { projects, openEditTaskModal, onNewProject, onEditProject, reorderProjects } =
    useOutletContext<MainLayoutContext>();

  // Selection is lifted here so the header buttons know the "current" project.
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    projects.length > 0 ? projects[0].id : null
  );

  // Keep the selection valid as the project list changes (deleted/closed/added).
  useEffect(() => {
    if (projects.length === 0) {
      if (selectedProjectId !== null) setSelectedProjectId(null);
      return;
    }
    if (!projects.some((p) => p.id === selectedProjectId)) {
      setSelectedProjectId(projects[0].id);
    }
  }, [projects, selectedProjectId]);

  const selectedProject = projects.find((p) => p.id === selectedProjectId) ?? null;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerRow}>
          <div className={styles.titleWrapper}>
            <LayoutDashboard size={22} className={styles.headerIcon} />
            <h1>Kanban</h1>
          </div>
          <div className={styles.headerActions}>
            {selectedProject && (
              <button
                type="button"
                className={styles.actionBtn}
                onClick={() => onEditProject(selectedProject)}
                title={`Edit "${selectedProject.title}"`}
              >
                <Settings2 size={16} />
                <span>Edit project</span>
              </button>
            )}
            <button
              type="button"
              className={styles.actionBtnPrimary}
              onClick={onNewProject}
              title="Create a new project"
            >
              <FolderPlus size={16} />
              <span>New project</span>
            </button>
          </div>
        </div>
        <p className={styles.subtitle}>Manage your project tasks visually</p>
      </header>

      <div className={styles.boardWrapper}>
        <KanbanBoard
          projects={projects}
          onEditTask={openEditTaskModal}
          selectedProjectId={selectedProjectId}
          setSelectedProjectId={setSelectedProjectId}
          reorderProjects={reorderProjects}
        />
      </div>
    </div>
  );
}
