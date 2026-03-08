import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';

import { TaskItem } from '../features/tasks/TaskItem';
import { DashboardStats } from '../features/dashboard/DashboardStats';
import { EnergyFilter } from '../features/dashboard/EnergyFilter';
import { Search, Bell, Plus, Filter } from 'lucide-react';
import styles from './Dashboard.module.css';
import inboxStyles from './Inbox.module.css';

import { useTasks } from '../features/tasks/hooks/useTasks';
import { MainLayoutContext } from '../layout/MainLayout';

export function Inbox() {
  const [energyFilter, setEnergyFilter] = useState<'all' | 'low' | 'neutral' | 'high'>('high');
  const {  openNewTaskModal , activeProjectId } = useOutletContext<MainLayoutContext>();
  const { tasks, loading, error, updateTask } = useTasks('inbox', activeProjectId);

  const filteredTasks = tasks.filter(t => 
    (energyFilter === 'all' || t.energy === energyFilter)
  );

  const handleToggle = (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (task) {
      updateTask(id, { status: task.status === 'completed' ? 'todo' : 'completed' });
    }
  };

  const todayStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  // if (loading) return <div className={styles.loading}>Loading tasks...</div>; // Render structure instead
  if (error) return <div className={styles.error}>Error: {error}</div>;

  return (
    <div className={styles.container} style={{ maxWidth: '1000px' }}>
      <header className={inboxStyles.headerRow}>
        <div className={inboxStyles.titleGroup}>
          <h1 className={styles.title}>Work Area</h1>
          <span className={styles.date}>{todayStr}</span>
        </div>
        
        <div className={inboxStyles.actions}>
          <div className={inboxStyles.searchWrapper}>
            <Search size={16} className={inboxStyles.searchIcon} />
            <input type="text" placeholder="Search tasks..." className={inboxStyles.searchInput} />
          </div>
          <button className={inboxStyles.iconButton}><Bell size={20} /></button>
          <button 
            className={inboxStyles.newTaskButton}
            onClick={openNewTaskModal}
            data-testid="btn-new-task-main"
          >
            <Plus size={16} /> New Task
          </button>
        </div>
      </header>

      {/* Top Stats Section */}
      <DashboardStats />

      {/* Energy Filter */}
      <EnergyFilter selected={energyFilter} onSelect={setEnergyFilter} />

      {/* Task List Section */}
      <div className={styles.taskList}>
        <div className={inboxStyles.listHeader}>
          <h2 className={inboxStyles.sectionTitle}>
             {energyFilter === 'high' ? 'Deep Work' : 'Tasks'}
             {energyFilter === 'high' && <span className={inboxStyles.focusBadge}>HIGH FOCUS</span>}
          </h2>
          <button className={inboxStyles.iconButton}><Filter size={16} /></button>
        </div>

        {loading ? (
          <div className={styles.loadingState}>
             <div className="skeleton-line" style={{ height: '40px', marginBottom: '8px', background: 'var(--bg-elevated)', borderRadius: '8px' }}></div>
             <div className="skeleton-line" style={{ height: '40px', marginBottom: '8px', background: 'var(--bg-elevated)', borderRadius: '8px' }}></div>
             <div className="skeleton-line" style={{ height: '40px', marginBottom: '8px', background: 'var(--bg-elevated)', borderRadius: '8px' }}></div>
          </div>
        ) : (
          <>
            {filteredTasks.map(task => (
               <TaskItem key={task.id} task={task} onToggle={handleToggle} />
            ))}
            {filteredTasks.length === 0 && <p className={styles.emptyState}>No tasks match this filter.</p>}
          </>
        )}
      </div>
    </div>
  );
}
