import { Link, useLocation } from 'react-router-dom';
import { Inbox, Sun, Calendar, Layers, Archive, CheckSquare } from 'lucide-react';
import clsx from 'clsx';
import styles from './BottomNav.module.css';

const NAV_ITEMS = [
  { path: '/inbox', label: 'Inbox', icon: Inbox, color: 'text-secondary' },
  { path: '/', label: 'Today', icon: Sun, color: 'accent-emerald' },
  { path: '/upcoming', label: 'Upcoming', icon: Calendar, color: 'accent-sapphire' },
  { path: '/anytime', label: 'Anytime', icon: Layers, color: 'accent-ruby' },
  { path: '/someday', label: 'Someday', icon: Archive, color: 'accent-lavender' },
  { path: '/logbook', label: 'Logbook', icon: CheckSquare, color: 'text-secondary' },
];

export function BottomNav() {
  const location = useLocation();

  return (
    <nav className={styles.bottomNav}>
      {NAV_ITEMS.map((item) => {
        const isActive = location.pathname === item.path;
        const Icon = item.icon;
        
        return (
          <Link 
            key={item.path}
            to={item.path} 
            className={clsx(styles.navItem, isActive && styles.active)}
            aria-label={item.label}
          >
            <span className={clsx(styles.iconWrapper, isActive && styles[item.color])}>
              <Icon size={24} />
            </span>
            {isActive && <div className={styles.indicator} />}
          </Link>
        );
      })}
    </nav>
  );
}
