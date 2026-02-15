import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Trash2 } from 'lucide-react';
import clsx from 'clsx';
import { Project, PROJECT_COLORS, ProjectColor } from '../../shared/types/task';
import styles from './ProjectModal.module.css';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (title: string, color: ProjectColor) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  initialData?: Project | null;
}

export function ProjectModal({ isOpen, onClose, onSave, onDelete, initialData }: ProjectModalProps) {
  const [title, setTitle] = useState('');
  const [color, setColor] = useState<ProjectColor>('emerald');

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setTitle(initialData.title);
        setColor(initialData.color);
      } else {
        setTitle('');
        setColor('emerald');
      }
    }
  }, [isOpen, initialData]);

  const handleSave = async () => {
    if (!title.trim()) return;
    await onSave(title.trim(), color);
    onClose();
  };

  const handleDelete = async () => {
    if (!initialData || !onDelete) return;
    if (confirm('Delete this project? Tasks assigned to it will become unassigned.')) {
      await onDelete(initialData.id);
      onClose();
    }
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
            onClick={onClose}
          />
          <motion.div
            className={styles.modal}
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', duration: 0.4, bounce: 0.15 }}
            data-testid="project-modal"
          >
            <div className={styles.header}>
              <span className={styles.headerTitle}>
                {initialData ? 'Edit Project' : 'New Project'}
              </span>
              <button className={styles.closeBtn} onClick={onClose}>
                <X size={18} />
              </button>
            </div>

            <div className={styles.body}>
              <div className={styles.field}>
                <label className={styles.fieldLabel}>Project Name</label>
                <input
                  type="text"
                  className={styles.titleInput}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Work, Personal, Side Project"
                  autoFocus
                  data-testid="project-title-input"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSave();
                  }}
                />
              </div>

              <div className={styles.field}>
                <label className={styles.fieldLabel}>Color</label>
                <div className={styles.colorGrid}>
                  {PROJECT_COLORS.map((c) => (
                    <button
                      key={c.name}
                      className={clsx(
                        styles.colorSwatch,
                        color === c.name && styles.colorSwatchSelected
                      )}
                      onClick={() => setColor(c.name)}
                      title={c.label}
                      data-testid={`color-${c.name}`}
                    >
                      <div
                        className={styles.colorSwatchInner}
                        style={{ backgroundColor: c.hex }}
                      />
                      {color === c.name && (
                        <Check size={16} className={styles.checkIcon} />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className={styles.footer}>
              {initialData && onDelete && (
                <button className={styles.deleteBtn} onClick={handleDelete} data-testid="btn-delete-project">
                  <Trash2 size={14} /> Delete
                </button>
              )}
              <div className={styles.spacer} />
              <button className={styles.cancelBtn} onClick={onClose}>
                Cancel
              </button>
              <button
                className={styles.saveBtn}
                onClick={handleSave}
                disabled={!title.trim()}
                data-testid="btn-save-project"
              >
                {initialData ? 'Save' : 'Create'}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
