import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Upload, FileText, FileSpreadsheet, Plus, ArrowRight, FolderOpen } from 'lucide-react';
import clsx from 'clsx';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../../lib/firebase';
import styles from './TaskEditorModal.module.css';
import { Task, Project, PROJECT_COLORS } from '../../shared/types/task';

interface TaskEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: any) => void;
  initialData?: Task | null;
  projects?: Project[];
}

export function TaskEditorModal({ isOpen, onClose, onSave, initialData, projects = [] }: TaskEditorModalProps) {
  const [activeTab, setActiveTab] = useState<'manual' | 'ai'>('ai');
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [energy, setEnergy] = useState<'low' | 'neutral' | 'high'>('neutral');
  const [date, setDate] = useState('');
  const [isSomeday, setIsSomeday] = useState(false);
  const [projectId, setProjectId] = useState<string | undefined>(undefined);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setTitle(initialData.title);
        setNotes(initialData.notes || '');
        setEnergy(initialData.energy || 'neutral');
        setDate(initialData.date || '');
        setIsSomeday(initialData.status === 'someday');
        setProjectId(initialData.projectId || undefined);
        setActiveTab('manual');
      } else {
        setTitle('');
        setNotes('');
        setEnergy('neutral'); 
        setDate('');
        setIsSomeday(false);
        setProjectId(undefined);
        setActiveTab('ai');
      }
    }
  }, [isOpen, initialData]);

  const handleManualSubmit = async (e: React.FormEvent | React.MouseEvent) => {
    e.preventDefault();
    try {
      await onSave({ 
        title, 
        notes, 
        energy, 
        status: isSomeday ? 'someday' : 'todo', 
        date: isSomeday ? null : (date || null),
        projectId: projectId || null,
        createdAt: initialData?.createdAt || new Date().toISOString() 
      });
      onClose();
    } catch (err) {
      console.error('ERROR in handleManualSubmit:', err);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsAnalyzing(true);
    setAiSuggestions([]);

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = (reader.result as string).split(',')[1];
        
        const processMagicImport = httpsCallable<
          { fileBase64: string; mimeType: string }, 
          { tasks: string[] }
        >(functions, 'processMagicImport');

        try {
          const result = await processMagicImport({
            fileBase64: base64String,
            mimeType: file.type
          });
          
          setAiSuggestions(result.data.tasks);
        } catch (err) {
          console.error("AI processing failed", err);
          setAiSuggestions(["Error processing document. Please try again."]);
        } finally {
          setIsAnalyzing(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error("File reading failed", err);
      setIsAnalyzing(false);
    }
  };

  const getProjectHex = (color: string) => {
    return PROJECT_COLORS.find(c => c.name === color)?.hex || '#86868b';
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
            initial={{ opacity: 0, scale: 0.9, y: 20, x: "-50%" }}
            animate={{ opacity: 1, scale: 1, y: "-50%", x: "-50%" }}
            exit={{ opacity: 0, scale: 0.9, y: 20, x: "-50%" }}
            transition={{ type: "spring", duration: 0.5 }}
            style={{ top: "50%", left: "50%" }}
            data-testid="new-task-modal"
          >
            <div className={styles.sidebar}>
               <div className={styles.sidebarHeader}>
                 <div className={styles.logoMark}>A</div>
                 <span className={styles.logoText}>Arre</span>
               </div>
               
               <nav className={styles.nav}>
                 <button 
                   className={clsx(styles.navItem, activeTab === 'manual' && styles.navItemActive)}
                   onClick={() => setActiveTab('manual')}
                   data-testid="tab-manual"
                 >
                   <Plus size={18} /> New Task
                 </button>
                 <button 
                   className={clsx(styles.navItem, activeTab === 'ai' && styles.navItemActiveAI)}
                   onClick={() => setActiveTab('ai')}
                   data-testid="tab-ai"
                 >
                   <Sparkles size={18} /> Magic Import
                 </button>
               </nav>

               <div className={styles.sidebarFooter}>
                 <div className={styles.engineStatus}>
                   <div className={styles.statusDot} />
                   <span>Engine v2.4 Active</span>
                 </div>
               </div>
            </div>

            <div className={styles.contentArea}>
              <button 
                className={styles.closeButton} 
                onClick={onClose}
                data-testid="btn-close-modal"
              >
                <X size={20}/>
              </button>
              
              {activeTab === 'manual' ? (
                <div className={styles.manualContainer}>
                  <h2 className={styles.sectionTitle}>
                    {initialData ? 'Edit Task' : 'Create New Task'}
                  </h2>
                  <form onSubmit={handleManualSubmit} className={styles.form}>
                    <input 
                      type="text" 
                      placeholder="What needs to be done?" 
                      className={styles.titleInput}
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      autoFocus
                      data-testid="input-title"
                    />
                    <textarea 
                      placeholder="Add details, notes, or subtasks..." 
                      className={styles.notesInput}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      data-testid="input-notes"
                    />
                    
                    <div className={styles.metaRow}>
                      <div className={styles.detailsColumn}>
                        <div className={styles.dateRow}>
                           <input 
                              type="date" 
                              className={styles.dateInput}
                              value={date}
                              onChange={(e) => {
                                setDate(e.target.value);
                                setIsSomeday(false);
                              }}
                              disabled={isSomeday}
                           />
                           <label className={styles.somedayLabel}>
                             <input 
                               type="checkbox" 
                               checked={isSomeday}
                               onChange={(e) => {
                                 setIsSomeday(e.target.checked);
                                 if (e.target.checked) setDate('');
                               }}
                             />
                             Someday
                           </label>
                        </div>

                        {/* Project Selector */}
                        <div className={styles.projectSelector}>
                          <FolderOpen size={16} style={{ color: 'var(--text-tertiary)', flexShrink: 0 }} />
                          <select
                            value={projectId || ''}
                            onChange={(e) => setProjectId(e.target.value || undefined)}
                            className={styles.projectSelect}
                            data-testid="select-project"
                          >
                            <option value="">No Project</option>
                            {projects.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.title}
                              </option>
                            ))}
                          </select>
                          {projectId && (
                            <span
                              className={styles.projectIndicator}
                              style={{
                                backgroundColor: getProjectHex(
                                  projects.find(p => p.id === projectId)?.color || 'emerald'
                                )
                              }}
                            />
                          )}
                        </div>
                        
                        <div className={styles.energySelector}>
                          <span className={styles.label}>Energy Level</span>
                          <div className={styles.pills}>
                            {(['low', 'neutral', 'high'] as const).map((e) => (
                              <button
                                key={e}
                                type="button"
                                className={clsx(styles.pill, energy === e && styles[e + 'Active'])}
                                onClick={() => setEnergy(e)}
                              >
                                {e}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      <button 
                        type="submit" 
                        onClick={handleManualSubmit}
                        className={styles.createButton}
                        data-testid="btn-create-task"
                      >
                        {initialData ? 'Save Changes' : 'Create Task'} <ArrowRight size={16} />
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                <div className={styles.aiContainer}>
                  <div className={styles.aiHeader}>
                    <h2 className={styles.gradientTitle}>Magic Import</h2>
                    <p className={styles.subtitle}>AI Powered Assistant</p>
                  </div>

                  {!isAnalyzing && aiSuggestions.length === 0 ? (
                    <div className={styles.uploadSection}>
                      <div 
                        className={styles.dropZone}
                        onClick={() => document.getElementById('magic-upload-input')?.click()}
                        data-testid="drop-zone"
                      >
                         <input 
                           type="file" 
                           id="magic-upload-input"
                           className={styles.hiddenInput}
                           style={{ display: 'none' }}
                           onChange={handleFileUpload}
                           accept=".pdf,.csv,.txt"
                         />
                         <div className={styles.uploadIconWrapper}>
                           <Upload size={32} />
                         </div>
                         <h3 className={styles.dropTitle}>Drop PDF or CSV here</h3>
                         <p className={styles.dropSubtitle}>to generate tasks automatically</p>
                         <span className={styles.fileLimit}>Maximum file size: 25MB</span>
                      </div>
                      
                      <div className={styles.recentFiles}>
                        <h4 className={styles.recentHeader}>Recent Magic Imports</h4>
                        <div className={styles.fileItem}>
                           <FileText size={16} className={styles.fileIcon} />
                           <div className={styles.fileInfo}>
                             <span className={styles.fileName}>Q4_Roadmap_Final.pdf</span>
                             <span className={styles.fileDate}>2 hours ago</span>
                           </div>
                        </div>
                        <div className={styles.fileItem}>
                           <FileSpreadsheet size={16} className={styles.fileIcon} />
                           <div className={styles.fileInfo}>
                             <span className={styles.fileName}>Inventory_List_Oct.csv</span>
                             <span className={styles.fileDate}>Yesterday</span>
                           </div>
                        </div>
                      </div>
                    </div>
                  ) : isAnalyzing ? (
                    <div className={styles.analyzingState}>
                      <div className={styles.scanner}>
                        <div className={styles.scanLine} />
                      </div>
                      <p className={styles.analyzingText}>Analyzing document structure...</p>
                    </div>
                  ) : (
                    <div className={styles.resultsState}>
                      <h3 className={styles.resultsHeader}><Sparkles size={16}/> {aiSuggestions.length} Tasks Generated</h3>
                      <div className={styles.tasksList}>
                        {aiSuggestions.map((suggestion, idx) => (
                          <div key={idx} className={styles.suggestedTask}>
                             <div className={styles.checkboxMock} />
                             <span>{suggestion}</span>
                          </div>
                        ))}
                      </div>
                      <button 
                        className={styles.importButton}
                        onClick={() => {
                          aiSuggestions.forEach(suggestion => {
                             onSave({ 
                                title: suggestion, 
                                notes: "Imported via Magic Import", 
                                energy: 'neutral', 
                                status: 'todo',
                                createdAt: new Date().toISOString()
                             });
                          });
                          onClose();
                        }}
                        data-testid="btn-import-all"
                      >
                        Import All Tasks
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
