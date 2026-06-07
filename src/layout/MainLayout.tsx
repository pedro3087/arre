import { Outlet, useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';
import styles from './MainLayout.module.css';
import { useGoogleCalendarImport } from '../features/integrations/useGoogleCalendarImport';

import { useState } from 'react';
import { useTasks } from '../features/tasks/hooks/useTasks';
import { useProjects } from '../features/projects/hooks/useProjects';
import { TaskEditorModal } from '../features/tasks/TaskEditorModal';
import { ProjectModal } from '../features/projects/ProjectModal';
import { ProjectClosureModal } from '../features/projects/ProjectClosureModal';
import { Plus, X, PanelLeftOpen, Menu } from 'lucide-react';
import clsx from 'clsx';
import { Task, Project, ProjectColor } from '../shared/types/task';

export type MainLayoutContext = {
  openNewTaskModal: () => void;
  openEditTaskModal: (task: Task) => void;
  projects: Project[];
  closedProjects: Project[];
  activeProjectId: string | null;
  setActiveProjectId: (id: string | null) => void;
};

export function MainLayout() {
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(
    () => localStorage.getItem('sidebar-collapsed') === 'true'
  );
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState<Project | null>(null);
  const [isClosureModalOpen, setIsClosureModalOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const { addTask, updateTask } = useTasks(null);
  const { projects, closedProjects, addProject, updateProject, deleteProject, reorderProjects, closeProject } = useProjects();
  const { importError: calendarImportError } = useGoogleCalendarImport();
  const [calendarBannerDismissed, setCalendarBannerDismissed] = useState(false);

  const toggleSidebar = () => {
    setSidebarCollapsed(prev => {
      const next = !prev;
      localStorage.setItem('sidebar-collapsed', String(next));
      return next;
    });
  };

  const openNewTaskModal = () => {
    setTaskToEdit(null);
    setIsModalOpen(true);
  };

  const openEditTaskModal = (task: Task) => {
    setTaskToEdit(task);
    setIsModalOpen(true);
  };

  const handleSaveTask = async (taskData: any) => {
    try {
      if (taskToEdit) {
        await updateTask(taskToEdit.id, taskData);
      } else {
        await addTask(taskData);
      }
      setIsModalOpen(false);
    } catch (e) {
      console.error("Failed to save task", e);
    }
  };

  const handleOpenNewProject = () => {
    setProjectToEdit(null);
    setIsProjectModalOpen(true);
  };

  const handleEditProject = (project: Project) => {
    setProjectToEdit(project);
    setIsProjectModalOpen(true);
  };

  const handleSaveProject = async (title: string, color: ProjectColor) => {
    if (projectToEdit) {
      await updateProject(projectToEdit.id, { title, color });
    } else {
      await addProject(title, color);
    }
  };

  const handleDeleteProject = async (id: string) => {
    await deleteProject(id);
  };

  const handleInitiateClose = () => {
    setIsProjectModalOpen(false);
    setIsClosureModalOpen(true);
  };

  const handleConfirmClosure = async (reassignments: Record<string, string | null>) => {
    if (!projectToEdit) return;
    const closingId = projectToEdit.id;
    await closeProject(closingId, reassignments);
    if (activeProjectId === closingId) setActiveProjectId(null);
    setIsClosureModalOpen(false);
    setProjectToEdit(null);
    navigate(`/project/${closingId}/closed`);
  };

  const handleCancelClosure = () => {
    setIsClosureModalOpen(false);
  };

  return (
    <div className={styles.layout}>
      <aside className={styles.sidebarWrapper}>
        <Sidebar
          onNewTask={openNewTaskModal}
          projects={projects}
          closedProjects={closedProjects}
          onNewProject={handleOpenNewProject}
          onEditProject={handleEditProject}
          activeProjectId={activeProjectId}
          setActiveProjectId={setActiveProjectId}
          onReorderProjects={reorderProjects}
          collapsed={sidebarCollapsed}
          onToggleSidebar={toggleSidebar}
          mobileOpen={mobileSidebarOpen}
          onMobileClose={() => setMobileSidebarOpen(false)}
        />
      </aside>
      
      {sidebarCollapsed && (
        <button
          className={styles.expandButton}
          onClick={toggleSidebar}
          aria-label="Expand sidebar"
        >
          <PanelLeftOpen size={18} />
        </button>
      )}

      <button
        className={styles.mobileMenuBtn}
        onClick={() => setMobileSidebarOpen(true)}
        aria-label="Open menu"
      >
        <Menu size={20} />
      </button>

      {mobileSidebarOpen && (
        <div
          className={styles.mobileOverlay}
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      <main className={clsx(styles.mainContent, sidebarCollapsed && styles.mainContentExpanded)}>
        {calendarImportError && !calendarBannerDismissed && (
          <div className={styles.calendarErrorBanner}>
            <span>Calendar import failed: {calendarImportError}</span>
            <button
              className={styles.calendarErrorDismiss}
              onClick={() => setCalendarBannerDismissed(true)}
              aria-label="Dismiss"
            >
              <X size={14} />
            </button>
          </div>
        )}
        <div className={styles.container}>
          <Outlet context={{ openNewTaskModal, openEditTaskModal, projects, closedProjects, activeProjectId, setActiveProjectId } satisfies MainLayoutContext} />
        </div>
      </main>

      <button 
        className={styles.fab} 
        onClick={openNewTaskModal}
        aria-label="New Task"
        data-testid="btn-new-task-fab"
      >
        <Plus size={24} />
      </button>
      <BottomNav />
      
      <TaskEditorModal 
        key={isModalOpen ? (taskToEdit?.id || 'new') : 'closed'}
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleSaveTask}
        initialData={taskToEdit}
        projects={projects}
      />

      <ProjectModal
        key={isProjectModalOpen ? (projectToEdit?.id || 'new-project') : 'project-closed'}
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        onSave={handleSaveProject}
        onDelete={handleDeleteProject}
        onCloseProject={handleInitiateClose}
        initialData={projectToEdit}
      />

      {projectToEdit && (
        <ProjectClosureModal
          isOpen={isClosureModalOpen}
          project={projectToEdit}
          activeProjects={projects}
          onConfirm={handleConfirmClosure}
          onCancel={handleCancelClosure}
        />
      )}
    </div>
  );
}
