import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, doc, getDoc, updateDoc, serverTimestamp, deleteField } from 'firebase/firestore';
import { Archive, RotateCcw, CheckCircle2, XCircle, Circle } from 'lucide-react';
import { db } from '../lib/firebase';
import { useAuth } from '../lib/auth/AuthContext';
import { Project, Task, PROJECT_COLORS } from '../shared/types/task';
import styles from './ClosedProjectView.module.css';

function getProjectHex(color: string) {
  return PROJECT_COLORS.find(c => c.name === color)?.hex || '#86868b';
}

function convertTask(docSnap: any): Task {
  const data = docSnap.data();
  return {
    id: docSnap.id,
    title: data.title,
    status: data.status,
    createdAt: data.createdAt?.toDate().toISOString() || new Date().toISOString(),
    updatedAt: data.updatedAt?.toDate().toISOString(),
    completedAt: data.completedAt,
    projectId: data.projectId,
    notes: data.notes,
    date: data.date,
    energy: data.energy,
    tags: data.tags,
    priority: data.priority,
  };
}

export function ClosedProjectView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [reopening, setReopening] = useState(false);

  useEffect(() => {
    if (!user || !id) return;
    const fetchData = async () => {
      try {
        const projectRef = doc(db, 'users', user.uid, 'projects', id);
        const projectSnap = await getDoc(projectRef);
        if (!projectSnap.exists()) {
          navigate('/', { replace: true });
          return;
        }
        const data = projectSnap.data();
        setProject({
          id: projectSnap.id,
          title: data.title,
          color: data.color || 'emerald',
          order: data.order ?? 0,
          createdAt: data.createdAt?.toDate().toISOString() || new Date().toISOString(),
          status: data.status,
          closedAt: data.closedAt,
        });

        const tasksRef = collection(db, 'users', user.uid, 'tasks');
        const q = query(tasksRef, where('projectId', '==', id));
        const tasksSnap = await getDocs(q);
        setTasks(tasksSnap.docs.map(convertTask));
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user, id, navigate]);

  const stats = useMemo(() => {
    const completed = tasks.filter(t => t.status === 'completed');
    const canceled = tasks.filter(t => t.status === 'canceled');
    const open = tasks.filter(t => t.status === 'todo' || t.status === 'someday');
    const total = tasks.length;
    const completionRate = total > 0 ? Math.round((completed.length / total) * 100) : 0;

    const withTimes = completed.filter(t => t.completedAt && t.createdAt);
    const avgDays = withTimes.length > 0
      ? Math.round(
          withTimes.reduce((sum, t) => {
            const days = (new Date(t.completedAt!).getTime() - new Date(t.createdAt).getTime()) / (1000 * 60 * 60 * 24);
            return sum + days;
          }, 0) / withTimes.length
        )
      : null;

    const createdAt = project?.createdAt ? new Date(project.createdAt) : null;
    const closedAt = project?.closedAt ? new Date(project.closedAt) : null;
    const duration = createdAt && closedAt
      ? Math.ceil((closedAt.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24))
      : null;

    return { completed, canceled, open, total, completionRate, avgDays, duration };
  }, [tasks, project]);

  const handleReopen = async () => {
    if (!id || !user) return;
    setReopening(true);
    try {
      const projectRef = doc(db, 'users', user.uid, 'projects', id);
      await updateDoc(projectRef, {
        status: 'active',
        closedAt: deleteField(),
        updatedAt: serverTimestamp(),
      });
      navigate('/', { replace: true });
    } catch (e) {
      console.error('Error reopening project', e);
      setReopening(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <p className={styles.loadingText}>Loading…</p>
      </div>
    );
  }

  if (!project) return null;

  const closedDateLabel = project.closedAt
    ? new Date(project.closedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
    : null;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.titleRow}>
          <span className={styles.projectDot} style={{ backgroundColor: getProjectHex(project.color) }} />
          <h1 className={styles.title}>{project.title}</h1>
          <span className={styles.closedBadge}>
            <Archive size={11} />
            Closed
          </span>
        </div>
        {closedDateLabel && (
          <p className={styles.subtitle}>Closed on {closedDateLabel}</p>
        )}
        <button className={styles.reopenBtn} onClick={handleReopen} disabled={reopening}>
          <RotateCcw size={14} />
          {reopening ? 'Reopening…' : 'Reopen Project'}
        </button>
      </header>

      <div className={styles.statsGrid}>
        {stats.duration !== null && (
          <div className={styles.statCard}>
            <span className={styles.statValue}>{stats.duration}</span>
            <span className={styles.statLabel}>Days open</span>
          </div>
        )}
        <div className={styles.statCard}>
          <span className={styles.statValue}>{stats.total}</span>
          <span className={styles.statLabel}>Total tasks</span>
        </div>
        <div className={`${styles.statCard} ${styles.statCardGreen}`}>
          <span className={styles.statValue}>{stats.completionRate}%</span>
          <span className={styles.statLabel}>Completion rate</span>
        </div>
        {stats.avgDays !== null && (
          <div className={styles.statCard}>
            <span className={styles.statValue}>{stats.avgDays}</span>
            <span className={styles.statLabel}>Avg days/task</span>
          </div>
        )}
      </div>

      {stats.completed.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <CheckCircle2 size={15} className={styles.iconCompleted} />
            Completed ({stats.completed.length})
          </h2>
          <ul className={styles.taskList}>
            {stats.completed.map(task => (
              <li key={task.id} className={styles.taskItem}>
                <span className={styles.taskName}>{task.title}</span>
                {task.completedAt && (
                  <span className={styles.taskMeta}>
                    {new Date(task.completedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {stats.canceled.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <XCircle size={15} className={styles.iconCanceled} />
            Canceled ({stats.canceled.length})
          </h2>
          <ul className={styles.taskList}>
            {stats.canceled.map(task => (
              <li key={task.id} className={`${styles.taskItem} ${styles.taskCanceled}`}>
                <span className={styles.taskName}>{task.title}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {stats.open.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <Circle size={15} className={styles.iconOpen} />
            Still open ({stats.open.length})
          </h2>
          <ul className={styles.taskList}>
            {stats.open.map(task => (
              <li key={task.id} className={`${styles.taskItem} ${styles.taskOpen}`}>
                <span className={styles.taskName}>{task.title}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {stats.total === 0 && (
        <div className={styles.emptyState}>
          <Archive size={40} className={styles.emptyIcon} />
          <p>No tasks were recorded for this project.</p>
        </div>
      )}
    </div>
  );
}
