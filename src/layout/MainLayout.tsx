import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';
import styles from './MainLayout.module.css';

import { useState } from 'react';
import { useTasks } from '../features/tasks/hooks/useTasks';
import { useProjects } from '../features/projects/hooks/useProjects';
import { TaskEditorModal } from '../features/tasks/TaskEditorModal';
import { ProjectModal } from '../features/projects/ProjectModal';
import { Plus } from 'lucide-react';
import { Task, Project, ProjectColor } from '../shared/types/task';

export type MainLayoutContext = {
  openNewTaskModal: () => void;
  openEditTaskModal: (task: Task) => void;
  projects: Project[];
  activeProjectId: string | null;
  setActiveProjectId: (id: string | null) => void;
};

export function MainLayout() {
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState<Project | null>(null);
  
  const { addTask, updateTask } = useTasks(null);
  const { projects, addProject, updateProject, deleteProject } = useProjects();

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

  return (
    <div className={styles.layout}>
      <aside className={styles.sidebarWrapper}>
        <Sidebar
          onNewTask={openNewTaskModal}
          projects={projects}
          onNewProject={handleOpenNewProject}
          onEditProject={handleEditProject}
          activeProjectId={activeProjectId}
          setActiveProjectId={setActiveProjectId}
        />
      </aside>
      
      <main className={styles.mainContent}>
        <div className={styles.container}>
          <Outlet context={{ openNewTaskModal, openEditTaskModal, projects, activeProjectId, setActiveProjectId } satisfies MainLayoutContext} />
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
        initialData={projectToEdit}
      />
    </div>
  );
}
