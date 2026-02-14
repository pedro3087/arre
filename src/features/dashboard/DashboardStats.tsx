import { motion } from 'framer-motion';
import { VelocityChart } from './VelocityChart';
import styles from './DashboardStats.module.css';

export function DashboardStats() {
  return (
    <div className={styles.statsContainer}>
      <motion.div className={styles.card} whileHover={{ y: -5 }}>
        <div className={styles.cardHeader}>
          <h3>Productivity Velocity</h3>
          <span className={styles.badge}>Week</span>
        </div>
        <div className={styles.chartWrapper}>
          <div className={styles.floatingBadge}>+24% Efficiency</div>
          <VelocityChart />
        </div>
      </motion.div>

      <motion.div className={`${styles.card} ${styles.focusCard}`} whileHover={{ y: -5 }}>
        <div className={styles.cardHeader}>
          <h3>Daily Focus</h3>
        </div>
        <div className={styles.focusContent}>
          <div className={styles.focusTime}>4h 12m</div>
          <div className={styles.trend}>
            <span className={styles.upTrend}>+12%</span> vs yesterday
          </div>
          <div className={styles.ringWrapper}>
             <svg width="60" height="60" viewBox="0 0 100 100">
               <circle cx="50" cy="50" r="40" fill="none" stroke="var(--border-subtle)" strokeWidth="8"/>
               <circle cx="50" cy="50" r="40" fill="none" stroke="var(--accent-purple-neon)" strokeWidth="8" strokeDasharray="250" strokeDashoffset="60" transform="rotate(-90 50 50)"/>
             </svg>
          </div>
        </div>
      </motion.div>

      <motion.div className={styles.card} whileHover={{ y: -5 }}>
        <div className={styles.cardHeader}>
          <h3>Tasks Done</h3>
        </div>
        <div className={styles.tasksContent}>
          <div className={styles.tasksCount}>8<span className={styles.total}>/12</span></div>
          <div className={styles.barChart}>
            {/* Simple visual bars */}
            <div className={styles.bar} style={{height: '40%'}}></div>
            <div className={styles.bar} style={{height: '60%'}}></div>
            <div className={styles.bar} style={{height: '30%'}}></div>
            <div className={styles.bar} style={{height: '80%', backgroundColor: 'var(--accent-cyan)'}}></div>
            <div className={styles.bar} style={{height: '50%'}}></div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
