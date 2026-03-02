import { motion } from 'framer-motion';
import { VelocityChart } from './VelocityChart';
import { useDashboardStats } from './useDashboardStats';
import styles from './DashboardStats.module.css';

export function DashboardStats() {
  const { 
    velocityData, 
    efficiencyTrend, 
    highFocusToday, 
    focusTrend, 
    tasksDoneToday, 
    dailyGoal, 
    loading 
  } = useDashboardStats();

  const formatTrend = (val: number) => {
    if (val > 0) return `+${val}%`;
    if (val < 0) return `${val}%`;
    return '0%';
  };

  const getTrendClass = (val: number) => {
    return val >= 0 ? styles.upTrend : styles.downTrend;
  };

  const focusGoal = 3; // e.g. 3 high focus tasks a day
  const focusPercent = Math.min(100, Math.max(0, Math.round((highFocusToday / focusGoal) * 100)));
  const focusDashOffset = 250 - (250 * focusPercent / 100);

  // For tasks done bars, we'll use the trailing 5 days from velocity data
  const last5Days = velocityData.slice(-5);
  const maxVelocity = Math.max(...last5Days.map(d => d.completion), 1); // Avoid division by 0

  return (
    <div className={styles.statsContainer}>
      <motion.div className={styles.card} whileHover={{ y: -5 }}>
        <div className={styles.cardHeader}>
          <h3>Productivity Velocity</h3>
          <span className={styles.badge}>Week</span>
        </div>
        <div className={styles.chartWrapper}>
          <div className={styles.floatingBadge}>{formatTrend(efficiencyTrend)} Efficiency</div>
          {!loading && <VelocityChart data={velocityData} />}
        </div>
      </motion.div>

      <motion.div className={`${styles.card} ${styles.focusCard}`} whileHover={{ y: -5 }}>
        <div className={styles.cardHeader}>
          <h3>Daily Focus</h3>
        </div>
        <div className={styles.focusContent}>
          <div className={styles.focusTime}>{highFocusToday} {highFocusToday === 1 ? 'Task' : 'Tasks'}</div>
          <div className={styles.trend}>
            <span className={getTrendClass(focusTrend)}>{formatTrend(focusTrend)}</span> vs yesterday
          </div>
          <div className={styles.ringWrapper}>
             <svg width="60" height="60" viewBox="0 0 100 100">
               <circle cx="50" cy="50" r="40" fill="none" stroke="var(--border-subtle)" strokeWidth="8"/>
               <motion.circle 
                 cx="50" cy="50" r="40" 
                 fill="none" 
                 stroke="var(--accent-purple-neon)" 
                 strokeWidth="8" 
                 strokeDasharray="250" 
                 strokeDashoffset={focusDashOffset} 
                 transform="rotate(-90 50 50)"
                 initial={{ strokeDashoffset: 250 }}
                 animate={{ strokeDashoffset: focusDashOffset }}
                 transition={{ duration: 1, ease: "easeOut" }}
               />
             </svg>
          </div>
        </div>
      </motion.div>

      <motion.div className={styles.card} whileHover={{ y: -5 }}>
        <div className={styles.cardHeader}>
          <h3>Tasks Done</h3>
        </div>
        <div className={styles.tasksContent}>
          <div className={styles.tasksCount}>{tasksDoneToday}<span className={styles.total}>/{dailyGoal}</span></div>
          <div className={styles.barChart}>
            {last5Days.map((d, i) => {
               const isToday = i === last5Days.length - 1;
               const heightPct = Math.max(10, Math.round((d.completion / maxVelocity) * 100));
               return (
                 <motion.div 
                   key={d.dateStr}
                   className={styles.bar} 
                   style={{
                     height: `${heightPct}%`, 
                     backgroundColor: isToday ? 'var(--accent-cyan)' : 'var(--border-strong)'
                   }}
                   initial={{ height: 0 }}
                   animate={{ height: `${heightPct}%` }}
                   transition={{ duration: 0.5, delay: i * 0.1 }}
                   title={`${d.day}: ${d.completion} tasks`}
                 />
               );
            })}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
