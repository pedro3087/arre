import { Link, useLocation } from 'react-router-dom';
import { Inbox, Sun, Calendar, Layers, Archive, Moon, Laptop } from 'lucide-react';
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

export function Sidebar() {
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

      <div className={styles.footer}>
        <button className={styles.settingsButton} onClick={cycleTheme} title="Toggle Theme">
          <ThemeIcon size={20} />
          <span>{themeLabel} Mode</span>
        </button>
        
        {import.meta.env.DEV && <SeedButton />}
      </div>
    </aside>
  );
}
