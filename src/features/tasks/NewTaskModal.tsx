import { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Upload, FileText, FileSpreadsheet, Plus, ArrowRight } from 'lucide-react';
import clsx from 'clsx';
import styles from './NewTaskModal.module.css';

interface NewTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: any) => void;
}

export function NewTaskModal({ isOpen, onClose, onSave }: NewTaskModalProps) {
  const [activeTab, setActiveTab] = useState<'manual' | 'ai'>('ai'); // Default to AI based on request context
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [energy, setEnergy] = useState<'low' | 'neutral' | 'high'>('neutral');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ title, notes, energy, status: 'todo', createdAt: new Date().toISOString() });
    onClose();
  };

  const simulateAiAnalysis = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      setAiSuggestions([
        "Update Q4 Roadmap based on PDF insights",
        "Email Finance team about budget discrepancy",
        "Schedule sync with Engineering Leads"
      ]);
    }, 2500);
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
                  <h2 className={styles.sectionTitle}>Create New Task</h2>
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
                      <button 
                        type="submit" 
                        className={styles.createButton}
                        data-testid="btn-create-task"
                      >
                        Create Task <ArrowRight size={16} />
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
                        onClick={simulateAiAnalysis}
                        data-testid="drop-zone"
                      >
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
                      <h3 className={styles.resultsHeader}><Sparkles size={16}/> 3 Tasks Generated</h3>
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
                          onSave({ title: "Imported Batch", notes: "From " + aiSuggestions.length + " AI suggestions", energy: 'high', status: 'todo' });
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
