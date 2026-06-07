import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Archive } from 'lucide-react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../lib/auth/AuthContext';
import { Project, Task, PROJECT_COLORS } from '../../shared/types/task';
import styles from './ProjectClosureModal.module.css';

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

interface ProjectClosureModalProps {
  isOpen: boolean;
  project: Project;
  activeProjects: Project[];
  onConfirm: (reassignments: Record<string, string | null>) => Promise<void>;
  onCancel: () => void;
}

export function ProjectClosureModal({ isOpen, project, activeProjects, onConfirm, onCancel }: ProjectClosureModalProps) {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [reassignments, setReassignments] = useState<Record<string, string | null>>({});
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    if (!isOpen || !user) return;
    setLoading(true);
    const fetchTasks = async () => {
      try {
        const tasksRef = collection(db, 'users', user.uid, 'tasks');
        const q = query(tasksRef, where('projectId', '==', project.id));
        const snap = await getDocs(q);
        const fetched = snap.docs.map(convertTask);
        setTasks(fetched);
        const initial: Record<string, string | null> = {};
        fetched
          .filter(t => t.status === 'todo' || t.status === 'someday')
          .forEach(t => { initial[t.id] = null; });
        setReassignments(initial);
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, [isOpen, user, project.id]);

  const openTasks = tasks.filter(t => t.status === 'todo' || t.status === 'someday');
  const completedCount = tasks.filter(t => t.status === 'completed').length;
  const canceledCount = tasks.filter(t => t.status === 'canceled').length;

  const handleConfirm = async () => {
    setConfirming(true);
    try {
      await onConfirm(reassignments);
    } finally {
      setConfirming(false);
    }
  };

  const moveAllToInbox = () => {
    const updated: Record<string, string | null> = {};
    openTasks.forEach(t => { updated[t.id] = null; });
    setReassignments(prev => ({ ...prev, ...updated }));
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className={styles.backdrop}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
          />
          <motion.div
            className={styles.modal}
            style={{ x: '-50%', y: '-50%' }}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', duration: 0.4, bounce: 0.15 }}
          >
            <div className={styles.header}>
              <div className={styles.headerLeft}>
                <span className={styles.projectDot} style={{ backgroundColor: getProjectHex(project.color) }} />
                <span className={styles.headerTitle}>Close "{project.title}"?</span>
              </div>
              <button className={styles.closeBtn} onClick={onCancel}>
                <X size={18} />
              </button>
            </div>

            <div className={styles.body}>
              {loading ? (
                <div className={styles.loading}>Loading tasks...</div>
              ) : (
                <>
                  <div className={styles.statsRow}>
                    <div className={styles.stat}>
                      <span className={styles.statNumber}>{tasks.length}</span>
                      <span className={styles.statLabel}>Total</span>
                    </div>
                    <div className={`${styles.stat} ${styles.statCompleted}`}>
                      <span className={styles.statNumber}>{completedCount}</span>
                      <span className={styles.statLabel}>Completed</span>
                    </div>
                    <div className={`${styles.stat} ${styles.statCanceled}`}>
                      <span className={styles.statNumber}>{canceledCount}</span>
                      <span className={styles.statLabel}>Canceled</span>
                    </div>
                    {openTasks.length > 0 && (
                      <div className={`${styles.stat} ${styles.statOpen}`}>
                        <span className={styles.statNumber}>{openTasks.length}</span>
                        <span className={styles.statLabel}>Open</span>
                      </div>
                    )}
                  </div>

                  {openTasks.length > 0 ? (
                    <div className={styles.reassignSection}>
                      <div className={styles.reassignHeader}>
                        <span className={styles.reassignTitle}>Reassign open tasks</span>
                        <button className={styles.moveAllBtn} onClick={moveAllToInbox}>
                          Move all to Inbox
                        </button>
                      </div>
                      <div className={styles.taskList}>
                        {openTasks.map(task => (
                          <div key={task.id} className={styles.taskRow}>
                            <span className={styles.taskTitle}>{task.title}</span>
                            <select
                              className={styles.projectSelect}
                              value={reassignments[task.id] ?? ''}
                              onChange={e => setReassignments(prev => ({
                                ...prev,
                                [task.id]: e.target.value || null,
                              }))}
                            >
                              <option value="">No project (Inbox)</option>
                              {activeProjects.map(p => (
                                <option key={p.id} value={p.id}>{p.title}</option>
                              ))}
                            </select>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className={styles.noOpenTasks}>
                      All tasks are completed or canceled — ready to close.
                    </p>
                  )}
                </>
              )}
            </div>

            <div className={styles.footer}>
              <button className={styles.cancelBtn} onClick={onCancel}>Cancel</button>
              <button
                className={styles.confirmBtn}
                onClick={handleConfirm}
                disabled={loading || confirming}
              >
                <Archive size={14} />
                {confirming ? 'Closing…' : 'Close Project'}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
