import { Link, useLocation } from 'react-router-dom';
import { Inbox, Sun, Calendar, Layers, Archive, Moon, Laptop, PlusCircle } from 'lucide-react';
import clsx from 'clsx';
import { useTheme } from '../features/theme/ThemeProvider';
import styles from './Sidebar.module.css';
import { SeedButton } from '../dev/SeedButton';

const NAV_ITEMS = [
  { path: '/inbox', label: 'Inbox', icon: Inbox, color: 'text-secondary' },
  { path: '/', label: 'Today', icon: Sun, color: 'accent-emerald' },
  { path: '/upcoming', label: 'Upcoming', icon: Calendar, color: 'accent-sapphire' },
  { path: '/anytime', label: 'Anytime', icon: Layers, color: 'accent-ruby' },
  { path: '/someday', label: 'Someday', icon: Archive, color: 'accent-lavender' },
];

interface SidebarProps {
  onNewTask?: () => void;
}

export function Sidebar({ onNewTask }: SidebarProps) {
  const location = useLocation();
  const { theme, setTheme } = useTheme();

  const cycleTheme = () => {
    if (theme === 'light') setTheme('dark');
    else if (theme === 'dark') setTheme('system');
    else setTheme('light');
  };

  const ThemeIcon = theme === 'light' ? Sun : theme === 'dark' ? Moon : Laptop;
  const themeLabel = theme === 'light' ? 'Light' : theme === 'dark' ? 'Dark' : 'System';

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
        <button className={styles.settingsButton} onClick={cycleTheme} title="Toggle Theme">
          <ThemeIcon size={20} />
          <span>{themeLabel} Mode</span>
        </button>
        
        {import.meta.env.DEV && <SeedButton />}
      </div>

      {/* Styled JSX for quick styling of new elements */}
      <style>{`
        .${styles.actionGroup} {
          padding: 0 16px;
          margin-bottom: auto; /* Push footer down but keep this close to nav if possible, or use flex-grow spacer */
        }
        .${styles.newTaskButton} {
          display: flex;
          align-items: center;
          gap: 12px;
          width: 100%;
          padding: 10px 12px;
          margin-top: 1rem;
          background: var(--text-primary);
          color: var(--bg-app);
          border: none;
          border-radius: 8px;
          font-weight: 500;
          cursor: pointer;
          transition: opacity 0.2s;
        }
        .${styles.newTaskButton}:hover {
          opacity: 0.9;
        }
        /* Make nav not grow so action group is below it */
        .${styles.nav} {
          flex-grow: 0; 
        }
        .${styles.sidebar} {
          display: flex;
          flex-direction: column;
        }
        /* Push footer to bottom */
        .${styles.footer} {
          margin-top: auto;
        }
      `}</style>
    </aside>
  );
}
