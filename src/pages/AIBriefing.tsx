import { useState } from 'react';
import { Sparkles, Loader2, RefreshCw } from 'lucide-react';
import { getFunctions, httpsCallable } from 'firebase/functions';
import ReactMarkdown from 'react-markdown';
import { useBriefingData } from '../features/ai-briefing/hooks/useBriefingData';
import styles from './AIBriefing.module.css';

export function AIBriefing() {
  const { tasks, projects, loading: dataLoading, error: dataError } = useBriefingData();
  const [briefing, setBriefing] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);

  const generateBriefing = async () => {
    if (tasks.length === 0 && projects.length === 0) {
       setGenError('You have no active projects or tasks to brief on.');
       return;
    }
    
    setGenerating(true);
    setGenError(null);

    try {
      const functions = getFunctions();
      const generateBriefingCall = httpsCallable(functions, 'generateBriefing');
      
      const response = await generateBriefingCall({
        tasks,
        projects,
        localTime: new Date().toISOString()
      });

      const { briefing: newBriefing } = (response.data as any);
      setBriefing(newBriefing);
    } catch (err: any) {
      console.error("AI Briefing Error:", err);
      setGenError("Failed to generate briefing. " + (err.message || "Please try again later."));
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.titleGroup}>
          <Sparkles className={styles.titleIcon} size={28} />
          <h1 className={styles.title}>Your AI Briefing</h1>
        </div>
        <p className={styles.subtitle}>Get a personalized overview of your day, summarized by AI.</p>
      </header>

      {(dataLoading) && (
        <div className={styles.loadingContainer}>
          <Loader2 className={styles.spinner} size={24} />
          <span>Syncing your tasks...</span>
        </div>
      )}

      {dataError && (
        <div className={styles.errorContainer}>
          <p>Failed to load tasks: {dataError}</p>
        </div>
      )}

      {!dataLoading && !dataError && (
        <div className={styles.content}>
          <div className={styles.actionSection}>
            <button 
              className={styles.generateButton} 
              onClick={generateBriefing}
              disabled={generating}
            >
              {generating ? (
                <>
                  <Loader2 className={styles.spinner} size={18} />
                  <span>Generating Briefing...</span>
                </>
              ) : (
                <>
                  {briefing ? <RefreshCw size={18} /> : <Sparkles size={18} />}
                  <span>{briefing ? "Regenerate Briefing" : "Generate Briefing"}</span>
                </>
              )}
            </button>
            {genError && <p className={styles.errorMessage}>{genError}</p>}
          </div>

          {briefing && (
            <div className={styles.briefingCard}>
              <div className={styles.markdownContent}>
                <ReactMarkdown>{briefing}</ReactMarkdown>
              </div>
            </div>
          )}
          
          {!briefing && !generating && !genError && (
            <div className={styles.emptyState}>
              <div className={styles.emptyIconWrapper}>
                <Sparkles size={48} />
              </div>
              <h3>Ready when you are</h3>
              <p>Click "Generate Briefing" to get your personalized summary of what's on your plate for today, tomorrow, and beyond.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
