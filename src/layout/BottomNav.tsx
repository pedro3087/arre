import { Link, useLocation } from 'react-router-dom';
import clsx from 'clsx';
import styles from './BottomNav.module.css';
import { NAV_ITEMS } from './Sidebar';
import { useNavVisibility } from '../features/navigation/NavVisibilityProvider';

export function BottomNav() {
  const location = useLocation();
  const { isVisible } = useNavVisibility();

  return (
    <nav className={styles.bottomNav}>
      {NAV_ITEMS.filter(item => isVisible(item.path)).map((item) => {
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
