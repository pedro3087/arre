import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { Inbox, Sun, Calendar, Layers, Archive, PlusCircle, FolderPlus, CheckSquare, Sparkles, Settings as SettingsIcon, LayoutDashboard, PanelLeftClose, ChevronRight, ChevronDown } from 'lucide-react';
import clsx from 'clsx';
import styles from './Sidebar.module.css';
import { SeedButton } from '../dev/SeedButton';
import { Project, PROJECT_COLORS } from '../shared/types/task';
import { DraggableProjectList } from '../features/projects/DraggableProjectList';

function getProjectHex(color: string) {
  return PROJECT_COLORS.find(c => c.name === color)?.hex || 'var(--text-secondary)';
}

const NAV_ITEMS = [
  { path: '/inbox', label: 'Inbox', icon: Inbox, color: 'text-secondary' },
  { path: '/', label: 'Today', icon: Sun, color: 'accent-emerald' },
  { path: '/upcoming', label: 'Upcoming', icon: Calendar, color: 'accent-sapphire' },
  { path: '/anytime', label: 'Anytime', icon: Layers, color: 'accent-ruby' },
  { path: '/someday', label: 'Someday', icon: Archive, color: 'accent-lavender' },
  { path: '/logbook', label: 'Logbook', icon: CheckSquare, color: 'text-secondary' },
  { path: '/kanban', label: 'Kanban', icon: LayoutDashboard, color: 'accent-sapphire' },
  { path: '/briefing', label: 'AI Briefing', icon: Sparkles, color: 'accent-lavender' },
];

interface SidebarProps {
  onNewTask?: () => void;
  projects?: Project[];
  closedProjects?: Project[];
  onNewProject?: () => void;
  onEditProject?: (project: Project) => void;
  activeProjectId?: string | null;
  setActiveProjectId?: (id: string | null) => void;
  onReorderProjects?: (orderedIds: string[]) => void;
  collapsed?: boolean;
  onToggleSidebar?: () => void;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function Sidebar({ onNewTask, projects = [], closedProjects = [], onNewProject, onEditProject, activeProjectId, setActiveProjectId, onReorderProjects, collapsed, onToggleSidebar, mobileOpen, onMobileClose }: SidebarProps) {
  const location = useLocation();
  const [closedExpanded, setClosedExpanded] = useState(false);

  return (
    <aside className={clsx(styles.sidebar, collapsed && styles.collapsed, mobileOpen && styles.mobileOpen)}>
      <div className={styles.header}>
        <div className={styles.headerRow}>
          <div className={styles.logo}>Arre</div>
          {onToggleSidebar && (
            <button
              className={styles.collapseBtn}
              onClick={onToggleSidebar}
              aria-label="Collapse sidebar"
            >
              <PanelLeftClose size={18} />
            </button>
          )}
        </div>
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
                    if (item.path === '/inbox') setActiveProjectId?.(null);
                    onMobileClose?.();
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
        <DraggableProjectList
          projects={projects}
          activeProjectId={activeProjectId ?? null}
          onSelectProject={(id) => { setActiveProjectId?.(id); onMobileClose?.(); }}
          onEditProject={(project) => onEditProject?.(project)}
          onReorder={(orderedIds) => onReorderProjects?.(orderedIds)}
        />

        {closedProjects.length > 0 && (
          <div className={styles.closedSection}>
            <button
              className={styles.closedSectionToggle}
              onClick={() => setClosedExpanded(prev => !prev)}
            >
              {closedExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
              <span>Closed</span>
              <span className={styles.closedCount}>{closedProjects.length}</span>
            </button>
            {closedExpanded && (
              <ul className={styles.closedList}>
                {closedProjects.map(project => {
                  const isActive = location.pathname === `/project/${project.id}/closed`;
                  return (
                    <li key={project.id}>
                      <Link
                        to={`/project/${project.id}/closed`}
                        className={clsx(styles.closedItem, isActive && styles.closedItemActive)}
                        onClick={() => { setActiveProjectId?.(null); onMobileClose?.(); }}
                      >
                        <span
                          className={styles.closedDot}
                          style={{ backgroundColor: getProjectHex(project.color), opacity: 0.5 }}
                        />
                        <span className={styles.closedName}>{project.title}</span>
                        <Archive size={11} className={styles.closedIcon} />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        )}
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
