import { useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2, Plus, CheckCircle } from 'lucide-react';
import clsx from 'clsx';
import { KanbanStatus } from '../../shared/types/task';
import { useKanbanStatuses } from './hooks/useKanbanStatuses';
import styles from './KanbanStatusManager.module.css';

interface SortableRowProps {
  status: KanbanStatus;
  onRename: (id: string, label: string) => void;
  onDelete: (id: string) => void;
  onSetFinal: (id: string) => void;
  deleteError: string | null;
  canDelete: boolean;
}

function SortableRow({ status, onRename, onDelete, onSetFinal, deleteError, canDelete }: SortableRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: status.id });

  const [editing, setEditing] = useState(false);
  const [label, setLabel] = useState(status.label);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleBlur = () => {
    setEditing(false);
    if (label.trim() && label.trim() !== status.label) {
      onRename(status.id, label.trim());
    } else {
      setLabel(status.label);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') (e.target as HTMLElement).blur();
    if (e.key === 'Escape') {
      setLabel(status.label);
      setEditing(false);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={clsx(styles.row, isDragging && styles.rowDragging)}
    >
      <span className={styles.dragHandle} {...listeners} {...attributes}>
        <GripVertical size={16} />
      </span>

      {editing ? (
        <input
          className={styles.labelInput}
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          autoFocus
          maxLength={50}
        />
      ) : (
        <span className={styles.labelText} onClick={() => setEditing(true)} title="Click to rename">
          {status.label}
        </span>
      )}

      <div className={styles.rowActions}>
        <button
          className={clsx(styles.finalBtn, status.isFinal && styles.finalBtnActive)}
          onClick={() => onSetFinal(status.id)}
          title={status.isFinal ? 'This is the completion column' : 'Set as completion column'}
        >
          <CheckCircle size={15} />
        </button>

        <button
          className={styles.deleteBtn}
          onClick={() => onDelete(status.id)}
          disabled={!canDelete || status.isFinal}
          title={
            status.isFinal
              ? 'Cannot delete the completion column'
              : !canDelete
              ? deleteError || 'Cannot delete'
              : 'Delete column'
          }
        >
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  );
}

export function KanbanStatusManager() {
  const { statuses, loading, addStatus, updateStatus, deleteStatus, reorderStatuses, setFinalStatus } =
    useKanbanStatuses();
  const [deleteErrors, setDeleteErrors] = useState<Record<string, string>>({});
  const [addingNew, setAddingNew] = useState(false);
  const [newLabel, setNewLabel] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = statuses.findIndex((s) => s.id === active.id);
    const newIndex = statuses.findIndex((s) => s.id === over.id);
    const reordered = arrayMove(statuses, oldIndex, newIndex);
    await reorderStatuses(reordered.map((s) => s.id));
  };

  const handleRename = async (id: string, label: string) => {
    await updateStatus(id, { label });
  };

  const handleDelete = async (id: string) => {
    setDeleteErrors((prev) => ({ ...prev, [id]: '' }));
    try {
      await deleteStatus(id);
    } catch (err: any) {
      setDeleteErrors((prev) => ({ ...prev, [id]: err.message }));
    }
  };

  const handleAddNew = async () => {
    const trimmed = newLabel.trim();
    if (!trimmed) return;
    await addStatus(trimmed);
    setNewLabel('');
    setAddingNew(false);
  };

  const handleNewKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleAddNew();
    if (e.key === 'Escape') {
      setNewLabel('');
      setAddingNew(false);
    }
  };

  if (loading) return <p className={styles.loadingText}>Loading columns…</p>;

  return (
    <div className={styles.manager}>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={statuses.map((s) => s.id)} strategy={verticalListSortingStrategy}>
          <div className={styles.list}>
            {statuses.map((status) => (
              <SortableRow
                key={status.id}
                status={status}
                onRename={handleRename}
                onDelete={handleDelete}
                onSetFinal={setFinalStatus}
                deleteError={deleteErrors[status.id] || null}
                canDelete={!deleteErrors[status.id]}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {Object.values(deleteErrors).some(Boolean) && (
        <p className={styles.errorText}>{Object.values(deleteErrors).find(Boolean)}</p>
      )}

      {addingNew ? (
        <div className={styles.addRow}>
          <input
            className={styles.labelInput}
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            onKeyDown={handleNewKeyDown}
            placeholder="Column name…"
            autoFocus
            maxLength={50}
          />
          <button className={styles.saveBtn} onClick={handleAddNew}>Add</button>
          <button className={styles.cancelBtn} onClick={() => { setNewLabel(''); setAddingNew(false); }}>
            Cancel
          </button>
        </div>
      ) : (
        <button className={styles.addBtn} onClick={() => setAddingNew(true)}>
          <Plus size={15} />
          Add column
        </button>
      )}
    </div>
  );
}
