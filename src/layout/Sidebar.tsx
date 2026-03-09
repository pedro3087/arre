import { Link, useLocation } from 'react-router-dom';
import { Inbox, Sun, Calendar, Layers, Archive, PlusCircle, FolderPlus, MoreHorizontal, CheckSquare, Sparkles, Settings as SettingsIcon } from 'lucide-react';
import clsx from 'clsx';
import styles from './Sidebar.module.css';
import { SeedButton } from '../dev/SeedButton';
import { Project, PROJECT_COLORS } from '../shared/types/task';

const NAV_ITEMS = [
  { path: '/inbox', label: 'Inbox', icon: Inbox, color: 'text-secondary' },
  { path: '/', label: 'Today', icon: Sun, color: 'accent-emerald' },
  { path: '/upcoming', label: 'Upcoming', icon: Calendar, color: 'accent-sapphire' },
  { path: '/anytime', label: 'Anytime', icon: Layers, color: 'accent-ruby' },
  { path: '/someday', label: 'Someday', icon: Archive, color: 'accent-lavender' },
  { path: '/logbook', label: 'Logbook', icon: CheckSquare, color: 'text-secondary' },
  { path: '/briefing', label: 'AI Briefing', icon: Sparkles, color: 'accent-lavender' },
];

interface SidebarProps {
  onNewTask?: () => void;
  projects?: Project[];
  onNewProject?: () => void;
  onEditProject?: (project: Project) => void;
  activeProjectId?: string | null;
  setActiveProjectId?: (id: string | null) => void;
}

export function Sidebar({ onNewTask, projects = [], onNewProject, onEditProject, activeProjectId, setActiveProjectId }: SidebarProps) {
  const location = useLocation();

  const getProjectHex = (color: string) => {
    return PROJECT_COLORS.find(c => c.name === color)?.hex || '#86868b';
  };

  return (
    <aside className={styles.sidebar}>
      <div className={styles.header}>
        <div className={styles.logo}>Arre</div>
      </div>
      
      <nav className={styles.nav}>
        <ul>
          {NAV_ITEMS.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            
            return (
              <li key={item.path}>
                <Link 
                  to={item.path} 
                  className={clsx(styles.navItem, isActive && styles.active)}
                  data-testid={`nav-item-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                  onClick={() => {
                    if (item.path === '/inbox') {
                      setActiveProjectId?.(null);
                    }
                  }}
                >
                  <span className={clsx(styles.iconWrapper, isActive && styles[item.color])}>
                    <Icon size={20} />
                  </span>
                  <span className={styles.label}>{item.label}</span>
                  {isActive && <div className={styles.activeIndicator} />}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Projects Section */}
      <div className={styles.projectsSection}>
        <div className={styles.projectsHeader}>
          <span className={styles.projectsTitle}>Projects</span>
          <button
            className={styles.addProjectBtn}
            onClick={onNewProject}
            title="New Project"
            data-testid="btn-new-project"
          >
            <FolderPlus size={16} />
          </button>
        </div>
        <ul className={styles.projectsList}>
          {projects.map((project) => (
            <li 
              key={project.id} 
              className={clsx(styles.projectItem, activeProjectId === project.id && styles.activeProject)}
              data-testid={`project-item-${project.id}`}
              onClick={() => setActiveProjectId?.(activeProjectId === project.id ? null : project.id)}
            >
              <span
                className={styles.projectDot}
                style={{ backgroundColor: getProjectHex(project.color) }}
              />
              <span className={styles.projectName}>{project.title}</span>
              <button
                className={styles.projectEditBtn}
                onClick={(e) => {
                  e.stopPropagation();
                  onEditProject?.(project);
                }}
                title="Edit Project"
              >
                <MoreHorizontal size={14} />
              </button>
            </li>
          ))}
          {projects.length === 0 && (
            <li className={styles.projectsEmpty}>No projects yet</li>
          )}
        </ul>
      </div>

      <div className={styles.actionGroup}>
        <button 
          className={styles.newTaskButton} 
          onClick={onNewTask}
          data-testid="btn-new-task-sidebar"
        >
          <PlusCircle size={20} />
          <span>New Task</span>
        </button>
      </div>

      <div className={styles.footer}>
        <Link to="/settings" className={styles.footerLink}>
          <SettingsIcon size={20} />
          <span>Settings</span>
        </Link>

        {import.meta.env.DEV && <SeedButton />}
      </div>
    </aside>
  );
}
